package main

import (
	"ai_language_learning_platform_xengineer_qiniucloud/internal/api"
	"ai_language_learning_platform_xengineer_qiniucloud/internal/config"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()
	r := gin.Default()
	api.RegisterRoutes(r)

	go r.Run(cfg.HTTPAddr)
}
