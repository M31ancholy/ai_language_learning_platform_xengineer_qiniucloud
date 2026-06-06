package service

import (
	"bytes"
	"testing"
)

func TestDoubaoRealtimeProtocolRoundTrip(t *testing.T) {
	original := doubaoRealtimeMessage{
		Type:      doubaoAudioClient,
		Flag:      doubaoFlagWithEvent,
		Event:     200,
		SessionID: "session-123",
		Payload:   []byte{1, 2, 3, 4},
	}

	frame, err := marshalDoubaoRealtimeMessage(original, doubaoSerializationRaw)
	if err != nil {
		t.Fatalf("marshal message: %v", err)
	}
	decoded, err := unmarshalDoubaoRealtimeMessage(frame)
	if err != nil {
		t.Fatalf("unmarshal message: %v", err)
	}

	if decoded.Type != original.Type || decoded.Event != original.Event || decoded.SessionID != original.SessionID {
		t.Fatalf("decoded metadata mismatch: %#v", decoded)
	}
	if !bytes.Equal(decoded.Payload, original.Payload) {
		t.Fatalf("decoded payload mismatch: %v", decoded.Payload)
	}
}

func TestDoubaoRealtimeHistoryOnlyCommitsFinalMessages(t *testing.T) {
	session := &DoubaoRealtimeSession{}
	session.userDraft = "hello doubao"
	if got := session.commitUser(""); got != "hello doubao" {
		t.Fatalf("unexpected user text %q", got)
	}

	session.aiDraft = "Nice to meet "
	finalText, history := session.commitAssistant("you.")
	if finalText != "Nice to meet you." {
		t.Fatalf("unexpected assistant text %q", finalText)
	}
	if len(history) != 2 {
		t.Fatalf("expected 2 final history messages, got %d", len(history))
	}
	if history[0].Role != "user" || history[1].Role != "assistant" {
		t.Fatalf("unexpected history roles: %#v", history)
	}
}

func TestExtractDoubaoEventText(t *testing.T) {
	payload := []byte(`{"result":{"transcript":"final recognized text"}}`)
	if got := extractDoubaoEventText(payload); got != "final recognized text" {
		t.Fatalf("unexpected extracted text %q", got)
	}
}
