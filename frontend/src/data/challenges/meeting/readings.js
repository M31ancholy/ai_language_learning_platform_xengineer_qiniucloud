/**
 * 会议场景 - 朗读题库
 */
export const READINGS = {
    act1: {
        rookie: [
            {
                id: 'meet_a1_read_r1',
                text: "Good morning, everyone. Let us start today's meeting. First, let us look at the agenda.",
                topic: "会议开场",
                timeLimit: 60,
                tips: ["agenda 重音在第二个音节", "Good morning 连读"]
            },
            {
                id: 'meet_a1_read_r2',
                text: "Does anyone have any questions about the minutes of our last meeting?",
                topic: "询问意见",
                timeLimit: 60,
                tips: ["minutes of 连读", "questions 复数清晰"]
            },
            {
                id: 'meet_a1_read_r3',
                text: "Let us move on to the next topic on the list.",
                topic: "切换议题",
                timeLimit: 60,
                tips: ["move on to 连读"]
            }
        ],
        expert: [
            {
                id: 'meet_a1_read_e1',
                text: "Based on our quarterly sales analysis, we need to adjust our marketing strategy for the European region.",
                topic: "销售分析",
                timeLimit: 45,
                tips: ["quarterly sales 连词", "strategy 发音清晰"]
            },
            {
                id: 'meet_a1_read_e2',
                text: "I would like to point out that the development schedule is falling behind due to unforeseen technical difficulties.",
                topic: "进度说明",
                timeLimit: 45,
                tips: ["point out 连读", "unforeseen (不可预见的) 发音为 /ˌʌnfɔːˈsiːn/"]
            }
        ],
        hell: [
            {
                id: 'meet_a1_read_h1',
                text: "The main objective of this meeting is to brainstorm feasible solutions to mitigate the negative impacts of the supply chain disruptions.",
                topic: "会议目的",
                timeLimit: 30,
                tips: ["mitigate (减轻) 发音为 /ˈmɪtɪɡeɪt/", "feasible (可行的) 发音为 /ˈfiːzəbl/"]
            }
        ]
    },
    act2: {
        rookie: [
            {
                id: 'meet_a2_read_r1',
                text: "Thank you for sharing your thoughts on this matter. Let us hear from the other team members.",
                topic: "鼓励发言",
                timeLimit: 60,
                tips: ["sharing your 连音"]
            },
            {
                id: 'meet_a2_read_r2',
                text: "We need to make a decision by the end of this week to stay on track.",
                topic: "促成决策",
                timeLimit: 60,
                tips: ["stay on track 连音"]
            }
        ],
        expert: [
            {
                id: 'meet_a2_read_e1',
                text: "Could you please elaborate on the budget requirements and specify the resource allocation for the upcoming phase?",
                topic: "预算阐述",
                timeLimit: 45,
                tips: ["elaborate /ɪˈlæbəreɪt/ 重音在第二音节", "allocation 发音清晰"]
            },
            {
                id: 'meet_a2_read_e2',
                text: "From my perspective, focusing on customer retention is far more critical than acquiring new users at this stage.",
                topic: "观点陈述",
                timeLimit: 45,
                tips: ["perspective /pəˈspektɪv/ 发音", "retention /rɪˈtenʃn/ 发音"]
            }
        ],
        hell: [
            {
                id: 'meet_a2_read_h1',
                text: "To optimize our operational efficiency, we must integrate our legacy databases into a unified cloud infrastructure, despite the initial capital expenditure.",
                topic: "架构整合",
                timeLimit: 35,
                tips: ["operational efficiency 连贯", "expenditure (支出) 发音为 /ɪkˈspendɪtʃə/"]
            }
        ]
    },
    act3: {
        rookie: [
            {
                id: 'meet_a3_read_r1',
                text: "We are gathered here today to discuss the details of our strategic partnership.",
                topic: "高端协商",
                timeLimit: 60,
                tips: ["strategic /strəˈtiːdʒɪk/ 发音"]
            }
        ],
        expert: [
            {
                id: 'meet_a3_read_e1',
                text: "I propose that we establish a joint steering committee to oversee the integration process and resolve any disputes promptly.",
                topic: "机制建设",
                timeLimit: 45,
                tips: ["committee (委员会) 发音为 /kəˈmɪti/", "promptly 发音清晰"]
            },
            {
                id: 'meet_a3_read_e2',
                text: "We need to align our business objectives with the latest regulatory framework to avoid compliance issues.",
                topic: "合规对齐",
                timeLimit: 45,
                tips: ["regulatory /ˈreɡjələtəri/ 发音", "compliance /kəmˈplaɪəns/ 发音"]
            }
        ],
        hell: [
            {
                id: 'meet_a3_read_h1',
                text: "The executive board unanimously approved the proposed merger, contingent upon a comprehensive due diligence review and legal verification of all assets.",
                topic: "并购决策",
                timeLimit: 35,
                tips: ["unanimously (一致地) 发音为 /juˈnænɪməsli/", "due diligence (尽职调查) 发音为 /ˌdjuː ˈdɪlɪdʒəns/"]
            }
        ]
    }
};
