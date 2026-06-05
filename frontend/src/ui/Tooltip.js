/**
 * 语塔攀登 - 工具提示组件
 */
import { CONSTANTS } from '../utils/Constants.js';

export class Tooltip {
    constructor(scene) {
        this.scene = scene;
        this.container = scene.add.container(0, 0).setDepth(1000).setVisible(false);

        this.bg = scene.add.rectangle(0, 0, 200, 60, 0x000000, 0.9);
        this.bg.setStrokeStyle(1, CONSTANTS.COLORS.PRIMARY);
        this.container.add(this.bg);

        this.text = scene.add.text(0, 0, '', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '7px',
            color: '#ffffff',
            lineSpacing: 6,
            wordWrap: { width: 180 },
            align: 'center',
        }).setOrigin(0.5);
        this.container.add(this.text);
    }

    show(x, y, text) {
        this.container.setPosition(x, y - 40);
        this.text.setText(text);

        // 调整背景大小
        const bounds = this.text.getBounds();
        this.bg.setSize(bounds.width + 20, bounds.height + 16);

        this.container.setVisible(true);
    }

    hide() {
        this.container.setVisible(false);
    }

    destroy() { this.container.destroy(true); }
}
