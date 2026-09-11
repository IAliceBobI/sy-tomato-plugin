import { IProtyle } from "siyuan";
import { events, EventType } from "./libs/Events";
import { punctTidyEnable, punctTidyExtRules, punctTidyCustomMap } from "./libs/stores";
import { tidyPunctuationBlock, parsePunctMap } from "./libs/punctTidy";
import { debugLog } from "./libs/logUtils";

// 打字标点自动整理（puncttidy 战役 2026-09-10，自 seller MyToolBox 迁入番茄公开侧，免费）。
// 接线形态照抄 seller 现网跑了一年的模板：四事件（loaded/click/switch）→ navigator.locks
// 守卫换绑 wysiwyg MutationObserver（childList+subtree）。防误杀两道：
//   ①paste capture 后 1s 窗口内的 DOM 变动一律不判（粘贴大段文本不整理）
//   ②单批新增块（data-node-id 去重）>2 跳过——只数块级节点：Enter 会重建源块+新块+BR/WBR
//     内联产物，按元素数会误杀打字批（粘贴/拖拽/撤销等批量插入整批跳过）
// 开关=punctTidyEnable（注册门控：onload 读死，改开关保存→插件级重载生效）；
// 扩展档=punctTidyExtRules（回调实时读，保存即生效）。
export class PunctTidyBox {
    private protyle: IProtyle | null = null;
    private observer: MutationObserver | null = null;
    private skipUntil = 0;

    private onPaste = () => {
        this.skipUntil = Date.now() + 1000;
    };

    onload() {
        if (!punctTidyEnable.get()) return;
        debugLog("punctTidy", "observer onload");
        document.addEventListener("paste", this.onPaste, true);
        events.addListener("Tomato-PunctTidyBox", (eventType, detail) => {
            if (eventType == EventType.loaded_protyle_static
                || eventType == EventType.loaded_protyle_dynamic
                || eventType == EventType.click_editorcontent
                || eventType == EventType.switch_protyle
            ) {
                navigator.locks.request("Tomato-PunctTidyBox-observe", { ifAvailable: true }, async (lock) => {
                    const protyle: IProtyle = detail.protyle;
                    if (!protyle) return;
                    const notebookId = protyle.notebookId;
                    const nextDocID = protyle?.block?.rootID;
                    const element = protyle?.wysiwyg?.element;
                    if (lock && element && nextDocID && notebookId) {
                        if (this.protyle != protyle) {
                            this.protyle = protyle;
                            this.observer?.disconnect();
                            this.observer = new MutationObserver((mutationsList) => {
                                // 粘贴后 1s 窗口内的 DOM 变动一律不判
                                if (Date.now() < this.skipUntil) return;
                                const added = mutationsList
                                    .map(i => [...i.addedNodes]).flat()
                                    .filter((e: any) => e != null && e.getAttribute);
                                // 单批新增块（data-node-id，去重后）>2 = 粘贴/拖拽/撤销等批量插入，整批跳过
                                if (new Set(added.filter((e: any) => e.getAttribute("data-node-id"))).size > 2) return;
                                const candidates = new Set([...added, ...mutationsList.map(i => i.previousSibling)]);
                                // 自定义映射（□7）实时读：每批解析一次（行数个位级，零负担）；
                                // 空 map 传 undefined=引擎与预筛回落现网基线行为
                                const map = parsePunctMap(punctTidyCustomMap.get());
                                const mapOpt = map.size ? map : undefined;
                                for (const e of candidates) {
                                    const el = e as HTMLElement;
                                    if (!el || !el.getAttribute) continue;
                                    if (!el.isConnected) continue;
                                    // 单候选异常不打断同批（review P2-3）：整理是非关键增强，坏了留痕自愈
                                    try {
                                        tidyPunctuationBlock(protyle, el, { ext: punctTidyExtRules.get(), map: mapOpt });
                                    } catch (err) {
                                        debugLog("punctTidy", `candidate failed: ${err}`);
                                    }
                                }
                            });
                            this.observer.observe(element, { childList: true, subtree: true });
                        }
                    }
                });
            }
        });
    }

    onunload() {
        document.removeEventListener("paste", this.onPaste, true);
        this.observer?.disconnect();
        this.observer = null;
        this.protyle = null;
    }
}

export const punctTidyBox = new PunctTidyBox();
