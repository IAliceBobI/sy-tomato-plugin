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

/** 尾块是否已滚进视口底（滚底完成判据——jumpDocBottomViaSlider 轮询以「尾块贴视口
 *  底」为收敛条件而非「执行过」：goEnd 在途时一次性的判可能抢跑；expectedTailId=
 *  真尾块 id 时还要求渲染末块就是它——懒加载下渲染窗口末块≠真尾块，按渲染快照自
 *  比对会假收敛（滚在中部却判定完成），不匹配则继续拉等懒加载续真尾）。
 *  到底判据=scrollTop 数学（fballfeedback □3 v2 实锤：原 rect 差判据有方向坑——尾块
 *  在视口下方外未滚动时 content.bottom-tail.bottom 为负恒 ≤8，slider-jump 首拍即
 *  假 settled 停在顶部；Loki 204ms settled + scrollTop=0 双证）。
 *  fballtail □2：scrollDocBottom/scrollDocBottomWhenReady/bottomTimeoutOf/
 *  scrollDocBottomForDoc（对话框「头窗+scrollIntoView 轮询滚底」族）已随 dialog 链
 *  尾窗种档直载退役——本函数仍被 float 回退链（jumpDocBottomViaSlider）引用故保留 */
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
 *  放弃（不抛错）；容器 detach/用户容器外操作即停（用户滚动所有权优先，goEnd 自身
 *  也有 wheel 中断守卫）。
 *  luji0918 □1 修法①：加 onDone 终态回调（settled / TIMEOUT / abort 族全路径恰一次）——跳底期遮眼（visibility:hidden）由调用方挂此回调恢复显示，杜绝「头窗构造
 *  →goEnd 落底」间两段式观感（陆杰 09-18 反馈「先顶部再跳底部」）。 */
