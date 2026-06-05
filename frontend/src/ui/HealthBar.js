/**
 * 语塔攀登 - 血条组件
 */

import { CONSTANTS } from '../utils/Constants.js';

export class HealthBar {
    constructor(scene, x, y, options = {}) {
        const {
            width = 200,
            height = 16,
            bgColor = CONSTANTS.COLORS.HP_BG,
            fillColor = CONSTANTS.COLORS.HP_RED,
            borderColor = 0x666666,
            showText = true,
        } = options;

        this.scene = scene;
        this.width = width;
        this.height = height;
        this.fillColor = fillColor;
        this.container = scene.add.container(x, y);

        // 背景
        this.bg = scene.add.rectangle(0, 0, width, height, bgColor);
        this.bg.setStrokeStyle(1, borderColor);
        this.container.add(this.bg);

        // 填充条
        this.fill = scene.add.rectangle(
            -(width / 2) + 2, 0, width - 4, height - 4, fillColor
        ).setOrigin(0, 0.5);
        this.container.add(this.fill);

        // 文字
        if (showText) {
            this.text = scene.add.text(0, 0, '', {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '7px',
                color: '#ffffff',
            }).setOrigin(0.5);
            this.container.add(this.text);
        }
    }

    update(current, max) {
        const ratio = Math.max(0, current / max);
        this.fill.width = (this.width - 4) * ratio;

        // 低血量变色
        if (ratio < 0.25) {
            this.fill.setFillStyle(0xff0000);
        } else if (ratio < 0.5) {
            this.fill.setFillStyle(0xff6600);
        } else {
            this.fill.setFillStyle(this.fillColor);
        }

        if (this.text) {
            this.text.setText(`${current}/${max}`);
        }
    }

    setDepth(depth) {
        this.container.setDepth(depth);
        return this;
    }

    destroy() {
        this.container.destroy(true);
    }
}
