// 订单号信任制激活（在线租约，2026-09-25 spec）：订单号形状判断 + /claim 申报 +
// /claim-renew 30min 心跳。租约码 = exp=明天的普通签名激活码，验证层零改动——
// 写码/指纹/找回全走既有链；与终身码同走云端 license/ 槽位（覆盖格：终身在场短码
// 让位、同日心跳首码稳定、跨天续发覆盖）。
// 心跳只读云端不写 petal（petal 写=内核 dataChanges 广播整插件重载）；状态存模块
// 内存，重载后由 onload 首跳重建。三插件跨包 import 本模块，各 bundle 一份互不共享。
// 形状正则与云函数 services.ts 的 ORDER_NO_RE 同款，两端一致性由
// tools/license-worker/test/claim.test.ts 守护（改这里必须跑那边的测试）。
import { tomatoI18n } from "../tomatoI18n";
import { resetKey, verifyFnByProduct } from "./user";
import type { Product } from "./user";
import { licenseCloudSynced, userID, userToken } from "./stores";
import { FC_BASE_URL, fingerprintOf } from "./redeem";
import { PACKAGE_BY_PRODUCT, reloadSelfPlugin } from "./pluginReload";

// 淘宝订单号：纯数字 15~20 位。与兑换码（数字-字母串，含 -）、激活码（含 _）天然可区分
const ORDER_NO_RE = /^\d{15,20}$/;

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

// 本地 token 是否终身码（exp=99991231）——终身在場心跳无意义
export function isLifetimeToken(token: string): boolean {
    return token?.split("_")[1] === "99991231";
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

// 单次续期：200 且码有变 → 落盘+指纹+重验+reload（租约中同日同码零动作；跨天续发与
// 转正终身各 reload 一次，天级频次）；终态（rejected/cancelled/banned/404）→ 记状态停跳。
// 网络失败 → 保持现状态返回（下轮再试）。返回本次状态供测试断言。
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
    if (status !== "pending") stopClaimHeartbeat();
    return status;
}

// 心跳启动（onload 调；申报成功后也调）：30min interval + 即发一次。
// 不启动的四种情况：本地无码（未激活/已取消激活——申报链 markClaimPending 前已落码，
// 走到这的本地无码都是真未激活态）/ 本地终身码 / 已在跳 / 内存终态（rejected/banned
// ——新申报会经 markClaimPending 重置后再启动）。
export function startClaimHeartbeat(product: Product): void {
    if (!userToken.get()) return;
    if (isLifetimeToken(userToken.get())) return;
    if (heartbeatTimer != null) return;
    if (currentStatus === "rejected" || currentStatus === "banned") return;
    heartbeatTimer = setInterval(() => {
        void renewOnce(product);
    }, 30 * 60 * 1000);
    void renewOnce(product);
}

// 申报成功（/claim 200）后调用：状态置核验中并确保心跳在跑（UnlockDialog 激活链用）
export function markClaimPending(product: Product): void {
    currentStatus = "pending";
    stopClaimHeartbeat(); // 清掉可能已停的终态计时器再重启
    startClaimHeartbeat(product);
}
