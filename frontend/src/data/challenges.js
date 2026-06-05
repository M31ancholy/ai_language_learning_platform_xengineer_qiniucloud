/**
 * 挑战题库数据 - 语塔攀登
 * 朗读挑战和场景挑战的题目数据
 */

export const READING_CHALLENGES = {
    // 第一章：日常生活
    act1: {
        rookie: [
            {
                id: 'r1_1',
                text: 'Good morning! How are you today? I hope you are doing well.',
                translation: '早上好！你今天怎么样？我希望你一切都好。',
                keywords: ['morning', 'today', 'hope', 'well'],
            },
            {
                id: 'r1_2',
                text: 'I would like a cup of coffee, please. No sugar, just milk.',
                translation: '请给我一杯咖啡。不要糖，只要牛奶。',
                keywords: ['coffee', 'please', 'sugar', 'milk'],
            },
            {
                id: 'r1_3',
                text: 'Excuse me, where is the nearest subway station?',
                translation: '打扰一下，最近的地铁站在哪里？',
                keywords: ['excuse', 'nearest', 'subway', 'station'],
            },
            {
                id: 'r1_4',
                text: 'The weather is really nice today. Let us go for a walk in the park.',
                translation: '今天天气真好。我们去公园散步吧。',
                keywords: ['weather', 'nice', 'walk', 'park'],
            },
            {
                id: 'r1_8',
                text: 'May I please have the menu? I would like to order a chicken salad.',
                translation: '请给我拿一下菜单。我想点一份鸡肉沙拉。',
                keywords: ['menu', 'order', 'chicken', 'salad'],
            },
            {
                id: 'r1_9',
                text: 'How much is this blue shirt? Do you accept credit card payments?',
                translation: '这件蓝色衬衫多少钱？你们接受信用卡付款吗？',
                keywords: ['blue', 'shirt', 'accept', 'payments'],
            },
        ],
        expert: [
            {
                id: 'r1_5',
                text: 'I have been learning English for three years, and I still find pronunciation challenging sometimes.',
                translation: '我学英语已经三年了，有时候仍然觉得发音很有挑战性。',
                keywords: ['learning', 'years', 'pronunciation', 'challenging'],
            },
            {
                id: 'r1_6',
                text: 'Could you recommend a good restaurant nearby? I am looking for somewhere with vegetarian options.',
                translation: '你能推荐附近一家好的餐厅吗？我在找有素食选择的地方。',
                keywords: ['recommend', 'restaurant', 'vegetarian', 'options'],
            },
            {
                id: 'r1_10',
                text: 'The local museum is having a special exhibition this weekend, featuring historical artifacts from the ancient Roman empire.',
                translation: '当地博物馆这周末有一个特别展览，展出古罗马帝国的历史文物。',
                keywords: ['museum', 'exhibition', 'historical', 'artifacts'],
            },
            {
                id: 'r1_11',
                text: 'I missed my connecting flight to Paris due to the heavy rainstorm. Could you please rebook me on the next available flight?',
                translation: '由于暴风雨，我错过了飞往巴黎的转机航班。能帮我改签到下一班有空位的航班吗？',
                keywords: ['connecting', 'flight', 'rainstorm', 'rebook'],
            },
        ],
        hell: [
            {
                id: 'r1_7',
                text: 'Although the reservation was for seven o\'clock, we arrived fashionably late and were pleasantly surprised to find our table still available.',
                translation: '虽然预订的是七点，但我们时髦地迟到了，惊喜地发现我们的桌子还在。',
                keywords: ['reservation', 'fashionably', 'pleasantly', 'available'],
            },
            {
                id: 'r1_12',
                text: 'Despite the persistent traffic congestion on the highway, we managed to arrive at the concert hall just before the orchestra began their performance.',
                translation: '尽管高速公路上交通持续拥堵，我们还是成功在管弦乐队开始演奏前赶到了音乐厅。',
                keywords: ['persistent', 'congestion', 'orchestra', 'performance'],
            },
        ],
    },
    // 第二章：职场英语
    act2: {
        rookie: [
            {
                id: 'r2_1',
                text: 'Hello, my name is Alex. I am here for the job interview scheduled at ten o\'clock.',
                translation: '你好，我叫Alex。我来参加定在十点的工作面试。',
                keywords: ['name', 'interview', 'scheduled', 'o\'clock'],
            },
            {
                id: 'r2_2',
                text: 'I have five years of experience in software development and project management.',
                translation: '我有五年的软件开发和项目管理经验。',
                keywords: ['experience', 'software', 'development', 'management'],
            },
            {
                id: 'r2_6',
                text: 'I will send you the meeting notes by the end of today.',
                translation: '我会在今天结束前把会议记录发给你。',
                keywords: ['send', 'meeting', 'notes', 'today'],
            },
            {
                id: 'r2_7',
                text: 'Let us discuss the new marketing campaign in our next weekly team meeting.',
                translation: '让我们在下周的小组周会上讨论新的营销活动。',
                keywords: ['discuss', 'marketing', 'campaign', 'weekly'],
            },
        ],
        expert: [
            {
                id: 'r2_3',
                text: 'In my previous role, I successfully led a team of twelve developers to deliver a complex project three weeks ahead of schedule.',
                translation: '在我之前的职位中，我成功带领一个12人的开发团队提前三周交付了一个复杂项目。',
                keywords: ['previous', 'successfully', 'developers', 'schedule'],
            },
            {
                id: 'r2_4',
                text: 'I believe my strongest qualities are adaptability and attention to detail, which have consistently contributed to my professional growth.',
                translation: '我相信我最强的品质是适应力和对细节的关注，这些一直有助于我的职业成长。',
                keywords: ['adaptability', 'attention', 'consistently', 'professional'],
            },
            {
                id: 'r2_8',
                text: 'To solve this software bug, we need to analyze the server logs and coordinate with our security team to ensure data safety.',
                translation: '为了解决这个软件错误，我们需要分析服务器日志并与我们的安全团队协作以确保数据安全。',
                keywords: ['software', 'analyze', 'coordinate', 'security'],
            },
            {
                id: 'r2_9',
                text: 'Please prepare a comprehensive slide presentation detailing our target audience, budget requirements, and launch timeline.',
                translation: '请准备一份详细的幻灯片演示文稿，详细说明我们的目标受众、预算要求和发布时间表。',
                keywords: ['comprehensive', 'presentation', 'budget', 'timeline'],
            },
        ],
        hell: [
            {
                id: 'r2_5',
                text: 'While I acknowledge the competitive compensation package at my current position, I am particularly drawn to the innovative culture and growth opportunities your organization offers.',
                translation: '虽然我认可目前职位的有竞争力的薪酬方案，但我特别被贵组织提供的创新文化和成长机会所吸引。',
                keywords: ['acknowledge', 'compensation', 'innovative', 'opportunities'],
            },
            {
                id: 'r2_10',
                text: 'While analyzing the quarterly financial statements, we discovered a significant discrepancy in the operational expenses, which requires immediate auditing and corrective actions.',
                translation: '在分析季度财务报表时，我们发现运营费用存在重大差异，这需要立即进行审计和纠正措施。',
                keywords: ['quarterly', 'financial', 'discrepancy', 'auditing'],
            },
        ],
    },
    // 第三章：商务谈判
    act3: {
        rookie: [
            {
                id: 'r3_1',
                text: 'Thank you for meeting with us today. We are excited to discuss the potential partnership.',
                translation: '感谢今天与我们会面。我们很高兴讨论潜在的合作伙伴关系。',
                keywords: ['meeting', 'excited', 'discuss', 'partnership'],
            },
            {
                id: 'r3_4',
                text: 'We would like to request a discount for our first bulk order.',
                translation: '我们希望我们第一批大宗订单能获得折扣。',
                keywords: ['request', 'discount', 'first', 'bulk'],
            },
            {
                id: 'r3_5',
                text: 'I look forward to collaborating with your team on this project.',
                translation: '我期待着在这个项目上与您的团队合作。',
                keywords: ['forward', 'collaborating', 'team', 'project'],
            },
        ],
        expert: [
            {
                id: 'r3_2',
                text: 'Based on our market analysis, we propose a revenue-sharing model that would benefit both parties while minimizing upfront investment risks.',
                translation: '基于我们的市场分析，我们提出一种收入分成模式，这将使双方受益，同时最大限度地降低前期投资风险。',
                keywords: ['analysis', 'revenue-sharing', 'benefit', 'minimizing'],
            },
            {
                id: 'r3_6',
                text: 'We are prepared to offer a flexible pricing structure if you can guarantee a minimum order quantity of ten thousand units annually.',
                translation: '如果您能保证每年至少一万件的起订量，我们准备提供灵活的定价结构。',
                keywords: ['flexible', 'pricing', 'guarantee', 'annually'],
            },
            {
                id: 'r3_7',
                text: 'To build a long-term strategic partnership, we should sign a non-disclosure agreement before sharing proprietary technical specifications.',
                translation: '为了建立长期的战略合作伙伴关系，我们应该在共享专有技术规格之前签署保密协议。',
                keywords: ['strategic', 'non-disclosure', 'sharing', 'proprietary'],
            },
        ],
        hell: [
            {
                id: 'r3_3',
                text: 'I appreciate your counterproposal; however, given the current market volatility and our significant investment in research and development, we would need to negotiate more favorable terms regarding intellectual property rights.',
                translation: '我很感谢你的反提案；然而，鉴于当前市场的波动性以及我们在研发方面的大量投资，我们需要就知识产权方面协商更有利的条款。',
                keywords: ['counterproposal', 'volatility', 'intellectual', 'negotiate'],
            },
            {
                id: 'r3_8',
                text: 'Considering the high volatility of currency exchange rates, we suggest incorporating a hedging clause into the contract to mitigate potential financial risks for both parties.',
                translation: '考虑到货币汇率的高波动性，我们建议在合同中加入套期保值条款，以减轻双方潜在的财务风险。',
                keywords: ['volatility', 'incorporating', 'hedging', 'mitigate'],
            },
        ],
    },
};

