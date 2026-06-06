/**
 * 语塔攀登 - 课后总结场景
 * 显示评级、四维评分、发音详情、语法纠错等
 */

import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants.js';
import { EventBus, EVENTS } from '../utils/EventBus.js';
import { GameState } from '../game/GameState.js';
import { createPixelText } from '../utils/PixelText.js';
import { ApiClient } from '../services/ApiClient.js';

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

        // 异步加载 AI 导师点评并动态布局其余细节
        this._loadSummaryAndLayout(width, height);

        // 继续按钮
        this._createContinueButton(width, height);

        // 简易滚动支持
        this._setupScroll(height);
    }

    // ========== 四维评分条 (固定在上方，不随内容滚动) ==========

    _drawScoreBars(sceneW) {
        const startY = 145;
        const barW = 300;
        const barH = 16;
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
            // 不加入 contentContainer 保持在上方固定显示
            g.fillStyle(CONSTANTS.COLORS.BG_PANEL, 1);
            g.fillRoundedRect(cx - barW / 2, y - barH / 2, barW, barH, 4);

            // 进度条填充（带动画）
            const fillWidth = (dim.value / 100) * barW;
            const fill = this.add.graphics();

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

    // ========== 异步生成总结及布局 ==========

    async _loadSummaryAndLayout(width, height) {
        // 在 contentContainer 中显示加载提示
        const loadingText = createPixelText(this, width / 2, 320, '🤖 AI 导师正在生成总结报告...', 'small', {
            color: '#51e5ff',
            fontSize: '9px'
        });
        loadingText.setOrigin(0.5);
        this.contentContainer.add(loadingText);

        // 整理错误和建议列表供大模型分析
        const errorsList = [];
        this.summaryData.grammarErrors.forEach(err => {
            if (typeof err === 'string') {
                errorsList.push(`语法错误: ${err}`);
            } else if (err && err.original) {
                errorsList.push(`语法错误: "${err.original}" 应改为 "${err.correction || ''}" (${err.explanation || ''})`);
            }
        });
        this.summaryData.expressionSuggestions.forEach(sug => {
            if (typeof sug === 'string') {
                errorsList.push(`表达建议: ${sug}`);
            } else if (sug && sug.original) {
                errorsList.push(`表达建议: "${sug.original}" 建议为 "${sug.suggestion || ''}" (${sug.explanation || ''})`);
            }
        });

        let feedback = '';
        let focusErrors = [];

        try {
            // 调用 API 接口
            const result = await ApiClient.generateSummary(
                errorsList,
                this.summaryData.score,
                this.summaryData.grade
            );
            if (result && result.feedback) {
                feedback = result.feedback;
                focusErrors = result.focusErrors || [];
            } else {
                throw new Error('AI feedback empty');
            }
        } catch (error) {
            console.warn('[SummaryScene] AI summary generation failed, using fallback local generator:', error);
            
            // 本地 fallback 生成
            const score = this.summaryData.score;
            if (score >= 90) {
                feedback = "太棒了！你的英语表达流畅自然，发音清晰准确。像个地道的母语者在交流，继续保持这种巅峰状态，你将横扫接下来的所有难关！";
            } else if (score >= 75) {
                feedback = "表现得很好！你能够清晰表达自己的意图，发音整体在线。只需要微调个别语法和小词发音，多注意停顿和重音，就能更上一层楼！";
            } else if (score >= 60) {
                feedback = "干得漂亮，你成功完成了这关！虽然部分单词发音和语法有些偏离，但你的表达勇气非常棒。多听示范，多开口朗读，你一定会攀登成功！";
            } else {
                feedback = "别气馁！开口说话就是最大的进步。建议放慢语速，先攻克基础的发音，再关注句子完整性。多积累常用短语，导师相信你下一次能做得更好！";
            }

            if (this.summaryData.grammarErrors.length > 0) {
                const firstErr = this.summaryData.grammarErrors[0];
                const errText = typeof firstErr === 'string' ? firstErr : (firstErr.original || '');
                if (errText) {
                    focusErrors.push(`注意语法: "${errText}"`);
                }
            }
            if (this.summaryData.wordScores.length > 0) {
                const poorWords = this.summaryData.wordScores.filter(w => w.score < 75);
                if (poorWords.length > 0) {
                    focusErrors.push(`发音待提升: "${poorWords[0].word}" (${poorWords[0].score}分)`);
                }
            }
            if (focusErrors.length === 0) {
                focusErrors.push("发音节奏与流畅度提升");
            }
        }

        // 销毁加载提示
        loadingText.destroy();

        // 动态绘制各项可滚动内容
        let currentY = 285;

        // 1. AI 导师点评面板
        currentY = this._drawAICoachFeedback(width, currentY, feedback, focusErrors);

        // 2. 发音详情
        currentY = this._drawWordScores(width, currentY);

        // 3. 语法纠错
        currentY = this._drawGrammarErrors(width, currentY);

        // 4. 表达建议
        currentY = this._drawExpressionSuggestions(width, currentY);

        // 5. 扣血显示
        currentY = this._drawDamageInfo(width, currentY);

        // 计算可滚动最大位移
        const viewportHeight = height - 70; // 底部继续按钮面板的起始位置
        if (currentY > viewportHeight) {
            this.maxScrollY = -(currentY - viewportHeight + 30);
        } else {
            this.maxScrollY = 0;
        }
    }

    // ========== 绘制 AI 导师点评面板 ==========

    _drawAICoachFeedback(sceneW, startY, feedback, focusErrors) {
        const cx = sceneW / 2;
        const cardW = sceneW - 100;
        
        // 1. 创建标题
        const titleY = startY + 16;
        const titleText = createPixelText(this, cx, titleY, '🤖 AI 导师点评', 'subtitle', {
            fontSize: '10px',
            color: '#ffd700'
        });
        titleText.setOrigin(0.5);
        this.contentContainer.add(titleText);
        
        // 2. 创建点评文本
        const feedbackY = titleY + 18;
        const feedbackText = createPixelText(this, cx, feedbackY, feedback, 'body', {
            fontSize: '8px',
            color: '#ffffff',
            wordWrap: { width: cardW - 30 },
            align: 'left',
            lineSpacing: 5
        });
        feedbackText.setOrigin(0.5, 0); // 顶部对齐以方便后续定位
        this.contentContainer.add(feedbackText);
        
        // 3. 创建重点建议列表
        let focusY = feedbackY + feedbackText.height + 14;
        const suggestionsAdded = [];
        
        if (focusErrors && focusErrors.length > 0) {
            const focusTitle = createPixelText(this, cx, focusY, '🎯 重点攻克建议:', 'small', {
                fontSize: '8px',
                color: '#51e5ff'
            });
            focusTitle.setOrigin(0.5, 0);
            this.contentContainer.add(focusTitle);
            suggestionsAdded.push(focusTitle);
            
            focusErrors.forEach((err, idx) => {
                const errY = focusY + 14 + idx * 14;
                const errText = createPixelText(this, cx, errY, `• ${err}`, 'small', {
                    fontSize: '7px',
                    color: '#ff9800',
                    wordWrap: { width: cardW - 30 }
                });
                errText.setOrigin(0.5, 0);
                this.contentContainer.add(errText);
                suggestionsAdded.push(errText);
            });
            
            focusY += 14 + focusErrors.length * 14;
        }
        
        const cardH = focusY - startY + 8;
        
        // 4. 创建面板底座与边框图形
        const g = this.add.graphics();
        g.fillStyle(0x24153a, 0.9); // 极暗紫底色
        g.lineStyle(2, 0xff6b35, 1); // 地狱橙色细边框
        g.fillRoundedRect(cx - cardW / 2, startY, cardW, cardH, 6);
        g.strokeRoundedRect(cx - cardW / 2, startY, cardW, cardH, 6);
        
        this.contentContainer.add(g);
        this.contentContainer.sendToBack(g); // 保证底座被置于文字最底层
        
        return startY + cardH + 20; // 返回下一模块的 startY
    }

    // ========== 发音详情 ==========

    _drawWordScores(sceneW, startY) {
        const words = this.summaryData.wordScores;
        if (words.length === 0) return startY;

        const titleText = createPixelText(this, sceneW / 2, startY, '— 发音详情 —', 'small', {
            color: '#51e5ff',
            fontSize: '9px',
        });
        titleText.setOrigin(0.5);
        this.contentContainer.add(titleText);

        const cx = sceneW / 2;
        const rowHeight = 18;
        const maxWords = 8;
        const displayCount = Math.min(words.length, maxWords);
        const rows = Math.ceil(displayCount / 2);

        words.forEach((word, i) => {
            if (i >= maxWords) return;
            const col = i < 4 ? -1 : 1;
            const row = i % 4;
            const wx = cx + col * 170;
            const wy = startY + 20 + row * rowHeight;

            let icon, color;
            if (word.pronAccuracy >= 90) {
                icon = '✅'; color = '#4caf50';
            } else if (word.pronAccuracy >= 60) {
                icon = '⚠️'; color = '#ff9800';
            } else {
                icon = '❌'; color = '#ff2d2d';
            }

            const text = createPixelText(this, wx, wy,
                `${icon} ${word.word}: ${word.pronAccuracy}分`, 'small', {
                    color,
                    fontSize: '7px',
                });
            text.setOrigin(0.5);
            this.contentContainer.add(text);
        });

        return startY + 20 + rows * rowHeight + 15;
    }

    // ========== 语法纠错 ==========

    _drawGrammarErrors(sceneW, startY) {
        const errors = this.summaryData.grammarErrors;
        if (errors.length === 0) return startY;

        const titleText = createPixelText(this, sceneW / 2, startY, '— 语法纠错 —', 'small', {
            color: '#ff9800',
            fontSize: '9px',
        });
        titleText.setOrigin(0.5);
        this.contentContainer.add(titleText);

        let currentY = startY + 20;
        errors.forEach((err, i) => {
            if (i >= 3) return; // 最多显示3条

            // 错误内容
            const errText = createPixelText(this, sceneW / 2, currentY,
                `❌ ${err.original || err}`, 'small', {
                    color: '#ff2d2d',
                    fontSize: '7px',
                    wordWrap: { width: sceneW - 100 },
                });
            errText.setOrigin(0.5, 0);
            this.contentContainer.add(errText);
            currentY += errText.height + 4;

            // 修正建议
            if (err.correction) {
                const corrText = createPixelText(this, sceneW / 2, currentY,
                    `✅ ${err.correction}`, 'small', {
                        color: '#4caf50',
                        fontSize: '7px',
                        wordWrap: { width: sceneW - 100 },
                    });
                corrText.setOrigin(0.5, 0);
                this.contentContainer.add(corrText);
                currentY += corrText.height + 12;
            } else {
                currentY += 12;
            }
        });

        return currentY + 5;
    }

    // ========== 表达建议 ==========

    _drawExpressionSuggestions(sceneW, startY) {
        const suggestions = this.summaryData.expressionSuggestions;
        if (suggestions.length === 0) return startY;

        const titleText = createPixelText(this, sceneW / 2, startY, '— 表达建议 —', 'small', {
            color: '#ffd700',
            fontSize: '9px',
        });
        titleText.setOrigin(0.5);
        this.contentContainer.add(titleText);

        let currentY = startY + 20;
        suggestions.forEach((sug, i) => {
            if (i >= 2) return;
            const text = createPixelText(this, sceneW / 2, currentY,
                `💡 ${sug}`, 'small', {
                    color: '#cccccc',
                    fontSize: '7px',
                    wordWrap: { width: sceneW - 100 },
                });
            text.setOrigin(0.5, 0);
            this.contentContainer.add(text);
            currentY += text.height + 8;
        });

        return currentY + 10;
    }

    // ========== 扣血显示 ==========

    _drawDamageInfo(sceneW, startY) {
        if (this.summaryData.damage <= 0) return startY;

        const damageText = createPixelText(this, sceneW / 2, startY + 10,
            `💔 本次扣血: -${this.summaryData.damage} HP`, 'damage', {
                fontSize: '12px',
            });
        damageText.setOrigin(0.5);
        this.contentContainer.add(damageText);

        this.tweens.add({
            targets: damageText,
            alpha: 0.5,
            yoyo: true,
            repeat: 2,
            duration: 300,
        });

        return startY + 35;
    }

    // ========== 简易滚动 ==========

    _setupScroll(sceneH) {
        this.maxScrollY = -300; // 默认，随后根据渲染高度动态刷新
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            this.scrollY -= deltaY * 0.5;
            this.scrollY = Phaser.Math.Clamp(this.scrollY, this.maxScrollY, 0);
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
