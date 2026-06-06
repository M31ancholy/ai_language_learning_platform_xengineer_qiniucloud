/**
 * 语塔攀登 - 随机事件场景
 * 显示随机事件描述、选项、结果
 */

import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants.js';
import { EventBus, EVENTS } from '../utils/EventBus.js';
import { GameState } from '../game/GameState.js';
import { createPixelText } from '../utils/PixelText.js';
import { EventSystem } from '../systems/EventSystem.js';

export class EventScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.EVENT });
        this.eventSystem = new EventSystem();
    }

    /**
     * @param {object} data - 事件初始化数据
     * data.node - 节点数据
     * data.act - 章节号
     */
    init(data) {
        this.nodeData = data.node;
        this.act = data.act || GameState.currentAct || 1;
        this.hasChosen = false;
        this.choiceOutcome = null;

        // 使用 EventSystem 统一获取并接管事件
        this.eventData = this.eventSystem.getRandomEvent();
    }

    create() {
        const { width, height } = this.scale;
        const C = CONSTANTS.COLORS;

        this.cameras.main.setBackgroundColor(C.BG_DARK);

        // 装饰边框
        const border = this.add.graphics();
        border.lineStyle(2, C.PRIMARY, 0.5);
        border.strokeRect(15, 15, width - 30, height - 30);

        // 事件图标
        createPixelText(this, width / 2, 50, this.eventData.icon || '❓', 'grade', { fontSize: '36px' });

        // 事件名称
        createPixelText(this, width / 2, 95, `❓ ${this.eventData.name}`, 'title', { fontSize: '18px' });

        // 事件描述（带面板背景）
        const descPanelG = this.add.graphics();
        descPanelG.fillStyle(C.BG_PANEL, 0.8);
        descPanelG.fillRoundedRect(40, 120, width - 80, 140, 8);
        descPanelG.lineStyle(1, C.ACCENT, 0.3);
        descPanelG.strokeRoundedRect(40, 120, width - 80, 140, 8);

        createPixelText(this, width / 2, 190, this.eventData.description, 'body', {
            fontSize: '9px',
            wordWrap: { width: width - 120 },
            lineSpacing: 8,
        });

        // 选项按钮容器
        this.choicesContainer = this.add.container(0, 0);
        this._createChoices(width, height);
    }

    // ========== 选项创建 ==========

    _createChoices(sceneW, sceneH) {
        const choices = this.eventData.choices;
        const btnW = Math.min(sceneW - 80, 600);
        const btnH = 54;
        const gap = 12;
        const startY = 290;

        choices.forEach((choice, i) => {
            const cx = sceneW / 2;
            const cy = startY + i * (btnH + gap);

            // 检查选项是否可用（由 EventSystem 处理的 choice.available）
            const isAvailable = choice.available;

            const g = this.add.graphics();
            const bgColor = isAvailable ? CONSTANTS.COLORS.BG_PANEL : 0x1a1020;
            const borderColor = isAvailable ? CONSTANTS.COLORS.PRIMARY : CONSTANTS.COLORS.TEXT_DIM;

            g.fillStyle(bgColor, 0.9);
            g.fillRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 6);
            g.lineStyle(2, borderColor, isAvailable ? 0.8 : 0.3);
            g.strokeRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 6);

            // 选项文字格式为 [序号] 内容，水平垂直居中
            const textColor = isAvailable ? '#ffffff' : '#666666';
            const optionText = `[ ${i + 1} ] ${choice.text}`;
            const label = createPixelText(this, cx, cy, optionText, 'button', {
                color: textColor,
                fontSize: '8px',
            }).setOrigin(0.5);

            // 交互
            if (isAvailable) {
                const hit = this.add.rectangle(cx, cy, btnW, btnH, 0xffffff, 0)
                    .setInteractive({ useHandCursor: true });

                hit.on('pointerover', () => {
                    g.clear();
                    g.fillStyle(CONSTANTS.COLORS.BG_PANEL_LIGHT, 0.95);
                    g.fillRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 6);
                    g.lineStyle(3, CONSTANTS.COLORS.PRIMARY, 1);
                    g.strokeRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 6);
                    label.setScale(1.02);
                });

                hit.on('pointerout', () => {
                    g.clear();
                    g.fillStyle(CONSTANTS.COLORS.BG_PANEL, 0.9);
                    g.fillRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 6);
                    g.lineStyle(2, CONSTANTS.COLORS.PRIMARY, 0.8);
                    g.strokeRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 6);
                    label.setScale(1);
                });

                hit.on('pointerdown', () => {
                    if (!this.hasChosen) {
                        this.hasChosen = true;
                        this._selectChoice(choice);
                    }
                });

                this.choicesContainer.add(hit);
            }

            this.choicesContainer.add(g);
            this.choicesContainer.add(label);
        });
    }

    // ========== 选择处理 ==========

    _selectChoice(choice) {
        // 隐藏选项
        this.choicesContainer.setVisible(false);

        const { width, height } = this.scale;

        // 调用 EventSystem 执行选项抉择并应用效果
        const result = this.eventSystem.processChoice(this.eventData.id, choice.index);

        if (!result.success) {
            console.error('[EventScene] Choice failed:', result.message);
            this.scene.start(CONSTANTS.SCENES.MAP);
            return;
        }

        this.choiceOutcome = result.outcome;

        // 结果面板
        const resultY = 280;
        const panelG = this.add.graphics();
        panelG.fillStyle(CONSTANTS.COLORS.BG_PANEL, 0.9);
        panelG.fillRoundedRect(40, resultY, width - 80, 200, 8);
        panelG.lineStyle(2, CONSTANTS.COLORS.ACCENT, 0.5);
        panelG.strokeRoundedRect(40, resultY, width - 80, 200, 8);

        // 结果描述
        const resultDesc = result.message || '事件结束。';
        createPixelText(this, width / 2, resultY + 40, resultDesc, 'body', {
            fontSize: '9px',
            wordWrap: { width: width - 120 },
            lineSpacing: 8,
        });

        // 奖励/惩罚列表描述
        const rewardTexts = [];
        const outcome = result.outcome;
        if (outcome) {
            if (outcome.gold) {
                rewardTexts.push(outcome.gold > 0 ? `💰 +${outcome.gold} 金币` : `💰 -${Math.abs(outcome.gold)} 金币`);
            }
            if (outcome.hp) {
                rewardTexts.push(outcome.hp > 0 ? `❤️ +${outcome.hp} HP` : `💔 -${Math.abs(outcome.hp)} HP`);
            }
            if (outcome.shield) {
                rewardTexts.push(`🛡️ +${outcome.shield} 护盾`);
            }
            if (outcome.energy) {
                rewardTexts.push(outcome.energy > 0 ? `⚡ +${outcome.energy} 能量` : `⚡ -${Math.abs(outcome.energy)} 能量`);
            }
            if (outcome.energyFull) {
                rewardTexts.push(`⚡ 能量完全恢复`);
            }
            if (outcome.skillBonus) {
                const { skill, value } = outcome.skillBonus;
                const skillName = { pronunciation: '发音', grammar: '语法', expression: '表达', fluency: '流畅度', all: '全属性' }[skill] || skill;
                rewardTexts.push(`📚 ${skillName} +${value}%`);
            }
            if (outcome.item) {
                rewardTexts.push(`📦 获得道具: ${outcome.item}`);
            }
            if (outcome.buff) {
                rewardTexts.push(`✨ 获得增益: ${outcome.buff.name}`);
            }
            if (outcome.debuff) {
                rewardTexts.push(`💀 获得减益: ${outcome.debuff.name}`);
            }
            if (outcome.battle) {
                rewardTexts.push(`⚔️ 突然遭遇战斗！`);
            }
        }

        if (rewardTexts.length > 0) {
            createPixelText(this, width / 2, resultY + 110, rewardTexts.join('\n'), 'button', {
                lineSpacing: 12,
                color: (outcome.hp && outcome.hp < 0) || (outcome.gold && outcome.gold < 0) || outcome.battle ? '#ff2d2d' : '#4caf50',
            });
        } else {
            createPixelText(this, width / 2, resultY + 110, '（无额外效果）', 'small');
        }

        // 继续按钮
        this.time.delayedCall(500, () => {
            this._createContinueButton(width, height);
        });
    }

    // ========== 继续按钮 ==========

    _createContinueButton(w, h) {
        const btnW = 200;
        const btnH = 48;
        const cx = w / 2;
        const cy = h - 50;

        const bg = this.add.graphics();
        bg.fillStyle(CONSTANTS.COLORS.PRIMARY, 1);
        bg.fillRoundedRect(cx - btnW / 2, cy - btnH / 2, btnW, btnH, 8);

        createPixelText(this, cx, cy, '继续旅程 →', 'button');

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
            if (GameState.currentNodeId) {
                GameState.completeNode(GameState.currentNodeId);
            }
            this.cameras.main.fadeOut(CONSTANTS.ANIM.FADE_DURATION, 0, 0, 0);
            this.time.delayedCall(CONSTANTS.ANIM.FADE_DURATION, () => {
                // 如果遭遇战斗，则直接切入战斗场景
                if (this.choiceOutcome && this.choiceOutcome.battle) {
                    const battleNode = { 
                        ...this.nodeData, 
                        difficulty: this.choiceOutcome.difficulty || 'expert' 
                    };
                    this.scene.start(CONSTANTS.SCENES.BATTLE, {
                        node: battleNode,
                        act: this.act,
                        isElite: this.choiceOutcome.isElite || false
                    });
                } else {
                    this.scene.start(CONSTANTS.SCENES.MAP);
                }
            });
        });
    }
}
