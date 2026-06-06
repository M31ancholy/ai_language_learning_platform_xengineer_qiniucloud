package main

import (
	"ai_language_learning_platform_xengineer_qiniucloud/internal/api"
	"ai_language_learning_platform_xengineer_qiniucloud/internal/config"
	"ai_language_learning_platform_xengineer_qiniucloud/internal/middleware"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()
	
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.Logger())
	r.Use(middleware.CORS())

	api.RegisterRoutes(r, cfg)

	// Removed 'go' keyword so the application blocks and keeps running
	r.Run(cfg.HTTPAddr)
}


