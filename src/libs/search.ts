enum SearchEngineConditionTypeOr {
    include = "inc",
    exclude = "exc",
}
enum SearchEngineConditionType {
    include = "inc",
    or = "or",
    exclude = "exc",
}

type SearchEngineConditionOr = { type: SearchEngineConditionTypeOr, value: string }
type SearchEngineCondition =
    | { type: SearchEngineConditionType.include | SearchEngineConditionType.exclude, value: string }
    | { type: SearchEngineConditionType.or, values: SearchEngineConditionOr[] }

/** 底部反链本地过滤：空格=AND、| 分组=OR 组、! 前缀=排除；大小写不敏感可选。
 *  输入容错：全角 ！丨 归一；孤立 !/|、空值项与空 OR 组静默丢弃（宁可放过不误杀） */
export class SearchEngine {
    private conditions: SearchEngineCondition[] = [];
    private isCaseInsensitive: boolean;

    constructor(isCaseInsensitive: boolean) {
        this.isCaseInsensitive = isCaseInsensitive;
    }

    setQuery(query: string) {
        if (this.isCaseInsensitive)
            query = query.toLowerCase();
        this.conditions = tokenize(query)
            .map(parseToken)
            .filter(c => c != null);
    }

    jsonCon() {
        return JSON.stringify(this.conditions);
    }

    match(text: string): boolean {
        if (this.isCaseInsensitive)
            text = text.toLowerCase();
        for (const con of this.conditions) {
            if (con.type == SearchEngineConditionType.or) {
                // OR 组内任一项命中即过：inc 项=文本含该词；exc 项（a|!b）=文本不含该词
                if (!con.values.some(sub =>
                    sub.type == SearchEngineConditionTypeOr.exclude
                        ? !text.includes(sub.value)
                        : text.includes(sub.value)))
                    return false;
            } else if (con.type == SearchEngineConditionType.include) {
                if (!text.includes(con.value)) return false;
            } else {
                if (text.includes(con.value)) return false;
            }
        }
        return true;
    }
}

/** 归一 + 切词：全角转半角、多空格折叠、| 两侧空格剥掉，产出干净的空格分隔 token */
function tokenize(query: string): string[] {
    // 全角丨/｜ 须在空格折叠/| 归一之前转半角，否则「a 丨 b」的丨会孤立成 token 被丢弃（OR 退化 AND）；
    // ｜(U+FF5C) 是中文输入法实际打出的全角管道符，不归一会被当字面字符搜（过滤莫名失效）
    return query.trim().replaceAll("丨", "|").replaceAll("｜", "|")
        .replace(/[！!]+/g, "!")
        .replace(/\s+/g, " ")
        .replace(/ ?\| ?/g, "|")
        .split(" ")
        .filter(c => c.length > 0 && c != "!" && c != "|");
}

/** 单 token → 条件：无 | 即单项；含 | 即 OR 组（组内空段先剔，整组空则丢） */
function parseToken(token: string): SearchEngineCondition | null {
    const parts = token.split("|").map(c => c.trim()).filter(c => c.length > 0);
    if (parts.length == 1) {
        const term = parseTerm(parts[0]);
        if (!term) return null;
        return term.type == SearchEngineConditionTypeOr.exclude
            ? { type: SearchEngineConditionType.exclude, value: term.value }
            : { type: SearchEngineConditionType.include, value: term.value };
    }
    const values = parts.map(parseTerm).filter(t => t != null);
    return values.length > 0 ? { type: SearchEngineConditionType.or, values } : null;
}

/** 词 → inc/exc 项；! 前缀剥掉后为空（如尾部『!|』残渣）则丢弃，勿让 includes("") 恒真拦截一切 */
function parseTerm(s: string): SearchEngineConditionOr | null {
    const exclude = s[0] == "!";
    const value = exclude ? s.slice(1) : s;
    if (value.length == 0) return null;
    return { type: exclude ? SearchEngineConditionTypeOr.exclude : SearchEngineConditionTypeOr.include, value };
}
