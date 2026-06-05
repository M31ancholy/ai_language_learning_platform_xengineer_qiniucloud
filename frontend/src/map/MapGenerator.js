/**
 * 语塔攀登 - 地图生成算法
 * 仿杀戮尖塔的7×15网格地图生成
 */

import { CONSTANTS } from '../utils/Constants.js';
import { MapNode } from './MapNode.js';
import { MapPath } from './MapPath.js';
import { randomInt, randomChoice, weightedRandom } from '../utils/Helpers.js';

export class MapGenerator {
    /**
     * 生成一张新地图
     * @param {number} act - 章节号 (1-3)
     * @returns {{ nodes: MapNode[], paths: MapPath[] }}
     */
    generate(act) {
        const { COLS, ROWS, PATH_COUNT } = CONSTANTS.MAP;

        // 步骤1: 生成路径连接图
        const grid = this._createEmptyGrid(ROWS, COLS);
        const rawPaths = this._generatePaths(ROWS, COLS, PATH_COUNT);

        // 步骤2: 将路径合并到网格中
        this._populateGrid(grid, rawPaths);

        // 步骤3: 提取有效节点
        const nodes = this._extractNodes(grid);

        // 步骤4: 建立连接关系
        const paths = this._buildConnections(nodes, rawPaths);

        // 步骤5: 分配节点类型
        this._assignNodeTypes(nodes, act);

        // 步骤6: 分配难度
        this._assignDifficulty(nodes, act);

        return { nodes, paths };
    }

