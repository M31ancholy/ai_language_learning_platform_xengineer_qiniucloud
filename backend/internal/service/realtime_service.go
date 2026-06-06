package service

import (
	"bytes"
	"context"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"

	"ai_language_learning_platform_xengineer_qiniucloud/internal/config"

	"github.com/sashabaranov/go-openai"
)

type TTSRequest struct {
	Model        string       `json:"model"`
	Text         string       `json:"text"`
	VoiceSetting VoiceSetting `json:"voice_setting"`
	AudioSetting AudioSetting `json:"audio_setting"`
}

type VoiceSetting struct {
	VoiceId string  `json:"voice_id"`
	Speed   float64 `json:"speed"`
	Vol     float64 `json:"vol"`
	Pitch   int     `json:"pitch"`
}

type AudioSetting struct {
	SampleRate int    `json:"sample_rate"`
	Bitrate    int    `json:"bitrate"`
	Format     string `json:"format"`
	Channel    int    `json:"channel"`
}

type TTSResponse struct {
	Data     TTSResponseData `json:"data"`
	BaseResp BaseResponse    `json:"base_resp"`
}

type TTSResponseData struct {
	Audio  string `json:"audio"` // Hex encoded audio
	Status int    `json:"status"`
}

type BaseResponse struct {
	StatusCode int    `json:"status_code"`
	StatusMsg  string `json:"status_msg"`
}

// ChatWithBoss 调用 MiniMax M3 生成 Boss 的英文对话回复
func ChatWithBoss(cfg config.Config, history []openai.ChatCompletionMessage, userText string, bossName string) (string, error) {
	if cfg.MiniMaxAPIKey == "" {
		return "", fmt.Errorf("minimax API key is not configured")
	}

	clientConfig := openai.DefaultConfig(cfg.MiniMaxAPIKey)
	if cfg.MiniMaxBaseURL != "" {
		clientConfig.BaseURL = cfg.MiniMaxBaseURL
	} else {
		clientConfig.BaseURL = "https://api.minimax.chat/v1"
	}
	client := openai.NewClientWithConfig(clientConfig)

	// 设置 Boss 扮演提示词
	systemPrompt := fmt.Sprintf(`You are the Boss in a Roguelike English climbing game. Your character name is "%s".
You are having a real-time English conversation with the player.
Keep your response under 20 words, natural, grammatically correct, and matching your boss personality.
Answer directly in English, do not add translation or explanation.`, bossName)

	messages := []openai.ChatCompletionMessage{
		{
			Role:    openai.ChatMessageRoleSystem,
			Content: systemPrompt,
		},
	}

	// 拼接历史对话记录
	messages = append(messages, history...)

	// 追加用户最新发言
	if userText != "" {
		messages = append(messages, openai.ChatCompletionMessage{
			Role:    openai.ChatMessageRoleUser,
			Content: userText,
		})
	}

	modelName := cfg.MiniMaxModel
	if modelName == "" {
		modelName = "minimax-m3"
	}

	log.Printf("[Realtime] Boss Chat request to MiniMax M3. Model=%s, BossName=%s, MessagesCount=%d", modelName, bossName, len(messages))

	resp, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model:       modelName,
			Messages:    messages,
			Temperature: 0.7,
		},
	)
	if err != nil {
		return "", fmt.Errorf("minimax chat completion failed: %v", err)
	}

	reply := resp.Choices[0].Message.Content
	return strings.TrimSpace(reply), nil
}

// TextToSpeech 调用 MiniMax t2a_v2 接口将回复文本转换为语音字节流 (MP3)
func TextToSpeech(cfg config.Config, text string) ([]byte, error) {
	if cfg.MiniMaxAPIKey == "" {
		return nil, fmt.Errorf("minimax API key is not configured")
	}

	baseURL := cfg.MiniMaxBaseURL
	if baseURL == "" {
		baseURL = "https://api.minimax.chat/v1"
	}
	baseURL = strings.TrimSuffix(baseURL, "/")
	ttsURL := baseURL + "/t2a_v2"

	reqBody := TTSRequest{
		Model: "speech-01-turbo", // 使用低延迟高吞吐推荐模型
		Text:  text,
		VoiceSetting: VoiceSetting{
			VoiceId: "female-yujia", // 预设女声
			Speed:   1.0,
			Vol:     1.0,
			Pitch:   0,
		},
		AudioSetting: AudioSetting{
			SampleRate: 32000,
			Bitrate:    128000,
			Format:     "mp3",
			Channel:    1,
		},
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal TTS request: %v", err)
	}

	req, err := http.NewRequest("POST", ttsURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create TTS request: %v", err)
	}

	req.Header.Set("Authorization", "Bearer "+cfg.MiniMaxAPIKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("TTS API request failed: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("TTS API returned status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read TTS response body: %v", err)
	}

	var ttsResp TTSResponse
	if err := json.Unmarshal(bodyBytes, &ttsResp); err != nil {
		return nil, fmt.Errorf("failed to parse TTS response: %v, body: %s", err, string(bodyBytes))
	}

	if ttsResp.BaseResp.StatusCode != 0 {
		return nil, fmt.Errorf("TTS API business error: code %d, msg %s", ttsResp.BaseResp.StatusCode, ttsResp.BaseResp.StatusMsg)
	}

	if ttsResp.Data.Audio == "" {
		return nil, fmt.Errorf("TTS API returned empty audio data")
	}

	audioBytes, err := hex.DecodeString(ttsResp.Data.Audio)
	if err != nil {
		return nil, fmt.Errorf("failed to decode hex audio data: %v", err)
	}

	return audioBytes, nil
}
