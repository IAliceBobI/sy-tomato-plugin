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
type SearchEngineCondition = { type: SearchEngineConditionType, value: string, values: SearchEngineConditionOr[] }

export class SearchEngine {
    private conditions: SearchEngineCondition[] = [];
    private isCaseInsensitive: boolean;

    constructor(isCaseInsensitive: boolean) {
        this.isCaseInsensitive = isCaseInsensitive;
    }

    setQuery(query: string) {
        if (this.isCaseInsensitive)
            query = query.toLowerCase();
        this.conditions = query.trim().replace(/[！!]+/g, "!").replace(/\s+/, " ")
            .replace(/ ?\| ?/g, "|").split(" ").filter(c => c.length > 0)
            .filter(c => c != "!").filter(c => c != "|").map(c => {
                const con = c.split("|").map(c => c.trim()).filter(c => c.length > 0);
                const ret = {} as SearchEngineCondition;
                if (con.length == 1) {
                    const s = con[0];
                    if (s[0] == "!") {
                        ret.type = SearchEngineConditionType.exclude;
                        ret.value = s.slice(1);
                    } else {
                        ret.type = SearchEngineConditionType.include;
                        ret.value = s;
                    }
                } else {
                    ret.type = SearchEngineConditionType.or;
                    ret.values = con.map(c => {
                        const ret = {} as SearchEngineConditionOr;
                        if (c[0] == "!") {
                            ret.type = SearchEngineConditionTypeOr.exclude;
                            ret.value = c.slice(1);
                        } else {
                            ret.type = SearchEngineConditionTypeOr.include;
                            ret.value = c;
                        }
                        return ret;
                    });
                }
                return ret;
            }).filter(c => {
                if (c.type == SearchEngineConditionType.or) {
                    if (c.values.length == 0) return false;
                }
                return true;
            });
    }

    jsonCon() {
        return JSON.stringify(this.conditions);
    }

    match(text: string): boolean {
        if (this.isCaseInsensitive)
            text = text.toLowerCase();
        for (const con of this.conditions) {
            if (con.type == SearchEngineConditionType.include) {
                if (!text.includes(con.value)) return false;
            } else if (con.type == SearchEngineConditionType.exclude) {
                if (text.includes(con.value)) return false;
            } else if (con.type == SearchEngineConditionType.or) {
                let flag = false;
                for (const subCon of con.values) {
                    if (subCon.type == SearchEngineConditionTypeOr.exclude) {
                        if (!text.includes(subCon.value)) {
                            flag = true;
                            break;
                        }
                    } else if (subCon.type == SearchEngineConditionTypeOr.include) {
                        if (text.includes(subCon.value)) {
                            flag = true;
                            break;
                        }
                    }
                }
                if (!flag) return false;
            }
        }
        return true;
    }
}
