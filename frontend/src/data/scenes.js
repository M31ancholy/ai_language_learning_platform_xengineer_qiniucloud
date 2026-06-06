/**
 * 语塔攀登 - 场景选择配置数据
 * 将各个场景的展示文本、颜色及键名进行模块化管理
 */

export const SCENE_CONFIGS = [
    {
        key: 'restaurant',
        name: '🍽️ 餐厅点餐',
        englishName: 'Restaurant Order',
        desc: '面对各种刁钻的美食家和突发状况。点餐、退换、投诉，生存就是最大的美味。',
        color: 0x4caf50 // 绿色高亮
    },
    {
        key: 'interview',
        name: '💼 英语面试',
        englishName: 'Job Interview',
        desc: '接受资深面试官的拷问。自我介绍、行为面试、专业提问，攀登你职场生涯的尖塔。',
        color: 0x51e5ff // 冰蓝高亮
    },
    {
        key: 'meeting',
        name: '📋 商务会议',
        englishName: 'Business Meeting',
        desc: '商务谈判，思想碰撞，会议报告。用专业得体的商用英语说服你所有的合伙人。',
        color: 0xff9800 // 橙色高亮
    },
    {
        key: 'random',
        name: '🎲 随机场景',
        englishName: 'Random Scene',
        desc: '命运之轮！每一关开始时，系统会从上述场景中随机抽取挑战。真正的强者从不挑剔环境。',
        color: 0xaa44ff // 紫色高亮
    }
];
