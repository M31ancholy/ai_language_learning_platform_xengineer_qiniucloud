/**
 * 奖励系统 - 语塔攀登
 * 战斗胜利后生成奖励选项
 */

import { CONSTANTS } from '../utils/Constants.js';
import { EventBus, EVENTS } from '../utils/EventBus.js';
import { GameState } from '../game/GameState.js';
import { randomInt, randomChoice, generateId } from '../utils/Helpers.js';
import { ITEMS, ITEMS_BY_RARITY } from '../data/items.js';

export class RewardSystem {
    constructor() {
        // 当前可选的奖励列表
        this.currentRewards = [];
        // 是否已领取
        this._claimed = false;
    }

    /**
     * 生成战斗胜利奖励选项（3个）
     * @param {string} battleType - 战斗类型 ('monster'|'elite'|'boss')
     * @param {string} grade - 评级 ('S'|'A'|'B'|'C'|'D'|'F')
     * @param {number} act - 当前章节
     * @returns {Array} 奖励选项列表
     */
    generateRewards(battleType, grade, act) {
        this.currentRewards = [];
        this._claimed = false;

        const rewardCount = 3;
        const usedTypes = new Set();

        for (let i = 0; i < rewardCount; i++) {
            const reward = this._generateSingleReward(battleType, grade, act, usedTypes);
            this.currentRewards.push(reward);
        }

        return this.currentRewards;
    }

    /**
     * 领取指定索引的奖励
     * @param {number} rewardIndex - 奖励索引 (0-2)
     * @returns {object|false} 领取的奖励信息或false
     */
    claimReward(rewardIndex) {
        if (this._claimed) {
            console.warn('[RewardSystem] 奖励已被领取');
            return false;
        }

        const reward = this.currentRewards[rewardIndex];
        if (!reward) {
            console.warn(`[RewardSystem] 无效的奖励索引: ${rewardIndex}`);
            return false;
        }

        this._applyReward(reward);
        this._claimed = true;

        return reward;
    }

    /**
     * 跳过奖励，获得补偿金币
     * @returns {number} 获得的金币数
     */
    skipReward() {
        if (this._claimed) {
            console.warn('[RewardSystem] 奖励已被领取');
            return 0;
        }

        const bonusGold = 10;
        GameState.addGold(bonusGold);
        this._claimed = true;

        return bonusGold;
    }

    /**
     * 生成单个奖励
     * @private
     */
    _generateSingleReward(battleType, grade, act, usedTypes) {
        // 根据战斗类型和评级决定奖励品质
        const quality = this._getRewardQuality(battleType, grade);

        // 选择奖励类型（确保不重复）
        const availableTypes = this._getAvailableRewardTypes(quality).filter(t => !usedTypes.has(t));
        const type = availableTypes.length > 0 ? randomChoice(availableTypes) : randomChoice(this._getAvailableRewardTypes(quality));
        usedTypes.add(type);

        switch (type) {
            case 'gold':
                return this._generateGoldReward(quality, act);
            case 'heal':
                return this._generateHealReward(quality);
            case 'shield':
                return this._generateShieldReward(quality);
            case 'item':
                return this._generateItemReward(quality, act);
            case 'skill_book':
                return this._generateSkillBookReward();
            case 'energy':
                return this._generateEnergyReward();
            default:
                return this._generateGoldReward(quality, act);
        }
    }

    /**
     * 获取奖励品质
     * @private
     */
    _getRewardQuality(battleType, grade) {
        let quality = 1; // 基础品质

        // 战斗类型加成
        if (battleType === 'elite') quality += 1;
        if (battleType === 'boss') quality += 2;

        // 评级加成
        const gradeBonus = { S: 2, A: 1, B: 0, C: 0, D: -1, F: -1 };
        quality += gradeBonus[grade] || 0;

        return Math.max(1, Math.min(4, quality)); // 限制在 1-4
    }

