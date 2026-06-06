/**
 * 语塔攀登 - 资源预加载场景
 * 生成所有像素精灵纹理并显示加载进度
 */

import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants.js';

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.PRELOAD });
    }

    create() {
        const { width, height } = this.scale;
        const cx = width / 2;
        const cy = height / 2;

        // ========== 加载画面 ==========
        this.add.rectangle(cx, cy, width, height, CONSTANTS.COLORS.BG_DARK);

        const title = this.add.text(cx, cy - 60, '⚔️ 语塔攀登 ⚔️', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '20px',
            color: '#ff6b35',
            stroke: '#000',
            strokeThickness: 3,
        }).setOrigin(0.5);

        const loadText = this.add.text(cx, cy + 20, '正在准备像素世界...', {
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#51e5ff',
        }).setOrigin(0.5);

        // 进度条背景
        const barBg = this.add.rectangle(cx, cy + 60, 300, 20, 0x2a1a3e);
        barBg.setStrokeStyle(2, CONSTANTS.COLORS.PRIMARY);

        // 进度条填充
        const barFill = this.add.rectangle(cx - 148, cy + 60, 0, 16, CONSTANTS.COLORS.PRIMARY);
        barFill.setOrigin(0, 0.5);

        // 生成所有纹理
        this._generateAllTextures(barFill, loadText, () => {
            // 所有纹理生成完毕，跳转到主菜单
            this.time.delayedCall(300, () => {
                this.scene.start(CONSTANTS.SCENES.MAIN_MENU);
            });
        });
    }

    _generateAllTextures(barFill, loadText, onComplete) {
        const tasks = [
            { name: '玩家角色', fn: () => this._createPlayerTexture() },
            { name: '地图节点', fn: () => this._createMapNodeTextures() },
            { name: '怪物精灵', fn: () => this._createMonsterTextures() },
            { name: 'Boss精灵', fn: () => this._createBossTextures() },
            { name: 'UI元素', fn: () => this._createUITextures() },
            { name: '道具图标', fn: () => this._createItemTextures() },
            { name: '背景纹理', fn: () => this._createBackgroundTextures() },
            { name: '特效粒子', fn: () => this._createParticleTextures() },
        ];

        let i = 0;
        const runNext = () => {
            if (i >= tasks.length) {
                loadText.setText('准备完毕！');
                barFill.width = 296;
                onComplete();
                return;
            }

            const task = tasks[i];
            loadText.setText(`加载中: ${task.name}...`);
            barFill.width = (i / tasks.length) * 296;

            task.fn();
            i++;
            this.time.delayedCall(80, runNext);
        };

        runNext();
    }

    // ========== 像素纹理生成 ==========

    _createPlayerTexture() {
        // 玩家角色 (16x24 像素)
        const g = this.add.graphics();

        // 身体
        g.fillStyle(0x51e5ff); // 冰蓝色铠甲
        g.fillRect(4, 8, 8, 10);

        // 头部
        g.fillStyle(0xffcc99); // 肤色
        g.fillRect(4, 2, 8, 6);

        // 眼睛
        g.fillStyle(0x000000);
        g.fillRect(5, 4, 2, 2);
        g.fillRect(9, 4, 2, 2);

        // 头发
        g.fillStyle(0x8B4513);
        g.fillRect(3, 1, 10, 2);

        // 腿
        g.fillStyle(0x333366);
        g.fillRect(4, 18, 3, 4);
        g.fillRect(9, 18, 3, 4);

        // 剑
        g.fillStyle(0xcccccc);
        g.fillRect(13, 6, 2, 12);
        g.fillStyle(0xffd700);
        g.fillRect(12, 5, 4, 2);

        g.generateTexture('player', 16, 24);
        g.destroy();
    }

    _createMapNodeTextures() {
        const nodeTypes = {
            monster: { color: 0xff6b35, symbol: '⚔' },
            elite: { color: 0xff2d2d, symbol: '💀' },
            shop: { color: 0xffd700, symbol: '$' },
            rest: { color: 0x4caf50, symbol: '🔥' },
            event: { color: 0xaa44ff, symbol: '?' },
            treasure: { color: 0xffd700, symbol: '★' },
            boss: { color: 0xff2d2d, symbol: '☠' },
        };

        for (const [type, data] of Object.entries(nodeTypes)) {
            const g = this.add.graphics();

            // 节点底座（圆形）
            g.fillStyle(0x2a1a3e);
            g.fillCircle(20, 20, 17);
            g.lineStyle(3, data.color, 1);
            g.strokeCircle(20, 20, 17);

            // 内部填充
            g.fillStyle(data.color, 0.4);
            g.fillCircle(20, 20, 12);

            g.generateTexture(`node_${type}`, 40, 40);
            g.destroy();
        }

        // 已完成节点
        const gDone = this.add.graphics();
        gDone.fillStyle(0x333333);
        gDone.fillCircle(20, 20, 17);
        gDone.lineStyle(3, 0x888888, 1);
        gDone.strokeCircle(20, 20, 17);
        gDone.generateTexture('node_completed', 40, 40);
        gDone.destroy();

        // 未解锁的锁节点（灰色，不透露关卡类型，直接显示一个灰色的像素锁）
        const gLocked = this.add.graphics();
        gLocked.fillStyle(0x1a0a2e);
        gLocked.fillCircle(20, 20, 17);
        gLocked.lineStyle(3, 0x555555, 1);
        gLocked.strokeCircle(20, 20, 17);
        gLocked.fillStyle(0x333333, 0.5);
        gLocked.fillCircle(20, 20, 12);

        // 绘制一个灰色的像素锁 (在 40x40 的中心)
        // 锁身 (14, 18) to (25, 27)
        gLocked.fillStyle(0x777777);
        gLocked.fillRect(14, 18, 12, 10);

        // 锁梁 (16, 13) to (24, 18)
        gLocked.fillRect(16, 14, 2, 4); // 左侧柱子
        gLocked.fillRect(22, 14, 2, 4); // 右侧柱子
        gLocked.fillRect(17, 13, 6, 2); // 顶部横条

        // 锁孔 (19, 21) to (21, 24)
        gLocked.fillStyle(0x1a0a2e);
        gLocked.fillRect(19, 21, 2, 4);

        gLocked.generateTexture('node_locked', 40, 40);
        gLocked.destroy();

        // 当前节点高亮
        const gCurrent = this.add.graphics();
        gCurrent.fillStyle(0x51e5ff, 0.3);
        gCurrent.fillCircle(24, 24, 22);
        gCurrent.lineStyle(4, 0x51e5ff, 1);
        gCurrent.strokeCircle(24, 24, 20);
        gCurrent.generateTexture('node_current', 48, 48);
        gCurrent.destroy();
    }

    _createMonsterTextures() {
        // 通用怪物（不同颜色变体）
        const variants = [
            { name: 'monster_rookie', color: 0x44aa44, eyeColor: 0xff0000 },
            { name: 'monster_expert', color: 0xaa4444, eyeColor: 0xffff00 },
            { name: 'monster_hell', color: 0x8800aa, eyeColor: 0xff4400 },
        ];

        for (const v of variants) {
            const g = this.add.graphics();

            // 身体
            g.fillStyle(v.color);
            g.fillRect(8, 12, 32, 28);

            // 头部
            g.fillStyle(v.color);
            g.fillRect(4, 2, 40, 14);

            // 眼睛
            g.fillStyle(v.eyeColor);
            g.fillRect(10, 6, 6, 6);
            g.fillRect(30, 6, 6, 6);

            // 瞳孔
            g.fillStyle(0x000000);
            g.fillRect(12, 8, 3, 3);
            g.fillRect(32, 8, 3, 3);

            // 嘴巴（锯齿状）
            g.fillStyle(0x000000);
            g.fillRect(14, 28, 20, 4);
            g.fillStyle(0xffffff);
            for (let x = 16; x < 32; x += 4) {
                g.fillRect(x, 28, 2, 3);
            }

            // 手臂
            g.fillStyle(v.color);
            g.fillRect(0, 16, 8, 6);
            g.fillRect(40, 16, 8, 6);

            g.generateTexture(v.name, 48, 44);
            g.destroy();
        }
    }

    _createBossTextures() {
        const bosses = [
            { name: 'boss_act1', bodyColor: 0xaa2200, accentColor: 0xffd700 },
            { name: 'boss_act2', bodyColor: 0x224488, accentColor: 0xcccccc },
            { name: 'boss_act3', bodyColor: 0x440044, accentColor: 0xff44ff },
        ];

        for (const b of bosses) {
            const g = this.add.graphics();

            // 大型Boss身体
            g.fillStyle(b.bodyColor);
            g.fillRect(12, 20, 56, 44);

            // 头部
            g.fillStyle(b.bodyColor);
            g.fillRect(8, 4, 64, 20);

            // 王冠/装饰
            g.fillStyle(b.accentColor);
            g.fillRect(16, 0, 8, 6);
            g.fillRect(36, 0, 8, 6);
            g.fillRect(56, 0, 8, 6);

            // 眼睛（发光）
            g.fillStyle(0xff0000);
            g.fillRect(18, 10, 10, 8);
            g.fillRect(52, 10, 10, 8);

            // 瞳孔
            g.fillStyle(0xffff00);
            g.fillRect(22, 12, 4, 4);
            g.fillRect(56, 12, 4, 4);

            // 嘴巴
            g.fillStyle(0x000000);
            g.fillRect(24, 40, 32, 6);
            g.fillStyle(0xffffff);
            for (let x = 26; x < 54; x += 4) {
                g.fillRect(x, 40, 2, 4);
            }

            // 肩甲
            g.fillStyle(b.accentColor);
            g.fillRect(2, 22, 12, 10);
            g.fillRect(66, 22, 12, 10);

            g.generateTexture(b.name, 80, 68);
            g.destroy();
        }
    }

    _createUITextures() {
        // 按钮背景
        const btnG = this.add.graphics();
        btnG.fillStyle(0x2a1a3e);
        btnG.fillRect(0, 0, 200, 40);
        btnG.lineStyle(2, 0xff6b35, 1);
        btnG.strokeRect(0, 0, 200, 40);
        btnG.generateTexture('btn_normal', 200, 40);
        btnG.destroy();

        // 按钮（悬停）
        const btnH = this.add.graphics();
        btnH.fillStyle(0xff6b35);
        btnH.fillRect(0, 0, 200, 40);
        btnH.lineStyle(2, 0xffd700, 1);
        btnH.strokeRect(0, 0, 200, 40);
        btnH.generateTexture('btn_hover', 200, 40);
        btnH.destroy();

        // 面板背景
        const panelG = this.add.graphics();
        panelG.fillStyle(0x2a1a3e, 0.9);
        panelG.fillRect(0, 0, 100, 100);
        panelG.lineStyle(2, 0xff6b35, 0.5);
        panelG.strokeRect(0, 0, 100, 100);
        panelG.generateTexture('panel_bg', 100, 100);
        panelG.destroy();

        // 记录按钮（圆形）
        const recG = this.add.graphics();
        recG.fillStyle(0xff2d2d);
        recG.fillCircle(24, 24, 22);
        recG.lineStyle(3, 0xff6b35, 1);
        recG.strokeCircle(24, 24, 22);
        recG.generateTexture('btn_record', 48, 48);
        recG.destroy();

        // 停止按钮
        const stopG = this.add.graphics();
        stopG.fillStyle(0x444444);
        stopG.fillCircle(24, 24, 22);
        stopG.fillStyle(0xff2d2d);
        stopG.fillRect(14, 14, 20, 20);
        stopG.lineStyle(3, 0xff6b35, 1);
        stopG.strokeCircle(24, 24, 22);
        stopG.generateTexture('btn_stop', 48, 48);
        stopG.destroy();
    }

    _createItemTextures() {
        const items = [
            { name: 'item_hp_potion', bodyColor: 0xff2d2d, liquidColor: 0xff6666 },
            { name: 'item_shield', bodyColor: 0x4488ff, liquidColor: 0x66aaff },
            { name: 'item_gold', bodyColor: 0xffd700, liquidColor: 0xffee88 },
            { name: 'item_book', bodyColor: 0x8B4513, liquidColor: 0xffd700 },
            { name: 'item_scroll', bodyColor: 0xeeeecc, liquidColor: 0xaa8844 },
        ];

        for (const item of items) {
            const g = this.add.graphics();

            // 药瓶/物品形状
            g.fillStyle(item.bodyColor);
            g.fillRect(4, 4, 16, 20);
            g.fillStyle(item.liquidColor);
            g.fillRect(6, 8, 12, 14);
            g.fillStyle(0xcccccc);
            g.fillRect(8, 2, 8, 4);

            g.generateTexture(item.name, 24, 26);
            g.destroy();
        }
    }

    _createBackgroundTextures() {
        // 地图背景纹理（简单星空）
        const bg = this.add.graphics();
        bg.fillStyle(0x1a0a2e);
        bg.fillRect(0, 0, 64, 64);
        // 随机星星
        bg.fillStyle(0xffffff, 0.3);
        const stars = [[5, 12], [23, 8], [45, 31], [12, 50], [55, 15], [34, 45], [8, 35], [50, 55]];
        for (const [sx, sy] of stars) {
            g_drawStar(bg, sx, sy);
        }
        bg.generateTexture('bg_stars', 64, 64);
        bg.destroy();

        // 篝火纹理
        const fire = this.add.graphics();
        fire.fillStyle(0x8B4513);
        fire.fillRect(8, 24, 16, 6); // 木头
        fire.fillStyle(0xff6b35);
        fire.fillRect(12, 12, 8, 14); // 火焰
        fire.fillStyle(0xffd700);
        fire.fillRect(14, 16, 4, 8); // 内焰
        fire.generateTexture('campfire', 32, 32);
        fire.destroy();

        // 宝箱
        const chest = this.add.graphics();
        chest.fillStyle(0x8B4513);
        chest.fillRect(4, 8, 24, 16);
        chest.fillStyle(0xffd700);
        chest.fillRect(12, 6, 8, 4);
        chest.fillRect(14, 12, 4, 6);
        chest.lineStyle(2, 0x664400);
        chest.strokeRect(4, 8, 24, 16);
        chest.generateTexture('treasure_chest', 32, 28);
        chest.destroy();
    }

    _createParticleTextures() {
        // 小粒子
        const p = this.add.graphics();
        p.fillStyle(0xffffff);
        p.fillRect(0, 0, 4, 4);
        p.generateTexture('particle_white', 4, 4);
        p.destroy();

        // 金色粒子
        const pg = this.add.graphics();
        pg.fillStyle(0xffd700);
        pg.fillRect(0, 0, 4, 4);
        pg.generateTexture('particle_gold', 4, 4);
        pg.destroy();

        // 红色粒子
        const pr = this.add.graphics();
        pr.fillStyle(0xff2d2d);
        pr.fillRect(0, 0, 4, 4);
        pr.generateTexture('particle_red', 4, 4);
        pr.destroy();

        // 蓝色粒子
        const pb = this.add.graphics();
        pb.fillStyle(0x51e5ff);
        pb.fillRect(0, 0, 4, 4);
        pb.generateTexture('particle_blue', 4, 4);
        pb.destroy();
    }
}

// 辅助：画星星点
function g_drawStar(g, x, y) {
    g.fillRect(x, y, 2, 2);
}
