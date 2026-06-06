/**
 * 会议场景 - 场景对话题库
 */
export const SCENES = {
    act1: {
        rookie: [
            {
                id: 'meet_a1_scene_r1',
                scene: "会议签到发言",
                prompt: "向大家打招呼并表示感谢，然后简要声明你今天参会是为了讨论项目预算。\nChairman: 'Let's welcome everyone. Shall we start?'",
                context: "Beginning of a meeting",
                timeLimit: 60,
                hints: ["Good morning everyone...", "Thank you for having me...", "I'm here to discuss the project budget..."]
            },
            {
                id: 'meet_a1_scene_r2',
                scene: "打断发言提问",
                prompt: "在会议中，你没有听清某位同事关于截止日期的陈述，请用英语礼貌地打断并要求他重复一遍。\nColleague: 'So the absolute deadline for the asset release will be...'",
                context: "Clarification request",
                timeLimit: 60,
                hints: ["Excuse me, sorry for interrupting...", "Could you please repeat...", "I didn't catch the deadline"]
            }
        ],
        expert: [
            {
                id: 'meet_a1_scene_e1',
                scene: "提出不同意见",
                prompt: "你的同事提议将所有预算花在线上广告，你认为应该留出一部分做线下活动。请用英语专业地提出你的看法。\nColleague: 'I strongly recommend allocating our entire budget to online social ads.'",
                context: "Expressing disagreement",
                timeLimit: 45,
                hints: ["I see your point, but...", "From my perspective...", "We should allocate a portion of the budget to offline events..."]
            },
            {
                id: 'meet_a1_scene_e2',
                scene: "会议总结发言",
                prompt: "作为会议主持人，用英语总结今天达成的两个核心决定（确定了供应商，调整了时间表），并宣布散会。\nColleague: 'We've covered all items. What's next?'",
                context: "Wrapping up a meeting",
                timeLimit: 45,
                hints: ["To sum up today's meeting...", "We decided on the vendor...", "adjusted the timeline...", "Let's call it a day"]
            }
        ],
        hell: [
            {
                id: 'meet_a1_scene_h1',
                scene: "项目延误危机解释",
                prompt: "你的项目严重超期。在会议上面对管理层的严厉质疑，请用英语客观陈述延误的客观原因（技术瓶颈、人手不足），并给出具体的弥补措施以挽回信任。\nVP: 'Your team is two weeks behind schedule. What is going on here?'",
                context: "Explaining project delays",
                timeLimit: 35,
                hints: ["I apologize for the delay...", "We encountered unexpected technical bottlenecks...", "To make up for lost time, we will..."]
            }
        ]
    },
    act2: {
        rookie: [
            {
                id: 'meet_a2_scene_r1',
                scene: "邀请同事发表看法",
                prompt: "你想听听技术主管 Tom 对这个产品方案的看法，请用英语客气地邀请他发言。\nManager: 'We need feedback from the engineering team.'",
                context: "Facilitating discussion",
                timeLimit: 60,
                hints: ["Tom, what's your take on this?", "Could you share your thoughts...", "from a technical perspective?"]
            }
        ],
        expert: [
            {
                id: 'meet_a2_scene_e1',
                scene: "汇报季度KPI业绩",
                prompt: "向高管团队用英语简报你部门上季度的业绩：营收增长了15%，用户留存率提高了5%，并感谢团队的努力。\nDirector: 'Let's hear the performance update from the operations team.'",
                context: "Reporting performance KPI",
                timeLimit: 45,
                hints: ["I am pleased to report that...", "our revenue increased by 15%...", "user retention rate grew by 5%...", "thanks to my team's effort"]
            },
            {
                id: 'meet_a2_scene_e2',
                scene: "协商会议分歧",
                prompt: "两个部门主管在会议上由于职责归属发生激烈争吵。请用英语作为协调人劝阻，并提议线下单独开会厘清权责。\nColleague A: 'This is clearly operations' fault!' Colleague B: 'No, marketing failed to deliver!'",
                context: "Mediating team conflict",
                timeLimit: 45,
                hints: ["Let's focus on solving the issue, not placing blame...", "I suggest we take this offline...", "schedule a separate meeting to clarify..."]
            }
        ],
        hell: [
            {
                id: 'meet_a2_scene_h1',
                scene: "裁员重组决策宣贯",
                prompt: "在管理层会议上，你需要宣布一项由于公司战略调整而导致的业务线合并及20%的人员优化政策。请用极其职业、理智且体现人文关怀的英语陈述这一决定。\nManager: 'How will the department adapt to the corporate cost-cutting strategy?'",
                context: "Announcing restructuring decisions",
                timeLimit: 35,
                hints: ["After careful strategic evaluation...", "we decided to consolidate our business lines...", "optimize our personnel by 20%...", "provide full severance packages"]
            }
        ]
    },
    act3: {
        rookie: [
            {
                id: 'meet_a3_scene_r1',
                scene: "签约仪式致辞",
                prompt: "在战略合作会议开始前，用英语致开场白，表示很高兴和对方公司达成合作伙伴关系。\nPartner CEO: 'It's a historic day for both companies.'",
                context: "Opening partnership speech",
                timeLimit: 60,
                hints: ["It is a great honor...", "establish a strategic partnership...", "believe this will lead to mutual success"]
            }
        ],
        expert: [
            {
                id: 'meet_a3_scene_e1',
                scene: "商务排他性条款协商",
                prompt: "在签约谈判中，对方要求排他性条款，你认为这限制了你们的发展。请用英语有分寸地拒绝，并提出以增加采购底价作为妥协条件。\nNegotiator: 'We insist on a three-year exclusivity clause to proceed with this deal.'",
                context: "Contract term negotiation",
                timeLimit: 45,
                hints: ["Exclusivity might limit our agility...", "However, we could compromise by...", "increasing the minimum order value..."]
            }
        ],
        hell: [
            {
                id: 'meet_a3_scene_h1',
                scene: "跨国合资公司股权争议",
                prompt: "在合资成立大会上，中外双方由于持股比例（51% vs 49%）的主导权发生僵持。请用英语发表一段极具地道外交辞令、强硬但不失风度的发言，说服外方让出绝对控制权，并在董事会席位上给予补偿。\nPartner: 'A 50-50 split is the only way to guarantee mutual trust and equality.'",
                context: "Equity stake dispute resolution",
                timeLimit: 35,
                hints: ["To ensure operational speed in China...", "having a single controlling shareholder is vital...", "willing to compensate with board seats..."]
            }
        ]
    }
};
