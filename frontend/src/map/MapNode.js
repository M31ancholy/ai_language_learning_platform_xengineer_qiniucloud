/**
 * 语塔攀登 - 地图节点数据结构
 */

import { generateId } from '../utils/Helpers.js';

export class MapNode {
    /**
     * @param {number} row - 层数 (0-14)
     * @param {number} col - 列数 (0-6)
     * @param {string} type - 节点类型
     */
    constructor(row, col, type = 'monster') {
        this.id = `node_${row}_${col}_${generateId()}`;
        this.row = row;
        this.col = col;
        this.type = type;
        this.connections = []; // 连接的上层节点ID列表
        this.parents = [];    // 连接的下层节点ID列表
        this.visited = false;
        this.available = false;

        // 战斗关卡详情（由关卡选择器填充）
        this.challengeData = null;
        // 难度
        this.difficulty = null;
    }

    /**
     * 获取节点在画布上的位置
     */
    getPosition(config) {
        const x = config.OFFSET_X + this.col * config.NODE_SPACING_X;
        const y = config.OFFSET_Y + (14 - this.row) * config.NODE_SPACING_Y;
        return { x, y };
    }
}
