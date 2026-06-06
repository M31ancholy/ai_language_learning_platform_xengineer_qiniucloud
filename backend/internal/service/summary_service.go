package service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"ai_language_learning_platform_xengineer_qiniucloud/internal/config"

	"github.com/sashabaranov/go-openai"
)

type SummaryRequest struct {
	Errors []string `json:"errors"` // 本关累计的所有语法/表达错误原文与修改建议
	Score  int      `json:"score"`  // 最终得分
	Grade  string   `json:"grade"`  // 最终评级
}

type SummaryResult struct {
	Feedback    string   `json:"feedback"`    // AI点评正文
	FocusErrors []string `json:"focusErrors"` // 建议重点复习的错误列表
}

// GenerateSummary 调用 MiniMax M3 生成定制化的战后总结与激励评语
func GenerateSummary(cfg config.Config, req SummaryRequest) (*SummaryResult, error) {
	if cfg.MiniMaxAPIKey == "" {
		return nil, fmt.Errorf("minimax API key is not configured")
	}

	clientConfig := openai.DefaultConfig(cfg.MiniMaxAPIKey)
	if cfg.MiniMaxBaseURL != "" {
		clientConfig.BaseURL = cfg.MiniMaxBaseURL
	}
	client := openai.NewClientWithConfig(clientConfig)

	// 根据评级分数决定不同的 AI 点评语气
	toneGuide := ""
	if req.Score >= 85 {
		toneGuide = "玩家表现非常出色，请使用热情激昂、充满赞赏的‘鼓励性语气’来评价，并肯定他们的发音与表达，引导他们向更高难度挑战。"
	} else if req.Score >= 50 {
		toneGuide = "玩家有一定口语基础但仍有瑕疵，请使用专业、包容的‘纠错回顾语气’评价。指出他们主要的发音或语法盲点，给出具体的提升点拨。"
	} else {
		toneGuide = "玩家表现较差，遇到了严重的表达障碍，请使用极其温柔、循循善诱、耐心的‘引导性语气’进行心理疏导，降低他们的挫败感，鼓励他们一步一步开口尝试。"
	}

	systemPrompt := fmt.Sprintf(`You are an encouraging and professional AI English coach for a Roguelike climbing game.
Generate a personalized, game-themed review in Chinese.
Your tone should adapt to the user's score according to this guide:
%s

Review the errors the player made:
%v
And their final score: %d (Grade: %s).

Return the review as a JSON object matching this schema:
{
  "feedback": "Your personalized, encouraging feedback text in Chinese. Max 150 words.",
  "focusErrors": ["One or two key errors the player should focus on correcting, in Chinese. Max 2 items."]
}`, toneGuide, req.Errors, req.Score, req.Grade)

	modelName := cfg.MiniMaxModel
	if modelName == "" {
		modelName = "minimax-m3"
	}

	log.Printf("[Summary] Generating AI coach feedback. Score=%d, Grade=%s, ErrorsCount=%d", req.Score, req.Grade, len(req.Errors))

	// 发送请求，开启 20 秒超时与 JSON Object 限制
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	resp, err := client.CreateChatCompletion(
		ctx,
		openai.ChatCompletionRequest{
			Model: modelName,
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleSystem,
					Content: systemPrompt,
				},
				{
					Role:    openai.ChatMessageRoleUser,
					Content: "Please write my review.",
				},
			},
			ResponseFormat: &openai.ChatCompletionResponseFormat{
				Type: openai.ChatCompletionResponseFormatTypeJSONObject,
			},

			Temperature: 0.6,
		},
	)
	if err != nil {
		return nil, fmt.Errorf("minimax API chat completion failed: %v", err)
	}

	reply := resp.Choices[0].Message.Content
	log.Printf("[Summary] Generated response: %s", reply)

	cleanedReply := extractJSON(reply)
	log.Printf("[Summary] Cleaned JSON response: %s", cleanedReply)

	var result SummaryResult
	if err := json.Unmarshal([]byte(cleanedReply), &result); err != nil {
		return nil, fmt.Errorf("failed to parse Summary JSON from LLM: %v, reply content: %s", err, reply)
	}

	return &result, nil
}

