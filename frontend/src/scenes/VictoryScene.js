/**
 * 语塔攀登 - 胜利场景
 * 通关庆祝、完整运行统计、遗物展示
 */

import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants.js';
import { EventBus, EVENTS } from '../utils/EventBus.js';
import { GameState } from '../game/GameState.js';
import { createPixelText } from '../utils/PixelText.js';

export class VictoryScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.VICTORY });
    }

    init(data) {
        this.runStats = data.runStats || GameState.runStats;
    }

    create() {
        const { width, height } = this.scale;
        const C = CONSTANTS.COLORS;

        this.cameras.main.setBackgroundColor(0x0a0a20);

        // 金色粒子背景
        this._createGoldParticles(width, height);

        // 标题（金色动画）
        const trophy = createPixelText(this, width / 2, 45, '🏆 恭喜通关！', 'title', {
            color: '#ffd700',
            fontSize: '24px',
        });

        // 金色脉冲动画
        this.tweens.add({
            targets: trophy,
            scaleX: 1.08,
            scaleY: 1.08,
            yoyo: true,
            repeat: -1,
            duration: 800,
            ease: 'Sine.easeInOut',
        });

        // 副标题
        createPixelText(this, width / 2, 82, '你成功征服了语塔的所有挑战！', 'subtitle', {
            fontSize: '10px',
            color: '#51e5ff',
        });

        // 装饰线
        const line = this.add.graphics();
        line.lineStyle(2, C.GOLD, 0.5);
        line.lineBetween(100, 100, width - 100, 100);

        // 完整统计
        this._drawFullStats(width);

        // 遗物展示
        this._drawRelics(width);

        // 总评
        this._drawOverallRating(width);

        // 返回按钮
        this._createReturnButton(width, height);
    }

    // ========== 金色粒子 ==========

    _createGoldParticles(w, h) {
        for (let i = 0; i < 20; i++) {
            const star = this.add.text(
                Phaser.Math.Between(0, w),
                Phaser.Math.Between(0, h),
                '✦',
                { fontSize: '10px', color: '#ffd700' }
            ).setAlpha(0.3).setOrigin(0.5);

            this.tweens.add({
                targets: star,
                y: star.y - Phaser.Math.Between(30, 80),
                alpha: 0,
                duration: Phaser.Math.Between(2000, 4000),
                repeat: -1,
                delay: Phaser.Math.Between(0, 2000),
                onRepeat: () => {
                    star.x = Phaser.Math.Between(0, w);
                    star.y = Phaser.Math.Between(h / 2, h);
                    star.alpha = 0.3;
                },
            });
        }
    }

    // ========== 完整统计 ==========

    _drawFullStats(w) {
        const panelX = 30;
        const panelY = 115;
        const panelW = w - 60;
        const panelH = 200;

        const g = this.add.graphics();
        g.fillStyle(CONSTANTS.COLORS.BG_PANEL, 0.8);
        g.fillRoundedRect(panelX, panelY, panelW, panelH, 8);
        g.lineStyle(2, CONSTANTS.COLORS.GOLD, 0.3);
        g.strokeRoundedRect(panelX, panelY, panelW, panelH, 8);

        createPixelText(this, w / 2, panelY + 20, '📊 完整运行统计', 'subtitle', {
            fontSize: '11px',
        });

        const stats = this.runStats;
        const avgScore = stats.scoreCount > 0
            ? Math.round(stats.totalScore / stats.scoreCount) : 0;
        const duration = Math.floor((Date.now() - stats.startTime) / 60000);

        const statLines = [
            { label: '📏 攀登层数', value: `${stats.floorsClimbed}` },
            { label: '⚔️ 击败怪物', value: `${stats.monstersDefeated}` },
            { label: '💀 精英击杀', value: `${stats.elitesDefeated}` },
            { label: '👑 Boss击杀', value: `${stats.bossesDefeated}` },
            { label: '⭐ 完美(S级)', value: `${stats.perfectRounds}` },
            { label: '🔥 最长连S', value: `${stats.comboCount}` },
            { label: '📊 平均得分', value: `${avgScore}` },
            { label: '💰 总金币', value: `${stats.totalGoldEarned}` },
            { label: '💔 总受伤', value: `${stats.totalDamageTaken}` },
            { label: '⏱️ 用时', value: `${duration}分钟` },
        ];

        const colW = panelW / 2;
        statLines.forEach((stat, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const sx = panelX + 20 + col * colW;
            const sy = panelY + 45 + row * 30;

            createPixelText(this, sx + 50, sy, stat.label, 'small', {
                fontSize: '7px',
                color: '#cccccc',
            }).setOrigin(0, 0.5);

            createPixelText(this, sx + colW - 30, sy, stat.value, 'small', {
                fontSize: '8px',
                color: '#ffd700',
            }).setOrigin(1, 0.5);
        });
    }

    // ========== 遗物展示 ==========

    _drawRelics(w) {
        const relics = GameState.relics;
        const y = 330;

        createPixelText(this, w / 2, y, '🎖️ 收集的遗物', 'subtitle', {
            fontSize: '11px',
        });

        if (relics.length === 0) {
            createPixelText(this, w / 2, y + 30, '(无遗物)', 'small', { color: '#888888' });
        } else {
            const icons = relics.map(r => r.icon || '🔮').join('  ');
            createPixelText(this, w / 2, y + 30, icons, 'body', {
                fontSize: '16px',
            });
        }
    }

    // ========== 总评 ==========

    _drawOverallRating(w) {
        const y = 400;
        const stats = this.runStats;
        const avgScore = stats.scoreCount > 0
            ? Math.round(stats.totalScore / stats.scoreCount) : 0;

        // 根据平均分给总评
        let overallGrade = 'F';
        for (const [grade, info] of Object.entries(CONSTANTS.GRADES)) {
            if (avgScore >= info.min) {
                overallGrade = grade;
                break;
            }
        }
        const gradeInfo = CONSTANTS.GRADES[overallGrade];

        const g = this.add.graphics();
        g.fillStyle(CONSTANTS.COLORS.BG_PANEL, 0.7);
        g.fillRoundedRect(w / 2 - 150, y, 300, 80, 8);
        g.lineStyle(2, gradeInfo.color, 0.6);
        g.strokeRoundedRect(w / 2 - 150, y, 300, 80, 8);

        createPixelText(this, w / 2, y + 20, '总评', 'small', { color: '#cccccc' });
        createPixelText(this, w / 2, y + 52, overallGrade, 'grade', {
            fontSize: '30px',
            color: '#' + gradeInfo.color.toString(16).padStart(6, '0'),
        });
    }

    // ========== 返回按钮 ==========

    _createReturnButton(w, h) {
        const btnW = 220;
        const btnH = 44;
        const cx = w / 2;
        const cy = h - 50;

        const bg = this.add.graphics();
        bg.fillStyle(CONSTANTS.COLORS.GOLD, 1);
        bg.fillRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 8);

        createPixelText(this, cx, cy, '🏠 返回主菜单', 'button', {
            color: '#1a0a2e',
        });

        const hit = this.add.rectangle(cx, cy, btnW, btnH, 0xffffff, 0)
            .setInteractive({ useHandCursor: true });

        hit.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(0xffe44d, 1);
            bg.fillRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 8);
        });

        hit.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(CONSTANTS.COLORS.GOLD, 1);
            bg.fillRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 8);
        });

        hit.on('pointerdown', () => {
            this.cameras.main.fadeOut(CONSTANTS.ANIM.FADE_DURATION, 0, 0, 0);
            this.time.delayedCall(CONSTANTS.ANIM.FADE_DURATION, () => {
                this.scene.start(CONSTANTS.SCENES.MAIN_MENU);
            });
        });
    }
}
