/**
 * 语塔攀登 - 关卡树地图场景（核心导航页）
 * 仿杀戮尖塔的分叉地图，显示所有节点和路径
 */

import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants.js';
import { GameState } from '../game/GameState.js';
import { EventBus, EVENTS } from '../utils/EventBus.js';
import { MapGenerator } from '../map/MapGenerator.js';
import { MapRenderer } from '../map/MapRenderer.js';
import { createPixelText } from '../utils/PixelText.js';

export class MapScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.MAP });
        this.mapRenderer = null;
        this.isDragging = false;
        this.dragStartY = 0;
        this.mapContainer = null;
    }

    init(data) {
        this.act = data?.act || GameState.currentAct || 1;
        this.isNewGame = data?.newGame || false;
    }

    create() {
        const { width, height } = this.scale;

        // ========== 检测并处理不兼容的旧版地图层数 ==========
        if (GameState.map && GameState.map.nodes) {
            const maxRow = Math.max(...GameState.map.nodes.map(n => n.row));
            if (maxRow !== CONSTANTS.MAP.ROWS - 1) {
                console.warn('检测到旧版地图层数，重置地图以适配 8 层新版配置');
                GameState.map = null;
                GameState.currentRow = -1;
                GameState.currentNodeId = null;
                GameState.completedNodes = [];
            }
        }

        // ========== 检测并处理章节转换 ==========
        if (GameState.map && GameState.currentNodeId) {
            const currentNode = GameState.map.nodes.find(n => n.id === GameState.currentNodeId);
            const isBossDefeated = currentNode && currentNode.type === CONSTANTS.NODE_TYPES.BOSS && GameState.completedNodes.includes(currentNode.id);
            if (isBossDefeated) {
                if (this.act < 3) {
                    this.act++;
                    GameState.currentAct = this.act;
                    GameState.map = null;
                    GameState.currentRow = -1;
                    GameState.currentNodeId = null;
                    GameState.completedNodes = [];
                    this.isNewGame = true; // 播放新章节动画
                } else {
                    this.scene.start(CONSTANTS.SCENES.VICTORY);
                    return;
                }
            }
        }

        // ========== 生成或加载地图 ==========
        if (this.isNewGame || !GameState.map) {
            const generator = new MapGenerator();
            GameState.map = generator.generate(this.act);
            GameState.currentRow = -1;
            GameState.currentNodeId = null;
            GameState.completedNodes = [];
            GameState.currentAct = this.act;
        }

        // ========== 背景 ==========
        const actConfig = CONSTANTS.ACTS[this.act];
        this.add.rectangle(width / 2, height / 2, width, height, actConfig?.bgColor || CONSTANTS.COLORS.BG_DARK);

        // 星空效果
        this._drawStarfield();

        // ========== 顶部状态栏 ==========
        this._createTopBar(width);

        // ========== 渲染地图 ==========
        this.mapRenderer = new MapRenderer(this);
        this.mapContainer = this.mapRenderer.render(
            GameState.map,
            GameState.completedNodes,
            GameState.currentNodeId,
            (node) => this._onNodeClicked(node)
        );

        // 滚动到当前位置
        if (GameState.currentRow >= 0) {
            this.mapRenderer.scrollToRow(GameState.currentRow);
        } else {
            // 滚动到底部（起始位置）
            this.mapRenderer.scrollToRow(0);
        }

        // ========== 底部状态栏 ==========
        this._renderBottomBar();

        // ========== 拖拽滚动 ==========
        this._setupDragScroll();

        // ========== 章节标题动画 ==========
        if (this.isNewGame) {
            this._showActTitle();
        }

        // 保存游戏
        this._autoSave();
    }

    // ========== 顶部状态栏 ==========
    _createTopBar(width) {
        const topBar = this.add.container(0, 0);
        topBar.setDepth(100);

        // 背景
        const bg = this.add.rectangle(width / 2, 20, width, 40, 0x000000, 0.7);
        topBar.add(bg);

        // 章节名称
        const actName = CONSTANTS.ACTS[this.act]?.name || '未知章节';
        const title = this.add.text(20, 12, actName, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#ff6b35',
        });
        topBar.add(title);

        // 层数
        const floor = GameState.currentRow >= 0 ? GameState.currentRow + 1 : 0;
        const floorText = this.add.text(width - 20, 12, `层数: ${floor}/${CONSTANTS.MAP.ROWS}`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#51e5ff',
        }).setOrigin(1, 0);
        topBar.add(floorText);
    }

    // ========== 底部状态栏 (动态渲染背包道具与状态) ==========
    _renderBottomBar() {
        if (this.bottomBarContainer) {
            this.bottomBarContainer.destroy(true);
        }

        const { width, height } = this.scale;
        const bottomBar = this.add.container(0, 0);
        bottomBar.setDepth(100);
        this.bottomBarContainer = bottomBar;

        // 背景
        const bg = this.add.rectangle(width / 2, height - 25, width, 50, 0x000000, 0.8);
        bottomBar.add(bg);

        const y = height - 30;
        const p = GameState.player;

        // HP
        const hpBar = this._createMiniBar(30, y, 120, 14, p.hp, p.maxHp, CONSTANTS.COLORS.HP_RED, `❤️ ${p.hp}/${p.maxHp}`);
        bottomBar.add(hpBar);

        // 护盾
        if (p.shield > 0) {
            const shieldText = this.add.text(220, y - 6, `🛡️ ${p.shield}`, {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '9px',
                color: '#4488ff',
            });
            bottomBar.add(shieldText);
        }

        // 金币
        const goldText = this.add.text(360, y - 6, `💰 ${p.gold}`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '9px',
            color: '#ffd700',
        });
        bottomBar.add(goldText);

        // 背包道具槽 (X 坐标从 600 开始，占用 6 * 40 = 240)
        const startX = 600;
        const items = GameState.inventory;
        for (let i = 0; i < CONSTANTS.PLAYER.INVENTORY_SIZE; i++) {
            const x = startX + i * 40;
            const slot = this.add.rectangle(x, y - 2, 32, 28, CONSTANTS.COLORS.BG_PANEL);
            slot.setStrokeStyle(1, 0x555555);
            bottomBar.add(slot);

            if (items[i]) {
                const item = items[i];
                const icon = this.add.text(x, y - 2, item.icon || '📦', {
                    fontSize: '14px',
                }).setOrigin(0.5);
                bottomBar.add(icon);

                // 交互
                slot.setInteractive({ useHandCursor: true });
                slot.on('pointerover', () => slot.setStrokeStyle(2, CONSTANTS.COLORS.PRIMARY));
                slot.on('pointerout', () => slot.setStrokeStyle(1, 0x555555));
                slot.on('pointerup', () => {
                    this._useItemOnMap(item);
                });
            }
        }

        // 能量 (移动到 480)
        const energyText = this.add.text(480, y - 6, `⚡ ${p.energy}/${p.maxEnergy}`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '9px',
            color: '#51e5ff',
        });
        bottomBar.add(energyText);

        // 平均评分 (移动到 880)
        const avgScore = GameState.getAverageScore();
        const avgText = this.add.text(880, y - 6, `📊 平均: ${avgScore}`, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '9px',
            color: '#cccccc',
        });
        bottomBar.add(avgText);

        // 返回主菜单按钮 (固定在 width - 80 = 880)
        const menuBtn = this._createSmallButton(width - 80, y, '菜单', () => {
            this.scene.start(CONSTANTS.SCENES.MAIN_MENU);
        });
        bottomBar.add(menuBtn);
    }

    _useItemOnMap(item) {
        if (!item.usableOnMap) {
            this._showFloatingText('只能在战斗中使用该道具！', '#ff2d2d');
            return;
        }

        const success = GameState.useItem(item.instanceId);
        if (success) {
            this._showFloatingText(`使用了 ${item.name}!`, '#4caf50');
            // 重新渲染底部状态栏
            this._renderBottomBar();
            
            // 自动保存进度
            this._autoSave();
        }
    }

    _showFloatingText(text, color) {
        const { width } = this.scale;
        const floatText = this.add.text(width / 2, 200, text, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: color,
            stroke: '#000',
            strokeThickness: 2,
        }).setOrigin(0.5).setDepth(200);

        this.tweens.add({
            targets: floatText,
            y: 160,
            alpha: 0,
            duration: 1200,
            onComplete: () => floatText.destroy(),
        });
    }

    // ========== 辅助UI ==========
    _createMiniBar(x, y, w, h, value, max, color, label) {
        const container = this.add.container(x, y);

        // 背景
        const bg = this.add.rectangle(w / 2, 0, w, h, 0x441111).setOrigin(0.5);
        bg.setStrokeStyle(1, 0x666666);
        container.add(bg);

        // 填充
        const fillW = (value / max) * (w - 4);
        const fill = this.add.rectangle(2, 0, fillW, h - 4, color).setOrigin(0, 0.5);
        container.add(fill);

        // 文字
        const text = this.add.text(w / 2, 0, label, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '7px',
            color: '#ffffff',
        }).setOrigin(0.5);
        container.add(text);

        return container;
    }

    _createSmallButton(x, y, text, onClick) {
        const container = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, 80, 24, CONSTANTS.COLORS.BG_PANEL);
        bg.setStrokeStyle(1, CONSTANTS.COLORS.PRIMARY);
        bg.setInteractive({ useHandCursor: true });

        const label = this.add.text(0, 0, text, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: '#ffffff',
        }).setOrigin(0.5);

        container.add([bg, label]);

        bg.on('pointerover', () => bg.setFillStyle(CONSTANTS.COLORS.PRIMARY));
        bg.on('pointerout', () => bg.setFillStyle(CONSTANTS.COLORS.BG_PANEL));
        bg.on('pointerup', () => { if (onClick) onClick(); });

        return container;
    }

    // ========== 节点点击处理 ==========
    _onNodeClicked(node) {
        // 更新状态
        GameState.currentNodeId = node.id;
        GameState.currentRow = node.row;

        // 根据节点类型跳转到对应场景
        switch (node.type) {
            case CONSTANTS.NODE_TYPES.MONSTER:
            case CONSTANTS.NODE_TYPES.ELITE:
                this.scene.start(CONSTANTS.SCENES.BATTLE, {
                    node: node,
                    act: this.act,
                    isElite: node.type === CONSTANTS.NODE_TYPES.ELITE,
                });
                break;

            case CONSTANTS.NODE_TYPES.BOSS:
                this.scene.start(CONSTANTS.SCENES.BOSS, {
                    node: node,
                    act: this.act,
                });
                break;

            case CONSTANTS.NODE_TYPES.SHOP:
                this.scene.start(CONSTANTS.SCENES.SHOP, {
                    node: node,
                    act: this.act,
                });
                break;

            case CONSTANTS.NODE_TYPES.REST:
                this.scene.start(CONSTANTS.SCENES.REST, {
                    node: node,
                    act: this.act,
                });
                break;

            case CONSTANTS.NODE_TYPES.EVENT:
                this.scene.start(CONSTANTS.SCENES.EVENT, {
                    node: node,
                    act: this.act,
                });
                break;

            case CONSTANTS.NODE_TYPES.TREASURE:
                this.scene.start(CONSTANTS.SCENES.TREASURE, {
                    node: node,
                    act: this.act,
                });
                break;
        }
    }

    // ========== 拖拽滚动 ==========
    _setupDragScroll() {
        this.input.on('pointerdown', (pointer) => {
            this.isDragging = true;
            this.dragStartY = pointer.y;
            this.containerStartY = this.mapContainer?.y || 0;
        });

        this.input.on('pointermove', (pointer) => {
            if (!this.isDragging || !this.mapContainer) return;
            const delta = pointer.y - this.dragStartY;
            const newY = this.containerStartY + delta;
            const minY = -(this.mapRenderer.mapHeight - this.scale.height + 80);
            this.mapContainer.y = Phaser.Math.Clamp(newY, minY, 50);
        });

        this.input.on('pointerup', () => {
            this.isDragging = false;
        });

        // 鼠标滚轮
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY) => {
            if (!this.mapContainer) return;
            const newY = this.mapContainer.y - deltaY * 0.5;
            const minY = -(this.mapRenderer.mapHeight - this.scale.height + 80);
            this.mapContainer.y = Phaser.Math.Clamp(newY, minY, 50);
        });
    }

    // ========== 章节标题动画 ==========
    _showActTitle() {
        const { width, height } = this.scale;
        const actName = CONSTANTS.ACTS[this.act]?.name || '未知章节';

        // 全屏遮罩
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
        overlay.setDepth(200);

        const title = this.add.text(width / 2, height / 2 - 35, actName, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '22px',
            color: '#ff6b35',
            stroke: '#000',
            strokeThickness: 4,
        }).setOrigin(0.5).setDepth(201).setAlpha(0);

        const subtitle = this.add.text(width / 2, height / 2 + 35, '准备好你的声音...', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#51e5ff',
        }).setOrigin(0.5).setDepth(201).setAlpha(0);

        // 淡入
        this.tweens.add({
            targets: [title, subtitle],
            alpha: 1,
            duration: 500,
            delay: 200,
        });

        // 淡出
        this.tweens.add({
            targets: [overlay, title, subtitle],
            alpha: 0,
            duration: 500,
            delay: 2500,
            onComplete: () => {
                overlay.destroy();
                title.destroy();
                subtitle.destroy();
            }
        });
    }

    // ========== 星空效果 ==========
    _drawStarfield() {
        const g = this.add.graphics();
        for (let i = 0; i < 60; i++) {
            const x = Phaser.Math.Between(0, 960);
            const y = Phaser.Math.Between(0, 640);
            const alpha = Phaser.Math.FloatBetween(0.05, 0.3);
            g.fillStyle(0xffffff, alpha);
            g.fillRect(x, y, Phaser.Math.Between(1, 2), Phaser.Math.Between(1, 2));
        }
    }

    // ========== 自动保存 ==========
    _autoSave() {
        try {
            localStorage.setItem('wordspire_save', JSON.stringify(GameState.toJSON()));
        } catch (e) {
            console.warn('自动保存失败:', e);
        }
    }
}
