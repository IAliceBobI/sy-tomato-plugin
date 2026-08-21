// 数组/对象/流程控制等泛型小工具。从原 utils.ts 拆出（2026-08 重构），utils.ts 现为 re-export 桶。
import { Siyuan } from "./globals";

export function notEmptyStrDo(s: string, cb: (s: string) => void) {
    s = s?.trim()
    if (s) cb(s);
}

export function set(obj: Object, path: string, value: any) {
    if (!obj) obj = {}
    if (!path) {
        obj = value;
    } else {
        const parts = path.split('.');
        let current = obj;
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (typeof current[part] !== 'object' || current[part] === null) {
                current[part] = {};
            }
            current = current[part];
        }
        current[parts[parts.length - 1]] = value;
    }
    return obj
}

export function newProxy() {
    return new Proxy({}, {
        get(target, prop) {
            if (!(prop in target)) {
                target[prop] = new Proxy({}, this);
            }
            return target[prop];
        }
    });
}

export function joinArray<T>(array: T[], factory: () => T): T[] {
    if (!array) return [];
    return array.flatMap((value, index, arr) => {
        if (index === arr.length - 1) {
            return [value];
        }
        return [value, factory()];
    });
}

export async function pmapNull<A, T>(list: Array<A>, fn: (a: A) => Promise<T>) {
    const a = await Promise.all(list.map(i => fn(i)))
    return list.map((i, idx) => { return { k: i, v: a[idx] }; })
}

export async function pmap<A, T>(list: Array<A>, fn: (a: A) => Promise<T | null | undefined>) {
    return pmapNull(list, fn).then(l => l.filter(({ v }) => v != null));
}

export async function pmapNullVO<A, T>(list: Array<A>, fn: (a: A) => Promise<T>) {
    return Promise.all(list.map(i => fn(i)))
}

export async function pmapVO<A, T>(list: Array<A>, fn: (a: A) => Promise<T | null | undefined>) {
    return pmapNullVO(list, fn).then(l => l.filter(v => v != null));
}

export class RefObj<T> { v: T; constructor(v: T) { this.v = v; } }

export function joinByComma(all: string, id: string) {
    if (all) {
        const a = all.split(",")
        a.push(id)
        return [...(new Set(a)).values()].join(",")
    }
    return id
}

export function pushNotNull<T>(arr: T[] | undefined, ...items: T[]): T[] {
    if (!arr) arr = [];
    if (items != null) {
        for (const i of items) {
            if (i != null) {
                arr.push(i);
            }
        }
    }
    return arr;
}

export function removeFromArr<T>(arr: T[] | undefined, ...items: T[]): T[] {
    if (!arr) arr = [];
    for (let i = 0; i < items.length; i++) {
        const idx = arr.indexOf(items.at(i))
        if (idx >= 0) {
            arr.splice(idx, 1)
            i--
        }
    }
    return arr;
}

export function push<T>(arr: T[] | undefined, ...items: T[]): T[] {
    if (!arr) arr = [];
    arr.push(...items);
    return arr;
}

export function arrayRemove<T>(array: T[], element: T) {
    const index = array.indexOf(element);
    if (index !== -1) {
        array.splice(index, 1);
    }
    return array;
}

export function clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

export function sortedMap<K, V>(map: Map<K, V>, compareFn?: (a: [K, V], b: [K, V]) => number) {
    return new Map([...map.entries()].sort(compareFn));
}

export function extendMap<K, V>(targetMap: Map<K, V>, sourceMap: Map<K, V>): Map<K, V> {
    for (const [key, value] of sourceMap.entries()) {
        targetMap.set(key, value);
    }
    return targetMap;
}

export function divideArrayIntoParts<T>(array: T[], n: number): T[][] {
    n = Math.ceil(array.length / n);
    return chunks(array, n);
}

export function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

export function chunks<T>(array: T[], n: number): T[][] {
    const newArr: T[][] = [];
    for (let i = 0; i < array.length; i += n) {
        const part = array.slice(i, i + n);
        if (part.length > 0) newArr.push(part);
    }
    return newArr;
}

export function isBoolean(value: any): boolean {
    return typeof value === "boolean";
}

export function isObject(value: any): boolean {
    return value != null && typeof value === 'object' && !Array.isArray(value);
}

export function isValidNumber(num: number) {
    return typeof num === "number" && !isNaN(num);
}

export function isStringNumber(str: string): boolean {
    return !isNaN(+str);
}

export function* count(end: number) {
    for (let i = 0; i < end; i++) {
        yield i;
    }
}

export function* getRange(start: number, end: number) {
    for (let i = start; i < end; i++) {
        yield i;
    }
}

export function setTimeouts(cb: Func, start: number, end: number, step: number) {
    for (; start <= end; start += step) {
        setTimeout(cb, start);
    }
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export function getRandFloat0tox(x: number) {
    return Math.random() * x;
}

export function getRandInt0tox(x: number) {
    return Math.floor(Math.random() * x);
}

export function isMainWin() {
    const focusBtn = document.querySelector('span[data-type="focus"]');
    return focusBtn != null;
}

export function downloadStringAsFile(content: string, filename: string, mimeType: string = 'text/plain') {
    // 创建一个 Blob 对象
    const blob = new Blob([content], { type: mimeType });

    // 创建一个指向 Blob 的 URL
    const url = URL.createObjectURL(blob);

    // 创建一个 <a> 标签
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;

    // 模拟点击 <a> 标签以触发下载
    a.click();

    // 释放 URL 对象
    URL.revokeObjectURL(url);
}

export function uniqueFilter<T>(keySelector: (item: T) => any) {
    const seen = new Set<any>();
    return (item: T) => {
        const key = keySelector(item);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    };
};

export function dir(path: string) {
    const parts = path.split("/");
    const file = parts.pop();
    return [parts.join("/"), file];
}

export function findBookOpennedFirst(bookID: string, bookIDList: string[]): string {
    if (bookIDList.length === 0) return bookID;
    if (bookIDList.indexOf(bookID) === -1) {
        return bookIDList[0];
    }
    return bookID;
}

export function versionGreaterEqual(v: string) {
    const currentV = Siyuan.config.system.kernelVersion;
    return compareVersions(currentV, v) >= 0;
}

export function compareVersions(version1: string, version2: string) {
    const v1 = version1.split('.').map(Number);
    const v2 = version2.split('.').map(Number);
    for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
        const num1 = v1[i] || 0;
        const num2 = v2[i] || 0;

        if (num1 < num2) {
            return -1;
        } else if (num1 > num2) {
            return 1;
        }
    }
    return 0;
}
