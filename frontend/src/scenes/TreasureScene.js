/**
 * 语塔攀登 - 宝藏场景
 * 宝箱打开动画 + 显示奖励
 */

import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants.js';
import { EventBus, EVENTS } from '../utils/EventBus.js';
import { GameState } from '../game/GameState.js';
import { createPixelText } from '../utils/PixelText.js';

export class TreasureScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.TREASURE });
    }

    init(data) {
        // 生成随机奖励
        const goldAmount = Phaser.Math.Between(50, 100);
        this.rewards = data.rewards || { gold: goldAmount };

        // 随机附加奖励（药水或技能书）
        if (!data.rewards) {
            const roll = Math.random();
            if (roll < 0.3) {
                this.rewards.item = { id: 'hp_potion', name: '生命药水', icon: '🧪' };
            } else if (roll < 0.5) {
                this.rewards.item = { id: 'shield_crystal', name: '护盾结晶', icon: '🛡️' };
            } else if (roll < 0.6) {
                this.rewards.item = { id: 'hint_scroll', name: '提示卷轴', icon: '📜' };
            }
        }
    }

    create() {
        const { width, height } = this.scale;
        const C = CONSTANTS.COLORS;

        this.cameras.main.setBackgroundColor(C.BG_DARK);

        // 标题
        createPixelText(this, width / 2, 40, '💎 发现宝藏！', 'title');

        // 绘制宝箱（关闭状态）
        this.chestX = width / 2;
        this.chestY = height / 2 - 60;
        this._drawClosedChest(this.chestX, this.chestY);

        // 点击提示
        this.clickHint = createPixelText(this, width / 2, height / 2 + 40,
            '点击宝箱打开！', 'button', { color: '#ffd700' });
        this.tweens.add({
            targets: this.clickHint,
            alpha: 0.4,
            yoyo: true,
            repeat: -1,
            duration: 600,
        });

        // 宝箱点击区域
        this.chestHit = this.add.rectangle(this.chestX, this.chestY, 120, 90, 0xffffff, 0)
            .setInteractive({ useHandCursor: true });

        this.chestHit.on('pointerdown', () => {
            this._openChest();
        });
    }

    // ========== 关闭的宝箱 ==========

    _drawClosedChest(cx, cy) {
        this.chestGraphics = this.add.graphics();
        const g = this.chestGraphics;

        // 箱体
        g.fillStyle(0x8B4513, 1); // 棕色木头
        g.fillRect(cx - 50, cy - 20, 100, 50);

        // 箱盖
        g.fillStyle(0x654321, 1);
        g.fillRect(cx - 55, cy - 40, 110, 25);

        // 金属边框
        g.fillStyle(CONSTANTS.COLORS.GOLD, 1);
        g.fillRect(cx - 55, cy - 42, 110, 4);
        g.fillRect(cx - 55, cy - 20, 110, 4);
        g.fillRect(cx - 50, cy + 26, 100, 4);

        // 锁扣
        g.fillStyle(CONSTANTS.COLORS.GOLD, 1);
        g.fillRect(cx - 8, cy - 28, 16, 16);
        g.fillStyle(0x8B4513, 1);
        g.fillRect(cx - 4, cy - 24, 8, 8);

        // 金属装饰条
        g.fillStyle(CONSTANTS.COLORS.GOLD, 0.6);
        g.fillRect(cx - 50, cy + 2, 4, 24);
        g.fillRect(cx + 46, cy + 2, 4, 24);
    }

    // ========== 宝箱打开动画 ==========

    _openChest() {
        // 禁用重复点击
        this.chestHit.disableInteractive();
        this.clickHint.setVisible(false);

        // 宝箱抖动
        this.tweens.add({
            targets: this.chestGraphics,
            x: { from: -3, to: 3 },
            duration: 50,
            repeat: 5,
            yoyo: true,
            onComplete: () => {
                // 清除关闭的宝箱
                this.chestGraphics.clear();
                // 绘制打开的宝箱
                this._drawOpenChest(this.chestX, this.chestY);
                // 显示奖励
                this._showRewards();
            },
        });
    }

    _drawOpenChest(cx, cy) {
        const g = this.add.graphics();

        // 箱体
        g.fillStyle(0x8B4513, 1);
        g.fillRect(cx - 50, cy - 20, 100, 50);

        // 打开的箱盖（倾斜效果 - 用较小的矩形模拟）
        g.fillStyle(0x654321, 1);
        g.fillRect(cx - 55, cy - 65, 110, 25);
        g.fillStyle(CONSTANTS.COLORS.GOLD, 1);
        g.fillRect(cx - 55, cy - 67, 110, 4);
        g.fillRect(cx - 55, cy - 42, 110, 4);

        // 箱体金属边
        g.fillStyle(CONSTANTS.COLORS.GOLD, 1);
        g.fillRect(cx - 55, cy - 20, 110, 4);
        g.fillRect(cx - 50, cy + 26, 100, 4);

        // 内部光芒
        g.fillStyle(CONSTANTS.COLORS.GOLD, 0.4);
        g.fillRect(cx - 45, cy - 16, 90, 40);

        // 光芒粒子
        for (let i = 0; i < 8; i++) {
            const particle = this.add.rectangle(
                cx + Phaser.Math.Between(-30, 30),
                cy - 10,
                Phaser.Math.Between(3, 6),
                Phaser.Math.Between(3, 6),
                CONSTANTS.COLORS.GOLD,
                0.8
            );

            this.tweens.add({
                targets: particle,
                y: particle.y - Phaser.Math.Between(40, 100),
                x: particle.x + Phaser.Math.Between(-40, 40),
                alpha: 0,
                duration: Phaser.Math.Between(800, 1500),
                ease: 'Power2',
                onComplete: () => particle.destroy(),
            });
        }

        // 金色光晕
        const glow = this.add.circle(cx, cy - 10, 50, CONSTANTS.COLORS.GOLD, 0.15);
        this.tweens.add({
            targets: glow,
            alpha: 0.3,
            scaleX: 1.5,
            scaleY: 1.5,
            yoyo: true,
            repeat: 2,
            duration: 400,
        });
    }

    // ========== 显示奖励 ==========

    _showRewards() {
        const { width, height } = this.scale;
        const rewardY = height / 2 + 60;

        // 奖励面板
        const panelG = this.add.graphics();
        panelG.fillStyle(CONSTANTS.COLORS.BG_PANEL, 0.9);
        panelG.fillRoundedRect(width / 2 - 200, rewardY - 20, 400, 120, 8);
        panelG.lineStyle(2, CONSTANTS.COLORS.GOLD, 0.6);
        panelG.strokeRoundedRect(width / 2 - 200, rewardY - 20, 400, 120, 8);

        // 金币奖励
        if (this.rewards.gold) {
            GameState.addGold(this.rewards.gold);
            const goldText = createPixelText(this, width / 2, rewardY + 10,
                `💰 +${this.rewards.gold} 金币`, 'value', { fontSize: '16px' });

            this.tweens.add({
                targets: goldText,
                scaleX: 1.2,
                scaleY: 1.2,
                yoyo: true,
                duration: 300,
            });
        }

        // 道具奖励
        if (this.rewards.item) {
            const added = GameState.addItem(this.rewards.item);
            const itemText = added
                ? `${this.rewards.item.icon} 获得 ${this.rewards.item.name}！`
                : `${this.rewards.item.icon} ${this.rewards.item.name}（背包已满）`;

            createPixelText(this, width / 2, rewardY + 50, itemText, 'button', {
                color: added ? '#51e5ff' : '#ff9800',
            });
        }

        // 收下按钮
        this.time.delayedCall(800, () => {
            this._createCollectButton(width, height);
        });
    }

    // ========== 收下按钮 ==========

    _createCollectButton(w, h) {
        const btnW = 220;
        const btnH = 44;
        const cx = w / 2;
        const cy = h - 55;

        const bg = this.add.graphics();
        bg.fillStyle(CONSTANTS.COLORS.GOLD, 1);
        bg.fillRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 8);

        createPixelText(this, cx, cy, '✨ 收下宝藏', 'button', {
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
            if (GameState.currentNodeId) {
                GameState.completeNode(GameState.currentNodeId);
            }
            this.cameras.main.fadeOut(CONSTANTS.ANIM.FADE_DURATION, 0, 0, 0);
            this.time.delayedCall(CONSTANTS.ANIM.FADE_DURATION, () => {
                this.scene.start(CONSTANTS.SCENES.MAP);
            });
        });
    }
}
