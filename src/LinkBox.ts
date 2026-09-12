import { Dialog, IEventBusMap, IProtyle, Plugin } from "siyuan";
import { EventType, events } from "./libs/Events";
import * as gconst from "./libs/gconst";
import { bilinkWithInsertingRefs, clean_broken_href, extractLinksFromElement, getAttribute, getDoOperations, joinByComma, linkTwoElementsWithRef, setAttribute, siyuan, } from "./libs/utils";
import * as utils from "./libs/utils";
import { AttrBuilder, findListTypeByElement } from "./libs/listUtils";
import { linkBoxAttrIconOnHide, linkBoxBilinkMenu, linkBoxLnkTitle, linkBoxSyncBlockAuto, linkBoxSyncHref, linkBoxSyncRef, linkBoxUseLnkOrRef, pairBarEnabled } from "./libs/stores";
import { tomatoI18n } from "./tomatoI18n";
import { TOMATO_CONTROL_SYNC } from "./libs/gconst";
import { OpenSyFile2 } from "./libs/docUtils";
import { domEmbedding, DomListBuilder, DomSuperBlockBuilder } from "./libs/sydom";
import { DestroyManager } from "./libs/destroyer";
import LinkBoxDialog from "./LinkBox.svelte";
import LinkBoxBar from "./LinkBoxBar.svelte";
import { BaseTomatoPlugin } from "./libs/BaseTomatoPlugin";
import { regPairCmd } from "./libs/pairCmdRegistry";
import { lastVerifyResult, verifyKeyTomato } from "./libs/user";
import { debugLog } from "./libs/logUtils";
import { doSync, findParentSuper, getGroupState, scanAllGroups, verMap } from "./SyncBlock";
import { newID } from "stonev5-utils";
import { winHotkey } from "./libs/winHotkey";
import { cmdOn, recordCmdKey } from "./libs/cmdGate";
import { addIfVisible } from "./libs/menuManager";
import { mount, unmount } from "svelte";

type TomatoMenu = IEventBusMap["click-blockicon"] & IEventBusMap["open-menu-content"];

export const LinkBox查看所有同步位置 = winHotkey("F1", "list refs show all place", "iconLink", () => tomatoI18n.查看所有同步位置)
export const LinkBox同步块选择 = winHotkey("⌘F1", "list refs select", "", () => tomatoI18n.同步块选择)
export const LinkBox同步块创建 = winHotkey("⌘F2", "list refs create", "", () => tomatoI18n.同步块创建)
export const LinkBoxbilink = winHotkey("⌥/", "bilink", "iconBoth", () => tomatoI18n.双向互链)
export const LinkBox链接到块底部 = winHotkey("⌥F3", "lnk2bottom", "", () => tomatoI18n.链接到块底部)
export const LinkBox双向互链选择块 = winHotkey("⌥F1", "bilinkSelectBlock", "", () => tomatoI18n.双向互链选择块)
export const LinkBox双向互链创建往返链 = winHotkey("⌥F2", "bilinkSelectBlock roundtrip", "", () => tomatoI18n.双向互链创建往返链)
export const LinkBox修复双向链接 = winHotkey("⌥⇧F1", "fixLnk", "", () => tomatoI18n.修复双向链接)
export const LinkBox删除双向链接 = winHotkey("⌥⇧F2", "remove link", "", () => tomatoI18n.删除双向链接)
export const LinkBox嵌入互链选择 = winHotkey("⇧⌥1", "bilinkSelectBlock embed", "", () => tomatoI18n.嵌入互链选择)
export const LinkBox嵌入互链创建 = winHotkey("⇧⌥2", "bilinkCreateLnk", "", () => tomatoI18n.嵌入互链创建)
export const LinkBox关联两个块选择 = winHotkey("⌘⌥[", "bilinkSelectBlockRefOnly", "", () => tomatoI18n.关联两个块选择)
export const LinkBox关联两个块创建 = winHotkey("⌘⌥]", "bilinkCreateLnkRefOnly", "", () => tomatoI18n.关联两个块创建)
export const LinkBox互相插入引用于下方选择 = winHotkey("⌘⇧F1", "bidirection refs select", "", () => tomatoI18n.互相插入引用于下方选择)
export const LinkBox互相插入引用于下方创建 = winHotkey("⌘⇧F2", "bidirection refs create", "", () => tomatoI18n.互相插入引用于下方创建)


