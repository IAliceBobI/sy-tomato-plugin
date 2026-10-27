// 思源内核 HTTP API 封装（siyuan 大对象）+ siyuanCache 缓存层。
// 从原 utils.ts 拆出（2026-08 重构），utils.ts 现为 re-export 桶；文件扫描/笔记本/文档树
// 导出等上层工具进一步拆到 fileScanUtils.ts / notebookUtils.ts（2026-08），本文件 re-export
// 保持历史导入路径不变。
// 注意：与 blockUtils.ts / fileScanUtils.ts / notebookUtils.ts 存在循环 import（方法体内互调），
// 与原 utils.ts 内部一致，CJS 打包安全。
import { Config, Constants, fetchSyncPost, confirm } from "siyuan";
import * as gconst from "./gconst";
import { TomatoI18n } from "../tomatoI18n";
import { events } from "./Events";
import { getDocBlocks } from "./docUtils";
import { Siyuan, NewNodeID } from "./globals";
import { timeUtil } from "./timeUtil";
import { extractIDs } from "./strUtils";
import { sleep } from "./miscUtils";
import { debugLog } from "./logUtils";
import { getAllFilesAsBigText } from "./fileScanUtils";
import { cleanDivOnly } from "./blockUtils";
import { IUILayoutTabSearchConfigTypes } from "./types";

// □6（0954 档）p5 告警节流：轮询环族（渐进分片调度等）在书不可达/索引重建期会以
// 500ms~1s 间隔反复命中同码错误——同 code+msg 签名 10s 窗内只 warn 一次，保可诊断
// 性防刷屏（09-14 关笔记本控制台被刷穿实报）。签名按 msg 计（msg 含书 id/块 id 时
// 各自节流，条目有限；失控兜底清空）。
// □1（0921 fball 批）诊断增强：签名并入 url（同 msg 不同端点各自提示，code|msg
// 语义不变）；文案补 url+调用栈前 5 帧——new Error().stack 在 await 恢复段捕获，
// V8 异步栈会带出挂起点链路，bundle 后行号可反查产物定位调用方（陆杰报错帖排查
// 烧多轮难定位的根因之一=旧打点只有 code/msg/reqData）。同步走 debugLog 进 Loki
// （isMe/dev 端口门控，普通用户零副作用），远程用户日志可直接排查。
const p5WarnAt = new Map<string, number>();
function warnP5Throttled(code: unknown, msg: string, reqData: any, url: string) {
    const sig = `${String(code)}|${url}|${msg}`;
    const now = Date.now();
    if (now - (p5WarnAt.get(sig) ?? 0) < 10_000) return;
    if (p5WarnAt.size > 500) p5WarnAt.clear();
    p5WarnAt.set(sig, now);
    // stack 首行=「Error」本体，其后一行一帧；slice(0,6)=前 5 帧
    const frames = (new Error().stack ?? "").split("\n").slice(0, 6);
    console.warn(`p5: ${code} ${msg} ${url} ${JSON.stringify(reqData)}\n${frames.join("\n")}`);
    debugLog("p5", `code=${code} msg=${msg} url=${url} req=${JSON.stringify(reqData)} stack=${frames.join(" | ")}`, "p5");
}

/** 建档 hpath 末段（文档名）元字符 sanitize：内核 createDocWithMd API 层先 path.Base/Dir
 *  按 / 劈段、再 regexp 剥 \t\r\n\u2028\u2029、再 Join 重组（kernel/api/filetree.go）——
 *  名含 / 静默劈两层文档、含控制符静默剥除，全程无报错（渐进侧 volslash □1 同款根因，
 *  splitCore.sanitizeVolName 在调用点已修）。tomato 用户可控字符串拼进末段的调用点散布
 *  （CpBox 正文前 15 字标题段 / switchDraft fast note 文档名前缀 / MixBox refs·tasks
 *  行内容），封装出口统一兜底：只净化最后一段——前缀段是调用方故意拼的层级，合法不动。
 *  末段语义照抄 sanitizeVolName：/ → 全角／（末段经 lastIndexOf 切净后结构上已无 /，
 *  留作裸名分支与语义同源的防御）、\t\r\n\u2028\u2029 → 空格、反斜杠 \ 原样不动
 *  （内核 Go path 只认 /，不过度处理）。幂等（全角／与空格不再命中），重复净化安全。 */
