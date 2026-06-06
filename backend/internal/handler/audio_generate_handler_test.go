package handler

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"

	"ai_language_learning_platform_xengineer_qiniucloud/internal/config"

	"github.com/gin-gonic/gin"
)

func TestAudioGenerateHandlerRejectsEmptyText(t *testing.T) {
	gin.SetMode(gin.TestMode)

	router := gin.New()
	router.POST("/api/audio/grammar", AudioGenerateHandler(config.Config{}))

	req := httptest.NewRequest(http.MethodPost, "/api/audio/grammar", strings.NewReader(`{"text":"   "}`))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400, got %d, body: %s", rec.Code, rec.Body.String())
	}
}

func TestAudioGenerateHandlerDoubaoSynthesisIntegration(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping Doubao TTS integration test in short mode")
	}

	gin.SetMode(gin.TestMode)
	chdirBackendRoot(t)

	cfg := config.Load()
	if cfg.DoubaoApiKey == "" || cfg.DoubaoTTSResourceID == "" {
		t.Skip("skipping Doubao TTS integration test: credentials are not configured")
	}

	router := gin.New()
	router.POST("/api/audio/grammar", AudioGenerateHandler(cfg))

	body := bytes.NewBufferString(`{"text":"hello nice to meet you","format":"mp3"}`)
	req := httptest.NewRequest(http.MethodPost, "/api/audio/grammar", body)
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d, body: %s", rec.Code, rec.Body.String())
	}
	if contentType := rec.Header().Get("Content-Type"); !strings.HasPrefix(contentType, "audio/mpeg") {
		t.Fatalf("expected audio/mpeg content type, got %q", contentType)
	}

	audio := rec.Body.Bytes()
	if len(audio) < 1024 {
		t.Fatalf("expected non-empty synthesized audio, got %d bytes", len(audio))
	}
	if !looksLikeMP3(audio) {
		t.Fatalf("response does not look like MP3 audio; first bytes: % x", audio[:min(len(audio), 16)])
	}

	outputPath := os.Getenv("AUDIO_GENERATE_TEST_OUTPUT")
	if outputPath == "" {
		outputPath = "./doubao_tts_test.mp3"
	}
	if err := os.WriteFile(outputPath, audio, 0644); err != nil {
		t.Fatalf("failed to write synthesized audio to %s: %v", outputPath, err)
	}
	t.Logf("synthesized audio saved to %s (%d bytes)", outputPath, len(audio))
}

func looksLikeMP3(data []byte) bool {
	if len(data) >= 3 && string(data[:3]) == "ID3" {
		return true
	}
	for i := 0; i+1 < len(data) && i < 16; i++ {
		if data[i] == 0xff && data[i+1]&0xe0 == 0xe0 {
			return true
		}
	}
	return false
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func chdirBackendRoot(t *testing.T) {
	t.Helper()

	_, currentFile, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("failed to resolve current test file path")
	}

	backendRoot := filepath.Clean(filepath.Join(filepath.Dir(currentFile), "../.."))
	previousDir, err := os.Getwd()
	if err != nil {
		t.Fatalf("failed to get current working directory: %v", err)
	}
	if err := os.Chdir(backendRoot); err != nil {
		t.Fatalf("failed to chdir to backend root %s: %v", backendRoot, err)
	}
	t.Cleanup(func() {
		if err := os.Chdir(previousDir); err != nil {
			t.Fatalf("failed to restore working directory %s: %v", previousDir, err)
		}
	})
}
