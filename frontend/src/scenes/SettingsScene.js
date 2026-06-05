/**
 * 语塔攀登 - 游戏设置场景
 * 包含音量调节、麦克风测试、识别语言选择以及游戏分辨率调节
 */

import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants.js';
import { createPixelText } from '../utils/PixelText.js';

export class SettingsScene extends Phaser.Scene {
    constructor() {
        super({ key: CONSTANTS.SCENES.SETTINGS });
        this.bgmVolume = 0.5;
        this.sfxVolume = 0.7;
        this.lang = 'en-US';
        this.resolution = 'normal'; // 'low' | 'normal' | 'high'
        this.isTestingMic = false;
        this.waveformBars = [];
    }

    init() {
        // 从 localStorage 加载持久化设置
        try {
            const raw = localStorage.getItem('yuta_settings');
            if (raw) {
                const settings = JSON.parse(raw);
                this.bgmVolume = settings.bgmVolume !== undefined ? settings.bgmVolume : 0.5;
                this.sfxVolume = settings.sfxVolume !== undefined ? settings.sfxVolume : 0.7;
                this.lang = settings.lang || 'en-US';
                this.resolution = settings.resolutionKey || 'normal';
            }
        } catch (e) {
            console.warn('Failed to load settings:', e);
        }
        
        this.waveformBars = [];
        this.isTestingMic = false;
    }

    create() {
        const { width, height } = this.scale;
        const C = CONSTANTS.COLORS;

        // 背景
        this.add.rectangle(width / 2, height / 2, width, height, C.BG_DARK);
        this._drawStarfield();

        // 标题
        createPixelText(this, width / 2, height * 0.06, '⚙️ 游戏设置', 'title');

        // ============ 音量设置 ============
        createPixelText(this, width / 2, height * 0.16, '🔊 声音选项', 'subtitle', { fontSize: '12px' });
        
        // BGM 音量
        this._createSlider(width / 2, height * 0.22, '背景音乐 (BGM)', this.bgmVolume, (val) => {
            this.bgmVolume = val;
            this._saveSettings();
        });

        // SFX 音量
        this._createSlider(width / 2, height * 0.28, '游戏音效 (SFX)', this.sfxVolume, (val) => {
            this.sfxVolume = val;
            this._saveSettings();
        });

        // ============ 麦克风测试 ============
        createPixelText(this, width / 2, height * 0.38, '🎙️ 麦克风检测', 'subtitle', { fontSize: '12px' });

        const testBtn = this.add.rectangle(width / 2, height * 0.44, 180, 32, C.BG_PANEL);
        testBtn.setStrokeStyle(2, C.PRIMARY);
        testBtn.setInteractive({ useHandCursor: true });
        
        const testLabel = createPixelText(this, width / 2, height * 0.44, '🎤 测试麦克风', 'button', { fontSize: '10px' });

        testBtn.on('pointerover', () => testBtn.setFillStyle(C.PRIMARY));
        testBtn.on('pointerout', () => testBtn.setFillStyle(C.BG_PANEL));
        testBtn.on('pointerup', () => this._toggleMicTest(testBtn, testLabel));

        // 麦克风波形指示器
        this._createWaveform(width / 2, height * 0.50);

        // ============ 语言设置 ============
        createPixelText(this, width / 2, height * 0.59, '🌐 语音识别口音', 'subtitle', { fontSize: '12px' });
        this._createLangSelector(width / 2, height * 0.65);

        // ============ 分辨率设置 ============
        createPixelText(this, width / 2, height * 0.74, '🖥️ 游戏显示分辨率', 'subtitle', { fontSize: '12px' });
        this._createResolutionSelector(width / 2, height * 0.80);

        // ============ 全屏控制 ============
        const fullscreenBtn = this.add.rectangle(width / 2, height * 0.85, 200, 28, C.BG_PANEL);
        fullscreenBtn.setStrokeStyle(2, C.PRIMARY);
        fullscreenBtn.setInteractive({ useHandCursor: true });
        const fullscreenLabel = createPixelText(this, width / 2, height * 0.85, '🖥️ 切换网页全屏', 'button', { fontSize: '8px' });

        fullscreenBtn.on('pointerover', () => {
            fullscreenBtn.setFillStyle(C.PRIMARY);
            fullscreenBtn.setScale(1.05);
            fullscreenLabel.setScale(1.05);
        });
        fullscreenBtn.on('pointerout', () => {
            fullscreenBtn.setFillStyle(C.BG_PANEL);
            fullscreenBtn.setScale(1);
            fullscreenLabel.setScale(1);
        });
        fullscreenBtn.on('pointerup', () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });

