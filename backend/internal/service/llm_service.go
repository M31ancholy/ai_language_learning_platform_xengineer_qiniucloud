package service

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math"
	"strings"
	"time"

	"ai_language_learning_platform_xengineer_qiniucloud/internal/config"

	"github.com/sashabaranov/go-openai"
)

type GrammarResult struct {
	GrammarErrors    []GrammarError    `json:"grammarErrors"`
	ExpressionIssues []ExpressionIssue `json:"expressionIssues"`
	GrammarScore     int               `json:"grammarScore"`
	ExpressionScore  int               `json:"expressionScore"`
}

type GrammarError struct {
	Original    string `json:"original"`    // 错误原文片段
	Corrected   string `json:"corrected"`   // 修正后
	Explanation string `json:"explanation"` // 中文解释
	Severity    string `json:"severity"`    // "minor"/"major"/"critical"
}

type ExpressionIssue struct {
	Original    string `json:"original"`
	Suggestion  string `json:"suggestion"`
	Explanation string `json:"explanation"`
}

type FinalScore struct {
	Pronunciation float64 `json:"pronunciation"`
	Grammar       float64 `json:"grammar"`
	Expression    float64 `json:"expression"`
	Fluency       float64 `json:"fluency"`
	Total         float64 `json:"total"`
	Grade         string  `json:"grade"`
}

// AnalyzeGrammarExpression 调用 MiniMax M3 对输入文本进行语法与表达纠错分析
func AnalyzeGrammarExpression(cfg config.Config, userText string, refText string, scene string, difficulty string) (*GrammarResult, error) {
	if cfg.MiniMaxAPIKey == "" {
		return nil, fmt.Errorf("minimax API key is not configured")
	}

	// 1. 初始化 OpenAI 客户端，BaseURL 指向 MiniMax
	clientConfig := openai.DefaultConfig(cfg.MiniMaxAPIKey)
	if cfg.MiniMaxBaseURL != "" {
		clientConfig.BaseURL = cfg.MiniMaxBaseURL
	} else {
		clientConfig.BaseURL = "https://api.minimax.chat/v1"
	}
	client := openai.NewClientWithConfig(clientConfig)

	// 2. 设计 Prompt
	systemPrompt := `You are an expert English language coach.
Analyze the user's spoken response in the context of the climbing game scene.
Compare the user's spoken text ("userText") against the reference text ("refText") if provided.
Scene: %s
Difficulty: %s

Please identify:
1. Grammar errors: spelling, tenses, subject-verb agreement, articles, prepositions, etc.
2. Expression issues: words or phrases that are grammatically correct but sound unnatural, informal, or could be replaced by a more premium business/restaurant term.

For each grammar error, provide the original fragment, the corrected fragment, a concise Chinese explanation, and severity ("minor", "major", or "critical").
For each expression issue, provide the original fragment, a suggestion for a better phrasing, and a concise Chinese explanation.

Rate the Grammar score (0-100) and Expression score (0-100) based on the mistakes.
- No errors: 95-100
- Minor errors: 80-94
- Major/Critical errors: 40-79
- Completely incorrect/gibberish: 0-39

Output MUST be a JSON object matching this schema:
{
  "grammarErrors": [
    {
      "original": "error fragment",
      "corrected": "corrected fragment",
      "explanation": "Chinese explanation",
      "severity": "minor" | "major" | "critical"
    }
  ],
  "expressionIssues": [
    {
      "original": "fragment",
      "suggestion": "better phrasing",
      "explanation": "Chinese explanation"
    }
  ],
  "grammarScore": 90,
  "expressionScore": 85
}`

	userPrompt := fmt.Sprintf("User Spoken Text: \"%s\"\nReference Text: \"%s\"", userText, refText)

	// 如果没有识别到有效文本，做兜底处理
	if strings.TrimSpace(userText) == "" || userText == "\"\"" {
		return &GrammarResult{
			GrammarErrors:    []GrammarError{},
			ExpressionIssues: []ExpressionIssue{},
			GrammarScore:     0,
			ExpressionScore:  0,
		}, nil
	}

	modelName := cfg.MiniMaxModel
	if modelName == "" {
		modelName = "minimax-m3"
	}

	log.Printf("[LLM] Sending request to MiniMax M3. Model=%s, UserText=%s", modelName, userText)

	// 3. 发送请求，开启 20 秒超时与 JSON Object 限制
	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	resp, err := client.CreateChatCompletion(
		ctx,
		openai.ChatCompletionRequest{
			Model: modelName,
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleSystem,
					Content: fmt.Sprintf(systemPrompt, scene, difficulty),
				},
				{
					Role:    openai.ChatMessageRoleUser,
					Content: userPrompt,
				},
			},
			ResponseFormat: &openai.ChatCompletionResponseFormat{
				Type: openai.ChatCompletionResponseFormatTypeJSONObject,
			},

			Temperature: 0.1,
		},
	)
	if err != nil {
		return nil, fmt.Errorf("minimax API chat completion failed: %v", err)
	}

	reply := resp.Choices[0].Message.Content
	log.Printf("[LLM] Received response: %s", reply)

	// 提取并解析 JSON 结果
	cleanedReply := extractJSON(reply)
	log.Printf("[LLM] Cleaned JSON response: %s", cleanedReply)

	var result GrammarResult
	if err := json.Unmarshal([]byte(cleanedReply), &result); err != nil {
		return nil, fmt.Errorf("failed to parse JSON from LLM: %v, reply content: %s", err, reply)
	}

	return &result, nil
}

// extractJSON 提取输入字符串中的首个 JSON 对象 bounds {...} 并去除 thought 块和 markdown 标记
func extractJSON(input string) string {
	// 去除 <think>...</think> 块
	if thinkStart := strings.Index(input, "<think>"); thinkStart != -1 {
		if thinkEnd := strings.Index(input, "</think>"); thinkEnd != -1 && thinkEnd > thinkStart {
			input = input[thinkEnd+len("</think>"):]
		} else {
			input = input[thinkStart+len("<think>"):]
		}
	}

	start := strings.Index(input, "{")
	end := strings.LastIndex(input, "}")
	if start == -1 || end == -1 || start > end {
		return input
	}
	return input[start : end+1]
}

// CalculateFinalScore 结合发音、语法、表达与流畅度，计算总评分与评级
func CalculateFinalScore(pronScore float64, grammarScore float64, exprScore float64, fluencyScore float64) *FinalScore {
	// 权重配置：发音 40%，语法 25%，表达 20%，流畅度 15%
	total := pronScore*0.4 + grammarScore*0.25 + exprScore*0.2 + fluencyScore*0.15
	totalRounded := math.Round(total)

	// 计算评级
	grade := "F"
	if totalRounded >= 95 {
		grade = "S"
	} else if totalRounded >= 85 {
		grade = "A"
	} else if totalRounded >= 70 {
		grade = "B"
	} else if totalRounded >= 50 {
		grade = "C"
	} else if totalRounded >= 30 {
		grade = "D"
	}

	return &FinalScore{
		Pronunciation: math.Round(pronScore),
		Grammar:       math.Round(grammarScore),
		Expression:    math.Round(exprScore),
		Fluency:       math.Round(fluencyScore),
		Total:         totalRounded,
		Grade:         grade,
	}
}
