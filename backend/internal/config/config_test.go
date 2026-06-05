package config

import "testing"

func TestLoadUsesDefaults(t *testing.T) {
	t.Setenv("APP_ENV", "")
	t.Setenv("HTTP_ADDR", "")

	cfg := Load()

	if cfg.AppEnv != "development" {
		t.Fatalf("expected AppEnv development, got %q", cfg.AppEnv)
	}

	if cfg.HTTPAddr != ":8080" {
		t.Fatalf("expected HTTPAddr :8080, got %q", cfg.HTTPAddr)
	}
}

func TestLoadUsesEnvironmentOverrides(t *testing.T) {
	t.Setenv("APP_ENV", "test")
	t.Setenv("HTTP_ADDR", ":9090")

	cfg := Load()

	if cfg.AppEnv != "test" {
		t.Fatalf("expected AppEnv test, got %q", cfg.AppEnv)
	}

	if cfg.HTTPAddr != ":9090" {
		t.Fatalf("expected HTTPAddr :9090, got %q", cfg.HTTPAddr)
	}
}
