export async function sha1(message: string) {
    const msgBuffer = new TextEncoder().encode(message); // 编码为UTF-8
    const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer); // 哈希
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // 转换为字节数组
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // 转换为十六进制
    return hashHex;
}