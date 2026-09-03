// SpaceRefBox 空格转引用（spec：docs/superpowers/specs/2026-09-03-space-ref-design.md）
// document 级事件委托 + 流程编排 + per-block 锁；纯逻辑全在 libs/spaceRefCore.ts。
// 替换走 DOM 手术 + protyle 自家事务通道（item2ref 生产配方）：内核 HTTP updateBlock 是异
// session 通道，本块打字事务后到覆盖实测（2026-09-03 dev）；protyle.transaction 同 session
// 排队必在打字事务之后，且本地渲染/lastHTMLs 同步记账，Ctrl+Z 也有 undo ops。
import { getAllEditor } from "siyuan";
import type { IProtyle } from "siyuan";
import { siyuan, getContenteditableElement } from "./libs/utils";
import { createRefDoc } from "./libs/docUtils";
import { spaceRefEnabled, spaceRefLinkType } from "./libs/stores";
import { verifyKeyTomato } from "./libs/user";
import { debugLog } from "./libs/logUtils";
import { DATA_NODE_ID, DATA_TYPE, BlockNodeEnum } from "./libs/gconst";
import { extractWord, decide, triggerConsume, type TitleRow } from "./libs/spaceRefCore";
import { titleCache } from "./libs/titleCache";

// spec 触发条件 2 的白名单：段落/标题/引述/列表项（data-type 实值为 Node* 全名，
// 2026-09-03 dev 实例 getBlockDOM 实证；缩写 p/h/b/i 是 treenode typeAbbrMap 的另一套）。
// 代码块/表格/公式块的内容块 data-type 不在白名单天然不触发；超级块须显式排除祖先。
const BLOCK_WHITELIST = new Set<string>([
    BlockNodeEnum.NODE_PARAGRAPH,
    BlockNodeEnum.NODE_HEADING,
    BlockNodeEnum.NODE_BLOCKQUOTE,
    BlockNodeEnum.NODE_LIST_ITEM,
]);

class SpaceRefBox {
    private composing = 0;
    private locks = new Set<string>();

    async onload() {
        if (!spaceRefEnabled.get()) return;
        if (!(await verifyKeyTomato())) return;
        document.addEventListener("compositionstart", this.onCompositionStart, true);
        document.addEventListener("compositionend", this.onCompositionEnd, true);
        document.addEventListener("input", this.onInput, true);
    }

    onunload() {
        document.removeEventListener("compositionstart", this.onCompositionStart, true);
        document.removeEventListener("compositionend", this.onCompositionEnd, true);
        document.removeEventListener("input", this.onInput, true);
    }

    private onCompositionStart = () => this.composing++;
    private onCompositionEnd = () => this.composing--;

    private onInput = (e: InputEvent) => {
        // 触发条件 3/4：插入字符为空格（半角/全角）且非 IME composition 期间
        if (this.composing > 0 || e.isComposing) return;
        if (e.data !== " " && e.data !== "\u3000") return;
        const node = document.getSelection()?.anchorNode;
        if (!node) return;
        // [data-node-id] 属性选择器（不限定 div）：活编辑器 h1~h6/引述等形态不由 div 独占
        const el = (node.nodeType === 3 ? node.parentElement : (node as HTMLElement))
            ?.closest(`[${DATA_NODE_ID}]`) as HTMLElement | null;
        if (!el || !BLOCK_WHITELIST.has(el.getAttribute(DATA_TYPE) ?? "")) return;
        if (el.closest(`[${DATA_TYPE}="${BlockNodeEnum.NODE_SUPER_BLOCK}"]`)) return;
        const blockId = el.getAttribute(DATA_NODE_ID) ?? "";
        // 触发条件 5：per-block 锁防重入
        if (this.locks.has(blockId)) return;
        this.locks.add(blockId);
        // 宿主 wysiwyg 容器随行：bk 面板/多 tab 有同 data-node-id 的壳节点（坑 #22），
        // verify/restoreCursor 的重查必须限定在本编辑器容器内
        const wysiwyg = el.closest(".protyle-wysiwyg") as HTMLElement | null;
        this.run(el, blockId, wysiwyg).finally(() => this.locks.delete(blockId));
    };

