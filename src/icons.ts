// 2026-09-03 起 *Tomato 加色实心族退役回归内置线性（handoff anno-collect □6）：
// settings/graph/camera/files/cloud 三态/pair 全部改引用内置图标（currentColor 自动适配明暗），
// 唯一保留 iconTomatoVIP 金色实心徽标——内置 #iconVIP 1px 描边在暗色下物理不可见（TomatoVIP.svelte 注释在案）。
// iconWire（2026-09-03）：思维导线·划词连线专属——两点一线线性（currentColor，内置族同型但无此图形），
// 替代 iconLink（与官方划词工具条「链接」钮同形易混）；点径 9/线厚 3.11 对齐 iconLink 横杠 3.155（vision 评审定稿）。
// 留观：与 iconRef（引用）同属两节点连线语义族，当前靠实心点+单斜线区分（终审 PASS）——
// 未来若与引用钮相邻排布（如块菜单）须复验并排区分度；实心填充勿改空心（16px 下孔径<2px 必糊）。
// *Tomato 四别名（2026-09-03 dock 图标空白事故回归）：内核把 dock item.icon 持久化进 data/storage/local.json
// （layout/dock/index.ts genButton 按持久化名渲染 use href），插件 addDock 的新 config.icon 不覆盖旧名——
// 彩色族退役删除 symbol 后老布局引用落空=dock 图标全部空白（主实例实锤）。别名仅服务存量布局数据；
// 新代码勿引用这些名字（新入口一律用内置名或 iconWire）。
// 2026-09-03 二次升级（批注双入口 icon 统一·方案 A 拍板）：别名 path 从「原样实心」换成对应内置线性
// icon 的 path 原文（symbol id/viewBox/path 均与内置版一致，仅 id 带 Tomato 后缀）——存量 dock 布局
// reload 即显示线性，与新声明视觉统一；空白防线（symbol 名继续存在）不变。
// iconGraphBox（2026-09-04 graphbox 期5）：块关系图专属——三小方块节点树 LR（根左中+双子右上/右下），
// 方块=块语义，与官方 iconGraph 三实心圆方圆对比（此前七处借用 iconGraph 与官方关系图撞脸）。
// Lucide 24×24 stroke 1.7 与 iconQuoteTomato/iconCameraTomato 同族；连线端点全落方块边中点（vision 评审定稿）。
// iconGraphTomato 别名升级（同期）：实测主实例+dev local.json 各有 1 处存量 dock 引用（非零引用孤儿），
// 删除会重演 09-03 dock 空白事故——保留 symbol 名换 iconGraphBox 同款 path（视觉统一，reload 即生效）。
// MindWire/LinkBox 借用 iconGraph 同期退役：MindWire→iconWire（自有），LinkBox→iconLink（同步位置语义）。
export const ICONS = `
<symbol id="iconTomatoVIP" viewBox="0 0 32 32"  fill="goldenrod">
    <path d="M2.288 12.643l23.487 12.853c0.286 0.153 0.477 0.45 0.477 0.791 0 0.082-0.011 0.161-0.032 0.237l0.001-0.006c-0.119 0.395-0.479 0.678-0.905 0.678-0.004 0-0.009 0-0.013 0h-19.439c-0.958 0-1.766-0.684-1.885-1.595l-1.691-12.956z"></path>
    <path d="M29.676 12.643l-1.691 12.957c-0.119 0.911-0.927 1.594-1.884 1.594h-19.442c-0.004 0-0.009 0-0.013 0-0.425 0-0.785-0.281-0.903-0.668l-0.002-0.007c-0.019-0.070-0.031-0.15-0.031-0.232 0-0.341 0.191-0.638 0.472-0.788l0.005-0.002 23.487-12.853z"></path>
    <path d="M15.413 8.369l10.394 15.921c0.378 0.579 0.407 1.317 0.076 1.924-0.328 0.591-0.948 0.985-1.66 0.985 0 0-0.001 0-0.001 0h-17.617c-0.694 0-1.331-0.378-1.661-0.985-0.144-0.26-0.229-0.569-0.229-0.899 0-0.382 0.114-0.736 0.31-1.033l-0.004 0.007 10.394-15.921z"></path>
    <path d="M15.396 8.403l11.659 15.921c0.401 0.579 0.432 1.317 0.081 1.924-0.361 0.594-1.005 0.985-1.741 0.985-0.008 0-0.017 0-0.025 0h-9.344l-0.63-18.83z"></path>
    <path d="M13.868 6.478c0 0.946 0.767 1.712 1.712 1.712s1.712-0.767 1.712-1.712v0c0-0.945-0.766-1.712-1.712-1.712s-1.712 0.766-1.712 1.712v0zM28.577 10.818c0 0.945 0.766 1.712 1.712 1.712s1.712-0.766 1.712-1.712v0c0-0.945-0.766-1.712-1.712-1.712s-1.712 0.766-1.712 1.712v0zM0 10.822c0 0.945 0.766 1.712 1.712 1.712s1.712-0.766 1.712-1.712v0c0-0.945-0.766-1.712-1.712-1.712s-1.712 0.766-1.712 1.712v0z"></path>
</symbol>
<symbol id="iconWire" viewBox="0 0 32 32">
    <path d="M2.5 25a4.5 4.5 0 1 0 9 0 4.5 4.5 0 1 0-9 0z"></path>
    <path d="M20.5 7a4.5 4.5 0 1 0 9 0 4.5 4.5 0 1 0-9 0z"></path>
    <path d="M7 22.8l15.8-15.8 2.2 2.2-15.8 15.8z"></path>
</symbol>
<symbol id="iconQuoteTomato" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>
</symbol>
<symbol id="iconFilesTomato" viewBox="40 -920 880 880">
    <path d="M300-172.31v-416q0-29.92 21.5-50.8Q343-660 372.92-660h414.77q29.92 0 51.12 21.19Q860-617.61 860-587.69v299.23L671.54-100H372.31q-29.92 0-51.12-21.19Q300-142.39 300-172.31ZM101-703.08Q95.39-733 112.66-757q17.26-24 47.19-29.61L569.23-859q29.92-5.61 53.92 11.66 24 17.26 29.62 47.19l9.23 52.46h-61.23L593-791.54q-.77-4.23-4.62-6.73-3.84-2.5-8.46-1.73l-409.53 72.77q-5.39.77-8.08 5-2.69 4.23-1.93 9.62l51.93 293.31v178.22q-14.85-7.84-25.39-21.5-10.53-13.65-13.53-31.11L101-703.08Zm259 115.39v415.38q0 5.39 3.46 8.85t8.85 3.46H640v-160h160v-267.69q0-5.39-3.46-8.85t-8.85-3.46H372.31q-5.39 0-8.85 3.46t-3.46 8.85ZM580-380Z"/>
</symbol>
<symbol id="iconGraphBox" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2.5" y="9" width="6" height="6"/>
    <rect x="15.5" y="2.5" width="6" height="6"/>
    <rect x="15.5" y="15.5" width="6" height="6"/>
    <path d="M8.5 12H12"/>
    <path d="M12 5.5v13"/>
    <path d="M12 5.5h3.5"/>
    <path d="M12 18.5h3.5"/>
</symbol>
<symbol id="iconGraphTomato" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2.5" y="9" width="6" height="6"/>
    <rect x="15.5" y="2.5" width="6" height="6"/>
    <rect x="15.5" y="15.5" width="6" height="6"/>
    <path d="M8.5 12H12"/>
    <path d="M12 5.5v13"/>
    <path d="M12 5.5h3.5"/>
    <path d="M12 18.5h3.5"/>
</symbol>
<symbol id="iconCameraTomato" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z"/><circle cx="12" cy="13" r="3"/>
</symbol>
<symbol id="iconDocTomato" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M13.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5z"/>
    <path d="M13.5 3v5.5H19"/>
    <path d="M9 13h6"/><path d="M9 16.5h4"/>
</symbol>
<!-- iconGraphLayout*（2026-09-04 graphbox 期7）：布局形态四态循环钮——三节点链语法
     （spec §20 vision 定稿）：矩形长宽比=文字横竖（横扁方=横排/竖长条=竖排），链条走向=树生长方向。
     与 iconGraphBox「三方块节点树」同家族（24×24 stroke1.7 round） -->
<symbol id="iconGraphLayoutLR" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2.5" y="9.5" width="5" height="5" rx="1.2"/>
    <rect x="10" y="9.5" width="5" height="5" rx="1.2"/>
    <rect x="17.5" y="9.5" width="5" height="5" rx="1.2"/>
    <path d="M7.5 12H10"/><path d="M15 12h2.5"/>
</symbol>
<symbol id="iconGraphLayoutTB" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <rect x="9.5" y="2.5" width="5" height="5" rx="1.2"/>
    <rect x="9.5" y="10" width="5" height="5" rx="1.2"/>
    <rect x="9.5" y="17.5" width="5" height="5" rx="1.2"/>
    <path d="M12 7.5V10"/><path d="M12 15v2.5"/>
</symbol>
<symbol id="iconGraphLayoutVLR" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2.5" y="9" width="4" height="6" rx="1.2"/>
    <rect x="10" y="9" width="4" height="6" rx="1.2"/>
    <rect x="17.5" y="9" width="4" height="6" rx="1.2"/>
    <path d="M6.5 12H10"/><path d="M14 12h3.5"/>
</symbol>
<symbol id="iconGraphLayoutVTB" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
    <rect x="8" y="2.25" width="4" height="5" rx="1.2"/>
    <rect x="8" y="9.75" width="4" height="5" rx="1.2"/>
    <rect x="8" y="17.25" width="4" height="5" rx="1.2"/>
    <path d="M10 7.25v2.5"/><path d="M10 14.75v2.5"/>
</symbol>
`;
