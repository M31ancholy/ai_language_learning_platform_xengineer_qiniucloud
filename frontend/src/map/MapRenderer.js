/**
 * 语塔攀登 - 地图渲染器
 * 在Phaser场景中渲染关卡树地图
 */

import { CONSTANTS } from '../utils/Constants.js';

export class MapRenderer {
    /**
     * @param {Phaser.Scene} scene - Phaser场景实例
     */
    constructor(scene) {
        this.scene = scene;
        this.nodeSprites = {};  // nodeId -> sprite
        this.pathGraphics = null;
        this.container = null;
    }

    /**
     * 渲染完整地图
     * @param {object} mapData - { nodes, paths }
     * @param {string[]} completedNodes - 已完成的节点ID
     * @param {string} currentNodeId - 当前节点ID
     * @param {Function} onNodeClick - 节点点击回调
     */
    render(mapData, completedNodes, currentNodeId, onNodeClick) {
        const { nodes, paths } = mapData;
        const config = CONSTANTS.MAP;

        // 创建容器（用于整体滚动）
        this.container = this.scene.add.container(0, 0);

        // 绘制连接路径
        this.pathGraphics = this.scene.add.graphics();
        this.container.add(this.pathGraphics);
        this._drawPaths(nodes, paths, completedNodes, config);

        // 绘制节点
        for (const node of nodes) {
            this._drawNode(node, completedNodes, currentNodeId, onNodeClick, config);
        }

        // 计算地图总高度
        const totalHeight = config.OFFSET_Y + config.ROWS * config.NODE_SPACING_Y + 50;
        this.mapHeight = totalHeight;

        return this.container;
    }

    /**
     * 绘制路径连线
     */
    _drawPaths(nodes, paths, completedNodes, config) {
        const g = this.pathGraphics;
        const nodeMap = {};
        for (const node of nodes) {
            nodeMap[node.id] = node;
        }

        for (const path of paths) {
            const fromNode = nodeMap[path.from];
            const toNode = nodeMap[path.to];
            if (!fromNode || !toNode) continue;

            const fromPos = this._getNodePosition(fromNode, config);
            const toPos = this._getNodePosition(toNode, config);

            const isCompleted = completedNodes.includes(fromNode.id) && completedNodes.includes(toNode.id);
            const isAvailable = completedNodes.includes(fromNode.id) && !completedNodes.includes(toNode.id);

            if (isCompleted) {
                g.lineStyle(2, 0x555555, 0.5);
            } else if (isAvailable) {
                g.lineStyle(2, CONSTANTS.COLORS.ACCENT, 0.7);
            } else {
                g.lineStyle(1, 0x333333, 0.3);
            }

            g.lineBetween(fromPos.x, fromPos.y, toPos.x, toPos.y);
        }
    }

    _getNodePosition(node, config) {
        // 动态根据屏幕宽度居中计算 OFFSET_X 确保在不同分辨率下完美居中
        const offsetX = (this.scene.scale.width - (config.COLS - 1) * config.NODE_SPACING_X) / 2;
        const x = offsetX + node.col * config.NODE_SPACING_X;
        const y = config.OFFSET_Y + (config.ROWS - 1 - node.row) * config.NODE_SPACING_Y;
        return { x, y };
    }

    /**
     * 绘制单个节点
     */
    _drawNode(node, completedNodes, currentNodeId, onNodeClick, config) {
        const pos = this._getNodePosition(node, config);
        const isCompleted = completedNodes.includes(node.id);
        const isCurrent = node.id === currentNodeId;

        // 判断是否可选（父节点已完成或无父节点）
        let isAvailable = false;
        if (node.row === 0 && completedNodes.length === 0) {
            // 起始层，如果还没开始则可选
            isAvailable = true;
        } else if (node.parents.some(pid => completedNodes.includes(pid))) {
            isAvailable = !isCompleted;
        }

        // 节点纹理选择
        let textureKey;
        if (isCompleted) {
            textureKey = 'node_completed';
        } else {
            textureKey = `node_${node.type}`;
        }

        // 创建节点精灵
        const sprite = this.scene.add.image(pos.x, pos.y, textureKey);
        sprite.setScale(1.2);
        this.container.add(sprite);

        // 节点类型图标文字
        const iconText = this._getNodeIcon(node.type);
        const icon = this.scene.add.text(pos.x, pos.y - 1, iconText, {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: isCompleted ? '#555555' : '#ffffff',
        }).setOrigin(0.5);
        this.container.add(icon);

        // 难度标记
        if (node.difficulty && !isCompleted && (node.type === 'monster' || node.type === 'elite')) {
            const diffInfo = CONSTANTS.DIFFICULTY[node.difficulty.toUpperCase()];
            if (diffInfo) {
                const diffLabel = this.scene.add.text(pos.x, pos.y + 18, diffInfo.icon, {
                    fontSize: '8px',
                }).setOrigin(0.5);
                this.container.add(diffLabel);
            }
        }

        // 当前位置高亮
        if (isCurrent) {
            const highlight = this.scene.add.image(pos.x, pos.y, 'node_current');
            highlight.setScale(1.3);
            this.container.add(highlight);

            // 脉动动画
            this.scene.tweens.add({
                targets: highlight,
                alpha: 0.3,
                scaleX: 1.6,
                scaleY: 1.6,
                duration: 1000,
                yoyo: true,
                repeat: -1,
            });
        }

        // 可选节点闪烁
        if (isAvailable && !isCompleted) {
            this.scene.tweens.add({
                targets: sprite,
                alpha: 0.6,
                duration: 800,
                yoyo: true,
                repeat: -1,
            });

            // 可交互
            sprite.setInteractive({ useHandCursor: true });
            sprite.on('pointerover', () => {
                sprite.setScale(1.5);
            });
            sprite.on('pointerout', () => {
                sprite.setScale(1.2);
            });
            sprite.on('pointerup', () => {
                if (onNodeClick) onNodeClick(node);
            });

            // 图标也可交互
            icon.setInteractive({ useHandCursor: true });
            icon.on('pointerup', () => {
                if (onNodeClick) onNodeClick(node);
            });
        }

        this.nodeSprites[node.id] = sprite;
    }

    /**
     * 获取节点图标
     */
    _getNodeIcon(type) {
        const icons = {
            monster: '⚔',
            elite: '☠',
            shop: '$',
            rest: '♨',
            event: '?',
            treasure: '★',
            boss: '☠',
        };
        return icons[type] || '?';
    }

    /**
     * 滚动地图到指定层
     */
    scrollToRow(row) {
        if (!this.container) return;
        const config = CONSTANTS.MAP;
        const targetY = -(config.ROWS - 1 - row) * config.NODE_SPACING_Y + 300;

        this.scene.tweens.add({
            targets: this.container,
            y: Math.max(Math.min(targetY, 0), -(this.mapHeight - this.scene.scale.height)),
            duration: 500,
            ease: 'Power2',
        });
    }

    /**
     * 销毁渲染
     */
    destroy() {
        if (this.container) {
            this.container.destroy(true);
        }
    }
}
