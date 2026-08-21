import { Dialog, IEventBusMap, IProtyle, Plugin } from "siyuan";
import { EventType, events, currentProtyle } from "./libs/Events";
import * as gconst from "./libs/gconst";
import { bilinkWithInsertingRefs, clean_broken_href, extractLinksFromElement, getAttribute, getDoOperations, joinByComma, linkTwoElementsWithRef, setAttribute, siyuan, } from "./libs/utils";
import * as utils from "./libs/utils";
import { AttrBuilder, findElementByAttr, findListTypeByElement } from "./libs/listUtils";
import { linkBoxAttrIconOnHide, linkBoxBilinkMenu, linkBoxCheckbox, linkBoxLnkTitle, linkBoxSyncBlock, linkBoxSyncBlockAuto, linkBoxSyncHref, linkBoxSyncRef, linkBoxSyncRemapChildID, linkBoxSyncScanDeep, linkBoxUseLnkOrRef } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import { PROTYLE_WYSIWYG_SELECT, TOMATO_CONTROL_SYNC } from "./libs/gconst";
import { OpenSyFile2 } from "./libs/docUtils";
import { domEmbedding, DomListBuilder, DomSuperBlockBuilder } from "./libs/sydom";
import { DestroyManager } from "./libs/destroyer";
import LinkBoxDialog from "./LinkBox.svelte";
import LinkBoxBar from "./LinkBoxBar.svelte";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { lastVerifyResult, verifyKeyTomato } from "./libs/user";
import { debugLog } from "./libs/logUtils";
import { createTrailingDebouncer, decideGroupAction, deepScanVerdict, pendingIsDeletionShaped, pivotSyncPeers, scanRecheckPlan, LivePeer, SyncPeerState } from "./libs/syncDecision";
import { newID } from "stonev5-utils";
import { winHotkey } from "./libs/winHotkey";
import { mount } from "svelte";

type TomatoMenu = IEventBusMap["click-blockicon"] & IEventBusMap["open-menu-content"];

export const LinkBox查看所有同步位置 = winHotkey("F1", "list refs show all place 2025-5-11 22:11:31", "🕒🔄", () => tomatoI18n.查看所有同步位置)
export const LinkBox同步块选择 = winHotkey("⌘F1", "list refs 2025-5-11 22:11:26", "", () => tomatoI18n.同步块选择)
export const LinkBox同步块创建 = winHotkey("⌘F2", "list refs 2025-5-11 22:11:22", "", () => tomatoI18n.同步块创建)
export const LinkBoxbilink = winHotkey("⌥/", "bilink 2025-5-11 22:11:17", "🔗", () => tomatoI18n.双向互链)
export const LinkBox链接到块底部 = winHotkey("⌥F3", "lnk2bottom 2025-5-11 22:11:13", "", () => tomatoI18n.链接到块底部)
export const LinkBox双向互链选择块 = winHotkey("⌥F1", "bilinkSelectBlock 2025-5-11 22:11:08", "", () => tomatoI18n.双向互链选择块)
export const LinkBox双向互链创建往返链 = winHotkey("⌥F2", "bilinkSelectBlock 2025-5-11 22:11:04", "", () => tomatoI18n.双向互链创建往返链)
export const LinkBox修复双向链接 = winHotkey("⌥⇧F1", "fixLnk 2025-5-11 22:10:56", "", () => tomatoI18n.修复双向链接)
export const LinkBox删除双向链接 = winHotkey("⌥⇧F2", "remove link 2025年9月1日16:08:16", "", () => tomatoI18n.删除双向链接)
export const LinkBox嵌入互链选择 = winHotkey("⇧⌥1", "bilinkSelectBlock 2025-5-11 22:10:51", "", () => tomatoI18n.嵌入互链选择)
export const LinkBox嵌入互链创建 = winHotkey("⇧⌥2", "bilinkCreateLnk 2025-5-11 22:10:47", "", () => tomatoI18n.嵌入互链创建)
export const LinkBox关联两个块选择 = winHotkey("⌘⌥[", "bilinkSelectBlockRefOnly 2025-5-11 22:33:00", "", () => tomatoI18n.关联两个块选择)
export const LinkBox关联两个块创建 = winHotkey("⌘⌥]", "bilinkCreateLnkRefOnly 2025-5-11 22:34:04", "", () => tomatoI18n.关联两个块创建)
export const LinkBox互相插入引用于下方选择 = winHotkey("⌘⇧F1", "bidirection refs 2025-5-11 22:36:28", "", () => tomatoI18n.互相插入引用于下方选择)
export const LinkBox互相插入引用于下方创建 = winHotkey("⌘⇧F2", "bidirection refs 2025-5-11 22:37:12", "", () => tomatoI18n.互相插入引用于下方创建)


class LinkBox {
    plugin: BaseTomatoPlugin;
    private selectedDivs: HTMLElement[] = [];
    private observer: MutationObserver;

    onunload() {
        this.observer?.disconnect();
        this.observer = null;
    }

