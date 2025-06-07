enum ParseState {
    Start,          // 等待开始标记
    InTag,          // 已进入标签
    AttrKey,        // 正在读取属性名
    PreValue,       // 等待等号后的引号
    AttrValue,      // 正在读取属性值
    AfterValue      // 值读取完成后的状态
}

interface ParseResult {
    [key: string]: string;
}

export function parseCustomTag(s: string): ParseResult {
    let state: ParseState = ParseState.Start;
    const result: ParseResult = {};
    let currentKey = '';
    let currentValue = '';
    let quoteChar: '"' | "'" | null = null;
    const stack: string[] = []; // 用于检测标签边界

    for (const c of s) {
        switch (state) {
            case ParseState.Start:
                if (c === '{') {
                    stack.push(c);
                } else if (stack.length > 0 && c === ':' && stack[stack.length - 1] === '{') {
                    state = ParseState.InTag;
                    stack.length = 0; // 清空栈
                }
                break;

            case ParseState.InTag:
                if (c === '}') {
                    if (stack.length > 0 && stack[stack.length - 1] === ':') {
                        stack.pop();
                        return result; // 提前结束解析
                    }
                } else if (c === ':') {
                    stack.push(c);
                } else if (!/\s/.test(c)) { // 非空白字符开始新属性
                    state = ParseState.AttrKey;
                    currentKey = c;
                }
                break;

            case ParseState.AttrKey:
                if (c === '=' || /\s/.test(c)) {
                    state = ParseState.PreValue;
                } else {
                    currentKey += c;
                }
                break;

            case ParseState.PreValue:
                if (c === '"' || c === "'") {
                    quoteChar = c;
                    state = ParseState.AttrValue;
                    currentValue = '';
                }
                break;

            case ParseState.AttrValue:
                if (c === quoteChar) {
                    result[currentKey.trim()] = currentValue;
                    currentKey = '';
                    state = ParseState.AfterValue;
                } else {
                    currentValue += c;
                }
                break;

            case ParseState.AfterValue:
                if (c === '}') {
                    if (stack.length > 0 && stack[stack.length - 1] === ':') {
                        return result;
                    }
                } else if (/\s/.test(c)) {
                    state = ParseState.InTag; // 准备读取下一个属性
                } else if (c === ':') {
                    stack.push(c);
                }
                break;
        }
    }

    return result;
}

