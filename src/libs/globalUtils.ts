
const prefix = "DaUaeWLNBpAf5CWCSZwZ4eEt3D78"

export function getGlobal<T>(key: string): T {
    return globalThis[prefix + key]
}

export function setGlobal<T>(key: string, v: T): T {
    const old = globalThis[prefix + key];
    globalThis[prefix + key] = v
    return old;
}


