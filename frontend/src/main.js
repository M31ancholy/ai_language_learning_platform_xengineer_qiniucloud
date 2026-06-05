/**
 * 语塔攀登 - 游戏入口
 * Word Spire - Main Entry
 */

import Phaser from 'phaser';
import { GameConfig } from './game/GameConfig.js';

// 拦截 Phaser 3 的 Text 创建方法，全局处理文字模糊和锯齿问题
const originalTextCreator = Phaser.GameObjects.GameObjectFactory.prototype.text;
Phaser.GameObjects.GameObjectFactory.prototype.text = function (x, y, text, style) {
    const textObj = originalTextCreator.call(this, x, y, text, style);
    if (textObj) {
        // 超采样机制：设置较高分辨率（至少 2 倍，或匹配物理 DPR），大幅提升文本清晰度
        const dpr = window.devicePixelRatio || 1;
        textObj.setResolution(Math.max(dpr, 2));
        
        // 设置过滤模式为 LINEAR（平滑过滤），防止在游戏 pixelArt: true 模式下字体边缘因 nearest 过滤而破碎发虚
        if (textObj.texture) {
            textObj.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        }
    }
    return textObj;
};

// 从 localStorage 加载分辨率设置并应用到配置中
try {
    const rawSettings = localStorage.getItem('yuta_settings');
    if (rawSettings) {
        const settings = JSON.parse(rawSettings);
        if (settings.resolution) {
            const { w, h } = settings.resolution;
            GameConfig.width = w;
            GameConfig.height = h;
            console.log(`[Main] Set boot resolution to: ${w}x${h}`);
        }
    }
} catch (e) {
    console.warn('Failed to load boot resolution settings:', e);
}

// 启动游戏
const game = new Phaser.Game(GameConfig);

// 暴露到全局（调试用）
window.__WORD_SPIRE__ = game;
