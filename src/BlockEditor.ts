import { blockEditorBox, blockEditorMenu } from "./libs/stores";
import { getAttribute, getTomatoPluginInstance, } from "./libs/utils";
import { winHotkey } from "./libs/winHotkey";
import { tomatoI18n } from "./tomatoI18n";
import BlockEditorSvelte from "./BlockEditor.svelte";
import { mount, unmount } from "svelte";
import { DestroyManager } from "./libs/destroyer";
import { BlockNodeEnum } from "./libs/gconst";

export const BlockEditor打开编辑器 = winHotkey("alt+shift+5", "BlockEditor打开编辑器", "📝", () => tomatoI18n.块编辑器, false, blockEditorMenu)

class BlockEditor {
    private dm: DestroyManager;
    async onload() {
        if (!blockEditorBox.get()) return;
        getTomatoPluginInstance().addCommand({
            langKey: BlockEditor打开编辑器.langKey,
            langText: BlockEditor打开编辑器.langText(),
            hotkey: BlockEditor打开编辑器.m,
            callback: () => this.openBlockEditorByBlockID(),
        });
        getTomatoPluginInstance().eventBus.on("open-menu-content", async ({ detail: { menu } }) => {
            if (BlockEditor打开编辑器.menu()) {
                menu.addItem({
                    label: BlockEditor打开编辑器.langText(),
                    iconHTML: BlockEditor打开编辑器.icon,
                    accelerator: BlockEditor打开编辑器.m,
                    click: () => this.openBlockEditorByBlockID(),
                });
            }
        });
    }
    private openBlockEditorByBlockID() {
        if (this.dm) {
            this.dm.destroyBy();
            this.dm = null;
        } else {
            this.dm = new DestroyManager();
            const sv = mount(BlockEditorSvelte, {
                target: document.body,
                props: {
                    dm: this.dm,
                }
            });
            this.dm.add("close1", () => unmount(sv));
            this.dm.add("close2", () => this.dm = null);
        }
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
