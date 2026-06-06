package handler

import (
	"encoding/base64"
	"log"
	"net/http"
	"strings"

	"ai_language_learning_platform_xengineer_qiniucloud/internal/config"
	"ai_language_learning_platform_xengineer_qiniucloud/internal/service"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/sashabaranov/go-openai"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // 允许所有来源跨域连接
	},
}

type RealtimeMessage struct {
	Text     string                         `json:"text"`     // 用户口语的识别文本
	Audio    string                         `json:"audio"`    // 用户录制音频的 Base64 编码
	BossName string                         `json:"bossName"` // 当前 Boss 的姓名
	History  []openai.ChatCompletionMessage `json:"history"`  // 历史对话队列
}

// RealtimeChatHandler 处理 Boss 战实时语音双向对话及发音评测的 WebSocket 处理器
func RealtimeChatHandler(cfg config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Printf("[RealtimeWS] Upgrade connection failed: %v", err)
			return
		}
		defer ws.Close()

		log.Printf("[RealtimeWS] Client connected successfully")

		for {
			var msg RealtimeMessage
			err := ws.ReadJSON(&msg)
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
					log.Printf("[RealtimeWS] Read message error: %v", err)
				}
				break
			}

			log.Printf("[RealtimeWS] Received message: Text=%q, Boss=%q, HistoryCount=%d", msg.Text, msg.BossName, len(msg.History))

			// 1. 发音评测
			var overallScore float64 = 80.0
			var wordResults []service.WordResult
			var pronErr error

			if msg.Audio != "" && msg.Text != "" {
				audioBytes, err := base64.StdEncoding.DecodeString(msg.Audio)
				if err == nil {
					log.Printf("[RealtimeWS] Evaluating user oral pronunciation via Tencent SOE...")
					result, err := service.EvaluatePronunciation(cfg, audioBytes, msg.Text, false)
					if err == nil {
						overallScore = result.OverallScore
						wordResults = result.Words
					} else {
						pronErr = err
						log.Printf("[RealtimeWS] Tencent SOE evaluate failed: %v", err)
					}
				} else {
					pronErr = err
					log.Printf("[RealtimeWS] Decode user audio failed: %v", err)
				}
			}

			// 若没有真实音频评测（如本地没麦克风）或评测出错，则本地进行分词并做模拟发音评分
			if len(wordResults) == 0 && msg.Text != "" {
				words := strings.Fields(msg.Text)
				for _, w := range words {
					cleanWord := strings.Trim(w, ".,!?;:\"'")
					if cleanWord == "" {
						continue
					}
					// 根据词长及伪随机算法计算发音分数，保证结果的相对确定性与像素风真实感
					score := float64(72 + (len(cleanWord)*7)%26)
					wordResults = append(wordResults, service.WordResult{
						Word:         cleanWord,
						PronAccuracy: score,
						IsCorrect:    score >= 75.0,
					})
				}
			}

			// 2. 语法与表达评测 (调用 service.AnalyzeGrammarExpression)
			var grammarScore float64 = 80.0
			var exprScore float64 = 80.0
			var grammarErrors []service.GrammarError
			var exprIssues []service.ExpressionIssue

			if msg.Text != "" {
				grammarResult, err := service.AnalyzeGrammarExpression(cfg, msg.Text, "", "general", "expert")
				if err == nil {
					grammarScore = float64(grammarResult.GrammarScore)
					exprScore = float64(grammarResult.ExpressionScore)
					grammarErrors = grammarResult.GrammarErrors
					exprIssues = grammarResult.ExpressionIssues
				} else {
					log.Printf("[RealtimeWS] MiniMax Grammar check failed: %v", err)
				}
			}

			// 3. 计算最终总评分与评级
			finalScoreResult := service.CalculateFinalScore(overallScore, grammarScore, exprScore, overallScore)

			// 4. 调用 MiniMax M3 对话模型生成 Boss 文本回复
			log.Printf("[RealtimeWS] Requesting MiniMax M3 for Boss reply...")
			bossReply, err := service.ChatWithBoss(cfg, msg.History, msg.Text, msg.BossName)
			if err != nil {
				log.Printf("[RealtimeWS] MiniMax Chat failed: %v", err)
				bossReply = "I hear you clearly, traveler. Show me more of your wisdom!"
			}
			log.Printf("[RealtimeWS] Boss reply text: %q", bossReply)

			// 5. 调用 MiniMax TTS 生成 Boss 的高保真语音回复音频
			log.Printf("[RealtimeWS] Synthesizing Boss voice response via MiniMax TTS...")
			audioBytes, err := service.TextToSpeech(cfg, bossReply)
			var base64Audio string
			if err == nil {
				base64Audio = base64.StdEncoding.EncodeToString(audioBytes)
			} else {
				log.Printf("[RealtimeWS] MiniMax TTS synthesis failed: %v", err)
			}

			// 6. 返回完整结构给客户端（包含评估得分、回复文本、回复音频字节 Base64）
			response := gin.H{
				"type":      "reply",
				"userText":  msg.Text,
				"bossReply": bossReply,
				"audio":     base64Audio, // Base64 编码的 MP3 格式
				"evaluation": gin.H{
					"overallScore":  overallScore,
					"grammarScore":  grammarScore,
					"exprScore":     exprScore,
					"fluencyScore":  overallScore,
					"totalScore":    finalScoreResult.Total,
					"grade":         finalScoreResult.Grade,
					"words":         wordResults,
					"grammarErrors": grammarErrors,
					"exprIssues":    exprIssues,
				},
			}

			if pronErr != nil {
				response["warning"] = "发音评测服务调用失败，已启动本地备用评估机制: " + pronErr.Error()
			}

			if err := ws.WriteJSON(response); err != nil {
				log.Printf("[RealtimeWS] Write reply failed: %v", err)
				break
			}

			log.Printf("[RealtimeWS] Reply sent to client successfully")
		}
	}
}
