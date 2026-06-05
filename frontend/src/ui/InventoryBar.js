/**
 * 语塔攀登 - 背包栏组件
 */

import { CONSTANTS } from '../utils/Constants.js';

export class InventoryBar {
    constructor(scene, x, y, options = {}) {
        const { slotSize = 32, gap = 4, maxSlots = CONSTANTS.PLAYER.INVENTORY_SIZE } = options;
        this.scene = scene;
        this.container = scene.add.container(x, y);
        this.slots = [];
        this.maxSlots = maxSlots;

        for (let i = 0; i < maxSlots; i++) {
            const slotX = i * (slotSize + gap);
            const slot = scene.add.rectangle(slotX, 0, slotSize, slotSize, CONSTANTS.COLORS.BG_PANEL);
            slot.setStrokeStyle(1, 0x555555);
            this.container.add(slot);
            this.slots.push({ bg: slot, icon: null });
        }
    }

    update(items) {
        for (let i = 0; i < this.maxSlots; i++) {
            if (this.slots[i].icon) {
                this.slots[i].icon.destroy();
                this.slots[i].icon = null;
            }
            if (items[i]) {
                const icon = this.scene.add.text(
                    this.slots[i].bg.x, 0,
                    items[i].icon || '📦',
                    { fontSize: '16px' }
                ).setOrigin(0.5);
                this.container.add(icon);
                this.slots[i].icon = icon;
            }
        }
    }

    destroy() { this.container.destroy(true); }
}
