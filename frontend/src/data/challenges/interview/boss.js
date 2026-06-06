/**
 * 面试场景 - Boss 对话剧本
 */
export const BOSS = {
    act1: {
        name: '技术部门主管',
        icon: '💻',
        scene: '技术终审面试',
        rounds: [
            {
                round: 1,
                bossLine: "Welcome to the final technical round. I've seen your resume, but I'd like to hear in your own words: what is the most complex technical challenge you've solved recently?",
                hints: "描述最近解决的一个复杂技术问题，说明问题背景、解决方案以及最终取得的量化成果。",
                expectedTopics: ["complex", "challenge", "solved", "recently", "problem", "solution", "result"]
            },
            {
                round: 2,
                bossLine: "That sounds challenging. How did you ensure the scalability and performance of your solution under heavy user traffic?",
                hints: "用英语解释性能优化策略（如：缓存 caching、负载均衡 load balancing、数据库索引 database indexing 等）。",
                expectedTopics: ["scalability", "performance", "caching", "database", "load balancing", "traffic"]
            },
            {
                round: 3,
                bossLine: "Good engineering decisions. Now, let's talk about teamwork. How do you handle code reviews when a senior colleague disagrees with your approach?",
                hints: "表达团队合作态度：持开放心态，基于客观数据和测试结果进行友好沟通，达成团队最优共识。",
                expectedTopics: ["code review", "disagree", "open-minded", "discussion", "data", "test", "compromise"]
            },
            {
                round: 4,
                bossLine: "Collaborative mindset is crucial here. Last question: technology changes fast. How do you keep your skills up-to-date in this rapidly evolving field?",
                hints: "分享学习渠道：阅读技术博客/文档（technical blogs/docs）、参加开源社区（open-source communities）、做个人练手项目（side projects）。",
                expectedTopics: ["learn", "keep updated", "blogs", "docs", "open-source", "side projects"]
            }
        ]
    },
    act2: {
        name: '严苛的HR总监',
        icon: '👩‍💼',
        scene: '行为与文化契合度面试',
        rounds: [
            {
                round: 1,
                bossLine: "We look for people who fit our high-pressure culture. Tell me about a time you had to deal with an extremely tight deadline and a resource shortage. How did you deliver?",
                hints: "使用 STAR 原则描述：面临紧急交付和缺人时，如何合理规划任务优先级，利用敏捷方法按时完成核心交付。",
                expectedTopics: ["high-pressure", "tight deadline", "prioritize", "tasks", "agile", "deliver on time"]
            },
            {
                round: 2,
                bossLine: "Good. But what if the client changes the requirements at the very last minute before release? How do you manage that transition without breaking the team's morale?",
                hints: "阐述应对变更能力：保持冷静，迅速开会评估影响，与客户诚恳沟通分阶段上线计划，给团队积极的正向反馈。",
                expectedTopics: ["requirements change", "morale", "assessment", "client communication", "phased release", "support"]
            },
            {
                round: 3,
                bossLine: "Morale is indeed important. I see on your resume that you left your last job after only six months. That raises red flags. Why did you leave so quickly?",
                hints: "积极正面地解释：离职是为了寻找更符合个人长期技术规划的平台，并强调前公司的学习收获，绝不抱怨前公司。",
                expectedTopics: ["left job", "six months", "career growth", "platform", "positive reason", "no complaining"]
            },
            {
                round: 4,
                bossLine: "I see. Let's talk about conflict. Have you ever worked with a team member who was not pulling their weight? How did you address the situation?",
                hints: "描述解决冲突：私下礼貌沟通，询问是否有遇到个人困难，提供必要的协助，共同为团队目标负责。",
                expectedTopics: ["conflict", "pulling weight", "private conversation", "help", "support", "team goal"]
            },
            {
                round: 5,
                bossLine: "Fair enough. If we hire you, you will be working with teammates from diverse cultural and language backgrounds. How do you ensure effective cross-cultural communication?",
                hints: "跨文化沟通要点：保持耐心与同理心，积极倾听，使用清晰简单的语言，配合文档确认，尊重文化差异。",
                expectedTopics: ["diverse cultures", "communication", "active listening", "clear language", "documentation", "respect"]
            },
            {
                round: 6,
                bossLine: "Excellent. Finally, we have other candidates who have more academic credentials than you. Why should we choose you over them?",
                hints: "自信总结个人特质：理论结合实际的落地能力、极强的主动学习热情以及对该岗位方向的长期热爱与渴望。",
                expectedTopics: ["hire me", "practical experience", "fast learner", "passion", "value creation", "contribution"]
            }
        ]
    },
    act3: {
        name: '集团副总裁 (VP)',
        icon: '👑',
        scene: '高管终审面试',
        rounds: [
            {
                round: 1,
                bossLine: "Congratulations on reaching the final executive round. As a VP, I look at the big picture. How does your technical expertise align with our corporate mission of building sustainable digital solutions?",
                hints: "阐述技术与商业的结合：代码效率也是绿色低碳的一部分，通过优化系统架构降低服务器能耗，这直接契合公司可持续发展的使命。",
                expectedTopics: ["big picture", "align", "mission", "sustainability", "architecture optimization", "efficiency"]
            },
            {
                round: 2,
                bossLine: "That's an insightful connection. Now, if you are given a project with high strategic value but high probability of failure, how do you decide whether to proceed?",
                hints: "风险决策：进行全面的可行性与风险收益比评估，设计 MVP（最小可行产品）进行低成本快速试错验证，做好兜底预案。",
                expectedTopics: ["strategic value", "risk assessment", "MVP", "fast failure", "mitigate risks", "decision"]
            },
            {
                round: 3,
                bossLine: "Accepting calculated risks is a leadership quality. How do you mentor junior team members to build a strong pipeline of engineering talent?",
                hints: "人才培养：实行导师制（buddy system），开展定期技术分享（tech talks），给予建设性反馈，营造宽容失败的创新学习氛围。",
                expectedTopics: ["mentor", "junior staff", "buddy system", "knowledge sharing", "feedback", "growth"]
            },
            {
                round: 4,
                bossLine: "Developing talent is indeed crucial. Let's talk about resource constraints. If the finance department cuts your project budget by thirty percent mid-way, what is your contingency plan?",
                hints: "资源限制应对：重新梳理积压任务（backlog），砍掉低优先级非核心功能，确保核心 MVP 正常交付，同时提升团队内部开发效率。",
                expectedTopics: ["budget cut", "contingency plan", "re-prioritize", "core features", "MVP", "efficiency"]
            },
            {
                round: 5,
                bossLine: "Pragmatic planning. How do you balance speed-to-market with code quality and technical debt in a fast-paced business environment?",
                hints: "平衡速度与债务：先快速上线 MVP 验证市场，同时在计划中留出 20% 的时间专门用于代码重构和偿还技术债务。",
                expectedTopics: ["balance", "speed-to-market", "code quality", "technical debt", "refactoring", "MVP"]
            },
            {
                round: 6,
                bossLine: "A sensible compromise. Where do you see our industry heading in the next five years, and how will your role help us stay ahead of the curve?",
                hints: "行业前瞻：未来五年 AI 和云计算将深度融合，我将持续关注并引入前沿技术，保持技术架构的敏捷性，赋能公司业务领先。",
                expectedTopics: ["next five years", "industry trend", "AI integration", "cloud computing", "stay ahead", "agile architecture"]
            },
            {
                round: 7,
                bossLine: "I like your foresight. However, strategic planning takes time and money. If the board demands short-term profitability over long-term vision, how do you handle the pressure?",
                hints: "高管沟通：通过数据展示短期胜利与长期利益的平衡，设计能带来快速见效（quick wins）的中期里程碑，以此建立信任。",
                expectedTopics: ["short-term", "long-term", "board pressure", "balance", "quick wins", "data-driven", "trust"]
            },
            {
                round: 8,
                bossLine: "You have demonstrated strong leadership and business acumen. This has been a very impressive conversation. Do you have any final message for me?",
                hints: "诚恳表达决心：非常感谢这次机会，我由衷希望加入贵司，用我的技能和商业远见与大家一起创造长期价值。",
                expectedTopics: ["thank you", "opportunity", "join company", "create value", "long-term success", "look forward"]
            }
        ]
    }
};
