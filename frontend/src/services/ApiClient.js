/**
 * 语塔攀登 - 后端 API 客户端
 * 处理与 Go 后端服务的所有通信
 */

class ApiClientClass {
    constructor() {
        // 由于 Vite 开启了 proxy，可以直接使用相对路径 /api，Vite 会自动代理至 http://localhost:8081
        this.baseUrl = '';
    }

    /**
     * 发送发音评估请求
     * @param {string} audioBase64 - 录音音频 Base64 编码
     * @param {string} refText - 参考文本
     * @param {boolean} isReading - 是否为朗读关卡
     * @returns {Promise<object>} 发音评估详情及分数
     */
    async evaluatePronunciation(audioBase64, refText, isReading = false) {
        try {
            const response = await fetch(`${this.baseUrl}/api/evaluate/pronunciation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    audio: audioBase64,
                    refText: refText,
                    isReading: isReading
                })
            });

            if (!response.ok) {
                const errMsg = await response.text();
                throw new Error(`发音评估失败: ${errMsg}`);
            }

            return await response.json();
        } catch (e) {
            console.error('[ApiClient] evaluatePronunciation error:', e);
            throw e;
        }
    }

    /**
     * 发送语法与表达纠错请求
     * @param {string} userText - 用户实际说出的识别文本
     * @param {string} refText - 参考参考文本 (朗读关卡提供)
     * @param {string} scene - 选定场景名称
     * @param {string} difficulty - 关卡难度
     * @returns {Promise<object>} 纠错列表与各项评分
     */
    async analyzeGrammarExpression(userText, refText = '', scene = 'general', difficulty = 'rookie') {
        try {
            const response = await fetch(`${this.baseUrl}/api/evaluate/grammar-expression`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userText,
                    refText,
                    scene,
                    difficulty
                })
            });

            if (!response.ok) {
                const errMsg = await response.text();
                throw new Error(`语法表达分析失败: ${errMsg}`);
            }

            return await response.json();
        } catch (e) {
            console.error('[ApiClient] analyzeGrammarExpression error:', e);
            throw e;
        }
    }

    /**
     * 计算并获得结合权重后的最终分数与评级
     */
    async calculateFinalScore(pronunciation, grammar, expression, fluency) {
        try {
            const response = await fetch(`${this.baseUrl}/api/evaluate/score`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pronunciation,
                    grammar,
                    expression,
                    fluency
                })
            });

            if (!response.ok) {
                const errMsg = await response.text();
                throw new Error(`分数计算失败: ${errMsg}`);
            }

            return await response.json();
        } catch (e) {
            console.error('[ApiClient] calculateFinalScore error:', e);
            throw e;
        }
    }

    /**
     * 发送总结生成请求
     * @param {string[]} errors - 累计错误片段与修改建议列表
     * @param {number} score - 总分
     * @param {string} grade - 最终评级
     * @returns {Promise<object>} AI个性化评语与复习建议
     */
    async generateSummary(errors, score, grade) {
        try {
            const response = await fetch(`${this.baseUrl}/api/summary/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    errors,
                    score,
                    grade
                })
            });

            if (!response.ok) {
                const errMsg = await response.text();
                throw new Error(`生成总结评语失败: ${errMsg}`);
            }

            return await response.json();
        } catch (e) {
            console.error('[ApiClient] generateSummary error:', e);
            throw e;
        }
    }
}

export const ApiClient = new ApiClientClass();
