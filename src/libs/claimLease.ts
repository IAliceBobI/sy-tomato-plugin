// 订单号信任制激活（在线租约，2026-09-25 spec）：订单号形状判断 + /claim 申报 +
// /claim-renew 心跳。租约码 = exp=明天的普通签名激活码，验证层零改动——
// 写码/指纹/找回全走既有链；与终身码同走云端 license/ 槽位（覆盖格：终身在场短码
// 让位、同日心跳首码稳定、跨天续发覆盖）。
// 心跳降频（FC 降本 2026-10-02）：claimActive 申报态落盘（stores）+ 本地一天一查——
// 码未到期不联网（today<exp 串比较直接跳过），到期日/过期日才 renew，稳态一天一跳；
// interval 30min→24h（每 tick 先过本地到期守卫）。代价=转正感知延迟 ≤1 天（bear 拍板）。
// 严格门（FC 降本 2026-10-06）：claimActive !== true 一律不连——历史残留用户（null，
// 从未申报过）零心跳零探测（探测流量即 FC 费用主体）；进心跳体系的唯一入场券=
// markClaimPending 落 true（订单申报/兑换短码两路）。
// 心跳只读云端不写 petal（petal 写=内核 dataChanges 广播整插件重载）；状态存模块
// 内存，重载后由 onload 首跳重建。三插件跨包 import 本模块，各 bundle 一份互不共享。
// 形状正则与云函数 services.ts 的 ORDER_NO_RE 同款，两端一致性由
// tools/license-worker/test/claim.test.ts 守护（改这里必须跑那边的测试）。
import { tomatoI18n } from "../tomatoI18n";
import { resetKey, verifyFnByProduct } from "./user";
import type { Product } from "./user";
import { claimActive, licenseCloudSynced, userID, userToken } from "./stores";
import { FC_BASE_URL, fingerprintOf } from "./redeem";
import { PACKAGE_BY_PRODUCT, reloadSelfPlugin } from "./pluginReload";

// 淘宝订单号：纯数字 15~20 位。与兑换码（数字-字母串，含 -）、激活码（含 _）天然可区分
const ORDER_NO_RE = /^\d{15,20}$/;

