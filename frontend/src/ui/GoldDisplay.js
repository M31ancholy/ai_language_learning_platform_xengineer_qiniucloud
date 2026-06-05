/**
 * 语塔攀登 - 金币显示组件
 */
export class GoldDisplay {
    constructor(scene, x, y) {
        this.container = scene.add.container(x, y);
        this.text = scene.add.text(0, 0, '💰 0', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#ffd700',
        });
        this.container.add(this.text);
    }
    update(gold) {
        this.text.setText(`💰 ${gold}`);
    }
    destroy() { this.container.destroy(true); }
}
