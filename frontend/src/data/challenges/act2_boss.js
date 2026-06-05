/**
 * 第二章 Boss战 - 面试官
 * 场景：一场完整的英语面试
 * 6轮对话，从自我介绍到最终提问
 */

export const ACT2_BOSS = {
  id: 'interviewer',
  name: '面试官',
  icon: '💼',
  scene: '英语面试',
  description: '语塔第二层的守护者——一位传说中最严厉的面试官。他面无表情地坐在会议室的另一端，面前摆着你的简历。你必须通过一场完整的六轮英语面试，才能获得通往最终层的钥匙。',
  atmosphere: '会议室灯光明亮，空调略微偏冷。面试官西装笔挺，眼神锐利，手中的笔不时记录着什么。',
  totalRounds: 6,

  rounds: [
    {
      round: 1,
      phase: '自我介绍',
      difficulty: 'rookie',
      bossLine: 'Good afternoon. Thank you for coming in today. Before we begin, could you please introduce yourself? Tell me about your background, your education, and what brings you here.',
      expectedTopics: ['name', 'education', 'background', 'experience', 'motivation', 'career goals'],
      hints: '简要介绍姓名、教育背景、工作经验和应聘动机',
      scoringCriteria: {
        pronunciation: 25,
        grammar: 25,
        content: 30,
        confidence: 20,
      },
      bossReactions: {
        excellent: '"Impressive introduction. You clearly know how to present yourself. Let\'s dive deeper."（面试官放下笔，微微前倾）',
        good: '"Thank you. That\'s a good overview. Let\'s continue."（面试官点了点头）',
        poor: '"I see... Could you be more specific about your relevant experience?"（面试官皱了皱眉）',
      },
      exampleResponse: 'Good afternoon, and thank you for this opportunity. My name is Alex Chen, and I graduated from Tsinghua University with a degree in Computer Science. Over the past four years, I\'ve been working as a product manager at a leading tech company, where I led a team that launched three successful products reaching over two million users. What brings me here is my passion for your company\'s mission to make technology more accessible. I believe my experience in user-centered product development aligns perfectly with this role.',
    },
    {
      round: 2,
      phase: '工作经验',
      difficulty: 'rookie',
      bossLine: 'Tell me about a project you\'re particularly proud of. What was your role, what challenges did you face, and what were the results?',
      expectedTopics: ['project', 'role', 'challenges', 'results', 'teamwork', 'measurable outcomes'],
      hints: '使用STAR法则（Situation, Task, Action, Result）来组织回答',
      scoringCriteria: {
        pronunciation: 20,
        grammar: 25,
        structure: 25,
        content: 30,
      },
      bossReactions: {
        excellent: '"That\'s an excellent example with very clear, measurable results. I can see you\'re results-oriented."（面试官在笔记上画了一个大大的勾）',
        good: '"Good example. I appreciate the specific details."（面试官记录了你的回答）',
        poor: '"Can you quantify those results? Numbers would help me understand the impact better."（面试官追问）',
      },
      exampleResponse: 'Absolutely. I\'m most proud of leading the redesign of our company\'s mobile app. The situation was that user retention had dropped by 20% over six months, and my task was to identify the root cause and turn things around. I led a team of five designers and eight engineers. We conducted extensive user research, identified three major pain points in the onboarding flow, and completely redesigned the experience. The biggest challenge was convincing stakeholders to delay the launch by two weeks to include proper A/B testing. The result was a 45% increase in user retention and a 30% improvement in daily active users within the first quarter after launch.',
    },
    {
      round: 3,
      phase: '情景问题',
      difficulty: 'expert',
      bossLine: 'Here\'s a scenario for you. Imagine you\'re leading a team, and two of your senior team members have a serious disagreement about the technical approach for a critical project. The deadline is in two weeks, and their conflict is affecting the entire team\'s morale. How would you handle this situation?',
      expectedTopics: ['conflict resolution', 'leadership', 'communication', 'compromise', 'decision-making', 'deadline'],
      hints: '展示你的领导力和冲突解决能力，给出具体的步骤',
      scoringCriteria: {
        pronunciation: 20,
        grammar: 20,
        problemSolving: 30,
        leadership: 30,
      },
      bossReactions: {
        excellent: '"Outstanding answer. You clearly have strong emotional intelligence and leadership instincts. That\'s exactly the kind of approach we look for."（面试官在笔记上写下了很长的评价）',
        good: '"That\'s a reasonable approach. I like that you emphasized both listening and decisive action."（面试官点了点头）',
        poor: '"Hmm, that approach might work in theory, but how would you ensure both parties feel heard?"（面试官质疑）',
      },
      exampleResponse: 'That\'s a challenging but realistic scenario. Here\'s how I would approach it. First, I would meet with each team member individually to understand their perspective without the pressure of the other person being present. I\'d listen actively and make sure each person feels heard. Then, I would bring them together for a facilitated discussion, setting ground rules that the conversation should focus on facts and technical merits rather than personal preferences. I\'d encourage them to find common ground — often, disagreements stem from different priorities rather than fundamentally incompatible ideas. If they still can\'t agree, I would make the final call based on which approach best serves our project goals and deadline, while clearly explaining my reasoning. Throughout this process, I\'d keep the rest of the team informed to restore morale and maintain transparency.',
    },
    {
      round: 4,
      phase: '技术/专业提问',
      difficulty: 'expert',
      bossLine: 'In your field, things change rapidly. How do you stay current with industry trends and continuously develop your professional skills? Can you give me a recent example of how you applied something new you learned?',
      expectedTopics: ['continuous learning', 'industry trends', 'professional development', 'conferences', 'practical application'],
      hints: '展示你的学习能力和与时俱进的态度',
      scoringCriteria: {
        pronunciation: 20,
        grammar: 20,
        vocabulary: 30,
        depth: 30,
      },
      bossReactions: {
        excellent: '"It\'s clear you\'re a lifelong learner. That\'s one of the most valuable qualities a professional can have."（面试官露出第一个真正的微笑）',
        good: '"Good to see you\'re proactive about your development."（面试官做了笔记）',
        poor: '"That\'s somewhat generic. Can you be more specific about how you apply what you learn?"（面试官追问细节）',
      },
      exampleResponse: 'I\'m a firm believer in continuous learning. I dedicate at least five hours a week to professional development through a combination of methods. I subscribe to several industry newsletters like Harvard Business Review and TechCrunch, attend two to three conferences annually, and I\'m currently enrolled in an online machine learning course through Coursera. As for a recent example — last quarter, I read about the Jobs-to-Be-Done framework in a product management book by Clayton Christensen. I immediately applied it to our user research methodology, which led us to completely reframe how we define our target personas. This new approach helped us identify an underserved market segment that now accounts for fifteen percent of our new user acquisitions.',
    },
    {
      round: 5,
      phase: '薪资谈判',
      difficulty: 'hell',
      bossLine: 'Let\'s talk about compensation. The budget for this position is between eighty and one hundred thousand dollars annually. Where do you see yourself within that range, and why? Keep in mind that our total compensation package also includes stock options, health insurance, and an annual bonus of up to fifteen percent.',
      expectedTopics: ['salary expectations', 'market value', 'justification', 'total compensation', 'negotiation'],
      hints: '合理定价自己的价值，用事实和数据支撑你的期望薪资',
      scoringCriteria: {
        pronunciation: 15,
        grammar: 20,
        negotiationSkill: 35,
        confidence: 30,
      },
      bossReactions: {
        excellent: '"A well-reasoned argument backed by solid data. You clearly know your worth and can articulate it professionally. That\'s a skill that will serve you well here."（面试官合上笔记本，表情认可）',
        good: '"Fair enough. That\'s a reasonable position."（面试官做了最后一条笔记）',
        poor: '"I appreciate your honesty, but could you provide more concrete justification for that number?"（面试官要求更多论据）',
      },
      exampleResponse: 'Thank you for being transparent about the range. Based on my research into market rates for this role, and considering my four years of directly relevant experience, I would be targeting the higher end of the range — around ninety-five to one hundred thousand dollars. Here\'s my reasoning: in my current role, I manage a portfolio of products generating over ten million dollars in annual revenue, and I\'ve consistently exceeded my performance targets. Additionally, I bring specialized expertise in AI product development, which I understand is a strategic priority for your company. That said, I\'m looking at the total compensation holistically. The stock options and bonus structure you mentioned are very appealing, and I\'m also interested in professional development opportunities. I\'m confident we can find a package that works for both of us.',
    },
    {
      round: 6,
      phase: '最终提问',
      difficulty: 'hell',
      bossLine: 'We\'re nearing the end of our interview. This is your chance to ask me anything about the company, the team, or the role. What would you like to know? And as a final thought, is there anything else you\'d like to share that we haven\'t covered?',
      expectedTopics: ['thoughtful questions', 'company culture', 'growth opportunities', 'team dynamics', 'closing statement'],
      hints: '提出有深度的问题展示你对公司的了解和思考，并做一个有力的总结陈述',
      scoringCriteria: {
        pronunciation: 15,
        grammar: 15,
        questionQuality: 35,
        closingImpact: 35,
      },
      bossReactions: {
        excellent: '"Those are some of the most insightful questions I\'ve heard in an interview. I\'m very impressed with your preparation and your genuine interest in our company. You\'ve passed my trial — here is the key to the final floor."（面试官站起来与你握手，递出钥匙）',
        good: '"Good questions. I can tell you\'ve done your homework. Take this key and continue your journey."（面试官交出钥匙）',
        poor: '"Interesting questions. While your interview wasn\'t perfect, you showed determination. Here — take the key."（面试官犹豫了一下，还是交出了钥匙）',
      },
      exampleResponse: 'Absolutely, I do have a few questions. First, I\'m curious about the team I\'d be joining — could you tell me about the team dynamics and how cross-functional collaboration works here? Second, I noticed the company recently expanded into the Southeast Asian market. What does success look like for this role in supporting that expansion over the next twelve months? And finally, what do you personally enjoy most about working here? As for something I\'d like to add — I want to emphasize that this isn\'t just a job for me. I\'ve been following your company\'s journey for years, and I genuinely believe in your mission. I\'m ready to bring my full energy, experience, and passion to this role from day one. Thank you for your time today.',
    },
  ],

  /** Boss 通关奖励 */
  rewards: {
    gold: 200,
    relic: 'work_pass',
    exp: 400,
  },

  /** Boss 失败惩罚 */
  failurePenalty: {
    gold: -50,
    message: '面试官合上了你的简历："I appreciate your effort, but we\'re looking for someone with stronger English communication skills. Keep practicing."',
  },
};
