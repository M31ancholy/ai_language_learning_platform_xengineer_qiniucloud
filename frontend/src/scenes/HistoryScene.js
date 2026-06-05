/**
 * 语塔攀登 - 历史战绩场景
 * 显示历史运行记录列表
 */

import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants.js';
import { EventBus, EVENTS } from '../utils/EventBus.js';
import { GameState } from '../game/GameState.js';
import { createPixelText } from '../utils/PixelText.js';

export class HistoryScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.HISTORY });
    }

    init() {
        // 从localStorage读取历史数据
        try {
            const raw = localStorage.getItem('wordspire_history');
            this.historyData = raw ? JSON.parse(raw) : [];
        } catch (e) {
            this.historyData = [];
        }
    }

    create() {
        const { width, height } = this.scale;
        const C = CONSTANTS.COLORS;

        this.cameras.main.setBackgroundColor(C.BG_DARK);

        // 标题
        createPixelText(this, width / 2, 36, '📜 历史战绩', 'title', { fontSize: '20px' });

        // 装饰线
        const line = this.add.graphics();
        line.lineStyle(1, C.PRIMARY, 0.4);
        line.lineBetween(40, 58, width - 40, 58);

        // 无数据提示
        if (this.historyData.length === 0) {
            createPixelText(this, width / 2, height / 2 - 30, '暂无历史记录', 'subtitle', {
                color: '#888888',
                fontSize: '14px',
            });
            createPixelText(this, width / 2, height / 2 + 10, '开始你的第一次攻塔吧！', 'small', {
                color: '#666666',
            });
        } else {
            // 历史记录列表
            this._drawHistoryList(width, height);
        }

        // 返回按钮
        this._createBackButton(width, height);
    }

    // ========== 历史列表 ==========

    _drawHistoryList(w, h) {
        const startY = 80;
        const rowH = 70;
        const maxDisplay = 7; // 最多显示7条

        // 表头
        const headerG = this.add.graphics();
        headerG.fillStyle(CONSTANTS.COLORS.BG_PANEL, 0.6);
        headerG.fillRect(30, startY - 5, w - 60, 26);

        const headers = [
            { text: '日期', x: 120 },
            { text: '层数', x: 300 },
            { text: '平均分', x: 440 },
            { text: '评级', x: 570 },
            { text: '结果', x: 700 },
        ];

        headers.forEach(h => {
            createPixelText(this, h.x, startY + 8, h.text, 'small', {
                fontSize: '8px',
                color: '#888888',
            });
        });

        // 记录行
        const displayData = this.historyData.slice(-maxDisplay).reverse();
        displayData.forEach((record, i) => {
            const y = startY + 30 + i * rowH;
            this._drawHistoryRow(w, y, rowH - 4, record, i);
        });

        // 总计信息
        if (this.historyData.length > 0) {
            const totalY = h - 100;
            const totalRuns = this.historyData.length;
            const victories = this.historyData.filter(r => r.victory).length;
            const winRate = totalRuns > 0 ? Math.round((victories / totalRuns) * 100) : 0;

            createPixelText(this, w / 2, totalY,
                `总计: ${totalRuns}次运行 | 通关: ${victories}次 | 胜率: ${winRate}%`, 'small', {
                    fontSize: '8px',
                    color: '#888888',
                });
        }
    }

    _drawHistoryRow(w, y, h, record, index) {
        const C = CONSTANTS.COLORS;
        const isVictory = record.victory;

        // 行背景
        const g = this.add.graphics();
        g.fillStyle(index % 2 === 0 ? C.BG_PANEL : 0x1f1035, 0.6);
        g.fillRoundedRect(30, y, w - 60, h, 4);

        // 左侧颜色条
        g.fillStyle(isVictory ? C.GOLD : C.DANGER, 0.8);
        g.fillRect(30, y, 4, h);

        // 日期
        const date = record.date
            ? new Date(record.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
            : '未知';
        createPixelText(this, 120, y + h / 2, date, 'small', {
            fontSize: '8px',
        });

        // 层数
        createPixelText(this, 300, y + h / 2, `第${record.floor || 0}层`, 'small', {
            fontSize: '9px',
            color: '#ffffff',
        });

        // 平均分
        const avgScore = record.avgScore || 0;
        createPixelText(this, 440, y + h / 2, `${avgScore}分`, 'small', {
            fontSize: '9px',
            color: avgScore >= 80 ? '#4caf50' : avgScore >= 50 ? '#ff9800' : '#ff2d2d',
        });

        // 评级
        const grade = record.bestGrade || 'F';
        const gradeInfo = CONSTANTS.GRADES[grade] || CONSTANTS.GRADES.F;
        createPixelText(this, 570, y + h / 2, grade, 'value', {
            fontSize: '14px',
            color: '#' + gradeInfo.color.toString(16).padStart(6, '0'),
        });

        // 结果
        createPixelText(this, 700, y + h / 2, isVictory ? '🏆 通关' : '💀 阵亡', 'small', {
            fontSize: '8px',
            color: isVictory ? '#ffd700' : '#ff2d2d',
        });
    }

    // ========== 返回按钮 ==========

    _createBackButton(w, h) {
        const btnW = 180;
        const btnH = 40;
        const cx = w / 2;
        const cy = h - 45;

        const bg = this.add.graphics();
        bg.fillStyle(CONSTANTS.COLORS.PRIMARY, 1);
        bg.fillRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 8);

        createPixelText(this, cx, cy, '← 返回', 'button');

        const hit = this.add.rectangle(cx, cy, btnW, btnH, 0xffffff, 0)
            .setInteractive({ useHandCursor: true });

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
