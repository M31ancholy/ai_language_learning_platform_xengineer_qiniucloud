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
import { BOSS_DIALOGUES } from '../data/challenges.js';
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
    }

    init(data) {
        this.act = data?.act || GameState.currentAct || 1;
        
        // 获取当前章节的 Boss 配置
        const actConfig = CONSTANTS.ACTS[this.act];
        this.bossId = this.act === 1 ? 'food_judge' : (this.act === 2 ? 'interviewer' : 'negotiator');
        
        // 查找 Boss 元数据
        const bossesList = MONSTERS.bosses || [];
        this.bossMeta = bossesList.find(b => b.id === this.bossId) || {
            name: actConfig?.boss || '大Boss',
            icon: '👹',
            desc: '守关首领'
        };

        this.bossRoundsData = BOSS_DIALOGUES[this.bossId] || [];
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

        const roundData = this.bossRoundsData[this.currentRound - 1];
        if (!roundData) return;

        // 显示 Boss 台词与任务说明
        this.bossLineText.setText(`Boss: "${roundData.bossLine}"`);
        this.promptText.setText(`任务: ${roundData.prompt}\n提示: ${roundData.hints?.join(', ') || roundData.hints}`);

        // 重置录音倒计时
        this.timeRemaining = 60;
        this.timerText.setText(`⏱️ ${formatTime(this.timeRemaining)}`).setColor('#51e5ff');
        this.recognizedText.setText('');
    }

    _startRecording(btn, label) {
        this.isRecording = true;
        btn.setTexture('btn_stop');
        label.setText('🔴 录音中... 再次点击提交');
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

        // 开始 Web Speech API 模拟/真实
        this._startSpeechRecognition();
    }

    _stopRecording(btn, label) {
        this.isRecording = false;
        btn.setTexture('btn_record');
        label.setText('正在智能评分...');
        label.setColor('#4caf50');

        if (this.timerEvent) this.timerEvent.remove();
        if (this.waveformTween) this.waveformTween.remove();
        this.waveformBars.forEach(b => { b.setSize(3, 4); b.setAlpha(0.3); });

        this._stopSpeechRecognition();

        // 评分延迟效果
        this.recordBtn.disableInteractive();
        this.time.delayedCall(1500, () => {
            this.recordBtn.setInteractive();
            this._evaluateRound();
        });
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

    _evaluateRound() {
        const roundData = this.bossRoundsData[this.currentRound - 1];
        if (!roundData) return;

        // 基础随机分
        const score = randomInt(70, 98);
        this.roundScores.push(score);

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
        const roundText = `第${this.currentRound}轮: 你: "${this.recognizedTextContent || 'I understand, yes.'}" [${rating}级, ${score}分]`;
        this.dialogueHistory.push(roundText);
        this.historyText.setText(this.dialogueHistory.slice(-4).join('\n\n'));

        // 检查死亡
        if (!GameState.isAlive()) {
            this.scene.start(CONSTANTS.SCENES.DEATH);
            return;
        }

        // 进入下一轮
        this.currentRound++;
        this.time.delayedCall(1000, () => {
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
        GameState.completeNode(GameState.currentNodeId);
        GameState.runStats.bossesDefeated++;

        // 给予金币奖励与全额恢复
        GameState.heal(999);
        GameState.player.gold += this.act * 100;

        this.scene.start(CONSTANTS.SCENES.SUMMARY, {
            grade: 'S',
            score: Math.round(this.roundScores.reduce((a,b)=>a+b, 0) / this.roundScores.length),
            pronunciation: 95,
            grammar: 92,
            expression: 90,
            fluency: 94,
            damage: 0,
            wordScores: [],
            grammarErrors: [],
            expressionSuggestions: [],
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
