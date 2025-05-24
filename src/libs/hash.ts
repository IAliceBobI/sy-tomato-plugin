export async function sha1(message: string) {
    const msgBuffer = new TextEncoder().encode(message); // 编码为UTF-8
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer); // 哈希
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // 转换为字节数组
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // 转换为十六进制
    return hashHex;
}

/**
 * 左移循环（32位）
 */
function rotl32(x: number, r: number): number {
    return (x << r) | (x >>> (32 - r));
}

/**
 * 最终混音步骤
 */
function mixmur3(h: number): number {
    h = h ^ (h >>> 16);
    h = (h * 0x85ebca6b) >>> 0;
    h = h ^ (h >>> 13);
    h = (h * 0xc2b2ae35) >>> 0;
    h = h ^ (h >>> 16);
    return h;
}

/**
 * MurmurHash3 32位版本简化实现
 * @param input 字符串或字节数组
 * @param seed 初始种子值，默认为 0x1BD11DBA
 * @returns 32位无符号整数哈希值
 */
export function murmurHash3(input: string | Uint8Array, seed: number = 0x1BD11DBA): number {
    let data: Uint8Array;

    // 将字符串转换为 UTF-8 编码的 Uint8Array
    if (typeof input === 'string') {
        data = new TextEncoder().encode(input);
    } else {
        data = input;
    }

    let h1 = seed;
    const len = data.length;
    const nblocks = Math.floor(len / 4); // 每 4 字节为一块

    const c1 = 0xcc9e2d51;
    const c2 = 0x1b873593;

    // 处理每一块（4 字节）
    for (let i = 0; i < nblocks; i++) {
        const i4 = i * 4;
        let k1 = data[i4] | (data[i4 + 1] << 8) | (data[i4 + 2] << 16) | (data[i4 + 3] << 24);

        k1 = (k1 * c1) >>> 0;
        k1 = rotl32(k1, 15);
        k1 = (k1 * c2) >>> 0;

        h1 ^= k1;
        h1 = rotl32(h1, 13);
        h1 = (h1 * 5 + 0xe6546b64) >>> 0;
    }

    // 处理剩余部分（不足 4 字节）
    const remaining = len % 4;
    let k1 = 0;

    if (remaining > 0) {
        switch (remaining) {
            case 3:
                k1 ^= (data[len - 3] << 16) >>> 0;
                k1 ^= (data[len - 2] << 8) >>> 0;
                k1 ^= data[len - 1];
                break;
            case 2:
                k1 ^= (data[len - 2] << 8) >>> 0;
                k1 ^= data[len - 1];
                break;
            case 1:
                k1 ^= data[len - 1];
                break;
        }

        k1 = (k1 * c1) >>> 0;
        k1 = rotl32(k1, 15);
        k1 = (k1 * c2) >>> 0;

        h1 ^= k1;
    }

    // 最终混音
    h1 ^= len;
    h1 = mixmur3(h1);

    return h1 >>> 0; // 返回 32 位无符号整数
}