export function sanitizePathTail(path_readable: string): string {
    const idx = path_readable.lastIndexOf("/");
    const head = idx < 0 ? "" : path_readable.slice(0, idx + 1);
    const tail = (idx < 0 ? path_readable : path_readable.slice(idx + 1))
        .replace(/[\t\r\n\u2028\u2029]/g, " ").replace(/\//g, "／");
    return head + tail;
}

/** 用户字符串级（非路径）元字符 sanitize：调用点把用户可控字符串拼进 hpath 前先过此函数。
 *  与 sanitizePathTail 的分工：Tail 出口兜底只净化最后一段，堵不住用户字符串**内嵌** /
 *  ——「设置/关于」拼进 hpath 后 lastIndexOf 切出的末段只剩「关于」，前半「设置」仍被
 *  内核当中间层静默分层建两层文档；封装层无法区分「调用方故意的前缀 /」与「用户名内嵌
 *  的 /」，故正解=调用点对用户字符串本身先净化再拼（渐进侧 splitCore.sanitizeVolName
 *  同款做法）。⚠️ 裸字符串勿复用 sanitizePathTail——裸名含 / 会被它当路径切末段、
 *  前半漏网。语义同源：/ → 全角／、\t\r\n\u2028\u2029 → 空格、反斜杠 \ 原样不动
 *  （内核 Go path 只认 /）。恒 1:1 字符映射（每命中字符恰替换单字符）长度不变——
 *  调用点「先截断后净化」（如 CpBox 正文前 15 字）展示语义不扰动，两序可证等价。
 *  幂等（全角／与空格不再命中），与出口末段净化两级叠加安全。 */
export function sanitizeName(name: string): string {
    return name.replace(/[\t\r\n\u2028\u2029]/g, " ").replace(/\//g, "／");
}

// ============================================
// 建档双通道（思源 3.8.9 结构化寻址适配；事实源=docs/addr-adapt/master-spec.md §2 与
// contract-createDocByParent.md）。3.8.9 起 /api/filetree/createDocWithMd 与 getIDsByHPath
// 的旧 hPath 寻址受限：干净路径暂放行、脏路径报 legacyPathUnsupported/pathAmbiguous，正式版
// 随时可能全禁。策略=旧端点优先（3.8.8 全兼容+自动补建父级+同名静默认领），失败信号驱动切
// createDocByParent 新端点+逐级解析补建，穷尽后显式 throw；定位统一换 SQL。错误显式化只限
// 建档族（callFull 封内用，现有 siyuan.call/post 对外语义一律不动——决策 §4.1）。

/** 建档穷尽两通道后的显式失败。commitState=committed 时文档已落盘（排序/模板阶段失败但
 *  源已提交），调用方勿盲目重试——会建重复文档；unknown=请求可能已落地（网络中断形态），
 *  docID 尽量携带供调用方复核。 */
export class DocCreateError extends Error {
    constructor(
        public reason: string, // 内核 data.reason（legacyPathUnsupported/parentUnavailable/…）或封内合成码
        public lastMsg: string,
        public commitState: "none" | "committed" | "unknown" = "none",
        public docID?: string,
    ) {
        super(`doc create failed [${reason}] ${lastMsg}`.trim());
        this.name = "DocCreateError";
    }
}

/** callFull 传输/响应形态层异常（区别于内核业务 {code,msg,data}，不参与三态吞错语义）：
 *  http=HTTP 404（端点被删形态=legacy 信号，contract §8）、badJson=2xx 响应非 JSON（同上）、
 *  network=fetch 本身失败（瞬态，不作 legacy 信号）。 */
export class EndpointTransportError extends Error {
    constructor(msg: string, public kind: "network" | "http" | "badJson", public status = 0) {
        super(msg);
        this.name = "EndpointTransportError";
    }
}

/** 旧端点拒绝集（按 "notebook|path" 记，决策 §4.2）：旧通道被内核以 legacy 类 reason 拒
 *  （或端点被删 404/非 JSON）时记入——同路径后续建档直走新通道，异路径仍先试旧通道
 *  （contract §6 判定是路径级，全局置位会把一次脏路径事件放大成全会话切新，评审#8）。
 *  ≤128 条、模块级随插件重载清零、不持久化；alpha 全禁形态下代价=每条新路径首建一次失败
 *  往返（建档非高频，可接受）。 */
const legacyPathRejects = new Set<string>();
function markLegacyRejected(key: string) {
    if (legacyPathRejects.size >= 128) legacyPathRejects.clear();
    legacyPathRejects.add(key);
}

/** createDocByParent/resolveDocPath 的同名乐观锁条件（内核 DocumentNameCondition，
 *  contract §2/§7：三键必在、title 非 null、parentID/expectedID 可 null） */
interface DocNameCondition {
    parentID: string | null;
    title: string;
    expectedID: string | null;
}

/** 新端点链路中间态重试信号（resolveParentChain 补建中间段遇 parentUnavailable/planChanged
 *  时上抛，由 createDocSmart 清缓存整链重试一次） */
class ChainRetrySignal extends Error {
    constructor(public reason: string, public msg: string) {
        super(reason);
    }
}

/** 标题 512 rune 截断（对齐旧端点 filetree.go:958-963 静默截断语义，评审#7②：新端点
 *  invalidTitle 拒超长——封内截断防「截断建档」变 throw；rune 感知防 UTF-16 代理对劈半） */
function clampTitle512(title: string): string {
    const runes = Array.from(title);
    if (runes.length <= 512) return title;
    debugLog("addr", `title ${runes.length} runes clipped to 512 (kernel legacy silent-truncation parity)`, "siyuanapi");
    return runes.slice(0, 512).join("");
}

/** 建档锁（notebook 粒度，评审#7③）：新链路 resolve+create 多次往返无内核 createDocLock
 *  全局锁，两个并发对同一缺失父链会各建一份中间层——按 notebook 串行缓解；与 IfNotExists
 *  旧锁名不同不构成嵌套死锁。锁不住跨插件/跨端并发（与旧全局锁的差距诚实接受，nameConditions
 *  乐观锁兜底）。无 locks API 环境（老 webview/单测 node）直通。 */
function withDocCreateLock<T>(notebook: string, fn: () => Promise<T>): Promise<T> {
    const locks = (navigator as unknown as {
        locks?: { request: (name: string, opts: unknown, cb: (lock: unknown) => Promise<T>) => Promise<T> };
    }).locks;
    if (!locks) return fn();
    return locks.request(`tomato.siyuan.createDoc.${notebook}`, { mode: "exclusive" }, async () => fn());
}

/** createDocByParent 单发（未知字段零携带——内核 UnmarshalJSON DisallowUnknownFields，
 *  contract §2：旧接口的 path 等字段顺手传进来会直接解码失败）。返回成败结构不 throw，
 *  供 resolveParentChain（中间段）与 createDocSmart（叶子）各自按 reason 分诊。
 *  （返回扁平结构不用判别联合：本仓 tsconfig strict:false 下判别窄化不生效，实测） */
async function createByParentOnce(
    notebook: string,
    parentID: string | null, // 根级固定 null（传笔记本 ID 不可靠：boxDocEnabled 默认关，contract §4）
    id: string,
    title: string,
    markdown: string, // 空串合法（建空文档）
    nameConditions?: DocNameCondition[],
): Promise<{ ok: boolean; id?: string; reason?: string; msg?: string; commitState?: string }> {
    const req: Record<string, unknown> = {
        notebook,
        parentID,
        id,
        title: { format: "plain", text: title },
        markdown,
    };
    if (nameConditions?.length) req.nameConditions = nameConditions;
    const resp = await siyuan.callFull("/api/filetree/createDocByParent", req);
    if (resp.code === 0) {
        const dataID = resp.data?.id;
        return { ok: true, id: typeof dataID === "string" && dataID ? dataID : id };
    }
    const f = resp.data ?? {};
    return {
        ok: false,
        reason: typeof f.reason === "string" ? f.reason : `code=${resp.code}`,
        msg: resp.msg ?? "",
        commitState: typeof f.commitState === "string" ? f.commitState : "none",
        id: typeof f.id === "string" ? f.id : undefined,
    };
}

/** A 档全段解析+逐级补建（createDocSmart 新通道专用，3.8.9+）：resolveDocPath 逐级精确
 *  匹配标题（COLLATE BINARY）。resolved=全段命中（含末段）=**同名认领**——对齐旧端点
 *  hpathBtMap 复用语义（命中已有文档不建孪生，评审#7①）；ambiguous=取首候选+debugLog 续
 *  解析余段（决策 §4.5：中间层全是插件自管目录，不弹选择框）；missing=自 nextIndex（首个
 *  缺失段下标，treenode ResolveDocumentPath 语义）起逐级补建**中间段**——叶子由调用方携
 *  真实 markdown 落。首个补建段带 missing 响应的 nameConditions 乐观锁（并发改动链路内核
 *  报 planChanged，评审#7③）。已存在前缀按原段名查（不净化——净化会查不中既有落盘名）；
 *  新建中间段先过 sanitizeName（/→全角／：含 / 标题会污染整条 hpath 旧寻址链=亲手造脏
 *  数据，contract §10）+512 rune 截断。 */
async function resolveParentChain(
    notebook: string,
    segments: string[], // 全段（含末段叶子，均非空）
): Promise<{ claimID?: string; parentID: string | null; nameConditions?: DocNameCondition[] }> {
    let start: { kind: "root" } | { kind: "document"; id: string } = { kind: "root" };
    let rest = segments;
    for (;;) {
        const resp = await siyuan.callFull("/api/filetree/resolveDocPath", { notebook, start, segments: rest });
        if (resp.code !== 0) {
            // DocumentAddressingFailure{reason}（invalidTitle/indexUnavailable/…）或裸 {code,msg}
            const reason = resp.data?.reason;
            throw new DocCreateError(typeof reason === "string" ? reason : `code=${resp.code}`, resp.msg ?? "", "none");
        }
        const d = resp.data ?? {};
        if (d.status === "resolved") {
            const leafID = d.resolved?.id;
            if (leafID) return { claimID: leafID, parentID: null };
            // 空 segments+root start 形态 resolved=null（无段可解析=根）——交调用方根级建档
            return { parentID: null };
        }
        if (d.status === "ambiguous") {
            const first: string | undefined = d.candidates?.[0]?.id;
            debugLog("addr", `resolveDocPath ambiguous at #${d.nextIndex} "${rest[d.nextIndex] ?? ""}" — 取首候选 ${first}（决策：不弹选择框）`, "siyuanapi");
            if (!first) throw new DocCreateError("pathAmbiguous", "ambiguous response carries no candidate", "none");
            start = { kind: "document", id: first };
            rest = rest.slice(d.nextIndex + 1);
            continue;
        }
        // missing：nextIndex=首个缺失段。resolved=已解析最深文档（nextIndex=0 时为 null=根）
        const from = typeof d.nextIndex === "number" ? d.nextIndex : 0;
        let parentID: string | null = d.resolved?.id ?? null;
        let conditions: DocNameCondition[] | undefined = Array.isArray(d.nameConditions) ? d.nameConditions : undefined;
        for (let i = from; i < rest.length - 1; i++) { // 只补中间段，叶子留给调用方
            const segTitle = clampTitle512(sanitizeName(rest[i]));
            if (!segTitle) throw new DocCreateError("invalidTitle", `empty segment #${i} in [${rest.join("/")}]`, "none");
            const nid = NewNodeID();
            const r = await createByParentOnce(notebook, parentID, nid, segTitle, "", i === from ? conditions : undefined);
            if (!r.ok) {
                if (r.reason === "parentUnavailable" || r.reason === "planChanged") {
                    throw new ChainRetrySignal(String(r.reason), r.msg ?? "");
                }
                throw new DocCreateError(r.reason ?? "writeFailed", r.msg ?? "", (r.commitState ?? "none") as "none" | "committed" | "unknown", r.id);
            }
            parentID = r.id ?? nid;
            conditions = undefined; // 乐观锁只挂首个补建段（后续段挂自建父下，独占无竞态）
        }
        // 末段即首个缺失段时，乐观锁随叶子建档；中间段全建完则叶子挂自建父下、无需锁
        return { parentID, nameConditions: from === rest.length - 1 ? conditions : undefined };
    }
}

export const siyuan = {
    async pushMsg(msg: string, timeoutMs = 7000) {
        const url = "/api/notification/pushMsg";
        // 不拼时间戳等隐藏后缀：3.8.x notification 链路剥 HTML 属性，任何后缀都会暴露给用户；
        // 内核 showMessage 对相邻同文消息只保留最新一条并重置计时（app/src/dialog/message.ts），
        // 重复推送最多不堆叠，无需绕过
        const response = await fetchSyncPost(url, { msg, timeout: timeoutMs });
        if (response.code != 0) {
            throw Error(`${url}: code=${response.code}, msg=${response.msg}`);
        }
        return response.data;
    },
    async currentTime(secs = 0) {
        return timeUtil.dateFormat(new Date(await siyuan.currentTimeMs(secs)));
    },
    async currentTimeMs(secs = 0): Promise<number> {
        const response = await fetchSyncPost("/api/system/currentTime", {});
        return response.data + secs * 1000;
    },
    async currentTimeSec(secs = 0): Promise<number> {
        return siyuan.currentTimeMs(secs).then(ms => Math.ceil(ms / 1000))
    },
    async getWorkspaces() {
        const response = await fetchSyncPost("/api/system/getWorkspaces", {});
        return response.data
    },
    async copyFile(src: string, dest: string) {
        return siyuan.call("/api/file/copyFile", { src, dest });
    },
    async statAsset(path: string) {
        return siyuan.call("/api/asset/statAsset", { path });
    },
    async readDir(path: string): Promise<{ isDir: boolean, isSymlink: boolean, name: string, updated: string }[]> {
        // await utils_zZmqus5PtYRi.siyuan.readDir("/data/plugins/sy-tomato-plugin/i18n")
        return siyuan.call("/api/file/readDir", { path });
    },
    async performSync(upload = false, mobileSwitch = false) {
        return siyuan.call("/api/sync/performSync", { upload, mobileSwitch });
    },
    async performBootSync() {
        return siyuan.call("/api/sync/performBootSync", {});
    },
    async listCloudSyncDir() {
        return siyuan.call("/api/sync/listCloudSyncDir", {});
    },
    async removeFile(path: string) {
        return siyuan.call("/api/file/removeFile", { path });
    },
    async copyFile2(src: string, dest: string) {
        // await utils_zZmqus5PtYRi.siyuan.copyFile("/data/plugins/sy-tomato-plugin/i18n/empty.xmind","/data/assets/abc.xmind")
        const bs = await siyuan.getFileBinary(src);
        return siyuan.putFile(dest, bs);
    },
    async putFile(path: string, value: any) {
        let file: File;
        if (value instanceof ArrayBuffer) {
            const uint8Array = new Uint8Array(value);
            file = new File([new Blob([uint8Array])], path.split("/").pop());
        } else if (typeof value === "object") {
            file = new File([new Blob([JSON.stringify(value)], {
                type: "application/json"
            })], path.split("/").pop());
        } else {
            file = new File([new Blob([value])], path.split("/").pop());
        }
        const formData = new FormData();
        formData.append("path", path);
        formData.append("file", file);
        formData.append("isDir", "false");
        const method = "POST";
        const resp = await fetch("/api/file/putFile", {
            method,
            body: formData,
        });
        const data = await resp.json();
        if (data.code && data.code != 0) {
            console.error("code=%s %s", data.code, data.msg);
            return null;
        }
        return data.data;
    },
    async getFileBinary(path: string): Promise<ArrayBuffer> {
        try {
            const method = "POST";
            const headers = { "Content-Type": "application/json" };
            const response = await fetch("/api/file/getFile", {
                method,
                headers,
                body: JSON.stringify({ path }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const blobData = await response.blob();
            return blobData.arrayBuffer();
        } catch (error) {
            console.error("Error fetching file binary:", error);
            throw error; // re-throw the error so it can be caught by the caller, if needed
        }
    },
    async getFile(path: string) {
        const method = "POST";
        const headers = { "Content-Type": "application/json" };
        const data = await fetch("/api/file/getFile", {
            method,
            headers,
            body: JSON.stringify({ path }),
        });
        return data.text();
    },
    async getJson(path: string) {
        const txt = await siyuan.getFile(path);
        try {
            return JSON.parse(txt);
        } catch (e) {
            console.error(e)
        }
    },
    // =================================
    async call(url: string, reqData: any) {
        const method = "POST";
        const headers = { "Content-Type": "application/json" };
        try {
            const data = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(reqData),
            });
            const json = await data.json();
            if (json?.code && json?.code != 0) {
                warnP5Throttled(json?.code, json?.msg, reqData, url);
                return null;
            }
            if (json?.data === undefined)
                return data;
            return json.data;
        } catch (e) {
            console.warn(e, url, reqData);
        }
    },
    /** 完整响应版 call（封内建档族专用，不动 call 三态吞错语义——决策 §4.1）：返
     *  {code,msg,data} 全量信封，内核业务失败（code≠0）原样返回供上层读 data.reason 分诊；
     *  传输/响应形态层异常以 EndpointTransportError throw：HTTP 404/非 JSON=端点被删形态
     *  （legacy 信号切新通道，附加加固），fetch 网络异常=瞬态不作 legacy 信号。 */
    async callFull(url: string, reqData: any): Promise<{ code?: number; msg?: string; data?: any }> {
        let resp: Response;
        try {
            resp = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reqData),
            });
        } catch (e) {
            throw new EndpointTransportError(e instanceof Error ? e.message : String(e), "network");
        }
        if (resp.status === 404) throw new EndpointTransportError(`HTTP 404 ${url}`, "http", 404);
        if (!resp.ok) return { code: resp.status, msg: `HTTP ${resp.status} ${url}` }; // 5xx 等=普通 code≠0 失败
        try {
            return await resp.json() as { code?: number; msg?: string; data?: any };
        } catch (e) {
            throw new EndpointTransportError(`non-JSON response from ${url}`, "badJson", resp.status);
        }
    },
    transSetAttrViewColWrap(avID: string, blockID: string, colID: string, wrap = true) {
        const op = {} as IOperation;
        op.action = "setAttrViewColWrap";
        op.avID = avID;
        op.blockID = blockID;
        op.id = colID;
        op.data = wrap;
        return op;
    },
    transSetAttrViewColHidden(avID: string, blockID: string, colID: string, hide = true) {
        const op = {} as IOperation;
        op.action = "setAttrViewColHidden";
        op.avID = avID;
        op.blockID = blockID;
        op.id = colID;
        op.data = hide
        return op;
    },
    transSetAttrViewSorts(avID: string, blockID: string, colID: string, order: "ASC" | "DESC") {
        const op = {} as IOperation;
        op.action = "setAttrViewSorts";
        op.avID = avID;
        op.blockID = blockID;
        op.data = [{ column: colID, order }]
        return op;
    },
    transSetAttrViewColCalc(avID: string, blockID: string, colID: string, operator: CalcOperator) {
        const op = {} as IOperation;
        op.action = "setAttrViewColCalc";
        op.avID = avID;
        op.data = { operator };
        op.blockID = blockID;
        op.id = colID;
        return op;
    },
    transSetAttrViewFilters(avID: string, blockID: string, filters: IAVFilter[]) {
        const op = {} as IOperation;
        op.action = "setAttrViewFilters";
        op.avID = avID;
        op.data = filters;
        op.blockID = blockID;
        return op;
    },
    transSetAttrViewViewName(avID: string, viewID: string, name: string) {
        const op = {} as IOperation;
        op.action = "setAttrViewViewName";
        op.avID = avID;
        op.id = viewID;
        op.data = name;
        return op;
    },
    transUpdateAttrViewCol(avID: string, colId: string, name: string, type?: TAVCol) {
        const op = {} as IOperation;
        op.action = "updateAttrViewCol";
        op.id = colId;
        op.avID = avID;
        op.name = name;
        op.type = type;
        return op;
    },
    transSetAttrViewName(avID: string, name: string) {
        const op = {} as IOperation;
        op.action = "setAttrViewName";
        op.id = avID;
        op.data = name;
        return op;
    },
    transRemoveAttrViewCol(avID: string, colID: string) {
        const op = {} as IOperation;
        op.action = "removeAttrViewCol";
        op.avID = avID;
        op.id = colID;
        return op;
    },
    transAddAttrViewCol(avID: string, name: string, id = NewNodeID(), type: TAVCol = "text", previousID = "") {
        const op = {} as IOperation;
        op.action = "addAttrViewCol";
        op.avID = avID;
        op.name = name;
        op.previousID = previousID;
        op.type = type;
        op.id = id;
        return op;
    },
    transUpdateAttrViewCellBatch(args: { avID: string, cellID?: string, colID: string, rowID_BlockID: string, value: IAVCellValue }[]) {
        return args.map(arg => {
            const op = {} as IOperation;
            op.action = "updateAttrViewCell";
            op.avID = arg.avID;
            op.id = arg.cellID;
            op.keyID = arg.colID;
            op.rowID = arg.rowID_BlockID;
            op.data = arg.value;
            return op;
        })
    },
    transInsertAttrViewBlock(avID: string, blockID: string, srcs: IOperationSrcs[], previousID = "", ignoreFillFilter = true) {
        const op = {} as IOperation;
        op.action = "insertAttrViewBlock";
        op.avID = avID;
        op.blockID = blockID;
        op.previousID = previousID;
        op.ignoreFillFilter = ignoreFillFilter;
        op.srcs = srcs;
        return op;
    },
    transDoUpdateUpdated(blockID: string, data = timeUtil.getYYYYMMDDHHmmss()) {
        const op = {} as IOperation;
        op.action = "doUpdateUpdated";
        op.id = blockID
        op.data = data
        return op;
    },
    async getAttributeView(id: string): Promise<GetAttributeView> {
        return siyuan.call("/api/av/getAttributeView", { id });
    },
    async getItemIDsByBoundIDs(avID: string, blockIDs: string[]): Promise<Record<string, string>> {
        return siyuan.call("/api/av/getAttributeViewItemIDsByBoundIDs", { avID, blockIDs });
    },
    async renderAttributeView(id: string, pageSize = 50, page = 1, query = "", viewID = ""): Promise<RenderAttributeView> {
        if (page <= 0) throw Error("页码必须大于等于1")
        return siyuan.call("/api/av/renderAttributeView", { id, pageSize, query, page, viewID });
    },
    async removeUnusedAsset(path: string): Promise<{ path: string }> {
        return siyuan.call("/api/asset/removeUnusedAsset", { path });
    },
    async removeUnusedAssets(): Promise<{ paths: string[] }> {
        return siyuan.call("/api/asset/removeUnusedAssets", {});
    },
    async getMissingAssets(): Promise<{ missingAssets: string[] }> {
        return siyuan.call("/api/asset/getMissingAssets", {});
    },
    async getUnusedAssets(): Promise<{ unusedAssets: string[] }> {
        return siyuan.call("/api/asset/getUnusedAssets", {});
    },
    async getDocCreateSavePath(notebookID: string): Promise<{ path: string }> {
        const notebook = notebookID;
        return siyuan.call("/api/filetree/getDocCreateSavePath", { notebook });
    },
    async getRefCreateSavePath(notebookID: string): Promise<{ path: string }> {
        const notebook = notebookID;
        return siyuan.call("/api/filetree/getRefCreateSavePath", { notebook });
    },
    async openNotebook(notebookID: string) {
        const notebook = notebookID;
        return siyuan.call("/api/notebook/openNotebook", { notebook });
    },
    async getNotebookByName(name: string): Promise<LsNotebook> {
        const resp = await siyuan.call("/api/notebook/lsNotebooks", {});
        for (const book of resp?.["notebooks"] ?? []) {
            if (book.name === name) {
                return book;
            }
        }
        return {} as LsNotebook;
    },
    async lsNotebooks(closed?: boolean): Promise<LsNotebook[]> {
        const resp = await siyuan.call("/api/notebook/lsNotebooks", {});
        if (closed == null) {
            return resp["notebooks"];
        }
        const l = [];
        for (const book of resp["notebooks"]) {
            if (book.closed === closed) {
                l.push(book);
            }
        }
        return l;
    },
    async sqlAsset(stmt: string): Promise<Asset[]> {
        // from assets
        return (await siyuan.call("/api/query/sql", { stmt })) ?? [];
    },
    async sqlSpan(stmt: string): Promise<Span[]> {
        // from spans
        return (await siyuan.call("/api/query/sql", { stmt })) ?? [];
    },
    async sqlRef(stmt: string): Promise<Ref[]> {
        // from refs
        return (await siyuan.call("/api/query/sql", { stmt })) ?? [];
    },
    async sqlAttr(stmt: string): Promise<Attributes[]> {
        // from attributes
        return (await siyuan.call("/api/query/sql", { stmt })) ?? [];
    },
    async sql(stmt: string): Promise<Block[]> {
        // from blocks
        return (await siyuan.call("/api/query/sql", { stmt })) ?? [];
    },
    async sqlOne(stmt: string): Promise<Block> {
        const ret = await siyuan.sql(stmt);
        if (ret.length >= 1) {
            return ret[0];
        }
        return {} as Block;
    },
    async getParentRowByID(id: string) {
        if (id) {
            return siyuan.sql(`select * from blocks where id in (
                select parent_id from blocks where id="${id}" limit 1
            ) limit 1`).then(rows => rows?.at(0));
        }
    },
    async getDocRowsByName(name: string): Promise<Block[]> {
        if (!name) return []
        return siyuan.sql(`select * from blocks where content="${name}" and type="d" limit 10000000`)
    },
    async getDocAttrs(docID: string, name: string): Promise<Attributes[]> {
        return siyuan.sqlAttr(`select * from attributes where root_id="${docID}" and name="${name}"`);
    },
    async getBlockIndex(id: string): Promise<number> {
        return await siyuan.call("/api/block/getBlockIndex", { id });
    },
    async getBlocksIndexes(ids: string[]): Promise<Record<string, number>> {
        return await siyuan.call("/api/block/getBlocksIndexes", { ids });
    },
    async getBlockBreadcrumb(id: string, excludeTypes: string[] = []): Promise<BreadcrumbPath[]> {
        return await siyuan.call("/api/block/getBlockBreadcrumb", { id, excludeTypes });
    },
    async setUILayout(layout: Config.IUiLayout) {
        return siyuan.call("/api/system/setUILayout", { layout });
    },
    async getConf(): Promise<{ conf: Config.IConf, start: boolean }> {
        return siyuan.call("/api/system/getConf", {});
    },
    async flushTransaction(): Promise<any> {
        return await siyuan.call("/api/sqlite/flushTransaction", {});
    },
    async createDocWithMdIfNotExists(notebookID: string, path_readable: string, markdown: string, attr?: AttrType): Promise<string> {
        // 末段净化须发生在查库之前：内核落盘会剥名内控制符（含 / 分层），查建同用净化后
        // path 才能保 NotExists 语义自洽——原始 path 查不中剥过的落盘名→重复建档
        const path = sanitizePathTail(path_readable);
        // 双锁并存：本层全局锁保 IfNotExists 查-建原子（原有语义不变）；createDocSmart
        // 内再按 notebook 粒度串行（评审#7③ 锁扩面）——锁名不同，嵌套无死锁
        return navigator.locks.request("tomato.siyuan.createDocWithMdIfNotExists", { mode: "exclusive" }, async (_lock) => {
            const row = await siyuan.sqlOne(`select id from blocks where box="${notebookID}" and hpath="${path}" and type='d' limit 1`);
            const docID = row?.id ?? "";
            if (!docID) {
                // 建档分支自动跟随双通道：寻址被拒穷尽后 throw（B1 桶调用方补 catch）
                return siyuan.createDocWithMd(notebookID, path, markdown, "", attr);
            }
            return docID;
        });
    },
    /** 建档双通道统一入口（思源 3.8.9 结构化寻址适配）：旧端点 createDocWithMd 优先
     *  （3.8.8 全兼容+自动补建父级+同名静默认领），被内核以 legacy 类 reason 拒或端点被删
     *  （404/非 JSON）→ 按路径记拒绝集、切新通道 createDocByParent：A 档 resolveParentChain
     *  全段解析+逐级补建+同名认领；C 档 opts.parentID 直给（B0 传参点，tomato 本体暂无
     *  传入方）。穷尽后 throw DocCreateError（寻址被拒显式化）；data:null 索引窗返 ""（不
     *  throw 不重试——评审#2 旧静默契约，误判失败诱重试会建重复文档）。parentUnavailable/
     *  planChanged（链路被并发改动）清拒绝集整链重试一次；commitState=committed 当成功。
     *  整体按 notebook 粒度 navigator.locks 串行。attr 两步 IAL 后挂（返回前）。 */
    async createDocSmart(notebook: string, hpath: string, markdown: string, opts: { id?: string; attr?: AttrType; parentID?: string } = {}): Promise<string> {
        return withDocCreateLock(notebook, async () => {
            // 出口末段净化（幂等）：两通道共用净化后 path（查建同源）；末段即新端点 title
            const path = sanitizePathTail(hpath);
            const segs = path.split("/").filter(s => s !== "");
            const title = clampTitle512(segs.pop() ?? "");
            if (!title) throw new DocCreateError("invalidTitle", `empty document title in hpath "${path}"`, "none");
            // ""（非法值，封内拒绝）与 undefined（不传=A 档全段解析）显式区分——C 档落地
            // 前提（评审2轮#6 workbench 侧同款语义）
            if (opts.parentID === "") throw new DocCreateError("parentUnavailable", "parentID: empty string is not a valid parent (use null or omit)", "none");
            const rejectKey = `${notebook}|${path}`;

            // ── 旧通道：该路径不在拒绝集才试（干净路径 3.8.8/3.8.9-dev 照常，自动补建+
            //    同名静默认领是旧端点独有能力，故旧优先——决策 §4.3）──
            let id = "";
            if (!legacyPathRejects.has(rejectKey)) {
                try {
                    const params: Record<string, unknown> = opts.id ? { notebook, path, markdown, id: opts.id } : { notebook, path, markdown };
                    const resp = await siyuan.callFull("/api/filetree/createDocWithMd", params);
                    if (resp.code === 0) {
                        id = typeof resp.data === "string" ? resp.data : "";
                        if (!id) {
                            // data 空兜底序（评审#2，承 :470 旧注释语义）：①回填预生成 id（已随
                            // 文档落盘最稳）②SQL 回查（索引窗内可能查不中）③仍不中=索引窗、
                            // 文档已落盘——返 "" 不 throw 不重试（显式 throw 只留寻址被拒）
                            id = opts.id ?? (await siyuan.docIDsByHPath(notebook, path))[0] ?? "";
                            if (!id) {
                                debugLog("addr", `createDocWithMd code=0 but data empty (kernel data:null window) path=${path} — silent "" per legacy contract`, "siyuanapi");
                                return "";
                            }
                        }
                    } else {
                        const reason = resp.data?.reason;
                        if (reason === "legacyPathUnsupported" || reason === "pathAmbiguous" || reason === "indexUnavailable") {
                            markLegacyRejected(rejectKey); // 记拒绝集，进新通道
                        } else {
                            throw new DocCreateError(typeof reason === "string" ? reason : `code=${resp.code}`, resp.msg ?? "", "none");
                        }
                    }
                } catch (e) {
                    if (e instanceof DocCreateError) throw e;
                    if (e instanceof EndpointTransportError && e.kind !== "network") {
                        // HTTP 404/非 JSON=端点被删形态（附加加固）：legacy 信号，记拒绝集切新通道
                        markLegacyRejected(rejectKey);
                    }
                    // network：瞬态不记拒绝集（下次仍先试旧通道），本轮落新通道兜底
                }
            }
            if (id) {
                if (opts.attr) await siyuan.setBlockAttrs(id, opts.attr);
                return id;
            }

            // ── 新通道（3.8.9+；旧内核上 404 → EndpointTransportError 转 DocCreateError）──
            const newID = opts.id ?? NewNodeID();
            for (let attempt = 0; ; attempt++) {
                try {
                    let parentID: string | null;
                    let leafConditions: DocNameCondition[] | undefined;
                    if (opts.parentID !== undefined) {
                        parentID = opts.parentID; // C 档：父 id 直给跳过解析；同名预检靠调用方 find-first
                    } else {
                        const chain = await resolveParentChain(notebook, [...segs, title]);
                        if (chain.claimID) {
                            // A 档全段命中=同名认领，直接复用不建孪生（等价旧 hpathBtMap 复用）
                            if (opts.attr) await siyuan.setBlockAttrs(chain.claimID, opts.attr);
                            return chain.claimID;
                        }
                        parentID = chain.parentID;
                        leafConditions = chain.nameConditions;
                    }
                    const r = await createByParentOnce(notebook, parentID, newID, title, markdown, leafConditions);
                    if (r.ok) {
                        const rid = r.id ?? newID;
                        if (opts.attr) await siyuan.setBlockAttrs(rid, opts.attr);
                        return rid;
                    }
                    if (r.commitState === "committed") {
                        // 排序/模板阶段失败但源已提交——文档其实已建成，当成功防重复建档（contract §3.1）
                        const cid = r.id ?? newID;
                        if (opts.attr && r.id) await siyuan.setBlockAttrs(cid, opts.attr);
                        return cid;
                    }
                    if ((r.reason === "parentUnavailable" || r.reason === "planChanged") && attempt === 0) {
                        // 链路被并发改动：清拒绝集（旧通道有机会复通）+整链重解析重试一次
                        legacyPathRejects.clear();
                        continue;
                    }
                    throw new DocCreateError(r.reason ?? "writeFailed", r.msg ?? "", (r.commitState ?? "none") as "none" | "committed" | "unknown", r.id);
                } catch (e) {
                    if (e instanceof ChainRetrySignal) {
                        if (attempt === 0) {
                            legacyPathRejects.clear();
                            continue;
                        }
                        throw new DocCreateError(e.reason, e.msg, "none");
                    }
                    if (e instanceof EndpointTransportError) {
                        // 新端点不可达：404=旧内核无此端点（未落盘 none）；网络/非 JSON=请求
                        // 可能已落地（unknown，携 newID 供复核）
                        const committed = e.kind === "http" ? "none" : "unknown";
                        throw new DocCreateError(e.kind === "http" ? "newEndpointUnavailable" : "writeFailed", e.message, committed, e.kind === "http" ? undefined : newID);
                    }
                    throw e;
                }
            }
        });
    },
    async createDocWithMd(notebookID: string, path_readable: string, markdown: string, id = "", attr?: any): Promise<string> {
        // 兼容壳（签名/返回不变：渐进 11 文件/recite 4 链/seller 4 处/tomato 19 处调用零
        // 改动）：实体=createDocSmart 双通道。行为差异=寻址被拒穷尽两通道后从返 "" 变
        // throw DocCreateError（B1 桶调用方补 catch）；data:null 索引窗仍返 ""（旧静默契约）
        return siyuan.createDocSmart(notebookID, path_readable, markdown, { id: id || undefined, attr });
    },
    async getDocRowByBlockID(id: string) {
        return siyuan.sqlOne(`select * from blocks where id in (select root_id from blocks where id="${id}") limit 1`);
    },
    async removeDoc(notebookID: string, path_not_readable: string) {
        return siyuan.call("/api/filetree/removeDoc", { notebook: notebookID, path: path_not_readable });
    },
    async renameDocByID(docID: string, title: string) {
        const row = await siyuan.sqlOne(`select box,path from blocks where type='d' and id="${docID}"`);
        if (row?.box && row?.path) {
            return siyuan.renameDoc(row.box, row.path, title);
        }
    },
    async renameDoc(notebookID: string, path_not_readable: string, title: string) {
        return siyuan.call("/api/filetree/renameDoc", { notebook: notebookID, title, path: path_not_readable });
    },
    async moveDocs(fromPaths: string[], toPath: string, toNotebook: string, callback?: string) {
        if (callback)
            return siyuan.call("/api/filetree/moveDocs", { fromPaths, toPath, toNotebook, callback });
        return siyuan.call("/api/filetree/moveDocs", { fromPaths, toPath, toNotebook });
    },
    async duplicateDoc(id: string): Promise<{ "id": string, "notebook": string, "path": string, "hPath": string }> {
        return siyuan.call("/api/filetree/duplicateDoc", { id });
    },
    async removeDocByIDSiyuan(docID: string) {
        return siyuan.call("/api/filetree/removeDocByID", { id: docID });
    },
    async removeDocByID(docID: string) {
        let count = 10;
        while (count-- > 0) {
            const row = await this.sqlOne(`select box, path from blocks where id="${docID}" and type="d"`);
            const box = row?.box ?? "";
            const path = row?.path ?? "";
            if (box && path) {
                return siyuan.removeDoc(box, path);
            }
            await sleep(1000);
        }
        return {};
    },
    async insertLocalAssets(id: string, assetPaths: string, isUpload = false): Promise<any> {
        return siyuan.call("/api/asset/insertLocalAssets", { id, assetPaths, isUpload });
    },
    async getDocOutline(id: string): Promise<GetDocOutline[]> {
        return siyuan.call("/api/outline/getDocOutline", { id });
    },
    async resolveAssetPath(path: string): Promise<string> {
        // get abs path in the OS.
        return siyuan.call("/api/asset/resolveAssetPath", { path });
    },
    async renameAsset(oldPath: string, newName: string): Promise<any> {
        // copy file to assets/ and then raname
        return siyuan.call("/api/asset/renameAsset", { oldPath, newName });
    },
    async createSnapshot(memo = "created by sy-tomato-plugin") {
        const ret = await siyuan.call("/api/repo/createSnapshot", { memo });
        siyuan.pushMsg("snapshot created");
        return ret;
    },
    async purgeRepo() {
        return siyuan.call("/api/repo/purgeRepo", {});
    },
    async purgeCloudRepo() {
        return siyuan.call("/api/repo/purgeCloudRepo", {});
    },
    async getDocImageAssets(id: string): Promise<string[]> {
        // find and list images only
        return siyuan.call("/api/asset/getDocImageAssets", { id });
    },
    async transferBlockRef(fromID: string, toID: string, reloadUI = true): Promise<any> {
        return siyuan.call("/api/block/transferBlockRef", { fromID, toID, reloadUI });
    },
    // notebook 内核侧不存在时 code 1 → siyuan.call 返 null（fballshort □6：调用方
    // 须判空——petal 指向已不存在笔记本的复刻/迁移空间会踩）
    async createDailyNote(notebook: string): Promise<{ id: string } | null> {
        return siyuan.call("/api/filetree/createDailyNote", { notebook });
    },
    async checkBlockExist(id: string): Promise<boolean> {
        if (!id) return false;
        return siyuan.call("/api/block/checkBlockExist", { id });
    },
    async getBlockDOM(id: string): Promise<{ dom: string, id: string }> {
        return siyuan.call("/api/block/getBlockDOM", { id });
    },
    async setBlockAttrs(id: string, attrs: AttrType) {
        return siyuan.call("/api/attr/setBlockAttrs", { id, attrs });
    },
    transbatchSetBlockAttrs(blockAttrs: { id: string, attrs: AttrType }[]) {
        return blockAttrs.map(b => {
            const op = {} as IOperation;
            op.action = "setAttrs";
            op.id = b.id;
            op.data = JSON.stringify(b.attrs);
            return op;
        });
    },
    async batchSetBlockAttrsTrans(blockAttrs: { id: string, attrs: AttrType }[]) {
        return siyuan.transactions(siyuan.transbatchSetBlockAttrs(blockAttrs));
    },
    transBatchUpdateAttrs(blockAttrs: { id: string, old: AttrType, new: AttrType }[]) {
        return blockAttrs.map(b => {
            const op = {} as IOperation;
            op.action = "updateAttrs";
            op.id = b.id;
            op.data = JSON.stringify({ old: b.old, new: b.new });
            return op;
        });
    },
    async batchUpdateAttrsTrans(blockAttrs: { id: string, old: AttrType, new: AttrType }[]) {
        return siyuan.transactions(siyuan.transBatchUpdateAttrs(blockAttrs));
    },
    async batchSetBlockAttrs(blockAttrs: { id: string, attrs: AttrType }[]) {
        if (blockAttrs.length > 0) return siyuan.call("/api/attr/batchSetBlockAttrs", { blockAttrs });
    },
    async batchGetBlockAttrs(ids: string[]): Promise<{ [blockID: string]: AttrType }> {
        return siyuan.call("/api/attr/batchGetBlockAttrs", { ids });
    },
    async getBlockAttrs(id: string): Promise<AttrType> {
        const r = await siyuan.call("/api/attr/getBlockAttrs", { id });
        return r ?? {}
    },
    async getNotebookConf(notebookID: string): Promise<GetNotebookConf> {
        return siyuan.call("/api/notebook/getNotebookConf", { "notebook": notebookID });
    },
    async getDocIDByBlockID(id: string): Promise<string> {
        if (!id) return ""
        const row = await siyuan.sqlOne(`select root_id from blocks where id='${id}'`);
        return row["root_id"] ?? "";
    },
    async getRowByID(id: string) {
        const row = await siyuan.sqlOne(`select * from blocks where id='${id}'`);
        return row;
    },
    async getRows(chilrenIDs: string[], selected = "*", ordered = true, ands: string[] = [], allowNull = false): Promise<Block[]> {
        if (!chilrenIDs || chilrenIDs.length == 0) return [];
        selected = selected.trim();
        if (selected != "*") {
            const s = new Set(selected.split(","));
            s.add("id");
            selected = [...s.values()].join(",");
        }
        const placeholders = chilrenIDs.map(id => `"${id}"`).join(",");
        const sqlBuilder = [];
        sqlBuilder.push(`SELECT ${selected} FROM blocks WHERE id IN (${placeholders})`);
        ands.forEach(a => sqlBuilder.push("AND " + a));
        sqlBuilder.push("limit 100000000");
        const rows = await siyuan.sql(sqlBuilder.join(" "));
        if (ordered) {
            const rowMap = rows.reduce((m, r) => {
                m.set(r.id, r);
                return m;
            }, new Map());
            if (allowNull) {
                return chilrenIDs.map(id => rowMap.get(id));
            } else {
                return chilrenIDs.map(id => rowMap.get(id)).filter(i => i != null);
            }
        }
        return rows;
    },
    async getChildBlocks(id: string): Promise<GetChildBlocks[]> {
        if (!id) return [];
        return siyuan.call("/api/block/getChildBlocks", { id });
    },
    /** hpath→文档 id 定位（getIDsByHPath 的替代，全版本可用）：SQL 查 blocks（走
     *  /api/query 不经被禁端点）。值内 " → "" 双写转义（封内强制，评审#3：/api/query 只收
     *  语句串无参数化通道，定位输入面含回读真实标题，sanitizePathTail 不碰引号）。
     *  边界（与旧端点同界，注释声明）：同名多行返数组同旧行为；异步索引滞后——刚建文档
     *  查不到（shorthandRelay 6811 坑同族），只服务「找既有文档」；查询失败/无命中返 []。 */
    async docIDsByHPath(notebookID: string, hpath: string): Promise<string[]> {
        const esc = (s: string) => s.replaceAll('"', '""');
        const rows = await siyuan.sql(`select id from blocks where box="${esc(notebookID)}" and hpath="${esc(hpath)}" and type='d'`);
        return (rows ?? []).map((r: any) => r?.id).filter((i: unknown): i is string => typeof i === "string");
    },
    async getIDsByHPath(hpath: string, notebookID: string): Promise<string[]> {
        // 旧名兼容别名（参序维持 (hpath, notebookID)，shorthandRelay 等既有调用零改动）：
        // 3.8.9 起旧端点对脏路径报 legacy 错被 call 吞成 null → 调用方误判「不存在」——
        // 统一换 SQL 单通道（master-spec §2.2）。return ['20231102203317-gj54aex']
        return siyuan.docIDsByHPath(notebookID, hpath);
    },
    async getTag(sort = 4): Promise<Tag[]> {
        return siyuan.call("/api/tag/getTag", { sort });
    },
    async copyStdMarkdown(id: string): Promise<string> {
        if (!id) return ""
        return siyuan.call("/api/lute/copyStdMarkdown", { id });
    },
    async copyStdMarkdownForPromptKeepTitle(id: string): Promise<string> {
        let txt = await siyuan.copyStdMarkdown(id)
        if (!txt) txt = ""
        return txt.split("---").at(0)
    },
    async copyStdMarkdownForPromptWithoutTitle(id: string): Promise<string> {
        let txt = await siyuan.copyStdMarkdown(id)
        if (!txt) txt = ""
        return txt.split("---").at(0).split("\n").slice(1).join("\n")
    },
    async copyStdMarkdownWithoutTitle(id: string): Promise<string> {
        let txt = await siyuan.copyStdMarkdown(id)
        if (!txt) txt = ""
        return txt.split("\n").slice(1).join("\n")
    },
    async copyStdMarkdownForPromptLastN(id: string, num: number): Promise<string> {
        let txt = await siyuan.copyStdMarkdown(id)
        if (!txt) txt = ""
        return txt.split("---").slice(-num).join("\n")
    },
    async getContentWordCount(content: string): Promise<GetBlocksWordCount> {
        return siyuan.call("/api/block/getContentWordCount", { content });
    },
    async getBlocksWordCount(ids: string[]): Promise<GetBlocksWordCount> {
        // if ids.length > 1, like wordCount will be the sum of blocks.
        return siyuan.call("/api/block/getBlocksWordCount", { ids });
    },
    // don't append to doc after clearAll
    async clearAll(docID: string) {
        const blocks = await siyuan.getChildBlocks(docID);
        return siyuan.deleteBlocks(blocks.map((b: any) => b["id"]));
    },
    transDeleteBlocks(ids: string[]) {
        return ids?.map(id => {
            const op = {} as IOperation;
            op.action = "delete";
            op.id = id;
            return op;
        }) ?? [];
    },
    async deleteBlock(id: string) {
        return siyuan.call("/api/block/deleteBlock", { id });
    },
    async deleteBlocks(ids: string[]) {
        if (ids?.length > 0)
            return siyuan.transactions(siyuan.transDeleteBlocks(ids));
    },
    transMoveBlocksAfter(ids: string[], previousID: string) {
        return ids.slice().reverse().map(id => {
            const op = {} as IOperation;
            op.action = "move";
            op.id = id;
            op.previousID = previousID;
            return op;
        });
    },
    async moveBlocksAfter(ids: string[], previousID: string) {
        return siyuan.transactions(siyuan.transMoveBlocksAfter(ids, previousID));
    },
    async moveBlockAfter(id: string, previousID: string) {
        return siyuan.call("/api/block/moveBlock", { id, previousID });
    },
    async moveBlockAsChild(id: string, parentID: string) {
        return siyuan.call("/api/block/moveBlock", { id, parentID });
    },
    /** ⚠ move op 实为头插语义（挂到 parentID=插到首位，reverse 配套保序）；空片头尾
     *  等价掩盖了这一点——搬进非空文档须用 moveBlocksAfter(尾块锚) 尾插（slotmerge
     *  6810 实锤：非空槽挂子=新块顶到原内容之前）。另：内核空文档恒补空 p 块，
     *  「搬空后 getChildBlocks 严格空判」恒 false，空校验须过滤空段落 */
    transMoveBlocksAsChild(ids: string[], parentID: string) {
        return ids.slice().reverse().map(id => {
            const op = {} as IOperation;
            op.action = "move";
            op.id = id;
            op.parentID = parentID;
            return op;
        });
    },
    async moveBlocksAsChild(ids: string[], parentID: string) {
        return siyuan.transactions(siyuan.transMoveBlocksAsChild(ids, parentID));
    },
    async getDocLastID(id: string) {
        return siyuan.getTailChildBlocks(id, 1).then(r => r?.at(0)?.id)
    },
    async getTailChildBlocks(id: string, n: number): Promise<[{ id: string, type: string }]> {
        return siyuan.call("/api/block/getTailChildBlocks", { id, n });
    },
    async getBlockKramdown(id: string): Promise<GetBlockKramdown> {
        return siyuan.call("/api/block/getBlockKramdown", { id });
    },
    async refreshVirtualBlockRef() {
        return siyuan.call("/api/setting/refreshVirtualBlockRef", {});
    },
    async setAppearance(conf: Config.IAppearance) {
        return siyuan.call("/api/setting/setAppearance", conf);
    },
    async updateBlock(id: string, data: string, dataType: "markdown" | "dom" = "markdown") {
        return siyuan.call("/api/block/updateBlock", { id, data, dataType });
    },
    async safeUpdateBlock(id: string, data: string, dataType: "markdown" | "dom" = "markdown") {
        let i = 20;
        do {
            const e = await siyuan.checkBlockExist(id);
            if (e) {
                return siyuan.call("/api/block/updateBlock", { id, data, dataType });
            }
            await sleep(400);
        } while (--i > 0);
    },
    transUpdateBlocks(ops: { id: string, domStr: string }[]) {
        ops = ops.filter(op => !!op.id);
        if (!(ops.length > 0)) return [];
        return ops.map(({ id, domStr }) => {
            const op = {} as IOperation;
            op.action = "update"; // dom
            op.id = id;
            op.data = domStr;
            return op;
        });
    },
    async updateBlocks(ops: { id: string, domStr: string }[]) {
        return siyuan.transactions(siyuan.transUpdateBlocks(ops));
    },
    async getBlockMarkdownAndContent(id: string): Promise<GetBlockMarkdownAndContent> {
        const row = await siyuan.sqlOne(`select markdown, content from blocks where id="${id}"`);
        return { markdown: row?.markdown ?? "", content: row?.content ?? "", id };
    },
    // session 是发起编辑视图的 protyle.id：内核 PushModeBroadcastExcludeSelf 按它精确排除回声。
    // 默认值 SIYUAN_APPID 匹配不到任何 ws 连接（连接 id 是 protyle.id/genUUID），等于广播给所有
    // 前端——编辑触发的传播回声会打到正在打字的视图，内核缩放局部更新分支在同步组子块 ID
    // 共享时误替换当前视图首块（非 undo 不恢复光标），slave 块打字光标因此不断跳回块首。
    async transactions(doOperations: IOperation[], undoOperations: IOperation[] = [], session?: string) {
        if (doOperations.length == 0 && undoOperations.length == 0) return;
        return siyuan.call("/api/transactions", {
            session: session || Constants.SIYUAN_APPID,
            app: Constants.SIYUAN_APPID,
            transactions: [{
                doOperations, undoOperations
            }],
            reqId: new Date().getTime(),
        });
    },
    async getHeadingDeleteTransaction(id: string): Promise<{ timestamp: number, doOperations: IOperation[], undoOperations: IOperation[] }> {
        return siyuan.call("/api/block/getHeadingDeleteTransaction", { id });
    },
    async getHeadingChildrenIDs(id: string): Promise<string[]> {
        return siyuan.call("/api/block/getHeadingChildrenIDs", { id });
    },
    async getHeadingChildrenDOM(id: string) {
        return siyuan.call("/api/block/getHeadingChildrenDOM", { id });
    },
    // sort（nav 罗盘 navTree 起）：可选，**不传=跟随文件树当前排序**——内核按「父文档 IAL 声明
    // →笔记本 conf.sortMode→全局 FileTree.Sort」实时解析（kernel/model/file.go
    // ResolveDocTreeSortMode，官方文件树前端 #8156 起同款不传 sort）。⚠勿再用 15 表达「树序」：
    // 15=SortModeFileTree 在 fileTreeSortLess 无比较分支，落「按创建序 tie-break」——同秒批量
    // 导入的文件夹按 ID 倒排，与自然升序的树显示序正好相反（2026-10-11 罗盘反序实证）。
    // maxListCount：可选，传 0=内核取 MaxInt 全量（防 Conf.FileTree.MaxListCount 默认 512 对
    // 兄弟列表静默截尾——exportNaming defaultNamingFetchers 同款参数）
    async listDocsByPath(notebookID: string, notReadablePath: string, sort?: number, maxListCount?: number): Promise<RetListDocsByPath | null> {
        // need-1001-01：速记空壳容器（有 .sy、无同名子目录）内核返 code=-1+data=null——
        // 「无子文档」的常态语义而非错误（陆杰 09-30 报障：秒级模板+速记搬运开时每次
        // sync-end 触发 relayShorthands → locatePerEntryDocs 打到这里，透传 call 会在
        // call 内部 warnP5Throttled 打 p5 警告两路径交替刷屏）。故不走 siyuan.call 单独
        // fetch：-1 静默语义化返 null；其余非零码仍走 warnP5Throttled 告警+返 null 保底
        // （同 call 形态）；网络错照 call 形态 catch 吞错归一返 null。容错语义=progressive
        // kernel/api.ts listDocsByPath（那边 call throw 后正则 /code=-1(?!\d)/；本侧 call
        // 不 throw，直接判 code，语义等价）。code=0 但缺 data 时返 null（call 原返 Response
        // 兜底，本端点恒有 data；调用方均 ?.files ?? [] 防护，等价）。
        const url = "/api/filetree/listDocsByPath";
        const reqData: any = { notebook: notebookID, path: notReadablePath };
        if (sort !== undefined) reqData.sort = sort;
        if (maxListCount !== undefined) reqData.maxListCount = maxListCount;
        try {
            const data = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(reqData),
            });
            const json = await data.json();
            if (json?.code === -1) return null;
            if (json?.code && json?.code != 0) {
                warnP5Throttled(json?.code, json?.msg, reqData, url);
                return null;
            }
            return json?.data ?? null;
        } catch (e) {
            console.warn(e, url, reqData);
            return null;
        }
    },
    async getHPathByID(id: string, notebook: string): Promise<string> {
        // 按块 id 直查可读路径（文件树通道实时，无 SQL 索引延迟——刚改名的文档也拿新路径）
        return siyuan.call("/api/filetree/getHPathByID", { id, notebook });
    },
    async listDocTree(notebookID: string, notReadablePath: string): Promise<RetListDocTree> {
        return siyuan.call("/api/filetree/listDocTree", { notebook: notebookID, path: notReadablePath });
    },
    async getRefIDs(id: string) {
        return siyuan.call("/api/block/getRefIDs", { id });
    },
    async getBackmentionDoc(defID: string, refTreeID: string, keyword: string = "", knownRevision = ""): Promise<GetBackmentionDoc> {
        const containChildren = (Siyuan.config.editor as any).backlinkContainChildren;
        const args = { defID, refTreeID, keyword, containChildren, knownRevision };
        if (!knownRevision) delete (args as any).knownRevision;
        return siyuan.call("/api/ref/getBackmentionDoc", args);
    },
    async getBacklinkDoc(defID: string, refTreeID: string, keyword: string = "", knownRevision = ""): Promise<GetBacklinkDoc> {
        const containChildren = (Siyuan.config.editor as any).backlinkContainChildren;
        const args = { defID, refTreeID, keyword, containChildren, knownRevision };
        if (!knownRevision) delete (args as any).knownRevision;
        return siyuan.call("/api/ref/getBacklinkDoc", args);
    },
    /** 手动刷新前置（□13，对齐官方 refresh 按钮）：内核 FlushTxQueue+refreshRefsByDefID
     * 重建 refs 索引——刚编辑完索引可能还在队列未提交，直接查询会拿到旧数据 */
    async refreshBacklink(id: string) {
        return siyuan.call("/api/ref/refreshBacklink", { id });
    },
    async getBacklink2(id: string, k = "", mk = "", sort = "3", mSort = "3", knownRevision = "", containChildren?: boolean): Promise<GetBacklink2> {
        // containChildren 不传=跟随用户设置（面板列表语义，与官方反链面板一致）；
        // 显式传值=调用方自带语义（入口条计数传 true：它只是「本文档有反链」的发现性信号，
        // 不应继承用户的子块过滤偏好——用户关掉该设置时内容块引用被过滤，入口条会永不出现）
        const containChildrenFinal = containChildren ?? (Siyuan.config.editor as any).backlinkContainChildren;
        //     SortModeNameASC                // 0：文件名字母升序
        //     SortModeNameDESC               // 1：文件名字母降序
        //     SortModeUpdatedASC             // 2：文件更新时间升序
        //     SortModeUpdatedDESC            // 3：文件更新时间降序
        //     SortModeAlphanumASC            // 4：文件名自然数升序
        //     SortModeAlphanumDESC           // 5：文件名自然数降序
        //     SortModeCustom                 // 6：自定义排序
        //     SortModeRefCountASC            // 7：引用数升序
        //     SortModeRefCountDESC           // 8：引用数降序
        //     SortModeCreatedASC             // 9：文件创建时间升序
        //     SortModeCreatedDESC            // 10：文件创建时间降序
        //     SortModeSizeASC                // 11：文件大小升序
        //     SortModeSizeDESC               // 12：文件大小降序
        //     SortModeSubDocCountASC         // 13：子文档数升序
        //     SortModeSubDocCountDESC        // 14：子文档数降序
        //     SortModeFileTree               // 15：使用文档树排序规则
        //     SortModeUnassigned = 256       // 256：未指定排序规则，按照笔记本优先于文档树获取排序规则
        const args = { id, k, mk, sort, mSort, containChildren: containChildrenFinal, knownRevision };
        if (!knownRevision) delete (args as any).knownRevision;
        return siyuan.call("/api/ref/getBacklink2", args);
    },
    async appendDailyNoteBlock(notebook: string, data: string, dataType: "markdown" | "dom" = "markdown"): Promise<gconst.TransactionData[]> {
        return siyuan.call("/api/block/appendDailyNoteBlock", { notebook, data, dataType });
    },
    async prependDailyNoteBlock(notebook: string, data: string, dataType: "markdown" | "dom" = "markdown"): Promise<gconst.TransactionData[]> {
        return siyuan.call("/api/block/prependDailyNoteBlock", { notebook, data, dataType });
    },
    async insertBlockAfter(data: string, previousID: string, dataType: "markdown" | "dom" = "markdown") {
        return siyuan.call("/api/block/insertBlock", { data, dataType, previousID });
    },
    async insertBlockBefore(data: string, nextID: string, dataType: "markdown" | "dom" = "markdown") {
        return siyuan.call("/api/block/insertBlock", { data, dataType, nextID });
    },
    async insertBlockAsChildOf(data: string, parentID: string, dataType: "markdown" | "dom" = "markdown") {
        return siyuan.call("/api/block/insertBlock", { data, dataType, parentID });
    },
    // After/AsChildOf 两兄弟 reverse：锚固定（previousID 插锚后/parentID 头插 PrependChild，
    // kernel/model/transaction.go doInsert0，2026-08-24 源码+实测确认），同锚顺序发 op 落库
    // 倒序，reverse 后落库=传入序。调用方按期望文档序传入即可，勿预补偿。
    // Before 例外不 reverse：nextID 前插多块内核整组正序落库（2026-09-26 6809 双块实测
    // [甲,乙]传入→[甲,乙]落库；need-0926-01 □4 e2e 揪出 reverse=倒序 bug，Tag2RefBox 的
    // 调用侧手动预补偿同批移除）
    transInsertBlocksBefore(domStrs: string[], nextID: string) {
        return domStrs.map(data => {
            const op = {} as IOperation;
            op.action = "insert";
            op.data = data;
            op.nextID = nextID;
            return op;
        });
    },
    transInsertBlocksAfter(domStrs: string[], previousID: string) {
        return domStrs.slice().reverse().map(data => {
            const op = {} as IOperation;
            op.action = "insert";
            op.data = data;
            op.previousID = previousID;
            return op;
        });
    },
    transInsertBlocksAsChildOf(domStrs: string[], parentID: string) {
        return domStrs.slice().reverse().map(data => {
            const op = {} as IOperation;
            op.action = "insert";
            op.data = data;
            op.parentID = parentID;
            return op;
        });
    },
    async insertBlocksAfter(domStrs: string[], id: string) {
        if (!id) return;
        return siyuan.transactions(siyuan.transInsertBlocksAfter(domStrs, id));
    },
    async insertBlocksAsChildOf(domStrs: string[], parentID: string) {
        return siyuan.transactions(siyuan.transInsertBlocksAsChildOf(domStrs, parentID));
    },
    transAppendBlocks(ids: string[], parentID: string) {
        return ids.map(id => {
            const op = {} as IOperation;
            op.action = "append";
            op.id = id;
            op.parentID = parentID;
            return op;
        });
    },
    async appendBlocks(domStrs: string[], parentID: string) {
        const tail = await siyuan.getTailChildBlocks(parentID, 1).then(i => {
            if (i) return i[0]?.id
        })
        if (tail) return siyuan.transactions(siyuan.transInsertBlocksAfter(domStrs, tail));
    },
    async appendBlock(data: string, parentID: string, dataType: "markdown" | "dom" = "markdown"): Promise<gconst.TransactionData[]> {
        return siyuan.call("/api/block/appendBlock", { data, dataType, parentID });
    },
    async checkUpdate(showMsg = false) {
        return siyuan.call("/api/system/checkUpdate", { showMsg });
    },
    async getBlockInfo(id: string): Promise<GetBlockInfo> {
        return siyuan.call("/api/block/getBlockInfo", { id });
    },
    async getDocInfo(id: string): Promise<GetDocInfo> {
        return siyuan.call("/api/block/getDocInfo", { id });
    },
    async removeBookmarks(docID: string, keepBlockID: string) {
        const bookmark = "";
        const rows = await siyuan.sql(`select id from blocks where root_id='${docID}' and ial like '%bookmark=%' limit 1000`);
        for (const row of rows) {
            const id = row["id"];
            if (keepBlockID === id) continue;
            await siyuan.setBlockAttrs(id, { bookmark });
        }
    },
    async addBookmark(id: string, bookmark: string) {
        return siyuan.setBlockAttrs(id, { bookmark });
    },
    async getTreeRiffCardsAll(id: string): Promise<GetCardRetBlock[]> {
        const total: GetCardRetBlock[] = [];
        for (let i = 1; ; i++) {
            const ret = await siyuan.getTreeRiffCards(id, i);
            if (!ret?.blocks) break;
            total.push(...ret.blocks);
            if (total.length >= ret.total) break;
            if (i >= ret.pageCount + 3) break;
        }
        return total;
    },
    // cardpostpone（09-16）：复习作用域交集的笔记本侧全量通道（树版同款分页模式）
    async getNotebookRiffCardsAll(id: string): Promise<GetCardRetBlock[]> {
        const total: GetCardRetBlock[] = [];
        for (let i = 1; ; i++) {
            const ret = await siyuan.getNotebookRiffCards(id, i);
            if (!ret?.blocks) break;
            total.push(...ret.blocks);
            if (total.length >= ret.total) break;
            if (i >= ret.pageCount + 3) break;
        }
        return total;
    },
    async getTreeRiffCards(id: string, page: number, pageSize = 10000): Promise<GetCardRet> {
        if (page <= 0) throw Error("页码必须大于等于1")
        return siyuan.call("/api/riff/getTreeRiffCards", { id, page, pageSize });
    },
    async getTreeRiffDueCards(rootID: string): Promise<GetDueCardRet> {
        return siyuan.call("/api/riff/getTreeRiffDueCards", { rootID });
    },
    async getNotebookRiffDueCards(notebook: string): Promise<GetDueCardRet> {
        return siyuan.call("/api/riff/getNotebookRiffDueCards", { notebook });
    },
    async getNotebookRiffCards(id: string, page: number, pageSize = 10000): Promise<GetCardRet> {
        if (page <= 0) throw Error("页码必须大于等于1")
        return siyuan.call("/api/riff/getNotebookRiffCards", { id, page, pageSize });
    },
    async resetRiffCards(type: "notebook" | "tree" | "deck", id: string, blockIDs: string[] = [], deckID = Constants.QUICK_DECK_ID): Promise<GetCardRet> {
        // typ := arg["type"].(string)      // notebook, tree, deck
        // id := arg["id"].(string)         // notebook ID, root ID, deck ID
        // deckID := arg["deckID"].(string) // deck ID
        // blockIDsArg := arg["blockIDs"]   // 如果不传入 blockIDs （或者传入实参为空数组），则重置所有卡片
        return siyuan.call("/api/riff/resetRiffCards", { type, id, blockIDs, deckID });
    },
    transAddRiffCards(blockIDs: string[]) {
        const op = {} as IOperation;
        op.action = "addFlashcards";
        op.deckID = Constants.QUICK_DECK_ID
        op.blockIDs = blockIDs;
        return op;
    },
    transRemoveRiffCards(blockIDs: string[]) {
        const op = {} as IOperation;
        op.action = "removeFlashcards";
        op.deckID = Constants.QUICK_DECK_ID
        op.blockIDs = blockIDs;
        return op;
    },
    async addRiffCards(blockIDs: Array<string>, deckID = Constants.QUICK_DECK_ID): Promise<AddRiffCards> {
        return siyuan.call("/api/riff/addRiffCards", { blockIDs, deckID });
    },
    async skipReviewRiffCard(cardID: string, deckID = Constants.QUICK_DECK_ID) {
        return siyuan.call("/api/riff/skipReviewRiffCard", { cardID, deckID });
    },
    async reviewRiffCard(cardID: string, rating: number, deckID = Constants.QUICK_DECK_ID) {
        return siyuan.call("/api/riff/reviewRiffCard", { cardID, rating, deckID });
    },
    async reviewRiffCardByBlockID(blockID: string, rating: number, deckID = Constants.QUICK_DECK_ID) {
        const all = await siyuan.getRiffCardsByBlockIDs([blockID]);
        // □7：内核 GetFlashcardsByBlockIDs 对无卡块补占位条目（riffCardID=""）——不过滤
        // 会拿占位卡以空 cardID 调 reviewRiffCard → 内核 reject。Map.has 恒真（占位也在
        // Map，keys() 语义恒错——readCurve.ts:46 同坑），真卡判定=riffCardID 非空
        const card = (all.get(blockID) ?? []).filter(c => !!c.riffCardID).slice().pop();
        if (card) {
            return siyuan.reviewRiffCard(card.riffCardID, rating, deckID);
        }
    },
    async getRiffCards(page = 1, pageSize = 1000, deckID = ""): Promise<GetCardRet> {
        if (page <= 0) throw Error("页码必须大于等于1")
        return siyuan.call("/api/riff/getRiffCards", { "id": deckID, page, pageSize });
    },
    async getRiffCardsByBlockIDs(blockIDs: string[]) {
        const ret: GetCardRet = await siyuan.call("/api/riff/getRiffCardsByBlockIDs", { blockIDs });
        return ret?.blocks?.reduce((m, b) => {
            const cs = m.get(b.id) ?? [];
            cs.push(b);
            m.set(b.id, cs);
            return m;
        }, new Map<string, GetCardRetBlock[]>());
    },
    async batchSetRiffCardsDueTimeByBlockID(blockDues: { id: string, due: string }[]) {
        const all = await siyuan.getRiffCardsByBlockIDs(blockDues.map(c => c.id));
        const cardDues = blockDues.map(block => {
            return all.get(block.id)?.map(card => {
                return { id: card.riffCardID, due: block.due };
            });
        }).filter(c => !!c).flat();
        return siyuan.batchSetRiffCardsDueTimeByCardID(cardDues);
    },
    async batchSetRiffCardsDueTimeByCardID(cardDues: { id: string, due: string }[]) {
        // "due": "20240224214412"
        return siyuan.call("/api/riff/batchSetRiffCardsDueTime", { cardDues });
    },
    async getRiffCardsAllFlat(pageSize = 1000, deckID = "") {
        return [...(await siyuan.getRiffCardsAll(pageSize, deckID)).values()].flat()
    },
    async getRiffCardsAll(pageSize = 1000, deckID = "") {
        const total: Map<string, GetCardRetBlock[]> = new Map();
        // let j = 0;
        for (let i = 1; ; i++) {
            const ret = await siyuan.getRiffCards(i, pageSize, deckID);
            if (!ret?.blocks) break;
            ret.blocks.forEach(i => { // 存在一个块多卡。
                const a = total.get(i.id) ?? [];
                a.push(i);
                total.set(i.id, a);
            });
            // j+=ret.blocks.length;
            // xx.log(total.size, j,ret.total)
            if (total.size >= ret.total) break;
            if (i >= ret.pageCount + 1) break;
        }
        return total;
    },
    async getRiffDueCards(deckID = ""): Promise<GetDueCardRet> {
        return siyuan.call("/api/riff/getRiffDueCards", { deckID });
    },
    async getRiffDecks() {
        return siyuan.call("/api/riff/getRiffDecks", {});
    },
    async removeRiffCards(blockIDs: Array<string>, deckID = "") {
        if (!blockIDs || blockIDs.length == 0) return null;
        return siyuan.call("/api/riff/removeRiffCards", { deckID, blockIDs });
    },
    async updateEmbedBlock(id: string, content: string) {
        return siyuan.call("/api/search/updateEmbedBlock", { id, content });
    },
    async fullTextSearchBlock(
        /**
         * 搜索传入的查询内容
         */
        query?: string,
        /**
         * Grouping strategy
         * - `0`: No grouping
         * - `1`: Group by document
         */
        groupBy?: number,
        /**
         * Search in the specified paths
         */
        paths?: string[],
        /**
         * Search scheme
         * - `0`: Keyword (default)
         * - `1`: Query syntax
         * - `2`: SQL
         * - `3`: Regular expression
         * @default 0
         */
        method?: number,
        /**
         * Current page number
         */
        page?: number,
        /**
         * Search result sorting scheme
         * - `0`: Block type (default)
         * - `1`: Ascending by creation time
         * - `2`: Descending by creation time
         * - `3`: Ascending by update time
         * - `4`: Descending by update time
         * - `5`: By content order (only valid when grouping by document)
         * - `6`: Ascending by relevance
         * - `7`: Descending by relevance
         * @default 0
         */
        orderBy?: number,
        types?: IUILayoutTabSearchConfigTypes,
    ): Promise<FullTextSearchBlockRet> {
        return siyuan.call("/api/search/fullTextSearchBlock", {
            query, method, types,
            paths,
            groupBy,
            orderBy,
            page,
        });
    },
    async findListType(thisID: string) {
        let theUpperestListID = "";
        let theMD = "";
        let count = 500;
        while (count > 0) {
            count -= 1;
            const thisBlock = await siyuan.getRowByID(thisID);
            if (!theMD) {
                theMD = thisBlock["content"];
                if (!theMD) theMD = " ";
            }
            const thisType = thisBlock["type"];
            if (thisType === "l") {
                theUpperestListID = thisID;
            }
            else if (thisType === "d" || thisType === undefined) {
                break;
            }
            if (!thisID) break;
            thisID = thisBlock["parent_id"];
            if (!thisType) break;
        }
        return [theUpperestListID, theMD];
    },
    async deleteBlocksUtil() {
        const { aacc1, aacc2 } = await findAACC();
        {
            if (!aacc1?.id) {
                siyuan.pushMsg("aacc1 not found")
                return
            } else if (!aacc2?.id) {
                siyuan.pushMsg("aacc2 not found")
                return
            } else if (aacc1.root_id !== aacc2.root_id) {
                siyuan.pushMsg("aacc1 aacc2 must be in the same doc")
                return
            }
        }
        let doDelete = false;
        const { root: { children } } = await getDocBlocks(aacc1.root_id, "", false, false, 1);
        const blocks = [];
        for (const child of children) {
            if (child.id === aacc1.id) {
                doDelete = true;
            }
            if (doDelete) {
                blocks.push(child.id);
            }
            if (child.id === aacc2.id) break;
        }
        if (blocks.length === 0) {
            return blocks
        }
        await siyuan.deleteBlocks(blocks);
    },
    async moveBlocksUtil(copy = false) {
        const blocks: Block[] = [];
        const { aacc1, aacc2, aacc3 } = await findAACC();
        {
            if (!aacc1?.id) {
                siyuan.pushMsg("aacc1 not found")
                return blocks
            } else if (!aacc2?.id) {
                siyuan.pushMsg("aacc2 not found")
                return blocks
            } else if (!aacc3?.id) {
                siyuan.pushMsg("aacc3 not found")
                return blocks
            } else if (aacc1.root_id !== aacc2.root_id) {
                siyuan.pushMsg("aacc1 aacc2 must be in the same doc")
                return blocks
            }
        }
        {
            let found = false;
            const { root: { children } } = await getDocBlocks(aacc1.root_id, "", false, false, 1);
            for (const child of children) {
                if (child.id === aacc1.id) {
                    found = true;
                    continue;
                }
                if (child.id === aacc2.id) break;
                if (found) {
                    blocks.push(child);
                }
            }
        }
        if (blocks.length === 0) {
            return blocks
        }
        const ops = [];
        if (copy) {
            const htmls = blocks.map(b => {
                const c = cleanDivOnly(b.div);
                b.div = c.div
                b.id = c.newID
                return b.div;
            }).map(div => div.outerHTML);
            ops.push(...siyuan.transInsertBlocksAfter(htmls, aacc3.id));
        } else {
            ops.push(...siyuan.transMoveBlocksAfter(blocks.map(b => b.id), aacc3.id));
        }
        ops.push(...siyuan.transDeleteBlocks([aacc1.id, aacc2.id, aacc3.id]))
        await siyuan.transactions(ops);
        return blocks;
    },
    async getBlockKramdownWithoutID(id: string, newAttrs: string[] = [], prefix?: string, suffix?: string,) {
        const { kramdown } = await siyuan.getBlockKramdown(id);
        const lines: Array<string> = kramdown.split("\n");
        let attrs = lines.pop();
        if (lines.length > 0) {
            if (prefix) {
                lines[0] = prefix + lines[0];
            }
            if (suffix) {
                lines[lines.length - 1] += suffix;
            }
        }
        const IDRegexp = /id="[^"]+"/;
        const RIFFRegexp = /custom-riff-decks="[^"]+"/;
        attrs = attrs.replace(IDRegexp, "");
        attrs = attrs.replace(RIFFRegexp, "");
        if (newAttrs) {
            attrs = attrs.trim();
            attrs = attrs.slice(0, attrs.length - 1); // rm the '}'
            for (const newattr of newAttrs) {
                attrs += " " + newattr + " ";
            }
            attrs += "}";
        }
        if (attrs != "{: }") {
            lines.push(attrs);
        }
        return lines.join("\n");
    },
    async removeBrokenCards(tomatoI18n: TomatoI18n): Promise<{ bigText: string, allIDs: Set<string> }> {
        if (!events.isDesktop) {
            siyuan.pushMsg("can only run in desktop env.");
            return;
        }
        return navigator.locks.request("removeBrokenCardsLock", { ifAvailable: true }, async (lock) => {
            if (!lock) return;
            if (!(await siyuan.getConf())?.conf?.repo?.key) {
                await siyuan.pushMsg(tomatoI18n.你还没秘钥插件无法为您创建本地快照, 0)
                return;
            }
            siyuan.pushMsg(tomatoI18n.正在确认无效闪卡请耐心等待, 1800);
            const bigText = await getAllFilesAsBigText()
            const allIDs = extractIDs(bigText);
            const invalidCardIDs: string[] = [];
            const invalidSeen = new Set<string>();
            for (const card of [...(await siyuan.getRiffCardsAll()).values()].flat()) {
                // 同块多卡 flat 后同 id 出现多次，去重防止报数虚高
                if (!allIDs.has(card.id) && !invalidSeen.has(card.id)) {
                    invalidSeen.add(card.id);
                    invalidCardIDs.push(card.id);
                }
            }
            if (invalidCardIDs.length > 0) {
                const MAX = 10;
                const lnks = invalidCardIDs.slice(0, MAX).map(id => `<a href="siyuan://blocks/${id}">${id}</a>`).join("<br>")
                let suffix = ""
                if (invalidCardIDs.length > MAX) suffix = "<br>……"
                confirm("⚠️" + tomatoI18n.准备删除失效闪卡(invalidCardIDs.length), tomatoI18n.即将创建快照 + "<br>" + lnks + suffix, async () => {
                    await siyuan.createSnapshot(tomatoI18n.清理所有失效的闪卡);
                    await siyuan.removeRiffCards(invalidCardIDs);
                    // 内核 f2800e2da(2026-08) 起校验块树，块已不存在的卡 removeRiffCards 返回
                    // code -1 且 siyuan.call 静默吞错，凭返回值判不了成败——重拉全量卡复验残余，
                    // 删掉的报数、残留的降级提示（等待官方修复，见 cardUtils 同背景注释）
                    const restIDs: string[] = [];
                    for (const card of [...(await siyuan.getRiffCardsAll()).values()].flat()) {
                        if (invalidSeen.has(card.id) && !restIDs.includes(card.id)) {
                            restIDs.push(card.id);
                        }
                    }
                    const removed = invalidCardIDs.length - restIDs.length;
                    if (removed > 0) {
                        await siyuan.pushMsg(tomatoI18n.清理所有失效的闪卡 + " : " + removed)
                    }
                    if (restIDs.length > 0) {
                        const restLnks = restIDs.slice(0, MAX).map(id => `<a href="siyuan://blocks/${id}">${id}</a>`).join("<br>")
                        let restSuffix = ""
                        if (restIDs.length > MAX) restSuffix = "<br>……"
                        confirm("⚠️" + tomatoI18n.仍有x张失效闪卡无法删除(restIDs.length), tomatoI18n.失效闪卡受内核校验限制无法删除 + "<br><br>" + restLnks + restSuffix)
                    }
                })
            } else {
                confirm("😄", tomatoI18n.没有失效闪卡)
            }
            return { bigText, allIDs }
        });
    },
    async getDocNameByBlockID(blockID: string) {
        let row = await siyuan.sqlOne(
            `select root_id from blocks where id="${blockID}"`,
        );
        if (row?.root_id) {
            row = await siyuan.sqlOne(
                `select content from blocks where id="${row.root_id}"`,
            );
            if (row?.content) {
                return row.content;
            }
        }
        return "";
    }
};

