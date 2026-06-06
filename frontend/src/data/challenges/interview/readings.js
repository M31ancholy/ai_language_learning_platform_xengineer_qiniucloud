/**
 * 面试场景 - 朗读题库
 */
export const READINGS = {
    act1: {
        rookie: [
            {
                id: 'inter_a1_read_r1',
                text: "Good morning. Thank you for inviting me to this interview. I am excited to discuss my background.",
                topic: "开场寒暄",
                timeLimit: 60,
                tips: ["excited 的重音在第二个音节", "thank you 连读"]
            },
            {
                id: 'inter_a1_read_r2',
                text: "I graduated from university with a bachelor's degree in computer science.",
                topic: "学历介绍",
                timeLimit: 60,
                tips: ["graduated from 连读", "bachelor's degree 连读"]
            },
            {
                id: 'inter_a1_read_r3',
                text: "I am a quick learner and a detail-oriented team player.",
                topic: "自我评价",
                timeLimit: 60,
                tips: ["detail-oriented 连读", "team player 连读"]
            }
        ],
        expert: [
            {
                id: 'inter_a1_read_e1',
                text: "Over the past three years, I have successfully managed several projects, ensuring timely delivery within budget constraints.",
                topic: "工作经验",
                timeLimit: 45,
                tips: ["successfully managed 连音", "constraints 发音饱满"]
            },
            {
                id: 'inter_a1_read_e2',
                text: "My primary strength is analytical thinking, which enables me to solve complex technical issues systematically.",
                topic: "优势陈述",
                timeLimit: 45,
                tips: ["analytical /ˌænəˈlɪtɪkl/ 重音在第三音节", "systematically 发音清晰"]
            }
        ],
        hell: [
            {
                id: 'inter_a1_read_h1',
                text: "In my previous role, I spearheaded the implementation of a microservices architecture, which subsequently enhanced system scalability by forty percent and reduced operating costs.",
                topic: "重大成就",
                timeLimit: 30,
                tips: ["spearheaded (带头/先锋) 发音为 /ˈspɪəhedɪd/", "scalability 发音为 /ˌskeɪləˈbɪləti/"]
            }
        ]
    },
    act2: {
        rookie: [
            {
                id: 'inter_a2_read_r1',
                text: "I have experience working in cross-functional teams to deliver software solutions.",
                topic: "团队协作",
                timeLimit: 60,
                tips: ["cross-functional 的 'f' 音读准"]
            },
            {
                id: 'inter_a2_read_r2',
                text: "I am looking for a challenging role where I can grow my professional skills.",
                topic: "求职意向",
                timeLimit: 60,
                tips: ["professional skills 连读"]
            }
        ],
        expert: [
            {
                id: 'inter_a2_read_e1',
                text: "When conflicts arise within the team, I facilitate open communication to identify the root cause and negotiate a win-win resolution.",
                topic: "冲突管理",
                timeLimit: 45,
                tips: ["facilitate /fəˈsɪlɪteɪt/ 重音在第二音节", "root cause 连读"]
            },
            {
                id: 'inter_a2_read_e2',
                text: "I prioritize my tasks using a time-management matrix, which allows me to focus on high-impact objectives first.",
                topic: "工作优先级",
                timeLimit: 45,
                tips: ["prioritize /praɪˈɒrətaɪz/ 发音清晰", "high-impact 连贯"]
            }
        ],
        hell: [
            {
                id: 'inter_a2_read_h1',
                text: "During a major system outage, I remained calm under pressure, organized a temporary task force, and successfully restored services within an unprecedented recovery time objective.",
                topic: "危机处理",
                timeLimit: 35,
                tips: ["outage (停机/断电) 发音为 /ˈaʊtɪdʒ/", "unprecedented (史无前例的) 发音为 /ʌnˈpresɪdentɪd/"]
            }
        ]
    },
    act3: {
        rookie: [
            {
                id: 'inter_a3_read_r1',
                text: "I want to join this company because of its strong innovation and corporate culture.",
                topic: "企业文化",
                timeLimit: 60,
                tips: ["innovation 发音清晰"]
            }
        ],
        expert: [
            {
                id: 'inter_a3_read_e1',
                text: "I believe my strategic vision aligns perfectly with your company's mission to revolutionize the digital workspace globally.",
                topic: "战略对齐",
                timeLimit: 45,
                tips: ["strategic /strəˈtiːdʒɪk/ 重音在第二音节", "revolutionize 发音饱满"]
            },
            {
                id: 'inter_a3_read_e2',
                text: "Could you tell me more about the company's long-term growth plans and how this role contributes to them?",
                topic: "反问面试官",
                timeLimit: 45,
                tips: ["long-term growth 连读", "contributes to 连读"]
            }
        ],
        hell: [
            {
                id: 'inter_a3_read_h1',
                text: "I envision myself contributing to the organization's paradigm shift toward sustainable technology by leveraging my extensive expertise in cloud computing and data analytics.",
                topic: "远景规划",
                timeLimit: 35,
                tips: ["envision /ɪnˈvɪʒn/ 发音", "paradigm shift (范式转变) 发音为 /ˈpærədaɪm ʃɪft/"]
            }
        ]
    }
};
