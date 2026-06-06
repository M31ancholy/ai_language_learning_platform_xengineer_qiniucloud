package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"

	"ai_language_learning_platform_xengineer_qiniucloud/internal/config"

	"github.com/gorilla/websocket"
)

const (
	doubaoRealtimeURL      = "wss://openspeech.bytedance.com/api/v3/realtime/dialogue"
	doubaoDialogResourceID = "volc.speech.dialog"
	doubaoDialogAppKey     = "PlgvMymc7f3tQnJ6"
)

type ConversationMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type DoubaoRealtimeEvent struct {
	Type    string
	Text    string
	Audio   []byte
	History []ConversationMessage
	Event   int32
	Err     error
}

type DoubaoRealtimeSession struct {
	conn      *websocket.Conn
	sessionID string
	dialogID  string
	writeMu   sync.Mutex
	stateMu   sync.Mutex
	history   []ConversationMessage
	userDraft string
	aiDraft   string
	closed    bool
}

type doubaoStartSessionPayload struct {
	ASR    doubaoRealtimeASRPayload    `json:"asr"`
	TTS    doubaoRealtimeTTSPayload    `json:"tts"`
	Dialog doubaoRealtimeDialogPayload `json:"dialog"`
}

type doubaoRealtimeASRPayload struct {
	Extra map[string]any `json:"extra"`
}

type doubaoRealtimeTTSPayload struct {
	Speaker     string                    `json:"speaker"`
	AudioConfig doubaoRealtimeAudioConfig `json:"audio_config"`
}

type doubaoRealtimeAudioConfig struct {
	Channel    int    `json:"channel"`
	Format     string `json:"format"`
	SampleRate int    `json:"sample_rate"`
}

type doubaoRealtimeDialogPayload struct {
	BotName       string         `json:"bot_name"`
	SystemRole    string         `json:"system_role"`
	SpeakingStyle string         `json:"speaking_style"`
	Extra         map[string]any `json:"extra"`
}

func OpenDoubaoRealtimeSession(ctx context.Context, cfg config.Config, sessionID string) (*DoubaoRealtimeSession, error) {
	apiKey := strings.TrimSpace(cfg.DoubaoApiKey)
	accessKey := strings.TrimSpace(cfg.DoubaoAK)
	if apiKey == "" && (cfg.DoubaoAppId == "" || accessKey == "") {
		return nil, errors.New("doubao realtime API key or legacy app_id/access key is not configured")
	}

	headers := http.Header{}
	headers.Set("X-Api-Resource-Id", doubaoDialogResourceID)
	headers.Set("X-Api-App-Key", doubaoDialogAppKey)
	headers.Set("X-Api-Connect-Id", newDoubaoRequestID())
	if apiKey != "" {
		headers.Set("X-Api-Key", apiKey)
	} else {
		headers.Set("X-Api-Access-Key", accessKey)
		headers.Set("X-Api-App-ID", cfg.DoubaoAppId)
	}

	conn, resp, err := websocket.DefaultDialer.DialContext(ctx, doubaoRealtimeURL, headers)
	if err != nil {
		logID := ""
		status := 0
		responseBody := ""
		if resp != nil {
			logID = resp.Header.Get("X-Tt-Logid")
			status = resp.StatusCode
			body, _ := io.ReadAll(io.LimitReader(resp.Body, 4096))
			responseBody = strings.TrimSpace(string(body))
			resp.Body.Close()
		}
		return nil, fmt.Errorf(
			"dial doubao realtime websocket failed (status=%d logID=%s body=%s): %w",
			status,
			logID,
			responseBody,
			err,
		)
	}

	session := &DoubaoRealtimeSession{
		conn:      conn,
		sessionID: sessionID,
		history:   make([]ConversationMessage, 0, 8),
	}
	if err := session.startConnection(); err != nil {
		conn.Close()
		return nil, err
	}
	if err := session.startSession(); err != nil {
		conn.Close()
		return nil, err
	}
	return session, nil
}

func (s *DoubaoRealtimeSession) startConnection() error {
	if err := s.writeProtocolMessage(doubaoRealtimeMessage{
		Type:    doubaoFullClient,
		Flag:    doubaoFlagWithEvent,
		Event:   1,
		Payload: []byte("{}"),
	}, doubaoSerializationJSON); err != nil {
		return fmt.Errorf("send StartConnection: %w", err)
	}
	msg, err := s.readProtocolMessage()
	if err != nil {
		return fmt.Errorf("read ConnectionStarted: %w", err)
	}
	if msg.Type != doubaoFullServer || msg.Event != 50 {
		return fmt.Errorf("unexpected ConnectionStarted response: type=%x event=%d payload=%s", msg.Type, msg.Event, msg.Payload)
	}
	return nil
}

