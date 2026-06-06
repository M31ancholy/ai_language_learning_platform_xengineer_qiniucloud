/**
 * 语塔攀登 - 商店场景
 * 旅行商人的小摊，玩家可以购买道具
 */

import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants.js';
import { EventBus, EVENTS } from '../utils/EventBus.js';
import { GameState } from '../game/GameState.js';
import { createPixelText } from '../utils/PixelText.js';
import { ShopSystem } from '../systems/ShopSystem.js';

export class ShopScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.SHOP });
    }

    init(data) {
        this.act = data?.act || GameState.currentAct || 1;
        this.discount = data?.discount || 1.0;
        this.merchantLine = data?.merchantLine || '"欢迎光临！看看有什么中意的吧～"';
        
        if (data?.items && data.items.length > 0) {
            this.shopItems = data.items;
        } else {
            const shopSys = new ShopSystem();
            this.shopItems = shopSys.generateShopItems(this.act);
        }
    }

    create() {
        const { width, height } = this.scale;
        const C = CONSTANTS.COLORS;

        // 背景
        this.cameras.main.setBackgroundColor(C.BG_DARK);
        this._drawBackground(width, height);

        // 标题
        createPixelText(this, width / 2, 36, '🏠 旅行商人的小摊', 'title');

        // 商人台词
        this.merchantText = createPixelText(this, width / 2, 72, this.merchantLine, 'small', {
            color: '#ffd700',
            wordWrap: { width: width - 100 },
        });

        // 商品格子区域（2行3列）
        this.itemCards = [];
        this._createItemGrid(width, height);

        // 底部状态栏
        this._createStatusBar(width, height);

        // 离开商店按钮
        this._createLeaveButton(width, height);

        // 折扣提示
        if (this.discount !== 1.0) {
            const discountLabel = this.discount < 1
                ? `🔥 折扣中！${Math.round(this.discount * 100)}%`
                : `⚠️ 涨价中 ×${this.discount}`;
            createPixelText(this, width / 2, 100, discountLabel, 'small', {
                color: this.discount < 1 ? '#4caf50' : '#ff2d2d',
            });
        }
    }

    // ========== 背景绘制 ==========

    _drawBackground(w, h) {
        const g = this.add.graphics();
        // 装饰边框
        g.lineStyle(2, CONSTANTS.COLORS.PRIMARY, 0.6);
        g.strokeRect(10, 10, w - 20, h - 20);
        // 内层面板
        g.fillStyle(CONSTANTS.COLORS.BG_PANEL, 0.4);
        g.fillRect(20, 110, w - 40, h - 200);
    }

    // ========== 商品格子 ==========

    _createItemGrid(sceneW, sceneH) {
        const cols = 3;
        const rows = 2;
        const cardW = 270;
        const cardH = 170;
        const gapX = 20;
        const gapY = 16;
        const startX = (sceneW - (cols * cardW + (cols - 1) * gapX)) / 2;
        const startY = 120;

        for (let i = 0; i < 6; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = startX + col * (cardW + gapX);
            const y = startY + row * (cardH + gapY);

            const item = this.shopItems[i] || null;
            this._createItemCard(x, y, cardW, cardH, item, i);
        }
    }

    _createItemCard(x, y, w, h, item, index) {
        const C = CONSTANTS.COLORS;
        const g = this.add.graphics();

        if (!item) {
            // 空格子
            g.fillStyle(C.BG_PANEL, 0.3);
            g.fillRoundedRect(x, y, w, h, 6);
            g.lineStyle(1, C.TEXT_DIM, 0.3);
            g.strokeRoundedRect(x, y, w, h, 6);
            createPixelText(this, x + w / 2, y + h / 2, '已售罄', 'small', { color: '#888888' });
            return;
        }

        const canAfford = GameState.canAfford(Math.floor(item.price * this.discount));
        const finalPrice = Math.floor(item.price * this.discount);

        // 卡片背景
        g.fillStyle(canAfford ? C.BG_PANEL : 0x1a1020, 0.9);
        g.fillRoundedRect(x, y, w, h, 6);

        // 边框（按稀有度着色）
        const rarityColor = this._getRarityColor(item.rarity);
        g.lineStyle(2, rarityColor, canAfford ? 1 : 0.3);
        g.strokeRoundedRect(x, y, w, h, 6);

        // 图标
        createPixelText(this, x + 30, y + 28, item.icon || '📦', 'subtitle', { fontSize: '22px' });

        // 名称
        createPixelText(this, x + w / 2 + 10, y + 28, item.name, 'button', {
            color: canAfford ? '#ffffff' : '#666666',
        });

        // 描述（截取前30字）
        const desc = item.desc ? (item.desc.length > 30 ? item.desc.substring(0, 30) + '...' : item.desc) : '';
        createPixelText(this, x + w / 2, y + 60, desc, 'small', {
            color: canAfford ? '#cccccc' : '#555555',
            wordWrap: { width: w - 20 },
            fontSize: '7px',
        });

        // 稀有度标签
        const rarityName = { common: '普通', rare: '稀有', epic: '史诗', curse: '诅咒' };
        createPixelText(this, x + w / 2, y + 100, rarityName[item.rarity] || '普通', 'small', {
            color: '#' + rarityColor.toString(16).padStart(6, '0'),
            fontSize: '7px',
        });

        // 价格
        const priceColor = canAfford ? '#ffd700' : '#ff2d2d';
        createPixelText(this, x + w / 2, y + 130, `💰 ${finalPrice} 金币`, 'small', {
            color: priceColor,
            fontSize: '10px',
        });

        // 交互热区
        const hitArea = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0xffffff, 0)
            .setInteractive({ useHandCursor: true });

        if (canAfford) {
            hitArea.on('pointerover', () => {
                g.clear();
                g.fillStyle(C.BG_PANEL_LIGHT, 0.95);
                g.fillRoundedRect(x, y, w, h, 6);
                g.lineStyle(3, rarityColor, 1);
                g.strokeRoundedRect(x, y, w, h, 6);
            });

            hitArea.on('pointerout', () => {
                g.clear();
                g.fillStyle(C.BG_PANEL, 0.9);
                g.fillRoundedRect(x, y, w, h, 6);
                g.lineStyle(2, rarityColor, 1);
                g.strokeRoundedRect(x, y, w, h, 6);
            });

            hitArea.on('pointerdown', () => {
                this._purchaseItem(item, index, hitArea, x, y, w, h);
            });
        }

        this.itemCards.push({ graphics: g, hitArea, item, index });
    }

    // ========== 购买逻辑 ==========

    _purchaseItem(item, index, hitArea, x, y, w, h) {
        const finalPrice = Math.floor(item.price * this.discount);

        if (!GameState.canAfford(finalPrice)) {
            this._showMerchantLine('"金币不够？那可真遗憾……"');
            return;
        }

        // 背包满了？
        if (GameState.inventory.length >= CONSTANTS.PLAYER.INVENTORY_SIZE) {
            this._showMerchantLine('"你的背包满了！先用掉一些道具吧。"');
            return;
        }

        // 扣金币
        GameState.spendGold(finalPrice);

        // 添加到背包
        GameState.addItem(item);

        // 触发商店购买事件
        EventBus.emit(EVENTS.SHOP_PURCHASE, item);

        // 购买动画
        this._playPurchaseAnimation(hitArea, x, y, w, h);

        // 移除该商品
        this.shopItems[index] = null;

        // 更新商人台词
        this._showMerchantLine('"好眼光！这件道具一定能帮到你。"');

        // 更新底部状态栏
        this._updateStatusBar();
    }

    _playPurchaseAnimation(hitArea, x, y, w, h) {
        // 闪烁 + 缩放动画
        const flash = this.add.rectangle(x + w / 2, y + h / 2, w, h, CONSTANTS.COLORS.GOLD, 0.5);

        this.tweens.add({
            targets: flash,
            alpha: 0,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 400,
            ease: 'Power2',
            onComplete: () => flash.destroy(),
        });

        // 成功文字
        const successText = createPixelText(this, x + w / 2, y + h / 2, '✅ 已购买！', 'button', {
            color: '#4caf50',
        });

        this.tweens.add({
            targets: successText,
            y: y + h / 2 - 20,
            alpha: 0,
            duration: 800,
            delay: 300,
            onComplete: () => successText.destroy(),
        });

        // 禁用交互
        hitArea.disableInteractive();
    }

    // ========== 底部状态栏 ==========

    _createStatusBar(w, h) {
        const barY = h - 70;
        const g = this.add.graphics();
        g.fillStyle(CONSTANTS.COLORS.BG_PANEL, 0.9);
        g.fillRect(0, barY, w, 70);
        g.lineStyle(1, CONSTANTS.COLORS.PRIMARY, 0.5);
        g.strokeRect(0, barY, w, 1);

        // 金币
        this.goldText = createPixelText(this, 100, barY + 20, `💰 ${GameState.player.gold}`, 'value');

        // HP
        this.hpText = createPixelText(this, 280, barY + 20, `❤️ ${GameState.player.hp}/${GameState.player.maxHp}`, 'button', {
            color: '#ff2d2d',
        });

        // 背包
        this.bagText = createPixelText(this, 480, barY + 20, `🎒 ${GameState.inventory.length}/${CONSTANTS.PLAYER.INVENTORY_SIZE}`, 'button');

        // 护盾
        if (GameState.player.shield > 0) {
            createPixelText(this, 660, barY + 20, `🛡️ ${GameState.player.shield}`, 'button', {
                color: '#4488ff',
            });
        }

        // 背包内容预览
        const bagPreview = GameState.inventory.map(i => i.icon).join(' ');
        if (bagPreview) {
            createPixelText(this, w / 2, barY + 48, bagPreview, 'small');
        }
    }

    _updateStatusBar() {
        if (this.goldText) this.goldText.setText(`💰 ${GameState.player.gold}`);
        if (this.hpText) this.hpText.setText(`❤️ ${GameState.player.hp}/${GameState.player.maxHp}`);
        if (this.bagText) this.bagText.setText(`🎒 ${GameState.inventory.length}/${CONSTANTS.PLAYER.INVENTORY_SIZE}`);
    }

    // ========== 离开按钮 ==========

    _createLeaveButton(w, h) {
        const btnW = 200;
        const btnH = 44;
        const btnX = w - btnW / 2 - 30;
        const btnY = h - 46;

        const bg = this.add.graphics();
        bg.fillStyle(CONSTANTS.COLORS.PRIMARY, 1);
        bg.fillRoundedRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, 8);

        const label = createPixelText(this, btnX, btnY, '🚪 离开商店', 'button');

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

    // ========== 工具方法 ==========

    _showMerchantLine(text) {
        if (this.merchantText) {
            this.merchantText.setText(text);
            this.tweens.add({
                targets: this.merchantText,
                scaleX: 1.05,
                scaleY: 1.05,
                yoyo: true,
                duration: 200,
            });
        }
    }

    _getRarityColor(rarity) {
        const map = {
            common: CONSTANTS.COLORS.TEXT_GRAY,
            rare: CONSTANTS.COLORS.ACCENT,
            epic: CONSTANTS.COLORS.PURPLE,
            curse: CONSTANTS.COLORS.DANGER,
        };
        return map[rarity] || CONSTANTS.COLORS.TEXT_GRAY;
    }
}
