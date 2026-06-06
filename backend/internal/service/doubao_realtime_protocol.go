package service

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"io"
	"math"
)

type doubaoRealtimeMessageType uint8

const (
	doubaoFullClient        doubaoRealtimeMessageType = 0x1
	doubaoAudioClient       doubaoRealtimeMessageType = 0x2
	doubaoFullServer        doubaoRealtimeMessageType = 0x9
	doubaoAudioServer       doubaoRealtimeMessageType = 0xb
	doubaoFrontEndServer    doubaoRealtimeMessageType = 0xc
	doubaoErrorServer       doubaoRealtimeMessageType = 0xf
	doubaoFlagWithEvent                               = 0x4
	doubaoSerializationRaw                            = 0x0
	doubaoSerializationJSON                           = 0x1
)

type doubaoRealtimeMessage struct {
	Type      doubaoRealtimeMessageType
	Flag      uint8
	Event     int32
	SessionID string
	ConnectID string
	ErrorCode uint32
	Payload   []byte
}

func marshalDoubaoRealtimeMessage(msg doubaoRealtimeMessage, serialization uint8) ([]byte, error) {
	var buf bytes.Buffer
	buf.Write([]byte{
		0x11,
		byte(msg.Type<<4) | (msg.Flag & 0x0f),
		serialization << 4,
		0x00,
	})

	if msg.Flag&doubaoFlagWithEvent != 0 {
		if err := binary.Write(&buf, binary.BigEndian, msg.Event); err != nil {
			return nil, fmt.Errorf("write event: %w", err)
		}
		if !doubaoConnectionEvent(msg.Event) {
			if err := writeDoubaoSizedBytes(&buf, []byte(msg.SessionID)); err != nil {
				return nil, fmt.Errorf("write session ID: %w", err)
			}
		}
	}

	if err := writeDoubaoSizedBytes(&buf, msg.Payload); err != nil {
		return nil, fmt.Errorf("write payload: %w", err)
	}
	return buf.Bytes(), nil
}

func unmarshalDoubaoRealtimeMessage(data []byte) (doubaoRealtimeMessage, error) {
	var msg doubaoRealtimeMessage
	if len(data) < 4 {
		return msg, io.ErrUnexpectedEOF
	}

	headerSize := int(data[0]&0x0f) * 4
	if headerSize < 4 || len(data) < headerSize {
		return msg, fmt.Errorf("invalid header size %d", headerSize)
	}

	msg.Type = doubaoRealtimeMessageType(data[1] >> 4)
	msg.Flag = data[1] & 0x0f
	reader := bytes.NewReader(data[headerSize:])

	if msg.Type == doubaoErrorServer {
		if err := binary.Read(reader, binary.BigEndian, &msg.ErrorCode); err != nil {
			return msg, fmt.Errorf("read error code: %w", err)
		}
	}

	if msg.Flag&doubaoFlagWithEvent != 0 {
		if err := binary.Read(reader, binary.BigEndian, &msg.Event); err != nil {
			return msg, fmt.Errorf("read event: %w", err)
		}
		if !doubaoConnectionEvent(msg.Event) {
			sessionID, err := readDoubaoSizedBytes(reader)
			if err != nil {
				return msg, fmt.Errorf("read session ID: %w", err)
			}
			msg.SessionID = string(sessionID)
		}
		if msg.Event == 50 || msg.Event == 51 || msg.Event == 52 {
			connectID, err := readDoubaoSizedBytes(reader)
			if err != nil {
				return msg, fmt.Errorf("read connect ID: %w", err)
			}
			msg.ConnectID = string(connectID)
		}
	}

	payload, err := readDoubaoSizedBytes(reader)
	if err != nil {
		return msg, fmt.Errorf("read payload: %w", err)
	}
	msg.Payload = payload
	if reader.Len() != 0 {
		return msg, fmt.Errorf("unexpected trailing bytes: %d", reader.Len())
	}
	return msg, nil
}

func doubaoConnectionEvent(event int32) bool {
	switch event {
	case 1, 2, 50, 51, 52:
		return true
	default:
		return false
	}
}

func writeDoubaoSizedBytes(buf *bytes.Buffer, data []byte) error {
	if len(data) > math.MaxUint32 {
		return fmt.Errorf("data too large: %d", len(data))
	}
	if err := binary.Write(buf, binary.BigEndian, uint32(len(data))); err != nil {
		return err
	}
	_, err := buf.Write(data)
	return err
}

func readDoubaoSizedBytes(reader *bytes.Reader) ([]byte, error) {
	var size uint32
	if err := binary.Read(reader, binary.BigEndian, &size); err != nil {
		return nil, err
	}
	if uint64(size) > uint64(reader.Len()) {
		return nil, io.ErrUnexpectedEOF
	}
	data := make([]byte, int(size))
	if _, err := io.ReadFull(reader, data); err != nil {
		return nil, err
	}
	return data, nil
}
