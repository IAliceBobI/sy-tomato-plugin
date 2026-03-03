import { Dialog, IEventBusMap, IProtyle, Plugin } from "siyuan";
import { EventType, events } from "./libs/Events";
import * as gconst from "./libs/gconst";
import { bilinkWithInsertingRefs, clean_broken_href, extractLinksFromElement, getAttribute, getDoOperations, joinByComma, linkTwoElementsWithRef, setAttribute, siyuan, } from "./libs/utils";
import * as utils from "./libs/utils";
import { AttrBuilder, findElementByAttr, findListTypeByElement } from "./libs/listUtils";
import { linkBoxAttrIconOnHide, linkBoxBilinkMenu, linkBoxCheckbox, linkBoxLnkTitle, linkBoxSyncBlock, linkBoxSyncBlockAuto, linkBoxSyncHref, linkBoxSyncRef, linkBoxUseLnkOrRef } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import { TOMATO_CONTROL_SYNC } from "./libs/gconst";
import { OpenSyFile2 } from "./libs/docUtils";
import { domEmbedding, DomListBuilder, DomSuperBlockBuilder } from "./libs/sydom";
import { DestroyManager } from "./libs/destroyer";
import LinkBoxDialog from "./LinkBox.svelte";
import LinkBoxBar from "./LinkBoxBar.svelte";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { lastVerifyResult, verifyKeyTomato } from "./libs/user";
import { newID } from "stonev5-utils/lib/id";
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
            if (linkBoxAttrIconOnHide.get() && await verifyKeyTomato()) {
                // ignore
            } else {
                this.observer = new MutationObserver((mutationsList) => {
                    for (const mutation of mutationsList) {
                        if (mutation.type === "attributes" && mutation.attributeName === "custom-sync-version") {
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
            const rows = await getRowAndMaxVer("", syncID)
                .then(async ({ rows }) => {
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
                        return blocks
                    }
                });
            if (rows?.length > 0) {
                let title = tomatoI18n.已在x个地方同步(rows.length)
                if (rows.some(r => r.data != rows[0].data)) {
                    title = tomatoI18n.同步失败
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

function findParentSuper(div: HTMLElement) {
    return findElementByAttr(div,
        {
            "data-type": gconst.BlockNodeEnum.NODE_SUPER_BLOCK,
            "custom-sync-block-id": null
        }
        , false)
}

async function doSync(ops: gconst.DoOperation) {
    if (!ops?.id) return;
    const { superDiv, id } = (() => {
        const div = document.querySelector(`div[data-node-id="${ops.id}"]`) as HTMLElement;
        let { found, id } = findParentSuper(div);
        let superDiv = found?.cloneNode(true) as HTMLElement;
        if (!superDiv) {
            // 页面上没有这个超级块，则从事务中读取
            id = ops.id;
            superDiv = utils.dom2div(ops.data);
            // superDiv = (await utils.getBlockDiv(id)).div // 不能拿最新的，必须根据事务顺序来，防止版本变大过快！
        }
        return { superDiv, id };
    })();
    const syncID = utils.getAttribute(superDiv, "custom-sync-block-id");
    if (syncID) {
        navigator.locks.request("link sync lock " + syncID, { mode: "exclusive" }, async (lock) => {
            if (!lock) return;
            let syncVer = utils.stringToNumber(utils.getAttribute(superDiv, "custom-sync-version"));
            // 找到所有同步块
            const { maxVer, rows } = await getRowAndMaxVer(id, syncID);
            const count = (rows.length + 1).toString();
            if (maxVer > syncVer) {
                const syncVerInDB = await siyuan.getBlockAttrs(id).then(a => utils.stringToNumber(a["custom-sync-version"]))
                if (maxVer > syncVerInDB) {
                    // 有比自己版本大的，更新自己的版本即可。
                    // console.info(`更新自己 ${maxVer}, ${id}`);
                    await siyuan.setBlockAttrs(id, { "custom-sync-version": maxVer.toString() });
                }
            } else {
                // 没有比自己版本大的
                const cacheVer = verMap.get(syncID) ?? -1; // 防止重复更新
                syncVer++;
                if (syncVer > cacheVer) {
                    verMap.set(syncID, syncVer)
                    await siyuan.setBlockAttrs(id, { "custom-sync-block-count": count, "custom-sync-version": syncVer.toString() });
                    // console.info(`更新别人 ${syncVer}, ${id}`);
                    setAttribute(superDiv, "custom-sync-version", "0");
                    await syncAllBlocks(superDiv, count, rows);
                }
            }
            setTimeout(() => {
                checkSync(syncID);
            }, 10 * 1000);
        });
    }
}

async function checkSync(syncID: string) {
    const { maxVer, rows } = await getRowAndMaxVer("", syncID)
    if (!(rows.length > 0)) return;
    const newSecs = utils.stringToNumber(utils.timeUtil.getYYYYMMDDHHmmss())
    const blocks = await siyuan.getRows(rows.map(r => r.block_id), "id,updated,content")
    if (!(blocks.length > 0)) return;
    const maxUpdated = utils.stringToNumber(blocks.reduce((max, b) => {
        if (b.updated > max) return b.updated;
        return max;
    }, ""));
    if ((newSecs - maxUpdated) >= 9) { // secs
        let same = true
        for (const b of blocks) {
            if (b.content != blocks[0].content) {
                same = false;
                break;
            }
        }
        const maxVerStr = maxVer.toString();
        if (rows.some(r => r.value != maxVerStr) || !same) {
            await siyuan.batchSetBlockAttrs(blocks.map(b => {
                return { id: b.id, attrs: { "custom-sync-block-count": "-1" } }
            }))
        }
    }
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

export async function syncAllBlocks(superDiv: HTMLElement, count: string, rows: Attributes[]) {
    await addSyncItemAttr(superDiv);
    setAttribute(superDiv, "custom-sync-block-count", count);
    for (const row of rows) {
        row.exists = await siyuan.checkBlockExist(row.block_id);
    }
    const trans = siyuan.transUpdateBlocks(rows
        .filter(row => row.exists)
        .map(row => {
            // 使用 cloneForSync 保留子元素的原始 ID，避免破坏嵌套块结构
            const c = utils.cloneForSync(superDiv, row.block_id);
            return { id: row.block_id, domStr: c.outerHTML };
        }));
    await siyuan.transactions(trans);
}

function findPara(element: HTMLElement) {
    if (element.getAttribute(gconst.DATA_TYPE) == gconst.BlockNodeEnum.NODE_LIST_ITEM) {
        const e = element.querySelector(`[${gconst.DATA_TYPE}="${gconst.BlockNodeEnum.NODE_PARAGRAPH}"]`) as HTMLElement;
        if (e) element = e;
    }
    return element;
}

export async function getRowAndMaxVer(id: string, syncID: string) {
    const rows = await siyuan.sqlAttr(`select block_id,value from attributes 
        where name="custom-sync-version" 
        and block_id in (
            select block_id from attributes where block_id!="${id}" and name="custom-sync-block-id" and value="${syncID}"
    )`);
    const maxVer = rows.reduce((pre, cur) => {
        const c = utils.stringToNumber(cur.value);
        return c > pre ? c : pre;
    }, 0);
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
