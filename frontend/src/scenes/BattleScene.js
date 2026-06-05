/**
 * 语塔攀登 - 战斗场景
 * 朗读关卡和场景出题关卡的战斗界面
 * 仿杀戮尖塔的战斗布局
 */

import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants.js';
import { GameState } from '../game/GameState.js';
import { EventBus, EVENTS } from '../utils/EventBus.js';
import { randomInt, randomChoice, formatTime, clamp } from '../utils/Helpers.js';

export class BattleScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.BATTLE });
        this.isRecording = false;
        this.timeRemaining = 60;
        this.timerEvent = null;
        this.challengeType = 'reading'; // 'reading' 或 'scene'
    }

    init(data) {
        this.nodeData = data?.node;
        this.act = data?.act || 1;
        this.isElite = data?.isElite || false;
        this.difficulty = this.nodeData?.difficulty || 'rookie';
    }

    create() {
        const { width, height } = this.scale;

        // 随机选择关卡类型
        this.challengeType = Math.random() > 0.5 ? 'reading' : 'scene';

        // 获取挑战内容
        this.challengeContent = this._getChallenge();

        // ========== 背景 ==========
        this.add.rectangle(width / 2, height / 2, width, height, CONSTANTS.COLORS.BG_DARK);
        this._drawStarfield();

        // ========== 顶部信息栏 ==========
        this._createTopBar(width);

        // ========== 怪物区域 ==========
        this._createMonsterArea(width);

        // ========== 挑战内容区域 ==========
        this._createChallengeArea(width);

        // ========== 录音控制区域 ==========
        this._createRecordingArea(width, height);

        // ========== 底部状态栏 ==========
        this._createBottomBar(width, height);

        // ========== 精英关特效 ==========
        if (this.isElite) {
            this._createEliteOverlay(width, height);
        }
    }

    // ========== 顶部信息栏 ==========
    _createTopBar(width) {
        const typeName = this.challengeType === 'reading' ? '朗读挑战' : '场景挑战';
        const diffInfo = CONSTANTS.DIFFICULTY[this.difficulty.toUpperCase()] || CONSTANTS.DIFFICULTY.ROOKIE;
        const eliteTag = this.isElite ? ' [精英]' : '';

        this.add.rectangle(width / 2, 18, width, 36, 0x000000, 0.7).setDepth(10);

        this.add.text(20, 10, `${this.isElite ? '💀' : '⚔️'} ${typeName} · ${diffInfo.name}难度${eliteTag}`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#ff6b35',
        }).setDepth(11);

        const floor = GameState.currentRow >= 0 ? GameState.currentRow + 1 : 1;
        this.add.text(width - 20, 10, `层数: ${floor}/${CONSTANTS.MAP.ROWS}`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#51e5ff',
        }).setOrigin(1, 0).setDepth(11);
    }

    // ========== 怪物区域 ==========
    _createMonsterArea(width) {
        const cx = width / 2;

        // 怪物容器
        const monsterContainer = this.add.container(cx, 130);

        // 选择怪物纹理
        let textureName = 'monster_rookie';
        if (this.difficulty === 'expert') textureName = 'monster_expert';
        if (this.difficulty === 'hell') textureName = 'monster_hell';

        // 怪物精灵
        const monster = this.add.image(0, 0, textureName).setScale(2.5);
        monsterContainer.add(monster);

        // 怪物名称
        const monsterName = this._getMonsterName();
        const nameText = this.add.text(0, -55, monsterName, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#ffffff',
            stroke: '#000',
            strokeThickness: 2,
        }).setOrigin(0.5);
        monsterContainer.add(nameText);

        // 怪物HP条（纯视觉，表示关卡进度）
        const hpBg = this.add.rectangle(0, 50, 150, 12, 0x441111);
        hpBg.setStrokeStyle(1, 0x666666);
        monsterContainer.add(hpBg);

        this.monsterHpFill = this.add.rectangle(-73, 50, 146, 8, 0xff2d2d).setOrigin(0, 0.5);
        monsterContainer.add(this.monsterHpFill);

        const hpLabel = this.add.text(0, 50, '100%', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '7px',
            color: '#ffffff',
        }).setOrigin(0.5);
        monsterContainer.add(hpLabel);
        this.monsterHpLabel = hpLabel;

        // 怪物特殊能力
        if (this.isElite) {
            const abilityText = this.add.text(0, 68, '⚠️ 特殊: 语法错误扣血翻倍', {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '7px',
                color: '#ff9800',
            }).setOrigin(0.5);
            monsterContainer.add(abilityText);
        }

        // 怪物空闲动画
        this.tweens.add({
            targets: monster,
            y: -5,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        this.monsterSprite = monster;
    }

    // ========== 挑战内容区域 ==========
    _createChallengeArea(width) {
        const cx = width / 2;

        // 内容面板
        const panel = this.add.rectangle(cx, 280, width - 80, 120, CONSTANTS.COLORS.BG_PANEL, 0.9);
        panel.setStrokeStyle(2, CONSTANTS.COLORS.PRIMARY);

        if (this.challengeType === 'reading') {
            // 朗读模式标题
            this.add.text(60, 230, '📜 朗读内容：', {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '9px',
                color: '#51e5ff',
            });

            // 英文内容
            this.challengeText = this.add.text(cx, 275, this.challengeContent.text, {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '10px',
                color: '#ffffff',
                lineSpacing: 10,
                wordWrap: { width: width - 120 },
                align: 'center',
            }).setOrigin(0.5);

            // 提示
            if (this.challengeContent.tips && this.challengeContent.tips.length > 0) {
                this.add.text(60, 320, `💡 提示: ${this.challengeContent.tips[0]}`, {
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: '7px',
                    color: '#888888',
                });
            }
        } else {
            // 场景出题模式
            this.add.text(60, 225, `🎭 场景: ${this.challengeContent.scene || '日常对话'}`, {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '9px',
                color: '#51e5ff',
            });

            this.add.text(60, 245, '📋 任务说明:', {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '8px',
                color: '#ff6b35',
            });

            this.challengeText = this.add.text(cx, 285, this.challengeContent.prompt || '请用英语回答以下问题...', {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '9px',
                color: '#ffffff',
                lineSpacing: 8,
                wordWrap: { width: width - 120 },
                align: 'center',
            }).setOrigin(0.5);

            // 评测重点
            this.add.text(60, 325, '评测重点: 语法 · 表达 · 发音', {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '7px',
                color: '#888888',
            });
        }
    }

    // ========== 录音控制区域 ==========
    _createRecordingArea(width, height) {
        const cx = width / 2;
        const recordY = 420;

        // 倒计时
        const diffInfo = CONSTANTS.DIFFICULTY[this.difficulty.toUpperCase()] || CONSTANTS.DIFFICULTY.ROOKIE;
        this.timeRemaining = this.challengeContent.timeLimit || 60;
        if (diffInfo.name === '地狱') this.timeRemaining = Math.floor(this.timeRemaining * 0.6);

        this.timerText = this.add.text(cx, recordY - 40, `⏱️ ${formatTime(this.timeRemaining)}`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#51e5ff',
        }).setOrigin(0.5);

        // 录音按钮
        const recordBtn = this.add.image(cx, recordY, 'btn_record').setScale(1.4);
        recordBtn.setInteractive({ useHandCursor: true });

        const recordLabel = this.add.text(cx, recordY + 40, '点击开始录音', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '9px',
            color: '#cccccc',
        }).setOrigin(0.5);

        // 波形显示
        this.waveformBars = [];
        const barCount = 30;
        for (let i = 0; i < barCount; i++) {
            const bar = this.add.rectangle(
                cx - (barCount * 4) / 2 + i * 4 + 2,
                recordY + 65,
                3, 4,
                CONSTANTS.COLORS.ACCENT
            );
            bar.setAlpha(0.3);
            this.waveformBars.push(bar);
        }

        // 识别文本显示区域
        this.recognizedText = this.add.text(cx, recordY + 90, '', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: '#4caf50',
            wordWrap: { width: width - 120 },
            align: 'center',
        }).setOrigin(0.5);

        // 录音按钮交互
        recordBtn.on('pointerup', () => {
            if (!this.isRecording) {
                this._startRecording(recordBtn, recordLabel);
            } else {
                this._stopRecording(recordBtn, recordLabel);
            }
        });

        recordBtn.on('pointerover', () => recordBtn.setScale(1.6));
        recordBtn.on('pointerout', () => recordBtn.setScale(1.4));

        this.recordBtn = recordBtn;
        this.recordLabel = recordLabel;
    }

    // ========== 底部状态栏 ==========
    _createBottomBar(width, height) {
        const barY = height - 30;

        this.add.rectangle(width / 2, height - 25, width, 50, 0x000000, 0.8).setDepth(10);

        const p = GameState.player;

        // HP
        this.hpText = this.add.text(20, barY - 8, `❤️ ${p.hp}/${p.maxHp}`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '9px',
            color: '#ff2d2d',
        }).setDepth(11);

        // 护盾
        this.shieldText = this.add.text(150, barY - 8, p.shield > 0 ? `🛡️ ${p.shield}` : '', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '9px',
            color: '#4488ff',
        }).setDepth(11);

        // 金币
        this.goldText = this.add.text(240, barY - 8, `💰 ${p.gold}`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '9px',
            color: '#ffd700',
        }).setDepth(11);

        // 能量
        this.energyText = this.add.text(360, barY - 8, `⚡ ${p.energy}/${p.maxEnergy}`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '9px',
            color: '#51e5ff',
        }).setDepth(11);

        // 背包容器
        this.inventoryContainer = this.add.container(0, 0).setDepth(11);
        this._createInventoryBar(width, barY);
    }

    _createInventoryBar(width, barY) {
        this.inventoryContainer.removeAll(true);
        const startX = 480;
        const items = GameState.inventory;

        for (let i = 0; i < CONSTANTS.PLAYER.INVENTORY_SIZE; i++) {
            const x = startX + i * 40;
            const slot = this.add.rectangle(x, barY - 2, 32, 28, CONSTANTS.COLORS.BG_PANEL);
            slot.setStrokeStyle(1, 0x555555);
            this.inventoryContainer.add(slot);

            if (items[i]) {
                const item = items[i];
                const icon = this.add.text(x, barY - 2, item.icon || '📦', {
                    fontSize: '14px',
                }).setOrigin(0.5);
                this.inventoryContainer.add(icon);

                // 可交互
                slot.setInteractive({ useHandCursor: true });
                slot.on('pointerup', () => {
                    this._useItem(item, barY);
                });
                slot.on('pointerover', () => slot.setStrokeStyle(2, CONSTANTS.COLORS.PRIMARY));
                slot.on('pointerout', () => slot.setStrokeStyle(1, 0x555555));
            }
        }
    }

    // ========== 录音控制 ==========
    _startRecording(btn, label) {
        this.isRecording = true;
        btn.setTexture('btn_stop');
        label.setText('🔴 正在录音... 再次点击停止');
        label.setColor('#ff2d2d');

        // 开始倒计时
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            repeat: this.timeRemaining - 1,
            callback: () => {
                this.timeRemaining--;
                this.timerText.setText(`⏱️ ${formatTime(this.timeRemaining)}`);

                if (this.timeRemaining <= 10) {
                    this.timerText.setColor('#ff2d2d');
                }

                if (this.timeRemaining <= 0) {
                    this._stopRecording(btn, label);
                }
            }
        });

        // 模拟波形动画
        this._startWaveformAnimation();

        // 尝试启动真实录音
        this._tryStartRealRecording();
    }

    _stopRecording(btn, label) {
        this.isRecording = false;
        btn.setTexture('btn_record');
        label.setText('录音完成！评测中...');
        label.setColor('#4caf50');

        // 停止倒计时
        if (this.timerEvent) {
            this.timerEvent.remove();
        }

        // 停止波形
        this._stopWaveformAnimation();

        // 停止真实录音
        this._tryStopRealRecording();

        // 评测（模拟延迟）
        this.recordBtn.disableInteractive();
        this.time.delayedCall(1500, () => {
            this._evaluatePerformance();
        });
    }

    // ========== 波形动画 ==========
    _startWaveformAnimation() {
        this.waveformTween = this.time.addEvent({
            delay: 50,
            repeat: -1,
            callback: () => {
                for (const bar of this.waveformBars) {
                    const h = randomInt(4, 30);
                    bar.setSize(3, h);
                    bar.setAlpha(0.5 + Math.random() * 0.5);
                }
            }
        });
    }

    _stopWaveformAnimation() {
        if (this.waveformTween) {
            this.waveformTween.remove();
        }
        for (const bar of this.waveformBars) {
            bar.setSize(3, 4);
            bar.setAlpha(0.3);
        }
    }

    // ========== 真实录音（Web API） ==========
    async _tryStartRealRecording() {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.log('浏览器不支持录音，使用模拟模式');
                return;
            }

            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(this.mediaStream);
            this.audioChunks = [];

            this.mediaRecorder.ondataavailable = (e) => {
                this.audioChunks.push(e.data);
            };

            this.mediaRecorder.start();
            console.log('录音已开始');

            // 尝试启动语音识别
            this._tryStartSpeechRecognition();
        } catch (e) {
            console.log('录音启动失败，使用模拟模式:', e.message);
        }
    }

    _tryStopRealRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
            this.mediaStream?.getTracks().forEach(t => t.stop());
        }
        if (this.recognition) {
            try { this.recognition.stop(); } catch (e) { /* ignore */ }
        }
    }

    _tryStartSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'en-US';
        this.recognition.continuous = true;
        this.recognition.interimResults = true;

        this.recognition.onresult = (event) => {
            let finalText = '';
            let interimText = '';

            for (let i = 0; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalText += event.results[i][0].transcript;
                } else {
                    interimText += event.results[i][0].transcript;
                }
            }

            this.recognizedTextContent = finalText || interimText;
            if (this.recognizedText) {
                this.recognizedText.setText(`"${this.recognizedTextContent}"`);
            }
        };

        this.recognition.onerror = (e) => {
            console.log('语音识别错误:', e.error);
        };

        try {
            this.recognition.start();
        } catch (e) {
            console.log('语音识别启动失败:', e);
        }
    }

    // ========== 评测 ==========
    _evaluatePerformance() {
        // 模拟评分（基于难度生成合理的随机分数）
        const baseRange = {
            rookie: { min: 55, max: 95 },
            expert: { min: 40, max: 88 },
            hell: { min: 25, max: 80 },
        };

        const range = baseRange[this.difficulty] || baseRange.rookie;

        // 如果有真实识别结果，根据文本匹配度调整
        let textMatchBonus = 0;
        if (this.recognizedTextContent && this.challengeType === 'reading') {
            const ref = this.challengeContent.text.toLowerCase();
            const rec = this.recognizedTextContent.toLowerCase();
            // 简单的词汇匹配率
            const refWords = ref.split(/\s+/);
            const recWords = rec.split(/\s+/);
            const matched = refWords.filter(w => recWords.includes(w)).length;
            textMatchBonus = Math.round((matched / refWords.length) * 20);
        }

        const pronunciation = clamp(randomInt(range.min, range.max) + textMatchBonus, 0, 100);
        const grammar = clamp(randomInt(range.min + 5, range.max + 5), 0, 100);
        const expression = clamp(randomInt(range.min - 5, range.max), 0, 100);
        const fluency = clamp(randomInt(range.min, range.max + 3), 0, 100);

        // 应用技能加成
        const pBonus = GameState.getSkillBonus('pronunciation');
        const gBonus = GameState.getSkillBonus('grammar');
        const eBonus = GameState.getSkillBonus('expression');
        const fBonus = GameState.getSkillBonus('fluency');

        const finalPronunciation = clamp(pronunciation + pBonus, 0, 100);
        const finalGrammar = clamp(grammar + gBonus, 0, 100);
        const finalExpression = clamp(expression + eBonus, 0, 100);
        const finalFluency = clamp(fluency + fBonus, 0, 100);

        // 综合评分
        const score = Math.round(
            finalPronunciation * CONSTANTS.SCORING.PRONUNCIATION_WEIGHT +
            finalGrammar * CONSTANTS.SCORING.GRAMMAR_WEIGHT +
            finalExpression * CONSTANTS.SCORING.EXPRESSION_WEIGHT +
            finalFluency * CONSTANTS.SCORING.FLUENCY_WEIGHT
        );

        // 评级
        const grade = this._getGrade(score);

        // 扣血计算
        const diffCoeff = CONSTANTS.DIFFICULTY[this.difficulty.toUpperCase()]?.coefficient || 0.3;
        const typeCoeff = this.isElite ? CONSTANTS.BATTLE_TYPE_COEFFICIENT.elite : CONSTANTS.BATTLE_TYPE_COEFFICIENT.monster;
        const baseDamage = Math.round((100 - score) * diffCoeff * typeCoeff);
        const damage = Math.max(0, baseDamage);

        // 应用伤害
        if (damage > 0) {
            GameState.takeDamage(damage);
        }

        // 记录战斗结果
        GameState.recordBattleResult(grade.label, score);

        // 怪物死亡动画
        this._playMonsterDeathAnimation();

        // 生成词级评分（模拟）
        const wordScores = this._generateWordScores();
        const grammarErrors = this._generateGrammarErrors(finalGrammar);
        const expressionSuggestions = this._generateExpressionSuggestions();

        // 完成节点
        GameState.completeNode(this.nodeData.id);

        if (this.isElite) GameState.runStats.elitesDefeated++;
        else GameState.runStats.monstersDefeated++;

        // 延迟跳转到总结
        this.time.delayedCall(1500, () => {
            if (!GameState.isAlive()) {
                this.scene.start(CONSTANTS.SCENES.DEATH);
            } else {
                this.scene.start(CONSTANTS.SCENES.SUMMARY, {
                    grade: grade.label,
                    score,
                    pronunciation: finalPronunciation,
                    grammar: finalGrammar,
                    expression: finalExpression,
                    fluency: finalFluency,
                    damage,
                    wordScores,
                    grammarErrors,
                    expressionSuggestions,
                    challengeType: this.challengeType,
                    isElite: this.isElite,
                    act: this.act,
                });
            }
        });
    }

    _getGrade(score) {
        const grades = CONSTANTS.GRADES;
        if (score >= grades.S.min) return grades.S;
        if (score >= grades.A.min) return grades.A;
        if (score >= grades.B.min) return grades.B;
        if (score >= grades.C.min) return grades.C;
        if (score >= grades.D.min) return grades.D;
        return grades.F;
    }

    _playMonsterDeathAnimation() {
        if (!this.monsterSprite) return;

        // 怪物受击闪烁
        this.tweens.add({
            targets: this.monsterSprite,
            alpha: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            angle: 15,
            duration: 800,
            ease: 'Power2',
        });

        // 怪物HP条归零
        if (this.monsterHpFill) {
            this.tweens.add({
                targets: this.monsterHpFill,
                width: 0,
                duration: 600,
            });
        }
        if (this.monsterHpLabel) {
            this.monsterHpLabel.setText('0%');
        }
    }

    // ========== 道具使用 ==========
    _useItem(item, barY) {
        if (!item.usableInBattle) {
            this._showFloatingText('该道具只能在地图中选用！', '#ff2d2d');
            return;
        }

        if (GameState.player.energy <= 0) {
            this._showFloatingText('能量不足！', '#ff2d2d');
            return;
        }

        const success = GameState.useItem(item.instanceId);
        if (success) {
            GameState.player.energy--;
            this._showFloatingText(`使用了 ${item.name}!`, '#4caf50');

            // 实时刷新 UI
            const p = GameState.player;
            this.hpText.setText(`❤️ ${p.hp}/${p.maxHp}`);
            this.shieldText.setText(p.shield > 0 ? `🛡️ ${p.shield}` : '');
            this.goldText.setText(`💰 ${p.gold}`);
            this.energyText.setText(`⚡ ${p.energy}/${p.maxEnergy}`);

            // 重新绘制背包道具
            const { width } = this.scale;
            this._createInventoryBar(width, barY);
        }
    }

    _showFloatingText(text, color) {
        const { width } = this.scale;
        const floatText = this.add.text(width / 2, 200, text, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: color,
            stroke: '#000',
            strokeThickness: 2,
        }).setOrigin(0.5).setDepth(50);

        this.tweens.add({
            targets: floatText,
            y: 160,
            alpha: 0,
            duration: 1200,
            onComplete: () => floatText.destroy(),
        });
    }

    // ========== 精英关特效 ==========
    _createEliteOverlay(width, height) {
        // 红色闪烁边框
        const border = this.add.rectangle(width / 2, height / 2, width - 4, height - 4);
        border.setStrokeStyle(3, 0xff2d2d, 0.5);
        border.setFillStyle(0x000000, 0);

        this.tweens.add({
            targets: border,
            alpha: 0.2,
            duration: 1500,
            yoyo: true,
            repeat: -1,
        });
    }

    // ========== 获取挑战内容 ==========
    _getChallenge() {
        // 默认内容（如果数据文件还没加载）
        const defaultReadings = {
            rookie: [
                { text: 'Hello, my name is Tom. I would like a cup of coffee, please. Thank you very much.', topic: '自我介绍/点餐', timeLimit: 60, passThreshold: 60, tips: ['注意"would"的发音', '"please"语调上扬'] },
                { text: 'Excuse me, could you tell me where the nearest subway station is? I need to get to downtown.', topic: '问路', timeLimit: 60, tips: ['注意"excuse"的重音'] },
                { text: 'I have a reservation under the name Smith for two people. We would prefer a table by the window.', topic: '酒店/餐厅预订', timeLimit: 60, tips: ['注意"reservation"的发音'] },
            ],
            expert: [
                { text: 'I would like to schedule a meeting with the marketing department to discuss the quarterly performance review and budget allocation.', topic: '职场沟通', timeLimit: 45, passThreshold: 75, tips: ['注意"quarterly"的发音'] },
                { text: 'Could you please provide me with a detailed breakdown of the shipping costs and estimated delivery timeline for this order?', topic: '商务询价', timeLimit: 45, tips: ['注意连贯性'] },
            ],
            hell: [
                { text: 'The juxtaposition of contemporary architectural methodologies with the quintessential paradigms of neoclassical design evokes a profound epistemological discourse.', topic: '学术表达', timeLimit: 30, passThreshold: 85, tips: ['注意每个长词的重音位置'] },
                { text: 'In light of the unprecedented challenges posed by the current economic volatility, our organization has implemented a comprehensive restructuring initiative.', topic: '商务报告', timeLimit: 30, tips: ['保持语速均匀'] },
            ],
        };

        const defaultScenes = {
            rookie: [
                { scene: '咖啡厅', prompt: '服务员问你想喝什么，请用英语回答。\n提示：可以点一杯咖啡或茶。', context: 'At a coffee shop', timeLimit: 60, hints: ['I would like...', 'Can I have...'] },
                { scene: '超市', prompt: '你在超市找不到牛奶，请用英语问店员牛奶在哪里。', context: 'At a supermarket', timeLimit: 60, hints: ['Excuse me, where can I find...'] },
            ],
            expert: [
                { scene: '酒店前台', prompt: '你预订的房间被超卖了。请和前台沟通，要求升级房型或获得补偿。', context: 'Hotel front desk complaint', timeLimit: 45, hints: ['I had a reservation...', 'Is there any possibility...'] },
                { scene: '公司会议', prompt: '请用英语简要介绍你上个月的工作进展和下个月的计划。', context: 'Monthly meeting update', timeLimit: 45, hints: ['Last month I worked on...', 'For next month, I plan to...'] },
            ],
            hell: [
                { scene: '产品发布会', prompt: '请用英语即兴介绍一款新手机的三个核心功能，并说服观众为什么要购买。', context: 'Product launch presentation', timeLimit: 30, hints: [] },
                { scene: '辩论场', prompt: '有人说AI将取代所有工作。请用英语反驳这个观点，至少给出两个理由。', context: 'Debate', timeLimit: 30, hints: [] },
            ],
        };

        try {
            // 尝试从数据模块获取（如果已加载）
            const pool = this.challengeType === 'reading' ? defaultReadings : defaultScenes;
            const diffPool = pool[this.difficulty] || pool.rookie;
            return randomChoice(diffPool);
        } catch (e) {
            return this.challengeType === 'reading'
                ? defaultReadings.rookie[0]
                : defaultScenes.rookie[0];
        }
    }

    _getMonsterName() {
        const names = {
            rookie: ['发音小鬼', '语法蝙蝠', '单词蜘蛛', '停顿幽灵'],
            expert: ['发音恶魔', '语法骑士', '重音守卫', '时态魔法师'],
            hell: ['发音地狱使者', '语法审判官', '表达死神', '流畅度破坏者'],
        };
        const pool = names[this.difficulty] || names.rookie;
        return randomChoice(pool) + (this.isElite ? ' [精英]' : '');
    }

    _generateWordScores() {
        if (!this.challengeContent.text) return [];
        const words = this.challengeContent.text.split(/\s+/).slice(0, 15);
        return words.map(word => ({
            word: word.replace(/[.,!?;:]/g, ''),
            score: randomInt(60, 100),
            isCorrect: Math.random() > 0.25,
        }));
    }

    _generateGrammarErrors(grammarScore) {
        if (grammarScore >= 90) return [];
        const errors = [
            { text: 'I want schedule...', correction: "I'd like to schedule...", explanation: '建议使用 "would like to" 更礼貌' },
            { text: 'He don\'t know...', correction: "He doesn't know...", explanation: '第三人称单数用 "doesn\'t"' },
            { text: 'I have went...', correction: 'I have gone...', explanation: '"go"的过去分词是 "gone"' },
        ];
        const count = grammarScore < 50 ? 3 : grammarScore < 70 ? 2 : 1;
        return errors.slice(0, count);
    }

    _generateExpressionSuggestions() {
        return [
            { original: 'very good', suggestion: 'excellent / outstanding', reason: '使用更高级的形容词' },
            { original: 'I think', suggestion: 'In my opinion / I believe', reason: '更正式的表达方式' },
        ];
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
