/**
 * 随机事件系统 - 语塔攀登
 * 管理事件节点的随机事件触发和选项处理
 */

import { EventBus, EVENTS } from '../utils/EventBus.js';
import { GameState } from '../game/GameState.js';
import { randomChoice, randomInt, generateId } from '../utils/Helpers.js';
import { EVENTS_DATA } from '../data/events.js';
import { ITEMS, ITEMS_BY_RARITY } from '../data/items.js';

export class EventSystem {
    constructor() {
        // 已出现过的事件ID（避免同一轮重复）
        this._usedEventIds = new Set();
        // 当前正在处理的事件
        this.currentEvent = null;
    }

    /**
     * 获取一个随机事件
     * @returns {object} 事件对象
     */
    getRandomEvent() {
        // 过滤掉已出现过的事件
        let available = EVENTS_DATA.filter(e => !this._usedEventIds.has(e.id));

        // 如果所有事件都出现过，重置记录
        if (available.length === 0) {
            this._usedEventIds.clear();
            available = [...EVENTS_DATA];
        }

        const event = randomChoice(available);
        this._usedEventIds.add(event.id);

        // 深拷贝事件数据，并标记哪些选项可用
        this.currentEvent = JSON.parse(JSON.stringify(event));
        this.currentEvent.choices = this.currentEvent.choices.map((choice, index) => ({
            ...choice,
            index,
            available: this.checkCondition(choice.condition),
        }));

        return this.currentEvent;
    }

    /**
     * 处理玩家的事件选择
     * @param {string} eventId - 事件ID
     * @param {number} choiceIndex - 选择索引
     * @returns {object} 处理结果 { success, outcome, message }
     */
    processChoice(eventId, choiceIndex) {
        const event = this.currentEvent;
        if (!event || event.id !== eventId) {
            console.warn(`[EventSystem] 事件不匹配: ${eventId}`);
            return { success: false, message: '事件数据错误' };
        }

        const choice = event.choices[choiceIndex];
        if (!choice) {
            console.warn(`[EventSystem] 无效的选择索引: ${choiceIndex}`);
            return { success: false, message: '无效的选择' };
        }

        // 检查选项条件
        if (!this.checkCondition(choice.condition)) {
            return { success: false, message: '条件不满足' };
        }

        let outcome = choice.outcome;
        let resultMessage = outcome.message;

        // 处理赌博类选项
        if (outcome.gamble) {
            const roll = Math.random();
            if (roll < outcome.successRate) {
                outcome = { ...outcome, ...outcome.success };
                resultMessage = outcome.success?.message || outcome.message;
            } else {
                outcome = { ...outcome, ...outcome.failure };
                resultMessage = outcome.failure?.message || outcome.message;
            }
        }

        // 应用效果
        this._applyOutcome(outcome);

        // 清空当前事件
        this.currentEvent = null;

        return {
            success: true,
            outcome,
            message: resultMessage,
        };
    }

    /**
     * 检查选项条件是否满足
     * @param {object|null} condition - 条件对象
     * @returns {boolean}
     */
    checkCondition(condition) {
        if (!condition) return true;

        switch (condition.type) {
            case 'hp_min':
                return GameState.player.hp >= condition.value;
            case 'gold_min':
                return GameState.player.gold >= condition.value;
            case 'energy_min':
                return GameState.player.energy >= condition.value;
            case 'has_item':
                return GameState.inventory.some(i => i.id === condition.value);
            case 'has_relic':
                return GameState.hasRelic(condition.value);
            case 'act_min':
                return GameState.currentAct >= condition.value;
            case 'hp_max':
                return GameState.player.hp <= condition.value;
            default:
                console.warn(`[EventSystem] 未知条件类型: ${condition.type}`);
                return true;
        }
    }

    /**
     * 应用事件选项的结果
     * @private
     * @param {object} outcome - 结果对象
     */
    _applyOutcome(outcome) {
        // HP 变化
        if (outcome.hp) {
            if (outcome.hp > 0) {
                GameState.heal(outcome.hp);
            } else {
                GameState.takeDamage(Math.abs(outcome.hp));
            }
        }

        // 金币变化
        if (outcome.gold) {
            if (outcome.gold > 0) {
                GameState.addGold(outcome.gold);
            } else {
                GameState.spendGold(Math.abs(outcome.gold));
            }
        }

        // 护盾
        if (outcome.shield) {
            GameState.addShield(outcome.shield);
        }

        // 能量变化
        if (outcome.energy) {
            GameState.player.energy = Math.max(0, GameState.player.energy + outcome.energy);
            EventBus.emit(EVENTS.PLAYER_ENERGY_CHANGED, GameState.player.energy);
        }

        // 恢复全部能量
        if (outcome.energyFull) {
            GameState.player.energy = GameState.player.maxEnergy;
            EventBus.emit(EVENTS.PLAYER_ENERGY_CHANGED, GameState.player.energy);
        }

        // 技能加成
        if (outcome.skillBonus) {
            const { skill, value } = outcome.skillBonus;
            if (skill === 'all') {
                // 全属性加成
                ['pronunciation', 'grammar', 'expression', 'fluency'].forEach(s => {
                    GameState.addSkillBonus(s, value);
                });
            } else {
                GameState.addSkillBonus(skill, value);
            }
        }

        // 获得道具
        if (outcome.item) {
            const template = ITEMS[outcome.item];
            if (template) {
                GameState.addItem({ ...template });
            }
        }

        // 获得随机道具
        if (outcome.randomItem) {
            const rarity = outcome.rarityOverride || randomChoice(['common', 'common', 'rare']);
            const pool = ITEMS_BY_RARITY[rarity] || ITEMS_BY_RARITY.common;
            if (pool.length > 0) {
                const randomItemTemplate = randomChoice(pool);
                GameState.addItem({ ...randomItemTemplate });
            }
        }

        // 添加 Buff
        if (outcome.buff) {
            GameState.buffs.push({
                ...outcome.buff,
                instanceId: generateId(),
                remainingDuration: outcome.buff.duration || 1,
            });
            EventBus.emit(EVENTS.BUFF_APPLIED, outcome.buff);
        }

        // 添加 Debuff
        if (outcome.debuff) {
            GameState.debuffs.push({
                ...outcome.debuff,
                instanceId: generateId(),
                remainingDuration: outcome.debuff.duration || 1,
            });
            EventBus.emit(EVENTS.DEBUFF_APPLIED, outcome.debuff);
        }

        // 随机 Buff（从预设中随机挑选一个）
        if (outcome.randomBuff) {
            // 延迟导入以避免循环依赖
            const buffKeys = ['confidence', 'vocab_master', 'pronunciation_power', 'iron_wall'];
            const buffId = randomChoice(buffKeys);
            // 简易buff添加
            const simpleBuff = {
                id: buffId,
                name: buffId,
                instanceId: generateId(),
                remainingDuration: 3,
                effect: { dimension: 'expression', value: 5 },
            };
            GameState.buffs.push(simpleBuff);
            EventBus.emit(EVENTS.BUFF_APPLIED, simpleBuff);
        }

        EventBus.emit(EVENTS.UI_UPDATE);
    }

    /**
     * 重置事件记录（新章节时调用）
     */
    reset() {
        this._usedEventIds.clear();
        this.currentEvent = null;
    }
}
