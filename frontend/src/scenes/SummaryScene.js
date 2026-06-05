/**
 * 语塔攀登 - 课后总结场景
 * 显示评级、四维评分、发音详情、语法纠错等
 */

import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants.js';
import { EventBus, EVENTS } from '../utils/EventBus.js';
import { GameState } from '../game/GameState.js';
import { createPixelText } from '../utils/PixelText.js';

export class SummaryScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.SUMMARY });
    }

    /**
     * @param {object} data
     * data: { grade, score, pronunciation, grammar, expression, fluency,
     *         wordScores, grammarErrors, expressionSuggestions, damage }
     */
    init(data) {
        this.summaryData = {
            grade: data.grade || 'B',
            score: data.score || 70,
            pronunciation: data.pronunciation || 70,
            grammar: data.grammar || 70,
            expression: data.expression || 70,
            fluency: data.fluency || 70,
            wordScores: data.wordScores || [],
            grammarErrors: data.grammarErrors || [],
            expressionSuggestions: data.expressionSuggestions || [],
            damage: data.damage || 0,
        };

        // 记录战斗结果
        GameState.recordBattleResult(this.summaryData.grade, this.summaryData.score);
    }

    create() {
        const { width, height } = this.scale;
        const C = CONSTANTS.COLORS;

        this.cameras.main.setBackgroundColor(C.BG_DARK);

        // 标题
        createPixelText(this, width / 2, 30, '📊 关卡总结', 'title', { fontSize: '18px' });

        // 评级大字
        const gradeInfo = CONSTANTS.GRADES[this.summaryData.grade] || CONSTANTS.GRADES.B;
        const gradeText = createPixelText(this, width / 2, 80, this.summaryData.grade, 'grade', {
            color: '#' + gradeInfo.color.toString(16).padStart(6, '0'),
        });

        // 评级入场动画
        gradeText.setScale(0);
        this.tweens.add({
            targets: gradeText,
            scaleX: 1,
            scaleY: 1,
            duration: 500,
            ease: 'Back.easeOut',
        });

        // 总分
        createPixelText(this, width / 2, 115, `总分: ${this.summaryData.score}/100`, 'value');

        // 滚动内容区域（用容器实现简易滚动）
        this.scrollY = 0;
        this.contentContainer = this.add.container(0, 0);

        // 四维评分条
        this._drawScoreBars(width);

        // 发音详情
        this._drawWordScores(width);

        // 语法纠错
        this._drawGrammarErrors(width);

        // 表达建议
        this._drawExpressionSuggestions(width);

        // 扣血显示
        this._drawDamageInfo(width);

        // 继续按钮
        this._createContinueButton(width, height);

        // 简易滚动支持
        this._setupScroll(height);
    }

    // ========== 四维评分条 ==========

    _drawScoreBars(sceneW) {
        const startY = 145;
        const barW = 300;
        const barH = 16;
        const labelW = 80;
        const cx = sceneW / 2;

        const dimensions = [
            { name: '🗣️ 发音', value: this.summaryData.pronunciation, color: CONSTANTS.COLORS.ACCENT },
            { name: '📝 语法', value: this.summaryData.grammar, color: CONSTANTS.COLORS.SUCCESS },
            { name: '💬 表达', value: this.summaryData.expression, color: CONSTANTS.COLORS.GOLD },
            { name: '🌊 流畅', value: this.summaryData.fluency, color: CONSTANTS.COLORS.PURPLE },
        ];

        dimensions.forEach((dim, i) => {
            const y = startY + i * 32;

            // 标签
            createPixelText(this, cx - barW / 2 - 10, y, dim.name, 'small', {
                fontSize: '8px',
            }).setOrigin(1, 0.5);

            // 进度条背景
            const g = this.add.graphics();
            this.contentContainer.add(g);

            g.fillStyle(CONSTANTS.COLORS.BG_PANEL, 1);
            g.fillRoundedRect(cx - barW / 2, y - barH / 2, barW, barH, 4);

            // 进度条填充（带动画）
            const fillWidth = (dim.value / 100) * barW;
            const fill = this.add.graphics();
            this.contentContainer.add(fill);

            // 动画：从0填充到目标值
            this.tweens.addCounter({
                from: 0,
                to: fillWidth,
                duration: 800,
                delay: i * 150,
                ease: 'Power2',
                onUpdate: (tween) => {
                    fill.clear();
                    fill.fillStyle(dim.color, 0.9);
                    fill.fillRoundedRect(cx - barW / 2, y - barH / 2, tween.getValue(), barH, 4);
                },
            });

            // 数值
            createPixelText(this, cx + barW / 2 + 30, y, `${dim.value}`, 'small', {
                color: '#ffffff',
                fontSize: '9px',
            });
        });
    }

    // ========== 发音详情 ==========

    _drawWordScores(sceneW) {
        const startY = 285;
        const words = this.summaryData.wordScores;
        if (words.length === 0) return;

        createPixelText(this, sceneW / 2, startY, '— 发音详情 —', 'small', {
            color: '#51e5ff',
            fontSize: '9px',
        });

        const cx = sceneW / 2;
        words.forEach((word, i) => {
            if (i >= 8) return; // 最多显示8个
            const y = startY + 22 + i * 18;
            const col = i < 4 ? -1 : 1;
            const row = i % 4;
            const wx = cx + col * 170;
            const wy = startY + 22 + row * 18;

            let icon, color;
            if (word.score >= 90) {
                icon = '✅'; color = '#4caf50';
            } else if (word.score >= 60) {
                icon = '⚠️'; color = '#ff9800';
            } else {
                icon = '❌'; color = '#ff2d2d';
            }

            const text = createPixelText(this, wx, wy,
                `${icon} ${word.word}: ${word.score}分`, 'small', {
                    color,
                    fontSize: '7px',
                });
            this.contentContainer.add(text);
        });
    }

    // ========== 语法纠错 ==========

    _drawGrammarErrors(sceneW) {
        const errors = this.summaryData.grammarErrors;
        if (errors.length === 0) return;

        const startY = this.summaryData.wordScores.length > 0 ? 380 : 285;

        createPixelText(this, sceneW / 2, startY, '— 语法纠错 —', 'small', {
            color: '#ff9800',
            fontSize: '9px',
        });

        errors.forEach((err, i) => {
            if (i >= 3) return; // 最多显示3条
            const y = startY + 22 + i * 36;

            // 错误内容
            const errText = createPixelText(this, sceneW / 2, y,
                `❌ ${err.original || err}`, 'small', {
                    color: '#ff2d2d',
                    fontSize: '7px',
                    wordWrap: { width: sceneW - 100 },
                });
            this.contentContainer.add(errText);

            // 修正建议
            if (err.correction) {
                const corrText = createPixelText(this, sceneW / 2, y + 16,
                    `✅ ${err.correction}`, 'small', {
                        color: '#4caf50',
                        fontSize: '7px',
                        wordWrap: { width: sceneW - 100 },
                    });
                this.contentContainer.add(corrText);
            }
        });
    }

    // ========== 表达建议 ==========

    _drawExpressionSuggestions(sceneW) {
        const suggestions = this.summaryData.expressionSuggestions;
        if (suggestions.length === 0) return;

        const startY = 460;
        createPixelText(this, sceneW / 2, startY, '— 表达建议 —', 'small', {
            color: '#ffd700',
            fontSize: '9px',
        });

        suggestions.forEach((sug, i) => {
            if (i >= 2) return;
            const text = createPixelText(this, sceneW / 2, startY + 20 + i * 20,
                `💡 ${sug}`, 'small', {
                    color: '#cccccc',
                    fontSize: '7px',
                    wordWrap: { width: sceneW - 100 },
                });
            this.contentContainer.add(text);
        });
    }

    // ========== 扣血显示 ==========

    _drawDamageInfo(sceneW) {
        if (this.summaryData.damage <= 0) return;

        const y = 520;
        const damageText = createPixelText(this, sceneW / 2, y,
            `💔 本次扣血: -${this.summaryData.damage} HP`, 'damage', {
                fontSize: '14px',
            });

        this.tweens.add({
            targets: damageText,
            alpha: 0.5,
            yoyo: true,
            repeat: 2,
            duration: 300,
        });
    }

    // ========== 简易滚动 ==========

    _setupScroll(sceneH) {
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            this.scrollY -= deltaY * 0.5;
            this.scrollY = Phaser.Math.Clamp(this.scrollY, -300, 0);
            this.contentContainer.y = this.scrollY;
        });
    }

    // ========== 继续按钮 ==========

    _createContinueButton(w, h) {
        const btnW = 200;
        const btnH = 40;
        const cx = w / 2;
        const cy = h - 40;

        // 按钮背景面板（固定在底部）
        const panel = this.add.graphics();
        panel.setDepth(10);
        panel.fillStyle(CONSTANTS.COLORS.BG_DARK, 0.95);
        panel.fillRect(0, h - 70, w, 70);

        const bg = this.add.graphics();
        bg.setDepth(11);
        bg.fillStyle(CONSTANTS.COLORS.PRIMARY, 1);
        bg.fillRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 8);

        const label = createPixelText(this, cx, cy, '继续 →', 'button');
        label.setDepth(12);

        const hit = this.add.rectangle(cx, cy, btnW, btnH, 0xffffff, 0)
            .setInteractive({ useHandCursor: true })
            .setDepth(13);

        hit.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(CONSTANTS.COLORS.WARNING, 1);
            bg.fillRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 8);
        });

        hit.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(CONSTANTS.COLORS.PRIMARY, 1);
            bg.fillRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 8);
        });

        hit.on('pointerdown', () => {
            this.cameras.main.fadeOut(CONSTANTS.ANIM.FADE_DURATION, 0, 0, 0);
            this.time.delayedCall(CONSTANTS.ANIM.FADE_DURATION, () => {
                // 跳转到奖励场景
                this.scene.start(CONSTANTS.SCENES.REWARD, {
                    grade: this.summaryData.grade,
                });
            });
        });
    }
}
