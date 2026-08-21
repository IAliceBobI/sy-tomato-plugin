// 同步块内容哈希（同步块引擎 V1.5 设计 §3.2）。
// 从原 utils.ts 拆出（2026-08 重构），utils.ts 现为 re-export 桶；tests/unit/syncHash.test.ts 直接引用。
import * as gconst from "./gconst";

/**
 * cyrb53 纯 JS 53 位哈希（设计 §3.2）。
 * 不选 SHA-256：crypto.subtle 依赖 secure context，且每次同步事务都要算，cyrb53 快三个数量级；
 * 碰撞后果只是漏报一次冲突（退化到现状行为），不丢数据。
 */
export function cyrb53(str: string, seed = 0): number {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

// 哈希前要删除的易变属性：内核 updated/data-node-index + 同步管理属性（custom-sync-item-id 保留，见下）+ 视图态属性。
// 易变属性若未来再发现，只改 normalizeForHash 这一处——规范化集中是硬要求（设计 §3.2）。
// data-node-index 是块在兄弟中的位置序号（视图态），各副本因所在文档/位置不同必然不同。
const SYNC_HASH_VOLATILE_ATTRS = [
    gconst.UPDATED,
    gconst.DATA_NODE_INDEX,
    "custom-sync-version",
    "custom-sync-block-count",
    "custom-sync-hash",
    "custom-sync-status",
    "custom-sync-origin-id",
    "fold",
    gconst.CONTENT_EDITABLE,
];

// 规范化收尾（单个元素）：属性按名排序 + 空 class 清理。
// 属性顺序是写入历史（浏览器按插入序序列化、内核按自己的序），不属于内容——2026-08-21 实证：
// 同一超级块两方言仅存活属性顺序不同（data-sb-layout 与 custom-sync-block-id 互换），
// 直接 outerHTML 哈希让传播（编辑器源）与深检重算（内核源）永远对不上，冲突裁决后一编辑就复燃。
function canonicalizeAttrs(e: Element) {
    const names = e.getAttributeNames();
    const sorted = [...names].sort();
    if (names.join("\u0000") !== sorted.join("\u0000")) {
        const pairs = sorted.map(n => [n, e.getAttribute(n)] as const);
        for (const n of names) e.removeAttribute(n);
        for (const [n, v] of pairs) e.setAttribute(n, v as string);
    }
    if (e.getAttribute("class") === "") e.removeAttribute("class");
}

/**
 * 同步块内容哈希：克隆后按 §3.2 规则规范化，取 outerHTML 做 cyrb53 → base36 字符串。
 * custom-sync-item-id 保留——它是结构性元数据（传播后全组一致），也使哈希能感知子块增删。
 * 计算时点：syncAllBlocks 内 addSyncItemAttr 之后、克隆传播之前（设计 §3.2 时点）。
 * 输入不挑方言（编辑器 DOM / 内核 getBlockDOM 解析产物）：wbr/软换行 br/属性序都被抹平。
 */
export function normalizeForHash(superDiv: HTMLElement): string {
    if (!superDiv) return "";
    const clone = superDiv.cloneNode(true) as HTMLElement;

    clone.removeAttribute(gconst.DATA_NODE_ID);
    clone.querySelectorAll(`[${gconst.DATA_NODE_ID}]`)
        .forEach(e => e.removeAttribute(gconst.DATA_NODE_ID));

    for (const attr of SYNC_HASH_VOLATILE_ATTRS) {
        clone.removeAttribute(attr);
        clone.querySelectorAll(`[${attr}]`).forEach(e => e.removeAttribute(attr));
    }

    clone.classList.remove(gconst.PROTYLE_WYSIWYG_SELECT);
    clone.querySelectorAll(`.${gconst.PROTYLE_WYSIWYG_SELECT}`)
        .forEach(e => e.classList.remove(gconst.PROTYLE_WYSIWYG_SELECT));

    // 属性图标的渲染区，各副本渲染内容可能不同
    clone.querySelectorAll(".protyle-attr").forEach(e => e.parentElement?.removeChild(e));

    // 光标痕迹：wbr 是 protyle 输入期在光标处插入的视图元素，内核落盘会剥掉（2026-08-21 事务实测）
    clone.querySelectorAll("wbr").forEach(e => e.parentElement?.removeChild(e));

    // 软换行方言：编辑器 <br> 内核落盘转成换行文本（同实测），统一折算成 \n
    clone.querySelectorAll("br")
        .forEach(e => e.parentElement?.replaceChild(document.createTextNode("\n"), e));

    canonicalizeAttrs(clone);
    clone.querySelectorAll("*").forEach(canonicalizeAttrs);

    return cyrb53(clone.outerHTML).toString(36);
}