func (s *DoubaoRealtimeSession) startSession() error {
	payload, err := json.Marshal(doubaoStartSessionPayload{
		ASR: doubaoRealtimeASRPayload{Extra: map[string]any{
			"end_smooth_window_ms": 800,
		}},
		TTS: doubaoRealtimeTTSPayload{
			Speaker: "zh_female_vv_jupiter_bigtts",
			AudioConfig: doubaoRealtimeAudioConfig{
				Channel:    1,
				Format:     "pcm_s16le",
				SampleRate: 24000,
			},
		},
		Dialog: doubaoRealtimeDialogPayload{
			BotName:       "豆包",
			SystemRole:    "你是英语口语学习游戏中的对话伙伴。用自然、简洁的英语回答，每次不超过两句话。",
			SpeakingStyle: "语速适中，语调自然，表达清晰。",
			Extra: map[string]any{
				"strict_audit": false,
				"recv_timeout": 120,
				"input_mod":    "audio",
			},
		},
	})
	if err != nil {
		return fmt.Errorf("marshal StartSession payload: %w", err)
	}
	if err := s.writeProtocolMessage(doubaoRealtimeMessage{
		Type:      doubaoFullClient,
		Flag:      doubaoFlagWithEvent,
		Event:     100,
		SessionID: s.sessionID,
		Payload:   payload,
	}, doubaoSerializationJSON); err != nil {
		return fmt.Errorf("send StartSession: %w", err)
	}
	msg, err := s.readProtocolMessage()
	if err != nil {
		return fmt.Errorf("read SessionStarted: %w", err)
	}
	if msg.Type != doubaoFullServer || msg.Event != 150 {
		return fmt.Errorf("unexpected SessionStarted response: type=%x event=%d payload=%s", msg.Type, msg.Event, msg.Payload)
	}
	var response struct {
		DialogID string `json:"dialog_id"`
	}
	if err := json.Unmarshal(msg.Payload, &response); err == nil {
		s.dialogID = response.DialogID
	}
	return nil
}

func (s *DoubaoRealtimeSession) SendAudio(audio []byte) error {
	if len(audio) == 0 {
		return nil
	}
	return s.writeProtocolMessage(doubaoRealtimeMessage{
		Type:      doubaoAudioClient,
		Flag:      doubaoFlagWithEvent,
		Event:     200,
		SessionID: s.sessionID,
		Payload:   audio,
	}, doubaoSerializationRaw)
}

func (s *DoubaoRealtimeSession) EndTurn() error {
	// The realtime dialogue API uses server-side VAD. A short silence tail lets it
	// finalize the current utterance immediately after the browser stops capture.
	silence := make([]byte, 320)
	for i := 0; i < 100; i++ {
		if err := s.SendAudio(silence); err != nil {
			return err
		}
		time.Sleep(10 * time.Millisecond)
	}
	return nil
}

func (s *DoubaoRealtimeSession) ReadEvent() (DoubaoRealtimeEvent, error) {
	msg, err := s.readProtocolMessage()
	if err != nil {
		return DoubaoRealtimeEvent{}, err
	}
	if msg.Type == doubaoErrorServer {
		return DoubaoRealtimeEvent{}, fmt.Errorf("doubao realtime error %d: %s", msg.ErrorCode, msg.Payload)
	}
	if msg.Type == doubaoAudioServer {
		return DoubaoRealtimeEvent{Type: "audio", Audio: msg.Payload, Event: msg.Event}, nil
	}
	if msg.Type != doubaoFullServer && msg.Type != doubaoFrontEndServer {
		return DoubaoRealtimeEvent{Type: "ignored", Event: msg.Event}, nil
	}

	text := extractDoubaoEventText(msg.Payload)
	switch msg.Event {
	case 450:
		return DoubaoRealtimeEvent{Type: "user_started", Event: msg.Event}, nil
	case 451:
		if text != "" {
			s.stateMu.Lock()
			s.userDraft = text
			s.stateMu.Unlock()
		}
		return DoubaoRealtimeEvent{Type: "user_partial", Text: text, Event: msg.Event}, nil
	case 459:
		finalText := s.commitUser(text)
		return DoubaoRealtimeEvent{Type: "user_final", Text: finalText, Event: msg.Event}, nil
	case 350:
		return DoubaoRealtimeEvent{Type: "assistant_started", Event: msg.Event}, nil
	case 550:
		if text != "" {
			s.stateMu.Lock()
			s.aiDraft += text
			s.stateMu.Unlock()
		}
		return DoubaoRealtimeEvent{Type: "assistant_partial", Text: text, Event: msg.Event}, nil
	case 559:
		return DoubaoRealtimeEvent{Type: "assistant_text_complete", Event: msg.Event}, nil
	case 359:
		finalText, history := s.commitAssistant(text)
		return DoubaoRealtimeEvent{
			Type:    "turn_complete",
			Text:    finalText,
			History: history,
			Event:   msg.Event,
		}, nil
	case 152, 153:
		return DoubaoRealtimeEvent{Type: "session_finished", Event: msg.Event}, nil
	default:
		return DoubaoRealtimeEvent{Type: "protocol", Text: text, Event: msg.Event}, nil
	}
}

