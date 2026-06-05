/**
 * 商店数据 - 语塔攀登
 * 商店配置和商品池
 */

export const SHOP_DATA = {
  /** 刷新商品列表的金币花费 */
  refreshCost: 10,

  /** 移除已购买道具的基础花费，每次移除后递增 */
  removalBaseCost: 80,
  removalCostIncrement: 25,

  /** 商店同时展示的商品数量 */
  itemSlots: 6,

  /** 不同稀有度商品出现的概率权重 */
  slotWeights: {
    common: 50,
    rare: 30,
    epic: 15,
    curse: 5,
  },

  /** 普通商品池 - 基础道具 */
  commonPool: [
    'hp_potion',
    'shield_crystal',
    'hint_scroll',
  ],

  /** 稀有商品池 - 进阶道具 */
  rarePool: [
    'pronunciation_manual',
    'grammar_tome',
    'expression_sutra',
    'hourglass',
    'retry_rune',
  ],

  /** 史诗商品池 - 强力道具 */
  epicPool: [
    'reapers_eye',
    'fate_dice',
    'energy_crystal',
  ],

  /** 诅咒商品池 - 双刃剑道具（免费但有负面效果） */
  cursePool: [
    'demon_contract',
    'cursed_dictionary',
  ],

  /** 各章节的价格系数（越后面的章节物价越高） */
  actPriceMultiplier: {
    1: 1.0,
    2: 1.3,
    3: 1.6,
  },

  /** 商店折扣事件配置 */
  discountEvents: [
    { id: 'clearance_sale', name: '清仓大甩卖', discount: 0.5, probability: 0.08, desc: '所有商品半价！机会难得！' },
    { id: 'lucky_day', name: '幸运日', discount: 0.8, probability: 0.15, desc: '今日八折优惠！' },
    { id: 'inflation', name: '通货膨胀', discount: 1.5, probability: 0.1, desc: '物价上涨了！所有商品价格×1.5' },
  ],

  /** 商人的台词 */
  merchantDialogues: {
    greeting: [
      '"欢迎光临！看看有什么中意的吧～"',
      '"啊，又一位勇敢的冒险者！我这里有你需要的一切。"',
      '"来来来，好东西都在这里了！"',
    ],
    purchase: [
      '"好眼光！这件道具一定能帮到你。"',
      '"成交！祝你攀登顺利。"',
      '"明智的选择，冒险者。"',
    ],
    tooExpensive: [
      '"金币不够？那可真遗憾……"',
      '"要不先去打几个怪赚点钱？"',
      '"下次攒够了再来吧。"',
    ],
    farewell: [
      '"一路顺风！下次再来啊！"',
      '"祝你在语塔中好运！"',
      '"再见！记住，活着才能花钱哦～"',
    ],
  },
};
