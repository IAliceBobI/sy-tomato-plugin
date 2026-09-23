import {
    FloatingBallDocType_autoclose,
    FloatingBallDocType_float,
    FloatingBallDocType_tab,
} from "./gconst";
import { debugLog } from "./logUtils";

// 文档球开关命令（fbfeat □1，2026-09-15 陆杰速记场景）：「显示/隐藏悬浮文档」⌘⇧F8。
// 纯函数供 docAction 组装——目标选择（最近 doc 球优先）、toggle 决策（float 型
// 悬浮窗活着才显式 destroyBy 关；autoclose/tab 型 execute 本就是 toggle 语义
// ——autoclose=dialogs 存在则 destroy、tab=closeTab 命中则关）、落底解析（atBottom
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

/** openDocType 的 float 语义判定（非法/缺失/退役 dialog 值兜底按 float——execute 的
 *  switch default 同此语义）。toggle 决策与 execute 必须共用本谓词：两处判定错位会让
 *  兜底球的悬浮窗开着时 toggle 恒判 execute（幂等「确保开」），永远关不掉。
 *  fballfb □5：dialog 型（id=2）退役后，合法值=1/3/4——存量 2 由 migrateDialogDocBalls
 *  显式迁移落盘，本谓词对 2 的兜底只救「迁移未跑的异常态」（如手改 petal），不承担
 *  日常语义 */
export function isOpenDocTypeFloat(t?: number): boolean {
    return t === FloatingBallDocType_float.id
        || (t !== FloatingBallDocType_tab.id && t !== FloatingBallDocType_autoclose.id);
}

/** fballfb □5 砍 dialog 型存量迁移（一次性+幂等，migrateKmLabelBalls 同款模式）：
 *  openDocType=2（对话框dialog，拖动常驻）→ 3（悬浮窗float）——dialog 功能被 float
 *  完全覆盖（float 多 lastRead 记忆/⌘⇧F8 toggle/跳底直载）。显式数据迁移不靠
 *  isOpenDocTypeFloat 兜底：兜底只救异常态，合法存量必须改值落盘——否则设置列表
 *  showName 无型可显、execute 走 float 谓词但存储值仍是 2，后续任何按值比较的
 *  链路（重绑去重 findIndex by openDocType）语义漂移。返回是否有改动（调用方落盘） */
export function migrateDialogDocBalls(list: BallItem[]): boolean {
    const legacyDialogId = 2; // FloatingBallDocType_dialog 退役值（gconst 已摘，值契约留此）
    let n = 0;
    for (const b of list ?? []) {
        if (b?.type === "doc" && b.action?.openDocType === legacyDialogId) {
            b.action.openDocType = FloatingBallDocType_float.id;
            n++;
        }
    }
    if (n > 0) debugLog("fball", `migrate dialog->float balls=${n}`, "fball");
    return n > 0;
}

/** toggle 动作决策：float 型且悬浮窗活着→"close"（destroyBy）；其余一律 "execute" */
export function toggleDecision(ball: BallItem, floatOpen: boolean): "close" | "execute" {
    if (isOpenDocTypeFloat(ball.action?.openDocType) && floatOpen) return "close";
    return "execute";
}

/** fballfb □3「打开后保留悬浮球」点球即开合分流：keep 开→点球走 toggle 语义（float 型
 *  窗活着→close 关窗——决策与 ⌘⇧F8 同一 toggleDecision）；keep 关→恒 execute 维持现状
 *  （开窗即杀球后无球可点，keep 关时窗活着的点击本就不存在；tab/dialog/autoclose 型
 *  execute 内建 toggle，不经此分流恒 execute） */