    /**
     * 创建空网格
     */
    _createEmptyGrid(rows, cols) {
        return Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => null)
        );
    }

    /**
     * 生成多条路径
     */
    _generatePaths(rows, cols, pathCount) {
        const paths = [];
        const usedStartCols = new Set();

        for (let p = 0; p < pathCount; p++) {
            // 选择起始列（尽量分散）
            let startCol;
            if (usedStartCols.size < cols) {
                do {
                    startCol = randomInt(0, cols - 1);
                } while (usedStartCols.has(startCol) && usedStartCols.size < cols);
            } else {
                startCol = randomInt(0, cols - 1);
            }
            usedStartCols.add(startCol);

            const path = [{ row: 0, col: startCol }];
            let currentCol = startCol;

            for (let row = 1; row < rows; row++) {
                // 从相邻列中选择（左、中、右），不超出边界
                const options = [];
                if (currentCol > 0) options.push(currentCol - 1);
                options.push(currentCol);
                if (currentCol < cols - 1) options.push(currentCol + 1);

                // 避免路径过于集中
                const nextCol = randomChoice(options);
                path.push({ row, col: nextCol });
                currentCol = nextCol;
            }

            paths.push(path);
        }

        return paths;
    }

    /**
     * 将路径填充到网格
     */
    _populateGrid(grid, paths) {
        for (const path of paths) {
            for (const { row, col } of path) {
                if (!grid[row][col]) {
                    grid[row][col] = new MapNode(row, col);
                }
            }
        }
    }

    /**
     * 提取所有有效节点
     */
    _extractNodes(grid) {
        const nodes = [];
        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[row].length; col++) {
                if (grid[row][col]) {
                    nodes.push(grid[row][col]);
                }
            }
        }
        return nodes;
    }

    /**
     * 建立节点间的连接关系
     */
    _buildConnections(nodes, paths) {
        const connections = [];
        const nodeMap = {};

        // 建立查找表
        for (const node of nodes) {
            const key = `${node.row}_${node.col}`;
            nodeMap[key] = node;
        }

        // 根据路径建立连接
        for (const path of paths) {
            for (let i = 0; i < path.length - 1; i++) {
                const fromKey = `${path[i].row}_${path[i].col}`;
                const toKey = `${path[i + 1].row}_${path[i + 1].col}`;
                const fromNode = nodeMap[fromKey];
                const toNode = nodeMap[toKey];

                if (fromNode && toNode) {
                    // 从下层连接到上层
                    if (!fromNode.connections.includes(toNode.id)) {
                        fromNode.connections.push(toNode.id);
                    }
                    if (!toNode.parents.includes(fromNode.id)) {
                        toNode.parents.push(fromNode.id);
                    }

                    connections.push(new MapPath(fromNode.id, toNode.id));
                }
            }
        }

        // 去除重复连接
        const uniqueConns = [];
        const connSet = new Set();
        for (const conn of connections) {
            const key = `${conn.from}->${conn.to}`;
            if (!connSet.has(key)) {
                connSet.add(key);
                uniqueConns.push(conn);
            }
        }

        return uniqueConns;
    }

    /**
     * 分配节点类型
     * 遵循杀戮尖塔的约束规则
     */
    _assignNodeTypes(nodes, act) {
        const { ROWS } = CONSTANTS.MAP;

        for (const node of nodes) {
            const row = node.row;

            // 规则1: 第1层固定为普通战斗
            if (row === 0) {
                node.type = CONSTANTS.NODE_TYPES.MONSTER;
                continue;
            }

            // 规则2: 最后一层（index=ROWS-1）固定为Boss
            if (row === ROWS - 1) {
                node.type = CONSTANTS.NODE_TYPES.BOSS;
                continue;
            }

            // 规则3: 倒数第二层（index=ROWS-2）固定为休息站
            if (row === ROWS - 2) {
                node.type = CONSTANTS.NODE_TYPES.REST;
                continue;
            }

            // 如果是 8 层地图（短路径爬塔）
            if (ROWS <= 10) {
                if (row === 1 || row === 2) {
                    node.type = weightedRandom({
                        monster: 55,
                        event: 30,
                        shop: 15,
                    });
                } else if (row === 3) {
                    node.type = weightedRandom({
                        elite: 40,
                        monster: 40,
                        event: 20,
                    });
                } else if (row === 4) {
                    // 第 5 层固定为宝藏
                    node.type = CONSTANTS.NODE_TYPES.TREASURE;
                } else if (row === 5) {
                    // 第 6 层，不生成休息站，避免和第 7 层（倒数第二层）连续休息冲突
                    node.type = weightedRandom({
                        shop: 35,
                        event: 45,
                        monster: 20,
                    });
                }
                continue;
            }

            // 原始 15 层地图的规则
            // 规则4: 前6层不出现精英关和休息站
            if (row < 6) {
                const restrictedWeights = {
                    monster: 55,
                    event: 25,
                    treasure: 10,
                    shop: 10,
                };
                node.type = weightedRandom(restrictedWeights);
                continue;
            }

            // 规则5: 正常层按权重随机
            node.type = weightedRandom(CONSTANTS.NODE_WEIGHTS);
        }

        // 后处理约束检查
        this._enforceConstraints(nodes);
    }

    /**
     * 强制执行约束条件
     */
    _enforceConstraints(nodes) {
        const { ROWS } = CONSTANTS.MAP;
        // 按行分组
        const byRow = {};
        for (const node of nodes) {
            if (!byRow[node.row]) byRow[node.row] = [];
            byRow[node.row].push(node);
        }

        // 检查同一路径相邻层不能连续相同特殊类型
        const specialTypes = ['elite', 'shop', 'rest'];

        for (const node of nodes) {
            if (!specialTypes.includes(node.type)) continue;

            // 检查父节点
            for (const parentId of node.parents) {
                const parent = nodes.find(n => n.id === parentId);
                if (parent && parent.type === node.type) {
                    // 冲突：将当前节点改为普通战斗
                    // 注意：不能把固定的最后一层 Boss 和 倒数第二层 Rest 改为 monster
                    if (node.row !== ROWS - 1 && node.row !== ROWS - 2) {
                        node.type = CONSTANTS.NODE_TYPES.MONSTER;
                    }
                }
            }

            // 检查兄弟节点（同一父节点的子节点）
            for (const parentId of node.parents) {
                const parent = nodes.find(n => n.id === parentId);
                if (!parent) continue;

                const siblings = nodes.filter(n =>
                    n.id !== node.id && n.parents.includes(parentId)
                );

                for (const sibling of siblings) {
                    if (sibling.type === node.type && specialTypes.includes(node.type)) {
                        if (node.row !== ROWS - 1 && node.row !== ROWS - 2) {
                            node.type = CONSTANTS.NODE_TYPES.MONSTER;
                        }
                    }
                }
            }
        }

        if (ROWS > 10) {
            // 确保至少有1个商店在6-12层之间
            const shopNodes = nodes.filter(n => n.type === 'shop' && n.row >= 6 && n.row <= 12);
            if (shopNodes.length === 0) {
                const candidates = nodes.filter(n =>
                    n.type === 'monster' && n.row >= 7 && n.row <= 11
                );
                if (candidates.length > 0) {
                    randomChoice(candidates).type = CONSTANTS.NODE_TYPES.SHOP;
                }
            }

            // 确保至少有1个精英在7-12层
            const eliteNodes = nodes.filter(n => n.type === 'elite' && n.row >= 6);
            if (eliteNodes.length === 0) {
                const candidates = nodes.filter(n =>
                    n.type === 'monster' && n.row >= 7 && n.row <= 12
                );
                if (candidates.length > 0) {
                    randomChoice(candidates).type = CONSTANTS.NODE_TYPES.ELITE;
                }
            }
        } else {
            // 确保至少有1个商店在 1, 2, 5 层
            const shopNodes = nodes.filter(n => n.type === 'shop');
            if (shopNodes.length === 0) {
                const candidates = nodes.filter(n => n.row === 1 || n.row === 2 || n.row === 5);
                if (candidates.length > 0) {
                    randomChoice(candidates).type = CONSTANTS.NODE_TYPES.SHOP;
                }
            }

            // 确保至少有1个精英在 3 层
            const eliteNodes = nodes.filter(n => n.type === 'elite');
            if (eliteNodes.length === 0) {
                const candidates = nodes.filter(n => n.row === 3);
                if (candidates.length > 0) {
                    randomChoice(candidates).type = CONSTANTS.NODE_TYPES.ELITE;
                }
            }
        }
    }

    /**
     * 分配难度等级
     */
    _assignDifficulty(nodes, act) {
        const { ROWS } = CONSTANTS.MAP;
        for (const node of nodes) {
            if (node.type === CONSTANTS.NODE_TYPES.MONSTER) {
                if (ROWS <= 10) {
                    if (node.row <= 2) {
                        node.difficulty = 'rookie';
                    } else if (node.row <= 5) {
                        node.difficulty = randomChoice(['rookie', 'expert', 'expert']);
                    } else {
                        node.difficulty = randomChoice(['expert', 'expert', 'hell']);
                    }
                } else {
                    if (node.row <= 4) {
                        node.difficulty = 'rookie';
                    } else if (node.row <= 9) {
                        node.difficulty = randomChoice(['rookie', 'expert', 'expert']);
                    } else {
                        node.difficulty = randomChoice(['expert', 'expert', 'hell']);
                    }
                }
            } else if (node.type === CONSTANTS.NODE_TYPES.ELITE) {
                node.difficulty = randomChoice(['expert', 'hell']);
            } else if (node.type === CONSTANTS.NODE_TYPES.BOSS) {
                node.difficulty = 'hell';
            }
        }
    }
}
