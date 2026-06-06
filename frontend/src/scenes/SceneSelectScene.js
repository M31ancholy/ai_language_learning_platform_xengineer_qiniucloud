/**
 * 语塔攀登 - 场景选择场景
 * 开始新游戏前选择攀登的主题场景
 */

import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants.js';
import { GameState } from '../game/GameState.js';
import { createPixelText } from '../utils/PixelText.js';
import { SCENE_CONFIGS } from '../data/scenes.js';

export class SceneSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.SCENE_SELECT });
    }

    create() {
        const { width, height } = this.scale;
        const cx = width / 2;

        // ========== 背景 ==========
        this.add.rectangle(cx, height / 2, width, height, CONSTANTS.COLORS.BG_DARK);

        // 绘制静态星空
        this._createStarfield(width, height);

        // ========== 标题区域 ==========
        createPixelText(this, cx, 80, '⚔️ 选择你的攀登场景 ⚔️', 'title', {
            fontSize: '28px',
            color: '#ff6b35'
        });

        createPixelText(this, cx, 130, '接下来的关卡挑战内容将围绕你选择的场景展开', 'subtitle', {
            fontSize: '12px',
            color: '#888888'
        });

        // ========== 绘制卡片 ==========
        const cardWidth = 230;
        const cardHeight = 380;
        const startY = height / 2 + 30; // 居中偏下一些

        const xPositions = [cx - 390, cx - 130, cx + 130, cx + 390];

        SCENE_CONFIGS.forEach((config, index) => {
            const x = xPositions[index];
            this._createSceneCard(x, startY, cardWidth, cardHeight, config);
        });

        // ========== 返回按钮 ==========
        this._createBackButton(cx, height - 70);
    }

    _createSceneCard(x, y, w, h, config) {
        const container = this.add.container(x, y);

        // 背景矩形（暗紫色填充，细边框）
        const bg = this.add.rectangle(0, 0, w, h, CONSTANTS.COLORS.BG_PANEL);
        bg.setStrokeStyle(2, 0x554477);
        bg.setInteractive({ useHandCursor: true });

        // 主题高亮条（顶部一条装饰线）
        const topBar = this.add.rectangle(0, -h / 2 + 5, w - 10, 6, config.color);

        // 场景中文名
        const nameText = createPixelText(this, 0, -h / 2 + 50, config.name, 'subtitle', {
            fontSize: '15px',
            color: '#ffffff'
        });

        // 场景英文名
        const enNameText = createPixelText(this, 0, -h / 2 + 80, config.englishName, 'small', {
            fontSize: '9px',
            color: '#888888'
        });

        // 卡片内的装饰分隔线
        const divider = this.add.line(0, -h / 2 + 110, -w / 2 + 20, 0, w / 2 - 20, 0, 0x443366);

        // 场景描述（正文小字，换行，居中排版，并配置自定义 CJK 逐字宽度测量折行，防文字溢出）
        const descText = this.add.text(0, -h / 2 + 130, config.desc, {
            fontFamily: '"Press Start 2P", "PingFang SC", "Microsoft YaHei", "SimHei", sans-serif',
            fontSize: '11px',
            color: '#cccccc',
            lineSpacing: 8,
            align: 'center',
            wordWrap: {
                width: w - 30,
                callback: (text, textObj) => {
                    const wrapWidth = textObj.style.wordWrapWidth;
                    const context = textObj.context;
                    let lines = [];
                    let currentLine = '';
                    
                    for (let i = 0; i < text.length; i++) {
                        const char = text[i];
                        if (char === '\n') {
                            lines.push(currentLine);
                            currentLine = '';
                            continue;
                        }
                        const testLine = currentLine + char;
                        const metrics = context.measureText(testLine);
                        if (metrics.width > wrapWidth) {
                            lines.push(currentLine);
                            currentLine = char;
                        } else {
                            currentLine = testLine;
                        }
                    }
                    if (currentLine) {
                        lines.push(currentLine);
                    }
                    return lines;
                }
            }
        }).setOrigin(0.5, 0);
        descText.setResolution(2);
        if (descText.texture) {
            descText.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        }

        // 底部引导点击文字
        const clickHint = createPixelText(this, 0, h / 2 - 40, '👉 选择此场景', 'small', {
            fontSize: '10px',
            color: config.color
        });
        clickHint.setAlpha(0.6);

        container.add([bg, topBar, nameText, enNameText, divider, descText, clickHint]);

        // ========== 交互动画效果 ==========
        bg.on('pointerover', () => {
            bg.setStrokeStyle(3, config.color);
            bg.setFillStyle(0x3a2a4e);
            container.setScale(1.05);
            clickHint.setAlpha(1);
            clickHint.setScale(1.1);
        });

        bg.on('pointerout', () => {
            bg.setStrokeStyle(2, 0x554477);
            bg.setFillStyle(CONSTANTS.COLORS.BG_PANEL);
            container.setScale(1);
            clickHint.setAlpha(0.6);
            clickHint.setScale(1);
        });

        bg.on('pointerdown', () => {
            container.setScale(0.98);
        });

        bg.on('pointerup', () => {
            container.setScale(1.05);
            // 写入游戏状态并跳转
            GameState.selectedScene = config.key;
            this.scene.start(CONSTANTS.SCENES.MAP, { act: 1, newGame: true });
        });
    }

    _createBackButton(x, y) {
        const btnWidth = 160;
        const btnHeight = 36;
        const container = this.add.container(x, y);

        const bg = this.add.rectangle(0, 0, btnWidth, btnHeight, CONSTANTS.COLORS.BG_PANEL);
        bg.setStrokeStyle(1.5, 0x888888);
        bg.setInteractive({ useHandCursor: true });

        const label = createPixelText(this, 0, 0, '⬅️ 返回主菜单', 'button', {
            fontSize: '11px',
            color: '#cccccc'
        });

        container.add([bg, label]);

        bg.on('pointerover', () => {
            bg.setStrokeStyle(1.5, 0xffffff);
            label.setColor('#ffffff');
            container.setScale(1.05);
        });

        bg.on('pointerout', () => {
            bg.setStrokeStyle(1.5, 0x888888);
            label.setColor('#cccccc');
            container.setScale(1);
        });

        bg.on('pointerdown', () => {
            container.setScale(0.95);
        });

        bg.on('pointerup', () => {
            container.setScale(1.05);
            this.scene.start(CONSTANTS.SCENES.MAIN_MENU);
        });
    }

    _createStarfield(width, height) {
        const g = this.add.graphics();
        for (let i = 0; i < 120; i++) {
            const x = Phaser.Math.Between(0, width);
            const y = Phaser.Math.Between(0, height);
            const size = Phaser.Math.Between(1, 2);
            const alpha = Phaser.Math.FloatBetween(0.1, 0.4);
            g.fillStyle(0xffffff, alpha);
            g.fillRect(x, y, size, size);
        }
    }
}
