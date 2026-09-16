// 到点提示音播放通道加固（09-16 陆杰「浏览器端到点无声」）：Chromium/WebKit 自动播放策略下，
// 手势栈外的定时器回调 play() 可能被拒（NotAllowedError；Safari/手机浏览器基本必拦，点击栈内
// 必放行——「试听响、到点不响」正是此形态）。三板斧：
// ① 单例 Audio 元素——每次 new Audio 丢元素级解锁态（WebKit 解锁态随元素走），永远拦；
// ② 手势栈内静音预播解锁（开始计时的点击 + 首次任意交互兜底——覆盖 reload 后自动恢复的计时）；
// ③ 到点失败分类（blocked=自动播放拦截，调用方在到点弹窗挂「播放提示音」钮兜底；error=地址/
//    解码等）+ debugLog 全程留痕（Loki 可查，不再静默猜）。
import { debugLog } from "./logUtils";

export type NoticeAudioResult = "played" | "blocked" | "error";

/** play() 失败分类：NotAllowedError=自动播放策略拦截（手势解锁可救）；其余=地址/解码等错误 */
export function classifyPlayFailure(e: unknown): "blocked" | "error" {
    const name = typeof e === "object" && e !== null ? (e as { name?: unknown }).name : undefined;
    return name === "NotAllowedError" ? "blocked" : "error";
}

/** 单例状态挂 globalThis：插件热重载整轮重跑模块顶层（不调 onunload、页面不导航），局部变量
 *  全归零而 globalThis 存活——元素级解锁态随元素保留，不白解；真页面导航才整体重置，
 *  由 armNoticeAudioUnlock 首次交互兜底补。 */
interface NoticeAudioState {
    el: HTMLAudioElement;
    unlocked: boolean;
    curUrl: string;
    unlocking: boolean;
    /** 解锁预播的 settled-safe promise（then 双分支都吞异常）：到点/兜底钮播放并发进来时等它落地再播 */
    unlockP?: Promise<void>;
}
const STATE_KEY = "__tomatoNoticeAudio";
function state(): NoticeAudioState {
    const g = globalThis as any;
    if (!g[STATE_KEY]) g[STATE_KEY] = { el: new Audio(), unlocked: false, curUrl: "", unlocking: false };
    return g[STATE_KEY] as NoticeAudioState;
}

/** 手势栈内调用：用真实到点 URL 静音预播一次解锁（幂等+进行中防重入——同一次点击可能同时
 *  命中 arm 兜底监听与开始计时的解锁调用，重入会在同一元素上二次 play 打断首轮，白留一条
 *  fail 噪音）。volume=0 而非 muted 属性——muted 播放不算有效播放、不解锁 WebKit。
 *  播放即暂停复位，用户无感。 */
export function unlockNoticeAudio(url: string): void {
    // unlocking 且 unlockP 缺席=旧代模块残留的卡死态（加固前版本留下）：放行重解锁自愈
    const s = state();
    if (s.unlocked || (s.unlocking && s.unlockP)) return;
    s.unlocking = true;
    const a = s.el;
    s.curUrl = url;
    a.src = url;
    a.volume = 0;
    let p: Promise<void> | undefined;
    try {
        p = a.play();
    } catch (e) {
        s.unlocking = false;
        a.volume = 1;
        debugLog("notice-audio", `unlock fail(throw) ${classifyPlayFailure(e)}`, "tomato");
        return;
    }
    if (!p?.then) {
        // play() 无 Promise 返回的防御环境（对齐 playNoticeAudio 同款容错）：同步复位，
        // 否则 unlocking 永真、arm 兜底被锁死再无解锁机会
        s.unlocking = false;
        s.unlocked = true;
        a.pause();
        try { a.currentTime = 0; } catch { /* 未加载完重定位可能抛，忽略 */ }
        a.volume = 1;
        debugLog("notice-audio", "unlock ok(sync)", "tomato");
        return;
    }
    s.unlockP = p.then(
        () => {
            s.unlocking = false;
            s.unlocked = true;
            a.pause();
            try { a.currentTime = 0; } catch { /* 未加载完重定位可能抛，忽略 */ }
            a.volume = 1;
            debugLog("notice-audio", "unlock ok", "tomato");
        },
        (e: unknown) => {
            s.unlocking = false;
            a.volume = 1;
            // 手势栈内仍被拒（极边角）或 URL 坏：不重试，到点走 blocked/error 兜底链
            debugLog("notice-audio", `unlock fail ${classifyPlayFailure(e)}`, "tomato");
        },
    );
}

