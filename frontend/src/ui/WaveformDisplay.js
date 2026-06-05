/**
 * 语塔攀登 - 波形显示组件
 */

import { CONSTANTS } from '../utils/Constants.js';

export class WaveformDisplay {
    constructor(scene, x, y, options = {}) {
        const { barCount = 30, barWidth = 3, barGap = 1, maxHeight = 30, color = CONSTANTS.COLORS.ACCENT } = options;
        this.scene = scene;
        this.container = scene.add.container(x, y);
        this.bars = [];
        this.maxHeight = maxHeight;

        const totalWidth = barCount * (barWidth + barGap);
        for (let i = 0; i < barCount; i++) {
            const bx = -totalWidth / 2 + i * (barWidth + barGap);
            const bar = scene.add.rectangle(bx, 0, barWidth, 4, color).setAlpha(0.3);
            this.container.add(bar);
            this.bars.push(bar);
        }
    }

    updateWaveform(data) {
        for (let i = 0; i < this.bars.length; i++) {
            const val = data ? (data[i] || 0) : 0;
            const h = Math.max(4, val * this.maxHeight);
            this.bars[i].setSize(3, h);
            this.bars[i].setAlpha(0.3 + val * 0.7);
        }
    }

    randomize() {
        for (const bar of this.bars) {
            const h = Phaser.Math.Between(4, this.maxHeight);
            bar.setSize(3, h);
            bar.setAlpha(0.5 + Math.random() * 0.5);
        }
    }

    reset() {
        for (const bar of this.bars) {
            bar.setSize(3, 4);
            bar.setAlpha(0.3);
        }
    }

    destroy() { this.container.destroy(true); }
}