    /**
     * 获取可用的奖励类型列表
     * @private
     */
    _getAvailableRewardTypes(quality) {
        const types = ['gold', 'heal', 'shield'];

        if (quality >= 2) {
            types.push('item', 'energy');
        }
        if (quality >= 3) {
            types.push('skill_book');
        }

        return types;
    }

    /**
     * 生成金币奖励
     * @private
     */
    _generateGoldReward(quality, act) {
        const baseGold = 15 + quality * 10 + (act - 1) * 5;
        const amount = randomInt(baseGold - 5, baseGold + 10);

        return {
            type: 'gold',
            icon: '💰',
            name: `${amount} 金币`,
            description: `获得 ${amount} 枚金币`,
            value: amount,
        };
    }

    /**
     * 生成HP恢复奖励
     * @private
     */
    _generateHealReward(quality) {
        const amount = 10 + quality * 5;

        return {
            type: 'heal',
            icon: '❤️',
            name: `恢复 ${amount} HP`,
            description: `恢复 ${amount} 点生命值`,
            value: amount,
        };
    }

    /**
     * 生成护盾奖励
     * @private
     */
    _generateShieldReward(quality) {
        const amount = 5 + quality * 5;

        return {
            type: 'shield',
            icon: '🛡️',
            name: `${amount} 护盾`,
            description: `获得 ${amount} 点护盾`,
            value: amount,
        };
    }

    /**
     * 生成道具奖励
     * @private
     */
    _generateItemReward(quality, act) {
        let rarity = 'common';
        if (quality >= 3) rarity = 'rare';
        if (quality >= 4) rarity = Math.random() < 0.3 ? 'legendary' : 'rare';

        const pool = ITEMS_BY_RARITY[rarity] || ITEMS_BY_RARITY.common;
        const item = randomChoice(pool);

        return {
            type: 'item',
            icon: item.icon,
            name: item.name,
            description: item.description,
            value: item,
            itemId: item.id,
        };
    }

    /**
     * 生成技能书奖励
     * @private
     */
    _generateSkillBookReward() {
        const skills = [
            { skill: 'pronunciation', name: '发音心得', icon: '📕', value: 3 },
            { skill: 'grammar', name: '语法精要', icon: '📗', value: 3 },
            { skill: 'expression', name: '表达技巧', icon: '📘', value: 3 },
            { skill: 'fluency', name: '流畅秘诀', icon: '📙', value: 3 },
        ];
        const selected = randomChoice(skills);

        return {
            type: 'skill_book',
            icon: selected.icon,
            name: selected.name,
            description: `永久 ${selected.skill} +${selected.value}%`,
            value: selected.value,
            skill: selected.skill,
        };
    }

    /**
     * 生成能量奖励
     * @private
     */
    _generateEnergyReward() {
        return {
            type: 'energy',
            icon: '⚡',
            name: '能量恢复',
            description: '恢复 1 点能量',
            value: 1,
        };
    }

    /**
     * 应用奖励效果
     * @private
     * @param {object} reward - 奖励对象
     */
    _applyReward(reward) {
        switch (reward.type) {
            case 'gold':
                GameState.addGold(reward.value);
                break;

            case 'heal':
                GameState.heal(reward.value);
                break;

            case 'shield':
                GameState.addShield(reward.value);
                break;

            case 'item':
                if (reward.value && typeof reward.value === 'object') {
                    GameState.addItem({ ...reward.value });
                }
                break;

            case 'skill_book':
                GameState.addSkillBonus(reward.skill, reward.value);
                break;

            case 'energy':
                GameState.player.energy = Math.min(
                    GameState.player.energy + reward.value,
                    GameState.player.maxEnergy
                );
                EventBus.emit(EVENTS.PLAYER_ENERGY_CHANGED, GameState.player.energy);
                break;
        }

        EventBus.emit(EVENTS.UI_UPDATE);
    }

    /**
     * 获取当前奖励列表
     * @returns {Array}
     */
    getRewards() {
        return [...this.currentRewards];
    }

    /**
     * 是否已领取奖励
     * @returns {boolean}
     */
    isClaimed() {
        return this._claimed;
    }
}