/** 到点播放（手势栈外）：单例元素复用解锁态；结果打点后返回，供调用方做 blocked 兜底 UI。
 *  解锁预播进行中时等它落地再播——不等的话同元素二次 play 落在 volume=0 上假"played"，
 *  随后解锁复位的 pause() 把真播放掐停（慢加载自定义音必踩：点兜底钮/到点都无声）。 */
export async function playNoticeAudio(url: string): Promise<NoticeAudioResult> {
    const s = state();
    if (s.unlocking && s.unlockP) await s.unlockP.catch(() => {});
    const a = s.el;
    if (url !== s.curUrl) {
        s.curUrl = url;
        a.src = url;
    }
    try { a.currentTime = 0; } catch { /* 未加载完重定位可能抛，忽略重播 */ }
    let p: Promise<void> | undefined;
    try {
        p = a.play();
    } catch (e) {
        const kind = classifyPlayFailure(e);
        debugLog("notice-audio", `play fail(throw) ${kind}`, "tomato");
        return Promise.resolve(kind);
    }
    if (!p?.then) return Promise.resolve("played"); // 环境无 Promise 返回（防御，对齐旧链路容错）
    return p.then(
        () => {
            s.unlocked = true;
            debugLog("notice-audio", "play ok", "tomato");
            return "played" as const;
        },
        (e: unknown) => {
            const kind = classifyPlayFailure(e);
            debugLog("notice-audio", `play fail ${kind}: ${(e as Error)?.message ?? String(e)}`, "tomato");
            return kind;
        },
    );
}

// 首次交互兜底解锁：插件加载即挂（覆盖 reload 后自动恢复计时、用户尚未点击的场景），首次
// pointerdown/keydown 触发即撤（一次机会，成败都不复挂——成功=已解锁；失败=URL 坏，到点走兜底链）。
// 插件 reload 不调 onunload：旧代监听残留——代际号不匹配即自撤（bgGen 同款模式）。
const ARM_GEN_KEY = "__tomatoNoticeAudioGen";
let armHandler: (() => void) | null = null;

export function armNoticeAudioUnlock(urlProvider: () => string): void {
    disarmNoticeAudioUnlock();
    const g = globalThis as any;
    const myGen = (g[ARM_GEN_KEY] = ((g[ARM_GEN_KEY] as number) || 0) + 1);
    armHandler = () => {
        const handler = armHandler;
        disarmNoticeAudioUnlock();
        if (!handler || g[ARM_GEN_KEY] !== myGen) return; // 旧代迟到触发：只自撤不干活
        if (state().unlocked) return;
        unlockNoticeAudio(urlProvider());
    };
    window.addEventListener("pointerdown", armHandler, { capture: true, passive: true });
    window.addEventListener("keydown", armHandler, { capture: true, passive: true });
}

export function disarmNoticeAudioUnlock(): void {
    if (!armHandler) return;
    window.removeEventListener("pointerdown", armHandler, { capture: true });
    window.removeEventListener("keydown", armHandler, { capture: true });
    armHandler = null;
}

// ---- □13-② 抽取可测（依赖注入纯函数）：到点播放竞速与 blocked 引导的原两处内联逻辑 ----

/** 到点播放竞速：timeoutMs 不落地按已播返回 null（慢外链不阻塞到点弹窗）；迟到结果只补
 *  error 信号（自定义音在意失败；blocked 迟到=引导时机已过，忽略防打扰） */
export async function raceNoticePlay(
    playP: Promise<NoticeAudioResult>,
    onLateError: () => void,
    timeoutMs = 1500,
): Promise<NoticeAudioResult | null> {
    const r = await Promise.race([playP, new Promise<null>((res) => setTimeout(() => res(null), timeoutMs))]);
    if (r === null) {
        void playP.then((late) => {
            if (late === "error") onLateError();
        });
        return null;
    }
    return r;
}

/** blocked 引导统一出口：toast 承诺「点击页面任意位置一次，下一轮即可恢复」——到点 blocked
 *  时 arm 兜底多半已消费，弹 toast 前必须重挂，否则引导无人监听=死循环误导（顺序：先 arm 后 toast） */
export function blockedGuidance(arm: () => void, toast: () => void): void {
    arm();
    toast();
}
