// 知识库通道核心（knowledgebox □3/□4）：纯逻辑零环境依赖——前端门脸
// （knowledgeChannel.ts）与 kernel 门脸（kernel/kbChannel.ts，MCP 口）共用同一 adapter。
// 迁自 knowledgeChannel.ts（□4 拆分：该文件曾混前端装配，kernel import 会拖 window/fetch 链
// 在 goja 崩——splitCore 注入式同款纪律）。
// 契约事实源=09-14 真凭证全链实测：
//   管理线 base=https://open.bigmodel.cn/api/llm-application/open，业务码 code=200 成功
//   （注意与 Coze 的 code=0 两套判读）；问答线 POST /api/zrag/agent/chat SSE 流
//   （data:{json}\n\n，事件 session_created/reasoning/thought/tool_call/tool_result/
//   answer/done/error；retrieval.know_ids 传库 id 非文档 id；answer.data 分片增量，
//   done.data 全量）；检索线 POST /knowledge/retrieve 普通 JSON（code=200 同管理线；
//   data[]={text,score,metadata:{doc_id,doc_name}}，recall_method=embedding/keyword/mixed）。
// 红线：上传 multipart 必带 knowledge_type=1——默认 0「动态解析」向量化必败 10001
// （「知识不可用文档损坏」报错误导，与余额/账号/文件无关）。
// http 通道注入（KbHttp）：纯逻辑零真网可单测；前端实现=knowledgeChannel.ts
// createFrontendKbHttp（fetch），kernel 实现=kernel/kbChannel.ts（proxy 转发）。

// ─────────────────────── http 注入面 ───────────────────────

export interface KbSseEvent {
    type: string;
    sessionId?: string;
    data?: any;
}

export interface KbHttp {
    /** JSON POST，HTTP 非 2xx / 网络失败抛异常；业务码判读在 adapter */
    post(url: string, body: any, headers?: Record<string, string>): Promise<any>;
    get(url: string, headers?: Record<string, string>): Promise<any>;
    delete(url: string, headers?: Record<string, string>): Promise<any>;
    /** multipart 上传：fields=表单字段（knowledge_type 红线在此），单文件 */
    postForm(url: string, fields: Record<string, string>, file: { name: string; content: string }, headers?: Record<string, string>): Promise<any>;
    /** SSE 流：逐事件回调 onEvent，流结束 resolve，error 事件由调用方判读 */
    sse(url: string, body: any, headers: Record<string, string>, onEvent: (ev: KbSseEvent) => void): Promise<void>;
}

// ─────────────────────── 文档名对齐（跨通道通用） ───────────────────────

/** 文档名规范：标题去点截 20 + "." + 思源 id（删除/重建按名对齐） */
export function getKbDocName(name: string, id: string): string {
    // Array.from 按码位切（slice 按 UTF-16 码元，emoji 标题可切成半个代理对）
    return Array.from((name ?? "").replaceAll(".", "")).slice(0, 20).join("") + "." + id;
}

/** 文档名 → {title, docID}（getKbDocName 的逆：末段=id、其余=标题） */
export function parseKbDocName(name: string): { title: string; docID: string } {
    const t = String(name ?? "").split(".");
    return { title: t.slice(0, -1).join("."), docID: t[t.length - 1] ?? "" };
}

/** 本插件上传形态的 docID 段（20230101120000-aaaaaaa：14 位时间戳-7 位随机） */
export const SIYUAN_ID_RE = /^\d{14}-[0-9a-z]{7}$/;

/** 平台侧文件名统一补 .md 扩展（实测：上传 kb-e2e-test.md → 列表 name 原样带 .md）；
 *  幂等对齐比较时剥掉再比，上传文件名与列表回显由此闭环 */
function stripMd(name: string): string {
    return name.endsWith(".md") ? name.slice(0, -3) : name;
}

// ─────────────────────── 通道接口 ───────────────────────

export interface KbDocInfo {
    /** 从文件名解析的思源文档 id；非本插件上传的文档=""（title=原始全名免误导） */
    docID: string;
    title: string;
    /** 平台侧文档 id */
    externalID: string;
    name: string;
    /** 向量化状态：1=成功 2=失败 */
    stat: number;
}

export interface KbCapacity {
    usedWords: number; totalWords: number;
    usedBytes: number; totalBytes: number;
}

