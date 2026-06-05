/**
 * 第一章 Boss战 - 美食审判者
 * 场景：高级餐厅完整用餐体验
 * 4轮对话，难度递增
 */

export const ACT1_BOSS = {
  id: 'food_judge',
  name: '美食审判者',
  icon: '🍽️',
  scene: '高级餐厅',
  description: '你踏入了语塔第一层的最终大厅——一间装潢华丽的高级法式餐厅。美食审判者端坐在主位，他是一位世界级的美食评论家，只有通过他的四道英语考验，你才能获得通往第二层的钥匙。',
  atmosphere: '烛光摇曳，古典音乐轻轻流淌，餐厅内弥漫着诱人的香气。',
  totalRounds: 4,

  rounds: [
    {
      round: 1,
      phase: '预订与入座',
      difficulty: 'rookie',
      bossLine: 'Good evening! Welcome to Le Château, the finest restaurant in the tower. Do you have a reservation, or would you like to check if we have any available tables tonight?',
      expectedTopics: ['reservation', 'table for', 'booking', 'name', 'party size'],
      hints: '确认预订或请求座位，说明用餐人数',
      scoringCriteria: {
        pronunciation: 25,
        grammar: 25,
        relevance: 30,
        politeness: 20,
      },
      bossReactions: {
        excellent: '"Excellent! Right this way, please. I can see you are a person of refined taste."（审判者露出满意的微笑）',
        good: '"Very well. Please follow me to your table."（审判者点了点头）',
        poor: '"Hmm... your English is a bit rusty, but let\'s see how you handle the rest of the evening."（审判者微微皱眉）',
      },
      exampleResponse: 'Good evening! Yes, I have a reservation under the name Li Wei for a party of two at 7:30. Could we have a table by the window, if possible? The view must be lovely at this time of night.',
    },
    {
      round: 2,
      phase: '点餐与推荐',
      difficulty: 'rookie',
      bossLine: 'Wonderful. Here is our menu. Tonight, our chef recommends the pan-seared duck breast with a truffle reduction, or the grilled salmon with seasonal vegetables. May I also suggest a glass of our house Chardonnay? What would you like to order?',
      expectedTopics: ['order', 'appetizer', 'main course', 'recommend', 'wine', 'dessert', 'side dish'],
      hints: '点选菜品，可以询问推荐或食材详情，点饮品',
      scoringCriteria: {
        pronunciation: 25,
        grammar: 25,
        vocabulary: 25,
        naturalness: 25,
      },
      bossReactions: {
        excellent: '"A truly sophisticated choice! You clearly know your way around fine dining. I\'m impressed."（审判者鼓掌）',
        good: '"A solid choice. The chef will prepare it to perfection."（审判者记下你的选择）',
        poor: '"I see... Perhaps you should explore more culinary vocabulary."（审判者摇了摇头）',
      },
      exampleResponse: 'The duck breast sounds absolutely delicious — I\'ll go with that as my main course. Could I start with the French onion soup as an appetizer? And yes, I\'d love a glass of the Chardonnay. Oh, one question — is the truffle reduction made with black or white truffles?',
    },
    {
      round: 3,
      phase: '特殊要求与问题',
      difficulty: 'expert',
      bossLine: 'I should mention that the duck breast is prepared medium-rare by default. Also, I noticed you haven\'t touched the bread basket. Do you have any dietary restrictions or allergies I should be aware of? We take these matters very seriously here at Le Château.',
      expectedTopics: ['allergy', 'dietary', 'vegetarian', 'well-done', 'gluten-free', 'preference', 'cooking method'],
      hints: '说明你的饮食偏好或过敏情况，对烹饪方式提出要求',
      scoringCriteria: {
        pronunciation: 20,
        grammar: 25,
        vocabulary: 25,
        communication: 30,
      },
      bossReactions: {
        excellent: '"Thank you for being so clear and articulate. Safety and comfort are paramount. The kitchen will accommodate your needs perfectly."（审判者认真记录）',
        good: '"Understood. I will inform the kitchen right away."（审判者点头）',
        poor: '"I\'m sorry, could you try to express that more clearly? When it comes to allergies, precision is crucial."（审判者要求你再说一遍）',
      },
      exampleResponse: 'Actually, I\'d prefer the duck breast cooked medium, if that\'s possible. As for allergies, I\'m allergic to shellfish and tree nuts, so could you please make sure there are no traces of those in any of the dishes? I don\'t have any issues with gluten, though. The bread looks lovely — I was just saving my appetite for the main course!',
    },
    {
      round: 4,
      phase: '结账与评价',
      difficulty: 'expert',
      bossLine: 'I hope you enjoyed your meal tonight. Here is your bill. The total comes to $186.50, including a service charge. How did you find the food and the overall experience? We always value our guests\' honest feedback.',
      expectedTopics: ['payment', 'tip', 'credit card', 'experience', 'compliment', 'feedback', 'recommend'],
      hints: '完成结账并给出你对用餐体验的反馈和评价',
      scoringCriteria: {
        pronunciation: 20,
        grammar: 20,
        vocabulary: 20,
        expressiveness: 20,
        naturalness: 20,
      },
      bossReactions: {
        excellent: '"What eloquent and thoughtful feedback! It has been an absolute pleasure serving you tonight. You have passed my trial with flying colors!"（审判者站起来，递给你通往第二层的钥匙）',
        good: '"Thank you for your kind words. You\'ve done well tonight. Here is the key to the next floor."（审判者交出钥匙）',
        poor: '"Your English needs more seasoning, just like your vocabulary. But you\'ve shown courage. Take this key and continue your journey."（审判者勉强交出钥匙）',
      },
      exampleResponse: 'The entire experience was absolutely wonderful, thank you! The duck breast was cooked to perfection — the truffle reduction was rich and flavorful without being overpowering. I was particularly impressed by the attentive service throughout the evening. I\'ll definitely be recommending Le Château to my friends. I\'d like to pay by credit card, please. And could I leave an additional tip for the chef? The meal truly exceeded my expectations.',
    },
  ],

  /** Boss 通关奖励 */
  rewards: {
    gold: 100,
    relic: 'daily_stone',
    exp: 200,
  },

  /** Boss 失败惩罚 */
  failurePenalty: {
    gold: -30,
    message: '美食审判者摇了摇头："你的英语还没有准备好品尝这道大餐。回去多加练习吧。"',
  },
};
