import Phaser from 'phaser';
import { CONSTANTS } from './Constants.js';

/**
 * 像素文字样式预设
 */
export const TEXT_STYLES = {
    // 标题（大号）
    title: {
        fontFamily: '"Press Start 2P", "PingFang SC", "Microsoft YaHei", "SimHei", sans-serif',
        fontSize: '24px',
        color: '#ff6b35',
        stroke: '#000000',
        strokeThickness: 4,
        shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 0, fill: true }
    },

    // 副标题
    subtitle: {
        fontFamily: '"Press Start 2P", "PingFang SC", "Microsoft YaHei", "SimHei", sans-serif',
        fontSize: '16px',
        color: '#51e5ff',
        stroke: '#000000',
        strokeThickness: 2,
    },

    // 正文
    body: {
        fontFamily: '"Press Start 2P", "PingFang SC", "Microsoft YaHei", "SimHei", sans-serif',
        fontSize: '10px',
        color: '#ffffff',
        lineSpacing: 8,
        wordWrap: { width: 700 },
    },

    // 小字
    small: {
        fontFamily: '"Press Start 2P", "PingFang SC", "Microsoft YaHei", "SimHei", sans-serif',
        fontSize: '8px',
        color: '#cccccc',
        lineSpacing: 6,
    },

    // 数值显示
    value: {
        fontFamily: '"Press Start 2P", "PingFang SC", "Microsoft YaHei", "SimHei", sans-serif',
        fontSize: '14px',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 2,
    },

    // 伤害数字
    damage: {
        fontFamily: '"Press Start 2P", "PingFang SC", "Microsoft YaHei", "SimHei", sans-serif',
        fontSize: '20px',
        color: '#ff2d2d',
        stroke: '#000000',
        strokeThickness: 3,
        shadow: { offsetX: 1, offsetY: 1, color: '#000', blur: 0, fill: true }
    },

    // 治疗数字
    heal: {
        fontFamily: '"Press Start 2P", "PingFang SC", "Microsoft YaHei", "SimHei", sans-serif',
        fontSize: '20px',
        color: '#4caf50',
        stroke: '#000000',
        strokeThickness: 3,
    },

    // 按钮文字
    button: {
        fontFamily: '"Press Start 2P", "PingFang SC", "Microsoft YaHei", "SimHei", sans-serif',
        fontSize: '12px',
        color: '#ffffff',
    },

    // 评分等级
    grade: {
        fontFamily: '"Press Start 2P", "PingFang SC", "Microsoft YaHei", "SimHei", sans-serif',
        fontSize: '48px',
        color: '#ffd700',
        stroke: '#000000',
        strokeThickness: 6,
        shadow: { offsetX: 3, offsetY: 3, color: '#000', blur: 0, fill: true }
    },
};

/**
 * 在场景中创建像素风文字
 * @param {Phaser.Scene} scene - Phaser场景
 * @param {number} x - X坐标
 * @param {number} y - Y坐标
 * @param {string} text - 文字内容
 * @param {string} style - 样式预设名称
 * @param {object} overrides - 样式覆盖
 * @returns {Phaser.GameObjects.Text}
 */
export function createPixelText(scene, x, y, text, style = 'body', overrides = {}) {
    const baseStyle = TEXT_STYLES[style] || TEXT_STYLES.body;
    const mergedStyle = { ...baseStyle, ...overrides };
    const textObj = scene.add.text(x, y, text, mergedStyle).setOrigin(0.5);
    
    // 超采样机制：设置较高分辨率（至少2倍，或匹配物理DPR），大幅提升画质
    const dpr = window.devicePixelRatio || 1;
    textObj.setResolution(Math.max(dpr, 2));
    
    // 设置过滤模式为 LINEAR（平滑过滤），防止在 pixelArt 模式下字体边缘因 nearest 过滤而破碎发虚
    if (textObj.texture) {
        textObj.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    }
    
    return textObj;
}

/**
 * 创建带描边的像素文字（更强调）
 */
export function createOutlinedText(scene, x, y, text, style = 'title', overrides = {}) {
    const textObj = createPixelText(scene, x, y, text, style, overrides);
    textObj.setShadow(2, 2, '#000000', 0, true, true);
    return textObj;
}