/** 检索切片（knowledge/retrieve 响应整形；docName 已剥 .md 尾缀） */
export interface KbChunk {
    text: string;
    score: number;
    docName: string;
    /** 从文档名解析的思源文档 id；非本插件上传的文档="" */
    docID: string;
}

export interface KbChannel {
    readonly id: string;
    readonly label: string;
    /** 未配置字段名列表（空=配置完备） */
    missingConfig(): string[];
    /** 连通性测试：Key 有效性 + 容量读取（成功 message 带用量） */
    test(): Promise<{ ok: boolean; message: string }>;
    capacity(): Promise<KbCapacity>;
    listDocs(): Promise<KbDocInfo[]>;
    /** 幂等重建上传（先删同名旧版再传）；返回平台文档 id。
     *  preList=调用方已拉取的文档清单（批量同步复用一次列表扫描，免每文档全量翻页） */
    uploadDoc(docID: string, title: string, markdown: string, preList?: KbDocInfo[]): Promise<{ externalID: string }>;
    /** 清平台侧该条目的既有副本（kb8 review P1-2：内容全被排除时旧全量不得留平台；
     *  best-effort，失败抛错由调用方并入同步 err） */
    purgeDoc?(docID: string, title: string, preList?: KbDocInfo[]): Promise<void>;
    /** 按平台文档 id 删除 */
    deleteDoc(externalID: string): Promise<void>;
    /** 知识库检索（普通 JSON，非 SSE）：top_k 上限 20，recall_method=mixed 混合检索 */
    retrieve(query: string, topK?: number): Promise<KbChunk[]>;
    /** 知识库问答（ReAct 流式；onDelta 收 answer 增量，返回值=done 全量剥引用标签） */
    ask(query: string, onDelta?: (text: string) => void): Promise<string>;
}

// ─────────────────────── 智谱 adapter ───────────────────────

const ZHIPU_BASE = "https://open.bigmodel.cn/api/llm-application/open";
const ZHIPU_ASK = "https://open.bigmodel.cn/api/zrag/agent/chat";
/** 问答模型（文档默认；不进配置面——bear 拍板「配置项少而清晰」） */
const ASK_MODEL = "glm-5v-turbo";
/** 建库绑定的向量化模型：3=Embedding-3（11/12=Embedding-2/3-pro 亦可，默认 3） */
const EMBEDDING_ID = 3;
const PAGE_SIZE = 100;

/** petal 里的库记忆文件（裸 JSON {kbID,kbName}，双端同目录共读写） */
export const META_PATH = "knowledge-channel.json";
export const DEFAULT_KB_NAME = "siyuan-tomato";

export interface ZhipuCfg {
    apiKey(): string;
    /** 已兜底默认值的库名 */
    kbName(): string;
    /** 持久化的 {kbID, kbName}；null=未建库。库名变更（用户改设置）触发重新查/建 */
    getKbID(): Promise<{ kbID: string; kbName: string } | null>;
    setKbID(kbID: string, kbName: string): Promise<void>;
    /** 可选=false 时 ensureKb 缺库不自动建（MCP 只读口：引导用户先在面板同步一次） */
    readonly createIfMissing?: boolean;
    /** 可选日志钩子：kernel 门脸接 siyuan.logger，前端接 debugLog */
    readonly log?: (msg: string) => void;
}

function zhipuFail(ret: any, what: string): void {
    const code = Number(ret?.code);
    if (Number.isFinite(code) && code !== 200) {
        throw new Error(`智谱${what}失败 code=${code} ${String(ret?.message ?? "").slice(0, 120)}`.trim());
    }
}

function authHeaders(cfg: ZhipuCfg): Record<string, string> {
    return { Authorization: `Bearer ${cfg.apiKey()}` };
}

/** answer 文本里的 <reference data-ref="N"></reference> 引用标记剥离（展示层干净文本） */
function stripReference(s: string): string {
    // 兼容自闭合 <reference/> 与带内容形态（review P2），非贪婪不吞正文
    return s.replace(/<reference[^>]*>(?:[\s\S]*?<\/reference>)?/g, "");
}