class LinkBox {
    plugin: BaseTomatoPlugin;
    private selectedDivs: HTMLElement[] = [];
    private observer: MutationObserver;

    onunload() {
        this.observer?.disconnect();
        this.observer = null;
    }

    async onload(plugin: BaseTomatoPlugin) {
        this.plugin = plugin;
        await verifyKeyTomato()
        // R5 □1 总开关化：块配对工具一个总开关管全部命令注册（互链族+同步块族）。
        // 开关控制注册，中途改开关需 reload 生效；「同步块强开互链」联动随三 store 退役删除
        if (pairBarEnabled.get()) {
            this.regBilinkCmds();
            await this.regSyncBlockCmds();
        }
    }

    /** 单功能命令共用的第一步「锁源」：选中块记入 selectedDivs（老命令兼容层单例，□2 浮条不复用） */
    private async markBlock(protyle: IProtyle) {
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

    /** addCommand+速查登记二合一（R5 □3）：⋯ 菜单速查子菜单点击查表直调
     *  （regBilinkCmds/regSyncBlockCmds 共用；类箭头方法保 this） */
    // featgate □5：二合一随 commandToggles 逐条门控（关=命令+速查项齐不出现）
    private addPairCmd = (cmd: any) => {
        recordCmdKey(cmd.langKey);
        if (!cmdOn(cmd.langKey)) return;
        this.plugin.addCommand(cmd);
        regPairCmd(cmd.langKey, cmd.editorCallback ?? cmd.callback);
    };

    /** 互链族：12 个单功能命令 + 互链右键菜单挂点（注册链由 pairBarEnabled 总开关管） */
    private regBilinkCmds() {
        this.addPairCmd({
            langKey: LinkBoxbilink.langKey,
            langText: LinkBoxbilink.langText(),
            hotkey: LinkBoxbilink.m,
            editorCallback: async (protyle: IProtyle) => {

                const { selected, docName, docID } = await events.selectedDivs(protyle);
                for (const div of selected)
                    await this.addLink(div, docID, docName);
            },
        });

        this.addPairCmd({
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

        this.addPairCmd({
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
        this.addPairCmd({
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

        this.addPairCmd({
            langKey: LinkBox双向互链选择块.langKey,
            langText: LinkBox双向互链选择块.langText(),
            hotkey: LinkBox双向互链选择块.m,
            editorCallback: (protyle) => this.markBlock(protyle),
        });
        this.addPairCmd({
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

        this.addPairCmd({
            langKey: LinkBox嵌入互链选择.langKey,
            langText: LinkBox嵌入互链选择.langText(),
            hotkey: LinkBox嵌入互链选择.m,
            editorCallback: (protyle: IProtyle) => {
                if (lastVerifyResult()) this.markBlock(protyle)
            }
        });
        this.addPairCmd({
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

        this.addPairCmd({
            langKey: LinkBox关联两个块选择.langKey,
            langText: LinkBox关联两个块选择.langText(),
            hotkey: LinkBox关联两个块选择.m,
            editorCallback: (protyle) => this.markBlock(protyle),
        });
        this.addPairCmd({
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

        this.addPairCmd({
            langKey: LinkBox互相插入引用于下方选择.langKey,
            langText: LinkBox互相插入引用于下方选择.langText(),
            hotkey: LinkBox互相插入引用于下方选择.m,
            editorCallback: (protyle) => this.markBlock(protyle),
        });
        this.addPairCmd({
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
        });
    }

    /** 同步块族：3 个命令 + 同步块右键菜单挂点 + ws 同步监听 + 巡检 + 徽标 observer */
    private async regSyncBlockCmds() {
        this.addPairCmd({
            langText: LinkBox查看所有同步位置.langText(),
            langKey: LinkBox查看所有同步位置.langKey,
            hotkey: LinkBox查看所有同步位置.m,
            editorCallback: (protyle) => showSyncBlocks(protyle, this.plugin),
        });
        this.addPairCmd({
            langKey: LinkBox同步块选择.langKey,
            langText: LinkBox同步块选择.langText(),
            hotkey: LinkBox同步块选择.m,
            editorCallback: (protyle) => this.markBlock(protyle),
        });
        this.addPairCmd({
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
        this.plugin.eventBus.on(EventType.open_menu_content, ({ detail }) => {
            this.showSyncBlocksMenu(detail as any);
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

    blockIconEvent(detail: any) {
        // click_blockicon 挂点在 index.ts 常驻监听（不走注册链），此处须自守总开关
        if (!pairBarEnabled.get()) return;
        this.addLnkByLnk(detail);
        this.showSyncBlocksMenu(detail);
    }

    async link2bottom(protyle: IProtyle, div: HTMLElement) {
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

    async delLnk(_protyle: IProtyle, div: HTMLElement) {
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

    async fixLnk(protyle: IProtyle, div: HTMLElement) {
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

    /** 同步块配对：divs1 打包超级块插到 div2 后（□2 起浮条复用，public） */
    async addSyncLink(protyle: IProtyle, divs1: HTMLElement[], div2: HTMLElement) {
        const ids1 = divs1?.map(i => i.getAttribute(gconst.DATA_NODE_ID))
        const id2 = div2?.getAttribute(gconst.DATA_NODE_ID);
        if (!ids1 || ids1.length == 0 || !id2 || !protyle) return;
        if (!await siyuan.checkBlockExist(id2)) return;
        const ops: IOperation[] = [];
        if (divs1.length === 1) {
            let { found } = findParentSuper(divs1[0])
            // □3（□2 评审转出②）：detached 源（源文档未开、内核 getBlockDiv 兜底）在页面
            // DOM 里没有祖先链，findParentSuper 恒落空——若源块本在既有同步组，落进下面
            // 新建组分支会 transDeleteBlocks 删源块、把源从既有组拆出（数据破坏非降级）。
            // 兜底：内核查 parent_id 拿父容器 DOM 再找 super（resolveSuperDiv 先例）。
            if (!found && !divs1[0].isConnected) {
                const rows = await siyuan.sql(`SELECT parent_id FROM blocks WHERE id = "${ids1[0]}" LIMIT 1`);
                const parentID = rows?.[0]?.parent_id;
                if (parentID) {
                    const { div: pdiv } = await utils.getBlockDiv(parentID);
                    if (pdiv) ({ found } = findParentSuper(pdiv));
                }
            }
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

    /** 嵌入互链（VIP）：源以嵌入块插到目标后（□2 起浮条复用，public；VIP 门禁由调用方守）。
     *  detached 源边界（□2 评审转出②，评估后接受不修）：findListTypeByElement 在 detached
     *  div 上失效 → 列表项降级当普通块嵌入（domEmbedding 走 id 不依赖 DOM），后果轻微。 */
    async addEmbedLnkTwoDivs(protyle: IProtyle, divs1: HTMLElement[], div2: HTMLElement) {
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

    /** 双向互链：两块互挂锚点链接（□2 起浮条复用，public） */
    async addLnkTwoDivs(protyle: IProtyle, div1: HTMLElement, div2: HTMLElement) {
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
            addIfVisible(detail.menu, LinkBox查看所有同步位置.langKey, {
                icon: LinkBox查看所有同步位置.icon,
                accelerator: LinkBox查看所有同步位置.m,
                label: LinkBox查看所有同步位置.langText(),
                click: () => showSyncBlocks(detail.protyle, this.plugin, found)
            });
        }
    }

    private addLnkByLnk(detail: TomatoMenu) {
        if (linkBoxBilinkMenu.get()) {
            addIfVisible(detail.menu, LinkBoxbilink.langKey, {
                icon: LinkBoxbilink.icon,
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
                dm.add("2", () => { unmount(d) })
            }
        }
    }
}


function findPara(element: HTMLElement) {
    if (element.getAttribute(gconst.DATA_TYPE) == gconst.BlockNodeEnum.NODE_LIST_ITEM) {
        const e = element.querySelector(`[${gconst.DATA_TYPE}="${gconst.BlockNodeEnum.NODE_PARAGRAPH}"]`) as HTMLElement;
        if (e) element = e;
    }
    return element;
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
                    showAll: () => showSyncBlocks(null, linkBox.plugin, element),
                }
            });
        }
    }
};
