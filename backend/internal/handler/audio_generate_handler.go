package handler

import (
	"log"
	"net/http"
	"strings"

	"ai_language_learning_platform_xengineer_qiniucloud/internal/config"
	"ai_language_learning_platform_xengineer_qiniucloud/internal/service"

	"github.com/gin-gonic/gin"
)

// AudioGenerateHandler receives text and streams synthesized audio bytes to the client.
func AudioGenerateHandler(cfg config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req service.DoubaoTTSGenerateRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if strings.TrimSpace(req.Text) == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "text is required"})
			return
		}

		contentType := audioContentType(req.Format, cfg.DoubaoTTSFormat)
		c.Header("Content-Type", contentType)
		c.Header("Cache-Control", "no-store")
		c.Header("X-Content-Type-Options", "nosniff")

		result, err := service.StreamDoubaoTTS(c.Request.Context(), cfg, req, c.Writer)
		if err != nil {
			bytesWritten := int64(0)
			logID := ""
			if result != nil {
				bytesWritten = result.BytesWritten
				logID = result.LogID
			}

			log.Printf("[AudioGenerate] Doubao TTS failed. LogID=%s, BytesWritten=%d, Error=%v", logID, bytesWritten, err)
			if bytesWritten == 0 {
				c.Header("Content-Type", "application/json; charset=utf-8")
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": err.Error(),
					"logId": logID,
				})
			}
			return
		}

		log.Printf("[AudioGenerate] Doubao TTS stream completed. LogID=%s, BytesWritten=%d", result.LogID, result.BytesWritten)
	}
}

func audioContentType(requestFormat string, configFormat string) string {
	format := strings.ToLower(requestFormat)
	if format == "" {
		format = strings.ToLower(configFormat)
	}

	switch format {
	case "wav":
		return "audio/wav"
	case "ogg":
		return "audio/ogg"
	case "pcm":
		return "audio/L16"
	default:
		return "audio/mpeg"
	}
}
