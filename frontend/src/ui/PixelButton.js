/**
 * 语塔攀登 - 像素风按钮组件
 * 可复用的Phaser图形按钮
 */

import { CONSTANTS } from '../utils/Constants.js';

export class PixelButton {
    /**
     * 创建像素风格按钮
     * @param {Phaser.Scene} scene - 场景
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {string} text - 按钮文字
     * @param {Function} onClick - 点击回调
     * @param {object} options - 配置选项
     */
    constructor(scene, x, y, text, onClick, options = {}) {
        const {
            width = 200,
            height = 40,
            fontSize = '11px',
            bgColor = CONSTANTS.COLORS.BG_PANEL,
            borderColor = CONSTANTS.COLORS.PRIMARY,
            hoverColor = CONSTANTS.COLORS.PRIMARY,
            textColor = '#ffffff',
            hoverTextColor = '#1a0a2e',
        } = options;

        this.scene = scene;
        this.container = scene.add.container(x, y);

        // 背景
        this.bg = scene.add.rectangle(0, 0, width, height, bgColor);
        this.bg.setStrokeStyle(2, borderColor);

        // 文字
        this.label = scene.add.text(0, 0, text, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize,
            color: textColor,
        }).setOrigin(0.5);

        this.container.add([this.bg, this.label]);

        // 交互
        this.bg.setInteractive({ useHandCursor: true });

        this.bg.on('pointerover', () => {
            this.bg.setFillStyle(hoverColor);
            this.label.setColor(hoverTextColor);
            this.container.setScale(1.05);
        });

        this.bg.on('pointerout', () => {
            this.bg.setFillStyle(bgColor);
            this.label.setColor(textColor);
            this.container.setScale(1);
        });

        this.bg.on('pointerdown', () => {
            this.container.setScale(0.95);
        });

        this.bg.on('pointerup', () => {
            this.container.setScale(1.05);
            if (onClick) onClick();
        });
    }

    setDepth(depth) {
        this.container.setDepth(depth);
        return this;
    }

    setVisible(visible) {
        this.container.setVisible(visible);
        return this;
    }

    destroy() {
        this.container.destroy(true);
    }
}
