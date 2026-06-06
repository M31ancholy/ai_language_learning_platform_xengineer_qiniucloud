package config

import (
	"log"

	"github.com/spf13/viper"
)

type Config struct {
	AppEnv           string
	HTTPAddr         string
	MiniMaxAPIKey    string
	MiniMaxBaseURL   string
	MiniMaxModel     string
	TencentSecretId  string
	TencentSecretKey string
	TencentSOERegion string
}

func Load() Config {
	v := viper.New()
	v.SetDefault("APP_ENV", "development")
	v.SetDefault("HTTP_ADDR", ":8081") // Changed from :8080 to :8081 to avoid conflict with Vite

	// Bind env variables (automatic fallback)
	v.BindEnv("minimax.api_key", "MINIMAX_API_KEY")
	v.BindEnv("minimax.base_url", "MINIMAX_BASE_URL")
	v.BindEnv("minimax.model", "MINIMAX_MODEL")
	v.BindEnv("tencent.secret_id", "TENCENT_SECRET_ID")
	v.BindEnv("tencent.secret_key", "TENCENT_SECRET_KEY")
	v.BindEnv("tencent.soe_region", "TENCENT_SOE_REGION")

	v.AutomaticEnv()

	// Try loading secrets.yaml config file
	v.SetConfigName("secrets")
	v.SetConfigType("yaml")
	v.AddConfigPath("internal/config")
	v.AddConfigPath(".")

	if err := v.ReadInConfig(); err != nil {
		log.Printf("Warning: Failed to read secrets.yaml config file: %v. Relying on environment variables.", err)
	} else {
		log.Printf("Successfully loaded configuration from: %s", v.ConfigFileUsed())
	}

	return Config{
		AppEnv:           v.GetString("APP_ENV"),
		HTTPAddr:         v.GetString("HTTP_ADDR"),
		MiniMaxAPIKey:    v.GetString("minimax.api_key"),
		MiniMaxBaseURL:   v.GetString("minimax.base_url"),
		MiniMaxModel:     v.GetString("minimax.model"),
		TencentSecretId:  v.GetString("tencent.secret_id"),
		TencentSecretKey: v.GetString("tencent.secret_key"),
		TencentSOERegion: v.GetString("tencent.soe_region"),
	}
}

