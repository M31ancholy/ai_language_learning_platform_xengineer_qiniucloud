package api

import (
	"ai_language_learning_platform_xengineer_qiniucloud/internal/config"
	"ai_language_learning_platform_xengineer_qiniucloud/internal/handler"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine, cfg config.Config) {
	// 注册路由
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Hello, World!",
		})
	})

	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "healthy",
		})
	})

	// 评分评测 API
	r.POST("/api/evaluate/pronunciation", handler.EvaluatePronunciationHandler(cfg))
	r.POST("/api/evaluate/grammar-expression", handler.AnalyzeGrammarHandler(cfg))
	r.POST("/api/evaluate/score", handler.CalculateScoreHandler())

	// 总结 AI 报告 API
	r.POST("/api/summary/generate", handler.GenerateSummaryHandler(cfg))

	// 实时语音对话 WebSocket 接口
	r.GET("/api/realtime/chat", handler.RealtimeChatHandler(cfg))
}