// 客户端本地今天的 yyyymmdd（与 checkUserID 的 nowStr<=exp 同构串比较）。exp 是签发端
// FC（UTC）的「签发日+1」，与本地日最差 ±8h——守卫只在 today<exp 时跳过联网，exp 当天
// 必联网续签，串比较语义下无断供窗口
function todayYmdStr(): string {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

export function isOrderNoShape(token: string): boolean {
    return ORDER_NO_RE.test(token.trim());
}

// 申报状态（心跳与申报响应映射；内存态，UnlockDialog 状态行读）：
// pending=核验中 / rejected=未通过 / cancelled=已取消可重填 / banned=已失去该方式 /
// none=无申报。approved 不单列——转正拿到终身码后本地终身，验证链直接生效，无需状态行。
export type ClaimStatus = "pending" | "rejected" | "cancelled" | "banned" | "none";

let currentStatus: ClaimStatus | null = null;

export function getClaimStatus(): ClaimStatus | null {
    return currentStatus;
}

export function setClaimStatus(s: ClaimStatus | null) {
    currentStatus = s;
}

// /claim-renew 响应 → 状态映射（200=在租【pending】，终态 403/404 停）
export function claimStatusFromRenew(ec: number, em?: string): ClaimStatus {
    if (ec === 200) return "pending";
    if (ec === 404) return "none";
    if (em === "banned") return "banned";
    if (em === "rejected") return "rejected";
    if (em === "cancelled") return "cancelled";
    return "pending"; // 未知业务码：保持核验中，别把状态行打回初始态
}

// 本地 token 是否终身码——距今 ≥100 年即按终身；99991231 是历史口径一并兼容
// （与 AdminCodes.svelte 卖家面板同款口径）。终身在場心跳无意义
export function isLifetimeToken(token: string): boolean {
    const exp = token?.split("_")[1];
    return exp === "99991231" || Number(exp?.slice(0, 4)) >= new Date().getFullYear() + 100;
}

// /claim 申报：{ec:200, code}（exp=明天的租约码）| 400/403。网络层失败抛异常由调用方 catch
export async function claimByOrderNo(
    orderNo: string, uid: string, product: Product,
): Promise<{ ec: number; em?: string; code?: string }> {
    const res = await fetch(`${FC_BASE_URL}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNo: orderNo.trim(), userID: uid, plugin: product }),
    });
    return await res.json();
}

// 服务端 em → 用户可读文案（沿用 redeemErrMsg 惯例：未识别的 em 原样展示）
export function claimErrMsg(em?: string): string {
    if (em === "bad params") return tomatoI18n.订单号格式不正确;
    if (em === "banned") return tomatoI18n.订单号通道已关闭;
    if (em === "rejected") return tomatoI18n.该订单号核对未通过;
    return em || tomatoI18n.申报失败请稍后重试;
}

let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

export function stopClaimHeartbeat(): void {
    if (heartbeatTimer != null) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
    }
}

// 单次续期（2026-10-02 降频后每 tick 必过本地守卫，多数 tick 零联网）：
// ① claimActive !== true=不在心跳体系（严格门 2026-10-06）——false=已探明无租约、
//   null=历史残留用户（从未申报），连探测都不必：FC 探测流量费用主体即 null 用户；
// ② 码未到期（today<exp）不联网——到期日/过期日才 renew，稳态一天一跳。
// 联网后：200 且码有变 → 落盘+指纹+重验+reload（租约中同日同码零动作；跨天续发与
// 转正终身各 reload 一次，天级频次）；终态（rejected/cancelled/banned/404）→ 记状态停跳
// 并把 claimActive 落 false（此后启动零请求）。网络失败 → 保持现状态返回（下轮再试）。
// 返回本次状态供测试断言。
export async function renewOnce(product: Product): Promise<ClaimStatus | null> {
    const uid = userID.get();
    if (!uid) return currentStatus;
    // 本地无码=未激活/已取消激活（取消激活清码后 onload 重建心跳会走到这）：云端租约
    // 不自动恢复本地激活——恢复只走显式「找回激活码」（activateFromCloud 覆盖格取租约
    // 码）。停跳退出：每次 reload 首跳自停，无轮询残留
    if (!userToken.get()) {
        stopClaimHeartbeat();
        return currentStatus;
    }
    // 申报态守卫（严格门 2026-10-06）：仅 true 放行——false=已探明无租约；null=历史残留
    // 用户（从未申报）。「null=升级存量放行」语义已废止：null 一律停跳零联网，想进体系
    // 只能走 markClaimPending（申报/兑换短码）显式落 true
    if (claimActive.get() !== true) {
        stopClaimHeartbeat();
        return currentStatus;
    }
    // 到期守卫：exp 非 8 位数字形状（畸形/name 型）不拦，走联网自愈
    const expSeg = userToken.get().split("_")[1] ?? "";
    if (/^\d{8}$/.test(expSeg) && todayYmdStr() < expSeg) return currentStatus;
    let r: { ec: number; em?: string; code?: string };
    try {
        const res = await fetch(`${FC_BASE_URL}/claim-renew`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userID: uid, plugin: product }),
        });
        r = await res.json();
    } catch {
        return currentStatus; // 断网等：不判死，下轮心跳再试
    }
    const status = claimStatusFromRenew(r.ec, r.em);
    currentStatus = status;
    // 写回前提=本地仍有码：fetch 在途期间被取消激活（清码）的写回即失效（与函数头
    // 守卫同语义——本地无码不自动恢复）
    if (r.ec === 200 && r.code && userToken.get() && r.code !== userToken.get()) {
        await userToken.write(r.code);
        // 云端槽位码天然已备份（license/{plugin}/{userID} 即其来源），写指纹挡后续回填
        await licenseCloudSynced.write(fingerprintOf(r.code));
        resetKey();
        if (await verifyFnByProduct(product)()) {
            await reloadSelfPlugin(PACKAGE_BY_PRODUCT[product]);
        }
        // 转正终身码：停跳（租约结束，后续不再依赖心跳）
        if (isLifetimeToken(r.code)) stopClaimHeartbeat();
    }
    // 申报态写回：终态/404 落 false（此后启动零请求——启动白跳清零的落定动作）；
    // 200 固化 true（防御性写回：严格门下入场即 true，仅 fetch 在途被并发改写时拉回）/
    // 终身码租约结束落 false。写丢失自愈=下次申报/兑换 markClaimPending 重写 true
    if (status === "none" || status === "rejected" || status === "cancelled" || status === "banned") {
        await claimActive.write(false);
    } else if (r.ec === 200) {
        if (isLifetimeToken(r.code ?? "")) await claimActive.write(false);
        else if (claimActive.get() !== true) await claimActive.write(true);
    }
    if (status !== "pending") stopClaimHeartbeat();
    return status;
}

// 心跳启动（onload 调；申报/兑换短码成功后也调）：24h interval + 即发一次（每 tick 先过
// 本地到期守卫，多数零联网）。不启动的五种情况：本地无码（未激活/已取消激活——申报链
// markClaimPending 前已落码，走到这的本地无码都是真未激活态）/ 本地终身码 /
// claimActive !== true（严格门 2026-10-06：false=已探明无租约；null=历史残留用户
// 零心跳——FC 探测流量费用主体清零）/ 已在跳 / 内存终态（rejected/banned——新申报会经
// markClaimPending 重置后再启动）
export function startClaimHeartbeat(product: Product): void {
    if (!userToken.get()) return;
    if (isLifetimeToken(userToken.get())) return;
    if (claimActive.get() !== true) return;
    if (heartbeatTimer != null) return;
    if (currentStatus === "rejected" || currentStatus === "banned") return;
    heartbeatTimer = setInterval(() => {
        void renewOnce(product);
    }, 24 * 3600 * 1000);
    void renewOnce(product);
}

// 申报成功（/claim 200）后调用：状态置核验中并确保心跳在跑（UnlockDialog 激活链用）。
// claimActive 落 true（fire-and-forget：save 同步进 store/settingCfg，落盘 Promise
// 不等——丢失自愈=下轮 renewOnce 200 再固化）
export function markClaimPending(product: Product): void {
    currentStatus = "pending";
    void claimActive.write(true);
    stopClaimHeartbeat(); // 清掉可能已停的终态计时器再重启
    startClaimHeartbeat(product);
}

// 云端找回回调用（严格门配套 2026-10-06）：仅 ldID 型短租约码落 true 进心跳体系；
// 终身码无租约、name 型免费码无 userID 绑定，均不落——两者白跳零。
// 放本模块而非 redeem（claimLease→redeem 已单向 import，反向会建环）。
export function markClaimPendingIfLease(product: Product, code: string): void {
    if (code.split("_")[2] !== "ldID") return;
    if (isLifetimeToken(code)) return;
    markClaimPending(product);
}
