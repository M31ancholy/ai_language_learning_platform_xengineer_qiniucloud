/**
 * 语塔攀登 - 图鉴场景
 * 标签页切换：遗物/道具/Boss/成就
 */

import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants.js';
import { EventBus, EVENTS } from '../utils/EventBus.js';
import { GameState } from '../game/GameState.js';
import { createPixelText } from '../utils/PixelText.js';

export class CollectionScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.COLLECTION });
    }

    init() {
        this.currentTab = 'relics';

        // 从localStorage读取解锁数据
        try {
            const raw = localStorage.getItem('wordspire_collection');
            this.collectionData = raw ? JSON.parse(raw) : {
                relics: [],
                items: [],
                bosses: [],
                achievements: [],
            };
        } catch (e) {
            this.collectionData = { relics: [], items: [], bosses: [], achievements: [] };
        }
    }

    create() {
        const { width, height } = this.scale;
        const C = CONSTANTS.COLORS;

        this.cameras.main.setBackgroundColor(C.BG_DARK);

        // 标题
        createPixelText(this, width / 2, 32, '📖 图鉴', 'title', { fontSize: '20px' });

        // 标签页
        this._createTabs(width);

        // 内容区域
        this.contentContainer = this.add.container(0, 0);
        this._showTabContent(this.currentTab, width, height);

        // 返回按钮
        this._createBackButton(width, height);
    }

    // ========== 标签页 ==========

    _createTabs(w) {
        const tabs = [
            { key: 'relics', label: '🔮 遗物', color: CONSTANTS.COLORS.PURPLE },
            { key: 'items', label: '📦 道具', color: CONSTANTS.COLORS.ACCENT },
            { key: 'bosses', label: '👹 Boss', color: CONSTANTS.COLORS.DANGER },
            { key: 'achievements', label: '🏅 成就', color: CONSTANTS.COLORS.GOLD },
        ];

        const tabW = 180;
        const gap = 15;
        const totalW = tabs.length * tabW + (tabs.length - 1) * gap;
        const startX = (w - totalW) / 2 + tabW / 2;

        this.tabGraphics = [];
        this.tabHits = [];

        tabs.forEach((tab, i) => {
            const cx = startX + i * (tabW + gap);
            const cy = 72;
            const isActive = tab.key === this.currentTab;

            const g = this.add.graphics();
            this._drawTab(g, cx, cy, tabW, 30, tab.color, isActive);

            createPixelText(this, cx, cy, tab.label, 'small', {
                fontSize: '8px',
                color: isActive ? '#ffffff' : '#888888',
            });

            const hit = this.add.rectangle(cx, cy, tabW, 30, 0xffffff, 0)
                .setInteractive({ useHandCursor: true });

            hit.on('pointerdown', () => {
                this.currentTab = tab.key;
                this._refreshTabs(w);
                this._showTabContent(tab.key, this.scale.width, this.scale.height);
            });

            this.tabGraphics.push({ graphics: g, tab, cx, cy, tabW });
            this.tabHits.push(hit);
        });
    }

    _drawTab(g, cx, cy, w, h, color, active) {
        g.clear();
        g.fillStyle(active ? CONSTANTS.COLORS.BG_PANEL_LIGHT : CONSTANTS.COLORS.BG_PANEL, active ? 0.9 : 0.5);
        g.fillRoundedRect(cx - w / 2, cy - h / 2, w, h, { tl: 6, tr: 6, bl: 0, br: 0 });
        if (active) {
            g.lineStyle(2, color, 0.8);
            g.strokeRoundedRect(cx - w / 2, cy - h / 2, w, h, { tl: 6, tr: 6, bl: 0, br: 0 });
            // 底部高亮线
            g.fillStyle(color, 1);
            g.fillRect(cx - w / 2, cy + h / 2 - 3, w, 3);
        }
    }

    _refreshTabs(w) {
        const tabs = [
            { key: 'relics', label: '🔮 遗物', color: CONSTANTS.COLORS.PURPLE },
            { key: 'items', label: '📦 道具', color: CONSTANTS.COLORS.ACCENT },
            { key: 'bosses', label: '👹 Boss', color: CONSTANTS.COLORS.DANGER },
            { key: 'achievements', label: '🏅 成就', color: CONSTANTS.COLORS.GOLD },
        ];

        this.tabGraphics.forEach((tg, i) => {
            const isActive = tabs[i].key === this.currentTab;
            this._drawTab(tg.graphics, tg.cx, tg.cy, tg.tabW, 30, tabs[i].color, isActive);
        });
    }

    // ========== 内容区 ==========

    _showTabContent(tabKey, w, h) {
        // 清空内容容器
        this.contentContainer.removeAll(true);

        const contentY = 100;
        const contentH = h - 170;

        // 内容面板背景
        const bg = this.add.graphics();
        bg.fillStyle(CONSTANTS.COLORS.BG_PANEL, 0.5);
        bg.fillRoundedRect(20, contentY, w - 40, contentH, 8);
        this.contentContainer.add(bg);

        const collection = this.collectionData[tabKey] || [];

        switch (tabKey) {
            case 'relics':
                this._drawGridCollection(w, contentY, contentH, collection, this._getRelicList());
                break;
            case 'items':
                this._drawGridCollection(w, contentY, contentH, collection, this._getItemList());
                break;
            case 'bosses':
                this._drawBossCollection(w, contentY, contentH, collection);
                break;
            case 'achievements':
                this._drawAchievements(w, contentY, contentH, collection);
                break;
        }
    }

    _drawGridCollection(w, startY, areaH, unlockedIds, allItems) {
        const cols = 5;
        const cellSize = 100;
        const gap = 12;
        const gridStartX = (w - (cols * cellSize + (cols - 1) * gap)) / 2;

        allItems.forEach((item, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const cx = gridStartX + col * (cellSize + gap) + cellSize / 2;
            const cy = startY + 20 + row * (cellSize + gap) + cellSize / 2;

            if (cy > startY + areaH - 20) return; // 超出范围不绘制

            const unlocked = unlockedIds.includes(item.id);
            const g = this.add.graphics();
            this.contentContainer.add(g);

            // 格子背景
            g.fillStyle(unlocked ? CONSTANTS.COLORS.BG_PANEL_LIGHT : 0x15101e, 0.8);
            g.fillRoundedRect(cx - cellSize / 2, cy - cellSize / 2, cellSize, cellSize, 6);
            g.lineStyle(1, unlocked ? CONSTANTS.COLORS.ACCENT : CONSTANTS.COLORS.TEXT_DIM, 0.3);
            g.strokeRoundedRect(cx - cellSize / 2, cy - cellSize / 2, cellSize, cellSize, 6);

            if (unlocked) {
                // 图标
                const icon = createPixelText(this, cx, cy - 12, item.icon, 'subtitle', { fontSize: '20px' });
                this.contentContainer.add(icon);
                // 名称
                const name = createPixelText(this, cx, cy + 22, item.name, 'small', {
                    fontSize: '6px',
                    wordWrap: { width: cellSize - 10 },
                });
                this.contentContainer.add(name);
            } else {
                // 未解锁
                const q = createPixelText(this, cx, cy, '???', 'small', {
                    color: '#444444',
                    fontSize: '10px',
                });
                this.contentContainer.add(q);
            }
        });
    }

    _drawBossCollection(w, startY, areaH, unlockedIds) {
        const bosses = [
            { id: 'food_judge', name: '美食审判者', icon: '🍽️', desc: '第一章Boss - 高级餐厅挑战' },
            { id: 'interviewer', name: '面试官', icon: '💼', desc: '第二章Boss - 英语面试挑战' },
            { id: 'negotiator', name: '谈判大师', icon: '🏢', desc: '第三章Boss - 商务谈判挑战' },
        ];

        bosses.forEach((boss, i) => {
            const cy = startY + 30 + i * 90;
            const unlocked = unlockedIds.includes(boss.id);

            const g = this.add.graphics();
            this.contentContainer.add(g);

            g.fillStyle(unlocked ? CONSTANTS.COLORS.BG_PANEL_LIGHT : 0x15101e, 0.8);
            g.fillRoundedRect(40, cy, w - 80, 76, 8);
            g.lineStyle(2, unlocked ? CONSTANTS.COLORS.DANGER : CONSTANTS.COLORS.TEXT_DIM, 0.4);
            g.strokeRoundedRect(40, cy, w - 80, 76, 8);

            if (unlocked) {
                const icon = createPixelText(this, 90, cy + 38, boss.icon, 'subtitle', { fontSize: '28px' });
                this.contentContainer.add(icon);
                const name = createPixelText(this, 180, cy + 28, boss.name, 'button', { fontSize: '12px' });
                name.setOrigin(0, 0.5);
                this.contentContainer.add(name);
                const desc = createPixelText(this, 180, cy + 50, boss.desc, 'small', {
                    fontSize: '7px', color: '#cccccc',
                });
                desc.setOrigin(0, 0.5);
                this.contentContainer.add(desc);
            } else {
                const q = createPixelText(this, w / 2, cy + 38, '??? 未解锁', 'small', {
                    color: '#444444', fontSize: '12px',
                });
                this.contentContainer.add(q);
            }
        });
    }

    _drawAchievements(w, startY, areaH, unlockedIds) {
        const achievements = [
            { id: 'first_victory', name: '初次通关', icon: '🏆', desc: '完成第一次完整通关' },
            { id: 'perfect_run', name: '完美运行', icon: '⭐', desc: '所有战斗获得S级评分' },
            { id: 'speed_clear', name: '极速通关', icon: '⚡', desc: '30分钟内完成通关' },
            { id: 'collector', name: '收藏家', icon: '🎒', desc: '收集所有类型的遗物' },
            { id: 'no_damage', name: '无伤通关', icon: '🛡️', desc: '通关期间未受到任何伤害' },
            { id: 'linguist', name: '语言大师', icon: '📚', desc: '所有技能加成达到50%' },
        ];

        achievements.forEach((ach, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const cx = w / 2 + (col - 0.5) * 400;
            const cy = startY + 30 + row * 70;
            const unlocked = unlockedIds.includes(ach.id);

            const g = this.add.graphics();
            this.contentContainer.add(g);

            g.fillStyle(unlocked ? CONSTANTS.COLORS.BG_PANEL_LIGHT : 0x15101e, 0.7);
            g.fillRoundedRect(cx - 180, cy, 360, 58, 6);
            if (unlocked) {
                g.lineStyle(2, CONSTANTS.COLORS.GOLD, 0.5);
                g.strokeRoundedRect(cx - 180, cy, 360, 58, 6);
            }

            const icon = createPixelText(this, cx - 145, cy + 29,
                unlocked ? ach.icon : '🔒', 'subtitle', { fontSize: '18px' });
            this.contentContainer.add(icon);

            const name = createPixelText(this, cx - 105, cy + 20,
                unlocked ? ach.name : '???', 'button', {
                    fontSize: '9px',
                    color: unlocked ? '#ffffff' : '#555555',
                });
            name.setOrigin(0, 0.5);
            this.contentContainer.add(name);

            const desc = createPixelText(this, cx - 105, cy + 40,
                unlocked ? ach.desc : '未解锁', 'small', {
                    fontSize: '7px',
                    color: unlocked ? '#cccccc' : '#444444',
                });
            desc.setOrigin(0, 0.5);
            this.contentContainer.add(desc);
        });
    }

    // ========== 数据 ==========

    _getRelicList() {
        return [
            { id: 'golden_tongue', name: '金舌头', icon: '👅' },
            { id: 'grammar_crown', name: '语法之冠', icon: '👑' },
            { id: 'echo_stone', name: '回声石', icon: '💎' },
            { id: 'silver_quill', name: '银色羽毛笔', icon: '🪶' },
            { id: 'time_crystal', name: '时间水晶', icon: '⏳' },
            { id: 'demon_heart', name: '恶魔之心', icon: '💜' },
            { id: 'phoenix_feather', name: '凤凰之羽', icon: '🔥' },
            { id: 'scholar_lens', name: '学者之镜', icon: '🔍' },
            { id: 'lucky_coin', name: '幸运硬币', icon: '🪙' },
            { id: 'void_mask', name: '虚空面具', icon: '🎭' },
        ];
    }

    _getItemList() {
        return [
            { id: 'hp_potion', name: '生命药水', icon: '🧪' },
            { id: 'shield_crystal', name: '护盾结晶', icon: '🛡️' },
            { id: 'hint_scroll', name: '提示卷轴', icon: '📜' },
            { id: 'pronunciation_manual', name: '发音秘籍', icon: '📕' },
            { id: 'grammar_tome', name: '语法宝典', icon: '📗' },
            { id: 'expression_sutra', name: '表达心经', icon: '📘' },
            { id: 'hourglass', name: '时间沙漏', icon: '⏳' },
            { id: 'retry_rune', name: '重试符文', icon: '🔁' },
            { id: 'reapers_eye', name: '死神之眼', icon: '👁️' },
            { id: 'fate_dice', name: '命运骰子', icon: '🎲' },
            { id: 'energy_crystal', name: '能量水晶', icon: '💎' },
            { id: 'demon_contract', name: '恶魔契约', icon: '📃' },
            { id: 'cursed_dictionary', name: '被诅咒的词典', icon: '📖' },
        ];
    }

    // ========== 返回按钮 ==========

    _createBackButton(w, h) {
        const btnW = 180;
        const btnH = 40;
        const cx = w / 2;
        const cy = h - 40;

        const bg = this.add.graphics();
        bg.setDepth(10);
        bg.fillStyle(CONSTANTS.COLORS.PRIMARY, 1);
        bg.fillRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 8);

        const label = createPixelText(this, cx, cy, '← 返回', 'button');
        label.setDepth(11);

        const hit = this.add.rectangle(cx, cy, btnW, btnH, 0xffffff, 0)
            .setInteractive({ useHandCursor: true })
            .setDepth(12);

        hit.on('pointerover', () => {
            bg.clear();
            bg.fillStyle(CONSTANTS.COLORS.WARNING, 1);
            bg.fillRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 8);
        });

        hit.on('pointerout', () => {
            bg.clear();
            bg.fillStyle(CONSTANTS.COLORS.PRIMARY, 1);
            bg.fillRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 8);
        });

        hit.on('pointerdown', () => {
            this.cameras.main.fadeOut(CONSTANTS.ANIM.FADE_DURATION, 0, 0, 0);
            this.time.delayedCall(CONSTANTS.ANIM.FADE_DURATION, () => {
                this.scene.start(CONSTANTS.SCENES.MAIN_MENU);
            });
        });
    }
}
