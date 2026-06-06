/**
 * 存档系统 - 语塔攀登
 * 使用 localStorage 管理游戏存档和历史记录
 */

import { EventBus, EVENTS } from '../utils/EventBus.js';
import { GameState } from '../game/GameState.js';

// localStorage 键名
const SAVE_KEY = 'yuta_save_run';
const HISTORY_KEY = 'yuta_history';
const SETTINGS_KEY = 'yuta_settings';
const ACHIEVEMENTS_KEY = 'yuta_achievements';

export class SaveSystem {
    constructor() {
        // 检查 localStorage 是否可用
        this._storageAvailable = this._checkStorage();
    }

    /**
     * 保存当前运行状态
     * @returns {boolean} 是否保存成功
     */
    saveRun() {
        if (!this._storageAvailable) {
            console.warn('[SaveSystem] localStorage 不可用');
            return false;
        }

        try {
            const saveData = {
                version: 1,
                timestamp: Date.now(),
                gameState: GameState.toJSON(),
            };

            localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
            EventBus.emit(EVENTS.SAVE_GAME);
            console.log('[SaveSystem] 游戏已保存');
            return true;
        } catch (e) {
            console.error('[SaveSystem] 保存失败:', e);
            return false;
        }
    }

    /**
     * 加载存档
     * @returns {boolean} 是否加载成功
     */
    loadRun() {
        if (!this._storageAvailable) {
            console.warn('[SaveSystem] localStorage 不可用');
            return false;
        }

        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) {
                console.log('[SaveSystem] 无存档数据');
                return false;
            }

            const saveData = JSON.parse(raw);

            // 版本兼容性检查
            if (!saveData.version || !saveData.gameState) {
                console.warn('[SaveSystem] 存档数据格式无效');
                return false;
            }

            GameState.fromJSON(saveData.gameState);
            EventBus.emit(EVENTS.LOAD_GAME);
            console.log('[SaveSystem] 存档已加载');
            return true;
        } catch (e) {
            console.error('[SaveSystem] 加载失败:', e);
            return false;
        }
    }

    /**
     * 检查是否有有效存档
     * @returns {boolean}
     */
    hasSave() {
        if (!this._storageAvailable) return false;

        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return false;

            const saveData = JSON.parse(raw);
            return !!(saveData.version && saveData.gameState);
        } catch {
            return false;
        }
    }

    /**
     * 删除存档
     * @returns {boolean}
     */
    deleteSave() {
        if (!this._storageAvailable) return false;

        try {
            localStorage.removeItem(SAVE_KEY);
            console.log('[SaveSystem] 存档已删除');
            return true;
        } catch (e) {
            console.error('[SaveSystem] 删除存档失败:', e);
            return false;
        }
    }

    /**
     * 获取存档信息（不加载完整数据）
     * @returns {object|null} 存档摘要 { timestamp, act, hp, floor }
     */
    getSaveInfo() {
        if (!this._storageAvailable) return null;

        try {
            const raw = localStorage.getItem(SAVE_KEY);
            if (!raw) return null;

            const saveData = JSON.parse(raw);
            if (!saveData.gameState) return null;

            const gs = saveData.gameState;
            return {
                timestamp: saveData.timestamp,
                date: new Date(saveData.timestamp).toLocaleString('zh-CN'),
                act: gs.currentAct,
                hp: gs.player?.hp || 0,
                maxHp: gs.player?.maxHp || 0,
                gold: gs.player?.gold || 0,
                floor: gs.runStats?.floorsClimbed || 0,
                scene: gs.selectedScene || 'unknown',
            };
        } catch {
            return null;
        }
    }

    /**
     * 保存一次运行的历史记录
     * @param {object} runData - 运行数据
     */
    saveHistory(runData) {
        if (!this._storageAvailable) return;

        try {
            const history = this.getHistory();

            const record = {
                id: runData.runId || Date.now().toString(36),
                timestamp: Date.now(),
                date: new Date().toLocaleString('zh-CN'),
                result: runData.result || 'unknown',     // 'victory' | 'defeat'
                act: runData.act || GameState.currentAct,
                floorsClimbed: runData.floorsClimbed || 0,
                averageScore: runData.averageScore || 0,
                highestGrade: runData.highestGrade || 'F',
                monstersDefeated: runData.monstersDefeated || 0,
                totalDamageTaken: runData.totalDamageTaken || 0,
                totalGoldEarned: runData.totalGoldEarned || 0,
                perfectRounds: runData.perfectRounds || 0,
                duration: runData.duration || 0,  // 游戏时长（秒）
                itemsUsed: runData.itemsUsed || 0,
            };

            history.unshift(record);

            // 最多保留 50 条历史记录
            const maxHistory = 50;
            if (history.length > maxHistory) {
                history.length = maxHistory;
            }

            localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
            console.log('[SaveSystem] 历史记录已保存');
        } catch (e) {
            console.error('[SaveSystem] 保存历史记录失败:', e);
        }
    }

    /**
     * 获取历史记录列表
     * @returns {Array} 历史记录数组
     */
    getHistory() {
        if (!this._storageAvailable) return [];

        try {
            const raw = localStorage.getItem(HISTORY_KEY);
            if (!raw) return [];
            return JSON.parse(raw);
        } catch {
            return [];
        }
    }

    /**
     * 清除所有历史记录
     */
    clearHistory() {
        if (!this._storageAvailable) return;
        localStorage.removeItem(HISTORY_KEY);
    }

    /**
     * 保存成就数据
     * @param {object} achievements - 成就数据
     */
    saveAchievements(achievements) {
        if (!this._storageAvailable) return;

        try {
            localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
        } catch (e) {
            console.error('[SaveSystem] 保存成就失败:', e);
        }
    }

    /**
     * 加载成就数据
     * @returns {object|null}
     */
    loadAchievements() {
        if (!this._storageAvailable) return null;

        try {
            const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }

    /**
     * 保存游戏设置
     * @param {object} settings - 设置对象
     */
    saveSettings(settings) {
        if (!this._storageAvailable) return;

        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (e) {
            console.error('[SaveSystem] 保存设置失败:', e);
        }
    }

    /**
     * 加载游戏设置
     * @returns {object} 设置对象
     */
    loadSettings() {
        if (!this._storageAvailable) return this._getDefaultSettings();

        try {
            const raw = localStorage.getItem(SETTINGS_KEY);
            if (!raw) return this._getDefaultSettings();
            return { ...this._getDefaultSettings(), ...JSON.parse(raw) };
        } catch {
            return this._getDefaultSettings();
        }
    }

    /**
     * 获取默认设置
     * @private
     * @returns {object}
     */
    _getDefaultSettings() {
        return {
            musicVolume: 0.5,
            sfxVolume: 0.7,
            language: 'zh-CN',
            difficulty: 'ROOKIE',
            showHints: true,
            autoSave: true,
        };
    }

    /**
     * 检查 localStorage 是否可用
     * @private
     * @returns {boolean}
     */
    _checkStorage() {
        try {
            const testKey = '__yuta_test__';
            localStorage.setItem(testKey, '1');
            localStorage.removeItem(testKey);
            return true;
        } catch {
            console.warn('[SaveSystem] localStorage 不可用，存档功能已禁用');
            return false;
        }
    }
}