    async onload(plugin: BaseTomatoPlugin) {
        if (!linkBoxCheckbox.get()) return;
        this.plugin = plugin;
        await verifyKeyTomato()
        this.plugin.addCommand({
            langKey: LinkBoxbilink.langKey,
            langText: LinkBoxbilink.langText(),
            hotkey: LinkBoxbilink.m,
            editorCallback: async (protyle: IProtyle) => {

                const { selected, docName, docID } = await events.selectedDivs(protyle);
                for (const div of selected)
                    await this.addLink(div, docID, docName);
            },
        });

        const markBlock = async (protyle: IProtyle) => {
            const { selected } = await events.selectedDivs(protyle);
            // const allp = selected.map(i => i.getAttribute(gconst.DATA_TYPE))
            //     .reduce((all, i) => all && i === gconst.BlockNodeEnum.NODE_PARAGRAPH, true)
            if (selected.length > 0 /*&& allp*/) {
                this.selectedDivs = selected;
                const txt = utils.getAllContentEditableText(this.selectedDivs[0]);
                await siyuan.pushMsg(`【${tomatoI18n.双向互链}】selected：${txt}`);
            } else {
                this.selectedDivs = [];
                await siyuan.pushMsg(`【${tomatoI18n.双向互链}】${tomatoI18n.请先选中块}`);
            }
        }

        this.plugin.addCommand({
            langKey: LinkBox链接到块底部.langKey,
            langText: LinkBox链接到块底部.langText(),
            hotkey: LinkBox链接到块底部.m,
            editorCallback: async (protyle: IProtyle) => {
                const { selected } = await events.selectedDivs(protyle);
                if (selected.length > 0) {
                    await this.link2bottom(protyle, selected[0]);
                }
            },
        });

        this.plugin.addCommand({
            langKey: LinkBox修复双向链接.langKey,
            langText: LinkBox修复双向链接.langText(),
            hotkey: LinkBox修复双向链接.m,
            editorCallback: async (protyle: IProtyle) => {
                const { selected } = await events.selectedDivs(protyle);
                if (selected.length > 0) {
                    await this.fixLnk(protyle, selected[0]);
                    await siyuan.pushMsg("fix done!")
                } else {
                    await siyuan.pushMsg(`【${tomatoI18n.双向互链}】${tomatoI18n.请先选中块}`);
                }
            },
        });
        this.plugin.addCommand({
            langKey: LinkBox删除双向链接.langKey,
            langText: LinkBox删除双向链接.langText(),
            hotkey: LinkBox删除双向链接.m,
            editorCallback: async (protyle: IProtyle) => {
                const { selected } = await events.selectedDivs(protyle);
                if (selected.length > 0) {
                    await this.delLnk(protyle, selected[0]);
                    await siyuan.pushMsg("delete link done!")
                } else {
                    await siyuan.pushMsg(`【${tomatoI18n.双向互链}】${tomatoI18n.请先选中块}`);
                }
            },
        });

        this.plugin.addCommand({
            langKey: LinkBox双向互链选择块.langKey,
            langText: LinkBox双向互链选择块.langText(),
            hotkey: LinkBox双向互链选择块.m,
            editorCallback: markBlock,
        });
        this.plugin.addCommand({
            langKey: LinkBox双向互链创建往返链.langKey,
            langText: LinkBox双向互链创建往返链.langText(),
            hotkey: LinkBox双向互链创建往返链.m,
            editorCallback: async (protyle: IProtyle) => {
                const { selected } = await events.selectedDivs(protyle);
                if (selected.length > 0 && this.selectedDivs?.length > 0) {
                    await this.addLnkTwoDivs(protyle, this.selectedDivs[0], selected[0]);
                } else {
                    await siyuan.pushMsg(`【${tomatoI18n.双向互链}】${tomatoI18n.请先选中块}`);
                }
            },
        });

        this.plugin.addCommand({
            langKey: LinkBox嵌入互链选择.langKey,
            langText: LinkBox嵌入互链选择.langText(),
            hotkey: LinkBox嵌入互链选择.m,
            editorCallback: (protyle: IProtyle) => {
                if (lastVerifyResult()) markBlock(protyle)
            }
        });
        this.plugin.addCommand({
            langKey: LinkBox嵌入互链创建.langKey,
            langText: LinkBox嵌入互链创建.langText(),
            hotkey: LinkBox嵌入互链创建.m,
            editorCallback: async (protyle: IProtyle) => {
                if (lastVerifyResult()) {
                    const { selected } = await events.selectedDivs(protyle);
                    if (selected.length > 0 && this.selectedDivs?.length > 0) {
                        await this.addEmbedLnkTwoDivs(protyle, this.selectedDivs, selected[0]);
                    } else {
                        await siyuan.pushMsg(`【${tomatoI18n.双向互链}】${tomatoI18n.请先选中块}`);
                    }
                }
            },
        });

        this.plugin.addCommand({
            langKey: LinkBox关联两个块选择.langKey,
            langText: LinkBox关联两个块选择.langText(),
            hotkey: LinkBox关联两个块选择.m,
            editorCallback: markBlock,
        });
        this.plugin.addCommand({
            langKey: LinkBox关联两个块创建.langKey,
            langText: LinkBox关联两个块创建.langText(),
            hotkey: LinkBox关联两个块创建.m,
            editorCallback: async (protyle: IProtyle) => {
                const { selected } = await events.selectedDivs(protyle);
                if (selected.length > 0 && this.selectedDivs?.length > 0) {
                    await linkTwoElementsWithRef(this.selectedDivs[0], selected[0], protyle);
                } else {
                    await siyuan.pushMsg(`【${tomatoI18n.双向互链}】${tomatoI18n.请先选中块}`);
                }
            },
        });

        this.plugin.addCommand({
            langKey: LinkBox互相插入引用于下方选择.langKey,
            langText: LinkBox互相插入引用于下方选择.langText(),
            hotkey: LinkBox互相插入引用于下方选择.m,
            editorCallback: markBlock,
        });
        this.plugin.addCommand({
            langKey: LinkBox互相插入引用于下方创建.langKey,
            langText: LinkBox互相插入引用于下方创建.langText(),
            hotkey: LinkBox互相插入引用于下方创建.m,
            editorCallback: async (protyle: IProtyle) => {
                const { selected } = await events.selectedDivs(protyle);
                if (selected.length > 0 && this.selectedDivs?.length > 0) {
                    await bilinkWithInsertingRefs(this.selectedDivs[0], selected[0], protyle);
                } else {
                    await siyuan.pushMsg(`【${tomatoI18n.双向互链}】${tomatoI18n.请先选中块}`);
                }
            },
        });

        this.plugin.eventBus.on(EventType.open_menu_content, ({ detail }) => {
            this.addLnkByLnk(detail as any);
            this.showSyncBlocksMenu(detail as any);
        });

        if (linkBoxSyncBlock.get()) {
            this.plugin.addCommand({
                langText: LinkBox查看所有同步位置.langText(),
                langKey: LinkBox查看所有同步位置.langKey,
                hotkey: LinkBox查看所有同步位置.m,
                editorCallback: (protyle) => showSyncBlocks(protyle, this.plugin),
            });
            this.plugin.addCommand({
                langKey: LinkBox同步块选择.langKey,
                langText: LinkBox同步块选择.langText(),
                hotkey: LinkBox同步块选择.m,
                editorCallback: markBlock,
            });
            this.plugin.addCommand({
                langKey: LinkBox同步块创建.langKey,
                langText: LinkBox同步块创建.langText(),
                hotkey: LinkBox同步块创建.m,
                editorCallback: async (protyle: IProtyle) => {

                    const { selected } = await events.selectedDivs(protyle);
                    if (selected.length > 0 && this.selectedDivs?.length > 0) {
                        await this.addSyncLink(protyle, this.selectedDivs, selected[0]);
                    } else {
                        await siyuan.pushMsg(`【${tomatoI18n.双向互链}】${tomatoI18n.请先选中块}`);
                    }
                },
            });
            events.addWsListener("link sync 2024-12-5 20:38:55", (detail) => {
                if (!linkBoxSyncBlockAuto.get()) return;
                for (const ops of getDoOperations(detail)) {
                    // sid 是内核广播自带的发起方会话 id：编辑器自身事务（打字）时即发起视图的
                    // protyle.id。传播时原样带上，内核才能排除「正在打字的视图」的回声
                    ops.sid = detail.sid;
                    debugLog("ws", `action=${ops.action} id=${ops.id} sid=${ops.sid ?? "-"}`)
                    switch (ops.action) {
                        case "delete":
                            ops.id = ops.parentID;
                            ops.data = null;
                            doSync(ops);
                            break;
                        case "update":
                        case "move":
                        case "insert":
                            doSync(ops);
                            break;
                        default:
                            break;
                    }
                }
            });
            // 主动巡检（设计 §5）：云端同步完成后与插件启动 5s 后各跑一次（sync_fail 不跑），
            // 捕获插件关闭/未启用期间累积分叉，只标记不传播
            this.plugin.eventBus.on(EventType.sync_end, () => { scanAllGroups() });
            setTimeout(() => { scanAllGroups() }, 5 * 1000);
            if (linkBoxAttrIconOnHide.get() && await verifyKeyTomato()) {
                // ignore
            } else {
                this.observer = new MutationObserver((mutationsList) => {
                    for (const mutation of mutationsList) {
                        // status 也要触发重挂徽标：冲突标记/清除是属性写入，不换 DOM 节点
                        if (mutation.type === "attributes"
                            && (mutation.attributeName === "custom-sync-version" || mutation.attributeName === "custom-sync-status")) {
                            addBar(mutation.target as any);
                        }
                        mutation.addedNodes.forEach(addBar)
                    }
                });
                this.observer.observe(document.body, { attributes: true, childList: true, subtree: true });
            }
        }
    }

    blockIconEvent(detail: any) {
        if (!linkBoxCheckbox.get()) return;
        this.addLnkByLnk(detail);
        this.showSyncBlocksMenu(detail);
    }

    private async link2bottom(protyle: IProtyle, div: HTMLElement) {
        const docID = protyle?.block?.rootID;
        if (!docID) return;
        const newID = utils.NewNodeID();
        const anchorID = utils.NewNodeID();
        const block = `{{{row
{: id="${newID}"}
{: id="${anchorID}"}
}}}
{: custom-lnk-bottom="1"}
`;
        await siyuan.appendBlock(block, docID);
        const { div: newDiv } = await utils.getBlockDiv(newID);
        await this.addLnkTwoDivs(protyle, div, newDiv);
        await OpenSyFile2(this.plugin, anchorID);
    }

    private async delLnk(_protyle: IProtyle, div: HTMLElement) {
        const blockID = getAttribute(div, "data-node-id")
        let toIDs = getAttribute(div, "custom-lnk-to-ids")?.split(",") ?? []
        if (blockID && toIDs.length > 0) {
            const blockIDs = await siyuan
                .sqlAttr(`select block_id from attributes 
                    where name="custom-lnk-my-id" 
                    and value in (${toIDs.map(i => `"${i}"`).join(",")}) limit 999999`)
                .then(attrs => attrs?.map(a => a.block_id)) ?? [];
            for (const bID of blockIDs) {
                div.querySelectorAll(`span[data-type="a"][data-href^="siyuan://blocks/${bID}"]`)
                    .forEach(e => {
                        e.parentElement.removeChild(e);
                    });
            }
            div.querySelectorAll(`span[data-type="a"]`)
                .forEach(e => {
                    if (e.textContent == "[<-*]" || e.textContent == "[->*]") {
                        e.parentElement.removeChild(e);
                    }
                });
            utils.removeAttribute(div, "custom-lnk-my-id")
            utils.removeAttribute(div, "custom-lnk-to-ids")
            await siyuan.updateBlock(blockID, div.outerHTML, "dom");
        }
    }

