/**
 * 语塔攀登 - 启动场景
 * 最先加载的场景，初始化基本设置
 */

import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants.js';

export class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.BOOT });
    }

    preload() {
        // 在这里可以加载启动画面需要的最小资源
        // 目前使用纯图形绘制，不需要预加载
    }

    create() {
        // 设置全局游戏配置
        this.scale.on('resize', this.resize, this);

        // 跳转到预加载场景
        this.scene.start(CONSTANTS.SCENES.PRELOAD);
    }

    resize(gameSize) {
        // 响应窗口缩放
    }
}
