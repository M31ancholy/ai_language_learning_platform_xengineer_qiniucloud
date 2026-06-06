/**
 * 语塔攀登 - 纠错文本渲染器
 * 将用户的口语文本根据发音、语法、表达的检测结果，转换为带彩色样式的 HTML 字符串
 */

/**
 * 生成带颜色标记的 HTML 文本
 * @param {string} text - 待渲染的文本（参考文本或识别文本）
 * @param {object[]} wordScores - 发音逐词评分：[{word, score, isCorrect}]
 * @param {object[]} grammarErrors - 语法错误列表：[{original, corrected, explanation, severity}]
 * @param {object[]} expressionIssues - 表达问题列表：[{original, suggestion, explanation}]
 * @returns {string} 带 CSS 样式的 HTML 字符串
 */
export function renderColorCodedText(text, wordScores, grammarErrors, expressionIssues) {
    if (!text) return '';
    let html = text;

    // 1. 临时占位替换语法错误（防止单词拆分时被破坏）
    const gErrors = grammarErrors || [];
    gErrors.forEach((err, idx) => {
        if (err.original) {
            // 使用正则匹配完整词组/短语（不区分大小写）
            const escaped = err.original.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
            html = html.replace(regex, `__GRAMMAR_${idx}__`);
        }
    });

    // 2. 临时占位替换表达建议
    const eIssues = expressionIssues || [];
    eIssues.forEach((issue, idx) => {
        if (issue.original) {
            const escaped = issue.original.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
            const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
            html = html.replace(regex, `__EXPR_${idx}__`);
        }
    });

    // 3. 对剩下的普通单词进行分词并匹配发音评分
    // 按空白和标点符号切分，以保留原汁原味的格式和标点
    const tokens = html.split(/(\s+|[.,!?;:"'()]+)/);
    const wordScoresMap = {};
    if (wordScores) {
        wordScores.forEach(ws => {
            if (ws && ws.word) {
                wordScoresMap[ws.word.toLowerCase().replace(/[.,!?;:"'()]/g, '')] = ws.pronAccuracy || ws.score;
            }
        });
    }

    const processedTokens = tokens.map(token => {
        // 如果是占位符，保留
        if (token.startsWith('__GRAMMAR_') && token.endsWith('__')) {
            return token;
        }
        if (token.startsWith('__EXPR_') && token.endsWith('__')) {
            return token;
        }
        // 如果是空白或标点，保留
        if (/^(\s+|[.,!?;:"'()]+)$/.test(token)) {
            return token;
        }
        
        const cleanWord = token.toLowerCase().replace(/[.,!?;:"'()]/g, '');
        if (cleanWord === '') return token;

        const score = wordScoresMap[cleanWord];
        if (score !== undefined) {
            if (score < 75) {
                // 🔴 发音分低于 75 判定为红色高亮 + 下划线
                return `<span style="color: #ff2d2d; text-decoration: underline; font-weight: bold; cursor: help;" title="发音评分: ${Math.round(score)}">${token}</span>`;
            } else {
                // 🟢 正确发音为绿色
                return `<span style="color: #4caf50;">${token}</span>`;
            }
        }
        // 没找到评测分数的默认显示为绿色（表示正确）
        return `<span style="color: #4caf50;">${token}</span>`;
    });

    let finalHtml = processedTokens.join('');

    // 4. 将语法错误占位符还原为黄色高亮+虚线下划线，鼠标悬停展示修改建议
    gErrors.forEach((err, idx) => {
        const title = `语法错误: ${err.original}\n修正建议: ${err.corrected || ''}\n解释: ${err.explanation || ''}`;
        const replacement = `<span style="color: #ff9800; border-bottom: 2px dashed #ff9800; cursor: help; font-weight: bold;" title="${title}">${err.original}</span>`;
        finalHtml = finalHtml.replace(`__GRAMMAR_${idx}__`, replacement);
    });

    // 5. 将表达问题占位符还原为蓝色高亮+斜体，鼠标悬停展示更优表达
    eIssues.forEach((issue, idx) => {
        const title = `表达建议: ${issue.original}\n更优推荐: ${issue.suggestion || ''}\n理由: ${issue.explanation || ''}`;
        const replacement = `<span style="color: #51e5ff; font-style: italic; border-bottom: 1px dotted #51e5ff; cursor: help; font-weight: bold;" title="${title}">${issue.original}</span>`;
        finalHtml = finalHtml.replace(`__EXPR_${idx}__`, replacement);
    });

    return finalHtml;
}
