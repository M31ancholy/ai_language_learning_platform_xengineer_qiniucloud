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
                g.lineStyle(6, 0x888888, 0.9); // 已完成路径：6px 粗，明亮灰色
            } else if (isAvailable) {
                g.lineStyle(10, 0x51e5ff, 1.0); // 当前可用路径：10px 极粗，亮冰蓝色，极高对比度
            } else {
                g.lineStyle(5, 0x4e3d6f, 0.8); // 未解锁路径：5px 粗，深紫灰色，清晰可见但暗淡
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

        const isLocked = !isCompleted && !isAvailable;

        // 节点纹理选择
        let textureKey;
        if (isCompleted) {
            textureKey = 'node_completed';
        } else if (isLocked) {
            textureKey = 'node_locked';
        } else {
            textureKey = `node_${node.type}`;
        }

        // 创建节点精灵
        const sprite = this.scene.add.image(pos.x, pos.y, textureKey);
        sprite.setScale(1.2);
        this.container.add(sprite);

        // 节点内容：非锁定节点才显示类型图标和难度
        let icon = null;
        let diffLabel = null;

        if (!isLocked) {
            // 节点类型图标文字
            const iconText = this._getNodeIcon(node.type);
            icon = this.scene.add.text(pos.x, pos.y - 1, iconText, {
                fontFamily: '"Press Start 2P", monospace',
                fontSize: '12px', // 稍大一点，契合 40x40 节点
                color: isCompleted ? '#555555' : '#ffffff',
            }).setOrigin(0.5);
            icon.setScale(1.2);
            this.container.add(icon);

            // 难度标记
            if (node.difficulty && !isCompleted && (node.type === 'monster' || node.type === 'elite')) {
                const diffInfo = CONSTANTS.DIFFICULTY[node.difficulty.toUpperCase()];
                if (diffInfo) {
                    diffLabel = this.scene.add.text(pos.x, pos.y + 20, diffInfo.icon, {
                        fontSize: '9px',
                    }).setOrigin(0.5);
                    this.container.add(diffLabel);
                }
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

        // 可选节点闪耀的特效
        if (isAvailable && !isCompleted) {
            // 1. 金色外发光圈双重涟漪特效
            const ring1 = this.scene.add.graphics();
            ring1.lineStyle(3, 0xffd700, 1);
            ring1.strokeCircle(0, 0, 20); // 配合 40x40 节点的外圈半径
            ring1.setPosition(pos.x, pos.y);
            this.container.add(ring1);

            this.scene.tweens.add({
                targets: ring1,
                scaleX: 1.7,
                scaleY: 1.7,
                alpha: 0,
                duration: 1500,
                repeat: -1,
                ease: 'Sine.easeOut'
            });

            const ring2 = this.scene.add.graphics();
            ring2.lineStyle(3, 0xffd700, 1);
            ring2.strokeCircle(0, 0, 20);
            ring2.setPosition(pos.x, pos.y);
            this.container.add(ring2);

            this.scene.tweens.add({
                targets: ring2,
                scaleX: 1.7,
                scaleY: 1.7,
                alpha: 0,
                duration: 1500,
                delay: 750,
                repeat: -1,
                ease: 'Sine.easeOut'
            });

            // 2. 围绕节点旋转、放大的金色小星 (3颗)
            const starSymbols = ['✦', '★', '✨'];
            for (let i = 0; i < 3; i++) {
                const angle = (i * Math.PI * 2) / 3;
                const distance = 26;
                const sx = pos.x + Math.cos(angle) * distance;
                const sy = pos.y + Math.sin(angle) * distance;
                const symbol = starSymbols[i % starSymbols.length];

                const star = this.scene.add.text(sx, sy, symbol, {
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: '8px',
                    color: '#ffd700',
                }).setOrigin(0.5);
                this.container.add(star);

                this.scene.tweens.add({
                    targets: star,
                    scaleX: 1.5,
                    scaleY: 1.5,
                    alpha: 0.3,
                    angle: 180,
                    duration: 1000 + i * 200,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }

            // 3. 呼吸与悬停缩放动画同步管理
            const targetsToScale = [sprite];
            if (icon) targetsToScale.push(icon);
            if (diffLabel) targetsToScale.push(diffLabel);

            let hoverTween = null;
            const startBreathe = () => {
                return this.scene.tweens.add({
                    targets: targetsToScale,
                    scaleX: 1.35,
                    scaleY: 1.35,
                    duration: 900,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Quad.easeInOut'
                });
            };

            let breatheTween = startBreathe();

            const onOver = () => {
                if (breatheTween) {
                    breatheTween.stop();
                    breatheTween = null;
                }
                if (hoverTween) hoverTween.stop();

                hoverTween = this.scene.tweens.add({
                    targets: targetsToScale,
                    scaleX: 1.5,
                    scaleY: 1.5,
                    duration: 150,
                    ease: 'Quad.easeOut'
                });
            };

            const onOut = () => {
                if (hoverTween) {
                    hoverTween.stop();
                    hoverTween = null;
                }

                hoverTween = this.scene.tweens.add({
                    targets: targetsToScale,
                    scaleX: 1.2,
                    scaleY: 1.2,
                    duration: 150,
                    ease: 'Quad.easeIn',
                    onComplete: () => {
                        breatheTween = startBreathe();
                    }
                });
            };

            // 可交互设置
            sprite.setInteractive({ useHandCursor: true });
            sprite.on('pointerover', onOver);
            sprite.on('pointerout', onOut);
            sprite.on('pointerup', () => {
                if (onNodeClick) onNodeClick(node);
            });

            if (icon) {
                icon.setInteractive({ useHandCursor: true });
                icon.on('pointerover', onOver);
                icon.on('pointerout', onOut);
                icon.on('pointerup', () => {
                    if (onNodeClick) onNodeClick(node);
                });
            }
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