    private async fixLnk(protyle: IProtyle, div: HTMLElement) {
        const id = div.getAttribute(gconst.DATA_NODE_ID);
        siyuan.pushMsg("fix broken link");
        const { newToIDs, realToIDs } = await (async () => {
            let toIDs = utils.getAttribute(div, "custom-lnk-to-ids")
            const newToIDs: string[] = [];
            const realToIDs: string[] = [];
            if (toIDs) {
                for (const id of toIDs.split(",")) {
                    const rows = await siyuan.sqlAttr(`select block_id from attributes where name="custom-lnk-my-id" and value="${id}" limit 1`)
                    if (rows?.length > 0) {
                        realToIDs.push(rows[0].block_id)
                        newToIDs.push(id);
                    }
                }
            }
            return { newToIDs, realToIDs }
        })();
        await siyuan.setBlockAttrs(id, { "custom-lnk-to-ids": newToIDs.join(",") })
        for (const realToID of realToIDs) {
            let toDiv = document.querySelector(`div[data-node-id="${realToID}"]`)
            if (!toDiv) {
                const { div } = await utils.getBlockDiv(realToID)
                toDiv = div
            }
            if (toDiv) {
                await this.addLnkTwoDivs(protyle, div, toDiv as any);
            }
        }
    }

    private async addSyncLink(protyle: IProtyle, divs1: HTMLElement[], div2: HTMLElement) {
        const ids1 = divs1?.map(i => i.getAttribute(gconst.DATA_NODE_ID))
        const id2 = div2?.getAttribute(gconst.DATA_NODE_ID);
        if (!ids1 || ids1.length == 0 || !id2 || !protyle) return;
        if (!await siyuan.checkBlockExist(id2)) return;
        const ops: IOperation[] = [];
        if (divs1.length === 1) {
            let { found } = findParentSuper(divs1[0])
            found = utils.cloneCleanDiv(found)?.div
            if (found) {
                ops.push(...siyuan.transInsertBlocksAfter([found.outerHTML], id2));
                await siyuan.transactions(ops);
                return;
            }
        }
        const suID = utils.NewNodeID();
        if (linkBoxSyncHref.get() && await verifyKeyTomato()) {
            utils.add_href(divs1[0], suID, " * ")
        }
        if (linkBoxSyncRef.get() && await verifyKeyTomato()) {
            utils.add_ref(divs1[0], suID, " * ")
        }
        this.selectedDivs = [];
        const syncID = utils.NewNodeID();
        const su = new DomSuperBlockBuilder();
        su.setID(suID);
        su.setAttr("custom-sync-block-id", syncID)
        su.setAttr("custom-sync-version", "1")
        su.setAttr("custom-sync-block-count", "2")
        su.setAttr("custom-sync-origin-id", suID)
        divs1.forEach(i => su.append(utils.cloneCleanDiv(i).div))
        su.setAttr("custom-sync-hash", utils.normalizeForHash(su.container)) // 创建时写基线初值（设计 §3.1）
        ops.push(...siyuan.transInsertBlocksAfter([su.build().outerHTML], ids1[ids1.length - 1]))
        ops.push(...siyuan.transDeleteBlocks(ids1));
        ops.push(...siyuan.transInsertBlocksAfter([su.cloneDiv().div.outerHTML], id2));
        await siyuan.transactions(ops);
        setTimeout(() => {
            const d = document.querySelector(`div[custom-sync-block-id="${syncID}"]`) as HTMLElement
            if (d) this.selectedDivs = [d];
        }, 1000);
    }

    private async addEmbedLnkTwoDivs(protyle: IProtyle, divs1: HTMLElement[], div2: HTMLElement) {
        const ids1 = divs1?.map(i => i.getAttribute(gconst.DATA_NODE_ID))
        const id2 = div2?.getAttribute(gconst.DATA_NODE_ID);
        if (!ids1 || ids1.length == 0 || !id2 || !protyle) return;
        const ops: IOperation[] = [];
        if (divs1.length === 1) {
            const { id } = findListTypeByElement(divs1[0])
            if (id) {
                ids1[0] = id;
            }
            const { html: embHTML } = domEmbedding(ids1[0]);
            ops.push(...siyuan.transInsertBlocksAfter([embHTML], id2));
            await siyuan.transactions(ops);
        } else {
            const list = new DomListBuilder();
            const { html: embHTML } = domEmbedding(list.id);
            divs1.forEach(i => list.append(utils.cloneCleanDiv(i).div))
            ops.push(...siyuan.transInsertBlocksAfter([list.build().outerHTML], ids1[ids1.length - 1]))
            ops.push(...siyuan.transDeleteBlocks(ids1));
            ops.push(...siyuan.transInsertBlocksAfter([embHTML], id2));
            await siyuan.transactions(ops);
            protyle.getInstance().reload(false)
        }
    }

    private async addLnkTwoDivs(protyle: IProtyle, div1: HTMLElement, div2: HTMLElement) {
        const id1 = div1?.getAttribute(gconst.DATA_NODE_ID)
        const id2 = div2?.getAttribute(gconst.DATA_NODE_ID)
        if (!id1 || !id2 || !protyle) return;

        let txt1: string;
        let txt2: string;

        if (linkBoxLnkTitle.get()) {
            txt1 = this.contentWithoutAnchor(div1) ?? "*";
            txt2 = this.contentWithoutAnchor(div2) ?? "*";

            txt1 = txt1.replaceAll(/[\s\p{P}　]+/gu, "");
            txt2 = txt2.replaceAll(/[\s\p{P}　]+/gu, "");
        }

        if (!txt1) txt1 = "*";
        if (!txt2) txt2 = "*";

        utils.clean_href(div1, id2);
        utils.clean_href(div2, id1);
        await Promise.all([clean_broken_href(div1), clean_broken_href(div2)])
        utils.add_href(div1, id2, `[->${txt2.slice(0, 10)}]`);
        utils.add_href(div2, id1, `[<-${txt1.slice(0, 10)}]`);

        let frozenID1 = utils.getAttribute(div1, "custom-lnk-my-id")
        let frozenID2 = utils.getAttribute(div2, "custom-lnk-my-id")
        if (!frozenID1) frozenID1 = utils.NewNodeID();
        if (!frozenID2) frozenID2 = utils.NewNodeID();

        setAttribute(div1, "custom-lnk-my-id", frozenID1)
        setAttribute(div1, "custom-lnk-to-ids", joinByComma(utils.getAttribute(div1, "custom-lnk-to-ids"), frozenID2))

        setAttribute(div2, "custom-lnk-my-id", frozenID2)
        setAttribute(div2, "custom-lnk-to-ids", joinByComma(utils.getAttribute(div2, "custom-lnk-to-ids"), frozenID1))

        // protyle.getInstance().updateBatchTransaction([div1, div2], (_e) => { });
        await siyuan.updateBlocks([{
            id: id1,
            domStr: div1.outerHTML
        }, {
            id: id2,
            domStr: div2.outerHTML
        }]);
        utils.moveCursor2HeadProtyle(protyle, id2);
        await siyuan.pushMsg(`【${tomatoI18n.双向互链}】${tomatoI18n.创建往返链成功}`);
    }

    private contentWithoutAnchor(e: HTMLElement) {
        e = utils.getContenteditableElement(e) as HTMLElement;
        const c = e.cloneNode(true) as HTMLElement;
        c.querySelectorAll(`span[${gconst.DATA_TYPE}="a"]`).forEach(e => e.parentElement.removeChild(e));
        return c.textContent.trim();
    }

    private showSyncBlocksMenu(detail: TomatoMenu) {
        const { selected } = events.selectedDivsSync(detail.protyle);
        const element = selected?.at(0);
        const { found } = findParentSuper(element)
        if (found) {
            detail.menu.addItem({
                iconHTML: LinkBox查看所有同步位置.icon,
                accelerator: LinkBox查看所有同步位置.m,
                label: LinkBox查看所有同步位置.langText(),
                click: () => showSyncBlocks(detail.protyle, this.plugin, found)
            });
        }
    }

    private addLnkByLnk(detail: TomatoMenu) {
        if (linkBoxBilinkMenu.get()) {
            detail.menu.addItem({
                iconHTML: LinkBoxbilink.icon,
                accelerator: LinkBoxbilink.m,
                label: LinkBoxbilink.langText(),
                click: async () => {
                    const { selected, docName, docID } = await events.selectedDivs(detail.protyle as any);
                    for (const div of selected)
                        await this.addLink(div, docID, docName);
                }
            });
        }
    }

