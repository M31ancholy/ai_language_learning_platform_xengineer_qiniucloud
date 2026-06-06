/**
 * 语塔攀登 - 全局游戏状态（单例）
 * 管理玩家数据、地图进度、当前运行状态
 */

import { CONSTANTS } from '../utils/Constants.js';
import { EventBus, EVENTS } from '../utils/EventBus.js';
import { clamp, generateId, deepClone } from '../utils/Helpers.js';
import { MapNode } from '../map/MapNode.js';

class GameStateClass {
    constructor() {
        this.reset();
    }

    /**
     * 重置所有状态（新游戏）
     */
    reset() {
        // 运行标识
        this.runId = generateId();
        this.isRunActive = false;

        // 当前章节
        this.currentAct = 1;

        // 玩家属性
        this.player = {
            hp: CONSTANTS.PLAYER.INITIAL_HP,
            maxHp: CONSTANTS.PLAYER.MAX_HP,
            shield: CONSTANTS.PLAYER.INITIAL_SHIELD,
            gold: CONSTANTS.PLAYER.INITIAL_GOLD,
            energy: CONSTANTS.PLAYER.INITIAL_ENERGY,
            maxEnergy: CONSTANTS.PLAYER.INITIAL_ENERGY,
        };

        // 背包
        this.inventory = []; // { id, name, icon, effect, ... }

        // 遗物（永久被动效果）
        this.relics = [];

        // Buff/Debuff
        this.buffs = [];   // { id, name, duration, effect }
        this.debuffs = [];

        // 技能加成（永久）
        this.skillBonus = {
            pronunciation: 0,  // 发音评分加成 %
            grammar: 0,        // 语法评分加成 %
            expression: 0,     // 表达评分加成 %
            fluency: 0,        // 流畅度加成 %
        };

        // 地图状态
        this.map = null;          // 当前地图数据
        this.currentNodeId = null; // 当前所在节点
        this.completedNodes = [];  // 已完成节点列表
        this.currentRow = -1;      // 当前所在层数

        // 战斗统计（当前运行）
        this.runStats = {
            floorsClimbed: 0,
            monstersDefeated: 0,
            elitesDefeated: 0,
            bossesDefeated: 0,
            totalScore: 0,
            scoreCount: 0,
            highestGrade: 'F',
            lowestGrade: 'S',
            totalDamageTaken: 0,
            totalGoldEarned: 0,
            totalHealingDone: 0,
            perfectRounds: 0,    // S级次数
            comboCount: 0,       // 连续S级计数
            itemsUsed: 0,
            startTime: Date.now(),
        };

        // 当前战斗状态（临时）
        this.currentBattle = null;

        // 课后总结数据
        this.lastSummary = null;

        // 选定的场景（'interview' | 'restaurant' | 'meeting' | 'random'）
        this.selectedScene = null;
    }


    // ========== 生命值操作 ==========

    /**
     * 扣血
     * @param {number} amount - 伤害量
     * @returns {number} 实际扣除的HP
     */
    takeDamage(amount) {
        let remaining = amount;

        // 先扣护盾
        if (this.player.shield > 0) {
            const shieldDmg = Math.min(this.player.shield, remaining);
            this.player.shield -= shieldDmg;
            remaining -= shieldDmg;
            EventBus.emit(EVENTS.PLAYER_SHIELD_CHANGED, this.player.shield);
        }

        // 再扣HP
        if (remaining > 0) {
            this.player.hp = Math.max(0, this.player.hp - remaining);
            this.runStats.totalDamageTaken += remaining;
            EventBus.emit(EVENTS.PLAYER_HP_CHANGED, this.player.hp, this.player.maxHp);
        }

        // 死亡判定
        if (this.player.hp <= 0) {
            EventBus.emit(EVENTS.PLAYER_DIED);
        }

        EventBus.emit(EVENTS.UI_UPDATE);
        return amount - (amount - remaining);
    }

    /**
     * 恢复生命值
     * @param {number} amount - 恢复量
     */
    heal(amount) {
        const before = this.player.hp;
        this.player.hp = clamp(this.player.hp + amount, 0, this.player.maxHp);
        const actual = this.player.hp - before;
        this.runStats.totalHealingDone += actual;
        EventBus.emit(EVENTS.PLAYER_HP_CHANGED, this.player.hp, this.player.maxHp);
        EventBus.emit(EVENTS.UI_UPDATE);
        return actual;
    }

    /**
     * 增加护盾
     */
    addShield(amount) {
        this.player.shield += amount;
        EventBus.emit(EVENTS.PLAYER_SHIELD_CHANGED, this.player.shield);
        EventBus.emit(EVENTS.UI_UPDATE);
    }

    // ========== 金币操作 ==========

    addGold(amount) {
        this.player.gold += amount;
        if (amount > 0) this.runStats.totalGoldEarned += amount;
        EventBus.emit(EVENTS.PLAYER_GOLD_CHANGED, this.player.gold);
        EventBus.emit(EVENTS.UI_UPDATE);
    }

    spendGold(amount) {
        if (this.player.gold < amount) return false;
        this.player.gold -= amount;
        EventBus.emit(EVENTS.PLAYER_GOLD_CHANGED, this.player.gold);
        EventBus.emit(EVENTS.UI_UPDATE);
        return true;
    }

    canAfford(amount) {
        return this.player.gold >= amount;
    }

    // ========== 背包操作 ==========

    addItem(item) {
        if (this.inventory.length >= CONSTANTS.PLAYER.INVENTORY_SIZE) return false;
        this.inventory.push({ ...item, instanceId: generateId() });
        EventBus.emit(EVENTS.ITEM_ACQUIRED, item);
        EventBus.emit(EVENTS.UI_UPDATE);
        return true;
    }

