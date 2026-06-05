/**
 * 语塔攀登 - 事件总线
 * 跨场景/模块通信的核心事件系统
 */

class EventBusClass {
    constructor() {
        this.listeners = {};
    }

    /**
     * 注册事件监听器
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     * @param {object} context - 上下文
     */
    on(event, callback, context = null) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push({ callback, context });
    }

    /**
     * 注册一次性事件监听器
     */
    once(event, callback, context = null) {
        const wrapper = (...args) => {
            callback.apply(context, args);
            this.off(event, wrapper);
        };
        this.on(event, wrapper, context);
    }

    /**
     * 移除事件监听器
     */
    off(event, callback) {
        if (!this.listeners[event]) return;
        if (callback) {
            this.listeners[event] = this.listeners[event].filter(
                l => l.callback !== callback
            );
        } else {
            delete this.listeners[event];
        }
    }

    /**
     * 触发事件
     * @param {string} event - 事件名称
     * @param {...any} args - 参数
     */
    emit(event, ...args) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(listener => {
            listener.callback.apply(listener.context, args);
        });
    }

    /**
     * 清除所有监听器
     */
    clear() {
        this.listeners = {};
    }
}

// 事件名称常量
export const EVENTS = {
    // 玩家状态事件
    PLAYER_HP_CHANGED: 'player:hpChanged',
    PLAYER_SHIELD_CHANGED: 'player:shieldChanged',
    PLAYER_GOLD_CHANGED: 'player:goldChanged',
    PLAYER_ENERGY_CHANGED: 'player:energyChanged',
    PLAYER_DIED: 'player:died',

    // 战斗事件
    BATTLE_START: 'battle:start',
    BATTLE_END: 'battle:end',
    BATTLE_SCORE: 'battle:score',
    RECORDING_START: 'recording:start',
    RECORDING_STOP: 'recording:stop',
    RECORDING_RESULT: 'recording:result',

    // 地图事件
    MAP_NODE_SELECTED: 'map:nodeSelected',
    MAP_NODE_COMPLETED: 'map:nodeCompleted',
    MAP_ACT_COMPLETED: 'map:actCompleted',

    // 道具事件
    ITEM_USED: 'item:used',
    ITEM_ACQUIRED: 'item:acquired',
    ITEM_REMOVED: 'item:removed',

    // Buff事件
    BUFF_APPLIED: 'buff:applied',
    BUFF_REMOVED: 'buff:removed',
    DEBUFF_APPLIED: 'debuff:applied',

    // 商店事件
    SHOP_PURCHASE: 'shop:purchase',

    // UI事件
    UI_UPDATE: 'ui:update',
    SCENE_TRANSITION: 'scene:transition',
    SHOW_TOOLTIP: 'ui:showTooltip',
    HIDE_TOOLTIP: 'ui:hideTooltip',

    // 存档事件
    SAVE_GAME: 'save:game',
    LOAD_GAME: 'load:game',
};

// 全局单例
export const EventBus = new EventBusClass();
