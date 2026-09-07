// □4 拍照闪念图片插入流（dailynote-pipeline 战役 2026-09-06）。
// 上传降级链（竞品情报=移动端笔记同步助手三层链；浏览器 File 对象实为两层）：
// ① /api/asset/upload（内核去重+规范命名，succMap 返回 assets/ 相对路径）
// ② /api/file/putFile 直写工作区 /data/assets/（原拍照闪念通道，兜底）。
// 第三层 insertLocalAssets 需服务端本地盘路径，浏览器 File 不在盘上故不适用。
// 占位锚=物理锚点手法（toolbar-customizer 情报）：选图/粘贴瞬间先在光标处插可见
// 占位 ⏳n⏳，上传完成原位替换为 markdown——解移动端选图往返光标丢失（textarea 的
// selectionStart 失焦后虽可读，但键盘收起重弹后恢复不可靠，锚最稳）。
// fetch/idGen 注入仅为可测；运行时默认走全局 fetch 与 Lute.NewNodeID。
import { NewNodeID } from "./globals";

/** 占位锚：n 为会话内递增序号，保证同窗多次上传各占位唯一 */
export function imgPlaceholder(n: number): string {
    return `⏳${n}⏳`;
}

/** 原位替换第一个 ⏳n⏳ 占位（找不到=已被用户手删，原样返回） */
export function replacePlaceholder(text: string, n: number, replacement: string): string {
    const ph = imgPlaceholder(n);
    const i = text.indexOf(ph);
    if (i < 0) return text;
    return text.slice(0, i) + replacement + text.slice(i + ph.length);
}

/** 草稿中是否残留未完成占位（保存前守卫） */
export function hasPendingPlaceholder(text: string): boolean {
    return /⏳\d+⏳/.test(text);
}

/** 清掉所有残留占位（组件销毁兜底时用） */
export function stripPlaceholders(text: string): string {
    return text.replace(/⏳\d+⏳\s*/g, "");
}

export interface UploadedAsset {
    /** 原文件名（净化后，用于 alt 文本） */
    name: string;
    /** 插入用 markdown（![](path)）；两层全败为空串 */
    md: string;
}

/** 文件名净化：markdown 链接语法字符与路径分隔符都不进 alt/文件名；
 * 超长截断保留扩展名（review P2：整截会把 .png 切掉） */
export function sanitizeAssetName(name: string): string {
    let n = (name || "asset")
        .replace(/[/\\:*?"<>|\[\]()]/g, "_")
        .replace(/\s+/g, " ")
        .trim();
    if (!n) n = "asset";
    if (n.length > 80) {
        const dot = n.lastIndexOf(".");
        const ext = dot > 0 && n.length - dot <= 10 ? n.slice(dot) : "";
        n = n.slice(0, 80 - ext.length).replace(/[._\s]+$/, "") + ext || "asset";
    }
    return n;
}

function assetMd(name: string, path: string): string {
    return `![${sanitizeAssetName(name)}](${path})`;
}

/** ① /api/asset/upload：一次多文件；返回与入参同序的路径数组（失败位 null）。
 * 新内核带 succFiles（index 精确归属，review P1：同名同批 succMap 按名覆盖会张冠李戴）；
 * 旧内核只有 succMap——同名只认首张，其余交 ② 层兜底防错配。 */
async function uploadViaAssetApi(
    files: File[],
    fetcher: typeof fetch,
): Promise<(string | null)[]> {
    const fd = new FormData();
    fd.append("assetsDirPath", "/assets/");
    for (const f of files) fd.append("file[]", f, f.name);
    const resp = await fetcher("/api/asset/upload", { method: "POST", body: fd });
    const data = await resp.json();
    const out: (string | null)[] = files.map(() => null);
    if (data?.code !== 0 || !data?.data) return out;

    const sf = data.data.succFiles;
    if (Array.isArray(sf)) {
        for (const r of sf) {
            const i = r?.index;
            if (Number.isInteger(i) && i >= 0 && i < files.length && typeof r?.path === "string" && r.path) {
                out[i] = r.path;
            }
        }
        return out;
    }
    const succ = new Map<string, string>();
    for (const [k, v] of Object.entries(data.data.succMap ?? {})) {
        if (typeof v === "string" && v) succ.set(k, v);
    }
    files.forEach((f, i) => {
        const p = succ.get(f.name);
        if (p) {
            out[i] = p;
            succ.delete(f.name);
        }
    });
    return out;
}

/** ② /api/file/putFile 直写 /data/assets/{id}-{名}；返回 assets/ 相对引用路径 */
async function uploadViaPutFile(
    file: File,
    fetcher: typeof fetch,
    idGen: () => string,
): Promise<string | null> {
    const safe = sanitizeAssetName(file.name);
    const ext = safe.includes(".") ? "" : defaultExt(file.type);
    const assetPath = `assets/${idGen()}-${safe}${ext}`;
    const fd = new FormData();
    fd.append("path", `/data/${assetPath}`);
    fd.append("file", file, safe);
    fd.append("isDir", "false");
    const resp = await fetcher("/api/file/putFile", { method: "POST", body: fd });
    const data = await resp.json().catch(() => null);
    if (!data || data.code !== 0) return null; // review P2：HTTP 层非 JSON 错误页也算失败
    return assetPath;
}

function defaultExt(mime: string): string {
    const map: Record<string, string> = {
        "image/png": ".png",
        "image/jpeg": ".jpg",
        "image/gif": ".gif",
        "image/webp": ".webp",
        "image/svg+xml": ".svg",
        "video/mp4": ".mp4",
        "video/webm": ".webm",
        "audio/mpeg": ".mp3",
        "audio/wav": ".wav",
    };
    return map[mime] ?? "";
}

/**
 * 降级链上传：先整批走 ①，未命中的逐个走 ②。返回与入参同序；
 * 任一文件两层全败 → 该项 md=""（调用方清占位并提示，不阻塞其余）。
 */
export async function uploadAssetChain(
    files: File[],
    fetcher: typeof fetch = (globalThis as any).fetch?.bind(globalThis),
    idGen: () => string = NewNodeID,
): Promise<UploadedAsset[]> {
    const out: UploadedAsset[] = files.map(f => ({ name: sanitizeAssetName(f.name), md: "" }));
    if (!files.length) return out;

    let paths: (string | null)[] = files.map(() => null);
    try {
        paths = await uploadViaAssetApi(files, fetcher);
    } catch {
        // 网络层异常整批降级
    }
    files.forEach((f, i) => {
        if (paths[i]) out[i].md = assetMd(f.name, paths[i]!);
    });

    for (let i = 0; i < files.length; i++) {
        if (paths[i]) continue;
        try {
            const path = await uploadViaPutFile(files[i], fetcher, idGen);
            if (path) out[i].md = assetMd(files[i].name, path);
        } catch {
            // 全败留空串
        }
    }
    return out;
}
