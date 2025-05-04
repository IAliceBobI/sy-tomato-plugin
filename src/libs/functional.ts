export function zipNways<T extends any[][]>(...arrays: T): Array<{ [K in keyof T]: T[K][number] }> {
    // if T[K] is string[], then T[K][number] would be string
    //  this is equivalent to saying "give me the type of the elements inside each of the arrays in T
    const maxLength = Math.max(...arrays.map(arr => {
        if (!arr) arr = []
        return arr.length
    }));
    const zipped = Array.from({ length: maxLength }, (_, rowIdx) => (
        arrays.map((_, arrIdx) => arrays[arrIdx][rowIdx]) as { [K in keyof T]: T[K][number] }));
    return zipped;
}

export function flatChunkMap<M>(array: any[], num: number, map: (ts: any[]) => M) {
    array = array.flat();
    const newArr: M[] = [];
    for (let i = 0; i < array.length; i += num) {
        const part = array.slice(i, i + num);
        if (part.length > 0) {
            newArr.push(map(part));
        }
    }
    return newArr;
}

export async function aFlatChunkMap<M>(array: any[], num: number, map: (ts: any[]) => M) {
    return flatChunkMap(await Promise.all(array.flat()), num, map);
}

export function isIterable(obj: any): boolean {
    if (obj == null) return obj;

    // Check if the object has the Symbol.iterator property
    if (typeof obj[Symbol.iterator] === "function") {
        return true;
    }

    // Check if the object has the @@iterator method
    if (typeof obj["@@iterator"] === "function") {
        return true;
    }

    // If neither is present, the object is not iterable
    return false;
}