// ============ 场景挑战题库 ============
export const SCENE_CHALLENGES = {
    act1: {
        rookie: [
            {
                id: 's1_1',
                scene: '咖啡店点单',
                description: 'You are at a coffee shop. The barista asks: "Hi! What can I get for you today?"',
                prompt: '请用英语点一杯你喜欢的饮品，并说明任何特殊要求（如大小、温度等）。',
                hints: ['I would like...', 'Can I have...', 'medium / large', 'hot / iced'],
                evaluationCriteria: ['点单内容清晰', '使用礼貌用语', '包含具体要求'],
            },
            {
                id: 's1_2',
                scene: '问路',
                description: 'You are lost in the city. You see a friendly-looking person nearby.',
                prompt: '请用英语向路人问路，询问如何到达最近的地铁站。',
                hints: ['Excuse me...', 'Could you tell me...', 'How do I get to...', 'Is it far from here?'],
                evaluationCriteria: ['使用礼貌开场', '问题表达清晰', '包含具体目的地'],
            },
        ],
        expert: [
            {
                id: 's1_3',
                scene: '餐厅投诉',
                description: 'Your food at a restaurant has been cold and the service slow. The manager comes to your table and asks: "Is everything okay?"',
                prompt: '请用英语礼貌地向经理表达你的不满，并提出你希望的解决方案。',
                hints: ['I\'m afraid...', 'Unfortunately...', 'I would appreciate if...', 'Would it be possible to...'],
                evaluationCriteria: ['礼貌表达不满', '描述具体问题', '提出合理解决方案'],
            },
        ],
        hell: [
            {
                id: 's1_4',
                scene: '紧急医疗',
                description: 'You are traveling abroad and feel very sick. You go to a local clinic. The doctor asks: "What brings you in today?"',
                prompt: '请用英语详细描述你的症状、持续时间，以及你已经采取的任何措施。',
                hints: ['I\'ve been experiencing...', 'The symptoms started...', 'I have already tried...', 'I\'m allergic to...'],
                evaluationCriteria: ['症状描述详细', '时间线清晰', '使用医学相关词汇'],
            },
        ],
    },
    act2: {
        rookie: [
            {
                id: 's2_1',
                scene: '自我介绍',
                description: 'You are at a networking event. Someone asks: "So, what do you do?"',
                prompt: '请用英语进行一个简短的自我介绍，包括你的职业和一个兴趣爱好。',
                hints: ['I work as...', 'I\'m currently...', 'In my free time...', 'I\'m passionate about...'],
                evaluationCriteria: ['包含职业信息', '提及个人兴趣', '表达自然流畅'],
            },
        ],
        expert: [
            {
                id: 's2_2',
                scene: '项目汇报',
                description: 'Your manager asks you to give a brief update on your current project.',
                prompt: '请用英语汇报项目进展，包括已完成的内容、当前状态和下一步计划。',
                hints: ['We have completed...', 'Currently, we are...', 'The next step will be...', 'We expect to finish by...'],
                evaluationCriteria: ['结构化表达', '使用项目管理词汇', '时间节点清晰'],
            },
        ],
        hell: [
            {
                id: 's2_3',
                scene: '绩效谈判',
                description: 'During your annual review, your manager says: "Let\'s discuss your performance and career development goals."',
                prompt: '请用英语讨论你的工作成绩，提出薪资或职位提升的请求，并说明理由。',
                hints: ['I have consistently...', 'My contributions include...', 'I believe I deserve...', 'I would like to discuss...'],
                evaluationCriteria: ['列举具体成绩', '提出合理诉求', '使用说服性语言'],
            },
        ],
    },
    act3: {
        rookie: [
            {
                id: 's3_1',
                scene: '商务寒暄',
                description: 'You meet a potential business partner at a conference. They extend their hand for a handshake.',
                prompt: '请用英语进行商务问候和小谈，包括自我介绍和表达合作意愿。',
                hints: ['Pleased to meet you...', 'I represent...', 'We are interested in...', 'I look forward to...'],
                evaluationCriteria: ['专业的问候', '清晰的身份介绍', '表达合作意向'],
            },
        ],
        expert: [
            {
                id: 's3_2',
                scene: '价格谈判',
                description: 'The supplier says: "Our standard pricing for this volume is $50 per unit."',
                prompt: '请用英语进行价格谈判，提出你的预算范围并争取更好的条件。',
                hints: ['We were hoping for...', 'Given our order volume...', 'Would you consider...', 'If we commit to...'],
                evaluationCriteria: ['提出合理的反提案', '使用谈判策略', '保持专业态度'],
            },
        ],
        hell: [
            {
                id: 's3_3',
                scene: '危机处理',
                description: 'A major client is threatening to terminate the contract due to delivery delays. They say: "We need an explanation and a solution immediately."',
                prompt: '请用英语道歉、解释原因、提出补偿方案并重建客户信任。',
                hints: ['I sincerely apologize...', 'The root cause was...', 'To compensate...', 'Going forward, we will...'],
                evaluationCriteria: ['真诚道歉', '清晰解释原因', '提出具体补偿和预防措施'],
            },
        ],
    },
};

