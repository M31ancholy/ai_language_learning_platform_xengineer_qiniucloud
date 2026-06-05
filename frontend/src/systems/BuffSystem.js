/**
 * Buff/Debuff 系统 - 语塔攀登
 * 管理正面和负面状态效果
 */

import { EventBus, EVENTS } from '../utils/EventBus.js';
import { GameState } from '../game/GameState.js';
import { generateId } from '../utils/Helpers.js';

// ============ 预设 Buff 数据 ============
export const PRESET_BUFFS = {
    perfect_combo: {
        id: 'perfect_combo',
        name: '完美连击',
        icon: '🔥',
        description: '下一关不扣血',
        duration: 1,
        effect: { type: 'no_damage' },
    },
    vocab_master: {
        id: 'vocab_master',
        name: '词汇大师',
        icon: '📚',
        description: '表达评分 +15%',
        duration: 3,
        effect: { dimension: 'expression', value: 15 },
    },
    pronunciation_power: {
        id: 'pronunciation_power',
        name: '发音之力',
        icon: '🎤',
        description: '发音评分 +10%',
        duration: 3,
        effect: { dimension: 'pronunciation', value: 10 },
    },
    iron_wall: {
        id: 'iron_wall',
        name: '铁壁',
        icon: '🧱',
        description: '每关开始时 +5 护盾',
        duration: 3,
        effect: { type: 'shield_per_turn', value: 5 },
    },
    grammar_insight: {
        id: 'grammar_insight',
        name: '语法洞察',
        icon: '🔍',
        description: '语法评分 +10%',
        duration: 3,
        effect: { dimension: 'grammar', value: 10 },
    },
    confidence: {
        id: 'confidence',
        name: '自信',
        icon: '💪',
        description: '全维度评分 +5%',
        duration: 2,
        effect: { dimension: 'all', value: 5 },
    },
    fluent_flow: {
        id: 'fluent_flow',
        name: '流畅之流',
        icon: '🌊',
        description: '流畅度 +12%',
        duration: 3,
        effect: { dimension: 'fluency', value: 12 },
    },
};

// ============ 预设 Debuff 数据 ============
export const PRESET_DEBUFFS = {
    nervous: {
        id: 'nervous',
        name: '紧张',
        icon: '😰',
        description: '流畅度 -15%',
        duration: 2,
        effect: { dimension: 'fluency', value: -15 },
    },
    silence: {
        id: 'silence',
        name: '沉默',
        icon: '🤐',
        description: '不显示提示词',
        duration: 2,
        effect: { type: 'hide_hints' },
    },
    bleeding: {
        id: 'bleeding',
        name: '流血',
        icon: '🩸',
        description: '每关 -3 HP',
        duration: 3,
        effect: { type: 'damage_per_turn', value: 3 },
    },
    fatigue: {
        id: 'fatigue',
        name: '疲劳',
        icon: '😴',
        description: '最大能量 -1',
        duration: 2,
        effect: { type: 'energy_reduce', value: 1 },
    },
    confusion: {
        id: 'confusion',
        name: '混乱',
        icon: '😵',
        description: '发音评分 -10%',
        duration: 2,
        effect: { dimension: 'pronunciation', value: -10 },
    },
    pressure: {
        id: 'pressure',
        name: '压力',
        icon: '⏰',
        description: '回答时间 -10秒',
        duration: 2,
        effect: { type: 'time_reduce', value: 10 },
    },
};

export class BuffSystem {
    constructor() {
        // 直接使用 GameState 的 buffs/debuffs 数组
    }