func (s *DoubaoRealtimeSession) Close() error {
	s.stateMu.Lock()
	if s.closed {
		s.stateMu.Unlock()
		return nil
	}
	s.closed = true
	s.stateMu.Unlock()

	_ = s.writeProtocolMessage(doubaoRealtimeMessage{
		Type:      doubaoFullClient,
		Flag:      doubaoFlagWithEvent,
		Event:     102,
		SessionID: s.sessionID,
		Payload:   []byte("{}"),
	}, doubaoSerializationJSON)
	_ = s.writeProtocolMessage(doubaoRealtimeMessage{
		Type:    doubaoFullClient,
		Flag:    doubaoFlagWithEvent,
		Event:   2,
		Payload: []byte("{}"),
	}, doubaoSerializationJSON)
	return s.conn.Close()
}

func (s *DoubaoRealtimeSession) writeProtocolMessage(msg doubaoRealtimeMessage, serialization uint8) error {
	frame, err := marshalDoubaoRealtimeMessage(msg, serialization)
	if err != nil {
		return err
	}
	s.writeMu.Lock()
	defer s.writeMu.Unlock()
	return s.conn.WriteMessage(websocket.BinaryMessage, frame)
}

func (s *DoubaoRealtimeSession) readProtocolMessage() (doubaoRealtimeMessage, error) {
	_ = s.conn.SetReadDeadline(time.Now().Add(2 * time.Minute))
	messageType, frame, err := s.conn.ReadMessage()
	if err != nil {
		return doubaoRealtimeMessage{}, err
	}
	if messageType != websocket.BinaryMessage && messageType != websocket.TextMessage {
		return doubaoRealtimeMessage{}, fmt.Errorf("unexpected websocket message type %d", messageType)
	}
	return unmarshalDoubaoRealtimeMessage(frame)
}

func (s *DoubaoRealtimeSession) commitUser(text string) string {
	s.stateMu.Lock()
	defer s.stateMu.Unlock()
	if text == "" {
		text = s.userDraft
	}
	text = strings.TrimSpace(text)
	if text != "" {
		s.history = append(s.history, ConversationMessage{Role: "user", Content: text})
	}
	s.userDraft = ""
	return text
}

func (s *DoubaoRealtimeSession) commitAssistant(text string) (string, []ConversationMessage) {
	s.stateMu.Lock()
	defer s.stateMu.Unlock()
	if text != "" {
		s.aiDraft += text
	}
	finalText := strings.TrimSpace(s.aiDraft)
	if finalText != "" {
		s.history = append(s.history, ConversationMessage{Role: "assistant", Content: finalText})
	}
	s.aiDraft = ""
	history := append([]ConversationMessage(nil), s.history...)
	return finalText, history
}

func extractDoubaoEventText(payload []byte) string {
	var value any
	if err := json.Unmarshal(payload, &value); err != nil {
		return ""
	}
	return findDoubaoText(value)
}

func findDoubaoText(value any) string {
	switch typed := value.(type) {
	case map[string]any:
		for _, key := range []string{"text", "content", "result", "utterance", "transcript"} {
			if text, ok := typed[key].(string); ok && strings.TrimSpace(text) != "" {
				return text
			}
		}
		for _, child := range typed {
			if text := findDoubaoText(child); text != "" {
				return text
			}
		}
	case []any:
		for _, child := range typed {
			if text := findDoubaoText(child); text != "" {
				return text
			}
		}
	}
	return ""
}
