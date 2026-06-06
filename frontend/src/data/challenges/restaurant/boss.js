/**
 * 点餐场景 - Boss 对话剧本
 */
export const BOSS = {
    act1: {
        name: '美食审判者',
        icon: '🍽️',
        scene: '餐厅点餐',
        rounds: [
            {
                round: 1,
                bossLine: "Good evening. Welcome to the Golden Spire Restaurant. Do you have a reservation with us tonight?",
                hints: "表明自己有预订，说明姓名和人数（例如：预约名字是 Smith，共 2 人）。",
                expectedTopics: ["reservation", "book", "name", "people", "two"]
            },
            {
                round: 2,
                bossLine: "Ah, yes, Mr. Smith. Right this way. Here is your menu. What would you like to start with for your appetizers?",
                hints: "点一两样前菜，比如沙拉（salad）或浓汤（soup），表达点餐意向。",
                expectedTopics: ["appetizer", "start with", "soup", "salad", "like to have"]
            },
            {
                round: 3,
                bossLine: "Excellent choices. And for the main course, our signature dish is the roasted lamb chop, but we also have fresh salmon. What would you prefer?",
                hints: "选择主菜，比如羊排（lamb chop）或鲑鱼（salmon），并说出你想要的成熟度或搭配的酱汁。",
                expectedTopics: ["main course", "lamb chop", "salmon", "roasted", "prefer", "with"]
            },
            {
                round: 4,
                bossLine: "Wonderful. Would you like any drinks or desserts to finish your meal tonight?",
                hints: "点饮料（如红酒 red wine、矿泉水 mineral water）或甜点（如苹果派 apple pie、提拉米苏 tiramisu）来结束点餐。",
                expectedTopics: ["drink", "dessert", "wine", "water", "pie", "tiramisu", "that's all"]
            }
        ]
    },
    act2: {
        name: '商务挑剔客户',
        icon: '🤵',
        scene: '高端商务宴请',
        rounds: [
            {
                round: 1,
                bossLine: "Thank you for inviting me to this fancy restaurant. However, I must tell you that I have strict dietary restrictions. I cannot eat dairy, shellfish, or peanuts. Are you sure this place can accommodate me?",
                hints: "礼貌安抚客户，向其保证已经提前跟主厨沟通过，会特别定制无奶制品、无海鲜、无花生的精美菜单。",
                expectedTopics: ["accommodate", "dietary restrictions", "chef", "notified", "dairy-free", "nut-free"]
            },
            {
                round: 2,
                bossLine: "Alright, I'll take your word for it. Let's look at the wine list. I prefer dry red wines, preferably from Bordeaux, to go with my steak. What do you suggest we order?",
                hints: "推荐一款波尔多干红（Bordeaux dry red wine），描述其饱满的口感和与牛排的完美搭配。",
                expectedTopics: ["recommend", "Bordeaux", "red wine", "steak", "pair with", "dry"]
            },
            {
                round: 3,
                bossLine: "This wine is indeed superb. Now, tell me, how will this dinner affect the timeline of our contract signature? I hope we aren't just wasting time eating.",
                hints: "将话题委婉过渡，表示美食有助于建立信任，并表明在甜点过后我们就可以详细确认合同条款并签字。",
                expectedTopics: ["contract", "signature", "timeline", "trust", "discuss", "details", "after dinner"]
            },
            {
                round: 4,
                bossLine: "You have a good point. Good food does make negotiation smoother. I notice the steak has arrived, but it looks a bit too rare for my taste. I asked for medium.",
                hints: "迅速叫来服务员，礼貌但坚决地要求将牛排拿回厨房加热到五分熟（medium），向客户致歉。",
                expectedTopics: ["waiter", "steak", "cook", "medium", "take it back", "apologize"]
            },
            {
                round: 5,
                bossLine: "That was handled professionally. Now, I see the dessert menu. I cannot have dairy. What can I safely order here?",
                hints: "看一眼甜点单，帮客户选择水果拼盘（fruit platter）或冰沙（sorbet），确保不含任何奶制品成分。",
                expectedTopics: ["sorbet", "fruit", "dairy-free", "safe", "dessert"]
            },
            {
                round: 6,
                bossLine: "Perfect, sorbet it is. Now that the meal is concluding, let's settle the bill. I believe your company is hosting this event, correct?",
                hints: "大方表示这是我们公司的荣幸，确认账单由您来结，并感谢他今晚的赏光。",
                expectedTopics: ["our treat", "company", "bill", "host", "my pleasure", "thank you for coming"]
            }
        ]
    },
    act3: {
        name: '米其林毒舌评委',
        icon: '👨‍🍳',
        scene: '星级评定考核',
        rounds: [
            {
                round: 1,
                bossLine: "I have dined at the finest restaurants worldwide. Today, I am inspecting your restaurant for the elite star rating. Let's start with service. How do you train your staff to handle customers who complain about cold food?",
                hints: "阐述服务理念：立即致歉，收回重做，并赠送甜品致歉，确保宾客满意是唯一标准。",
                expectedTopics: ["training", "apologize", "remake", "complimentary", "guest satisfaction", "service"]
            },
            {
                round: 2,
                bossLine: "Standard answer, but execution is what matters. Now, let's discuss the culinary philosophy. What is the signature concept behind your main course?",
                hints: "阐述菜品设计概念：将本地新鲜食材与经典烹饪技术融合，创造独特风味层次（fusion of local ingredients and classic techniques）。",
                expectedTopics: ["concept", "culinary", "fusion", "local ingredients", "techniques", "signature"]
            },
            {
                round: 3,
                bossLine: "Interesting theory. But I find many fusion dishes to be a chaotic mess. Let's test your food and wine pairing. Why did you pair this specific Sauvignon Blanc with the pan-seared scallops?",
                hints: "用专业英语解释：长相思（Sauvignon Blanc）的高酸度和柑橘果香能够完美中和扇贝的肥美，并提升海鲜的鲜甜。",
                expectedTopics: ["Sauvignon Blanc", "scallops", "acidity", "citrus", "cut through", "enhance", "seafood"]
            },
            {
                round: 4,
                bossLine: "Hmm, the pairing is decent. The acidity does balance the sweetness. However, the scallop itself is slightly overcooked by about ten seconds. A fatal flaw in high culinary art. How do you justify this?",
                hints: "不狡辩，坦诚承认错误，表示会立即通知厨房加强火候把控，并重新为您制作一份完美的扇贝以示诚意。",
                expectedTopics: ["accept error", "overcooked", "improve", "kitchen control", "remake", "sincere apologies"]
            },
            {
                round: 5,
                bossLine: "Humility is a good trait for a chef. Let's see if the dessert can redeem this meal. The soufflé is collapsing. Soufflés are notoriously difficult. Why did you risk putting it on the inspection menu?",
                hints: "自信地表示：舒芙蕾代表了我们对温度和时间的极致追求，虽然难度大，但一旦完美，能带给食客无与伦比的蓬松口感体验。",
                expectedTopics: ["souffle", "challenge", "texture", "precision", "temperature", "fluffy", "experience"]
            },
            {
                round: 6,
                bossLine: "Bold, yet risky. The texture is indeed light, though the sugar level is a bit high. Now, let's talk about the supply chain. How do you guarantee the traceabilty and sustainability of your organic ingredients?",
                hints: "解释采购体系：直接与本地生态农场合作，拥有全程追溯码，确保食材百分百绿色环保且可持续。",
                expectedTopics: ["local farms", "traceability", "sustainability", "organic", "green", "direct cooperation"]
            },
            {
                round: 7,
                bossLine: "Traceability is crucial these days. I approve of your sustainable approach. But dining is also about atmosphere. The background music is a bit too modern for a classical fine dining setting. What is the logic behind this?",
                hints: "合理解释：我们希望营造“新旧碰撞”的年轻活力感，不过如果客户偏好经典乐，我们随时可以切换成古典钢琴曲。",
                expectedTopics: ["concept", "modern", "vibe", "classical", "adjust", "piano music", "customer preference"]
            },
            {
                round: 8,
                bossLine: "A flexible response. A restaurant must adapt to its clientele. Well, you have shown passion, adaptability, and decent culinary skills, despite a few technical errors. What makes you think you deserve the Star Rating?",
                hints: "诚恳而自信地总结：我们团队的激情、对品质的无妥协追求，以及不断倾听并改进的决心，让我们坚信能带给食客顶级的星级用餐体验。",
                expectedTopics: ["passion", "no compromise", "quality", "continuous improvement", "deserve", "star rating", "dining experience"]
            }
        ]
    }
};
