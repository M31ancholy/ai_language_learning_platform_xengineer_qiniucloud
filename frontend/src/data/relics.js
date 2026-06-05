/**
 * 遗物数据 - 语塔攀登
 * Boss遗物（通关章节获得）和普通遗物（事件/精英怪掉落）
 */

export const RELICS = [
  // ============ Boss 遗物（每章通关奖励） ============
  {
    id: 'daily_stone',
    name: '日常会话之石',
    icon: '🔮',
    rarity: 'boss',
    act: 1,
    effect: '日常场景题目永久+10%评分加成',
    desc: '从美食审判者身上掉落的魔法石，蕴含着日常交流的精髓。持有它时，所有日常生活相关的英语挑战都会变得更加得心应手。',
    passive: {
      scoreBonus: { scene: 'daily', value: 10 },
    },
  },
  {
    id: 'work_pass',
    name: '职场通行证',
    icon: '📋',
    rarity: 'boss',
    act: 2,
    effect: '每场战斗开始时获得5点护盾',
    desc: '面试官留下的职场通行证，象征着职场中的自信与从容。它会在每场战斗开始时为你提供一层保护。',
    passive: {
      shieldPerBattle: 5,
    },
  },
  {
    id: 'business_crown',
    name: '商务精英王冠',
    icon: '👑',
    rarity: 'boss',
    act: 3,
    effect: '金币获取永久×1.5',
    desc: '谈判大师的王冠，代表着商务世界的至高成就。戴上它，你在语塔中的每一次胜利都会带来更丰厚的回报。',
    passive: {
      goldMultiplier: 1.5,
    },
  },

  // ============ 普通遗物 ============
  {
    id: 'lucky_coin',
    name: '幸运金币',
    icon: '🪙',
    rarity: 'common',
    act: null,
    effect: '每次战斗胜利额外获得5金币',
    desc: '一枚总是正面朝上的金币。传说它能为持有者带来好运和财富。虽然每次的额外收益不多，但积少成多。',
    passive: {
      goldPerWin: 5,
    },
  },
  {
    id: 'confidence_amulet',
    name: '自信护符',
    icon: '✨',
    rarity: 'common',
    act: null,
    effect: 'HP低于30%时，评分加成+20%',
    desc: '一枚在危急时刻会闪闪发光的护符。当你的生命值处于危险水平时，它会激发出你的潜能，让你的表现超常发挥。',
    passive: {
      lowHpScoreBonus: { threshold: 0.3, value: 20 },
    },
  },
  {
    id: 'scholars_glasses',
    name: '学者的眼镜',
    icon: '👓',
    rarity: 'common',
    act: null,
    effect: '所有朗读(Reading)挑战评分+8%',
    desc: '据说是某位伟大语言学家遗留的眼镜。戴上它，文字仿佛变得更加清晰，朗读时的自信也随之增加。',
    passive: {
      scoreBonus: { challengeType: 'reading', value: 8 },
    },
  },
  {
    id: 'actors_mask',
    name: '演员的面具',
    icon: '🎭',
    rarity: 'common',
    act: null,
    effect: '所有场景(Scene)挑战评分+8%',
    desc: '一位出色的英语戏剧演员曾经佩戴的面具。戴上它，你能更自然地融入各种英语对话场景。',
    passive: {
      scoreBonus: { challengeType: 'scene', value: 8 },
    },
  },
  {
    id: 'iron_throat',
    name: '钢铁喉咙',
    icon: '🔩',
    rarity: 'rare',
    act: null,
    effect: '受到伤害时减少2点（最低1点）',
    desc: '用魔法金属打造的喉咙护甲，不仅让你的发音更加铿锵有力，还能减少战斗中受到的伤害。',
    passive: {
      damageReduction: 2,
    },
  },
  {
    id: 'polyglot_ring',
    name: '多语者之戒',
    icon: '💍',
    rarity: 'rare',
    act: null,
    effect: '战斗开始时有20%概率获得一张免费提示卷轴',
    desc: '一枚来自传说中"通晓万语之人"的戒指。它偶尔会在你需要帮助时赐予你一些启示。',
    passive: {
      freeHintChance: 0.2,
    },
  },
  {
    id: 'phoenix_feather',
    name: '凤凰之羽',
    icon: '🪶',
    rarity: 'rare',
    act: null,
    effect: '每次通关一个房间恢复3HP',
    desc: '反馈凤凰掉落的羽毛，蕴含着温暖的治愈之力。每当你成功通过一个房间，它都会为你恢复少量生命值。',
    passive: {
      healPerRoom: 3,
    },
  },
  {
    id: 'babel_fragment',
    name: '巴别塔碎片',
    icon: '🏗️',
    rarity: 'epic',
    act: null,
    effect: '所有评分+5%，但最大HP减少10',
    desc: '传说中巴别塔的一块碎片，蕴含着远古的语言之力。它能增强你的英语能力，但其沉重的历史也会压迫你的生命力。',
    passive: {
      scoreBonusAll: 5,
      maxHpReduction: 10,
    },
  },
];