        // ============ 底部操作按钮 ============
        // 返回按钮
        const backBtn = this.add.rectangle(width / 2 - 110, height * 0.92, 160, 32, C.DANGER);
        backBtn.setStrokeStyle(2, 0xffffff);
        backBtn.setInteractive({ useHandCursor: true });
        createPixelText(this, width / 2 - 110, height * 0.92, '🚪 返回主菜单', 'button', { fontSize: '8px' });

        backBtn.on('pointerover', () => backBtn.setScale(1.05));
        backBtn.on('pointerout', () => backBtn.setScale(1));
        backBtn.on('pointerup', () => {
            this._stopMicStream();
            this.scene.start(CONSTANTS.SCENES.MAIN_MENU);
        });

        // 重置按钮
        const resetBtn = this.add.rectangle(width / 2 + 110, height * 0.92, 180, 32, 0x444444);
        resetBtn.setStrokeStyle(2, C.DANGER);
        resetBtn.setInteractive({ useHandCursor: true });
        createPixelText(this, width / 2 + 110, height * 0.92, '🗑️ 重置当前进度', 'button', { fontSize: '8px', color: '#ff2d2d' });

        resetBtn.on('pointerover', () => {
            resetBtn.setFillStyle(C.DANGER);
            resetBtn.setScale(1.05);
        });
        resetBtn.on('pointerout', () => {
            resetBtn.setFillStyle(0x444444);
            resetBtn.setScale(1);
        });
        resetBtn.on('pointerup', () => {
            if (confirm('确认要清除当前所有攀登进度和背包存档吗？此操作不可逆。')) {
                localStorage.removeItem('wordspire_save');
                
                // 飘字提示
                const floatText = this.add.text(width / 2, height / 2, '🗑️ 进度已全部清除重置！', {
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: '12px',
                    color: '#ff2d2d',
                    stroke: '#000',
                    strokeThickness: 2
                }).setOrigin(0.5).setDepth(100);

                this.tweens.add({
                    targets: floatText,
                    y: height / 2 - 50,
                    alpha: 0,
                    duration: 1500,
                    onComplete: () => {
                        floatText.destroy();
                        this._stopMicStream();
                        this.scene.start(CONSTANTS.SCENES.MAIN_MENU);
                    }
                });
            }
        });
    }

    _createSlider(cx, cy, label, initialVal, onChange) {
        const C = CONSTANTS.COLORS;
        
        // 标签
        createPixelText(this, cx - 180, cy, label, 'body', { align: 'left' }).setOrigin(0, 0.5);

        // 滑块条
        const trackW = 200;
        const trackX = cx + 80;
        const track = this.add.rectangle(trackX, cy, trackW, 8, C.BG_PANEL_LIGHT).setOrigin(0.5);
        track.setStrokeStyle(1, 0x666666);

        // 填充条
        const fill = this.add.rectangle(trackX - trackW / 2, cy, trackW * initialVal, 8, C.PRIMARY).setOrigin(0, 0.5);

        // 滑块柄
        const handle = this.add.rectangle(trackX - trackW / 2 + trackW * initialVal, cy, 12, 18, C.GOLD).setOrigin(0.5);
        handle.setStrokeStyle(1, 0xffffff);
        handle.setInteractive({ useHandCursor: true });

        // 拖拽行为
        this.input.setDraggable(handle);
        handle.on('drag', (pointer, dragX) => {
            const minX = trackX - trackW / 2;
            const maxX = trackX + trackW / 2;
            const clampedX = Phaser.Math.Clamp(dragX, minX, maxX);
            
            handle.x = clampedX;
            const pct = (clampedX - minX) / trackW;
            fill.width = clampedX - minX;

            onChange(pct);
        });
    }

    _createWaveform(cx, cy) {
        const barCount = 20;
        const barW = 4;
        const gap = 2;
        const totalW = barCount * (barW + gap);

        for (let i = 0; i < barCount; i++) {
            const bar = this.add.rectangle(
                cx - totalW / 2 + i * (barW + gap) + barW / 2,
                cy,
                barW,
                4,
                CONSTANTS.COLORS.ACCENT
            ).setOrigin(0.5, 0.5).setAlpha(0.3);
            this.waveformBars.push(bar);
        }
    }

    _toggleMicTest(btn, label) {
        const C = CONSTANTS.COLORS;
        if (this.isTestingMic) {
            // 停止测试
            this.isTestingMic = false;
            label.setText('🎤 测试麦克风');
            btn.setStrokeStyle(2, C.PRIMARY);
            
            if (this.waveformTimer) this.waveformTimer.remove();
            this.waveformBars.forEach(b => {
                b.setSize(b.width, 4);
                b.setAlpha(0.3);
            });

            this._stopMicStream();
        } else {
            // 开始测试
            this.isTestingMic = true;
            label.setText('⏹️ 停止测试');
            btn.setStrokeStyle(2, C.DANGER);

            // 模拟波形动画或获取真实音频
            this._startMicStream();
        }
    }

    async _startMicStream() {
        // 开启模拟波动
        this.waveformTimer = this.time.addEvent({
            delay: 80,
            loop: true,
            callback: () => {
                this.waveformBars.forEach(b => {
                    const h = Phaser.Math.Between(4, 25);
                    b.setSize(b.width, h);
                    b.setAlpha(0.8);
                });
            }
        });

        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                console.log('Mic stream started for test');
            }
        } catch (e) {
            console.log('Unable to start real mic stream in settings:', e.message);
        }
    }

    _stopMicStream() {
        if (this.stream) {
            this.stream.getTracks().forEach(t => t.stop());
            this.stream = null;
        }
    }

    _createLangSelector(cx, cy) {
        const C = CONSTANTS.COLORS;
        const options = [
            { key: 'en-US', label: '🇺🇸 美式英语 (US)' },
            { key: 'en-GB', label: '🇬🇧 英式英语 (UK)' }
        ];

        this.langButtons = [];

        options.forEach((opt, idx) => {
            const bx = cx + (idx - 0.5) * 220;
            const btn = this.add.rectangle(bx, cy, 180, 32, opt.key === this.lang ? C.BG_PANEL_LIGHT : C.BG_PANEL);
            btn.setStrokeStyle(2, opt.key === this.lang ? C.GOLD : 0x666666);
            btn.setInteractive({ useHandCursor: true });

            const txt = createPixelText(this, bx, cy, opt.label, 'button', {
                color: opt.key === this.lang ? '#ffd700' : '#ffffff',
                fontSize: '8px'
            });

            btn.on('pointerup', () => {
                this.lang = opt.key;
                this._updateLangSelectorUI();
                this._saveSettings();
            });

            this.langButtons.push({ key: opt.key, bg: btn, label: txt });
        });
    }

    _updateLangSelectorUI() {
        const C = CONSTANTS.COLORS;
        this.langButtons.forEach(btnInfo => {
            const isSel = btnInfo.key === this.lang;
            btnInfo.bg.setFillStyle(isSel ? C.BG_PANEL_LIGHT : C.BG_PANEL);
            btnInfo.bg.setStrokeStyle(2, isSel ? C.GOLD : 0x666666);
            btnInfo.label.setColor(isSel ? '#ffd700' : '#ffffff');
        });
    }

    _createResolutionSelector(cx, cy) {
        const C = CONSTANTS.COLORS;
        const options = [
            { key: 'low', label: '低 (960x640)', w: 960, h: 640 },
            { key: 'normal', label: '中 (1200x800)', w: 1200, h: 800 },
            { key: 'high', label: '高 (1440x960)', w: 1440, h: 960 }
        ];

        this.resButtons = [];

        options.forEach((opt, idx) => {
            const bx = cx + (idx - 1) * 220;
            const btn = this.add.rectangle(bx, cy, 180, 32, opt.key === this.resolution ? C.BG_PANEL_LIGHT : C.BG_PANEL);
            btn.setStrokeStyle(2, opt.key === this.resolution ? C.GOLD : 0x666666);
            btn.setInteractive({ useHandCursor: true });

            const txt = createPixelText(this, bx, cy, opt.label, 'button', {
                color: opt.key === this.resolution ? '#ffd700' : '#ffffff',
                fontSize: '8px'
            });

            btn.on('pointerup', () => {
                if (this.resolution !== opt.key) {
                    this.resolution = opt.key;
                    this._saveSettings();
                    // 调整游戏大小
                    this.scale.resize(opt.w, opt.h);
                    // 重启场景以应用百分比新布局
                    this.scene.restart();
                }
            });

            this.resButtons.push({ key: opt.key, bg: btn, label: txt });
        });
    }

    _saveSettings() {
        try {
            const resCoords = this._getResolutionCoords(this.resolution);
            const settings = {
                bgmVolume: this.bgmVolume,
                sfxVolume: this.sfxVolume,
                lang: this.lang,
                resolutionKey: this.resolution,
                resolution: resCoords
            };
            localStorage.setItem('yuta_settings', JSON.stringify(settings));
        } catch (e) {
            console.warn('Failed to save settings:', e);
        }
    }

    _getResolutionCoords(key) {
        const map = {
            low: { w: 960, h: 640 },
            normal: { w: 1200, h: 800 },
            high: { w: 1440, h: 960 }
        };
        return map[key] || { w: 1200, h: 800 };
    }

    _drawStarfield() {
        const g = this.add.graphics();
        for (let i = 0; i < 30; i++) {
            const x = Phaser.Math.Between(0, 960);
            const y = Phaser.Math.Between(0, 640);
            g.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.05, 0.2));
            g.fillRect(x, y, 1, 1);
        }
    }
}
