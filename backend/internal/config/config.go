package config

import "github.com/spf13/viper"

type Config struct {
	AppEnv   string
	HTTPAddr string
}

func Load() Config {
	v := viper.New()
	v.SetDefault("APP_ENV", "development")
	v.SetDefault("HTTP_ADDR", ":8080")
	v.AutomaticEnv()

	return Config{
		AppEnv:   v.GetString("APP_ENV"),
		HTTPAddr: v.GetString("HTTP_ADDR"),
	}
}