export function jumpDocBottomViaSlider(container: HTMLElement, timeoutMs = 15000, onDone?: (why: string) => void): void {
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
        onDone?.(why);
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

// ── luji0918 □1 修法②：记忆位置（重开回上次看到的地方）──────────────────────────────
// 通道选型：长文档懒加载下重开是头窗构造，关闭时视口里的块多半不在新头窗 DOM 里——
// scrollIntoView 够不到未渲染块；内核官方「重开恢复阅读位置」管线=getDocByScroll
// （/api/filetree/getDoc 带 startID/endID 直载该窗口 + onGet scrollTop 直恢），构造期
// action 含 cb-get-rootscroll 且 blockId=rootId 时自动走该分支（protyle/index.ts 构造器
// 同步读 FILEPOSITION）。插件侧记录进 ball.action（petal 持久化），重开时种入内核存储
// 供构造消费、构造返回即还原（零污染窗）——不长期占据内核 FILEPOSITION，主实例同名
// 文档的官方阅读位置不受影响。

/** 阅读位置存档（内核 saveScroll 同构字段）：startId/endId=当前渲染窗首尾块 id，
 *  scrollTop=滚动容器偏移 */
export interface DocReadPosition {
    startId: string;
    endId: string;
    scrollTop: number;
}

/** 读当前渲染窗位置（须在容器仍挂载时调——detached 元素 scrollTop 恒 0）。渲染未就绪
 *  （无首尾块）返回 undefined，调用方保持旧档不覆盖 */
export function readDocPosition(container: HTMLElement): DocReadPosition | undefined {
    const wys = container.querySelector(".protyle-wysiwyg");
    const startId = wys?.firstElementChild?.getAttribute("data-node-id");
    const endId = wys?.lastElementChild?.getAttribute("data-node-id");
    if (!startId || !endId) return undefined;
    const content = (container.querySelector(".protyle-content") ?? wys) as HTMLElement | null;
    // data-scrolltop 属性兜底与内核 saveScroll 同口径（slider 索引跳转期 overflow:hidden，
    // 真实偏移暂存属性）
    const scrollTop = content?.scrollTop || parseInt(content?.getAttribute("data-scrolltop") || "") || 0;
    return { startId, endId, scrollTop };
}

/** 内核阅读位置存储键（constants.ts LOCAL_FILEPOSITION 同值，前端只种内存镜像不落盘） */
export const FILEPOSITION_KEY = "local-fileposition";

/** 临时种入内核 FILEPOSITION 供 new Protyle 构造期 cb-get-rootscroll 分支消费，返回
 *  还原函数：内核构造器内同步读值（scrollAttr 按引用捕获进 getDocByScroll 请求），
 *  构造返回后即可还原——原值存在则恢复、不存在则删除。storage 不可用（异常环境）时
 *  种入无效果，返回 noop（构造落回普通头窗，行为退化为老开关语义）。 */
export function seedFilePosition(docID: string, pos: DocReadPosition): () => void {
    const storage = (window as any).siyuan?.storage;
    if (!storage) return () => { };
    const fp = storage[FILEPOSITION_KEY] ?? (storage[FILEPOSITION_KEY] = {});
    const orig = fp[docID];
    fp[docID] = { rootId: docID, ...pos };
    return () => {
        if (orig === undefined) delete fp[docID];
        else fp[docID] = orig;
    };
}

// ── fballtail □1：尾窗种档直载（陆杰 09-19「先空白→闪一下→才跳转到底部」根治）──────
// 现行跳底=头窗构造→遮眼→合成点 slider「跳到底部」钮 goEnd 换尾窗再渲染→轮询收敛后
// uncover——两段式只被藏没被消灭（空白=遮眼期、闪=uncover 瞬间、卡顿=两次完整渲染+
// 轮询，长日记懒加载推进秒级）。根治=预取真树序尾部 N 块组装种档，构造期走内核官方
// 「重开恢复阅读位置」管线（与修法② seedFilePosition 同通道同基建）：new Protyle 带
// rootId+cb-get-rootscroll → getDocByScroll → /api/filetree/getDoc 带 startID/endID
// 一次请求一次渲染直载尾窗（loadNodesByStartEnd 闭区间、真尾 next==nil→eof，往上滚
// 动态加载前文=整篇可达）；scrollTop 大值内核直赋后浏览器 clamp 落底（onGet.ts:627
// 直赋+observerLoad 随异步块撑高同值重申=持续钉底，均主会话内核源码实证）。无头窗、
// 无 goEnd、无轮询、无遮眼。预取失败/空→调用方回退现行「遮眼+jumpDocBottomViaSlider」
// 链（兜底保留勿删）。

/** 尾窗滚动位置大值：内核 onGet 直赋 contentElement.scrollTop 不校验上界，浏览器
 *  clamp 落底（observerLoad 同值重申——异步块撑高时仍钉底，用户滚动即放权） */
export const TAIL_SCROLL_TOP = 1e9;

/** 尾窗尺寸 N：与内核窗口上限同源（editor.dynamicLoadBlocks，内核缺省 192/下限 48），
 *  读取不到（异常环境）64 兜底。N≤内核值时 loadNodesByStartEnd 必达 endID（真尾
 *  next==nil→eof=true）；N 超内核值会被窗口上限截断、endID 不可达致 eof 缺失 */
export function tailWindowN(): number {
    return (window as any).siyuan?.config?.editor?.dynamicLoadBlocks || 64;
}

/** 预取尾窗（getTailChildBlocks=尾部 N 顶层子块，父=文档，与 loadNodesByStartEnd
 *  的顶层扫描同层）：docID 空/查询失败/空文档/响应非数组→undefined（调用方回退现行
 *  slider 链——空文档本无跳底意义，回退后幂等快收敛）；过滤出 [{id}] 供种档组装
 *  （响应里 type 等字段用不上，缺 id 项剔除）。
 *  ⚠内核响应=尾→头逆序（model/block.go getTailChildBlocksFromTree 从 LastChild 按
 *  Previous 反向遍历，fballtail □3 e2e 实锤：原样透传致 tailReadPositionOf 组装出
 *  startId=真尾/endId=尾窗首块 的反转档，loadNodesByStartEnd 从 startID 正向扫到
 *  endID 只载出真尾 1 块、eof 缺失）——此处取反归一为头→尾正序，tailReadPositionOf
 *  的 startId=tail[0]/endId=tail.at(-1) 语义才成立 */
export async function fetchTailWindow(
    docID: string,
    getTail: (id: string, n: number) => Promise<{ id?: string }[] | undefined | null>,
): Promise<{ id: string }[] | undefined> {
    if (!docID) return undefined;
    try {
        const ret = await getTail(docID, tailWindowN());
        const ids = (Array.isArray(ret) ? ret : []).filter((b) => !!b?.id).map((b) => ({ id: b.id! })).reverse();
        return ids.length > 0 ? ids : undefined;
    } catch {
        return undefined;
    }
}

/** 尾窗→种档组装：startId=尾窗首块、endId=尾窗末块、scrollTop=大值落底；
 *  空/全缺 id→undefined（调用方回退） */
export function tailReadPositionOf(tail: { id?: string }[] | undefined | null): DocReadPosition | undefined {
    const first = tail?.[0]?.id;
    const last = tail?.[tail.length - 1]?.id;
    if (!first || !last) return undefined;
    return { startId: first, endId: last, scrollTop: TAIL_SCROLL_TOP };
}

/** 跳底直载预取判定：openBottom 开且无 restore 档可回才预取（restore 优先于跳底——
 *  优先级在 docAction 预取侧与组件构造侧必须同判，错位=白跑请求或漏跳底）。
 *  dailyNote（$$dailynote 现建日记，docID≠action.docID）restore 恒 miss，恒预取 */
export function shouldPrefetchTail(
    openBottom: boolean,
    lastRead?: { startId?: string; endId?: string } | null,
    dailyNote?: boolean,
): boolean {
    if (!openBottom) return false;
    if (dailyNote) return true;
    return !(!!lastRead?.startId && !!lastRead?.endId);
}