export function keepBallClickDecision(keepBall: boolean, ball: BallItem, floatOpen: boolean): "close" | "execute" {
    if (!keepBall) return "execute";
    return toggleDecision(ball, floatOpen);
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

/** fballfb □14（bear 09-21「跳底后随时可打字」）：跳底落光标——光标钉尾块块尾的
 *  「打开即续写」语义，与 tab 通道 focusIDOf 的 cb-get-focus 豁免（bear 09-20）对齐，
 *  不加新开关（跟 openBottom 走：开关开=跳底+落光标，关=现状不动 selection）。悬浮窗/
 *  dialog 内 new Protyle 构造不消费定位 action（在档坑），只能渲染后 DOM 自实现：
 *  轮询至尾块在场（expectedTailId 有值时须渲染末块=真尾，懒加载窗口教训同
 *  isDocBottomScrolled）→ 尾块最后一个 contenteditable 元素 focus({preventScroll})+
 *  Range 落其内容末尾（超级块/列表尾块取内层最后一个编辑落点=续写位；focus 才能把
 *  activeElement 从主窗拽进来——只放 selection 不聚焦，键盘输入仍落主窗）。
 *  收敛判据=「光标真在尾块」连续 3 拍（600ms）稳定，而非「setRange 执行过」——异步
 *  渲染重画可能清打回光标，打回即重放（fbfeat □1 抢跑对抗同款）。用户接管即停：
 *  窗外 pointerdown/keydown（主窗打字不被劫持——窗可能是 openOnCreate 自动开的）、
 *  光标已被放进窗内其他块（点击了文档中部）。取舍：拖窗标题栏（container 外
 *  pointerdown）也判接管放弃自动光标——第一动作非打字，点内容区原生落光标。
 *  超时/detached 安静放弃（优雅降级=滚动已到底，点尾块即可打字）。 */
export function focusTailForTyping(
    container: HTMLElement,
    expectedTailId?: string,
    timeoutMs = 8000,
    onDone?: (why: string) => void,
): void {
    const t0 = Date.now();
    debugLog("fball", `tail-focus start expect=${expectedTailId ? expectedTailId.slice(-6) : "-"} timeout=${timeoutMs}`, "fball");
    let stable = 0;
    let userTouched = false;
    const markUser = (e: Event) => {
        if (!container.contains(e.target as Node)) userTouched = true;
    };
    document.addEventListener("pointerdown", markUser, true);
    document.addEventListener("keydown", markUser, true);
    const done = (why: string) => {
        document.removeEventListener("pointerdown", markUser, true);
        document.removeEventListener("keydown", markUser, true);
        debugLog("fball", `tail-focus ${why} at ${Date.now() - t0}ms`, "fball");
        onDone?.(why);
    };
    const tick = () => {
        if (!container.isConnected) {
            done("abort:detached");
            return;
        }
        if (userTouched) {
            done("abort:user");
            return;
        }
        const sel = document.getSelection();
        const anchorNode = sel?.rangeCount ? sel.getRangeAt(0).startContainer : null;
        const anchorEl = anchorNode
            ? (anchorNode.nodeType === Node.ELEMENT_NODE ? (anchorNode as Element) : anchorNode.parentElement)
            : null;
        const wys = container.querySelector(".protyle-wysiwyg");
        const blocks = wys ? wys.querySelectorAll(":scope > [data-node-id]") : [];
        const tail = blocks[blocks.length - 1] as HTMLElement | undefined;
        if (anchorEl && container.contains(anchorEl)) {
            if (tail && (anchorEl === tail || tail.contains(anchorEl))) {
                // 光标在尾块（我们放的或用户点的）——目标态，连续稳定才放手防重画打回
                if (++stable >= 3) {
                    done("settled");
                    return;
                }
            } else {
                done("user:focus-elsewhere");
                return;
            }
        } else {
            stable = 0;
            const tailId = tail?.getAttribute("data-node-id");
            if (tail && (!expectedTailId || tailId === expectedTailId)) {
                const editables = tail.querySelectorAll('[contenteditable="true"]');
                const host = (editables[editables.length - 1] as HTMLElement | undefined)
                    ?? (tail.isContentEditable ? tail : undefined);
                if (host) {
                    host.focus({ preventScroll: true });
                    const range = document.createRange();
                    range.selectNodeContents(host);
                    range.collapse(false);
                    sel?.removeAllRanges();
                    sel?.addRange(range);
                }
            }
        }
        if (Date.now() - t0 > timeoutMs) {
            done("TIMEOUT");
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

/** 跳底直载预取判定：openBottom 开恒预取（fballfb □2，bear 09-21 拍板「开关开=必跳底」
 *  ——此前 restore 档优先于跳底：球存过 lastRead 就恢复、开关开了也不跳，与 tab 链
 *  （focusIDOf 不看 lastRead）行为分裂，陆杰 08:15 反馈+bear 实锤）。忽略 lastRead/
 *  dailyNote（旧参数已退役——dailyNote 恒预取本就是新语义子集）；开关关=不预取，
 *  组件侧维持现行 restore 优先语义。判定与组件构造侧必须同口径，错位=白跑请求或漏跳底 */
export function shouldPrefetchTail(openBottom: boolean): boolean {
    return openBottom;
}

/** fballfb □2 落底留白标记类：挂 .protyle-wysiwyg 上，压制的 !important CSS 留在
 *  组件 scoped style（悬浮窗/dialog 各自的量级随组件走） */
export const FBALL_TAIL_PAD_CLASS = "fball-tail-pad";

/** fballshort □1 留白值 CSS 变量名：挂 wysiwyg 内联 custom property，组件 CSS
 *  `padding-bottom: var(--fball-tail-pad, 旧视口公式) !important` 消费。内联 custom
 *  property 不在 padding shorthand 内——内核 afterOnGet resize→setPadding 的内联
 *  style.padding 覆写打不到它；!important 仍在组件样式表层压制内核内联（fballfb □2
 *  在案坑的内联打不过内联，本变量通道与类通道同框架不新增冲突面） */
export const FBALL_TAIL_PAD_VAR = "--fball-tail-pad";

/** fballshort □1 留白值计算（纯函数）：窗内容区实际高 → 一半（内核打字机 getPadding
 *  本义 bottom=element.clientHeight/2，initUI.ts:440）。旧公式 max(calc(50vh-58px),
 *  20vh)/min(40vh,325px) 全主视口单位——用户 resize 窗后窗高与视口脱钩，留白 ≥ 窗
 *  内容区高 ⇒ 跳底 scrollTop clamp 的「底」含留白=视口整个落进留白区=全空白、末块与
 *  光标（钉尾块）都在视口上方（陆杰/bear 09-22 同症，矮窗 260 复现 padB=258.5>cH=165
 *  精确到底）。跟窗走后留白=窗内容区一半恒小于窗高=任何窗高末块必可见。非有限/非正
 *  读数（布局未就绪 clientHeight=0、jsdom 等异常形态）→undefined，调用方不写变量=
 *  组件 CSS fallback（旧视口公式）接管 */
export function tailPadPx(contentHeight: number): number | undefined {
    if (!Number.isFinite(contentHeight) || contentHeight <= 0) return undefined;
    return Math.round(contentHeight / 2);
}

/** fballfb □2 落底留白：跳底落位后编辑器底部留一段空白（尾行/光标不贴视口底边，
 *  bear 09-21 拍板「跳底了就留白」不加新开关）。借内核打字机模式思路不改内核
 *  （initUI getPadding：typewriterMode→bottom=element.clientHeight/2 写 wysiwyg
 *  padding）——「量级=容器高一半」与「padding 挂滚动容器内容元素=可滚入的滚动区
 *  非死区」两点照搬；实现不同：内核 afterOnGet 会跑 resize→setPadding（index.ts:573）
 *  以内联 style.padding 覆写插件内联值（e2e 实测留白被 16px 顶掉）——内联打不过
 *  内联，改挂标记类+组件 !important CSS（样式表 !important 恒胜内联非 !important，
 *  无时序竞态）。构造返回后同步挂（内核构造器同步 initUI：wysiwyg DOM 已在而
 *  getDoc 异步在后）——onGet 的 scrollTop 直赋（onGet.ts:627）与 observerLoad
 *  同值重申（:671）按含留白的 scrollHeight clamp 收底=尾行一次渲染落位悬在底边
 *  上方，无二段观感。
 *  fballshort □1 量级跟窗体实际高走（bear 09-22 拍板）：挂类同时写 FBALL_TAIL_PAD_VAR
 *  （值=tailPadPx(滚动区可视高)——.protyle-content=scrollTop 数学所在滚动容器，与
 *  诊断/断言同口径，缺省兜底容器自身）；窗被 resize 后经 ResizeObserver 更新变量
 *  （DialogSvelte resizer 拖拽/存档回放改窗高都表现为内容区尺寸变化，observe 即报
 *  初始尺寸=首拍布局未就绪时 0 高不写、布局完成自动补写）。无 RO 环境（jsdom）静默
 *  跳过。返回还原函数（摘类+删变量+断 RO——组件层接 dm 即「卸载即断」，复用容器时
 *  防样式/变量/observer 泄漏） */
export function applyBottomPad(container: HTMLElement): () => void {
    const wys = container.querySelector(".protyle-wysiwyg") as HTMLElement | null;
    if (!wys) return () => { };
    wys.classList.add(FBALL_TAIL_PAD_CLASS);
    const content = (container.querySelector(".protyle-content") ?? container) as HTMLElement;
    const setVar = () => {
        const px = tailPadPx(content.clientHeight);
        if (px === undefined) wys.style.removeProperty(FBALL_TAIL_PAD_VAR);
        else wys.style.setProperty(FBALL_TAIL_PAD_VAR, `${px}px`);
    };
    setVar();
    let ro: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(setVar);
        ro.observe(content);
    }
    return () => {
        ro?.disconnect();
        wys.classList.remove(FBALL_TAIL_PAD_CLASS);
        wys.style.removeProperty(FBALL_TAIL_PAD_VAR);
    };
}

// ---- fballshort □2：autoclose 对话框换 DialogSvelte 壳（拍板①②的纯函数面） ----

/** 窗体存档键前缀钉值：单一事实源=FloatingBall.DMKey（FloatingBall.ts）。此处不 import
 *  FloatingBall（ballDocToggle 保持轻 import 面，且 FloatingBall.ts 反向 import 本文件
 *  〔migrateDialogDocBalls〕成环）——字面形态由 ballDocToggle.test 钉住：两侧任一改动
 *  测试即红（e2e 造数配方同字面，recipe-floatball 在档） */
const FLOATING_BTN_DM_KEY_PREFIX = "TomatoFloatingBtnDMKey";

/** 悬浮文档窗体存档键（fballshort □2 拍板①）：float 悬浮窗与 autoclose 对话框**共用**
 *  ——同一文档换打开方式（ConfFloatBall radio 切 openDocType），位置/尺寸习惯延续。
 *  与 float 链字节级同式：getFloatingBallProtyleDialog 的 address=`protyle#2#<docID>`
 *  → FloatingBallProtyleDialog 的 savePositionKey=`${FloatingBall.key(address)}#floatingDialog`。
 *  docID 绑 item.docID 稳定值（bindDoc 恒写串：缺省 ""）——$$dailynote 每天现建的解析
 *  docID 不进键（日漂移会让存档键天天换新=永不回放，float dm 键同哲学）；DialogSvelte
 *  再拼 `_${isMobile}_offsetX/offsetY/width/height` 四键落 petal cfg */
export function floatingDialogPositionKey(docID: string | undefined): string {
    return `${FLOATING_BTN_DM_KEY_PREFIX}_protyle#2#${docID}#floatingDialog`;
}

/** autoclose 壳默认尺寸 props（fballshort □2 拍板②：对齐 float 悬浮窗）——桌面=悬浮窗
 *  同款（FloatingBallProtyleDialog：无显式宽靠 minWidth 420 撑底 + 定高公式 104px≈
 *  标题栏48+内容padding16+边框2 的「填满窗体」链起点）；mobile 保留旧 Dialog 的
 *  90vw/180svw 档（小屏 420 定宽会糊脸）。用户 resize 后存档像素值回放覆盖这些缺省 */
export function autocloseDialogShellProps(isMobile: boolean): {
    width?: string;
    height?: string;
    minWidth?: number;
} {
    if (isMobile) {
        return { width: "90vw", height: "180svw", minWidth: undefined };
    }
    return {
        width: undefined,
        height: "max(calc(100vh - 116px), calc(40vh + 104px))",
        minWidth: 420,
    };
}
