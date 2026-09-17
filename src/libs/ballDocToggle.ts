import {
    FloatingBallDocType_autoclose,
    FloatingBallDocType_dialog,
    FloatingBallDocType_float,
    FloatingBallDocType_tab,
} from "./gconst";
import { debugLog } from "./logUtils";

// 文档球开关命令（fbfeat □1，2026-09-15 陆杰速记场景）：「显示/隐藏悬浮文档」⌘⇧F8。
// 纯函数供 docAction 组装——目标选择（最近 doc 球优先）、toggle 决策（float 型
// 悬浮窗活着才显式 destroyBy 关；dialog/autoclose/tab 型 execute 本就是 toggle 语义
// ——dialog 系=dialogs 存在则 destroy、tab=closeTab 命中则关）、落底解析（atBottom
// 时 blockId 传文档尾块 id——openTab 通道 cb-get-hl 滚到尾块=打开即见最新内容）。
// 「最近」是会话级状态（globalThis 记球 id，petal 写→前端整重载也不丢），重启后
// 落「第一个启用的 doc 球」兜底。

/** toggle 目标：lastId 匹配且当前平台启用→该球；否则列表序第一个当前平台启用的 doc 球。
 *  启用判定=truthy，与 FloatingBall 挂载过滤同口径（`!== false` 会把从未挂载的
 *  undefined 球选进来）；over=VIP 超限灰档集（挂载明面跳过，toggle 同不放行） */
export function pickToggleBall(list: BallItem[], lastId: string | undefined, isMobile: boolean, over?: Set<string>): BallItem | undefined {
    const enabled = (b: BallItem) => (isMobile ? !!b.enableMobile : !!b.enable);
    const docs = (list ?? []).filter((b) => b.type === "doc" && enabled(b) && !over?.has(b.id));
    return docs.find((b) => b.id === lastId) ?? docs[0];
}

/** openDocType 的 float 语义判定（非法/缺失值兜底按 float——execute 的 switch default
 *  同此语义）。toggle 决策与 execute 必须共用本谓词：两处判定错位会让兜底球的悬浮窗
 *  开着时 toggle 恒判 execute（幂等「确保开」），永远关不掉 */
export function isOpenDocTypeFloat(t?: number): boolean {
    return t === FloatingBallDocType_float.id
        || (t !== FloatingBallDocType_tab.id && t !== FloatingBallDocType_dialog.id && t !== FloatingBallDocType_autoclose.id);
}

/** toggle 动作决策：float 型且悬浮窗活着→"close"（destroyBy）；其余一律 "execute" */
export function toggleDecision(ball: BallItem, floatOpen: boolean): "close" | "execute" {
    if (isOpenDocTypeFloat(ball.action?.openDocType) && floatOpen) return "close";
    return "execute";
}

/** 落底 blockId：atBottom 且尾块在→尾块 id；不落底/空 docID/空文档/查询异常→docID 回退 */
export async function resolveFocusID(
    docID: string,
    atBottom: boolean,
    getLast: (id: string) => Promise<string | undefined>,
): Promise<string> {
    if (!atBottom || !docID) return docID;
    try {
        return (await getLast(docID)) || docID;
    } catch {
        return docID;
    }
}

/** 对话框内文档滚到底（DOM 执行器）：new Protyle 构造不消费 action——定位类 action
 *  只在 openTab/openFileById 通道生效（思源源码消费点实证），悬浮窗/对话框内的
 *  protyle 须渲染后自己滚到底。**只滚不聚焦**（bear 09-15 拍板全插件禁聚焦：速记窗
 *  打开=即见最新内容，续写由用户点一下落光标——降摩擦让位于政策一致性）。
 *  容器未渲染好返回 false（轮询重试用） */
export function scrollDocBottom(container: HTMLElement): boolean {
    const wys = container.querySelector(".protyle-wysiwyg");
    if (!wys) return false;
    const blocks = wys.querySelectorAll(":scope > [data-node-id]");
    const tail = blocks[blocks.length - 1] as HTMLElement | undefined;
    if (!tail) return false;
    tail.scrollIntoView({ block: "end" });
    return true;
}

