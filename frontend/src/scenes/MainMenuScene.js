/**
 * 语塔攀登 - 主菜单场景
 * 游戏入口，像素风动态菜单
 */

import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants.js';
import { GameState } from '../game/GameState.js';
import { createPixelText } from '../utils/PixelText.js';

export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.MAIN_MENU });
    }

    create() {
        const { width, height } = this.scale;
        const cx = width / 2;

        // ========== 背景 ==========
        this.add.rectangle(cx, height / 2, width, height, CONSTANTS.COLORS.BG_DARK);

        // 星空背景粒子
        this._createStarfield();

        // ========== Logo区域 ==========
        // 火焰装饰（左右两侧）
        this._createFlameAnimation(cx - 180, 100);
        this._createFlameAnimation(cx + 180, 100);

        // 游戏标题
        const titleText = this.add.text(cx, 90, '⚔️ 语塔攀登 ⚔️', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '28px',
            color: '#ff6b35',
            stroke: '#000000',
            strokeThickness: 5,
            shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 0, fill: true }
        }).setOrigin(0.5);

        // 标题呼吸动画
        this.tweens.add({
            targets: titleText,
            scaleX: 1.03,
            scaleY: 1.03,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // 副标题
        this.add.text(cx, 130, 'WORD SPIRE', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '12px',
            color: '#51e5ff',
            stroke: '#000000',
            strokeThickness: 2,
        }).setOrigin(0.5);

        // 口号
        this.add.text(cx, 160, '用声音征服每一层，用英语挑战地狱尖塔', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '8px',
            color: '#888888',
        }).setOrigin(0.5);

        // ========== 玩家角色展示 ==========
        const player = this.add.image(cx, 240, 'player').setScale(4);
        this.tweens.add({
            targets: player,
            y: 235,
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        // ========== 菜单按钮 ==========
        const hasSave = !!localStorage.getItem('wordspire_save');
        const startY = hasSave ? 290 : 320;
        const gap = 55;

        let btnIndex = 0;

        if (hasSave) {
            this._createMenuButton(cx, startY + btnIndex * gap, '⏯️  继续攀登', () => this._continueGame(), 0x4caf50);
            btnIndex++;
            this._createMenuButton(cx, startY + btnIndex * gap, '▶️  开始新攀登', () => this._startGameConfirm());
        } else {
            this._createMenuButton(cx, startY + btnIndex * gap, '▶️  开始攀登', () => this._startGame());
        }
        btnIndex++;

        this._createMenuButton(cx, startY + btnIndex * gap, '📊  历史战绩', () => this.scene.start(CONSTANTS.SCENES.HISTORY));
        btnIndex++;

        this._createMenuButton(cx, startY + btnIndex * gap, '📖  图鉴', () => this.scene.start(CONSTANTS.SCENES.COLLECTION));
        btnIndex++;

        this._createMenuButton(cx, startY + btnIndex * gap, '⚙️  设置', () => this.scene.start(CONSTANTS.SCENES.SETTINGS));
    }

    _createMenuButton(x, y, text, onClick, color = CONSTANTS.COLORS.PRIMARY) {
        const btnWidth = 240;
        const btnHeight = 40;

        // 按钮容器
        const container = this.add.container(x, y);

        // 背景矩形
        const bg = this.add.rectangle(0, 0, btnWidth, btnHeight, CONSTANTS.COLORS.BG_PANEL);
        bg.setStrokeStyle(2, color);

        // 文字
        const label = this.add.text(0, 0, text, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '11px',
            color: '#ffffff',
        }).setOrigin(0.5);

        container.add([bg, label]);

        // 交互
        bg.setInteractive({ useHandCursor: true });

        bg.on('pointerover', () => {
            bg.setFillStyle(color);
            label.setColor('#1a0a2e');
            container.setScale(1.05);
        });

        bg.on('pointerout', () => {
            bg.setFillStyle(CONSTANTS.COLORS.BG_PANEL);
            label.setColor('#ffffff');
            container.setScale(1);
        });

        bg.on('pointerdown', () => {
            container.setScale(0.95);
        });

        bg.on('pointerup', () => {
            container.setScale(1.05);
            if (onClick) onClick();
        });

        return container;
    }

    _startGameConfirm() {
        if (confirm('开始新攀登将覆盖你当前正在进行的攀登进度，确认要重新开始吗？')) {
            this._startGame();
        }
    }

    _startGame() {
        GameState.reset();
        GameState.isRunActive = true;
        this.scene.start(CONSTANTS.SCENES.SCENE_SELECT);
    }


    _continueGame() {
        try {
            const saveData = JSON.parse(localStorage.getItem('wordspire_save'));
            if (saveData) {
                // 检测存档地图是否与当前层数配置（8层）一致
                if (saveData.map && saveData.map.nodes) {
                    const maxRow = Math.max(...saveData.map.nodes.map(n => n.row));
                    if (maxRow !== CONSTANTS.MAP.ROWS - 1) {
                        console.warn('检测到旧版地图数据，自动重置当前章节地图以适配新版层数配置');
                        saveData.map = null;
                        saveData.currentRow = -1;
                        saveData.currentNodeId = null;
                        saveData.completedNodes = [];
                    }
                }
                GameState.fromJSON(saveData);
                this.scene.start(CONSTANTS.SCENES.MAP, { act: GameState.currentAct });
            }
        } catch (e) {
            console.error('存档加载失败:', e);
            this._startGame();
        }
    }

    _createStarfield() {
        // 绘制静态星空
        const g = this.add.graphics();
        for (let i = 0; i < 80; i++) {
            const x = Phaser.Math.Between(0, 960);
            const y = Phaser.Math.Between(0, 640);
            const size = Phaser.Math.Between(1, 2);
            const alpha = Phaser.Math.FloatBetween(0.1, 0.5);
            g.fillStyle(0xffffff, alpha);
            g.fillRect(x, y, size, size);
        }

        // 闪烁星星
        for (let i = 0; i < 10; i++) {
            const star = this.add.rectangle(
                Phaser.Math.Between(0, 960),
                Phaser.Math.Between(0, 640),
                2, 2, 0xffffff
            );
            this.tweens.add({
                targets: star,
                alpha: 0,
                duration: Phaser.Math.Between(1000, 3000),
                yoyo: true,
                repeat: -1,
                delay: Phaser.Math.Between(0, 2000),
            });
        }
    }

    _createFlameAnimation(x, y) {
        // 简单的像素火焰动画
        const flames = [];
        for (let i = 0; i < 5; i++) {
            const flame = this.add.rectangle(
                x + Phaser.Math.Between(-6, 6),
                y + Phaser.Math.Between(-10, 5),
                Phaser.Math.Between(3, 6),
                Phaser.Math.Between(4, 10),
                Phaser.Math.Between(0, 1) ? 0xff6b35 : 0xffd700
            ).setAlpha(0.7);

            this.tweens.add({
                targets: flame,
                y: flame.y - Phaser.Math.Between(8, 18),
                alpha: 0,
                scaleX: 0.3,
                scaleY: 0.3,
                duration: Phaser.Math.Between(600, 1200),
                repeat: -1,
                delay: Phaser.Math.Between(0, 500),
                onRepeat: () => {
                    flame.x = x + Phaser.Math.Between(-6, 6);
                    flame.y = y + Phaser.Math.Between(-10, 5);
                    flame.alpha = 0.7;
                    flame.scaleX = 1;
                    flame.scaleY = 1;
                }
            });

            flames.push(flame);
        }
    }
}
