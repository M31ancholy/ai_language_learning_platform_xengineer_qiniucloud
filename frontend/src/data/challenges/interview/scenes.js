/**
 * 面试场景 - 场景对话题库
 */
export const SCENES = {
    act1: {
        rookie: [
            {
                id: 'inter_a1_scene_r1',
                scene: "自我介绍",
                prompt: "面试官请你做一分钟的自我介绍，请简述你的名字、专业和你的最大工作热情。\nInterviewer: 'Could you please introduce yourself briefly?'",
                context: "Opening of the interview",
                timeLimit: 60,
                hints: ["My name is...", "I graduated from...", "I am passionate about..."]
            },
            {
                id: 'inter_a1_scene_r2',
                scene: "询问薪资期望",
                prompt: "当面试官问你对薪资的期望时，请用英语礼貌地表示你更看重发展机会，但也期望能获得符合行业标准且体面的薪水。\nInterviewer: 'What are your salary expectations for this position?'",
                context: "Salary talk",
                timeLimit: 60,
                hints: ["I am open to negotiation...", "based on my experience...", "aligns with industry standards"]
            }
        ],
        expert: [
            {
                id: 'inter_a1_scene_e1',
                scene: "陈述最大优势",
                prompt: "请用英语介绍你最大的职业优势，并举出一个具体例子来支撑它（如出色的解决问题能力或高效的团队沟通）。\nInterviewer: 'What is your greatest professional strength?'",
                context: "Strength assessment",
                timeLimit: 45,
                hints: ["My greatest strength is...", "For example, in my last project...", "I managed to..."]
            },
            {
                id: 'inter_a1_scene_e2',
                scene: "谈论最弱项",
                prompt: "面试官问你的缺点是什么。请用英语巧妙地回答一个“正在改进且可以通过努力克服”的缺点（例如：以前不擅长当众演讲，但现在正在通过练习改观）。\nInterviewer: 'What do you consider to be your greatest weakness?'",
                context: "Weakness assessment",
                timeLimit: 45,
                hints: ["Sometimes I focus too much on details...", "However, I have been working on this by...", "I am improving..."]
            }
        ],
        hell: [
            {
                id: 'inter_a1_scene_h1',
                scene: "三年职业中断解释",
                prompt: "你简历上有三年的职业空白期。请用英语自信而积极地解释这段空白（例如：进行了自主创业、深造学习或处理了家庭事务，并且获得了有益的成长）。\nInterviewer: 'I noticed a three-year gap in your employment history. Can you explain that?'",
                context: "Addressing CV gaps",
                timeLimit: 35,
                hints: ["During that period, I took time to...", "I pursued a personal project...", "This experience taught me how to..."]
            }
        ]
    },
    act2: {
        rookie: [
            {
                id: 'inter_a2_scene_r1',
                scene: "描述理想工作环境",
                prompt: "用英语描述你最喜欢的工作团队氛围（例如：开放沟通、互相支持协作的环境）。\nInterviewer: 'What kind of work environment do you perform best in?'",
                context: "Culture fit checking",
                timeLimit: 60,
                hints: ["I thrive in a collaborative environment...", "where open communication is valued...", "supportive team"]
            }
        ],
        expert: [
            {
                id: 'inter_a2_scene_e1',
                scene: "STAR原则回答失败经历",
                prompt: "面试官让你描述一次工作中的失败经历。请使用 STAR 原则（情境-任务-行动-结果）用英语回答，并重点说明你从中学到了什么。\nInterviewer: 'Tell me about a time you failed or made a mistake at work.'",
                context: "Behavioral interview",
                timeLimit: 45,
                hints: ["Once, I was responsible for...", "The challenge was...", "I learned that...", "Next time, I will..."]
            },
            {
                id: 'inter_a2_scene_e2',
                scene: "处理紧急突发加班",
                prompt: "项目临近上线，突然被通知今晚必须紧急加班解决严重 Bug。你本已订好了和家人的聚餐，请用英语职业地做出回应。\nInterviewer: 'We have an urgent release bug tonight. Can you stay late to fix it?'",
                context: "Work pressure scenario",
                timeLimit: 45,
                hints: ["I understand the urgency of this bug...", "I will reschedule my personal plan...", "Let me coordinate with the team..."]
            }
        ],
        hell: [
            {
                id: 'inter_a2_scene_h1',
                scene: "直属领导指令错误冲突",
                prompt: "如果你的直属领导下达了一个明显会导致系统崩溃的错误指令，且他本人非常固执。请用英语陈述你会如何以职业、得体的方式去沟通和阻止。\nInterviewer: 'How would you handle a situation where your manager gives a wrong decision?'",
                context: "Upward management conflict",
                timeLimit: 35,
                hints: ["I would schedule a private meeting...", "present clear data and risks...", "suggest an alternative solution..."]
            }
        ]
    },
    act3: {
        rookie: [
            {
                id: 'inter_a3_scene_r1',
                scene: "向面试官提问",
                prompt: "面试接近尾声，请向面试官用英语提出一两个有深度的问题（如：团队近期的重大挑战或该职位的晋升通道）。\nInterviewer: 'That's all from my side. Do you have any questions for me?'",
                context: "Q&A session",
                timeLimit: 60,
                hints: ["What does a typical day look like...", "What is the biggest challenge...", "professional growth opportunities"]
            }
        ],
        expert: [
            {
                id: 'inter_a3_scene_e1',
                scene: "未来五年职业规划",
                prompt: "请用英语描述你未来五年的职业发展规划，以及这个职位将如何帮助你实现这一目标。\nInterviewer: 'Where do you see yourself in five years?'",
                context: "Career roadmap",
                timeLimit: 45,
                hints: ["In five years, I hope to...", "take on more leadership responsibilities...", "grow my expertise in..."]
            }
        ],
        hell: [
            {
                id: 'inter_a3_scene_h1',
                scene: "说服录用最后的演讲",
                prompt: "在面试的最后一分钟，有三个和你实力相当的候选人。请做一段有力的电梯演讲（Elevator Pitch），说服面试官为什么你是唯一最合适的人选。\nInterviewer: 'Why should we hire you over the other highly qualified candidates?'",
                context: "Final pitch",
                timeLimit: 35,
                hints: ["What sets me apart is...", "unique combination of skills and passion...", "I can hit the ground running..."]
            }
        ]
    }
};
