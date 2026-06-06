/**
 * 语塔攀登 - 游戏入口
 * Word Spire - Main Entry
 */

import Phaser from 'phaser';
import { GameConfig } from './game/GameConfig.js';

// 拦截 Phaser 3 的 Text 创建方法，全局处理文字模糊和锯齿问题并放大 1.5 倍
const originalTextCreator = Phaser.GameObjects.GameObjectFactory.prototype.text;
Phaser.GameObjects.GameObjectFactory.prototype.text = function (x, y, text, style) {
    let finalStyle = style;
    if (style) {
        // 浅拷贝 style 以防修改原引用对象
        finalStyle = { ...style };
        
        // 自动添加 padding 避免字体在 Canvas 渲染时最下方或顶部被裁剪
        if (!finalStyle.padding) {
            finalStyle.padding = { top: 6, bottom: 6, left: 6, right: 6 };
        } else if (typeof finalStyle.padding === 'number') {
            const pad = finalStyle.padding;
            finalStyle.padding = { top: pad + 6, bottom: pad + 6, left: pad + 6, right: pad + 6 };
        } else {
            finalStyle.padding = {
                top: (finalStyle.padding.top || 0) + 6,
                bottom: (finalStyle.padding.bottom || 0) + 6,
                left: (finalStyle.padding.left || 0) + 6,
                right: (finalStyle.padding.right || 0) + 6
            };
        }
        
        // 缩放字号（放大 1.5 倍）
        if (finalStyle.fontSize !== undefined && finalStyle.fontSize !== null) {
            if (typeof finalStyle.fontSize === 'number') {
                finalStyle.fontSize = finalStyle.fontSize * 1.5;
            } else if (typeof finalStyle.fontSize === 'string') {
                const match = finalStyle.fontSize.match(/^([\d.]+)([a-zA-Z%]+)?$/);
                if (match) {
                    const value = parseFloat(match[1]);
                    const unit = match[2] || 'px';
                    finalStyle.fontSize = (value * 1.5) + unit;
                }
            }
        } else {
            // Phaser 默认字号为 16px，放大 1.5 倍为 24px
            finalStyle.fontSize = '24px';
        }
        
        // 缩放描边粗细（放大 1.5 倍）
        if (finalStyle.strokeThickness !== undefined && finalStyle.strokeThickness !== null) {
            finalStyle.strokeThickness = finalStyle.strokeThickness * 1.5;
        }

        // 缩放行间距（放大 1.5 倍）
        if (finalStyle.lineSpacing !== undefined && finalStyle.lineSpacing !== null) {
            finalStyle.lineSpacing = finalStyle.lineSpacing * 1.5;
        }
    } else {
        // 如果没有传入 style，使用带缩放的默认字号和 padding
        finalStyle = {
            fontSize: '24px',
            padding: { top: 6, bottom: 6, left: 6, right: 6 }
        };
    }

    const textObj = originalTextCreator.call(this, x, y, text, finalStyle);
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