    async addLink(element: HTMLElement, docID: string, docName: string) {
        element = findPara(element);
        const srcID = element.getAttribute(gconst.DATA_NODE_ID);
        const ids = extractLinksFromElement(element);
        if (ids.length <= 0) return;
        const currentEditable = utils.getContenteditableElement(element);
        if (!currentEditable) return;
        const rows = await siyuan.getRows(ids, "id,type", false);
        let insertCount = 0;
        const newAnchors = new Map<string, string>;
        const ops = [];
        for (const { id, type } of rows) {
            if (!id || !type) continue;
            if (type === "d") {
                const attrRows = await siyuan.sqlAttr(`select block_id from attributes 
                    where name="${gconst.LinkBoxDocLinkIAL}" and value = "${srcID}" and root_id="${id}"`);
                const row = attrRows.pop();
                if (row) {
                    newAnchors.set(id, row.block_id);
                } else {
                    const backLink = `⚓((${docID} '${docName}'))::((${srcID} '${currentEditable.textContent}'))`;
                    const ab = new AttrBuilder("", true);
                    ab.add(gconst.LinkBoxDocLinkIAL, srcID);
                    await siyuan.appendBlock(`${backLink}\n${ab.build()}`, id);
                    newAnchors.set(id, ab.id);
                    insertCount++;
                }
            } else {
                const { div } = await utils.getBlockDiv(id);
                const idInIAL = div.getAttribute(gconst.LinkBoxDocLinkIAL);
                if (idInIAL == srcID) continue;
                const ids = extractLinksFromElement(div);
                if (ids.includes(srcID)) continue;
                div.setAttribute(gconst.LinkBoxDocLinkIAL, srcID);
                const editable = utils.getContenteditableElement(div);
                const span = editable.appendChild(document.createElement("span"));
                let txt = " * "
                if (linkBoxLnkTitle.get()) {
                    txt = currentEditable?.textContent?.replace(editable.textContent, "")?.trim();
                    if (!txt) txt = docName;
                }
                if (linkBoxUseLnkOrRef.get()) {
                    utils.set_href(span, srcID, `${txt}`);
                } else {
                    utils.set_ref(span, srcID, `${txt}`);
                }
                ops.push(...siyuan.transUpdateBlocks([{ id, domStr: div.outerHTML }]));
                insertCount++;
            }
        }
        await siyuan.transactions(ops);
        await this.turn2static(srcID, element, newAnchors);
        await siyuan.pushMsg(`inserted link: ${insertCount}/${ids.length}`);
    }

    private async turn2static(srcID: string, element: HTMLElement, anchors: Map<string, string>) {
        for (const e of element.querySelectorAll(`[${gconst.DATA_TYPE}~="${gconst.BLOCK_REF}"]`)) {
            let id = e.getAttribute(gconst.DATA_ID);
            const anchorID = anchors.get(id);
            if (anchorID) id = anchorID;
            if (linkBoxUseLnkOrRef.get()) {
                utils.set_href(e as any, id);
            } else {
                utils.set_ref(e as any, id);
            }
        }
        await siyuan.updateBlocks([{ id: srcID, domStr: element.outerHTML }])
        const e = element.querySelector(`[${gconst.DATA_NODE_ID}="${srcID}"]`) as HTMLElement;
        if (e?.childElementCount > 0)
            document.getSelection().collapse(e, 1);
    }
}

export const linkBox = new LinkBox();

export async function showSyncBlocks(protyle: IProtyle, plugin: Plugin, element?: HTMLElement) {

    if (!element) {
        const { selected } = await events.selectedDivs(protyle);
        element = selected?.at(0);
    }
    if (element) {
        const { found, id: cursorPosID } = findParentSuper(element)
        const syncID = utils.getAttribute(found, "custom-sync-block-id");
        if (syncID) {
            const { blocks, anyConflict } = await getGroupState("", syncID)
                .then(async ({ rows, anyConflict }) => {
                    if (rows?.length > 0) {
                        const ids = rows.map(row => `"${row.block_id}"`).join(",")
                        const blocks = await siyuan.sql(`
                            select a.content,b.id from blocks a inner join (select * from blocks where id in (${ids}) limit 9999999999) b
                            on b.root_id = a.id
                            where a.type='d' limit 9999999999
                        `)
                        blocks.forEach(b => {
                            const r = rows.find(r => r.block_id == b.id)
                            if (r) {
                                b.data = r.value;
                            }
                        })
                        return { blocks, anyConflict };
                    }
                    return { blocks: null, anyConflict };
                });
            const rows = blocks;
            if (rows?.length > 0) {
                let title = tomatoI18n.已在x个地方同步(rows.length)
                if (anyConflict) {
                    title = tomatoI18n.同步冲突
                }
                const dm = new DestroyManager();
                const id = newID();
                const dialog = new Dialog({
                    title,
                    content: `<div id="${id}"></div>`,
                    width: events.isMobile ? "90vw" : "300px",
                    height: events.isMobile ? "180vw" : "400px",
                    destroyCallback: () => {
                        dm.destroyBy("1")
                    },
                });
                const d = mount(LinkBoxDialog, {
                    target: dialog.element.querySelector("#" + id),
                    props: {
                        plugin,
                        rows,
                        dialog,
                        dm,
                        cursorPosID,
                        syncID,
                        syncDiv: found,
                        verMap,
                    }
                });
                dm.add("1", () => { dialog.destroy() })
                dm.add("2", () => { d.destroy() })
            }
        }
    }
}

const verMap = new Map<string, number>();
// checkSync 对「传播未完成（v=0）」每个 syncID 只重试一次（设计 §4.6）
const checkSyncRetried = new Set<string>();

// doSync 按 syncID 去抖（设计 §7 聚合的引擎半）：trailing 窗口从最后一个 op 起算（□6 修复，2026-08-21）。
// 旧固定窗口打字中途到期会从页面 DOM 抓中间态（如 MN）传播，尾字剩到下一轮，且中途传播把共享子块 ID
// 克隆进目标引发 blocktree 翻转（编辑者的后续打字 op 被内核写进目标的树）。现在打字不停轮次不发，
// 停手 SYNC_SETTLE_MS 后一轮带走全部；窗口内后到的 op 覆盖先到的（以最新事务时点为准）。
// settle 另一半语义：给 ws 回声一点静置时间，避免与在途回声交错判定（判定已内核直读，不依赖 SQL 索引收敛）。
const SYNC_SETTLE_MS = 500;
const syncDebounce = createTrailingDebouncer<gconst.DoOperation>(SYNC_SETTLE_MS, (syncID, ops) => runDoSync(ops, syncID));

function scheduleDoSync(ops: gconst.DoOperation, syncID: string) {
    syncDebounce.touch(syncID, ops);
}

// doSync 决策树（设计 §4.4）：
// 短路 0 组 status=conflict → 返回（防「标记写入 → ws 事件 → 再进 doSync」的事件风暴，冲突期不传播）
// 短路 1 不在同步组内 → 返回
// 1    读 DB 取 v_base/h_base（不读 DOM 属性，修 P6）
// 2    getGroupState 一次 SQL 取其他副本 (version, hash, status)
// 3    h_base 缺失 → 遗留组：decideGroupAction 天然放行，本次传播顺带补全全组 hash
// 4    C≠∅ → 全组标 conflict + 通知，不传播不动版本
// 5    C=∅ → 按「编辑基线」哈希分叉：当前内容哈希 == h_base 的是接收方（version=0 舞步的接收侧，
//       只自我对齐版本）；≠ 的是修改源，走传播并把 h_new 写给全组
// superDiv 解析链（设计 §6）：
// 1. document.querySelector（页面已打开）
// 2. 事务时点 ops.data（仅当 op 目标即超级块本身时有效——不能拿最新的，必须根据事务顺序来，防止版本变大过快）
// 3. 删除兜底 getBlockDiv(ops.parentID || ops.id)：delete op 已被 getDoOperations 换成携带删除前 DOM 的
//    undo op（utils.ts:149），被删的是子块时该 DOM 不含 super 属性——用 parentID 从内核取删除后的
//    父容器最新态，再 findParentSuper（含自身：parentID 即 super 时也能命中）
async function resolveSuperDiv(ops: gconst.DoOperation): Promise<{ superDiv: HTMLElement; id: string }> {
    // 共享子块 ID 模式下同一子块 ID 在组内各副本 DOM 都存在，querySelector 只回第一个——
    // 解析到「没在打字的副本」会把旧内容当传播源、把打字块当补刷目标（光标被替换丢失）。
    // 光标所在副本就是编辑发生处，优先命中
    const divs = document.querySelectorAll(`div[data-node-id="${ops.id}"]`);
    let div = divs[0] as HTMLElement;
    const anchor = getSelection()?.anchorNode;
    if (anchor) {
        for (const d of divs) {
            if (d.contains(anchor)) { div = d as HTMLElement; break; }
        }
    }
    let { found, id } = findParentSuper(div);
    let superDiv = found?.cloneNode(true) as HTMLElement;
    if (!superDiv) {
        superDiv = utils.dom2div(ops.data);
        id = ops.id;
        if (!utils.getAttribute(superDiv, "custom-sync-block-id")) {
            const { div: pdiv } = await utils.getBlockDiv(ops.parentID || ops.id);
            ({ found } = findParentSuper(pdiv));
            superDiv = found?.cloneNode(true) as HTMLElement;
            if (superDiv) id = utils.getAttribute(superDiv, gconst.DATA_NODE_ID);
        }
    }
    return { superDiv, id };
}

