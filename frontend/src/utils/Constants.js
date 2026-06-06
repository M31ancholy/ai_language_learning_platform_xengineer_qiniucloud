/**
 * 语塔攀登 - 全局常量
 * 所有游戏配置常量集中管理
 */

export const CONSTANTS = {
    // ========== 游戏基础 ==========
    GAME_WIDTH: 1200,
    GAME_HEIGHT: 800,
    PIXEL_SCALE: 1,

    // ========== 颜色方案（地狱像素风） ==========
    COLORS: {
        BG_DARK: 0x1a0a2e,        // 深紫黑背景
        BG_PANEL: 0x2a1a3e,       // 面板背景
        BG_PANEL_LIGHT: 0x3a2a4e, // 浅面板背景
        PRIMARY: 0xff6b35,         // 地狱橙（主色调）
        ACCENT: 0x51e5ff,          // 冰蓝（强调色）
        DANGER: 0xff2d2d,          // 血红（危险）
        SUCCESS: 0x4caf50,         // 绿色（成功）
        WARNING: 0xff9800,         // 橙色（警告）
        GOLD: 0xffd700,            // 金色
        TEXT_WHITE: 0xffffff,      // 白色文字
        TEXT_GRAY: 0xcccccc,       // 灰色文字
        TEXT_DIM: 0x888888,        // 暗灰色文字
        HP_RED: 0xff2d2d,          // 血量红
        HP_BG: 0x441111,           // 血量条背景
        SHIELD_BLUE: 0x4488ff,     // 护盾蓝
        XP_GREEN: 0x44ff88,       // 经验绿
        PURPLE: 0xaa44ff,          // 紫色（稀有）
        LEGENDARY: 0xff44ff,       // 传说粉
    },

    // ========== 场景名称 ==========
    SCENES: {
        BOOT: 'BootScene',
        PRELOAD: 'PreloadScene',
        MAIN_MENU: 'MainMenuScene',
        SCENE_SELECT: 'SceneSelectScene',
        MAP: 'MapScene',
        BATTLE: 'BattleScene',
        BOSS: 'BossScene',

        SHOP: 'ShopScene',
        REST: 'RestScene',
        EVENT: 'EventScene',
        TREASURE: 'TreasureScene',
        REWARD: 'RewardScene',
        SUMMARY: 'SummaryScene',
        DEATH: 'DeathScene',
        VICTORY: 'VictoryScene',
        HISTORY: 'HistoryScene',
        COLLECTION: 'CollectionScene',
        SETTINGS: 'SettingsScene',
        UI: 'UIScene',
    },

    // ========== 地图配置 ==========
    MAP: {
        COLS: 7,
        ROWS: 8,
        PATH_COUNT: 6,
        MIN_START_NODES: 2,
        MAX_START_NODES: 3,
        NODE_SPACING_X: 110,
        NODE_SPACING_Y: 80,
        NODE_RADIUS: 18,
        OFFSET_X: 180,
        OFFSET_Y: 100,
    },

    // ========== 节点类型 ==========
    NODE_TYPES: {
        MONSTER: 'monster',
        ELITE: 'elite',
        SHOP: 'shop',
        REST: 'rest',
        EVENT: 'event',
        TREASURE: 'treasure',
        BOSS: 'boss',
    },

    // ========== 节点图标（emoji fallback） ==========
    NODE_ICONS: {
        monster: '⚔️',
        elite: '💀',
        shop: '🏪',
        rest: '🏕️',
        event: '❓',
        treasure: '💎',
        boss: '★',
    },

    // ========== 节点出现概率 ==========
    NODE_WEIGHTS: {
        monster: 45,
        elite: 10,
        shop: 10,
        rest: 12,
        event: 15,
        treasure: 8,
    },

    // ========== 玩家初始属性 ==========
    PLAYER: {
        INITIAL_HP: 80,
        MAX_HP: 80,
        INITIAL_SHIELD: 0,
        INITIAL_GOLD: 100,
        INITIAL_ENERGY: 3,
        INVENTORY_SIZE: 6,
    },

    // ========== 难度系数 ==========
    DIFFICULTY: {
        ROOKIE: { name: '菜鸟', coefficient: 0.3, icon: '🐣', color: 0x4caf50 },
        EXPERT: { name: '高手', coefficient: 0.5, icon: '🗡️', color: 0xff9800 },
        HELL: { name: '地狱', coefficient: 0.8, icon: '🔥', color: 0xff2d2d },
    },

    // ========== 关卡类型系数 ==========
    BATTLE_TYPE_COEFFICIENT: {
        monster: 1.0,
        elite: 1.5,
        boss: 0.6,
    },

    // ========== 评分维度权重 ==========
    SCORING: {
        PRONUNCIATION_WEIGHT: 0.4,
        GRAMMAR_WEIGHT: 0.25,
        EXPRESSION_WEIGHT: 0.2,
        FLUENCY_WEIGHT: 0.15,
    },

    // ========== 评级阈值 ==========
    GRADES: {
        S: { min: 95, label: 'S', color: 0xffd700, damage: 0 },
        A: { min: 85, label: 'A', color: 0x51e5ff, damage: 3 },
        B: { min: 70, label: 'B', color: 0x4caf50, damage: 10 },
        C: { min: 50, label: 'C', color: 0xff9800, damage: 20 },
        D: { min: 30, label: 'D', color: 0xff5722, damage: 35 },
        F: { min: 0, label: 'F', color: 0xff2d2d, damage: 50 },
    },

    // ========== 章节配置 ==========
    ACTS: {
        1: {
            name: '第一章：日常生存篇',
            theme: '日常生存',
            boss: '美食审判者',
            bossScene: '餐厅点餐',
            bossRounds: 4,
            bgColor: 0x1a0a2e,
        },
        2: {
            name: '第二章：职场挑战篇',
            theme: '职场挑战',
            boss: '面试官',
            bossScene: '英语面试',
            bossRounds: 6,
            bgColor: 0x0a1a2e,
        },
        3: {
            name: '第三章：商务精英篇',
            theme: '商务精英',
            boss: '谈判大师',
            bossScene: '商务谈判',
            bossRounds: 8,
            bgColor: 0x2e0a1a,
        },
    },

    // ========== 休息站恢复比例 ==========
    REST_HEAL_PERCENT: 0.3,

    // ========== 动画速度 ==========
    ANIM: {
        FADE_DURATION: 300,
        SLIDE_DURATION: 500,
        PULSE_DURATION: 1000,
        SHAKE_DURATION: 200,
        TYPING_SPEED: 30,
    },
};