    /**
     * 添加正面 Buff
     * @param {object|string} buff - Buff对象或预设Buff的ID
     * @returns {object} 添加的buff
     */
    addBuff(buff) {
        // 如果传入字符串，从预设中查找
        if (typeof buff === 'string') {
            const preset = PRESET_BUFFS[buff];
            if (!preset) {
                console.warn(`[BuffSystem] 未知buff ID: ${buff}`);
                return null;
            }
            buff = { ...preset };
        }

        // 生成唯一实例ID
        const buffInstance = {
            ...buff,
            instanceId: generateId(),
            remainingDuration: buff.duration || 1,
        };

        // 检查是否已有同类型buff（如果有，刷新持续时间而非叠加）
        const existingIdx = GameState.buffs.findIndex(b => b.id === buff.id);
        if (existingIdx !== -1) {
            GameState.buffs[existingIdx].remainingDuration = buffInstance.remainingDuration;
            EventBus.emit(EVENTS.BUFF_APPLIED, GameState.buffs[existingIdx]);
            return GameState.buffs[existingIdx];
        }

        GameState.buffs.push(buffInstance);
        EventBus.emit(EVENTS.BUFF_APPLIED, buffInstance);
        EventBus.emit(EVENTS.UI_UPDATE);
        return buffInstance;
    }

    /**
     * 添加负面 Debuff
     * @param {object|string} debuff - Debuff对象或预设Debuff的ID
     * @returns {object} 添加的debuff
     */
    addDebuff(debuff) {
        if (typeof debuff === 'string') {
            const preset = PRESET_DEBUFFS[debuff];
            if (!preset) {
                console.warn(`[BuffSystem] 未知debuff ID: ${debuff}`);
                return null;
            }
            debuff = { ...preset };
        }

        const debuffInstance = {
            ...debuff,
            instanceId: generateId(),
            remainingDuration: debuff.duration || 1,
        };

        // 同类型debuff刷新持续时间
        const existingIdx = GameState.debuffs.findIndex(d => d.id === debuff.id);
        if (existingIdx !== -1) {
            GameState.debuffs[existingIdx].remainingDuration = debuffInstance.remainingDuration;
            EventBus.emit(EVENTS.DEBUFF_APPLIED, GameState.debuffs[existingIdx]);
            return GameState.debuffs[existingIdx];
        }

        GameState.debuffs.push(debuffInstance);

        // 应用即时效果
        this._applyImmediateEffect(debuffInstance);

        EventBus.emit(EVENTS.DEBUFF_APPLIED, debuffInstance);
        EventBus.emit(EVENTS.UI_UPDATE);
        return debuffInstance;
    }

    /**
     * 每关结束后更新：减少所有 buff/debuff 的持续时间
     * 持续时间归零的自动移除
     */
    tickBuffs() {
        // 处理buff的每回合效果
        GameState.buffs.forEach(buff => {
            if (buff.effect?.type === 'shield_per_turn') {
                GameState.addShield(buff.effect.value);
            }
        });

        // 处理debuff的每回合效果
        GameState.debuffs.forEach(debuff => {
            if (debuff.effect?.type === 'damage_per_turn') {
                GameState.takeDamage(debuff.effect.value);
            }
        });

        // 减少持续时间
        GameState.buffs = GameState.buffs.filter(buff => {
            buff.remainingDuration--;
            if (buff.remainingDuration <= 0) {
                EventBus.emit(EVENTS.BUFF_REMOVED, buff);
                return false;
            }
            return true;
        });

        GameState.debuffs = GameState.debuffs.filter(debuff => {
            debuff.remainingDuration--;
            if (debuff.remainingDuration <= 0) {
                // 移除时恢复即时效果
                this._removeImmediateEffect(debuff);
                EventBus.emit(EVENTS.BUFF_REMOVED, debuff);
                return false;
            }
            return true;
        });

        EventBus.emit(EVENTS.UI_UPDATE);
    }

    /**
     * 获取所有活跃的正面 Buff
     * @returns {Array}
     */
    getActiveBuffs() {
        return [...GameState.buffs];
    }

    /**
     * 获取所有活跃的负面 Debuff
     * @returns {Array}
     */
    getActiveDebuffs() {
        return [...GameState.debuffs];
    }