function doSync(ops: gconst.DoOperation) {
    if (!ops?.id) return;
    resolveSuperDiv(ops).then(({ superDiv }) => {
        const syncID = utils.getAttribute(superDiv, "custom-sync-block-id");
        debugLog("doSync", `id=${ops.id} syncID=${syncID ?? "-"}`);
        if (syncID) scheduleDoSync(ops, syncID);
    });
}

async function runDoSync(ops: gconst.DoOperation, syncID: string) {
    const { superDiv, id } = await resolveSuperDiv(ops);
    if (!utils.getAttribute(superDiv, "custom-sync-block-id")) return;
    navigator.locks.request("link sync lock " + syncID, { mode: "exclusive" }, async (lock) => {
        // 异常兜底：这里抛出去是无人接的 promise rejection，判定链会「无下文」静默死（排查盲区）
        try {
            await runDoSyncLocked(ops, syncID, superDiv, id, lock);
        } catch (e) {
            debugLog("runDoSync", `异常 syncID=${syncID} id=${id} ${e instanceof Error ? e.message : String(e)}`);
        }
    });
}

async function runDoSyncLocked(ops: gconst.DoOperation, syncID: string, superDiv: HTMLElement, id: string, lock: Lock) {
    if (!lock) return;
    {
        if (!lock) return;
        // 传播过渡态快速路径：事务 DOM 里 version=0 是「刚收到传播」的标记（舞步），此时内核索引
        // 可能尚未提交本副本的新 (v,h)，拿旧基线做冲突判定会误报——只对齐版本，直接返回。
        // 多前端（桌面 App + 浏览器）并存时本路径也是双跑的稳定锚点：谁先对齐都幂等。
        const domVer0 = utils.stringToNumber(utils.getAttribute(superDiv, "custom-sync-version")) === 0;
        debugLog("runDoSync", `id=${id} domVer0=${domVer0}`);
        if (domVer0) {
            const { maxVer } = await getGroupState(id, syncID);
            const attrs = await siyuan.getBlockAttrs(id);
            const vBase = utils.stringToNumber(attrs?.["custom-sync-version"]);
            if (maxVer > vBase) {
                await siyuan.setBlockAttrs(id, { "custom-sync-version": maxVer.toString() });
            }
            return;
        }
        // 基线只认 DB 属性（修 P6：编辑器 DOM 属性可能滞后）
        const attrs = await siyuan.getBlockAttrs(id);
        const vBase = utils.stringToNumber(attrs?.["custom-sync-version"]);
        const hBase = attrs?.["custom-sync-hash"];
        const baseStatus = attrs?.["custom-sync-status"];
        const { peers, rows, maxVer, anyConflict } = await getGroupState(id, syncID);
        const action = decideGroupAction({
            base: { id, version: vBase, hash: hBase },
            peers,
            status: baseStatus === "conflict" || anyConflict ? "conflict" : undefined,
        });
        if (action === "skip") {
            // 冲突黏住自愈（2026-08-21 用户实测「两边已同步仍显示冲突」）：标冲突后本分支
            // 短路一切传播，清除标记只剩 checkSync 的 10s 治愈一条路。冲突的实体是「组内
            // 哈希分叉」——若 peers 哈希全等于本侧基线（DB 层面已一致），冲突不存在，清标记
            // 后穿透到正常判定，编辑照常传播；真分叉则维持 skip 等裁决
            const healed = peers.length > 0 && hBase != null && peers.every(p => p.hash != null && p.hash === hBase);
            debugLog("runDoSync", `action=skip id=${id} healed=${healed} hBase=${hBase?.slice(0, 6) ?? "-"} peersHash=${peers.map(p => p.hash?.slice(0, 6) ?? "-").join(",")}`);
            if (!healed) return;
            await clearGroupStatus([id, ...peers.map(p => p.id)]);
        }
        if (action === "conflict") {
            debugLog("runDoSync", `action=conflict id=${id} 标冲突`);
            await markGroupConflict([{ id, status: baseStatus }, ...peers]);
            return;
        }
        // 接收方判定（设计 §3.1 编辑基线）：当前内容哈希 == DB 基线哈希，说明本事件没有
        // 基线之外的修改（传播回声 / 属性触碰）；DOM 版本属性落后于 DB 说明编辑器还没应用
        // 完上一轮事务，此时传播会拿旧内容覆盖别人。两种情况都只做版本自我对齐——
        // 这就是「写 version=0 → 各副本 ws 事件自我对齐」舞步的接收侧（§4.1 不变量）。
        const hCur = utils.normalizeForHash(superDiv);
        const domVer = utils.stringToNumber(utils.getAttribute(superDiv, "custom-sync-version"));
        debugLog("runDoSync", `id=${id} action=${action} vBase=${vBase} hBase=${hBase?.slice(0, 10) ?? "-"} hCur==hBase=${hCur === hBase} domVer=${domVer} peers=${peers.length} maxVer=${maxVer}`);
        if (hCur === hBase || domVer !== vBase) {
            if (maxVer > vBase) {
                await siyuan.setBlockAttrs(id, { "custom-sync-version": maxVer.toString() });
            }
            return;
        }
        // 修改源：传播。syncVer 取组内最大版本 +1，副本漏收传播后（v 落后）再编辑也能直接追平。
        const cacheVer = verMap.get(syncID) ?? -1; // 防止重复更新
        const syncVer = Math.max(maxVer, vBase) + 1;
        debugLog("runDoSync", `id=${id} 传播分支 syncVer=${syncVer} cacheVer=${cacheVer} remap=${linkBoxSyncRemapChildID.get()}`);
        if (syncVer > cacheVer) {
            verMap.set(syncID, syncVer)
            const count = (rows.length + 1).toString();
            await addSyncItemAttr(superDiv); // 新子块先领 item-id（§3.2 哈希计算时点）
            const hNew = utils.normalizeForHash(superDiv);
            setAttribute(superDiv, "custom-sync-hash", hNew);
            await siyuan.setBlockAttrs(id, { "custom-sync-block-count": count, "custom-sync-version": syncVer.toString(), "custom-sync-hash": hNew });
            setAttribute(superDiv, "custom-sync-version", "0");
            // 回声抑制（2026-08-21 光标跳块首修复二轮）：编辑器自身事务广播自带 sid=发起视图
            // protyle.id，直接透传给内核排除该视图——currentProtyle 只在 docID 变化时更新，同文档
            // 双视图等场景会滞后错位（排除错连接 → 打字视图照收回声 → 光标跳块首），仅作兜底
            const editorSession = ops.sid ?? currentProtyle.get()?.protyle?.id;
            await syncAllBlocks(superDiv, count, rows, editorSession);
            // 编辑者基线回写 + 源侧自写（□6，2026-08-21）：上面写进 superDiv 的 version=0 是给目标克隆的
            // 舞步标记，留在编辑者 DOM 上会让下一轮被 domVer≠vBase 早退吞掉（尾字丢失）或卡 domVer0
            // 快速路径——回写 syncVer 与 updateAttrs 广播幂等，堵住两者的应用乱序竞态；
            // 传播事务只写目标，共享子块 ID 模式（remap 关）下源内核副本会停在旧内容：blocktree 随克隆
            // 翻转后，编辑者后续打字 op 被内核写进目标的树（实测深检以旧源为据传播可回滚新内容）——
            // 源也用同一份 DOM 自写一次保持内核新鲜，并让「正在编辑的树」恒为子块索引的当前副本
            setAttribute(superDiv, "custom-sync-version", syncVer.toString());
            if (rows.length > 0) {
                await siyuan.transactions(siyuan.transUpdateBlocks([{ id, domStr: superDiv.outerHTML }]), [], editorSession);
            }
            if (anyConflict || baseStatus) {
                await clearGroupStatus([id, ...peers.map(p => p.id)]); // 裁决后的重传：成功后清除组 status（§4.4 5b）
            }
            setTimeout(() => {
                checkSync(syncID);
            }, 10 * 1000);
        }
    }
}

