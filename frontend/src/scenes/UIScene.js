/**
 * 语塔攀登 - 持久UI覆盖层场景
 * 可以在游戏各个部分叠加显示一些状态、通知或调试面板
 */

import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants.js';
import { EventBus, EVENTS } from '../utils/EventBus.js';
import { GameState } from '../game/GameState.js';
import { createPixelText } from '../utils/PixelText.js';

export class UIScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.UI });
        this.visible = false;
    }

    create() {
        this.container = this.add.container(0, 0).setDepth(2000).setVisible(false);

        // 监听显示和隐藏指令
        EventBus.on('ui-show', () => {
            this.container.setVisible(true);
            this._updateStats();
        });

        EventBus.on('ui-hide', () => {
            this.container.setVisible(false);
        });

        EventBus.on('player-update', () => {
            if (this.container.visible) {
                this._updateStats();
            }
        });

        // 初始化UI元素
        this._initUIElements();
    }

    _initUIElements() {
        const { width, height } = this.scale;
        
        // 顶部黑色遮罩条
        const bar = this.add.rectangle(width / 2, 20, width, 40, 0x000000, 0.7);
        this.container.add(bar);

        // 简单的状态提示文字
        this.statusText = this.add.text(width / 2, 20, '', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#51e5ff',
        }).setOrigin(0.5);
        this.container.add(this.statusText);
    }

    _updateStats() {
        if (!this.statusText) return;
        const p = GameState.player;
        this.statusText.setText(`HP: ${p.hp}/${p.maxHp} | GOLD: ${p.gold} | ENERGY: ${p.energy}/${p.maxEnergy}`);
    }
}
