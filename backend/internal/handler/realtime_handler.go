package handler

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"sync"
	"sync/atomic"

	"ai_language_learning_platform_xengineer_qiniucloud/internal/config"
	"ai_language_learning_platform_xengineer_qiniucloud/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type realtimeClientCommand struct {
	Type string `json:"type"`
}

type realtimeBrowserWriter struct {
	conn *websocket.Conn
	mu   sync.Mutex
}

func (w *realtimeBrowserWriter) json(value any) error {
	w.mu.Lock()
	defer w.mu.Unlock()
	return w.conn.WriteJSON(value)
}

func (w *realtimeBrowserWriter) audio(data []byte) error {
	w.mu.Lock()
	defer w.mu.Unlock()
	return w.conn.WriteMessage(websocket.BinaryMessage, data)
}

// RealtimeChatHandler bridges browser PCM audio and Doubao's end-to-end
// realtime dialogue WebSocket. Conversation history exists only for this
// browser connection and contains final user/assistant text messages.
func RealtimeChatHandler(cfg config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		browserConn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Printf("[RealtimeWS] Browser upgrade failed: %v", err)
			return
		}
		defer browserConn.Close()

		ctx, cancel := context.WithCancel(c.Request.Context())
		defer cancel()

		sessionID := newRealtimeSessionID()
		doubaoSession, err := service.OpenDoubaoRealtimeSession(ctx, cfg, sessionID)
		if err != nil {
			log.Printf("[RealtimeWS] Open Doubao session failed: %v", err)
			_ = browserConn.WriteJSON(gin.H{"type": "error", "message": err.Error()})
			return
		}
		defer doubaoSession.Close()

		writer := &realtimeBrowserWriter{conn: browserConn}
		if err := writer.json(gin.H{
			"type":             "session_ready",
			"sessionId":        sessionID,
			"inputSampleRate":  16000,
			"outputSampleRate": 24000,
			"audioFormat":      "pcm_s16le",
		}); err != nil {
			return
		}

		var busy atomic.Bool
		upstreamDone := make(chan error, 1)
		go func() {
			upstreamDone <- forwardDoubaoRealtimeEvents(ctx, writer, doubaoSession, &busy)
		}()

		recording := false
		for {
			select {
			case upstreamErr := <-upstreamDone:
				if upstreamErr != nil && !errors.Is(upstreamErr, context.Canceled) {
					log.Printf("[RealtimeWS] Doubao stream ended: %v", upstreamErr)
					_ = writer.json(gin.H{"type": "error", "message": upstreamErr.Error()})
				}
				return
			default:
			}

			messageType, payload, err := browserConn.ReadMessage()
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseNormalClosure) {
					log.Printf("[RealtimeWS] Browser read failed: %v", err)
				}
				return
			}

			switch messageType {
			case websocket.BinaryMessage:
				if !recording || busy.Load() {
					continue
				}
				if err := doubaoSession.SendAudio(payload); err != nil {
					_ = writer.json(gin.H{"type": "error", "message": err.Error()})
					return
				}
			case websocket.TextMessage:
				var command realtimeClientCommand
				if err := json.Unmarshal(payload, &command); err != nil {
					_ = writer.json(gin.H{"type": "error", "message": "invalid control message"})
					continue
				}
				switch command.Type {
				case "start_session":
					_ = writer.json(gin.H{"type": "session_ready", "sessionId": sessionID})
				case "start_turn":
					if busy.Load() {
						_ = writer.json(gin.H{"type": "error", "message": "assistant response is still in progress"})
						continue
					}
					recording = true
					_ = writer.json(gin.H{"type": "turn_started"})
				case "end_turn":
					if !recording {
						continue
					}
					recording = false
					busy.Store(true)
					_ = writer.json(gin.H{"type": "turn_processing"})
					if err := doubaoSession.EndTurn(); err != nil {
						_ = writer.json(gin.H{"type": "error", "message": err.Error()})
						return
					}
				case "close_session":
					return
				}
			}
		}
	}
}

func forwardDoubaoRealtimeEvents(
	ctx context.Context,
	writer *realtimeBrowserWriter,
	session *service.DoubaoRealtimeSession,
	busy *atomic.Bool,
) error {
	var latestUserText string
	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}

		event, err := session.ReadEvent()
		if err != nil {
			return err
		}
		switch event.Type {
		case "audio":
			if err := writer.audio(event.Audio); err != nil {
				return err
			}
		case "user_final":
			latestUserText = event.Text
			if err := writer.json(gin.H{"type": "user_final", "text": event.Text}); err != nil {
				return err
			}
		case "turn_complete":
			if err := writer.json(gin.H{"type": "assistant_final", "text": event.Text}); err != nil {
				return err
			}
			if err := writer.json(gin.H{
				"type":     "history_snapshot",
				"messages": event.History,
			}); err != nil {
				return err
			}
			if err := writer.json(gin.H{
				"type":          "turn_complete",
				"userText":      latestUserText,
				"assistantText": event.Text,
			}); err != nil {
				return err
			}
			latestUserText = ""
			busy.Store(false)
		case "session_finished":
			return nil
		case "protocol":
			log.Printf("[RealtimeWS] Doubao protocol event=%d text=%q", event.Event, event.Text)
		}
	}
}

func newRealtimeSessionID() string {
	var value [16]byte
	if _, err := rand.Read(value[:]); err != nil {
		return "realtime-session"
	}
	return hex.EncodeToString(value[:])
}
