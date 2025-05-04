export type EnumItem = { key: string, value: string, idx: number, text: string }
/**
 * enum must be like:
 *  enum InsertPlace {
        here = "0#当前位置",
        dailynote = "1#今日笔记",
        subdoc = "2#子文档",
    }
 */
export class EnumUtils {
    private enumType: any;
    private _map: Map<number, EnumItem>;
    public get map(): Map<number, EnumItem> {
        return this._map;
    }
    private set map(value: Map<number, EnumItem>) {
        this._map = value;
    }
    constructor(enumType: any) {
        this.enumType = enumType;
        this.map = Object.keys(this.enumType).map(key => {
            const value: string = enumType[key];
            const parts = value.split("#");
            return {
                key,
                value,
                idx: Number(parts[0]),
                text: parts[1],
            };
        }).reduce((m, i) => {
            m.set(i.idx, i);
            return m;
        }, new Map());
    }

    getItem(enumValue: string) {
        const parts = enumValue.split("#");
        return this.map.get(Number(parts[0]));
    }
}

export function getAllEnumValues<T>(enumObj: T): T[keyof T][] {
    return Object.keys(enumObj)
        .map(key => enumObj[key as keyof typeof enumObj]);
}