/** 尾块是否已滚进视口底（滚底完成判据——protyle 打开文档会异步恢复上次阅读位置，
 *  一次性的滚可能被它抢跑覆盖，故轮询以「尾块贴视口底」为收敛条件而非「执行过」；
 *  expectedTailId=真尾块 id 时还要求渲染末块就是它——懒加载下渲染窗口末块≠真尾块，
 *  按渲染快照自比对会假收敛（滚在中部却判定完成），不匹配则继续拉等懒加载续真尾）。
 *  到底判据=scrollTop 数学（fballfeedback □3 v2 实锤：原 rect 差判据有方向坑——尾块
 *  在视口下方外未滚动时 content.bottom-tail.bottom 为负恒 ≤8，slider-jump 首拍即
 *  假 settled 停在顶部；Loki 204ms settled + scrollTop=0 双证） */
export function isDocBottomScrolled(container: HTMLElement, expectedTailId?: string): boolean {
    const wys = container.querySelector(".protyle-wysiwyg");
    const blocks = wys ? wys.querySelectorAll(":scope > [data-node-id]") : [];
    const tail = blocks[blocks.length - 1] as HTMLElement | undefined;
    if (!tail) return false;
    if (expectedTailId && tail.getAttribute("data-node-id") !== expectedTailId) return false;
    // 滚动条到底（content=protyle 滚动容器；jsdom scrollTop/scrollHeight 可 mock 驱动单测）
    const content = container.querySelector(".protyle-content") as HTMLElement | null
        ?? wys as HTMLElement;
    return content.scrollTop + content.clientHeight >= content.scrollHeight - 8;
}

/** 滚底轮询包装：new Protyle 异步取文档渲染，就绪前重试；protyle 恢复阅读位置的抢跑
 *  由「未收敛则再拉回」对抗，200ms 一拍，超时放弃（不抛错）。两道守卫：①container
 *  已 detach（autoclose 点外即关/手动关）即停；②轮询窗内用户在容器外
 *  pointerdown/keydown（点了主编辑器/别处开始打字）即停，不再打扰。
 *  fballfeedback □3（陆杰反馈跳底不生效，dev 200 段实测复现）：3s 超时扛不住懒加载长
 *  文档——expectedTailId 严格匹配下渲染尾永远落后真尾，3s 仅推进 36% 即 TIMEOUT 停半
 *  路；调用侧超时经 bottomTimeoutOf 放宽（真尾已知=15s 懒加载推进预算）。另加无进展看
 *  护：连续 10 拍（2s）滚动位置/渲染块数双信号零推进且未收敛→提前 stalled 停（网络
 *  死等不干耗满窗，正常懒加载节奏毫秒级 RTT 不会误伤）。 */
export function scrollDocBottomWhenReady(container: HTMLElement, timeoutMs = 3000, expectedTailId?: string): void {
    const t0 = Date.now();
    debugLog("fball", `whenReady start timeout=${timeoutMs}`, "fball");
    let userTouched = false;
    const markUser = (e: Event) => {
        if (!container.contains(e.target as Node)) userTouched = true;
    };
    document.addEventListener("pointerdown", markUser, true);
    document.addEventListener("keydown", markUser, true);
    const done = (why: string) => {
        document.removeEventListener("pointerdown", markUser, true);
        document.removeEventListener("keydown", markUser, true);
        debugLog("fball", `whenReady ${why} at ${Date.now() - t0}ms`, "fball");
    };
    let lastProgress = "";
    let stall = 0;
    const tick = () => {
        if (!container.isConnected) {
            done("abort:detached");
            return;
        }
        if (userTouched) {
            done("abort:user");
            return;
        }
        if (isDocBottomScrolled(container, expectedTailId)) {
            done("settled");
            return;
        }
        scrollDocBottom(container);
        const wys = container.querySelector(".protyle-wysiwyg");
        const content = (container.querySelector(".protyle-content") ?? wys) as HTMLElement | null;
        const progress = `${content?.scrollTop ?? 0}/${wys?.querySelectorAll(":scope > [data-node-id]").length ?? 0}`;
        stall = progress === lastProgress ? stall + 1 : 0;
        lastProgress = progress;
        if (stall >= 10) {
            done("stalled");
            return;
        }
        if (Date.now() - t0 > timeoutMs) {
            done("TIMEOUT");
            return;
        }
        setTimeout(tick, 200);
    };
    tick();
}

/** 超时档选择（fballfeedback □3）：真尾已知（getLast 成功）=懒加载推进预算 15s——3s 实测
 *  200 段长文档仅推进 36% 即超时停半路；真尾未知=按渲染末块落底的老语义维持 3s。stalled
 *  看护在 whenReady 内兜底，15s 窗不会干等。 */
