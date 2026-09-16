// □8 共享抽取：复习卡导航件——宿主判定 + 「先关后跳」回原文（rp 复习卡起源，anno-note 共用）。
// 按钮链拍板（rpcard □1）：复习界面宿主 → 官方正门 window.siyuan.dialogs.find(data-key=
// dialog-opencard).destroy()（内核 openCardByData 重入关旧界面即此调用）；编辑器宿主 → 仅聚焦原块。
// 关闭失效回落=复习界面保留（跳转照常）。
import { getTomatoPluginInstance } from "./utils";
import { debugLog } from "./logUtils";
import { OpenSyFile2 } from "./navUtils";

/** 复习界面 Dialog 登记项（结构化窄化：destroy/element 均为内核公开面，openCardByData 同款） */
interface ReviewDialog {
    destroy(): void;
    element: HTMLElement;
}

/** 官方正门关闭通道：window.siyuan.dialogs 里 data-key=dialog-opencard 且真包含本按钮的那个 */
function findReviewDialog(btn: HTMLElement): ReviewDialog | null {
    const dialogs = (window.siyuan as { dialogs?: ReviewDialog[] })?.dialogs ?? [];
    return dialogs.find((d) => d.element?.getAttribute("data-key") === "dialog-opencard" && d.element.contains(btn)) ?? null;
}

/** 渲染宿主名：.card__main=复习界面（Dialog/页签两种宿主都有），否则=编辑器 */
export function cardHostName(element: HTMLElement): "review" | "editor" {
    return element.closest(".card__main") ? "review" : "editor";
}

/** 先关后跳：复习界面宿主=官方正门 destroy（openCardByData 重入同款）；编辑器宿主=仅聚焦原块。
 *  label=打点族标签（rp 卡传 "readpoint" 保观测连续，默认 "anno"） */
export async function goOriginCloseFirst(btn: HTMLElement, origin: string, label = "anno"): Promise<void> {
    const plugin = getTomatoPluginInstance();
    if (!plugin || !origin) return;
    let closed = false;
    if (btn.closest(".card__main")) {
        const dialog = findReviewDialog(btn);
        if (dialog) {
            dialog.destroy();
            closed = true;
        }
    }
    debugLog("card_go_origin", `origin=${origin} closed=${closed}`, label);
    await OpenSyFile2(plugin, origin);
}
