/**
 * 语塔攀登 - 游戏全局配置
 * Phaser 3 引擎配置
 */

import Phaser from 'phaser';
import { CONSTANTS } from '../utils/Constants.js';
import { BootScene } from '../scenes/BootScene.js';
import { PreloadScene } from '../scenes/PreloadScene.js';
import { MainMenuScene } from '../scenes/MainMenuScene.js';
import { MapScene } from '../scenes/MapScene.js';
import { BattleScene } from '../scenes/BattleScene.js';
import { BossScene } from '../scenes/BossScene.js';
import { ShopScene } from '../scenes/ShopScene.js';
import { RestScene } from '../scenes/RestScene.js';
import { EventScene } from '../scenes/EventScene.js';
import { TreasureScene } from '../scenes/TreasureScene.js';
import { RewardScene } from '../scenes/RewardScene.js';
import { SummaryScene } from '../scenes/SummaryScene.js';
import { DeathScene } from '../scenes/DeathScene.js';
import { VictoryScene } from '../scenes/VictoryScene.js';
import { HistoryScene } from '../scenes/HistoryScene.js';
import { CollectionScene } from '../scenes/CollectionScene.js';
import { SettingsScene } from '../scenes/SettingsScene.js';
import { UIScene } from '../scenes/UIScene.js';
import { SceneSelectScene } from '../scenes/SceneSelectScene.js';

export const GameConfig = {
    type: Phaser.AUTO,
    parent: 'game-container',
    width: CONSTANTS.GAME_WIDTH,
    height: CONSTANTS.GAME_HEIGHT,
    resolution: window.devicePixelRatio || 1,
    pixelArt: true,
    antialias: false,
    autoRound: true,
    roundPixels: true,
    backgroundColor: '#1a0a2e',

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },

    dom: {
        createContainer: true,
    },

    scene: [
        BootScene,
        PreloadScene,
        MainMenuScene,
        SceneSelectScene,
        MapScene,
        BattleScene,
        BossScene,
        ShopScene,
        RestScene,
        EventScene,
        TreasureScene,
        RewardScene,
        SummaryScene,
        DeathScene,
        VictoryScene,
        HistoryScene,
        CollectionScene,
        SettingsScene,
        UIScene,
    ],
};

