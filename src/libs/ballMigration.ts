// 悬浮球数据迁移（期1）：旧 floatingballDocList/floatingballKeyboardList + config 顶层
// 像素位置散键（TomatoFloatingBtnDMKey_<addr>_<isMobile>_offsetX/Y）→ 统一 BallItem
// （anchor+offset 进数据本体）。纯函数：旧位置经 posOf(addr) 注入（快捷键球旧地址含
// shortcut2string 的平台态，经 kbAddrOf 注入）；genID 注入便于测。
// 老地址契约：doc#<docName>#<openDocType>（FloatingBallDocBtn）、keyboard#<shortcut2string>。

import { cascadeOffset, nearestAnchor } from "./ballGeometry";

export type BallPositionInput = { x?: string | number; y?: string | number };

function parsePx(v: string | number | undefined): number | undefined {
    if (v == null) return undefined;
    const n = typeof v === "number" ? v : parseInt(v, 10);
    return Number.isFinite(n) ? n : undefined;
}

export function migrateLegacyBalls(
    docList: FloatingDocItem[],
    kbList: FloatingKeyboardItem[],
    posOf: (addr: string) => BallPositionInput | undefined,
    vw: number,
    vh: number,
    size: number,
    genID: () => string,
    kbAddrOf: (item: FloatingKeyboardItem) => string = () => "",
): BallItem[] {
    const out: BallItem[] = [];
    // 无旧位置的球按序叠瓦（右下角起每颗往左上错一档）
    let cascadeIndex = 0;

    const positionOf = (addr: string): { anchor: number; offsetX: number; offsetY: number } | undefined => {
        const p = posOf(addr);
        const x = parsePx(p?.x), y = parsePx(p?.y);
        if (x == null || y == null) return undefined;
        return nearestAnchor(x, y, vw, vh, size);
    };

    for (const item of docList ?? []) {
        const anchorPos =
            positionOf(`doc#${item.docName}#${item.openDocType}`) ??
            (() => {
                const c = cascadeOffset(cascadeIndex++);
                return { anchor: 8, offsetX: c.offsetX, offsetY: c.offsetY };
            })();
        out.push({
            id: genID(),
            type: "doc",
            action: {
                docName: item.docName ?? "",
                docID: item.docID ?? "",
                docIcon: item.docIcon ?? "",
                openDocType: item.openDocType ?? 3,
                openOnCreate: item.openOnCreate ?? false,
            },
            icon: item.docIcon || item.docName,
            anchor: anchorPos.anchor,
            offsetX: anchorPos.offsetX,
            offsetY: anchorPos.offsetY,
            enable: item.enable ?? true,
            enableMobile: item.enableMobile ?? true,
        });
    }
    for (const item of kbList ?? []) {
        const anchorPos =
            positionOf(kbAddrOf(item)) ??
            (() => {
                const c = cascadeOffset(cascadeIndex++);
                return { anchor: 8, offsetX: c.offsetX, offsetY: c.offsetY };
            })();
        out.push({
            id: genID(),
            type: "shortcut",
            action: {
                key: item.key ?? "",
                altKey: item.altKey ?? false,
                shiftKey: item.shiftKey ?? false,
                ctrlKey: item.ctrlKey ?? false,
            },
            icon: item.keyIcon,
            anchor: anchorPos.anchor,
            offsetX: anchorPos.offsetX,
            offsetY: anchorPos.offsetY,
            enable: item.enable ?? true,
            enableMobile: item.enableMobile ?? true,
        });
    }
    return out;
}
