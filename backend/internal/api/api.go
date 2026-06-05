package api

import "github.com/gin-gonic/gin"

func RegisterRoutes(r *gin.Engine) {
	// 注册路由
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Hello, World!",
		})
	})
}
