// □3 划线总览浮层挂载器（anno-round2）：单例 + globalThis 注册表——思源 window.eval
// 执行插件无模块缓存，重载=新代模块整轮重跑，旧代浮层必须可被新代卸掉（渐进
// overlays.ts 同款纪律；deploy reload 不走 onunload，闭包跨代不可见）。
// 两入口共用：CommentBox 面板头钮（docID 种子，本插件直调）+ 渐进书卡右键（bookID
// 种子，走 OPEN_BRIDGE 全局桥——渐进侧静态/动态 import 本模块都会把 CommentBox
// 大图卷进渐进 bundle，CJS 图重排踩 svelte 循环初始化崩〔EFFECT_TRANSPARENT/
// from_html 两连实锤，踩坑表〕；桥=零打包耦合+跨插件单例共享同一注册表）。
import { mount, unmount } from "svelte";
import AnnoOverview from "./AnnoOverview.svelte";

const CLOSE_REG = "tomatoAnnoOverviewClose_zZmqus5PtYRi";
/** 渐进书卡右键入口的运行时桥（番茄插件在场即有值；模块每代重注册） */
const OPEN_BRIDGE = "tomatoOpenAnnoOverview_zZmqus5PtYRi";

// 模块顶层即清一次：新代模块加载时旧代浮层立即卸——不等用户再开新浮层
closeAnnoOverview();

export function closeAnnoOverview() {
    const prev = (globalThis as any)[CLOSE_REG];
    if (typeof prev !== "function") return;
    (globalThis as any)[CLOSE_REG] = null;
    prev();
}

export function openAnnoOverview(
    seed: { bookID?: string; docID?: string },
    ev?: { clientX: number; clientY: number },
) {
    if (!seed.bookID && !seed.docID) return;
    closeAnnoOverview();
    const host = document.createElement("div");
    document.body.appendChild(host);
    const app = mount(AnnoOverview, {
        target: host,
        props: {
            seed,
            x: ev && ev.clientX > 0 ? ev.clientX : innerWidth / 2,
            y: ev && ev.clientY > 0 ? ev.clientY : innerHeight / 2,
            onClose: closeAnnoOverview,
        },
    });
    const close = () => {
        try {
            unmount(app);
        } finally {
            host.remove();
            if ((globalThis as any)[CLOSE_REG] === close) (globalThis as any)[CLOSE_REG] = null;
        }
    };
    (globalThis as any)[CLOSE_REG] = close;
}

// 模块每代求值即重注册（容忍重注册）；插件禁用（非 reload）走 index.ts onunload →
// teardownAnnoOverview（禁用后无新代模块求值，桥与在场浮层须显式摘——review P2）
(globalThis as any)[OPEN_BRIDGE] = openAnnoOverview;

/** 禁用收尾：拆在场浮层 + 摘桥（键名单一事实源在本文件） */
export function teardownAnnoOverview() {
    closeAnnoOverview();
    (globalThis as any)[OPEN_BRIDGE] = null;
}