    removeItem(instanceId) {
        const idx = this.inventory.findIndex(i => i.instanceId === instanceId);
        if (idx === -1) return false;
        const item = this.inventory.splice(idx, 1)[0];
        EventBus.emit(EVENTS.ITEM_REMOVED, item);
        EventBus.emit(EVENTS.UI_UPDATE);
        return item;
    }

    useItem(instanceId) {
        const item = this.inventory.find(i => i.instanceId === instanceId);
        if (!item) return false;

        // 应用道具效果
        if (item.effect) {
            this._applyItemEffect(item.effect);
        }

        this.removeItem(instanceId);
        this.runStats.itemsUsed++;
        EventBus.emit(EVENTS.ITEM_USED, item);
        return true;
    }

    _applyItemEffect(effect) {
        switch (effect.type) {
            case 'heal':
                this.heal(effect.value);
                break;
            case 'shield':
                this.addShield(effect.value);
                break;
            case 'gold':
                this.addGold(effect.value);
                break;
            case 'energy':
                this.player.maxEnergy += effect.value;
                this.player.energy = this.player.maxEnergy;
                break;
            case 'skill_bonus':
                if (effect.skill && this.skillBonus[effect.skill] !== undefined) {
                    this.skillBonus[effect.skill] += effect.value;
                }
                break;
        }
    }

    // ========== 遗物操作 ==========

    addRelic(relic) {
        this.relics.push({ ...relic, instanceId: generateId() });
        if (relic.onAcquire) {
            this._applyItemEffect(relic.onAcquire);
        }
        EventBus.emit(EVENTS.UI_UPDATE);
    }

    hasRelic(relicId) {
        return this.relics.some(r => r.id === relicId);
    }

    // ========== 技能加成 ==========

    getSkillBonus(skill) {
        return this.skillBonus[skill] || 0;
    }

    addSkillBonus(skill, value) {
        if (this.skillBonus[skill] !== undefined) {
            this.skillBonus[skill] += value;
        }
    }

    // ========== 地图进度 ==========

    completeNode(nodeId) {
        if (!this.completedNodes.includes(nodeId)) {
            this.completedNodes.push(nodeId);
        }
        this.runStats.floorsClimbed++;
        this.save(); // 立即自动保存，防止刷新丢失进度
        EventBus.emit(EVENTS.MAP_NODE_COMPLETED, nodeId);
    }

    isNodeCompleted(nodeId) {
        return this.completedNodes.includes(nodeId);
    }

    getAvailableNodes() {
        if (!this.map) return [];
        if (this.currentRow === -1) {
            // 起始节点
            return this.map.nodes.filter(n => n.row === 0);
        }
        // 获取当前节点的所有子节点
        const currentNode = this.map.nodes.find(n => n.id === this.currentNodeId);
        if (!currentNode) return [];
        return this.map.nodes.filter(n =>
            currentNode.connections.includes(n.id)
        );
    }

    // ========== 战斗统计 ==========

    recordBattleResult(grade, score) {
        this.runStats.totalScore += score;
        this.runStats.scoreCount++;

        // 更新最高/最低评级
        const gradeOrder = ['S', 'A', 'B', 'C', 'D', 'F'];
        const currentHighIdx = gradeOrder.indexOf(this.runStats.highestGrade);
        const currentLowIdx = gradeOrder.indexOf(this.runStats.lowestGrade);
        const newIdx = gradeOrder.indexOf(grade);

        if (newIdx < currentHighIdx) this.runStats.highestGrade = grade;
        if (newIdx > currentLowIdx) this.runStats.lowestGrade = grade;

        // 完美连击
        if (grade === 'S') {
            this.runStats.perfectRounds++;
            this.runStats.comboCount++;
        } else {
            this.runStats.comboCount = 0;
        }
    }

    getAverageScore() {
        if (this.runStats.scoreCount === 0) return 0;
        return Math.round(this.runStats.totalScore / this.runStats.scoreCount);
    }

    // ========== 存档 ==========

    save() {
        try {
            localStorage.setItem('wordspire_save', JSON.stringify(this.toJSON()));
            console.log('[GameState] 自动存档成功');
        } catch (e) {
            console.warn('[GameState] 自动存档失败:', e);
        }
    }

    toJSON() {
        return {
            runId: this.runId,
            currentAct: this.currentAct,
            selectedScene: this.selectedScene,
            player: deepClone(this.player),
            inventory: deepClone(this.inventory),
            relics: deepClone(this.relics),
            buffs: deepClone(this.buffs),
            debuffs: deepClone(this.debuffs),
            skillBonus: deepClone(this.skillBonus),
            map: this.map ? deepClone(this.map) : null,
            currentNodeId: this.currentNodeId,
            completedNodes: [...this.completedNodes],
            currentRow: this.currentRow,
            runStats: deepClone(this.runStats),
        };
    }


    fromJSON(data) {
        const cloned = deepClone(data);
        Object.assign(this, cloned);
        
        // 重建 MapNode 实例以保留 getPosition 等方法
        if (this.map && this.map.nodes) {
            this.map.nodes = this.map.nodes.map(nodeData => {
                const node = new MapNode(nodeData.row, nodeData.col, nodeData.type);
                Object.assign(node, nodeData);
                return node;
            });
        }

        this.isRunActive = true;
        EventBus.emit(EVENTS.UI_UPDATE);
    }

    /**
     * 检查是否存活
     */
    isAlive() {
        return this.player.hp > 0;
    }
}

// 全局单例
export const GameState = new GameStateClass();
