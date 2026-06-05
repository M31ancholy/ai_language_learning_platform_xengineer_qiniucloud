/**
 * 商店系统 - 语塔攀登
 * 管理商店商品生成、价格计算与购买逻辑
 */

import { CONSTANTS } from '../utils/Constants.js';
import { EventBus, EVENTS } from '../utils/EventBus.js';
import { GameState } from '../game/GameState.js';
import { randomChoice, weightedRandom, generateId } from '../utils/Helpers.js';
import { ITEMS } from '../data/items.js';
import { SHOP_DATA } from '../data/shop.js';

export class ShopSystem {
    constructor() {
        this.currentGoods = [];
        this._purchased = new Set();
    }

    /**
     * 生成商店商品列表
     * @param {number} act - 当前章节 (1/2/3)
     * @returns {Array} 商品列表
     */
    generateShopItems(act) {
        this.currentGoods = [];
        this._purchased = new Set();

        const itemSlots = SHOP_DATA.itemSlots || 6;
        const weights = SHOP_DATA.slotWeights || { common: 50, rare: 30, epic: 15, curse: 5 };
        const priceMultiplier = SHOP_DATA.actPriceMultiplier[act] || 1.0;

        // 建立 ID 对应物品的映射表
        const itemMap = {};
        for (const item of ITEMS) {
            itemMap[item.id] = item;
        }

        // 商品池映射
        const pools = {
            common: SHOP_DATA.commonPool,
            rare: SHOP_DATA.rarePool,
            epic: SHOP_DATA.epicPool,
            curse: SHOP_DATA.cursePool
        };

        const usedIds = new Set();

        for (let i = 0; i < itemSlots; i++) {
            // 根据权重选择一种稀有度
            const rarity = weightedRandom(weights);
            const pool = pools[rarity] || pools.common;

            // 过滤掉已经在当前商店重复的物品
            const available = pool.filter(id => !usedIds.has(id) && itemMap[id]);
            
            // 如果某稀有度被选空，则尝试从普通池找不重复的
            let selectedId = null;
            if (available.length > 0) {
                selectedId = randomChoice(available);
            } else {
                const fallbackPool = pools.common.filter(id => !usedIds.has(id) && itemMap[id]);
                if (fallbackPool.length > 0) {
                    selectedId = randomChoice(fallbackPool);
                }
            }

            if (selectedId && itemMap[selectedId]) {
                const template = itemMap[selectedId];
                usedIds.add(selectedId);

                // 计算价格波动 (90% - 110%)
                const variance = 0.9 + Math.random() * 0.2;
                const finalPrice = Math.round(template.price * priceMultiplier * variance);

                this.currentGoods.push({
                    ...template,
                    instanceId: generateId(),
                    price: finalPrice
                });
            }
        }

        return this.currentGoods;
    }

    /**
     * 购买商品
     * @param {string} instanceId - 商品实例ID
     * @returns {object|false} 购买的商品
     */
    purchaseItem(instanceId) {
        const idx = this.currentGoods.findIndex(g => g.instanceId === instanceId);
        if (idx === -1) return false;

        const good = this.currentGoods[idx];
        const finalPrice = good.price;

        if (!GameState.canAfford(finalPrice)) {
            return false;
        }

        if (GameState.inventory.length >= CONSTANTS.PLAYER.INVENTORY_SIZE) {
            return false;
        }

        // 消耗金币
        GameState.spendGold(finalPrice);
        // 加入背包
        GameState.addItem(good);

        // 移出商店货架
        this.currentGoods.splice(idx, 1);
        this._purchased.add(instanceId);

        EventBus.emit(EVENTS.SHOP_PURCHASE, good);
        return good;
    }

    /**
     * 检查是否买得起
     */
    canAfford(instanceId) {
        const item = this.currentGoods.find(g => g.instanceId === instanceId);
        if (!item) return false;
        return GameState.canAfford(item.price);
    }
}
