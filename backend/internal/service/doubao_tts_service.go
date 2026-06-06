package service

import (
	"bytes"
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"ai_language_learning_platform_xengineer_qiniucloud/internal/config"
)

type DoubaoTTSGenerateRequest struct {
	Text       string `json:"text"`
	Speaker    string `json:"speaker,omitempty"`
	Format     string `json:"format,omitempty"`
	SampleRate int    `json:"sampleRate,omitempty"`
}

type doubaoTTSPayload struct {
	User      doubaoTTSUser      `json:"user"`
	ReqParams doubaoTTSReqParams `json:"req_params"`
}

type doubaoTTSUser struct {
	UID string `json:"uid"`
}

type doubaoTTSReqParams struct {
	Text        string               `json:"text"`
	Speaker     string               `json:"speaker"`
	AudioParams doubaoTTSAudioParams `json:"audio_params"`
	Additions   string               `json:"additions"`
}

type doubaoTTSAudioParams struct {
	Format          string `json:"format"`
	SampleRate      int    `json:"sample_rate"`
	EnableTimestamp bool   `json:"enable_timestamp"`
}

type doubaoTTSStreamResponse struct {
	Code     int             `json:"code"`
	Data     string          `json:"data"`
	Sentence json.RawMessage `json:"sentence"`
	Usage    json.RawMessage `json:"usage"`
	Message  string          `json:"message"`
}

type DoubaoTTSStreamResult struct {
	BytesWritten int64
	LogID        string
}

func StreamDoubaoTTS(ctx context.Context, cfg config.Config, req DoubaoTTSGenerateRequest, w io.Writer) (*DoubaoTTSStreamResult, error) {
	req.Text = strings.TrimSpace(req.Text)
	if req.Text == "" {
		return nil, errors.New("text is required")
	}
	if cfg.DoubaoApiKey == "" || cfg.DoubaoTTSResourceID == "" {
		return nil, errors.New("doubao TTS credentials are not configured")
	}

	ttsURL := strings.TrimSpace(cfg.DoubaoTTSURL)
	if ttsURL == "" {
		ttsURL = "https://openspeech.bytedance.com/api/v3/tts/unidirectional"
	}

	speaker := strings.TrimSpace(req.Speaker)
	if speaker == "" {
		speaker = cfg.DoubaoTTSSpeaker
	}
	if speaker == "" {
		speaker = defaultDoubaoSpeaker(cfg.DoubaoTTSResourceID)
	}

	format := strings.TrimSpace(req.Format)
	if format == "" {
		format = cfg.DoubaoTTSFormat
	}
	if format == "" {
		format = "mp3"
	}

	sampleRate := req.SampleRate
	if sampleRate == 0 {
		sampleRate = cfg.DoubaoTTSSampleRate
	}
	if sampleRate == 0 {
		sampleRate = 24000
	}

	additions, err := json.Marshal(map[string]any{
		"explicit_language":       "zh",
		"disable_markdown_filter": true,
		"enable_timestamp":        true,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to marshal doubao TTS additions: %w", err)
	}

	payload := doubaoTTSPayload{
		User: doubaoTTSUser{
			UID: "ai-language-learning-platform",
		},
		ReqParams: doubaoTTSReqParams{
			Text:    req.Text,
			Speaker: speaker,
			AudioParams: doubaoTTSAudioParams{
				Format:          format,
				SampleRate:      sampleRate,
				EnableTimestamp: true,
			},
			Additions: string(additions),
		},
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal doubao TTS request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, ttsURL, bytes.NewReader(body))
	if err != nil {
		return nil, fmt.Errorf("failed to create doubao TTS request: %w", err)
	}
	httpReq.Header.Set("X-Api-Key", cfg.DoubaoApiKey)
	httpReq.Header.Set("X-Api-App-Key", "aGjiRDfUWi")
	httpReq.Header.Set("X-Api-Resource-Id", cfg.DoubaoTTSResourceID)
	httpReq.Header.Set("X-Api-Request-Id", newDoubaoRequestID())
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Connection", "keep-alive")

	client := &http.Client{
		Timeout: 2 * time.Minute,
	}
	httpResp, err := client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("doubao TTS request failed: %w", err)
	}
	defer httpResp.Body.Close()

	result := &DoubaoTTSStreamResult{
		LogID: httpResp.Header.Get("X-Tt-Logid"),
	}

	if httpResp.StatusCode != http.StatusOK {
		errBody, _ := io.ReadAll(io.LimitReader(httpResp.Body, 4096))
		return result, fmt.Errorf("doubao TTS returned status %d: %s", httpResp.StatusCode, strings.TrimSpace(string(errBody)))
	}

	decoder := json.NewDecoder(httpResp.Body)
	for {
		var streamResp doubaoTTSStreamResponse
		if err := decoder.Decode(&streamResp); err != nil {
			if errors.Is(err, io.EOF) {
				break
			}
			return result, fmt.Errorf("failed to parse doubao TTS stream: %w", err)
		}

		done, err := writeDoubaoTTSResponse(streamResp, w, result)
		if err != nil {
			return result, err
		}
		if done {
			break
		}
	}

	if result.BytesWritten == 0 {
		return result, errors.New("doubao TTS returned empty audio data")
	}

	return result, nil
}

func defaultDoubaoSpeaker(resourceID string) string {
	if strings.Contains(resourceID, "2.0") {
		return "zh_female_vv_uranus_bigtts"
	}
	return "zh_female_cancan_mars_bigtts"
}

func newDoubaoRequestID() string {
	var b [16]byte
	if _, err := rand.Read(b[:]); err != nil {
		return fmt.Sprintf("ai-language-learning-%d", time.Now().UnixNano())
	}
	return hex.EncodeToString(b[:])
}

func writeDoubaoTTSResponse(resp doubaoTTSStreamResponse, w io.Writer, result *DoubaoTTSStreamResult) (bool, error) {
	if resp.Code == 0 && resp.Data != "" {
		audioChunk, err := base64.StdEncoding.DecodeString(resp.Data)
		if err != nil {
			return false, fmt.Errorf("failed to decode doubao TTS audio chunk: %w", err)
		}

		n, err := w.Write(audioChunk)
		result.BytesWritten += int64(n)
		if err != nil {
			return false, fmt.Errorf("failed to write doubao TTS audio chunk: %w", err)
		}
		if flusher, ok := w.(interface{ Flush() }); ok {
			flusher.Flush()
		}
		return false, nil
	}

	if resp.Code == 0 && len(resp.Sentence) > 0 {
		return false, nil
	}

	if resp.Code == 20000000 {
		return true, nil
	}

	if resp.Code > 0 {
		if resp.Message != "" {
			return false, fmt.Errorf("doubao TTS business error: code %d, message %s", resp.Code, resp.Message)
		}
		return false, fmt.Errorf("doubao TTS business error: code %d", resp.Code)
	}

	return false, nil
}
