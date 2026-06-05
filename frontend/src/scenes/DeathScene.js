/**
 * 语塔攀登 - 死亡场景
 * 显示运行统计、弱点分析、重新开始/返回主菜单
 */

import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants.js';
import { EventBus, EVENTS } from '../utils/EventBus.js';
import { GameState } from '../game/GameState.js';
import { createPixelText } from '../utils/PixelText.js';

export class DeathScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.DEATH });
    }

    init(data) {
        this.runStats = data.runStats || GameState.runStats;
    }

    create() {
        const { width, height } = this.scale;
        const C = CONSTANTS.COLORS;

        this.cameras.main.setBackgroundColor(0x0a0008);

        // 红色渐变背景效果
        const vignette = this.add.graphics();
        vignette.fillStyle(C.DANGER, 0.08);
        vignette.fillRect(0, 0, width, height);

        // 标题（红色闪烁）
        const deathTitle = createPixelText(this, width / 2, 50, '💀 你已阵亡...', 'title', {
            color: '#ff2d2d',
            fontSize: '22px',
        });

        this.tweens.add({
            targets: deathTitle,
            alpha: 0.3,
            yoyo: true,
            repeat: -1,
            duration: 1000,
            ease: 'Sine.easeInOut',
        });

        // 死亡装饰线
        const line = this.add.graphics();
        line.lineStyle(1, C.DANGER, 0.4);
        line.lineBetween(100, 80, width - 100, 80);

        // 运行统计面板
        this._drawRunStats(width, height);

        // 弱点分析
        this._drawWeakness(width);

        // 底部按钮
        this._createButtons(width, height);
    }

    // ========== 运行统计 ==========

    _drawRunStats(w, h) {
        const panelX = 40;
        const panelY = 100;
        const panelW = w - 80;
        const panelH = 220;

        const g = this.add.graphics();
        g.fillStyle(CONSTANTS.COLORS.BG_PANEL, 0.8);
        g.fillRoundedRect(panelX, panelY, panelW, panelH, 8);
        g.lineStyle(1, CONSTANTS.COLORS.DANGER, 0.3);
        g.strokeRoundedRect(panelX, panelY, panelW, panelH, 8);

        createPixelText(this, w / 2, panelY + 22, '— 运行统计 —', 'subtitle', {
            fontSize: '12px',
            color: '#ff2d2d',
        });

        const stats = this.runStats;
        const avgScore = stats.scoreCount > 0
            ? Math.round(stats.totalScore / stats.scoreCount)
            : 0;
        const duration = Math.floor((Date.now() - stats.startTime) / 60000);

        const statLines = [
            { label: '📏 存活层数', value: `${stats.floorsClimbed}` },
            { label: '⚔️ 击败怪物', value: `${stats.monstersDefeated}` },
            { label: '💀 精英击杀', value: `${stats.elitesDefeated}` },
            { label: '🏆 最高评级', value: stats.highestGrade },
            { label: '📉 最低评级', value: stats.lowestGrade },
            { label: '📊 平均得分', value: `${avgScore}` },
            { label: '💰 获得金币', value: `${stats.totalGoldEarned}` },
            { label: '⏱️ 游戏时长', value: `${duration} 分钟` },
        ];

        const colW = panelW / 2;
        statLines.forEach((stat, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const sx = panelX + 30 + col * colW;
            const sy = panelY + 52 + row * 38;

            createPixelText(this, sx + 60, sy, stat.label, 'small', {
                fontSize: '8px',
                color: '#cccccc',
            }).setOrigin(0, 0.5);

            createPixelText(this, sx + colW - 40, sy, stat.value, 'small', {
                fontSize: '9px',
                color: '#ffd700',
            }).setOrigin(1, 0.5);
        });
    }

    // ========== 弱点分析 ==========

    _drawWeakness(w) {
        const y = 340;

        const g = this.add.graphics();
        g.fillStyle(CONSTANTS.COLORS.BG_PANEL, 0.6);
        g.fillRoundedRect(40, y, w - 80, 100, 8);
        g.lineStyle(1, CONSTANTS.COLORS.WARNING, 0.3);
        g.strokeRoundedRect(40, y, w - 80, 100, 8);

        createPixelText(this, w / 2, y + 18, '🔍 弱点分析', 'subtitle', {
            fontSize: '11px',
            color: '#ff9800',
        });

        // 根据统计数据推断弱点
        const weaknesses = this._analyzeWeakness();
        weaknesses.forEach((weakness, i) => {
            createPixelText(this, w / 2, y + 46 + i * 18, weakness, 'small', {
                fontSize: '7px',
                color: '#cccccc',
                wordWrap: { width: w - 120 },
            });
        });
    }

    _analyzeWeakness() {
        const stats = this.runStats;
        const weaknesses = [];

        const avgScore = stats.scoreCount > 0
            ? Math.round(stats.totalScore / stats.scoreCount) : 0;

        if (avgScore < 50) {
            weaknesses.push('⚠️ 整体口语水平需要提升，建议多进行基础练习');
        } else if (avgScore < 70) {
            weaknesses.push('💡 表现一般，注意发音和语法的准确性');
        }

        if (stats.floorsClimbed < 5) {
            weaknesses.push('🏃 前期就陷入困境，建议降低难度先积累经验');
        }

        if (stats.perfectRounds === 0 && stats.scoreCount > 0) {
            weaknesses.push('⭐ 尚未获得S级评价，多练习争取完美发挥');
        }

        if (weaknesses.length === 0) {
            weaknesses.push('💪 你的表现不错！运气也是实力的一部分');
        }

        return weaknesses.slice(0, 3);
    }

    // ========== 底部按钮 ==========

    _createButtons(w, h) {
        // 重新开始
        this._createButton(
            w / 2 - 130, h - 60, 220, 44,
            '🔄 重新开始',
            CONSTANTS.COLORS.PRIMARY,
            () => {
                GameState.reset();
                this.cameras.main.fadeOut(CONSTANTS.ANIM.FADE_DURATION, 0, 0, 0);
                this.time.delayedCall(CONSTANTS.ANIM.FADE_DURATION, () => {
                    this.scene.start(CONSTANTS.SCENES.MAP);
                });
            }
        );

        // 返回主菜单
        this._createButton(
            w / 2 + 130, h - 60, 220, 44,
            '🏠 返回主菜单',
            CONSTANTS.COLORS.BG_PANEL,
            () => {
                this.cameras.main.fadeOut(CONSTANTS.ANIM.FADE_DURATION, 0, 0, 0);
                this.time.delayedCall(CONSTANTS.ANIM.FADE_DURATION, () => {
                    this.scene.start(CONSTANTS.SCENES.MAIN_MENU);
                });
            }
        );
    }

    _createButton(cx, cy, w, h, text, bgColor, callback) {
        const bg = this.add.graphics();
        bg.fillStyle(bgColor, 1);
        bg.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 8);
        bg.lineStyle(2, CONSTANTS.COLORS.TEXT_DIM, 0.5);
        bg.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 8);

        createPixelText(this, cx, cy, text, 'button');

        const hit = this.add.rectangle(cx, cy, w, h, 0xffffff, 0)
            .setInteractive({ useHandCursor: true });

        hit.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(CONSTANTS.COLORS.BG_PANEL_LIGHT, 1);
            bg.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 8);
            bg.lineStyle(2, CONSTANTS.COLORS.PRIMARY, 0.8);
            bg.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 8);
        });

        hit.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(bgColor, 1);
            bg.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 8);
            bg.lineStyle(2, CONSTANTS.COLORS.TEXT_DIM, 0.5);
            bg.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 8);
        });

        hit.on('pointerdown', callback);
    }
}
