package service

import (
	"context"
	"os"
	"path/filepath"
	"runtime"
	"testing"
	"time"

	"ai_language_learning_platform_xengineer_qiniucloud/internal/config"
)

func TestDoubaoRealtimeDialogueIntegration(t *testing.T) {
	if os.Getenv("RUN_DOUBAO_REALTIME_INTEGRATION") != "1" {
		t.Skip("set RUN_DOUBAO_REALTIME_INTEGRATION=1 to call the real Doubao service")
	}

	_, currentFile, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("resolve test path")
	}
	backendRoot := filepath.Clean(filepath.Join(filepath.Dir(currentFile), "../.."))
	previousDir, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}
	if err := os.Chdir(backendRoot); err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = os.Chdir(previousDir) })

	cfg := config.Load()
	ctx, cancel := context.WithTimeout(context.Background(), 45*time.Second)
	defer cancel()

	session, err := OpenDoubaoRealtimeSession(ctx, cfg, newDoubaoRequestID())
	if err != nil {
		t.Fatalf("open realtime session: %v", err)
	}
	defer session.Close()

	audio, err := os.ReadFile(filepath.Join(backendRoot, "docs/go_doubao/whoareyou.wav"))
	if err != nil {
		t.Fatalf("read sample audio: %v", err)
	}
	if len(audio) > 44 {
		audio = audio[44:]
	}

	for offset := 0; offset < len(audio); offset += 640 {
		end := offset + 640
		if end > len(audio) {
			end = len(audio)
		}
		if err := session.SendAudio(audio[offset:end]); err != nil {
			t.Fatalf("send audio: %v", err)
		}
		time.Sleep(20 * time.Millisecond)
	}
	if err := session.EndTurn(); err != nil {
		t.Fatalf("end turn: %v", err)
	}

	var audioBytes int
	for {
		event, err := session.ReadEvent()
		if err != nil {
			t.Fatalf("read event: %v", err)
		}
		t.Logf("event type=%s code=%d text=%q audio=%d", event.Type, event.Event, event.Text, len(event.Audio))
		audioBytes += len(event.Audio)
		if event.Type == "turn_complete" {
			if len(event.History) != 2 {
				t.Fatalf("expected user and assistant final history, got %#v", event.History)
			}
			if audioBytes == 0 {
				t.Fatal("expected streamed assistant audio")
			}
			return
		}
	}
}
