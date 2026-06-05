/**
 * 语塔攀登 - 工具函数
 */

/**
 * 生成指定范围内的随机整数 [min, max]
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 从数组中随机选择一个元素
 */
export function randomChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 从数组中随机选择多个不重复元素
 */
export function randomSample(arr, count) {
    const shuffled = [...arr].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

/**
 * 按权重随机选择
 * @param {Object} weights - { key: weight }
 * @returns {string} 选中的key
 */
export function weightedRandom(weights) {
    const entries = Object.entries(weights);
    const total = entries.reduce((sum, [, w]) => sum + w, 0);
    let roll = Math.random() * total;

    for (const [key, weight] of entries) {
        roll -= weight;
        if (roll <= 0) return key;
    }
    return entries[entries.length - 1][0];
}

/**
 * 洗牌算法 (Fisher-Yates)
 */
export function shuffle(arr) {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * 限制数值在范围内
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * 线性插值
 */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * 延迟（Promise版）
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 格式化时间（秒 → MM:SS）
 */
export function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/**
 * 十六进制颜色转RGB字符串
 */
export function hexToRgb(hex) {
    const r = (hex >> 16) & 0xff;
    const g = (hex >> 8) & 0xff;
    const b = hex & 0xff;
    return `rgb(${r}, ${g}, ${b})`;
}

/**
 * 十六进制颜色转CSS格式
 */
export function hexToCSS(hex) {
    return '#' + hex.toString(16).padStart(6, '0');
}

/**
 * 深拷贝
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * 生成唯一ID
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 计算两点之间的距离
 */
export function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}
