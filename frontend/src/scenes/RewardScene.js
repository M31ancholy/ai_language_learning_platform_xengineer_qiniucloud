/**
 * 语塔攀登 - 奖励选择场景
 * 关卡通过后选择奖励
 */

import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants.js';
import { EventBus, EVENTS } from '../utils/EventBus.js';
import { GameState } from '../game/GameState.js';
import { createPixelText } from '../utils/PixelText.js';

export class RewardScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.REWARD });
    }

    /**
     * @param {object} data
     * data.grade - 关卡评级
     * data.rewards - 奖励列表 [{ type, icon, name, desc, effect }]
     */
    init(data) {
        this.grade = data.grade || 'B';
        this.rewards = data.rewards || this._generateDefaultRewards();
        this.hasChosen = false;
    }

    create() {
        const { width, height } = this.scale;
        const C = CONSTANTS.COLORS;

        this.cameras.main.setBackgroundColor(C.BG_DARK);

        // 标题
        const gradeInfo = CONSTANTS.GRADES[this.grade] || CONSTANTS.GRADES.B;
        createPixelText(this, width / 2, 40, '🎉 关卡通过！', 'title');
        createPixelText(this, width / 2, 76, `评级：${this.grade}`, 'grade', {
            fontSize: '36px',
            color: '#' + gradeInfo.color.toString(16).padStart(6, '0'),
        });

        createPixelText(this, width / 2, 120, '选择一个奖励', 'subtitle', { fontSize: '12px' });

        // 三个奖励卡片
        this._createRewardCards(width, height);

        // 跳过按钮
        this._createSkipButton(width, height);
    }

    // ========== 奖励卡片 ==========

    _createRewardCards(sceneW, sceneH) {
        const cardW = 240;
        const cardH = 300;
        const gap = 30;
        const startX = (sceneW - (3 * cardW + 2 * gap)) / 2 + cardW / 2;
        const cy = sceneH / 2 + 20;

        this.rewards.forEach((reward, i) => {
            const cx = startX + i * (cardW + gap);
            this._createRewardCard(cx, cy, cardW, cardH, reward, i);
        });
    }

    _createRewardCard(cx, cy, w, h, reward, index) {
        const C = CONSTANTS.COLORS;
        const g = this.add.graphics();

        // 卡片背景
        g.fillStyle(C.BG_PANEL, 0.9);
        g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 10);

        // 边框颜色按奖励类型区分
        const borderColor = this._getRewardColor(reward.type);
        g.lineStyle(2, borderColor, 0.8);
        g.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 10);

        // 顶部色带
        g.fillStyle(borderColor, 0.3);
        g.fillRoundedRect(cx - w / 2, cy - h / 2, w, 50, { tl: 10, tr: 10, bl: 0, br: 0 });

        // 图标
        createPixelText(this, cx, cy - h / 2 + 55, reward.icon, 'grade', { fontSize: '40px' });

        // 名称
        createPixelText(this, cx, cy - h / 2 + 110, reward.name, 'subtitle', {
            fontSize: '12px',
            color: '#ffffff',
        });

        // 描述
        createPixelText(this, cx, cy + 10, reward.desc, 'body', {
            fontSize: '8px',
            wordWrap: { width: w - 30 },
            lineSpacing: 8,
            color: '#cccccc',
        });

        // 类型标签
        const typeName = { gold: '金币', heal: '恢复', item: '道具', skill: '技能', relic: '遗物' };
        createPixelText(this, cx, cy + h / 2 - 30, typeName[reward.type] || '其他', 'small', {
            color: '#' + borderColor.toString(16).padStart(6, '0'),
        });

        // 交互热区
        const hit = this.add.rectangle(cx, cy, w, h, 0xffffff, 0)
            .setInteractive({ useHandCursor: true });

        hit.on('pointerover', () => {
            g.clear();
            g.fillStyle(C.BG_PANEL_LIGHT, 0.95);
            g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 10);
            g.lineStyle(3, borderColor, 1);
            g.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 10);
            g.fillStyle(borderColor, 0.4);
            g.fillRoundedRect(cx - w / 2, cy - h / 2, w, 50, { tl: 10, tr: 10, bl: 0, br: 0 });
        });

        hit.on('pointerout', () => {
            g.clear();
            g.fillStyle(C.BG_PANEL, 0.9);
            g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, 10);
            g.lineStyle(2, borderColor, 0.8);
            g.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, 10);
            g.fillStyle(borderColor, 0.3);
            g.fillRoundedRect(cx - w / 2, cy - h / 2, w, 50, { tl: 10, tr: 10, bl: 0, br: 0 });
        });

        hit.on('pointerdown', () => {
            if (!this.hasChosen) {
                this.hasChosen = true;
                this._selectReward(reward, cx, cy, w, h);
            }
        });
    }

    // ========== 选择奖励 ==========

    _selectReward(reward, cx, cy, w, h) {
        // 应用奖励效果
        this._applyReward(reward);

        // 选中动画
        const flash = this.add.rectangle(cx, cy, w, h, CONSTANTS.COLORS.GOLD, 0.4);
        this.tweens.add({
            targets: flash,
            alpha: 0,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 500,
            onComplete: () => flash.destroy(),
        });

        const pickText = createPixelText(this, cx, cy, '✅ 已选择！', 'value', { fontSize: '18px' });
        this.tweens.add({
            targets: pickText,
            y: cy - 30,
            alpha: 0,
            duration: 1000,
            delay: 300,
        });

        // 延迟返回地图
        this.time.delayedCall(1200, () => {
            this.cameras.main.fadeOut(CONSTANTS.ANIM.FADE_DURATION, 0, 0, 0);
            this.time.delayedCall(CONSTANTS.ANIM.FADE_DURATION, () => {
                this.scene.start(CONSTANTS.SCENES.MAP);
            });
        });
    }

    _applyReward(reward) {
        switch (reward.type) {
            case 'gold':
                GameState.addGold(reward.effect.value);
                break;
            case 'heal':
                GameState.heal(reward.effect.value);
                break;
            case 'item':
                GameState.addItem(reward.effect.item);
                break;
            case 'skill':
                GameState.addSkillBonus(reward.effect.skill, reward.effect.value);
                break;
            case 'relic':
                GameState.addRelic(reward.effect.relic);
                break;
        }
    }

    // ========== 跳过按钮 ==========

    _createSkipButton(w, h) {
        const btnW = 260;
        const btnH = 44;
        const cx = w / 2;
        const cy = h - 40;

        const bg = this.add.graphics();
        bg.fillStyle(CONSTANTS.COLORS.BG_PANEL, 0.8);
        bg.fillRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 6);
        bg.lineStyle(1, CONSTANTS.COLORS.TEXT_DIM, 0.5);
        bg.strokeRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 6);

        createPixelText(this, cx, cy, '跳过奖励（+10金币）', 'small', {
            color: '#888888',
            fontSize: '9px',
        });

        const hit = this.add.rectangle(cx, cy, btnW, btnH, 0xffffff, 0)
            .setInteractive({ useHandCursor: true });

        hit.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(CONSTANTS.COLORS.BG_PANEL_LIGHT, 0.9);
            bg.fillRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 6);
            bg.lineStyle(1, CONSTANTS.COLORS.TEXT_GRAY, 0.6);
            bg.strokeRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 6);
        });

        hit.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(CONSTANTS.COLORS.BG_PANEL, 0.8);
            bg.fillRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 6);
            bg.lineStyle(1, CONSTANTS.COLORS.TEXT_DIM, 0.5);
            bg.strokeRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 6);
        });

        hit.on('pointerdown', () => {
            if (!this.hasChosen) {
                this.hasChosen = true;
                GameState.addGold(10);
                this.cameras.main.fadeOut(CONSTANTS.ANIM.FADE_DURATION, 0, 0, 0);
                this.time.delayedCall(CONSTANTS.ANIM.FADE_DURATION, () => {
                    this.scene.start(CONSTANTS.SCENES.MAP);
                });
            }
        });
    }

    // ========== 默认奖励生成 ==========

    _generateDefaultRewards() {
        return [
            {
                type: 'gold',
                icon: '💰',
                name: '金币袋',
                desc: '获得一袋金币，可以在商店购买道具。',
                effect: { value: Phaser.Math.Between(30, 60) },
            },
            {
                type: 'heal',
                icon: '❤️',
                name: '恢复药剂',
                desc: '立即恢复一定HP，帮助你继续冒险。',
                effect: { value: Math.floor(GameState.player.maxHp * 0.25) },
            },
            {
                type: 'skill',
                icon: '📚',
                name: '技能精华',
                desc: '随机一项技能获得永久加成。',
                effect: {
                    skill: Phaser.Math.RND.pick(['pronunciation', 'grammar', 'expression']),
                    value: 3,
                },
            },
        ];
    }

    _getRewardColor(type) {
        const map = {
            gold: CONSTANTS.COLORS.GOLD,
            heal: CONSTANTS.COLORS.DANGER,
            item: CONSTANTS.COLORS.ACCENT,
            skill: CONSTANTS.COLORS.SUCCESS,
            relic: CONSTANTS.COLORS.PURPLE,
        };
        return map[type] || CONSTANTS.COLORS.PRIMARY;
    }
}
