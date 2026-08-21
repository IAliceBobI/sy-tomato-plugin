// 设置页帮助链接的统一处理器：默认插件内弹窗展示文字版帮助，ctrl/⌘+点击仍走浏览器打开飞书。
// 从 IndexConf.svelte 拆出（2026-08 重构），供 IndexConf 与各设置分区子组件共用。
import { openHelpDialog } from "./libs/helpDialog";
import helpDocs from "./help.json";

export function helpOpen(e: MouseEvent) {
    if (e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    openHelpDialog((e.currentTarget as HTMLAnchorElement).href, helpDocs);
}
