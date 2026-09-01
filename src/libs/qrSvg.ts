import qrcode from "qrcode-generator";

/**
 * 群组入口权威链接 → 展示名映射（帮助弹窗 [二维码](url) 占位符的标签来源）。
 * 定稿链接，勿随意改动；与 tools/gen-group-qr.mjs 的 GROUP_LINKS 保持一致
 * （该脚本每次运行会软检查此处是否同步）。
 */
export const GROUP_QR_LABELS: Record<string, string> = {
    "https://pd.qq.com/s/r3jz0g16": "QQ 频道",
    "https://applink.feishu.cn/client/chat/chatter/add_by_link?link_token=f08gff0c-d6b0-4a0d-8323-c8a0553e4fff&qr_code=true": "飞书群",
};

/** 映射未命中时回退用 hostname 当标签 */
export function qrLabel(url: string): string {
    const known = GROUP_QR_LABELS[url];
    if (known) return known;
    try {
        return new URL(url).hostname;
    } catch {
        return url;
    }
}

/**
 * URL → 内联 SVG（rect 网格，无 canvas / 无打包图片，运行时现场算）。
 * 白底黑码是扫码硬约束（暗色主题下码区也保持 #fff/#000 不反色），四周自带
 * quiet 模块静区；外围容器样式由调用方用 b3 变量处理。生成失败（如超长）返回
 * ""，调用方应回退为普通链接。
 */
export function qrSvg(url: string, quiet = 4): string {
    try {
        const qr = qrcode(0, "M");
        qr.addData(url);
        qr.make();
        const n = qr.getModuleCount();
        const size = n + quiet * 2;
        const cells: string[] = [];
        for (let row = 0; row < n; row++) {
            for (let col = 0; col < n; col++) {
                if (qr.isDark(row, col)) {
                    cells.push(`<rect x="${col + quiet}" y="${row + quiet}" width="1" height="1"/>`);
                }
            }
        }
        return (
            `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" ` +
            `shape-rendering="crispEdges" aria-hidden="true">` +
            `<rect width="${size}" height="${size}" fill="#fff"/>` +
            `<g fill="#000">${cells.join("")}</g></svg>`
        );
    } catch {
        return "";
    }
}
