/**
 * 语塔攀登 - 对话框组件
 */
import { CONSTANTS } from '../utils/Constants.js';

export class DialogueBox {
    constructor(scene, x, y, options = {}) {
        const { width = 400, height = 100, bgColor = CONSTANTS.COLORS.BG_PANEL, borderColor = CONSTANTS.COLORS.ACCENT } = options;
        this.scene = scene;
        this.container = scene.add.container(x, y);

        this.bg = scene.add.rectangle(0, 0, width, height, bgColor, 0.95);
        this.bg.setStrokeStyle(2, borderColor);
        this.container.add(this.bg);

        this.text = scene.add.text(0, 0, '', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '9px',
            color: '#e0e0e0',
            lineSpacing: 8,
            wordWrap: { width: width - 30 },
            align: 'center',
        }).setOrigin(0.5);
        this.container.add(this.text);
    }

    setText(text) {
        this.text.setText(text);
    }

    setVisible(visible) {
        this.container.setVisible(visible);
    }

    destroy() { this.container.destroy(true); }
}