// 组校验（设计 §4.6，编辑后 10s 触发）：哈希分叉 → 有 v=0 只重试一次，否则全组标 conflict + 通知；
// 哈希全等（含全组无 hash 的遗留组）→ 版本倾斜只是内容同源的过渡态（§4.3 行 5），治愈到 maxVer 并清 conflict 标记
// （已是 ok 不写，防抖）。旧的 content 列等值比较与 count="-1" 标记逻辑已移除（UI 兼容读旧标记一个版本期）。
async function checkSync(syncID: string) {
    const { peers, maxVer, anyConflict } = await getGroupState("", syncID);
    if (!(peers.length > 0)) return;
    if (new Set(peers.map(p => p.hash ?? "")).size > 1) {
        if (peers.some(p => p.version === 0)) {
            debugLog("checkSync", `syncID=${syncID} 分叉但有v0过渡态，延时复检`);
            if (!checkSyncRetried.has(syncID)) {
                checkSyncRetried.add(syncID);
                setTimeout(() => { checkSync(syncID) }, 10 * 1000);
            }
            return;
        }
        debugLog("checkSync", `syncID=${syncID} 哈希分叉标冲突 hashes=${peers.map(p => p.hash?.slice(0, 6) ?? "-").join(",")}`);
        await markGroupConflict(peers);
        return;
    }
    const ops = peers
        .filter(p => p.version !== maxVer || (anyConflict && p.status === "conflict"))
        .map(p => ({
            id: p.id,
            attrs: {
                ...(p.version !== maxVer ? { "custom-sync-version": maxVer.toString() } : {}),
                ...(anyConflict && p.status === "conflict" ? { "custom-sync-status": null } : {}),
            },
        }));
    if (ops.length > 0) {
        debugLog("checkSync", `syncID=${syncID} 哈希全等治愈 ${ops.length} 个成员到 v${maxVer}`);
        await siyuan.batchSetBlockAttrs(ops);
    }
}

// 全组标 conflict；已是 conflict 的跳过写入，防「标记写入 → ws 事件 → 再进 doSync」的事件风暴。
// 逐成员写而非 batch：batch 是全有全无，混入一个僵尸成员（属性 API「未找到」）整批静默失败，
// 且 siyuan.call 对「成功 data:null」与「失败 code:-1」同返 null，返回值无法判别降级——干脆不批（标记量小且幂等）
async function markGroupConflict(targets: { id: string; status?: string }[]) {
    const pendings = targets.filter(t => t.id && t.status !== "conflict");
    if (pendings.length > 0) {
        await Promise.all(pendings.map(t => siyuan.setBlockAttrs(t.id, { "custom-sync-status": "conflict" })));
    }
    await siyuan.pushMsg(`【${tomatoI18n.双向互链}】${tomatoI18n.检测到同步冲突}`);
}

// 清除全组 conflict 标记：裁决后重传成功（§4.4 5b）或 checkSync 复核全等时调用；null 即删除属性。
// 逐成员写，理由同 markGroupConflict
async function clearGroupStatus(ids: string[]) {
    await Promise.all(ids.filter(Boolean).map(id => siyuan.setBlockAttrs(id, { "custom-sync-status": null })));
}

// 冲突裁决「以此块为准」（设计 §4.5）：显式用户意图。清全组 status 解除 doSync 短路 0（即 force
// 绕过冲突判定）→ 以该块为源跑一轮传播（version=0 舞步，§4.1 不变量；源块先写 (maxV+1, H_新)
// 再传播，让接收方回声立刻能对齐到新版本）→ 完成后通知。
export async function syncFromBlock(blockID: string, opts?: { silent?: boolean }) {
    const attrs = await siyuan.getBlockAttrs(blockID);
    const syncID = attrs?.["custom-sync-block-id"];
    if (!syncID) return;
    const { rows, peers, maxVer } = await getGroupState(blockID, syncID);
    await clearGroupStatus([blockID, ...peers.map(p => p.id)]);
    if (!(rows.length > 0)) return; // 组退化为单成员（其余幽灵/僵尸）：裁决只剩清标记一件事
    // 源 DOM 页面活副本优先（□6 数据丢失链修复，2026-08-21）：内核副本可能停在旧内容
    //（blocktree 翻转所致），以它为源传播会把新内容回滚掉；页面开着的副本才是编辑真值
    const div = utils.liveSyncDiv(blockID) ?? (await utils.getBlockDiv(blockID))?.div;
    if (!div) return;
    const superDiv = div.cloneNode(true) as HTMLElement;
    superDiv.classList.remove(PROTYLE_WYSIWYG_SELECT);
    const ver = Math.max(maxVer, utils.stringToNumber(attrs["custom-sync-version"])) + 1;
    const count = (rows.length + 1).toString();
    const cacheVer = verMap.get(syncID) ?? -1;
    if (ver <= cacheVer) return; // 防重复：同一版本裁决只跑一次
    verMap.set(syncID, ver)
    await addSyncItemAttr(superDiv); // 新子块先领 item-id（§3.2 哈希计算时点）
    const hNew = utils.normalizeForHash(superDiv);
    setAttribute(superDiv, "custom-sync-hash", hNew);
    await siyuan.setBlockAttrs(blockID, {
        "custom-sync-block-count": count,
        "custom-sync-version": ver.toString(),
        "custom-sync-hash": hNew,
    });
    setAttribute(superDiv, "custom-sync-version", "0");
    await syncAllBlocks(superDiv, count, rows);
    // 源侧自写（□6）：传播事务只写目标，共享子块 ID 模式下源内核副本会停在旧内容（blocktree 翻转），
    // 页关掉后深检即以旧内容误判误传——源用同一份 DOM 自写一次保持内核副本新鲜
    setAttribute(superDiv, "custom-sync-version", ver.toString());
    await siyuan.transactions(siyuan.transUpdateBlocks([{ id: blockID, domStr: superDiv.outerHTML }]));
    if (!opts?.silent) await siyuan.pushMsg(`【${tomatoI18n.双向互链}】${tomatoI18n.冲突已解决}`);
    // 与 runDoSync 一致：接收方回声可能抢在索引提交前对齐到旧 maxVer，10s 后 checkSync 治愈版本倾斜
    setTimeout(() => {
        checkSync(syncID);
    }, 10 * 1000);
}

