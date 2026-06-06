package handler

import (
	"net/http"

	"ai_language_learning_platform_xengineer_qiniucloud/internal/config"
	"ai_language_learning_platform_xengineer_qiniucloud/internal/service"

	"github.com/gin-gonic/gin"
)

// GenerateSummaryHandler 战后总结评语 Handler
func GenerateSummaryHandler(cfg config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req service.SummaryRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		// 调用总结生成服务
		result, err := service.GenerateSummary(cfg, req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, result)
	}
}