export function bottomTimeoutOf(expectedTailId: string | undefined, base = 3000): number {
    return expectedTailId ? Math.max(base, 15000) : base;
}

/** 跳底正轨通道（fballfeedback □3 v2，bear 09-17 反馈「只见最后一个块」）：此前把真尾块
 *  id 喂构造 blockId，内核按 getDoc mode 0 块 id 语义只加载该块（「伪聚焦」家族；内核
 *  protyle/index.ts:535 构造通道只有 mode 0/3，无尾窗）——悬浮窗只剩尾块、往上滚加载
 *  不出前文。正解=blockId 恒文档 id（整篇头窗构造）+ 头窗就绪后合成点击 protyle 自带
 *  滚动条「跳到底部」钮（.protyle-scroll__down）→ 内核 goEnd：getDoc mode 4 一次落尾窗
 *  + onGet scrollCenter 滚到尾块，与主编辑器「跳到底部」按钮行为完全一致；往上滚动态
 *  加载前窗=整篇可达。钮的监听绑在 .protyle-scroll 父容器 click（内核 scroll/index.ts
 *  ~120，click 委托非 mousedown 族），合成 el.click() 可触发。
 *  节奏：等头窗首块（点早了 goEnd 拿不到 rootID/尾元素=白点）→ 点钮 → 轮询落底收敛
 *  （isDocBottomScrolled 不带期望——mode 4 后渲染末块即真尾），未收敛且距上次点击
 *  ≥600ms 再点（goEnd 幂等：尾窗已载时内核走 scrollTop 直接收底）。200ms 一拍超时
 *  放弃（不抛错）；容器 detach/用户容器外操作即停（whenReady 同款守卫——用户滚动
 *  所有权优先，goEnd 自身也有 wheel 中断守卫）。 */
export function jumpDocBottomViaSlider(container: HTMLElement, timeoutMs = 15000): void {
    const t0 = Date.now();
    debugLog("fball", `slider-jump start timeout=${timeoutMs}`, "fball");
    let userTouched = false;
    const markUser = (e: Event) => {
        if (!container.contains(e.target as Node)) userTouched = true;
    };
    document.addEventListener("pointerdown", markUser, true);
    document.addEventListener("keydown", markUser, true);
    const done = (why: string) => {
        document.removeEventListener("pointerdown", markUser, true);
        document.removeEventListener("keydown", markUser, true);
        debugLog("fball", `slider-jump ${why} at ${Date.now() - t0}ms`, "fball");
    };
    let lastClick = 0;
    let clicks = 0;
    const tick = () => {
        if (!container.isConnected) {
            done("abort:detached");
            return;
        }
        if (userTouched) {
            done("abort:user");
            return;
        }
        const first = container.querySelector(".protyle-wysiwyg > [data-node-id]");
        if (!first) {
            // 头窗未就绪：内核 getDoc mode 0 在途，此拍点钮拿不到 rootID/尾元素
            if (Date.now() - t0 > timeoutMs) {
                done("TIMEOUT:head-not-ready");
                return;
            }
            setTimeout(tick, 200);
            return;
        }
        if (isDocBottomScrolled(container)) {
            done("settled");
            return;
        }
        if (Date.now() - lastClick >= 600) {
            const btn = container.querySelector(".protyle-scroll__down");
            if (!btn) {
                done("abort:no-slider-btn");
                return;
            }
            lastClick = Date.now();
            clicks++;
            (btn as HTMLElement).click();
        }
        if (Date.now() - t0 > timeoutMs) {
            done(`TIMEOUT clicks=${clicks}`);
            return;
        }
        setTimeout(tick, 200);
    };
    tick();
}

/** 组件侧一站式：先查真尾块 id 再轮询滚底（懒加载防错位——查询失败按渲染末块语义回退） */
export async function scrollDocBottomForDoc(
    container: HTMLElement,
    docID: string,
    getLast: (id: string) => Promise<string | undefined>,
    timeoutMs = 3000,
): Promise<void> {
    let expected: string | undefined;
    try {
        expected = (await getLast(docID)) || undefined;
    } catch {
        // 真尾未知→不传期望，按渲染末块落底（老行为）
    }
    scrollDocBottomWhenReady(container, bottomTimeoutOf(expected, timeoutMs), expected);
}