// ============ Boss 对话题库 ============
export const BOSS_DIALOGUES = {
    // 第一章Boss：美食审判者
    food_judge: [
        {
            round: 1,
            bossLine: 'Good evening. Welcome to Le Grande Cuisine. Do you have a reservation?',
            bossTranslation: '晚上好。欢迎来到Le Grande Cuisine。您有预约吗？',
            prompt: '请用英语确认预约信息（姓名、人数、时间）。',
            hints: ['Yes, I have a reservation under...', 'It should be for... people', 'at... o\'clock'],
        },
        {
            round: 2,
            bossLine: 'Excellent. Here is our menu. I would particularly recommend the chef\'s special today. May I take your order?',
            bossTranslation: '太好了。这是我们的菜单。我特别推荐今天的主厨特选。我可以为您点餐了吗？',
            prompt: '请用英语点餐，包括前菜、主菜和饮品。',
            hints: ['For the appetizer...', 'As for the main course...', 'I\'d also like...', 'Could you recommend a wine?'],
        },
        {
            round: 3,
            bossLine: 'I notice you seem a bit hesitant. Do you have any dietary restrictions or allergies I should know about?',
            bossTranslation: '我注意到您似乎有些犹豫。您有什么饮食限制或过敏情况需要我了解吗？',
            prompt: '请用英语说明你的饮食偏好或特殊要求。',
            hints: ['Actually, I\'m...', 'I\'m allergic to...', 'Could you make it without...', 'Is there a... option?'],
        },
        {
            round: 4,
            bossLine: 'I hope you enjoyed your meal. Here is your bill. Is there anything else I can help you with?',
            bossTranslation: '希望您享受了这顿饭。这是您的账单。还有什么我可以帮忙的吗？',
            prompt: '请用英语结账、表达对餐厅的评价，并询问关于小费的问题。',
            hints: ['The meal was...', 'I\'d like to pay by...', 'Is service charge included?', 'Thank you for...'],
        },
    ],
    // 第二章Boss：面试官
    interviewer: [
        {
            round: 1,
            bossLine: 'Thank you for coming in today. Please, have a seat. Could you start by telling me about yourself?',
            bossTranslation: '感谢您今天前来。请坐。您能先自我介绍一下吗？',
            prompt: '请进行专业的英语自我介绍（教育背景、工作经验、个人优势）。',
            hints: ['I graduated from...', 'I have... years of experience in...', 'My key strengths are...'],
        },
        {
            round: 2,
            bossLine: 'Interesting background. Could you walk me through your most recent role and what your day-to-day responsibilities were?',
            bossTranslation: '有趣的背景。能说说您最近的职位以及日常职责吗？',
            prompt: '请用英语描述你的上一份工作职责和主要成就。',
            hints: ['In my previous role...', 'I was responsible for...', 'One of my key achievements was...'],
        },
        {
            round: 3,
            bossLine: 'Tell me about a time when you faced a significant challenge at work. How did you handle it?',
            bossTranslation: '告诉我一次你在工作中面临重大挑战的经历。你是怎么处理的？',
            prompt: '请用STAR方法（情况、任务、行动、结果）回答这个行为面试题。',
            hints: ['The situation was...', 'My task was to...', 'I decided to...', 'As a result...'],
        },
        {
            round: 4,
            bossLine: 'How do you handle working under pressure and tight deadlines?',
            bossTranslation: '你如何应对工作压力和紧张的截止日期？',
            prompt: '请用英语描述你的压力管理方法和相关经历。',
            hints: ['I prioritize by...', 'I stay organized through...', 'For example, when...'],
        },
        {
            round: 5,
            bossLine: 'Let\'s talk about compensation. What are your salary expectations for this position?',
            bossTranslation: '我们来谈谈薪酬。你对这个职位的薪资期望是什么？',
            prompt: '请用英语专业地讨论薪资期望，包括你的理由。',
            hints: ['Based on my research...', 'Considering my experience...', 'I\'m open to discussion...', 'The market rate for...'],
        },
        {
            round: 6,
            bossLine: 'We are near the end of our interview. Do you have any questions for me about the company or the role?',
            bossTranslation: '我们的面试接近尾声了。你对公司或这个职位有什么问题要问我吗？',
            prompt: '请用英语提出2-3个有深度的问题，展示你对公司和职位的兴趣。',
            hints: ['Could you tell me about...', 'What does success look like...', 'How would you describe...', 'What are the next steps?'],
        },
    ],
    // 第三章Boss：谈判大师
    negotiator: [
        {
            round: 1,
            bossLine: 'Welcome. It\'s a pleasure to finally meet in person. How was your flight?',
            bossTranslation: '欢迎。很高兴终于见面了。飞行还好吗？',
            prompt: '请用英语进行得体的商务寒暄并引入会议主题。',
            hints: ['Thank you for hosting...', 'The flight was...', 'I\'m looking forward to...', 'Shall we get started?'],
        },
        {
            round: 2,
            bossLine: 'Please, go ahead and present your proposal. We\'re all ears.',
            bossTranslation: '请吧，介绍你们的提案。我们洗耳恭听。',
            prompt: '请用英语介绍你的项目提案，包括项目背景、目标和预期收益。',
            hints: ['Our proposal focuses on...', 'The key objectives are...', 'We project a... return on investment'],
        },
        {
            round: 3,
            bossLine: 'Your proposal is interesting, but I have some concerns about the timeline and the budget allocation.',
            bossTranslation: '你们的提案很有趣，但我对时间线和预算分配有一些担忧。',
            prompt: '请用英语回应对方的关切，解释时间线的合理性并讨论预算细节。',
            hints: ['I understand your concern...', 'Let me address...', 'We have allocated...', 'The timeline accounts for...'],
        },
        {
            round: 4,
            bossLine: 'Your price seems quite high compared to other offers we\'ve received. Can you justify this?',
            bossTranslation: '跟我们收到的其他报价相比，你们的价格似乎相当高。你能说明理由吗？',
            prompt: '请用英语进行价格谈判，解释定价理由并提出灵活方案。',
            hints: ['Our pricing reflects...', 'The value we bring includes...', 'We could explore...', 'If you commit to a longer term...'],
        },
        {
            round: 5,
            bossLine: 'We have a concern about the intellectual property clause in section 5. We need more protection.',
            bossTranslation: '我们对第5条的知识产权条款有疑虑。我们需要更多保护。',
            prompt: '请用英语讨论知识产权条款，提出修改建议并寻求共识。',
            hints: ['We respect your concern regarding...', 'We propose a modified clause...', 'Both parties would retain...'],
        },
        {
            round: 6,
            bossLine: 'We appreciate your flexibility. However, we need to discuss the penalty clause for late delivery.',
            bossTranslation: '我们感谢你们的灵活性。但是，我们需要讨论延迟交付的处罚条款。',
            prompt: '请用英语讨论处罚条款，提出合理的让步方案。',
            hints: ['We understand the importance of...', 'We propose a graduated penalty...', 'In exchange for...', 'We could agree to...'],
        },
        {
            round: 7,
            bossLine: 'Before we finalize, I want to make sure we are aligned on the quality assurance and support terms.',
            bossTranslation: '在我们敲定之前，我想确保我们在质量保证和支持条款上达成一致。',
            prompt: '请用英语详述质量保证方案和售后支持承诺。',
            hints: ['Our QA process includes...', 'We guarantee...', 'Our support team provides...', 'Service level agreements include...'],
        },
        {
            round: 8,
            bossLine: 'I believe we are close to an agreement. Let\'s summarize the key terms and move towards signing.',
            bossTranslation: '我相信我们接近达成协议了。让我们总结关键条款并进入签约。',
            prompt: '请用英语总结所有协商的关键条款并表达对合作的期待。',
            hints: ['To summarize our agreement...', 'The key terms include...', 'We look forward to...', 'This partnership will...'],
        },
    ],
};