// 全库同步组巡检（设计 §5）：sync_end 与 onload 后 5s 各跑一次。单条 SQL 按 name 过滤（走索引）→ JS 按 syncID 分组：
// - 深检（实现修订，checkpoint □5 + 2026-08-21 复燃修复）：managed 组存量哈希全等时逐成员拉内核 DOM 重算
//   normalizeForHash 裁决（deepScanVerdict）：重算互相不等时先看有几份偏离基线——仅一份（pending，
//   2026-08-21 误判修复）是尚未传播的单侧编辑（§4.2 C=∅ 场景），删除形（丢子块）仍标 conflict 交
//   用户裁决、编辑形自动以偏离侧为源传播（巡检唯一的传播出口，语义=doSync 对单侧编辑的安全覆盖，
//   兑现「只改一份、其余最终一致」，并解除误标 conflict 后短路 0 的永久卡死）；≥2 份不等偏离才是
//   真实分叉，走嫌疑→标 conflict；重算互相相等但 ≠ 存量=内容已一致仅基线过时（手工改齐/旧引擎/
//   规范化迁移），治愈重定基线不标冲突。成本从毫秒级单 SQL 升为每成员一次 DOM 拉取，
//   比对部分由 linkBoxSyncScanDeep 开关控制。
// - 其余分支只标记不传播——发现真分叉由用户裁决，与 doSync 短路 0 一致。
// - 存量哈希分叉 → 标 conflict；遗留组（无 hash）仅版本不一致即标；受管组哈希全等时版本倾斜是内容同源的
//   过渡态（§4.3 行 5），治愈对齐到 maxVer 并清残留标记；全等但挂着 conflict 标记的核对通过后清标记。
// - 证据与写目标只认「DOM 可达」成员：幽灵行（已删块残留）与僵尸行（blocktree 在、运行时树不在——
//   外部 API 删空 super 所致）的存量 (v,h) 停在失联时点，不能给活块定罪，也无法接收写入。
// 写回逐成员进行：标记量小且幂等，僵尸的写静默失败不炸批。
async function scanAllGroups() {
    // 必须带显式 limit：/api/query/sql 对无 limit 语句套用 Search.Limit（默认 64），
    // 全库同步组属性行数轻易超它，不带会静默截尾丢组（实测用户库 64 行整）
    const rows = await siyuan.sqlAttr(`select block_id,name,value from attributes
        where name in ("custom-sync-block-id","custom-sync-version","custom-sync-hash","custom-sync-status") limit 99999999`);
    const syncIDByBlock = new Map<string, string>();
    for (const row of rows ?? []) {
        if (row.name === "custom-sync-block-id" && row.value) syncIDByBlock.set(row.block_id, row.value);
    }
    const groups = new Map<string, (SyncPeerState & { status?: string })[]>();
    for (const peer of pivotSyncPeers((rows ?? []).filter(r => r.name !== "custom-sync-block-id"))) {
        const syncID = syncIDByBlock.get(peer.id);
        if (!syncID) continue;
        const list = groups.get(syncID) ?? [];
        list.push(peer);
        groups.set(syncID, list);
    }
    debugLog("scanAllGroups", `巡检开始 ${groups.size} 组`);
    const markOps: { id: string; attrs: AttrType }[] = [];
    const healOps: { id: string; attrs: AttrType }[] = [];
    for (const [syncID, peers] of groups.entries()) {
        const managed = peers.length > 0 && peers.every(p => p.hash != null);
        if (managed && new Set(peers.map(p => p.hash)).size === 1) {
            // DOM 拉一次两用：深检重算比对 + 治愈写目标过滤（不可达成员免写）
            const reach = await classifyByDOM(peers);
            // 文件 DOM version=0 是传播舞步过渡态：内容必然领先存量，整组跳过深检交给 checkSync
            const dancing = reach.some(e => utils.getAttribute(e.div, "custom-sync-version") === "0");
            if (linkBoxSyncScanDeep.get() && reach.length > 0 && !dancing) {
                const recomputed = reach.map(e => utils.normalizeForHash(e.div));
                const verdict = deepScanVerdict(recomputed, peers[0].hash);
                if (verdict === "rebaseline") {
                    // 内容已一致仅基线过时：治愈重定基线（含规范化升级迁移），不标冲突。
                    // 手工改齐两边 / 存量哈希过时的历史组从此自愈，不再依赖「以此块为准」按钮
                    scanDeepSuspects.delete(syncID);
                    const maxVer = peers.reduce((pre, cur) => cur.version > pre ? cur.version : pre, 0);
                    const hashNew = utils.normalizeForHash(reach[0].div);
                    for (const p of reach) {
                        const attrs: AttrType = { "custom-sync-hash": hashNew };
                        if (p.peer.version !== maxVer) attrs["custom-sync-version"] = maxVer.toString();
                        if (p.peer.status === "conflict") attrs["custom-sync-status"] = null;
                        healOps.push({ id: p.peer.id, attrs });
                    }
                    continue;
                }
                if (verdict === "pending") {
                    // 单侧待传播编辑（编辑时插件未在运行/云同步单侧先到，§4.2 C=∅ 场景）：
                    // 与 diverged 同样先挂嫌疑 8s 复查，避让「编辑保存→去抖→传播」的在途窗口
                    if (!scanDeepSuspects.has(syncID)) {
                        scanDeepSuspects.add(syncID);
                        setTimeout(() => { scanAllGroups() }, SCAN_DEEP_REVERIFY_MS);
                        continue;
                    }
                    scanDeepSuspects.delete(syncID);
                    const deviantIdx = recomputed.findIndex(h => h !== peers[0].hash);
                    const deviant = reach[deviantIdx];
                    const baseline = reach.find((_, i) => i !== deviantIdx);
                    if (!deviant || !baseline || pendingIsDeletionShaped(deviant.div, baseline.div)) {
                        // 删除形（丢子块）：外部 API 误删疑似（§5 深检本职场景），自动传播会把
                        // 删除扩散到全组，仍标 conflict 交用户裁决
                        debugLog("scanAllGroups", `syncID=${syncID} 深检 pending 删除形标冲突 deviant=${deviant?.peer.id ?? "-"}`);
                        for (const p of reach.filter(p => p.peer.status !== "conflict")) {
                            markOps.push({ id: p.peer.id, attrs: { "custom-sync-status": "conflict" } });
                        }
                        continue;
                    }
                    // 编辑形：结构完整只是内容变，自动以偏离侧为源传播（silent——本无冲突可报），
                    // 兑现「只改一份、其余最终一致」；对已卡 conflict 的组这同时解除了
                    // 短路 0 堵死的传播通道，从此不再复燃
                    debugLog("scanAllGroups", `syncID=${syncID} 深检 pending 编辑形自动传播 源=${deviant.peer.id}`);
                    await syncFromBlock(deviant.peer.id, { silent: true });
                    continue;
                }
                if (verdict === "diverged") {
                    // 首次发现先挂嫌疑不定罪：引擎正常传播窗口（编辑保存→去抖→重写）内内容也暂时领先存量，
                    // 立刻标 conflict 会经短路 0 卡死传播。8s 后复查仍偏离才标——外部直删无引擎活动，必然持续偏离
                    if (!scanDeepSuspects.has(syncID)) {
                        scanDeepSuspects.add(syncID);
                        debugLog("scanAllGroups", `syncID=${syncID} 深检 diverged 挂嫌疑 ${SCAN_DEEP_REVERIFY_MS / 1000}s 后复查`);
                        setTimeout(() => { scanAllGroups() }, SCAN_DEEP_REVERIFY_MS);
                        continue;
                    }
                    debugLog("scanAllGroups", `syncID=${syncID} 深检 diverged 复查仍偏离标冲突 ${reach.length} 成员`);
                    for (const p of reach.filter(p => p.peer.status !== "conflict")) {
                        markOps.push({ id: p.peer.id, attrs: { "custom-sync-status": "conflict" } });
                    }
                    continue;
                }
                // consistent：落入下方常规治愈分支
            }
            scanDeepSuspects.delete(syncID); // 深检通过：解除嫌疑（含传播窗口期的暂态）
            // 治愈分支对不可达宽容：版本只是单调计数器，对齐到残留行的更高版本无副作用（写入只面向可达成员）
            const maxVer = peers.reduce((pre, cur) => cur.version > pre ? cur.version : pre, 0);
            for (const p of reach) {
                const attrs: AttrType = {};
                if (p.peer.version !== maxVer) attrs["custom-sync-version"] = maxVer.toString();
                if (p.peer.status === "conflict") attrs["custom-sync-status"] = null;
                if (Object.keys(attrs).length > 0) healOps.push({ id: p.peer.id, attrs });
            }
            continue;
        }
        // 常规分叉判定只看内容哈希：version 是单调计数器，倾斜（新副本入组 v=1 未对齐）
        // 是过渡态不是内容分叉（checkSync 同判）；全 null（遗留组）不分叉
        const diverged = new Set(peers.map(p => p.hash ?? "")).size > 1;
        if (diverged) {
            // SQL attributes 是索引滞后快照（四轮修复同坑在深检侧还开着）：新副本入组/传播
            // 过渡窗口内 hash/version 行滞后，按 SQL 定罪会把过渡态误标成全组冲突（2026-08-21
            // □7 用户实测 sync_end 深检全组标 conflict）。分叉组必须 getBlockAttrs 内核直读
            // 复核——读空天然滤幽灵（替代 classifyByDOM 的 DOM 可达性过滤，且活块页面未开也读得到）
            const live: LivePeer[] = [];
            for (const p of peers) {
                const attrs = await siyuan.getBlockAttrs(p.id);
                if (!attrs) continue;
                live.push({
                    id: p.id,
                    version: utils.stringToNumber(attrs["custom-sync-version"]),
                    hash: attrs["custom-sync-hash"],
                    status: attrs["custom-sync-status"],
                });
            }
            const plan = scanRecheckPlan(live);
            if (plan.diverged) {
                debugLog("scanAllGroups", `syncID=${syncID} 直读复核分叉标冲突 ${plan.mark.length} 成员 hashes=${live.map(p => p.hash?.slice(0, 6) ?? "-").join(",")}`);
                for (const id of plan.mark) {
                    markOps.push({ id, attrs: { "custom-sync-status": "conflict" } });
                }
            } else {
                debugLog("scanAllGroups", `syncID=${syncID} SQL 分叉直读复核一致，治愈 ${plan.heal.length} 成员（滞后快照消解）`);
                healOps.push(...plan.heal);
            }
            continue;
        }
        for (const p of peers.filter(p => p.status === "conflict")) {
            healOps.push({ id: p.id, attrs: { "custom-sync-status": null } });
        }
    }
    const ops = [...markOps, ...healOps];
    if (ops.length === 0) return;
    debugLog("scanAllGroups", `巡检写回 mark=${markOps.length} heal=${healOps.length}`);
    await Promise.all(ops.map(o => siyuan.setBlockAttrs(o.id, o.attrs)));
    if (markOps.length > 0) {
        await siyuan.pushMsg(`【${tomatoI18n.双向互链}】${tomatoI18n.检测到同步冲突}`);
    }
}

// 深检嫌疑组：syncID 首次重算分叉 → 8s 后复查一轮，仍分叉才标 conflict（防撞上引擎传播窗口误伤）
const SCAN_DEEP_REVERIFY_MS = 8 * 1000;
const scanDeepSuspects = new Set<string>();

type ReachablePeer = { peer: SyncPeerState & { status?: string }; div: HTMLElement };

