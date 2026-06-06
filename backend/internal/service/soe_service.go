package service

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"log"
	"os/exec"
	"time"

	"ai_language_learning_platform_xengineer_qiniucloud/internal/config"

	"github.com/tencentcloud/tencentcloud-sdk-go/tencentcloud/common"
	"github.com/tencentcloud/tencentcloud-sdk-go/tencentcloud/common/profile"
	soe "github.com/tencentcloud/tencentcloud-sdk-go/tencentcloud/soe/v20180724"
)

type PronResult struct {
	OverallScore float64      `json:"overallScore"` // 整体发音分
	Words        []WordResult `json:"words"`        // 逐词评分
}

type WordResult struct {
	Word         string        `json:"word"`
	PronAccuracy float64       `json:"pronAccuracy"` // 0~100
	IsCorrect    bool          `json:"isCorrect"`    // >75 为正确
	Phones       []PhoneResult `json:"phones"`       // 音素级详情
}

type PhoneResult struct {
	Char  string  `json:"char"`  // 音素名
	Score float64 `json:"score"` // 音素分数
}

// EvaluatePronunciation 调用腾讯云 SOE 接口评测音频
func EvaluatePronunciation(cfg config.Config, audioData []byte, refText string, isReading bool) (*PronResult, error) {
	if cfg.TencentSecretId == "" || cfg.TencentSecretKey == "" {
		return nil, fmt.Errorf("tencent cloud credentials are not configured")
	}

	// 1. 转换音频格式为 16k/16bit 单声道 WAV
	wavData, err := convertToWav(audioData)
	if err != nil {
		return nil, fmt.Errorf("failed to convert audio to wav: %v", err)
	}

	// 2. Base64 编码
	audioBase64 := base64.StdEncoding.EncodeToString(wavData)

	// 3. 实例化腾讯云凭证与客户端
	credential := common.NewCredential(cfg.TencentSecretId, cfg.TencentSecretKey)
	cpf := profile.NewClientProfile()
	client, err := soe.NewClient(credential, cfg.TencentSOERegion, cpf)
	if err != nil {
		return nil, fmt.Errorf("failed to create SOE client: %v", err)
	}

	// 4. 实例化请求对象
	request := soe.NewTransmitOralProcessWithInitRequest()

	// 生成唯一会话 ID
	sessionId := fmt.Sprintf("session_%d", time.Now().UnixNano())

	// 设置基本参数
	request.SessionId = common.StringPtr(sessionId)
	request.RefText = common.StringPtr(refText)
	request.WorkMode = common.Int64Ptr(1) // 1: 非流式一次性评估

	// 评估模式：1代表句子，3代表自由说。如果是朗读则用句子模式，如果是场景对话则用自由说模式
	evalMode := int64(1)
	if !isReading {
		// 场景对话/自由说模式
		evalMode = 3
	}
	request.EvalMode = common.Int64Ptr(evalMode)

	// 音频编码与格式：WAV
	request.VoiceFileType = common.Int64Ptr(2)   // 2: WAV
	request.VoiceEncodeType = common.Int64Ptr(2) // 2: WAV
	request.UserVoiceData = common.StringPtr(audioBase64)
	request.IsEnd = common.Int64Ptr(1) // 1: 是最后一个分片
	request.SeqId = common.Int64Ptr(1) // 1: 第一个分片
	request.ServerType = common.Int64Ptr(0) // 0: 英文评估
	request.ScoreCoeff = common.Float64Ptr(1.5) // 评分苛刻度

	log.Printf("[SOE] Sending request to Tencent Cloud. SessionId=%s, RefText=%s, EvalMode=%d", sessionId, refText, evalMode)

	// 5. 调用接口
	response, err := client.TransmitOralProcessWithInit(request)
	if err != nil {
		return nil, fmt.Errorf("tencent cloud SOE API call failed: %v", err)
	}

	log.Printf("[SOE] Received response. ToJsonString=%s", response.ToJsonString())

	// 6. 解析转换结果
	var result PronResult
	if response.Response.SuggestedScore != nil {
		result.OverallScore = *response.Response.SuggestedScore
	} else if response.Response.PronAccuracy != nil {
		result.OverallScore = *response.Response.PronAccuracy
	}

	for _, w := range response.Response.Words {
		wordStr := ""
		if w.Word != nil {
			wordStr = *w.Word
		}
		accuracy := 0.0
		if w.PronAccuracy != nil {
			accuracy = *w.PronAccuracy
		}

		var phones []PhoneResult
		for _, p := range w.PhoneInfos {
			phoneChar := ""
			if p.Phone != nil {
				phoneChar = *p.Phone
			}
			phoneScore := 0.0
			if p.PronAccuracy != nil {
				phoneScore = *p.PronAccuracy
			}
			phones = append(phones, PhoneResult{
				Char:  phoneChar,
				Score: phoneScore,
			})
		}

		result.Words = append(result.Words, WordResult{
			Word:         wordStr,
			PronAccuracy: accuracy,
			IsCorrect:    accuracy >= 75.0,
			Phones:       phones,
		})
	}

	return &result, nil
}

// convertToWav 使用 ffmpeg 将任意输入音频转换为 16k/16bit 单声道 WAV 编码
func convertToWav(inputData []byte) ([]byte, error) {
	// 尝试直接使用系统中的 ffmpeg
	cmd := exec.Command("ffmpeg", "-i", "pipe:0", "-f", "wav", "-ar", "16000", "-ac", "1", "-acodec", "pcm_s16le", "pipe:1")
	var stdout, stderr bytes.Buffer
	cmd.Stdin = bytes.NewReader(inputData)
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	err := cmd.Run()
	if err != nil {
		log.Printf("[SOE] ffmpeg via path failed: %v. Retrying with absolute homebrew path...", err)
		// 尝试 Homebrew 默认的绝对路径作为备用（Mac 环境）
		cmd2 := exec.Command("/opt/homebrew/bin/ffmpeg", "-i", "pipe:0", "-f", "wav", "-ar", "16000", "-ac", "1", "-acodec", "pcm_s16le", "pipe:1")
		var stdout2, stderr2 bytes.Buffer
		cmd2.Stdin = bytes.NewReader(inputData)
		cmd2.Stdout = &stdout2
		cmd2.Stderr = &stderr2

		if err2 := cmd2.Run(); err2 != nil {
			return nil, fmt.Errorf("ffmpeg convert failed: %v. Stderr: %s", err2, stderr2.String())
		}
		return stdout2.Bytes(), nil
	}

	return stdout.Bytes(), nil
}
