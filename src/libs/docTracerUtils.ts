// 字数统计（calcWords）与文档追踪（DocTracer：文档标题/别名索引 + ws 增量维护）。
// 从原 docUtils.ts 拆出（2026-08 重构），docUtils.ts 现为 re-export 桶。
import { siyuan, getDoOperations, notEmptyStrDo, parseIAL } from "./utils";
import { events } from "./Events";
import { DefaultMap } from "./cache";
import { newID } from "stonev5-utils";

export function calcWords(content: string) {
    if (!content) return 0;
    let count = 0;
    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        if (
            char >= '\u4e00' && char <= '\u9fff' || // 中文字符
            char === '，' || char === '。' || char === '！' || char === '？' || // 中文标点
            char === '；' || char === '：' || char === '“' || char === '”' ||
            char === '‘' || char === '’' || char === '（' || char === '）' ||
            char === '、' || char === '《' || char === '》' || char === '【' ||
            char === '】'
        ) {
            count++;
        }
    }
    return count;
}

export async function getDocTracer(): Promise<DocTracer> {
    function get() {
        return window.tomato_zZmqus5PtYRi_doc_tracer;
    }
    function set(x: DocTracer) {
        window.tomato_zZmqus5PtYRi_doc_tracer = x
    }
    return navigator.locks.request("doctracer2025年3月16日00:48:04", async (lock) => {
        if (lock) {
            if (get()) {
                return get();
            }
            const t = new DocTracer();
            await t.init()
            set(t)
            return t;
        }
    });
}

export class DocTracer {
    private inited = false;
    private timestamp = "";
    private docMap: Map<string, Block> = new Map(); // id->block
    private contentMap: DefaultMap<string, Set<string>> = new DefaultMap(() => new Set()); // content->ids
    getDocMap(): ReadonlyMap<string, Block> {
        return this.docMap as ReadonlyMap<string, Block>;
    }
    match(text: string) {
        const matched = new Map<string, Block>()
        text = text?.trim()?.toLocaleLowerCase();
        if (!text) return [];
        for (const [content, ids] of this.contentMap.entries()) {
            if (text.includes(content)) {
                for (const id of ids) {
                    const block = this.docMap.get(id)
                    if (!block) {
                        ids.delete(id);
                    } else {
                        this.trySetAttrs(block);
                        if (block.titles?.has(content)) { // 最新的block确实有这个content
                            matched.set(block.id, block);
                            // 同时加入此block的别名等
                            block.titles.forEach(title => this.contentMap.get(title).forEach(id => {
                                const block = this.docMap.get(id);
                                if (block?.titles?.has(title)) matched.set(block.id, block);
                            }));
                        }
                    }
                }
            }
        }
        return [...matched.values()];
    }
    private trySetAttrs(block: Block) {
        if (!block.attrs) {
            if (block.ial) {
                block.attrs = parseIAL(block.ial);
                this.setBlock(block);
            } else {
                siyuan.getBlockAttrs(block.id).then(attrs => {
                    block.attrs = attrs;
                    this.setBlock(block);
                });
            }
        }
    }
    private setBlock(b: Block) {
        if (b.attrs) {
            if (!b.titles) b.titles = new Set();
            b.titles.clear();
            const cb = (s: string) => b.titles.add(s.toLocaleLowerCase())
            notEmptyStrDo(b.content, cb)
            b.attrs?.alias?.replaceAll("，", ",")?.split(",")?.forEach(p => {
                notEmptyStrDo(p, cb)
            });
            notEmptyStrDo(b.attrs?.title, cb)
            b.titles.forEach(c => this.contentMap.get(c).add(b.id))
        }
    }
    async tryGetDocs(docID: string) {
        const rows = await siyuan.sql(`select * from blocks where type='d' and id="${docID}"`)
        this.update(rows);
    }
    async update(rows: Block[], updateTime = false) {
        rows.forEach(row => {
            if (updateTime && row.updated > this.timestamp) {
                this.timestamp = row.updated;
            }
            row.attrs = parseIAL(row.ial)
            delete row.attrs["title-img"];
            this.docMap.set(row.id, row);
            this.setBlock(row);
        });
    }
    private async getDocs() {
        await navigator.locks.request("DocTracer 2024-12-1 23:48:00", async (lock) => {
            if (lock) {
                const rows = await siyuan.sql(`select * from blocks where type='d' and updated>'${this.timestamp}' limit 999999999`)
                this.update(rows, true);
            }
        });
    }
    async init() {
        if (this.inited) return;
        this.inited = true;
        await this.getDocs();
        events.addWsListener("DocTracer ws 2024-12-1 10:34:13", (detail) => {
            for (const ops of getDoOperations(detail)) {
                switch (ops.action) {
                    case "updateAttrs":
                        const row = this.docMap.get(ops.id);
                        if (row && ops.data?.new) {
                            row.attrs = ops.data?.new
                            this.setBlock(row);
                        }
                        break;
                    default:
                        break;
                }
            }
            switch (detail.cmd) {
                case "removeDoc":
                    detail.data?.ids?.forEach(id => this.removeDoc(id))
                    break;
                case "create":
                    setTimeout(() => {
                        this.getDocs()
                    }, 2000);
                    break;
                case "rename":
                    const row = this.docMap.get(detail.data.id);
                    if (row) {
                        row.content = detail.data.title;
                        this.setBlock(row);
                    }
                    break;
                default:
                    break;
            }
        });
    }
    removeDoc(id: string) {
        return this.docMap.delete(id);
    }
}

export class DebouncedTaskExecutor<T> {
    private lockName: string;
    private lastTask: T;
    constructor() {
        this.lockName = newID();
    }
    run(task: T, cb: (_t: T) => Promise<void>) {
        navigator.locks.request(this.lockName, { ifAvailable: true }, async (lock) => {
            if (lock) {
                await cb(task);
                while (this.lastTask) {
                    const t = this.lastTask;
                    this.lastTask = null;
                    if (t) await cb(t);
                }
            } else {
                this.lastTask = task;
            }
        })
    }
}
