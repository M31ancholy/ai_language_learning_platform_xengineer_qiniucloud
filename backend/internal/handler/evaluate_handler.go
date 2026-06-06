package handler

import (
	"encoding/base64"
	"net/http"

	"ai_language_learning_platform_xengineer_qiniucloud/internal/config"
	"ai_language_learning_platform_xengineer_qiniucloud/internal/service"

	"github.com/gin-gonic/gin"
)

type PronRequest struct {
	Audio     string `json:"audio" binding:"required"`     // Base64 编码的音频数据
	RefText   string `json:"refText" binding:"required"`   // 被评测文本
	IsReading bool   `json:"isReading"`                    // 是否是朗读模式（默认为 false）
}

type GrammarRequest struct {
	UserText   string `json:"userText" binding:"required"`
	RefText    string `json:"refText"`
	Scene      string `json:"scene"`
	Difficulty string `json:"difficulty"`
}

type ScoreRequest struct {
	Pronunciation float64 `json:"pronunciation"`
	Grammar       float64 `json:"grammar"`
	Expression    float64 `json:"expression"`
	Fluency       float64 `json:"fluency"`
}

// EvaluatePronunciationHandler 语音评测 Handler
func EvaluatePronunciationHandler(cfg config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req PronRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// 解码 base64 音频数据
		audioBytes, err := base64.StdEncoding.DecodeString(req.Audio)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "failed to decode base64 audio: " + err.Error()})
			return
		}

		// 调用 SOE 服务
		result, err := service.EvaluatePronunciation(cfg, audioBytes, req.RefText, req.IsReading)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, result)
	}
}

// AnalyzeGrammarHandler 语法表达分析 Handler
func AnalyzeGrammarHandler(cfg config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req GrammarRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// 调用 LLM 服务进行分析
		result, err := service.AnalyzeGrammarExpression(cfg, req.UserText, req.RefText, req.Scene, req.Difficulty)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, result)
	}
}

// CalculateScoreHandler 计算综合评分 Handler
func CalculateScoreHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		var req ScoreRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// 计算最终分数
		result := service.CalculateFinalScore(req.Pronunciation, req.Grammar, req.Expression, req.Fluency)
		c.JSON(http.StatusOK, result)
	}
}