export const siyuanCache = {
    createDocWithMdIfNotExists: createCache(siyuan.createDocWithMdIfNotExists),
    getRiffCardsByBlockIDs: createCache(siyuan.getRiffCardsByBlockIDs),
};

async function findAACC() {
    return await siyuan
        .sql(`select id,root_id,content from blocks where type='p' and content in ("aacc1","aacc2","aacc3")`)
        .then(rows => {
            let aacc1: Block;
            let aacc2: Block;
            let aacc3: Block;
            rows.forEach(row => {
                switch (row.content) {
                    case 'aacc1':
                        aacc1 = row;
                        break;
                    case 'aacc2':
                        aacc2 = row;
                        break;
                    case 'aacc3':
                        aacc3 = row;
                        break;
                }
            });
            return { aacc1, aacc2, aacc3 };
        });
}

export function createCache
    <T extends Func, R extends Awaited<ReturnType<T>>, P extends Parameters<T>>
    (originalFunction: T): (...args: [number, ...P]) => Promise<R> {
    const cache = new Map<string, { value: R; timestamp: number }>();
    return async function cachedFunction(cacheTime: number, ...args: P): Promise<R> {
        const currentTime = Date.now();
        for (const [k, v] of cache.entries()) {
            if (currentTime - v.timestamp > cacheTime) {
                cache.delete(k);
            }
        }

        const key = JSON.stringify(args);
        if (cache.has(key)) {
            const { value } = cache.get(key);
            return value;
        }

        const result: R = await originalFunction(...args);
        // 空结果不入缓存（addr-adapt 渐进清点 #1 闭环）：建档族 throw 化后穷尽失败会 throw
        // （缓存层透传不吞）；data:null 索引窗返 ""——空串/空值若入缓存，窗口内（5~10 秒）
        // 重试照样拿空串。跳过 set 原样返回，下次调用真跑
        if (result === "" || result == null) return result;
        cache.set(key, { value: result, timestamp: Date.now() });
        return result;
    };
}

export * from "./fileScanUtils";
export * from "./notebookUtils";
