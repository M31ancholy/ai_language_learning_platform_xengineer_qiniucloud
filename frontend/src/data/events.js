/**
 * 随机事件数据 - 语塔攀登
 * 在事件节点触发的交互剧情
 */

export const EVENTS_DATA = [
    {
        id: 'mysterious_book',
        name: '神秘之书',
        icon: '📖',
        description: '你在角落发现了一本散发着微光的古书，书页上写满了英语单词...',
        choices: [
            {
                text: '仔细阅读（消耗 10 HP，获得发音 +5%）',
                condition: { type: 'hp_min', value: 15 },
                outcome: {
                    hp: -10,
                    skillBonus: { skill: 'pronunciation', value: 5 },
                    message: '你忍受着头痛读完了整本书，感觉发音能力大增！',
                },
            },
            {
                text: '快速翻阅（获得表达 +3%）',
                condition: null,
                outcome: {
                    skillBonus: { skill: 'expression', value: 3 },
                    message: '你匆匆浏览了几页，学到了一些有用的表达方式。',
                },
            },
            {
                text: '带走这本书（获得提示水晶×1）',
                condition: null,
                outcome: {
                    item: 'hint_crystal',
                    message: '你小心翼翼地将书放入背包，它会在需要时给你提示。',
                },
            },
        ],
    },
    {
        id: 'lost_traveler',
        name: '迷路的旅者',
        icon: '🧳',
        description: '一个疲惫的旅者向你求助，他似乎迷失了方向...',
        choices: [
            {
                text: '用英语指路（消耗 1 能量，获得 40 金币）',
                condition: { type: 'energy_min', value: 1 },
                outcome: {
                    energy: -1,
                    gold: 40,
                    message: '旅者感激不尽，留下了一袋金币作为酬谢。',
                },
            },
            {
                text: '分享食物（消耗 15 HP，获得护盾 20）',
                condition: { type: 'hp_min', value: 20 },
                outcome: {
                    hp: -15,
                    shield: 20,
                    message: '旅者赠予你一个护身符，它散发着保护的光芒。',
                },
            },
            {
                text: '假装没看见',
                condition: null,
                outcome: {
                    message: '你快步走过。身后传来一声叹息...',
                },
            },
        ],
    },
    {
        id: 'word_fountain',
        name: '词汇之泉',
        icon: '⛲',
        description: '一座散发着蓝光的喷泉矗立在前方，泉水中浮现出各种英语单词...',
        choices: [
            {
                text: '饮用泉水（恢复 25 HP）',
                condition: null,
                outcome: {
                    hp: 25,
                    message: '清甜的泉水流遍全身，你感觉精力充沛。',
                },
            },
            {
                text: '在泉水中冥想（获得流畅度 +5%）',
                condition: null,
                outcome: {
                    skillBonus: { skill: 'fluency', value: 5 },
                    message: '在泉水的帮助下，你感觉说英语变得更加流畅了。',
                },
            },
            {
                text: '投入金币许愿（消耗 20 金币，获得随机道具）',
                condition: { type: 'gold_min', value: 20 },
                outcome: {
                    gold: -20,
                    randomItem: true,
                    message: '泉水翻涌，一个物品从水中浮出！',
                },
            },
        ],
    },
    {
        id: 'grammar_puzzle',
        name: '语法石碑',
        icon: '🗿',
        description: '一块刻满语法规则的石碑挡住了去路。石碑上刻着一道选择题...',
        choices: [
            {
                text: '尝试解答（正确: 语法+8%，错误: -10 HP）',
                condition: null,
                outcome: {
                    gamble: true,
                    successRate: 0.6,
                    success: {
                        skillBonus: { skill: 'grammar', value: 8 },
                        message: '答案正确！石碑化作光芒融入你的身体。',
                    },
                    failure: {
                        hp: -10,
                        message: '答案错误！石碑释放出一道冲击波。',
                    },
                },
            },
            {
                text: '绕道而行',
                condition: null,
                outcome: {
                    message: '你选择了更安全的路线，虽然没有收获。',
                },
            },
        ],
    },
    {
        id: 'shadow_merchant',
        name: '暗影商人',
        icon: '🌑',
        description: '一个神秘的身影从阴影中走出，向你展示了他的"特殊商品"...',
        choices: [
            {
                text: '购买神秘药水（30金币，随机效果）',
                condition: { type: 'gold_min', value: 30 },
                outcome: {
                    gold: -30,
                    gamble: true,
                    successRate: 0.5,
                    success: {
                        hp: 30,
                        shield: 10,
                        message: '药水散发着美妙的香气，你感觉身心舒畅！',
                    },
                    failure: {
                        hp: -15,
                        debuff: { id: 'nausea', name: '恶心', duration: 2, effect: { dimension: 'fluency', value: -10 } },
                        message: '药水味道可怕，你感觉胃在翻涌...',
                    },
                },
            },
            {
                text: '用 HP 换金币（消耗 20 HP，获得 50 金币）',
                condition: { type: 'hp_min', value: 25 },
                outcome: {
                    hp: -20,
                    gold: 50,
                    message: '商人抽取了你的部分生命力，作为交换递给你一袋金币。',
                },
            },
            {
                text: '拒绝交易',
                condition: null,
                outcome: {
                    message: '暗影商人耸了耸肩，消失在黑暗中。',
                },
            },
        ],
    },
    {
        id: 'training_dummy',
        name: '训练假人',
        icon: '🎯',
        description: '一个会说英语的训练假人站在路边，它似乎想和你练习对话...',
        choices: [
            {
                text: '进行发音训练（消耗 1 能量，发音 +8%）',
                condition: { type: 'energy_min', value: 1 },
                outcome: {
                    energy: -1,
                    skillBonus: { skill: 'pronunciation', value: 8 },
                    message: '经过反复练习，你的发音更加标准了！',
                },
            },
            {
                text: '进行表达训练（消耗 1 能量，表达 +8%）',
                condition: { type: 'energy_min', value: 1 },
                outcome: {
                    energy: -1,
                    skillBonus: { skill: 'expression', value: 8 },
                    message: '训练假人教会了你一些高级表达方式。',
                },
            },
            {
                text: '拆解假人（获得 25 金币）',
                condition: null,
                outcome: {
                    gold: 25,
                    message: '你把假人拆成了零件卖掉... 有点心虚。',
                },
            },
        ],
    },
    {
        id: 'cursed_chest',
        name: '诅咒宝箱',
        icon: '🪤',
        description: '一个发出紫色光芒的宝箱，上面刻满了诡异的符文...',
        choices: [
            {
                text: '打开宝箱（50%概率获得传说道具 / 50%受到诅咒）',
                condition: null,
                outcome: {
                    gamble: true,
                    successRate: 0.5,
                    success: {
                        randomItem: true,
                        rarityOverride: 'legendary',
                        message: '宝箱中的光芒消散，露出了一件传说道具！',
                    },
                    failure: {
                        hp: -20,
                        debuff: { id: 'curse', name: '诅咒', duration: 3, effect: { dimension: 'pronunciation', value: -10 } },
                        message: '宝箱爆发出黑色雾气，你被诅咒了！',
                    },
                },
            },
            {
                text: '小心检查后打开（消耗 15 金币，降低失败风险）',
                condition: { type: 'gold_min', value: 15 },
                outcome: {
                    gold: -15,
                    gamble: true,
                    successRate: 0.75,
                    success: {
                        randomItem: true,
                        message: '你谨慎地解除了陷阱，安全取出了宝物。',
                    },
                    failure: {
                        hp: -10,
                        message: '尽管小心翼翼，你还是触发了一个小陷阱。',
                    },
                },
            },
            {
                text: '离开',
                condition: null,
                outcome: {
                    message: '你明智地选择了离开。有些宝箱，不值得冒险。',
                },
            },
        ],
    },
    {
        id: 'echo_cave',
        name: '回音洞穴',
        icon: '🕳️',
        description: '一个奇特的洞穴，你说的每句英语都会被回声放大并修正...',
        choices: [
            {
                text: '进入洞穴练习（恢复全部能量）',
                condition: null,
                outcome: {
                    energyFull: true,
                    message: '在回音的帮助下，你的精力完全恢复了！',
                },
            },
            {
                text: '在洞口冥想（全属性 +2%）',
                condition: null,
                outcome: {
                    skillBonus: { skill: 'all', value: 2 },
                    message: '洞穴的回声让你对英语有了更深的领悟。',
                },
            },
        ],
    },
    {
        id: 'wandering_teacher',
        name: '流浪教师',
        icon: '👨‍🏫',
        description: '一位穿着破旧西装的老师坐在路边，他愿意教你一些技巧...',
        choices: [
            {
                text: '学习语法技巧（消耗 30 金币，语法 +10%）',
                condition: { type: 'gold_min', value: 30 },
                outcome: {
                    gold: -30,
                    skillBonus: { skill: 'grammar', value: 10 },
                    message: '老师的讲解深入浅出，你的语法水平大幅提升！',
                },
            },
            {
                text: '请教发音秘诀（消耗 30 金币，发音 +10%）',
                condition: { type: 'gold_min', value: 30 },
                outcome: {
                    gold: -30,
                    skillBonus: { skill: 'pronunciation', value: 10 },
                    message: '老师纠正了你的发音习惯，效果立竿见影！',
                },
            },
            {
                text: '给予施舍（消耗 10 金币，获得随机 buff）',
                condition: { type: 'gold_min', value: 10 },
                outcome: {
                    gold: -10,
                    randomBuff: true,
                    message: '老师感激地送给你一个祝福。',
                },
            },
        ],
    },
    {
        id: 'mirror_room',
        name: '镜像之间',
        icon: '🪞',
        description: '你走进了一个全是镜子的房间，镜中的你正在用流利的英语演讲...',
        choices: [
            {
                text: '与镜像对话（获得 buff：镜像自信 3关）',
                condition: null,
                outcome: {
                    buff: { id: 'mirror_confidence', name: '镜像自信', duration: 3, effect: { dimension: 'expression', value: 15 } },
                    message: '镜像中的自信感染了你，你感觉表达能力大增！',
                },
            },
            {
                text: '打碎镜子（获得 60 金币，但受到 10 伤害）',
                condition: null,
                outcome: {
                    gold: 60,
                    hp: -10,
                    message: '碎镜中掉落了一些金币，但锋利的碎片划伤了你。',
                },
            },
        ],
    },
    {
        id: 'sudden_ambush',
        name: '突然伏击',
        icon: '👹',
        description: '你在通道中行进时，突然有怪物从上方落下！它封锁了退路，嘴里发出难懂的咆哮！',
        choices: [
            {
                text: '硬着头皮战斗！（触发口语战斗）',
                condition: null,
                outcome: {
                    battle: true,
                    difficulty: 'expert',
                    message: '你做好了战斗准备，开始迎战怪物！',
                },
            },
            {
                text: '扔出诱饵并逃跑（消耗 30 金币）',
                condition: { type: 'gold_min', value: 30 },
                outcome: {
                    gold: -30,
                    message: '你扔下一袋金币作为诱饵，趁怪物被吸引注意力时逃走了。',
                },
            },
            {
                text: '强行突围（消耗 20 HP）',
                condition: { type: 'hp_min', value: 25 },
                outcome: {
                    hp: -20,
                    message: '你硬抗了怪物的一击，浑身是伤地冲了过去。',
                },
            },
        ],
    },
    {
        id: 'robber_encounter',
        name: '强盗拦路',
        icon: '⚔️',
        description: '一个身形魁梧的强盗拦住了你的去路：“此山是我开，此树是我栽！留下买路钱，或者来个词汇大战！”',
        choices: [
            {
                text: '交钱买平安（消耗 40 金币）',
                condition: { type: 'gold_min', value: 40 },
                outcome: {
                    gold: -40,
                    message: '你老老实实交出40金币，强盗满意地让开了路。',
                },
            },
            {
                text: '与他进行口语较量！（触发口语战斗）',
                condition: null,
                outcome: {
                    battle: true,
                    difficulty: 'expert',
                    message: '你大喝一声，决定用流畅的英语给他上一课！',
                },
            },
            {
                text: '嘲讽他并逃跑（50%概率无伤 / 50%概率扣 25 HP）',
                condition: null,
                outcome: {
                    gamble: true,
                    successRate: 0.5,
                    success: {
                        message: '你嘲讽了强盗一通，在他反应过来之前溜之大吉！',
                    },
                    failure: {
                        hp: -25,
                        message: '逃跑失败！你被强盗狠狠揍了一顿，失去了 25 HP！',
                    },
                },
            },
        ],
    },
];
