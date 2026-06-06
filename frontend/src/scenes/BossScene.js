/**
 * 语塔攀登 - Boss 对话关卡场景
 * 仿杀戮尖塔的 Boss 战多轮实时英语对话
 */

import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants.js';
import { GameState } from '../game/GameState.js';
import { EventBus, EVENTS } from '../utils/EventBus.js';
import { createPixelText } from '../utils/PixelText.js';
import { randomInt, formatTime, clamp } from '../utils/Helpers.js';
import { getChallenge } from '../data/challenges/index.js';
import { ApiClient } from '../services/ApiClient.js';
import { renderColorCodedText } from '../utils/ColorTextRenderer.js';
import { MONSTERS } from '../data/monsters.js';


export class BossScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.BOSS });
        this.currentRound = 1;
        this.totalRounds = 4;
        this.dialogueHistory = [];
        this.isRecording = false;
        this.timeRemaining = 60;
        this.timerEvent = null;
        this.roundScores = [];
        this.realtimeReady = false;
        this.realtimeAudioPlayhead = 0;
    }

    init(data) {
        this.act = data?.act || GameState.currentAct || 1;
        
        const actConfig = CONSTANTS.ACTS[this.act];
        
        // 动态加载当前场景及章节的 Boss 剧本与元数据
        this.bossData = getChallenge(GameState.selectedScene, this.act, null, 'boss');
        if (this.bossData) {
            this.bossMeta = {
                name: this.bossData.name,
                icon: this.bossData.icon,
                desc: this.bossData.scene
            };
            this.bossRoundsData = this.bossData.rounds || [];
        } else {
            // 兜底降级
            this.bossMeta = {
                name: actConfig?.boss || '大Boss',
                icon: '👹',
                desc: '守关首领'
            };
            this.bossRoundsData = [];
        }

        this.totalRounds = this.bossRoundsData.length || actConfig?.bossRounds || 4;

        this.currentRound = 1;
        this.dialogueHistory = [];
        this.roundScores = [];
        this.isRecording = false;
    }

    create() {
        const { width, height } = this.scale;
        const C = CONSTANTS.COLORS;

        // ========== 背景 ==========
        this.add.rectangle(width / 2, height / 2, width, height, C.BG_DARK);
        this._drawStarfield();

        // ========== 顶部标题栏 ==========
        this._createTopBar(width);

        // ========== Boss 精灵与生命值 ==========
        this._createBossArea(width);

        // ========== 历史记录与当前对话框 ==========
        this._createDialogueArea(width);

        // ========== 录音控制区域 ==========
        this._createRecordingArea(width, height);

        // ========== 底部状态栏 ==========
        this._createBottomBar(width, height);

        // 建立 WebSocket 连接（仅针对 Act 3 的实时语音 Boss 对话）
        if (this.act === 3) {
            this._setupRealtimeWebSocket();
            this.events.once('shutdown', () => this._closeRealtimeResources());
        }

        // 首次启动，显示 Boss 第一句台词
        this._showCurrentRoundLine();
    }

    _createTopBar(width) {
        this.add.rectangle(width / 2, 18, width, 36, 0x000000, 0.7).setDepth(10);
        createPixelText(this, 20, 18, `★ BOSS战 ★ ${this.bossMeta.name}`, 'body', {
            color: '#ffd700',
            align: 'left'
        }).setOrigin(0, 0.5).setDepth(11);

        const floor = GameState.currentRow >= 0 ? GameState.currentRow + 1 : CONSTANTS.MAP.ROWS;
        createPixelText(this, width - 20, 18, `层数: ${floor}/${CONSTANTS.MAP.ROWS}`, 'body', {
            color: '#51e5ff'
        }).setOrigin(1, 0.5).setDepth(11);
    }

    _createBossArea(width) {
        const cx = width / 2;

        // Boss 容器
        this.bossContainer = this.add.container(cx - 280, 150);

        // 精灵图
        const spriteName = `boss_act${this.act}`;
        const bossSprite = this.add.image(0, 0, spriteName).setScale(1.8);
        this.bossContainer.add(bossSprite);

        // 漂浮动画
        this.tweens.add({
            targets: bossSprite,
            y: -8,
            duration: 1800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Boss 名称与血条
        const nameText = createPixelText(this, 0, -60, `${this.bossMeta.icon} ${this.bossMeta.name}`, 'button', {
            color: '#ffffff',
            stroke: '#000',
            strokeThickness: 2
        });
        this.bossContainer.add(nameText);

        const hpBg = this.add.rectangle(0, 50, 160, 14, 0x441111).setStrokeStyle(1, 0x666666);
        this.bossContainer.add(hpBg);

        this.hpFill = this.add.rectangle(-78, 50, 156, 10, CONSTANTS.COLORS.HP_RED).setOrigin(0, 0.5);
        this.bossContainer.add(this.hpFill);

        this.hpLabel = createPixelText(this, 0, 50, '100%', 'small', { color: '#ffffff' });
        this.bossContainer.add(this.hpLabel);
    }

    _createDialogueArea(width) {
        const cx = width / 2;

        // 历史对话容器（简易滚动列表）
        this.historyText = this.add.text(cx + 100, 120, '', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '7px',
            color: '#888888',
            lineSpacing: 6,
            wordWrap: { width: 420 }
        }).setOrigin(0, 0);

        // 当前 Boss 台词气泡
        const bubbleBg = this.add.rectangle(cx + 80, 240, 480, 100, CONSTANTS.COLORS.BG_PANEL, 0.95);
        bubbleBg.setStrokeStyle(2, CONSTANTS.COLORS.GOLD);

        this.bossLineText = this.add.text(cx - 140, 205, '', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '9px',
            color: '#ffd700',
            lineSpacing: 8,
            wordWrap: { width: 440 }
        });

        this.promptText = this.add.text(cx - 140, 265, '', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: '#51e5ff',
            lineSpacing: 6,
            wordWrap: { width: 440 }
        });
    }

    _createRecordingArea(width, height) {
        const cx = width / 2;
        const recordY = 430;

        // 倒计时
        this.timerText = createPixelText(this, cx, recordY - 45, `⏱️ 01:00`, 'subtitle');

        // 录音按钮
        const recordBtn = this.add.image(cx, recordY, 'btn_record').setScale(1.3);
        recordBtn.setInteractive({ useHandCursor: true });

        const recordLabel = createPixelText(this, cx, recordY + 40, '点击开始回答', 'small', { color: '#cccccc' });

        // 波形
        this.waveformBars = [];
        const barCount = 30;
        for (let i = 0; i < barCount; i++) {
            const bar = this.add.rectangle(
                cx - (barCount * 4) / 2 + i * 4 + 2,
                recordY + 65,
                3, 4,
                CONSTANTS.COLORS.ACCENT
            ).setAlpha(0.3);
            this.waveformBars.push(bar);
        }

        // 识别到的文本
        this.recognizedText = this.add.text(cx, recordY + 90, '', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: '#4caf50',
            wordWrap: { width: width - 120 },
            align: 'center'
        }).setOrigin(0.5);

        recordBtn.on('pointerup', () => {
            if (!this.isRecording) {
                this._startRecording(recordBtn, recordLabel);
            } else {
                this._stopRecording(recordBtn, recordLabel);
            }
        });

        recordBtn.on('pointerover', () => recordBtn.setScale(1.4));
        recordBtn.on('pointerout', () => recordBtn.setScale(1.3));

        this.recordBtn = recordBtn;
        this.recordLabel = recordLabel;
    }

    _createBottomBar(width, height) {
        const barY = height - 35;
        this.add.rectangle(width / 2, height - 25, width, 50, 0x000000, 0.8).setDepth(10);

        const p = GameState.player;

        // HP
        this.hpText = createPixelText(this, 30, barY, `❤️ HP: ${p.hp}/${p.maxHp}`, 'button', { color: '#ff2d2d' }).setOrigin(0, 0.5).setDepth(11);

        // 护盾
        this.shieldText = createPixelText(this, 180, barY, `🛡️ SHIELD: ${p.shield}`, 'button', { color: '#4488ff' }).setOrigin(0, 0.5).setDepth(11);

        // 金币
        this.goldText = createPixelText(this, 340, barY, `💰 GOLD: ${p.gold}`, 'button', { color: '#ffd700' }).setOrigin(0, 0.5).setDepth(11);

        // 能量
        this.energyText = createPixelText(this, 480, barY, `⚡ ENERGY: ${p.energy}/${p.maxEnergy}`, 'button', { color: '#51e5ff' }).setOrigin(0, 0.5).setDepth(11);

        // 背包容器
        this.inventoryContainer = this.add.container(0, 0).setDepth(11);

        // 背包
        this._createInventorySlots(width, barY);
    }

    _createInventorySlots(width, barY) {
        this.inventoryContainer.removeAll(true);

        const startX = 640;
        const items = GameState.inventory || [];
        const p = GameState.player;

        for (let i = 0; i < CONSTANTS.PLAYER.INVENTORY_SIZE; i++) {
            const x = startX + i * 40;
            const slot = this.add.rectangle(x, barY, 32, 28, CONSTANTS.COLORS.BG_PANEL);
            slot.setStrokeStyle(1, 0x555555);
            this.inventoryContainer.add(slot);

            if (items[i]) {
                const item = items[i];
                const icon = this.add.text(x, barY, item.icon || '📦', { fontSize: '14px' }).setOrigin(0.5);
                this.inventoryContainer.add(icon);

                slot.setInteractive({ useHandCursor: true });
                slot.on('pointerup', () => {
                    if (!item.usableInBattle) {
                        this._showFloatingText('该道具只能在地图中选用！', '#ff2d2d');
                        return;
                    }

                    if (p.energy > 0) {
                        const success = GameState.useItem(item.instanceId);
                        if (success) {
                            p.energy--;
                            this.shieldText.setText(`🛡️ SHIELD: ${p.shield}`);
                            this.hpText.setText(`❤️ HP: ${p.hp}/${p.maxHp}`);
                            this.goldText.setText(`💰 GOLD: ${p.gold}`);
                            this.energyText.setText(`⚡ ENERGY: ${p.energy}/${p.maxEnergy}`);
                            this._showFloatingText(`使用了 ${item.name}!`, '#4caf50');
                            
                            // 重新渲染背包栏
                            this._createInventorySlots(width, barY);
                        }
                    } else {
                        this._showFloatingText('能量不足！', '#ff2d2d');
                    }
                });
                slot.on('pointerover', () => slot.setStrokeStyle(2, CONSTANTS.COLORS.PRIMARY));
                slot.on('pointerout', () => slot.setStrokeStyle(1, 0x555555));
            }
        }
    }

    _showCurrentRoundLine() {
        if (this.currentRound > this.totalRounds) {
            this._onVictory();
            return;
        }

        // 更新 HP 条表示 Boss 剩余生命
        const pct = (this.totalRounds - this.currentRound + 1) / this.totalRounds;
        this.tweens.add({
            targets: this.hpFill,
            width: pct * 156,
            duration: 500
        });
        this.hpLabel.setText(`${Math.round(pct * 100)}%`);

        if (this.act === 3) {
            // Act 3: 实时语音开放对话
            if (this.currentRound === 1) {
                this.currentBossLine = "Welcome, challenger. You have reached the summit of the Word Spire. Prove your English fluency to me!";
                this.chatHistory = [];
                // 播放首个欢迎语音
                this._playBossVoice(this.currentBossLine);
            }
            this.bossLineText.setText(`Boss: "${this.currentBossLine}"`);
            this.promptText.setText(`任务: 与首领进行自由英语交流对话\n提示: 根据首领的发言进行自然作答，词数不限。`);
        } else {
            // Act 1 & 2: 剧本化关卡
            const roundData = this.bossRoundsData[this.currentRound - 1];
            if (!roundData) return;
            this.bossLineText.setText(`Boss: "${roundData.bossLine}"`);
            const hintsStr = Array.isArray(roundData.hints) ? roundData.hints.join(', ') : (roundData.hints || '无');
            this.promptText.setText(`任务: ${roundData.prompt}\n提示: ${hintsStr}`);
            
            // 播放剧本化关卡台词
            this._playBossVoice(roundData.bossLine);
        }

        // 重置录音倒计时
        this.timeRemaining = 60;
        this.timerText.setText(`⏱️ ${formatTime(this.timeRemaining)}`).setColor('#51e5ff');
        this.recognizedText.setText('');
    }

    async _playBossVoice(text) {
        if (!text) return;
        
        // 停止上一个还在播放的台词语音
        if (this.bossVoiceSource) {
            try {
                this.bossVoiceSource.stop();
            } catch (e) {
                // 已播放完或未播放直接忽略
            }
            this.bossVoiceSource = null;
        }

        try {
            const response = await fetch('/api/audio/grammar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    format: 'mp3'
                })
            });
            if (!response.ok) {
                console.warn('[BossScene] TTS request failed:', response.status);
                return;
            }
            const arrayBuffer = await response.arrayBuffer();
            this._ensureRealtimeOutputContext();
            
            this.realtimeOutputContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
                const source = this.realtimeOutputContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(this.realtimeOutputContext.destination);
                source.start(0);
                this.bossVoiceSource = source;
            }, (err) => {
                console.error('[BossScene] Failed to decode audio data:', err);
            });
        } catch (err) {
            console.error('[BossScene] Play boss voice error:', err);
        }
    }

    async _startRecording(btn, label) {
        this.isRecording = true;
        btn.setTexture('btn_stop');
        label.setText('🔴 正在录音... 再次点击提交');
        label.setColor('#ff2d2d');

        this.timerEvent = this.time.addEvent({
            delay: 1000,
            repeat: this.timeRemaining - 1,
            callback: () => {
                this.timeRemaining--;
                this.timerText.setText(`⏱️ ${formatTime(this.timeRemaining)}`);
                if (this.timeRemaining <= 10) this.timerText.setColor('#ff2d2d');
                if (this.timeRemaining <= 0) this._stopRecording(btn, label);
            }
        });

        // 模拟波形
        this.waveformTween = this.time.addEvent({
            delay: 50,
            loop: true,
            callback: () => {
                this.waveformBars.forEach(b => {
                    b.setSize(3, Phaser.Math.Between(4, 28));
                    b.setAlpha(0.8);
                });
            }
        });

        if (this.act === 3) {
            this._ensureRealtimeOutputContext();
            btn.disableInteractive();
            try {
                await this._startRealtimeAudioCapture();
                btn.setInteractive({ useHandCursor: true });
            } catch (err) {
                console.error('[BossScene] Realtime microphone start failed:', err);
                this._stopRealtimeAudioCapture();
                this.isRecording = false;
                btn.setTexture('btn_record');
                label.setText('麦克风启动失败');
                if (this.timerEvent) this.timerEvent.remove();
                if (this.waveformTween) this.waveformTween.remove();
                btn.setInteractive({ useHandCursor: true });
            }
        } else {
            this._startSpeechRecognition();
            this._tryStartRealRecording();
        }
    }

    async _stopRecording(btn, label) {
        this.isRecording = false;
        btn.setTexture('btn_record');
        label.setText('正在智能评分...');
        label.setColor('#4caf50');

        if (this.timerEvent) this.timerEvent.remove();
        if (this.waveformTween) this.waveformTween.remove();
        this.waveformBars.forEach(b => { b.setSize(3, 4); b.setAlpha(0.3); });

        if (this.act === 3) {
            this._stopRealtimeAudioCapture();
        } else {
            this._stopSpeechRecognition();
            this._tryStopRealRecording();
        }

        // 评分延迟效果
        this.recordBtn.disableInteractive();
        
        try {
            if (this.act === 3) {
                label.setText('正在等待豆包回复...');
                const realtimeData = await this.realtimeTurnPromise;
                await this._evaluateRound(null, realtimeData);
                this.recordBtn.setInteractive();
                return;
            }
            const audioBlob = await (this.audioReadyPromise || Promise.resolve(null));
            await this._evaluateRound(audioBlob);
        } catch (err) {
            console.error('[BossScene] 获取录音错误:', err);
            await this._evaluateRound(null);
        }
        
        this.recordBtn.setInteractive();
    }

    _startSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'en-US';
        this.recognition.continuous = true;
        this.recognition.interimResults = true;

        this.recognition.onresult = (event) => {
            let text = '';
            for (let i = 0; i < event.results.length; i++) {
                text += event.results[i][0].transcript;
            }
            this.recognizedTextContent = text;
            this.recognizedText.setText(`"${text}"`);
        };

        try { this.recognition.start(); } catch(e) {}
    }

    _stopSpeechRecognition() {
        if (this.recognition) {
            try { this.recognition.stop(); } catch(e) {}
        }
    }

    // ========== 真实录音（Web API） ==========
    async _tryStartRealRecording() {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.log('浏览器不支持麦克风，使用模拟评测');
                return;
            }

            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(this.mediaStream);
            this.audioChunks = [];

            // 关键：设计 Promise 供录音停止时可靠获取完整数据
            this.audioReadyPromise = new Promise((resolve) => {
                this.mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                    resolve(audioBlob);
                };
            });

            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    this.audioChunks.push(e.data);
                }
            };

            this.mediaRecorder.start();
            console.log('Boss战录音已开始');
        } catch (e) {
            console.log('Boss战麦克风启动失败，使用模拟评测:', e.message);
        }
    }

    _tryStopRealRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
            this.mediaStream?.getTracks().forEach(t => t.stop());
        }
    }

    _blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    _setupRealtimeWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        console.log('[BossScene] Connecting to Realtime WebSocket:', wsUrl);
        this.ws = new WebSocket(wsUrl);
        this.ws.binaryType = 'arraybuffer';
        this.realtimeReady = false;
        this.realtimeReadyPromise = new Promise((resolve, reject) => {
            this.realtimeReadyResolver = resolve;
            this.realtimeReadyRejecter = reject;
        });
        
        this.ws.onopen = () => {
            console.log('[BossScene] Realtime WebSocket connected');
        };
        
        this.ws.onmessage = (event) => {
            if (event.data instanceof ArrayBuffer) {
                this._queueRealtimePCM(event.data);
                return;
            }
            try {
                const data = JSON.parse(event.data);
                switch (data.type) {
                    case 'session_ready':
                        this.realtimeReady = true;
                        this.realtimeReadyResolver?.(data);
                        break;
                    case 'user_final':
                        this.recognizedTextContent = data.text || '';
                        this.recognizedText.setText(`"${this.recognizedTextContent}"`);
                        break;
                    case 'assistant_final':
                        this.currentBossLine = data.text || this.currentBossLine;
                        this.bossLineText.setText(`Boss: "${this.currentBossLine}"`);
                        break;
                    case 'history_snapshot':
                        this.chatHistory = data.messages || [];
                        break;
                    case 'turn_complete':
                        this.realtimeTurnResolver?.(data);
                        this.realtimeTurnResolver = null;
                        this.realtimeTurnRejecter = null;
                        break;
                    case 'error':
                        console.error('[BossScene] Realtime server error:', data.message);
                        this.realtimeTurnRejecter?.(new Error(data.message || 'Realtime dialogue failed'));
                        break;
                }
            } catch (err) {
                console.error('[BossScene] Failed to parse WebSocket message:', err);
            }
        };
        
        this.ws.onerror = (err) => {
            console.error('[BossScene] WebSocket error:', err);
            this.realtimeReadyRejecter?.(err);
            this.realtimeTurnRejecter?.(new Error('WebSocket error'));
        };
        
        this.ws.onclose = () => {
            console.log('[BossScene] WebSocket closed');
            this.realtimeReady = false;
            this.realtimeTurnRejecter?.(new Error('WebSocket closed'));
        };
    }

    async _startRealtimeAudioCapture() {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.realtimeReady) {
            if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
                this._setupRealtimeWebSocket();
            }
            await this.realtimeReadyPromise;
        }

        this.realtimeTurnPromise = new Promise((resolve, reject) => {
            this.realtimeTurnResolver = resolve;
            this.realtimeTurnRejecter = reject;
            window.setTimeout(() => {
                if (this.realtimeTurnRejecter === reject) {
                    reject(new Error('Realtime response timeout'));
                    this.realtimeTurnResolver = null;
                    this.realtimeTurnRejecter = null;
                }
            }, 45000);
        });

        this.ws.send(JSON.stringify({ type: 'start_turn' }));
        this.realtimeCapturing = true;
        this.realtimeInputStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                channelCount: 1,
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        });

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.realtimeInputContext = new AudioContextClass();
        const workletCode = `
            class PCMForwarder extends AudioWorkletProcessor {
                process(inputs) {
                    const input = inputs[0] && inputs[0][0];
                    if (input) this.port.postMessage(input.slice());
                    return true;
                }
            }
            registerProcessor('pcm-forwarder', PCMForwarder);
        `;
        const workletURL = URL.createObjectURL(new Blob([workletCode], { type: 'application/javascript' }));
        await this.realtimeInputContext.audioWorklet.addModule(workletURL);
        URL.revokeObjectURL(workletURL);

        this.realtimeInputSource = this.realtimeInputContext.createMediaStreamSource(this.realtimeInputStream);
        this.realtimeInputNode = new AudioWorkletNode(this.realtimeInputContext, 'pcm-forwarder');
        const silentGain = this.realtimeInputContext.createGain();
        silentGain.gain.value = 0;
        this.realtimeInputNode.port.onmessage = ({ data }) => {
            if (!this.isRecording || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;
            const pcm = this._resampleToPCM16(data, this.realtimeInputContext.sampleRate, 16000);
            if (pcm.byteLength > 0) this.ws.send(pcm);
        };
        this.realtimeInputSource.connect(this.realtimeInputNode);
        this.realtimeInputNode.connect(silentGain);
        silentGain.connect(this.realtimeInputContext.destination);
        this.realtimeSilentGain = silentGain;
        await this.realtimeInputContext.resume();
    }

    _stopRealtimeAudioCapture() {
        const wasCapturing = this.realtimeCapturing;
        this.realtimeCapturing = false;
        this.realtimeInputNode?.disconnect();
        this.realtimeInputSource?.disconnect();
        this.realtimeSilentGain?.disconnect();
        this.realtimeInputStream?.getTracks().forEach(track => track.stop());
        this.realtimeInputContext?.close();
        this.realtimeInputNode = null;
        this.realtimeInputSource = null;
        this.realtimeInputStream = null;
        this.realtimeInputContext = null;
        if (wasCapturing && this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'end_turn' }));
        }
    }

    _resampleToPCM16(input, sourceRate, targetRate) {
        const ratio = sourceRate / targetRate;
        const outputLength = Math.max(1, Math.floor(input.length / ratio));
        const output = new Int16Array(outputLength);
        for (let i = 0; i < outputLength; i++) {
            const start = Math.floor(i * ratio);
            const end = Math.min(input.length, Math.floor((i + 1) * ratio));
            let sum = 0;
            for (let j = start; j < end; j++) sum += input[j];
            const sample = Math.max(-1, Math.min(1, sum / Math.max(1, end - start)));
            output[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        }
        return output.buffer;
    }

    _queueRealtimePCM(arrayBuffer) {
        this._ensureRealtimeOutputContext();
        this.realtimeOutputContext.resume();
        const view = new DataView(arrayBuffer);
        const sampleCount = Math.floor(view.byteLength / 2);
        const audioBuffer = this.realtimeOutputContext.createBuffer(1, sampleCount, 24000);
        const channel = audioBuffer.getChannelData(0);
        for (let i = 0; i < sampleCount; i++) {
            channel[i] = view.getInt16(i * 2, true) / 32768;
        }
        const source = this.realtimeOutputContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(this.realtimeOutputContext.destination);
        const startAt = Math.max(this.realtimeOutputContext.currentTime + 0.02, this.realtimeAudioPlayhead);
        source.start(startAt);
        this.realtimeAudioPlayhead = startAt + audioBuffer.duration;
    }

    _ensureRealtimeOutputContext() {
        if (this.realtimeOutputContext) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.realtimeOutputContext = new AudioContextClass();
        this.realtimeAudioPlayhead = this.realtimeOutputContext.currentTime;
        this.realtimeOutputContext.resume();
    }

    _closeRealtimeResources() {
        this._stopRealtimeAudioCapture();
        this.realtimeOutputContext?.close();
        this.realtimeOutputContext = null;
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'close_session' }));
        }
        this.ws?.close();
    }

    async _evaluateRound(audioBlob, realtimeData = null) {
        if (this.act !== 3) {
            const roundData = this.bossRoundsData[this.currentRound - 1];
            if (!roundData) return;
        }

        let finalPronunciation = 0;
        let finalGrammar = 0;
        let finalExpression = 0;
        let finalFluency = 0;
        let score = 0;
        let success = false;
        
        let wordScores = [];
        let grammarErrors = [];
        let expressionSuggestions = [];

        // Act 3 实时语音开放对话分支
        if (this.act === 3) {
            try {
                const userText = realtimeData?.userText || this.recognizedTextContent || '';
                const assistantText = realtimeData?.assistantText || this.currentBossLine || '';
                this.recognizedTextContent = userText;
                this.currentBossLine = assistantText;
                this.bossLineText.setText(`Boss: "${assistantText}"`);

                score = 85;
                finalPronunciation = 85;
                finalGrammar = 85;
                finalExpression = 85;
                finalFluency = 85;
                wordScores = userText.split(/\s+/).filter(Boolean).map(word => ({
                    word: word.replace(/[.,!?;:]/g, ''),
                    score: 85,
                    isCorrect: true
                }));
                success = Boolean(userText || assistantText);
            } catch (err) {
                console.error('[BossScene] Realtime dialogue failed, falling back to mock:', err);
            }
        } else if (audioBlob) {
            // Act 1 & 2 标准 API 分支
            try {
                this.recordLabel.setText('🔄 1/3 正在分析口语发音...');
                const base64 = await this._blobToBase64(audioBlob);
                
                const userText = this.recognizedTextContent || "Hello, I agree with your proposal.";
                const pronResult = await ApiClient.evaluatePronunciation(base64, userText, false);

                this.recordLabel.setText('🔄 2/3 正在分析语法更优表达...');
                const sceneKey = GameState.selectedScene || 'restaurant';
                const grammarResult = await ApiClient.analyzeGrammarExpression(
                    userText,
                    "",
                    sceneKey,
                    "expert" // Boss 关统一按专家难度评测
                );

                this.recordLabel.setText('🔄 3/3 汇总评分中...');
                const calculatedPron = pronResult.overallScore || 70;
                const calculatedGrammar = grammarResult.grammarScore || 70;
                const calculatedExpr = grammarResult.expressionScore || 70;
                const calculatedFluency = calculatedPron;

                const scoreResult = await ApiClient.calculateFinalScore(
                    calculatedPron,
                    calculatedGrammar,
                    calculatedExpr,
                    calculatedFluency
                );

                finalPronunciation = scoreResult.pronunciation;
                finalGrammar = scoreResult.grammar;
                finalExpression = scoreResult.expression;
                finalFluency = scoreResult.fluency;
                score = scoreResult.total;
                
                wordScores = pronResult.words || [];
                grammarErrors = grammarResult.grammarErrors || [];
                
                const exprIssues = grammarResult.expressionIssues || [];
                expressionSuggestions = exprIssues.map(issue => 
                    `${issue.original} 建议修改为 ${issue.suggestion} (${issue.explanation})`
                );
                
                success = true;

            } catch (err) {
                console.error('[BossScene] 真实评分请求失败，降级为模拟评分:', err);
            }
        }

        if (!success) {
            // 降级模拟评分
            score = randomInt(70, 96);
            finalPronunciation = score - randomInt(1, 5);
            finalGrammar = score + randomInt(1, 4);
            finalExpression = score - randomInt(2, 6);
            finalFluency = score;
            
            // 模拟数据
            wordScores = this.recognizedTextContent ? this.recognizedTextContent.split(/\s+/).map(w => ({
                word: w.replace(/[.,!?;:]/g, ''),
                score: randomInt(70, 98),
                isCorrect: Math.random() > 0.15,
            })) : [];
            grammarErrors = finalGrammar < 85 ? [{ original: 'I wants...', corrected: 'I want...', explanation: '主谓不一致', severity: 'minor' }] : [];
            expressionSuggestions = ['I think 建议修改为 In my opinion (更正式的表达方式)'];
        }

        this.roundScores.push(score);

        // 累计各项分数值 (为Victory总结做准备)
        if (!this.accumulatedScores) {
            this.allWordScores = [];
            this.allGrammarErrors = [];
            this.allExpressionSuggestions = [];
            this.accumulatedScores = { pronunciation: 0, grammar: 0, expression: 0, fluency: 0, count: 0 };
        }

        this.accumulatedScores.pronunciation += finalPronunciation;
        this.accumulatedScores.grammar += finalGrammar;
        this.accumulatedScores.expression += finalExpression;
        this.accumulatedScores.fluency += finalFluency;
        this.accumulatedScores.count++;

        this.allWordScores.push(...wordScores);
        this.allGrammarErrors.push(...grammarErrors);
        this.allExpressionSuggestions.push(...expressionSuggestions);

        // 扣血判定
        let damage = 0;
        let rating = 'S';
        if (score >= 95) rating = 'S';
        else if (score >= 85) { rating = 'A'; damage = 2; }
        else if (score >= 70) { rating = 'B'; damage = 6; }
        else { rating = 'C'; damage = 12; }

        if (damage > 0) {
            GameState.takeDamage(damage);
            this.cameras.main.shake(150, 0.01);
            this._showFloatingText(`-${damage} HP`, '#ff2d2d');
        } else {
            this._showFloatingText('完美！(S)', '#4caf50');
        }

        // 更新血条/状态栏
        const p = GameState.player;
        this.hpText.setText(`❤️ HP: ${p.hp}/${p.maxHp}`);
        this.shieldText.setText(`🛡️ SHIELD: ${p.shield}`);

        // 添加到对话历史
        const userSpoken = this.recognizedTextContent || 'I understand, yes.';
        const roundText = `第${this.currentRound}轮: 你: "${userSpoken}" [${rating}级, ${score}分]`;
        this.dialogueHistory.push(roundText);
        this.historyText.setText(this.dialogueHistory.slice(-4).join('\n\n'));

        // 检查死亡
        if (!GameState.isAlive()) {
            if (this.ws) {
                try { this.ws.close(); } catch (e) {}
            }
            this.scene.start(CONSTANTS.SCENES.DEATH);
            return;
        }

        this.recordLabel.setText('评估完毕！');
        this.recordLabel.setColor('#4caf50');

        // 进入下一轮
        this.currentRound++;
        this.time.delayedCall(1500, () => {
            this._showCurrentRoundLine();
        });
    }

    _showFloatingText(text, color) {
        const cx = this.scale.width / 2;
        const txt = this.add.text(cx, 200, text, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '14px',
            color: color,
            stroke: '#000',
            strokeThickness: 2
        }).setOrigin(0.5);

        this.tweens.add({
            targets: txt,
            y: 160,
            alpha: 0,
            duration: 1200,
            onComplete: () => txt.destroy()
        });
    }

    _onVictory() {
        if (this.ws) {
            try { this.ws.close(); } catch (e) {}
        }
        GameState.completeNode(GameState.currentNodeId);
        GameState.runStats.bossesDefeated++;

        // 给予金币奖励与全额恢复
        GameState.heal(999);
        GameState.player.gold += this.act * 100;


        const count = (this.accumulatedScores && this.accumulatedScores.count) || 1;
        const avgPron = Math.round(((this.accumulatedScores && this.accumulatedScores.pronunciation) || 90) / count);
        const avgGrammar = Math.round(((this.accumulatedScores && this.accumulatedScores.grammar) || 90) / count);
        const avgExpr = Math.round(((this.accumulatedScores && this.accumulatedScores.expression) || 90) / count);
        const avgFluency = Math.round(((this.accumulatedScores && this.accumulatedScores.fluency) || 90) / count);
        
        const finalScore = Math.round(
            avgPron * CONSTANTS.SCORING.PRONUNCIATION_WEIGHT +
            avgGrammar * CONSTANTS.SCORING.GRAMMAR_WEIGHT +
            avgExpr * CONSTANTS.SCORING.EXPRESSION_WEIGHT +
            avgFluency * CONSTANTS.SCORING.FLUENCY_WEIGHT
        );

        let finalGrade = 'B';
        if (finalScore >= 95) finalGrade = 'S';
        else if (finalScore >= 85) finalGrade = 'A';
        else if (finalScore >= 70) finalGrade = 'B';
        else if (finalScore >= 50) finalGrade = 'C';
        else if (finalScore >= 30) finalGrade = 'D';
        else finalGrade = 'F';

        this.scene.start(CONSTANTS.SCENES.SUMMARY, {
            grade: finalGrade,
            score: finalScore,
            pronunciation: avgPron,
            grammar: avgGrammar,
            expression: avgExpr,
            fluency: avgFluency,
            damage: 0,
            wordScores: (this.allWordScores || []).slice(0, 12),
            grammarErrors: (this.allGrammarErrors || []).slice(0, 5),
            expressionSuggestions: (this.allExpressionSuggestions || []).slice(0, 5),
            isElite: false,
            act: this.act,
            isBoss: true
        });
    }

    _drawStarfield() {
        const g = this.add.graphics();
        for (let i = 0; i < 40; i++) {
            const x = Phaser.Math.Between(0, 960);
            const y = Phaser.Math.Between(0, 640);
            g.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.05, 0.2));
            g.fillRect(x, y, 1, 1);
        }
    }
}