// DOM 可达性分类：reach = 能拉到 DOM 且带同步标记的成员。不可达的（幽灵行=已删块残留 / 僵尸行=
// blocktree 在但内核运行时树已无此块，外部 API 把 super 子块删空所致）既不能作定罪证据——存量 (v,h)
// 停在失联时点；也无法接收写入。僵尸与幽灵的区别只在残留行的清理时机，对本巡检语义等价，统一排除。
async function classifyByDOM(peers: (SyncPeerState & { status?: string })[]): Promise<ReachablePeer[]> {
    // 页面活副本优先（□6 数据丢失链修复，2026-08-21）：共享子块 ID 模式下内核副本可能停在旧内容
    //（blocktree 翻转后打字 op 落进目标树），本页开着的副本才是编辑真值；不在本页才回落内核
    const doms = await Promise.all(peers.map(async p => {
        const live = utils.liveSyncDiv(p.id);
        if (live) return live;
        return (await utils.getBlockDiv(p.id))?.div;
    }));
    return peers
        .map((p, i) => ({ peer: p, div: doms[i] }))
        .filter(e => e.div && utils.getAttribute(e.div, "custom-sync-block-id")) as ReachablePeer[];
}

function findParentSuper(div: HTMLElement) {
    return findElementByAttr(div,
        {
            "data-type": gconst.BlockNodeEnum.NODE_SUPER_BLOCK,
            "custom-sync-block-id": null
        }
        , false)
}

async function addSyncItemAttr(superDiv: HTMLElement) {
    const ops = [...superDiv.querySelectorAll("div[data-node-id]")]
        .map((e: HTMLElement) => {
            if (!utils.getAttribute(e, "custom-sync-item-id")) {
                const id = utils.getAttribute(e, "data-node-id")
                const itemID = utils.NewNodeID();
                setAttribute(e, "custom-sync-item-id", itemID)
                return { id, attrs: { "custom-sync-item-id": itemID } }
            }
        })
        .filter(i => i != null);
    if (ops.length > 0) await siyuan.batchSetBlockAttrs(ops)
}

// 传播：以 superDiv 为源同步到 rows 副本。返回 h_new（§3.2 时点：addSyncItemAttr 之后、克隆传播之前计算，
// 随内容一起写给各副本），调用方需自行把它写进源块 DB 属性以维护「编辑基线」。
// editorSession：发起编辑视图的 protyle.id——传播事务带上它让内核排除该视图的回声（编辑器自身
// 事务同款机制），正在打字的块不被广播侧 DOM 替换，光标不丢。
export async function syncAllBlocks(superDiv: HTMLElement, count: string, rows: Attributes[], editorSession?: string): Promise<string> {
    await addSyncItemAttr(superDiv);
    const hNew = utils.normalizeForHash(superDiv);
    setAttribute(superDiv, "custom-sync-hash", hNew);
    setAttribute(superDiv, "custom-sync-block-count", count);
    // 子块 ID 重映射（§8.2 实验开关）：开着时顺手留存各目标的现有 DOM（下面那行探测本来就拉），
    // prepareSyncClone 用它把克隆子块 ID 换成目标侧自己的；关着时克隆行为与从前逐字节一致
    const remapOn = linkBoxSyncRemapChildID.get();
    const targetDOMs = new Map<string, string>();
    for (const row of rows) {
        // getBlockDOM 探测替换 checkBlockExist：僵尸成员（运行时树已无此块）混进 transUpdateBlocks
        // 会让整个事务静默失败（HTTP 200 + code:0 但一个 op 都不应用，checkpoint □5 实测），整组传播卡死
        row.exists = await siyuan.checkBlockExist(row.block_id);
        if (row.exists) {
            const dom = (await siyuan.getBlockDOM(row.block_id))?.dom;
            row.exists = !!dom;
            if (remapOn && dom) targetDOMs.set(row.block_id, dom);
        }
    }
    const trans = siyuan.transUpdateBlocks(rows
        .filter(row => row.exists)
        .map(row => {
            // prepareSyncClone（原 cloneForSync + 重映射）：保留子元素结构，子块 ID 按目标侧重映射
            const c = utils.prepareSyncClone(superDiv, row.block_id, targetDOMs.get(row.block_id));
            return { id: row.block_id, domStr: c.outerHTML };
        }));
    await siyuan.transactions(trans, [], editorSession);
    // 广播排除了编辑视图（editorSession），与打字视图同文档打开的其它副本在本页收不到回声，
    // 显示会滞后到重载——这里用事务的同一份 DOM 本地补刷（内核数据已提交，纯显示对齐）。
    // 缩放态另一副本不在本页 DOM 时 querySelector 落空，自然跳过
    if (editorSession) {
        let refreshed = 0;
        const anchor = getSelection()?.anchorNode; // 光标守卫：含选区的块是编辑源不是接收方，刷它会丢光标
        for (const t of trans) {
            const local = document.querySelector(`div[data-node-id="${t.id}"]`);
            if (local && !(anchor && local.contains(anchor))) {
                local.outerHTML = t.data;
                refreshed++;
            }
        }
        if (refreshed > 0) debugLog("syncAllBlocks", `本地补刷 ${refreshed} 个同页副本`);
    }
    debugLog("syncAllBlocks", `传播完成 源=${utils.getAttribute(superDiv, "data-node-id")} 目标=${trans.length} 个副本 session=${editorSession ?? "-"}`);
    return hNew;
}

function findPara(element: HTMLElement) {
    if (element.getAttribute(gconst.DATA_TYPE) == gconst.BlockNodeEnum.NODE_LIST_ITEM) {
        const e = element.querySelector(`[${gconst.DATA_TYPE}="${gconst.BlockNodeEnum.NODE_PARAGRAPH}"]`) as HTMLElement;
        if (e) element = e;
    }
    return element;
}

// 一次 SQL 取同步组内 id 之外的其他存活副本 (block_id, version, hash, status)（设计 §4.4 步骤 2）。
// id 传 "" 时返回全组。存活过滤用 getBlockDOM 探测（比 checkBlockExist 严格一级）：
// - 幽灵行：attributes 残留的已删块行，getBlockDOM 查无此块；
// - 僵尸行：blocktree 还在但内核运行时树已没有该块（外部 API 把 super 子块删空后内核剔除空 super，
//   属性/更新 API 全部「未找到」，checkpoint □5 实测）。僵尸的存量 (v,h) 永远停在失联时点，
//   混进 peers 会假性分叉卡断整组传播（doSync 冲突误判 / checkSync 反复重标 / 事务整批静默失败）。
export async function getGroupState(id: string, syncID: string) {
    // 成员关系走 SQL（谁在组里不常变，滞后无害）；version/hash/status 改内核 getBlockAttrs
    // 直读——SQL attributes 索引滞后会让回声判定拿到与实时 base 不同时点的 peers 快照，
    // 拼出「v_i>=v_base 且 h_i!=h_base」的假冲突（2026-08-21 打字期间闪冲突实测）
    const members = await siyuan.sqlAttr(`select block_id from attributes
        where block_id!="${id}" and name="custom-sync-block-id" and value="${syncID}"`);
    const all = await Promise.all((members ?? []).map(async m => {
        const attrs = await siyuan.getBlockAttrs(m.block_id);
        return {
            id: m.block_id,
            version: utils.stringToNumber(attrs?.["custom-sync-version"]),
            hash: attrs?.["custom-sync-hash"],
            status: attrs?.["custom-sync-status"],
        } as SyncPeerState & { status?: string };
    }));
    const doms = await Promise.all(all.map(p => siyuan.getBlockDOM(p.id)));
    const peers = all.filter((_, i) => !!doms[i]?.dom);
    const maxVer = peers.reduce((pre, cur) => cur.version > pre ? cur.version : pre, 0);
    return {
        peers,
        // 兼容旧调用面（showSyncBlocks / LinkBoxBar）：block_id + value(版本字符串)
        rows: peers.map(p => ({ block_id: p.id, value: p.version.toString() })) as Attributes[],
        maxVer,
        anyConflict: peers.some(p => p.status === "conflict"),
    };
}

export async function getRowAndMaxVer(id: string, syncID: string) {
    const { maxVer, rows } = await getGroupState(id, syncID);
    return { maxVer, rows }
}

function addBar(element: HTMLElement) {
    if (!element.getAttribute || !element.lastElementChild) return;
    if (utils.getAttribute(element, "custom-sync-block-id")) {
        if (element.lastElementChild.classList.contains("protyle-attr")) {
            element.lastElementChild.querySelectorAll(`div[${TOMATO_CONTROL_SYNC}]`)
                .forEach(e => e.parentElement.removeChild(e))
            mount(LinkBoxBar, {
                target: element.lastElementChild, // <-- 给 protyleAttrElement 加个子元素。
                props: {
                    syncBlock: element,
                    plugin: linkBox.plugin,
                    verMap,
                }
            });
        }
    }
};