    private async run(el: HTMLElement, blockId: string, wysiwyg: HTMLElement | null) {
        const t0 = performance.now();
        try {
            debugLog("spaceRef", "trigger");
            const ext = this.cursorContext(el);
            if (!ext) return debugLog("spaceRef", "decision=skip-empty");
            // 触发前缀（2026-09-03 英文误触修复）：词前须紧跟 @@，否则本次空格只是普通打字
            const consume = triggerConsume(ext.anchor);
            if (!consume) return debugLog("spaceRef", "decision=skip-no-prefix");
            const titles = await titleCache.get();
            const d = decide(ext.word, titles);
            debugLog("spaceRef", `word=${ext.word} decision=${d.kind}`);
            if (d.kind !== "exact" && d.kind !== "fuzzy" && d.kind !== "create") return;

            let title: TitleRow;
            if (d.kind === "create") {
                // 竞态守卫一：建文档前重读重算，词仍在原位才继续
                if (!this.verify(blockId, ext, wysiwyg)) return debugLog("spaceRef", "abandon=changed-before-create");
                const notebookId = await this.notebookOf(blockId);
                if (!notebookId) return debugLog("spaceRef", "abandon=no-notebook");
                const id = await createRefDoc(notebookId, ext.word);
                if (!id) return debugLog("spaceRef", "abandon=create-failed");
                title = { id, content: ext.word, updated: "" };
                titleCache.push(title); // 写穿：紧接同词触发走 exact
            } else {
                title = d.title;
            }

            // 竞态守卫二：提交前再验（el 可能已被内核重渲染成 detached，重查拿 fresh）
            const fresh = this.verify(blockId, ext, wysiwyg);
            if (!fresh) return debugLog("spaceRef", "abandon=changed-before-commit");
            const edit = getContenteditableElement(fresh);
            if (!edit) return debugLog("spaceRef", "abandon=no-edit");
            const beforeHTML = fresh.outerHTML;
            if (!this.replaceWordWithRef(edit, ext.word, ext.anchor, title, consume)) {
                return debugLog("spaceRef", "abandon=anchor-not-found");
            }

            const doOps = siyuan.transUpdateBlocks([{ id: blockId, domStr: fresh.outerHTML }]);
            const undoOps = siyuan.transUpdateBlocks([{ id: blockId, domStr: beforeHTML }]);
            const protyle = this.protyleOf(wysiwyg);
            if (protyle) {
                // 仓内 IOperation 与 siyuan 包同名类型来自两个声明源，结构兼容，cast 桥接
                protyle.getInstance().transaction(doOps as never, undoOps as never);
            } else {
                await siyuan.transactions(doOps, undoOps);
            }
            this.restoreCursor(blockId, title.id, wysiwyg);
            debugLog("spaceRef", `done ${Math.round(performance.now() - t0)}ms`);
        } catch (err) {
            debugLog("spaceRef", `error=${err}`);
        }
    }

    // 光标上下文：块内从块首选到光标的 Range 文本 → extractWord（DOM 读取在 Box 层做完传入）
    private cursorContext(el: HTMLElement): { word: string; anchor: string } | null {
        const sel = document.getSelection();
        const anchorNode = sel?.anchorNode;
        if (!sel?.rangeCount || !anchorNode) return null;
        const edit = getContenteditableElement(el);
        if (!edit?.contains(anchorNode)) return null;
        const range = document.createRange();
        range.selectNodeContents(edit);
        try {
            range.setEnd(anchorNode, sel.anchorOffset);
        } catch {
            return null;
        }
        return extractWord(range.toString());
    }

    // 竞态守卫核心：重查块 DOM（此时可能已重渲染），「锚+词」仍在其文本流中原位 → 返回 fresh 元素。
    // 查找限定 wysiwyg 容器（坑 #22：bk 面板/侧栏有同 id 壳节点，裸 document 查询会命中壳误判）
    private verify(blockId: string, ext: { word: string; anchor: string }, wysiwyg: HTMLElement | null): HTMLElement | null {
        const scope: ParentNode = wysiwyg ?? document;
        const el = scope.querySelector(`[${DATA_NODE_ID}="${blockId}"]`) as HTMLElement | null;
        const edit = el && getContenteditableElement(el);
        if (!el || !edit) return null;
        return edit.textContent.includes(ext.anchor + ext.word) ? el : null;
    }

