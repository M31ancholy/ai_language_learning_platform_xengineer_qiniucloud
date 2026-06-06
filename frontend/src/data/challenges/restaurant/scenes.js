/**
 * 点餐场景 - 场景对话题库
 */
export const SCENES = {
    act1: {
        rookie: [
            {
                id: 'rest_a1_scene_r1',
                scene: "咖啡厅点单",
                prompt: "服务员问你想喝什么，请用英语点一杯美式咖啡和一块巧克力蛋糕。\nBarista: 'Hi, what can I get started for you today?'",
                context: "At a coffee shop",
                timeLimit: 60,
                hints: ["I would like to have...", "Can I get an Americano...", "chocolate cake"]
            },
            {
                id: 'rest_a1_scene_r2',
                scene: "快餐店升级套餐",
                prompt: "收银员问你是否要把汉堡升级成超大号薯条加可乐套餐，请用英语婉言拒绝并索要一杯白开水。\nCashier: 'Would you like to make that a combo meal with large fries and a drink?'",
                context: "Fast food check-out",
                timeLimit: 60,
                hints: ["No, thank you. Just the burger...", "Can I get a cup of water, please?"]
            }
        ],
        expert: [
            {
                id: 'rest_a1_scene_e1',
                scene: "牛排馆点餐",
                prompt: "你想点一份肉眼牛排，熟度为五分熟，配菜要烤土豆，酱汁要黑胡椒酱。请用英语表达你的要求。\nWaitress: 'How would you like your steak cooked, and what side options would you prefer?'",
                context: "Upscale Steakhouse",
                timeLimit: 45,
                hints: ["I'd like a ribeye steak...", "medium...", "with baked potato and black pepper sauce"]
            },
            {
                id: 'rest_a1_scene_e2',
                scene: "食物过敏沟通",
                prompt: "询问服务员某道沙拉中是否含有花生或坚果，因为你对它们严重过敏。\nWaitress: 'Our house special salad is highly popular. Ready to order?'",
                context: "Asking about ingredients",
                timeLimit: 45,
                hints: ["Does this salad contain peanuts?", "I am severely allergic to nuts."]
            }
        ],
        hell: [
            {
                id: 'rest_a1_scene_h1',
                scene: "账单有误交涉",
                prompt: "你发现结账单上多算了一瓶红酒，且原本说好的15%优惠没有打。请用英语向餐厅前台提出纠正。\nHost: 'Here is your check, sir. Hope you enjoyed your dinner.'",
                context: "Bill discrepancy negotiation",
                timeLimit: 35,
                hints: ["I believe there is a mistake...", "We didn't order this wine...", "The 15% discount is missing."]
            }
        ]
    },
    act2: {
        rookie: [
            {
                id: 'rest_a2_scene_r1',
                scene: "前台确认定位",
                prompt: "你预定了今晚7点四个人的座位，名字是Smith。请向接待员确认。\nHostess: 'Good evening, welcome. Do you have a reservation under a name?'",
                context: "Checking reservation",
                timeLimit: 60,
                hints: ["Yes, I have a reservation...", "under Smith...", "for four people at 7 PM."]
            }
        ],
        expert: [
            {
                id: 'rest_a2_scene_e1',
                scene: "商务午餐推荐",
                prompt: "你正在宴请一位重要的商务合作伙伴，请用英语向他推荐两道本地特色菜，并解释为什么推荐它们。\nPartner: 'Everything on the menu looks great, I don't know what to choose. Any ideas?'",
                context: "Business lunch recommendations",
                timeLimit: 45,
                hints: ["You should definitely try...", "It is a local specialty...", "It pairs perfectly with..."]
            },
            {
                id: 'rest_a2_scene_e2',
                scene: "请求更换安静座位",
                prompt: "你们的餐桌离音响太近，非常嘈杂，不利于商业谈话。请客气地请求服务员帮你们换到安静的包厢或角落位置。\nWaiter: 'Is this table by the speaker fine for you?'",
                context: "Asking for a quieter table",
                timeLimit: 45,
                hints: ["It's a bit too loud here...", "We have some business to discuss...", "Could we move to a quieter booth?"]
            }
        ],
        hell: [
            {
                id: 'rest_a2_scene_h1',
                scene: "宴会超支危机应对",
                prompt: "宴会消费超出了公司审批预算。请说服餐厅经理在保持服务规格的同时，给你们提供一个企业专享的折扣或者赠送酒水，以便于未来长期合作。\nManager: 'We have provided our best premium ingredients for your corporate event, sir.'",
                context: "Corporate pricing negotiation",
                timeLimit: 35,
                hints: ["Our budget is strictly capped...", "We hope to build a long-term partnership...", "Could you offer a corporate discount?"]
            }
        ]
    },
    act3: {
        rookie: [
            {
                id: 'rest_a3_scene_r1',
                scene: "举杯致辞",
                prompt: "晚宴上，作为主办方，请用英语向大家说两句祝酒词，感谢大家参加这次合作签约宴会。\nHost: 'Everyone has filled their glasses. Would you like to say a few words?'",
                context: "Toast speech",
                timeLimit: 60,
                hints: ["I'd like to thank everyone...", "to celebrate our successful signing...", "Let's raise a glass. Cheers!"]
            }
        ],
        expert: [
            {
                id: 'rest_a3_scene_e1',
                scene: "外宾定制晚宴要求",
                prompt: "向主厨助理提出明天国宾团的晚宴要求：不能有任何猪肉，必须有清真和纯素食选项，且需要英文菜单。\nChef Assistant: 'I am drafting the VIP banquet menu for tomorrow, any specific dietary instructions?'",
                context: "VIP dietary customization",
                timeLimit: 45,
                hints: ["No pork is allowed...", "We need certified Halal and vegan options...", "Please provide English descriptions."]
            }
        ],
        hell: [
            {
                id: 'rest_a3_scene_h1',
                scene: "国宴突发危机处理",
                prompt: "签约晚宴即将开始，你发现主宾的素食餐由于厨房疏忽没有准备。请私下以极快的速度、严厉但理智的语气要求餐厅总监在十分钟内特制一份精美素食，并不能让主宾察觉出纰漏。\nDirector: 'The appetizers are being served now. Is everything going well at the main table?'",
                context: "Urgent catering crisis management",
                timeLimit: 35,
                hints: ["There is a critical error...", "The vegetarian main course is missing...", "This must be prepared within 10 minutes silently."]
            }
        ]
    }
};
