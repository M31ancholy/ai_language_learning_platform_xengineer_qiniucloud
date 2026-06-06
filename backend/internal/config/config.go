package config

import (
	"log"

	"github.com/spf13/viper"
)

type Config struct {
	AppEnv              string
	HTTPAddr            string
	MiniMaxAPIKey       string
	MiniMaxBaseURL      string
	MiniMaxModel        string
	TencentSecretId     string
	TencentSecretKey    string
	TencentSOERegion    string
	DoubaoApiKey        string
	DoubaoTTSResourceID string

	DoubaoAppId string
	DoubaoAK    string
	DoubaoSK    string

	DoubaoTTSURL        string
	DoubaoTTSSpeaker    string
	DoubaoTTSFormat     string
	DoubaoTTSSampleRate int
}

func Load() Config {
	v := viper.New()
	v.SetDefault("APP_ENV", "development")
	v.SetDefault("HTTP_ADDR", ":8081") // Changed from :8080 to :8081 to avoid conflict with Vite
	v.SetDefault("doubao.tts_url", "https://openspeech.bytedance.com/api/v3/tts/unidirectional")
	v.SetDefault("doubao.tts_format", "mp3")
	v.SetDefault("doubao.tts_sample_rate", 24000)

	// Bind env variables (automatic fallback)
	v.BindEnv("minimax.api_key", "MINIMAX_API_KEY")
	v.BindEnv("minimax.base_url", "MINIMAX_BASE_URL")
	v.BindEnv("minimax.model", "MINIMAX_MODEL")
	v.BindEnv("tencent.secret_id", "TENCENT_SECRET_ID")
	v.BindEnv("tencent.secret_key", "TENCENT_SECRET_KEY")
	v.BindEnv("tencent.soe_region", "TENCENT_SOE_REGION")
	v.BindEnv("doubao.api_key", "DOUBAO_API_KEY", "DOUBAO_TTS_API_KEY")
	v.BindEnv("doubao.tts_resource_id", "DOUBAO_TTS_RESOURCE_ID", "DOUBAO_RESOURCE_ID")
	v.BindEnv("doubao.tts_url", "DOUBAO_TTS_URL")
	v.BindEnv("doubao.tts_speaker", "DOUBAO_TTS_SPEAKER")
	v.BindEnv("doubao.tts_format", "DOUBAO_TTS_FORMAT")
	v.BindEnv("doubao.tts_sample_rate", "DOUBAO_TTS_SAMPLE_RATE")

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
		AppEnv:              v.GetString("APP_ENV"),
		HTTPAddr:            v.GetString("HTTP_ADDR"),
		MiniMaxAPIKey:       v.GetString("minimax.api_key"),
		MiniMaxBaseURL:      v.GetString("minimax.base_url"),
		MiniMaxModel:        v.GetString("minimax.model"),
		TencentSecretId:     v.GetString("tencent.secret_id"),
		TencentSecretKey:    v.GetString("tencent.secret_key"),
		TencentSOERegion:    v.GetString("tencent.soe_region"),
		DoubaoTTSResourceID: v.GetString("doubao.tts_resource_id"),
		DoubaoTTSURL:        v.GetString("doubao.tts_url"),
		DoubaoTTSSpeaker:    v.GetString("doubao.tts_speaker"),
		DoubaoTTSFormat:     v.GetString("doubao.tts_format"),
		DoubaoTTSSampleRate: v.GetInt("doubao.tts_sample_rate"),
		DoubaoApiKey:        v.GetString("doubao.api_key"),
		DoubaoAppId:         v.GetString("doubao.app_id"),
		DoubaoAK:            v.GetString("doubao.ak"),
		DoubaoSK:            v.GetString("doubao.sk"),
	}
}