    /**
     * 获取某个评分维度的总修正值
     * @param {string} dimension - 维度名称 ('pronunciation'|'grammar'|'expression'|'fluency')
     * @returns {number} 修正百分比值（正为加成，负为减益）
     */
    getScoreModifier(dimension) {
        let modifier = 0;

        // 累计 buff 修正
        GameState.buffs.forEach(buff => {
            if (buff.effect?.dimension === dimension) {
                modifier += buff.effect.value;
            }
            // 全维度加成
            if (buff.effect?.dimension === 'all') {
                modifier += buff.effect.value;
            }
        });

        // 累计 debuff 修正
        GameState.debuffs.forEach(debuff => {
            if (debuff.effect?.dimension === dimension) {
                modifier += debuff.effect.value; // debuff的value本身为负值
            }
            if (debuff.effect?.dimension === 'all') {
                modifier += debuff.effect.value;
            }
        });

        return modifier;
    }

    /**
     * 检查是否有免伤 buff
     * @returns {boolean}
     */
    hasNoDamageBuff() {
        return GameState.buffs.some(b => b.effect?.type === 'no_damage');
    }

    /**
     * 检查是否有隐藏提示的 debuff
     * @returns {boolean}
     */
    hasHideHintDebuff() {
        return GameState.debuffs.some(d => d.effect?.type === 'hide_hints');
    }

    /**
     * 获取时间修正值（秒）
     * @returns {number} 时间修正（正为增加，负为减少）
     */
    getTimeModifier() {
        let modifier = 0;
        GameState.debuffs.forEach(debuff => {
            if (debuff.effect?.type === 'time_reduce') {
                modifier -= debuff.effect.value;
            }
        });
        GameState.buffs.forEach(buff => {
            if (buff.effect?.type === 'time_extend') {
                modifier += buff.effect.value;
            }
        });
        return modifier;
    }

    /**
     * 移除指定的 Buff
     * @param {string} id - buff 的 id
     */
    removeBuff(id) {
        const idx = GameState.buffs.findIndex(b => b.id === id);
        if (idx !== -1) {
            const removed = GameState.buffs.splice(idx, 1)[0];
            EventBus.emit(EVENTS.BUFF_REMOVED, removed);
            EventBus.emit(EVENTS.UI_UPDATE);
        }
    }

    /**
     * 移除指定的 Debuff
     * @param {string} id - debuff 的 id
     */
    removeDebuff(id) {
        const idx = GameState.debuffs.findIndex(d => d.id === id);
        if (idx !== -1) {
            const removed = GameState.debuffs.splice(idx, 1)[0];
            this._removeImmediateEffect(removed);
            EventBus.emit(EVENTS.BUFF_REMOVED, removed);
            EventBus.emit(EVENTS.UI_UPDATE);
        }
    }

    /**
     * 清除所有 Debuff
     */
    clearAllDebuffs() {
        GameState.debuffs.forEach(debuff => {
            this._removeImmediateEffect(debuff);
        });
        GameState.debuffs = [];
        EventBus.emit(EVENTS.UI_UPDATE);
    }

    /**
     * 清除所有 Buff
     */
    clearAllBuffs() {
        GameState.buffs = [];
        EventBus.emit(EVENTS.UI_UPDATE);
    }

    /**
     * 应用debuff的即时效果（如减少能量上限）
     * @private
     */
    _applyImmediateEffect(debuff) {
        if (debuff.effect?.type === 'energy_reduce') {
            GameState.player.maxEnergy = Math.max(1, GameState.player.maxEnergy - debuff.effect.value);
            GameState.player.energy = Math.min(GameState.player.energy, GameState.player.maxEnergy);
            EventBus.emit(EVENTS.PLAYER_ENERGY_CHANGED, GameState.player.energy);
        }
    }

    /**
     * 移除debuff时恢复即时效果
     * @private
     */
    _removeImmediateEffect(debuff) {
        if (debuff.effect?.type === 'energy_reduce') {
            GameState.player.maxEnergy += debuff.effect.value;
            EventBus.emit(EVENTS.PLAYER_ENERGY_CHANGED, GameState.player.energy);
        }
    }
}
