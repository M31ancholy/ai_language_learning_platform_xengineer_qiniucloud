/**
 * 背包系统 - 语塔攀登
 * 封装 GameState 的背包操作，提供便捷方法和视觉效果支持
 */

import { CONSTANTS } from '../utils/Constants.js';
import { EventBus, EVENTS } from '../utils/EventBus.js';
import { GameState } from '../game/GameState.js';
import { generateId } from '../utils/Helpers.js';
import { ITEMS } from '../data/items.js';

export class InventorySystem {
    constructor() {
        // 道具使用效果的视觉回调注册表
        this._effectCallbacks = {};
    }

    /**
     * 添加道具到背包
     * @param {object|string} item - 道具对象或道具ID
     * @returns {boolean} 是否添加成功
     */
    addItem(item) {
        // 如果传入的是字符串ID，从道具库中查找
        if (typeof item === 'string') {
            const template = ITEMS[item];
            if (!template) {
                console.warn(`[InventorySystem] 未知道具ID: ${item}`);
                return false;
            }
            item = { ...template };
        }

        if (this.isFull()) {
            console.warn('[InventorySystem] 背包已满，无法添加道具');
            EventBus.emit('inventory:full', item);
            return false;
        }

        return GameState.addItem(item);
    }

    /**
     * 从背包中移除道具
     * @param {string} instanceId - 道具实例ID
     * @returns {object|false} 被移除的道具或false
     */
    removeItem(instanceId) {
        return GameState.removeItem(instanceId);
    }

    /**
     * 使用道具（并触发视觉效果）
     * @param {string} instanceId - 道具实例ID
     * @param {Phaser.Scene} scene - 当前场景（用于播放视觉效果）
     * @returns {boolean} 是否使用成功
     */
    useItem(instanceId, scene = null) {
        const item = GameState.inventory.find(i => i.instanceId === instanceId);
        if (!item) {
            console.warn(`[InventorySystem] 找不到道具实例: ${instanceId}`);
            return false;
        }

        // 检查道具是否可在当前上下文中使用
        const context = this._getCurrentContext();
        if (item.usableIn && !item.usableIn.includes(context)) {
            console.warn(`[InventorySystem] 道具 ${item.name} 不能在 ${context} 中使用`);
            EventBus.emit('inventory:cannotUse', { item, context });
            return false;
        }

        // 使用道具（通过 GameState 应用效果并移除）
        const success = GameState.useItem(instanceId);

        if (success && scene) {
            // 播放使用效果动画
            this._playUseEffect(scene, item);
        }

        return success;
    }

    /**
     * 获取所有背包道具
     * @returns {Array} 道具列表
     */
    getItems() {
        return [...GameState.inventory];
    }

    /**
     * 检查背包是否已满
     * @returns {boolean}
     */
    isFull() {
        return GameState.inventory.length >= CONSTANTS.PLAYER.INVENTORY_SIZE;
    }

    /**
     * 获取当前上下文中可用的道具
     * @param {string} context - 使用上下文 ('battle' | 'map')
     * @returns {Array} 可用道具列表
     */
    getUsableItems(context) {
        return GameState.inventory.filter(item => {
            if (!item.usableIn) return true;
            return item.usableIn.includes(context);
        });
    }

    /**
     * 获取背包剩余空间
     * @returns {number}
     */
    getRemainingSlots() {
        return CONSTANTS.PLAYER.INVENTORY_SIZE - GameState.inventory.length;
    }

    /**
     * 根据道具ID查找背包中的道具
     * @param {string} itemId - 道具模板ID
     * @returns {object|undefined}
     */
    findItemById(itemId) {
        return GameState.inventory.find(i => i.id === itemId);
    }

    /**
     * 检查背包中是否有某种道具
     * @param {string} itemId - 道具模板ID
     * @returns {boolean}
     */
    hasItem(itemId) {
        return GameState.inventory.some(i => i.id === itemId);
    }

    /**
     * 获取当前使用上下文
     * @private
     * @returns {string} 'battle' 或 'map'
     */
    _getCurrentContext() {
        if (GameState.currentBattle) {
            return 'battle';
        }
        return 'map';
    }

    /**
     * 播放道具使用的视觉效果
     * @private
     * @param {Phaser.Scene} scene - 当前场景
     * @param {object} item - 道具对象
     */
    _playUseEffect(scene, item) {
        if (!scene || !scene.add) return;

        const centerX = CONSTANTS.GAME_WIDTH / 2;
        const centerY = CONSTANTS.GAME_HEIGHT / 2;

        // 显示道具图标和名称的浮动文字
        const iconText = scene.add.text(centerX, centerY, item.icon || '✨', {
            fontSize: '48px',
        }).setOrigin(0.5).setDepth(1000);

        const nameText = scene.add.text(centerX, centerY + 40, item.name, {
            fontSize: '16px',
            color: '#ffd700',
            fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(1000);

        // 上浮并淡出动画
        scene.tweens.add({
            targets: [iconText, nameText],
            y: '-=60',
            alpha: 0,
            duration: 1200,
            ease: 'Power2',
            onComplete: () => {
                iconText.destroy();
                nameText.destroy();
            },
        });

        // 根据效果类型播放不同的颜色闪烁
        const effectColor = this._getEffectColor(item.effect?.type);
        if (effectColor !== null) {
            const flash = scene.add.rectangle(
                centerX, centerY,
                CONSTANTS.GAME_WIDTH, CONSTANTS.GAME_HEIGHT,
                effectColor, 0.3
            ).setDepth(999);

            scene.tweens.add({
                targets: flash,
                alpha: 0,
                duration: 500,
                onComplete: () => flash.destroy(),
            });
        }
    }

    /**
     * 获取效果类型对应的颜色
     * @private
     * @param {string} effectType - 效果类型
     * @returns {number|null} 颜色值
     */
    _getEffectColor(effectType) {
        const colorMap = {
            heal: CONSTANTS.COLORS.SUCCESS,
            shield: CONSTANTS.COLORS.SHIELD_BLUE,
            gold: CONSTANTS.COLORS.GOLD,
            energy: CONSTANTS.COLORS.WARNING,
            skill_bonus: CONSTANTS.COLORS.PURPLE,
            battle_hint: CONSTANTS.COLORS.ACCENT,
            time_extend: CONSTANTS.COLORS.ACCENT,
            retry: CONSTANTS.COLORS.WARNING,
            min_grade: CONSTANTS.COLORS.LEGENDARY,
            escape: CONSTANTS.COLORS.TEXT_DIM,
            revive: CONSTANTS.COLORS.LEGENDARY,
        };
        return colorMap[effectType] ?? null;
    }
}
