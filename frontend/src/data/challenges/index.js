/**
 * 语塔攀登 - 题库总入口
 * 统一管理各场景的朗读、场景对话以及 Boss 对话题库
 */

import { READINGS as restReadings } from './restaurant/readings.js';
import { SCENES as restScenes } from './restaurant/scenes.js';
import { BOSS as restBoss } from './restaurant/boss.js';

import { READINGS as interReadings } from './interview/readings.js';
import { SCENES as interScenes } from './interview/scenes.js';
import { BOSS as interBoss } from './interview/boss.js';

import { READINGS as meetReadings } from './meeting/readings.js';
import { SCENES as meetScenes } from './meeting/scenes.js';
import { BOSS as meetBoss } from './meeting/boss.js';

import { randomChoice } from '../../utils/Helpers.js';

// 场景与题目的映射表
const CHALLENGE_MAP = {
    restaurant: {
        reading: restReadings,
        scene: restScenes,
        boss: restBoss
    },
    interview: {
        reading: interReadings,
        scene: interScenes,
        boss: interBoss
    },
    meeting: {
        reading: meetReadings,
        scene: meetScenes,
        boss: meetBoss
    }
};

/**
 * 统一获取符合条件的题目或 Boss 剧本
 * @param {string} scene - 选定场景：'interview' | 'restaurant' | 'meeting' | 'random'
 * @param {number} act - 章节：1 | 2 | 3
 * @param {string} difficulty - 难度：'rookie' | 'expert' | 'hell'
 * @param {string} type - 题目类型：'reading' (朗读) | 'scene' (场景对话) | 'boss' (Boss对话)
 * @returns {object} 具体的挑战数据
 */
export function getChallenge(scene, act, difficulty, type) {
    let targetScene = scene;
    
    // 如果玩家选择了“随机”，则在此处随机抽取三大场景之一
    if (scene === 'random' || !scene) {
        const scenes = ['restaurant', 'interview', 'meeting'];
        targetScene = randomChoice(scenes);
    }

    const sceneData = CHALLENGE_MAP[targetScene];
    if (!sceneData) {
        console.warn(`[getChallenge] 未找到场景 ${targetScene}，默认降级为 restaurant`);
        targetScene = 'restaurant';
    }

    const typeData = CHALLENGE_MAP[targetScene][type];
    if (!typeData) {
        console.error(`[getChallenge] 场景 ${targetScene} 下无此挑战类型 ${type}`);
        return null;
    }

    const actKey = `act${act}`;
    const actData = typeData[actKey];
    if (!actData) {
        console.error(`[getChallenge] 场景 ${targetScene} 的 ${type} 类型下无此 Act: ${act}`);
        return null;
    }

    // Boss 战直接返回该 Act 的剧本包
    if (type === 'boss') {
        return actData;
    }

    // 普通关卡，根据难度从题目数组中随机选择一个
    const diffPool = actData[difficulty] || actData.rookie;
    if (!diffPool || diffPool.length === 0) {
        console.warn(`[getChallenge] 场景 ${targetScene} 在 ${actKey} 下的 ${difficulty} 难度题目池为空，默认使用 rookie`);
        return actData.rookie ? randomChoice(actData.rookie) : null;
    }

    return randomChoice(diffPool);
}

// 导出供 BossScene.js 寻找 Boss 元数据使用 (兼容老架构导出字段名)
export const BOSS_DIALOGUES = {
    act1: {
        restaurant: restBoss.act1,
        interview: interBoss.act1,
        meeting: meetBoss.act1
    },
    act2: {
        restaurant: restBoss.act2,
        interview: interBoss.act2,
        meeting: meetBoss.act2
    },
    act3: {
        restaurant: restBoss.act3,
        interview: interBoss.act3,
        meeting: meetBoss.act3
    }
};
