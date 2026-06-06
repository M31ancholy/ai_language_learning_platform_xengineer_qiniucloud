/**
 * 会议场景 - Boss 对话剧本
 */
export const BOSS = {
    act1: {
        name: '项目审查委员会',
        icon: '👥',
        scene: '季度项目审查会议',
        rounds: [
            {
                round: 1,
                bossLine: "Welcome to the Quarterly Project Review. First, please brief the committee on the current milestones achieved by your team.",
                hints: "简要汇报上季度团队达成的里程碑（例如：按时上线了测试版本，修复了关键 bug）。",
                expectedTopics: ["milestone", "achieved", "launch", "beta version", "fixed", "bugs", "schedule"]
            },
            {
                round: 2,
                bossLine: "The milestone report is positive. However, looking at the budget, you've spent 85% of your funding with only half the project completed. Why this discrepancy?",
                hints: "合理解释预算超支原因（例如：遇到了突发的底层架构重构，采购了第三方高级安全服务）。",
                expectedTopics: ["budget", "spent", "architecture", "refactoring", "unexpected", "third-party", "security"]
            },
            {
                round: 3,
                bossLine: "Technical challenges are understandable, but you should have raised a flag earlier. What is your optimization plan for the remaining phases?",
                hints: "提出后续资源省钱优化计划（例如：精简非必要功能开发，提高自动化测试占比以降低人工调试成本）。",
                expectedTopics: ["plan", "optimize", "reduce costs", "automated testing", "streamline", "phases"]
            },
            {
                round: 4,
                bossLine: "We will monitor the next phase closely. Thank you for your explanation. Please submit the detailed recovery plan by tomorrow morning.",
                hints: "礼貌接受要求，确认会在明天早上前把完整的预算恢复计划和新进度表发到委员会邮箱。",
                expectedTopics: ["acknowledge", "submit", "tomorrow morning", "detailed plan", "schedule", "email"]
            }
        ]
    },
    act2: {
        name: '固执的合作方高管',
        icon: '👨‍💼',
        scene: '项目联合推进会议',
        rounds: [
            {
                round: 1,
                bossLine: "We've been reviewing your product integration proposal. Frankly, we don't think it aligns with our security guidelines. Why should we risk using your platform?",
                hints: "说服对方我们平台拥有最高安全标准：符合国际隐私合规要求，且支持端到端数据加密，可以完全消除安全顾虑。",
                expectedTopics: ["proposal", "security", "encryption", "compliance", "privacy", "protection", "risk-free"]
            },
            {
                round: 2,
                bossLine: "Encryption is fine, but it might slow down our database response times. Our system requires real-time transaction processing.",
                hints: "专业论证：我们的加密算法经过高度优化，延迟控制在极低的毫秒级（low latency），对实时交易性能毫无影响。",
                expectedTopics: ["latency", "performance", "real-time", "transaction", "optimized", "milliseconds"]
            },
            {
                round: 3,
                bossLine: "Well, we will need our technical team to audit your claims. Aside from security, who will bear the integration costs? We feel your pricing is too high.",
                hints: "提出双赢方案：我们可以共同分担初期部署的研发成本，且我们提供首年免费维护以降低贵司的商务风险。",
                expectedTopics: ["audit", "pricing", "integration cost", "shared cost", "free maintenance", "reduce risk", "win-win"]
            },
            {
                round: 4,
                bossLine: "Sharing the integration costs is a fair proposal. However, my team's bandwidth is extremely limited next month. Who will lead the day-to-day coordination?",
                hints: "表明我方会指派一名专属的项目经理（project manager）主导日常推进，只需要贵司提供技术接口文档配合即可。",
                expectedTopics: ["dedicated PM", "coordination", "project manager", "interface", "documentation", "support"]
            },
            {
                round: 5,
                bossLine: "A dedicated project manager would resolve our resource concerns. But what if we face technical bottlenecks during integration? Do you have SLA support guarantees?",
                hints: "说明技术保障：我们提供 7x24 小时的紧急技术支持，并在服务等级协议（SLA）中承诺 1 小时内响应并解决问题。",
                expectedTopics: ["technical support", "SLA", "guarantee", "24/7", "response time", "one hour"]
            },
            {
                round: 6,
                bossLine: "Excellent. The SLA terms sound reliable. Let's draft the agreement and finalize the project launch timeline. Who will be your authorized signer?",
                hints: "确认我方授权签字人为我们部门的总监，并约定在下周一下午共同召开视频签约会议。",
                expectedTopics: ["authorized signer", "director", "draft agreement", "signing ceremony", "next Monday", "meeting"]
            }
        ]
    },
    act3: {
        name: '董事会大股东',
        icon: '🧐',
        scene: '年度战略股东大会',
        rounds: [
            {
                round: 1,
                bossLine: "As the lead investor, I want to address the sluggish growth in our international expansion. Your execution team has not met the global sales target this year. Why?",
                hints: "合理解释业绩落后：今年全球供应链动荡以及汇率大幅波动影响了海外交付，但这促使我们建立本地化供应链，打下了长期基础。",
                expectedTopics: ["performance", "global supply chain", "exchange rate", "sluggish growth", "local supply", "long-term foundation"]
            },
            {
                round: 2,
                bossLine: "Macroeconomics is an easy excuse. But look at our competitor, they grew by twenty percent in the same market. What are they doing that you aren't?",
                hints: "分析竞争优势差异：竞争对手打价格战损害了利润，而我们专注高净值客户（high net-worth clients）建立品牌壁垒，毛利率保持了行业第一。",
                expectedTopics: ["competitor", "price war", "profit margin", "high net-worth", "brand loyalty", "healthy growth"]
            },
            {
                round: 3,
                bossLine: "Brand loyalty doesn't pay short-term dividends. The board is demanding immediate profitability. Are you prepared to cut operational costs by shutting down underperforming offices?",
                hints: "战略平衡：同意关闭低效分部进行精简，但建议将节省的资金投入高增长的研发项目（R&D），以此确保公司未来的增长曲线。",
                expectedTopics: ["cost cutting", "shut down", "underperforming", "R&D", "invest", "future growth"]
            },
            {
                round: 4,
                bossLine: "A selective consolidation makes sense. But cutting R&D is often necessary in dry spells. Why should we invest more in technology when sales are down?",
                hints: "说服大股东：技术领先是我们的核心壁垒，一旦削减研发，我们将丧失与竞品的核心差异化优势，沦为平庸的平价工厂。",
                expectedTopics: ["technology", "R&D", "core barrier", "differentiation", "competitors", "investment"]
            },
            {
                round: 5,
                bossLine: "Differentiation is key, I grant you that. But your tech team has been working on the new cloud platform for eighteen months without a release. Where is the ROI?",
                hints: "用数据说话：新平台已经进入闭门测试阶段，预计下个月正式商用，已有五家跨国大客户排队试用，首年预期带来百万级营收。",
                expectedTopics: ["new cloud", "ROI", "commercial release", "beta test", "pre-ordered", "revenue", "next month"]
            },
            {
                round: 6,
                bossLine: "Five multinational clients is a promising start. But what if we face local compliance and legal barriers in Europe? GDPR compliance alone could cost us millions.",
                hints: "打消合规顾虑：新平台设计之初就深度贯彻了 GDPR 隐私对齐架构，已通过外部独立审计，合规风险极低且成本可控。",
                expectedTopics: ["compliance", "GDPR", "privacy by design", "independent audit", "legal barrier", "low risk"]
            },
            {
                round: 7,
                bossLine: "It seems you have anticipated the regulatory hurdles. That is reassuring. But I am still concerned about the leadership team. Does the current management have the capability to execute this complex transition?",
                hints: "力挺管理团队：我们引进了多名具有跨国科技企业背景的专家，中高层流失率低于 5%，团队执行力达到前所未有的高度。",
                expectedTopics: ["management capability", "leadership", "experts", "execution", "low turnover", "experience"]
            },
            {
                round: 8,
                bossLine: "Your defense is robust. You've shown that you understand both technology and business. I will support your strategic budget at the next board vote. What are your final expectations from the shareholders?",
                hints: "总结陈词：感谢大股东的信任，我们期望股东能保持对长期战略的耐心和资源支持，我们将以数倍的商业回报证明您的选择是完全正确的。",
                expectedTopics: ["thank you", "support", "shareholders", "long-term vision", "patience", "ROI", "commercial returns"]
            }
        ]
    }
};
