import { blockEditorBox, blockEditorMenu } from "./libs/stores";
import { getAttribute, getCursorElement, getTomatoPluginInstance, } from "./libs/utils";
import { winHotkey } from "./libs/winHotkey";
import { tomatoI18n } from "./tomatoI18n";
import BlockEditorSvelte from "./BlockEditor.svelte";
import { mount, unmount } from "svelte";
import { DestroyManager } from "./libs/destroyer";
import { BlockNodeEnum } from "./libs/gconst";

export const BlockEditor打开编辑器 = winHotkey("alt+shift+5", "BlockEditor打开编辑器 2025年9月1日21:31:49", "📝", () => tomatoI18n.块编辑器, false, blockEditorMenu)

class BlockEditor {
    async onload() {
        if (!blockEditorBox.get()) return;
        getTomatoPluginInstance().addCommand({
            langKey: BlockEditor打开编辑器.langKey,
            langText: BlockEditor打开编辑器.langText(),
            hotkey: BlockEditor打开编辑器.m,
            callback: openBlockEditor,
        });
        getTomatoPluginInstance().eventBus.on("open-menu-content", async ({ detail: { menu } }) => {
            if (BlockEditor打开编辑器.menu()) {
                menu.addItem({
                    label: BlockEditor打开编辑器.langText(),
                    iconHTML: BlockEditor打开编辑器.icon,
                    accelerator: BlockEditor打开编辑器.m,
                    click: openBlockEditor
                });
            }
        });
    }
}

async function openBlockEditor() {
    // const e = findElement(getCursorElement(), false, (e) => {
    //     const t = getAttribute(e, "data-type")
    //     return t === BlockNodeEnum.NODE_SUPER_BLOCK
    //         || t === BlockNodeEnum.NODE_LIST
    //         || t === BlockNodeEnum.NODE_BLOCKQUOTE
    //         || t === BlockNodeEnum.NODE_TABLE
    //         || t === BlockNodeEnum.NODE_CODE_BLOCK
    //         || t === BlockNodeEnum.NODE_MATH_BLOCK
    //         || t === BlockNodeEnum.NODE_HTML_BLOCK
    //         || t === BlockNodeEnum.NODE_ATTRIBUTE_VIEW
    //         || t === BlockNodeEnum.NODE_BLOCK_QUERY_EMBED
    // })?.found;
    const e = getCursorElement();
    const blockID = getAttribute(e, "data-node-id")
    openBlockEditorByBlockID(blockID);
}

export function openBlockEditorByBlockID(blockID: string) {
    if (blockID) {
        const dm = new DestroyManager();
        const sv = mount(BlockEditorSvelte, {
            target: document.body,
            props: {
                blockID,
                dm,
            }
        });
        dm.add("close", () => unmount(sv));
    }
}

export function isBigBlock(e: HTMLElement) {
    const t = getAttribute(e, "data-type")
    return t === BlockNodeEnum.NODE_SUPER_BLOCK
        || t === BlockNodeEnum.NODE_LIST
        || t === BlockNodeEnum.NODE_BLOCKQUOTE
        || t === BlockNodeEnum.NODE_TABLE
        || t === BlockNodeEnum.NODE_CODE_BLOCK
        || t === BlockNodeEnum.NODE_MATH_BLOCK
        || t === BlockNodeEnum.NODE_HTML_BLOCK
        || t === BlockNodeEnum.NODE_ATTRIBUTE_VIEW
        || t === BlockNodeEnum.NODE_BLOCK_QUERY_EMBED
}

export const blockEditor = new BlockEditor();