    // DOM 锚定替换（replaceAnchored 的 DOM 层同语义实现）：在 edit 的文本流里找「锚+词」
    // 最后一次出现的区间，把词替换成引用 span；consume>0 时锚尾 @@ 前缀随词一起消费。
    // 词跨文本节点（词内被行内标记拆开）→ 放弃。
    // 词由取词边界保证不含空白/标点（\p{P} 覆盖 <>&"），内联进 HTML 无需转义。
    private replaceWordWithRef(edit: Element, word: string, anchor: string, title: TitleRow, consume: number): boolean {
        const walker = document.createTreeWalker(edit, NodeFilter.SHOW_TEXT);
        const nodes: Text[] = [];
        for (let n = walker.nextNode(); n; n = walker.nextNode()) nodes.push(n as Text);
        const idx = nodes.map(t => t.data).join("").lastIndexOf(anchor + word);
        if (idx < 0) return false;
        // splitText/offset 全按 UTF-16 单元（与 DOM API 一致），码点数只用于 decide 的词长拦截
        // 区间=「@@+词」整体：起点=词前 consume 个字符，终点=词尾（勿写成 wordStart+word.length——
        // 那会把终点也前移 consume，span 只盖住 @@ 而原词残留，e2e 实锤）
        const wordStart = idx + anchor.length - consume;
        const wordEnd = wordStart + consume + word.length;
        let pos = 0;
        for (const t of nodes) {
            const len = t.data.length;
            if (wordStart >= pos && wordStart < pos + len && wordEnd <= pos + len) {
                const isLnk = spaceRefLinkType.get() === "lnk";
                const span = document.createElement("span");
                if (isLnk) {
                    span.setAttribute(DATA_TYPE, "a");
                    span.setAttribute("data-href", `siyuan://blocks/${title.id}`);
                } else {
                    span.setAttribute(DATA_TYPE, "block-ref");
                    span.setAttribute("data-id", title.id);
                    span.setAttribute("data-subtype", "d");
                }
                span.textContent = word;
                t.splitText(wordEnd - pos);
                const wordNode = t.splitText(wordStart - pos);
                wordNode.parentNode.insertBefore(span, wordNode);
                wordNode.remove();
                return true;
            }
            pos += len;
        }
        return false;
    }

    // 本块所在编辑器实例：经 getAllEditor 匹配宿主 wysiwyg 容器（插件经 siyuan 具名导入可达，
    // AGENTS「不可达」坑仅指 window.eval 上下文；MindWire.ts 同款用法）
    private protyleOf(wysiwyg: HTMLElement | null): IProtyle | null {
        for (const { protyle } of getAllEditor()) {
            if (wysiwyg && protyle?.wysiwyg?.element === wysiwyg) return protyle;
        }
        return null;
    }

    private async notebookOf(blockId: string): Promise<string> {
        const row = await siyuan.sqlOne(`select box from blocks where id='${blockId}'`);
        return row?.box ?? "";
    }

    // 光标恢复（spec §3）：重渲染后光标必然丢——找新 DOM 里引用 span（ref 形态 data-id /
    // lnk 形态 data-href），setRange 到其后第一个文本节点开头（即用户敲的那个空格处）；
    // 重渲染是 ws 异步的，短轮询等 span 出现；结构不如预期落块尾兜底（保底不丢块）。
    // 查找同样限定 wysiwyg 容器（坑 #22）
    private restoreCursor(blockId: string, refDocId: string, wysiwyg: HTMLElement | null) {
        const place = () => {
            const scope: ParentNode = wysiwyg ?? document;
            const el = scope.querySelector(`[${DATA_NODE_ID}="${blockId}"]`);
            if (!el) return false;
            const sel = document.getSelection();
            if (!sel) return true;
            const span = el.querySelector(`span[data-id="${refDocId}"], span[data-href="siyuan://blocks/${refDocId}"]`);
            const range = document.createRange();
            let placed = false;
            if (span?.nextSibling && span.nextSibling.nodeType === 3) {
                range.setStart(span.nextSibling, 0);
                placed = true;
            } else {
                const edit = getContenteditableElement(el);
                if (edit) {
                    range.selectNodeContents(edit);
                    range.collapse(false);
                    placed = true;
                }
            }
            if (placed) {
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
            return true; // 块找到了就算完成（光标落块尾兜底）；块都没找到才轮询
        };
        if (place()) return;
        let tries = 0;
        const timer = setInterval(() => {
            if (place() || ++tries > 10) clearInterval(timer);
        }, 100);
    }
}

export const spaceRefBox = new SpaceRefBox();
