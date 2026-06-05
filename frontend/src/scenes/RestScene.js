/**
 * 语塔攀登 - 休息站场景
 * 篝火休息 或 训练提升技能
 */

import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants.js';
import { EventBus, EVENTS } from '../utils/EventBus.js';
import { GameState } from '../game/GameState.js';
import { createPixelText } from '../utils/PixelText.js';

export class RestScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.REST });
    }

    init(data) {
        this.hasChosen = false;
    }

    create() {
        const { width, height } = this.scale;
        const C = CONSTANTS.COLORS;

        this.cameras.main.setBackgroundColor(C.BG_DARK);

        // 标题
        createPixelText(this, width / 2, 40, '🏕️ 休息站', 'title');
        createPixelText(this, width / 2, 75, '"篝火的温暖让你放松下来……"', 'small', {
            color: '#ffd700',
        });

        // 篝火动画
        this._drawCampfire(width / 2, height / 2 - 40);

        // 当前状态显示
        createPixelText(this, width / 2, height / 2 + 80, 
            `❤️ HP: ${GameState.player.hp}/${GameState.player.maxHp}`, 'button', {
            color: '#ff2d2d',
        });

        const healAmount = Math.floor(GameState.player.maxHp * CONSTANTS.REST_HEAL_PERCENT);

        // 选项按钮容器
        this.choiceContainer = this.add.container(0, 0);

        // 选项1：休息
        this._createChoiceButton(
            width / 2 - 160, height / 2 + 130, 280, 80,
            '❤️ 休息',
            `恢复 ${healAmount} HP (30%最大生命)`,
            C.DANGER,
            () => this._chooseRest(healAmount)
        );

        // 选项2：训练
        this._createChoiceButton(
            width / 2 + 160, height / 2 + 130, 280, 80,
            '📖 训练',
            '选择一项技能永久提升5%',
            C.ACCENT,
            () => this._chooseTrain()
        );
    }

    // ========== 篝火动画 ==========

    _drawCampfire(cx, cy) {
        // 火堆底座（像素风木头）
        const base = this.add.graphics();
        base.fillStyle(0x8B4513, 1);
        base.fillRect(cx - 30, cy + 20, 15, 8);
        base.fillRect(cx + 15, cy + 20, 15, 8);
        base.fillRect(cx - 20, cy + 26, 40, 6);
        base.fillStyle(0x654321, 1);
        base.fillRect(cx - 10, cy + 22, 20, 8);

        // 火焰粒子效果（用多个矩形模拟）
        this.flames = [];
        const flameColors = [0xff6b35, 0xff2d2d, 0xffd700, 0xff9800];
        for (let i = 0; i < 12; i++) {
            const flame = this.add.rectangle(
                cx + Phaser.Math.Between(-12, 12),
                cy + Phaser.Math.Between(-5, 15),
                Phaser.Math.Between(4, 10),
                Phaser.Math.Between(6, 16),
                Phaser.Math.RND.pick(flameColors),
                0.8
            );
            this.flames.push(flame);

            // 火焰上升动画
            this.tweens.add({
                targets: flame,
                y: cy - Phaser.Math.Between(20, 50),
                alpha: 0,
                scaleX: 0.3,
                scaleY: 0.3,
                duration: Phaser.Math.Between(600, 1200),
                repeat: -1,
                delay: Phaser.Math.Between(0, 500),
                onRepeat: () => {
                    flame.x = cx + Phaser.Math.Between(-12, 12);
                    flame.y = cy + Phaser.Math.Between(-5, 15);
                    flame.alpha = 0.8;
                    flame.scaleX = 1;
                    flame.scaleY = 1;
                    flame.fillColor = Phaser.Math.RND.pick(flameColors);
                },
            });
        }

        // 篝火光晕
        const glow = this.add.circle(cx, cy, 60, 0xff6b35, 0.08);
        this.tweens.add({
            targets: glow,
            alpha: 0.15,
            scaleX: 1.15,
            scaleY: 1.15,
            yoyo: true,
            repeat: -1,
            duration: 800,
            ease: 'Sine.easeInOut',
        });
    }

    // ========== 选项按钮 ==========

    _createChoiceButton(cx, cy, w, h, title, desc, color, callback) {
        const g = this.add.graphics();
        g.fillStyle(CONSTANTS.COLORS.BG_PANEL, 0.9);
        g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 8);
        g.lineStyle(2, color, 1);
        g.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 8);

        createPixelText(this, cx, cy - 14, title, 'button', { fontSize: '14px' });
        createPixelText(this, cx, cy + 16, desc, 'small', {
            fontSize: '7px',
            wordWrap: { width: w - 20 },
        });

        const hit = this.add.rectangle(cx, cy, w, h, 0xffffff, 0)
            .setInteractive({ useHandCursor: true });

        this.choiceContainer.add([g, hit]);

        hit.on('pointerover', () => {
            g.clear();
            g.fillStyle(CONSTANTS.COLORS.BG_PANEL_LIGHT, 0.95);
            g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 8);
            g.lineStyle(3, color, 1);
            g.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 8);
        });

        hit.on('pointerout', () => {
            g.clear();
            g.fillStyle(CONSTANTS.COLORS.BG_PANEL, 0.9);
            g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 8);
            g.lineStyle(2, color, 1);
            g.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 8);
        });

        hit.on('pointerdown', () => {
            if (!this.hasChosen) {
                this.hasChosen = true;
                callback();
            }
        });
    }

    // ========== 休息选择 ==========

    _chooseRest(healAmount) {
        // 隐藏选项
        this.choiceContainer.setVisible(false);

        const actual = GameState.heal(healAmount);

        // 治疗动画
        const healText = createPixelText(this, this.scale.width / 2, this.scale.height / 2 + 80,
            `+${actual} HP`, 'heal');

        this.tweens.add({
            targets: healText,
            y: healText.y - 40,
            alpha: 0,
            duration: 1500,
            ease: 'Power2',
        });

        // 绿色闪烁
        const flash = this.add.rectangle(this.scale.width / 2, this.scale.height / 2,
            this.scale.width, this.scale.height, CONSTANTS.COLORS.SUCCESS, 0.15);
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 800,
        });

        // 结果文字
        this.time.delayedCall(600, () => {
            createPixelText(this, this.scale.width / 2, this.scale.height / 2 + 100,
                `休息后 HP: ${GameState.player.hp}/${GameState.player.maxHp}`, 'button', {
                    color: '#4caf50',
                });
            this._createContinueButton();
        });
    }

    // ========== 训练选择 ==========

    _chooseTrain() {
        // 隐藏选项
        this.choiceContainer.setVisible(false);

        const { width, height } = this.scale;
        const skills = [
            { key: 'pronunciation', name: '🗣️ 发音', color: CONSTANTS.COLORS.ACCENT },
            { key: 'grammar', name: '📝 语法', color: CONSTANTS.COLORS.SUCCESS },
            { key: 'expression', name: '💬 表达', color: CONSTANTS.COLORS.GOLD },
        ];

        createPixelText(this, width / 2, height / 2 + 80, '选择一项技能提升 +5%', 'subtitle', {
            fontSize: '12px',
        });

        skills.forEach((skill, i) => {
            const sx = width / 2 + (i - 1) * 180;
            const sy = height / 2 + 140;
            const currentBonus = GameState.getSkillBonus(skill.key);

            const g = this.add.graphics();
            g.fillStyle(CONSTANTS.COLORS.BG_PANEL, 0.9);
            g.fillRoundedRect(sx - 70, sy - 30, 140, 60, 6);
            g.lineStyle(2, skill.color, 1);
            g.strokeRoundedRect(sx - 70, sy - 30, 140, 60, 6);

            createPixelText(this, sx, sy - 10, skill.name, 'button');
            createPixelText(this, sx, sy + 14, `当前: +${currentBonus}%`, 'small', { fontSize: '7px' });

            const hit = this.add.rectangle(sx, sy, 140, 60, 0xffffff, 0)
                .setInteractive({ useHandCursor: true });

            hit.on('pointerover', () => {
                g.clear();
                g.fillStyle(skill.color, 0.3);
                g.fillRoundedRect(sx - 70, sy - 30, 140, 60, 6);
                g.lineStyle(3, skill.color, 1);
                g.strokeRoundedRect(sx - 70, sy - 30, 140, 60, 6);
            });

            hit.on('pointerout', () => {
                g.clear();
                g.fillStyle(CONSTANTS.COLORS.BG_PANEL, 0.9);
                g.fillRoundedRect(sx - 70, sy - 30, 140, 60, 6);
                g.lineStyle(2, skill.color, 1);
                g.strokeRoundedRect(sx - 70, sy - 30, 140, 60, 6);
            });

            hit.on('pointerdown', () => {
                this._applyTraining(skill);
            });
        });
    }

    _applyTraining(skill) {
        GameState.addSkillBonus(skill.key, 5);

        const { width, height } = this.scale;

        // 清除训练选择UI
        // 简单做法：在上层叠加结果
        const overlay = this.add.rectangle(width / 2, height / 2 + 120, width, 150,
            CONSTANTS.COLORS.BG_DARK, 0.95);

        const resultText = createPixelText(this, width / 2, height / 2 + 110,
            `${skill.name} 永久提升 +5%！\n当前加成: +${GameState.getSkillBonus(skill.key)}%`, 'button', {
                color: '#4caf50',
                lineSpacing: 10,
            });

        // 闪烁效果
        this.tweens.add({
            targets: resultText,
            scaleX: 1.1,
            scaleY: 1.1,
            yoyo: true,
            repeat: 2,
            duration: 200,
        });

        this.time.delayedCall(800, () => {
            this._createContinueButton();
        });
    }

    // ========== 继续按钮 ==========

    _createContinueButton() {
        const { width, height } = this.scale;
        const btnW = 200;
        const btnH = 40;
        const btnX = width / 2;
        const btnY = height - 50;

        const bg = this.add.graphics();
        bg.fillStyle(CONSTANTS.COLORS.PRIMARY, 1);
        bg.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 8);

        createPixelText(this, btnX, btnY, '继续旅程 →', 'button');

        const hit = this.add.rectangle(btnX, btnY, btnW, btnH, 0xffffff, 0)
            .setInteractive({ useHandCursor: true });

        hit.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(CONSTANTS.COLORS.WARNING, 1);
            bg.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 8);
        });

        hit.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(CONSTANTS.COLORS.PRIMARY, 1);
            bg.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 8);
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