export function createZhipuChannel(http: KbHttp, cfg: ZhipuCfg): KbChannel {
    // 建库 in-flight 缓存（review P1-4）：同通道实例内同步与问答并发首次 ensureKb，
    // meta 未落盘窗口双查列表双 miss → 双建同名库（孤儿库持续占容量与向量化计费）
    let ensureInflight: Promise<string> | null = null;
    async function ensureKb(): Promise<string> {
        if (ensureInflight) return ensureInflight;
        ensureInflight = doEnsureKb().finally(() => { ensureInflight = null; });
        return ensureInflight;
    }
    async function doEnsureKb(): Promise<string> {
        const kbName = cfg.kbName();
        const meta = await cfg.getKbID();
        if (meta?.kbID && meta.kbName === kbName) return meta.kbID;
        // 查同名库复用（跨设备/清缓存后重连同一库）；分页聚合防漏
        for (let page = 1; page <= 20; page++) {
            const ret = await http.get(`${ZHIPU_BASE}/knowledge?page=${page}&size=${PAGE_SIZE}`, authHeaders(cfg));
            zhipuFail(ret, "知识库列表");
            const list: any[] = Array.isArray(ret?.data?.list) ? ret.data.list : [];
            const hit = list.find((k: any) => String(k?.name ?? "") === kbName);
            if (hit) {
                await cfg.setKbID(String(hit.id), kbName);
                cfg.log?.(`ensureKb: 复用库 ${hit.id} (${kbName})`);
                return String(hit.id);
            }
            const total = Number(ret?.data?.total ?? 0);
            if (total > 0 ? page * PAGE_SIZE >= total : list.length < PAGE_SIZE) break;
            if (list.length === 0) break;
        }
        if (cfg.createIfMissing === false) {
            throw new Error("智谱知识库尚未初始化：请先在番茄「知识库」面板完成一次同步或问答（将自动创建知识库）后再通过 AI 工具访问");
        }
        const created = await http.post(`${ZHIPU_BASE}/knowledge`, {
            embedding_id: EMBEDDING_ID, name: kbName, description: "SiYuan 番茄插件知识库同步",
        }, authHeaders(cfg));
        zhipuFail(created, "建库");
        const kbID = String(created?.data?.id ?? "");
        if (!kbID) throw new Error("智谱建库响应缺 id");
        await cfg.setKbID(kbID, kbName);
        cfg.log?.(`ensureKb: 建库 ${kbID} (${kbName})`);
        return kbID;
    }

    async function listDocs(): Promise<KbDocInfo[]> {
        const kbID = await ensureKb();
        const all: KbDocInfo[] = [];
        for (let page = 1; page <= 50; page++) {
            const ret = await http.get(`${ZHIPU_BASE}/document?knowledge_id=${kbID}&page=${page}&size=${PAGE_SIZE}`, authHeaders(cfg));
            zhipuFail(ret, "文档列表");
            const list: any[] = Array.isArray(ret?.data?.list) ? ret.data.list : [];
            for (const d of list) {
                const { title, docID } = parseKbDocName(String(d?.name ?? ""));
                const sane = SIYUAN_ID_RE.test(docID);
                all.push({
                    docID: sane ? docID : "",
                    title: sane ? title : String(d?.name ?? ""),
                    externalID: String(d?.id ?? ""),
                    name: String(d?.name ?? ""),
                    stat: Number(d?.embedding_stat ?? 0),
                });
            }
            const total = Number(ret?.data?.total ?? 0);
            // total 为主判据（size=100 下一页常不满页，按 list.length 判会误断）；
            // total 缺失时退化为页不满即止，列表空恒 break 防死循环
            if (total > 0 ? all.length >= total : list.length < PAGE_SIZE) break;
            if (list.length === 0) break;
        }
        return all;
    }

    return {
        id: "zhipu",
        label: "智谱",
        missingConfig() {
            const miss: string[] = [];
            if (!cfg.apiKey().trim()) miss.push("API Key");
            return miss;
        },
        async test() {
            try {
                const cap = await this.capacity();
                const mWords = (n: number) => n >= 10000 ? `${(n / 10000).toFixed(1)} 万字` : `${n} 字`;
                const mBytes = (n: number) => n >= 1073741824 ? `${(n / 1073741824).toFixed(1)}GB` : `${(n / 1048576).toFixed(1)}MB`;
                return { ok: true, message: `已连接。已用 ${mWords(cap.usedWords)} / ${mWords(cap.totalWords)}（${mBytes(cap.usedBytes)} / ${mBytes(cap.totalBytes)}）` };
            } catch (e: any) {
                return { ok: false, message: e instanceof Error ? e.message : String(e) };
            }
        },
        async capacity() {
            const ret = await http.get(`${ZHIPU_BASE}/knowledge/capacity`, authHeaders(cfg));
            zhipuFail(ret, "容量查询");
            const d = ret?.data ?? {};
            return {
                usedWords: Number(d?.used?.word_num ?? 0), totalWords: Number(d?.total?.word_num ?? 0),
                usedBytes: Number(d?.used?.length ?? 0), totalBytes: Number(d?.total?.length ?? 0),
            };
        },
        listDocs,
        async purgeDoc(docID, title, preList) {
            const name = getKbDocName(title, docID);
            for (const d of (preList ?? await listDocs())) {
                if (stripMd(d.name) === name) await this.deleteDoc(d.externalID);
            }
            cfg.log?.(`purgeDoc: ${name} (platform copy removed)`);
        },
        async uploadDoc(docID, title, markdown, preList) {
            const kbID = await ensureKb();
            const name = getKbDocName(title, docID);
            // 幂等重建：先删同名旧版（列表回显带 .md 尾缀，对齐比较剥掉）
            for (const d of (preList ?? await listDocs())) {
                if (stripMd(d.name) === name) await this.deleteDoc(d.externalID);
            }
            const ret = await http.postForm(`${ZHIPU_BASE}/document/upload_document/${kbID}`,
                // 红线：knowledge_type 必须 "1"（文档型）——默认 0 动态解析=向量化必败 10001
                { knowledge_type: "1" },
                { name: `${name}.md`, content: markdown },
                authHeaders(cfg));
            zhipuFail(ret, "上传");
            const fail = ret?.data?.failedInfos?.[0];
            if (fail) throw new Error(`智谱上传失败：${String(fail?.failInfo ?? fail?.errorMsg ?? "未知原因").slice(0, 150)}`);
            const externalID = String(ret?.data?.successInfos?.[0]?.documentId ?? "");
            if (!externalID) throw new Error("智谱上传响应缺 documentId");
            cfg.log?.(`uploadDoc: ${name} → ${externalID} (${markdown.length} chars)`);
            return { externalID };
        },
        async deleteDoc(externalID) {
            const ret = await http.delete(`${ZHIPU_BASE}/document/${externalID}`, authHeaders(cfg));
            zhipuFail(ret, "删除文档");
        },
        async retrieve(query, topK = 8) {
            const kbID = await ensureKb();
            const ret = await http.post(`${ZHIPU_BASE}/knowledge/retrieve`, {
                query,
                knowledge_ids: [kbID],
                // top_k=最终召回（1~20），top_n=初始召回（1~100）放宽一层给混合排序腾量
                top_k: Math.max(1, Math.min(20, topK)),
                top_n: 10,
                recall_method: "mixed",
            }, authHeaders(cfg));
            zhipuFail(ret, "检索");
            const list: any[] = Array.isArray(ret?.data) ? ret.data : [];
            return list.map((c: any) => {
                const name = stripMd(String(c?.metadata?.doc_name ?? ""));
                const { docID } = parseKbDocName(name);
                return {
                    text: String(c?.text ?? ""),
                    score: Number(c?.score ?? 0),
                    docName: name,
                    docID: SIYUAN_ID_RE.test(docID) ? docID : "",
                };
            });
        },
        async ask(query, onDelta) {
            const kbID = await ensureKb();
            let acc = "";
            let final = "";
            await http.sse(ZHIPU_ASK, {
                messages: [{ role: "user", content: query }],
                model: ASK_MODEL,
                max_steps: 10,
                retrieval: { know_ids: [kbID], top_k: 8, top_n: 10, enable_rerank: false },
            }, authHeaders(cfg), ev => {
                if (ev.type === "answer") {
                    const piece = String(ev.data ?? "");
                    acc += piece;
                    onDelta?.(piece);
                } else if (ev.type === "done") {
                    final = stripReference(String(ev.data ?? ""));
                } else if (ev.type === "error") {
                    throw new Error(String(ev?.data?.message ?? "智谱问答流错误"));
                }
            });
            cfg.log?.(`ask: q="${query.slice(0, 30)}" answer=${(final || acc).length} chars`);
            // done 缺席（流截断）→ 回退拼接增量
            return final || stripReference(acc);
        },
    };
}
