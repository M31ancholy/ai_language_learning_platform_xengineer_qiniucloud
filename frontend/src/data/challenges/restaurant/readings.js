/**
 * 点餐场景 - 朗读题库
 */
export const READINGS = {
    act1: {
        rookie: [
            {
                id: 'rest_a1_read_r1',
                text: "Hello, I would like to order a cheese burger and a glass of orange juice, please.",
                topic: "简单点餐",
                timeLimit: 60,
                tips: ["注意 burger 的重音在首音节", "orange juice 连读"]
            },
            {
                id: 'rest_a1_read_r2',
                text: "Excuse me, where is the restroom? And could we get some napkins, please?",
                topic: "寻物求助",
                timeLimit: 60,
                tips: ["Excuse me 升调", "napkins 复数发音"]
            },
            {
                id: 'rest_a1_read_r3',
                text: "Could I have the bill, please? I will pay by credit card.",
                topic: "结账付款",
                timeLimit: 60,
                tips: ["bill 和 credit card 连贯"]
            }
        ],
        expert: [
            {
                id: 'rest_a1_read_e1',
                text: "Excuse me, I ordered a medium-rare sirloin steak, but this one is completely well-done. Could you please take it back?",
                topic: "菜品抱怨",
                timeLimit: 45,
                tips: ["medium-rare 连词符号处略有停顿", "well-done 清晰发音"]
            },
            {
                id: 'rest_a1_read_e2',
                text: "Are there any vegetarian options on your menu? My friend is allergic to gluten, so we need to be very careful.",
                topic: "特殊饮食要求",
                timeLimit: 45,
                tips: ["allergic to 连读", "gluten 的发音"]
            }
        ],
        hell: [
            {
                id: 'rest_a1_read_h1',
                text: "I must express my dissatisfaction. Not only was the soup served cold, but the service was also exceptionally slow tonight. I would like to speak to the manager.",
                topic: "正式投诉",
                timeLimit: 30,
                tips: ["dissatisfaction 和 exceptionally 重音要准", "以愤怒但不失礼貌的语气读出"]
            }
        ]
    },
    act2: {
        rookie: [
            {
                id: 'rest_a2_read_r1',
                text: "We have a table reserved for four under the name of Green Company.",
                topic: "商务订位",
                timeLimit: 60,
                tips: ["reserved for 连读"]
            },
            {
                id: 'rest_a2_read_r2',
                text: "Does this price include the service charge? We would like to pay separately.",
                topic: "账单询问",
                timeLimit: 60,
                tips: ["service charge 的 'ch' 音要清晰"]
            }
        ],
        expert: [
            {
                id: 'rest_a2_read_e1',
                text: "We are hosting an executive dinner tonight. We require a quiet private booth and a sommelier to recommend matching wines for our three-course meal.",
                topic: "商务宴请",
                timeLimit: 45,
                tips: ["sommelier (侍酒师) 发音为 /sɒməlˈjeɪ/", "three-course 停顿"]
            },
            {
                id: 'rest_a2_read_e2',
                text: "For the main course, I highly recommend the roasted sea bass paired with a glass of dry white wine to complement the delicate flavors.",
                topic: "点餐建议",
                timeLimit: 45,
                tips: ["com-ple-ment 重音在首", "delicate 发音要轻"]
            }
        ],
        hell: [
            {
                id: 'rest_a2_read_h1',
                text: "We appreciate the accommodation for our corporate event, but the discrepancies between the invoice and the pre-approved catering quotation must be resolved before payment.",
                topic: "账单争议",
                timeLimit: 35,
                tips: ["discrepancies (差异) 发音为 /dɪsˈkrepənsiz/", "corporate event 连读"]
            }
        ]
    },
    act3: {
        rookie: [
            {
                id: 'rest_a3_read_r1',
                text: "We look forward to signing this partnership over a nice dinner tonight.",
                topic: "宴前寒暄",
                timeLimit: 60,
                tips: ["partnership 的 'p' 发音清晰"]
            }
        ],
        expert: [
            {
                id: 'rest_a3_read_e1',
                text: "To celebrate our successful joint venture, let us raise a glass to a fruitful and long-lasting partnership. Cheers!",
                topic: "席间祝酒",
                timeLimit: 45,
                tips: ["fruitful / long-lasting 情感充沛", "Cheers 发音饱满"]
            },
            {
                id: 'rest_a3_read_e2',
                text: "Could you arrange a premium banquet menu for tomorrow's VIP delegation, including organic ingredients and local delicacies?",
                topic: "高端接待",
                timeLimit: 45,
                tips: ["banquet (宴会) 发音为 /ˈbæŋkwɪt/", "delegation 发音清晰"]
            }
        ],
        hell: [
            {
                id: 'rest_a3_read_h1',
                text: "Given the high profile of our international clientele, the hospitality and culinary standards at this gala dinner must be absolutely impeccable to ensure our brand reputation.",
                topic: "高标国宴",
                timeLimit: 35,
                tips: ["culinary (烹饪的) 发音为 /ˈkʌlɪnəri/", "impeccable (无可挑剔的) 发音为 /ɪmˈpekəbl/"]
            }
        ]
    }
};
