// 淘宝兑换码通道：兑换码形状判断 + 云函数 /redeem 调用。
// 兑换码 <面值>-<10位去易混base32>（如 72-M9XK3TQ7RC / 9.9-M9XK3TQ7RC，面值最多两位小数）
// 短且无下划线，与激活码 ID_日期_类型_标记_签名（必含 _）天然可区分，active() 据此自动路由。
// 形状正则与云函数 services.ts 的 redeemCodeShapeOk 同款，
// 两端一致性由 tools/license-worker/test/redeem.test.ts 守护（改这里必须跑那边的测试）。
import { tomatoI18n } from "../tomatoI18n";
import { resetKey, verifyFnByProduct, verifyLocalCode } from "./user";
import type { Product } from "./user";
import { licenseCloudSynced, userID, userToken } from "./stores";
import { getMd5, siyuan } from "./utils";

// 去易混 base32 字符集（无 0/1/I/L/O/U/V），与 tools/license-worker/src/services.ts
// 的 REDEEM_CODE_RE 同源——两端一致性由 tools/license-worker/test 守护（改这里必须跑那边测试）
const REDEEM_CODE_CHARS = "23456789ABCDEFGHJKMNPQRSTVWXYZ";
const REDEEM_CODE_RE = new RegExp(
    `^\\d{1,4}(?:\\.\\d{1,2})?-[${REDEEM_CODE_CHARS}]{10}$`,
);

export function isRedeemCodeShape(token: string): boolean {
    return REDEEM_CODE_RE.test(token.trim().toUpperCase());
}

// 渐进提取：买家把客服发的整段话术全文粘贴，从杂项文本中扫出兑换码/激活码。
// 扫描 = 锚定正则去掉 ^$ + 前后界约束（码前后不能是字母/数字/连字符，防从长串
// 截半段误配）；i flag 容忍小写手打，命中后 toUpperCase 归一。
// 「面值 72 元」「¥72」无 dash 连接不会误配；真伪由云函数裁决，
// 误提取只会得到干净的 404/格式错误。
const REDEEM_CODE_SCAN_RE = new RegExp(
    `(?<![0-9A-Za-z-])\\d{1,4}(?:\\.\\d{1,2})?-[${REDEEM_CODE_CHARS}]{10}(?![0-9A-Za-z-])`,
    "i",
);

export function extractRedeemCode(text: string): string | null {
    const m = text.match(REDEEM_CODE_SCAN_RE);
    return m ? m[0].toUpperCase() : null;
}

// 激活码 token 扫描：{userID}_{日期}_{类型}_{标记}_{DER hex 签名}，解析语义与
// libs/user.ts verifyUserSign 一致（ldID 型首段为 13-17 位数字；name 型首段为
// free 前缀字母数字如 free3days——首段取 [0-9A-Za-z]{4,20} 覆盖两型）。
// 日期段取 \d{8}：真实终身码日期为 22000101/22240101 等 22 开头（spec 字面
// 「20xxxxxx」意为 8 位 yyyymmdd；verifyUserSign 对日期段亦无形状约束，日期
// 有效性由 checkUserID 的 nowStr <= exp 判定）。签名为 secp256k1 DER hex
// （实测 136-144 字符），约束 {100,200} 留余量；提取结果还须通过离线验签，兜底误配。
const ACTIVATION_CODE_SCAN_RE =
    /(?<![0-9A-Za-z_])[0-9A-Za-z]{4,20}_\d{8}_(?:ldID|name)_(?:siyuanTomatoCode|siyuanProgressiveCode|siyuanReciteCode)_[0-9a-f]{100,200}(?![0-9A-Za-z_])/;

export function extractActivationCode(text: string): string | null {
    return text.match(ACTIVATION_CODE_SCAN_RE)?.[0] ?? null;
}

// 指纹闸门（spec docs/admin-codes-design.md 批次 B1）：licenseCloudSynced 的值从
// 布尔升级为「已回填激活码的 md5」——布尔短路挡不住多产品（番茄码回填过→粘渐进码
// 漏传）与续期换码（新 exp 码漏传、找回拿回旧码）。布尔 true 是升级前老值，不猜
// 对应哪个码：指纹比对必然不等 → 触发一次回填（服务端覆盖格幂等，无害，设计行为）
export function fingerprintOf(token: string): string {
    return getMd5(token);
}

export function isLicenseSynced(stored: unknown, token: string): boolean {
    return typeof stored === "string" && stored === fingerprintOf(token);
}

// 云函数基地址，/redeem（兑换）与 /activate（找回激活码）同域共用
export const FC_BASE_URL = "https://sy-license-waekiptpru.cn-hangzhou.fcapp.run";

const REDEEM_URL = `${FC_BASE_URL}/redeem`;

// 云函数响应 {ec:200, code} 或 {ec:400|404|409, em}（HTTP 状态恒 200，业务码看 ec）。
// 网络层失败（断网/CORS 被拦）抛异常，由调用方 catch 后提示检查网络
export async function redeemCode(
    code: string, userID: string, plugin: Product,
): Promise<{ ec: number; em?: string; code?: string }> {
    const res = await fetch(REDEEM_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase(), userID, plugin }),
    });
    return await res.json();
}

// 服务端 em → 用户可读文案；未识别的 em 原样展示（服务端新增错误类型时不至于哑火）。
// bad params 是参数级拒绝（如云端 plugin 枚举滞后），原文对用户无意义 → 版本提示
export function redeemErrMsg(em?: string): string {
    if (em === "bad params") return tomatoI18n.参数不被支持请更新插件重试;
    if (em === "bad code format") return tomatoI18n.兑换码格式不正确;
    if (em === "code not found") return tomatoI18n.兑换码不存在;
    if (em === "code already redeemed") return tomatoI18n.兑换码已被使用;
    if (em?.startsWith("face value")) return tomatoI18n.兑换码面值与插件价格不符;
    return em || tomatoI18n.兑换失败;
}

// /activate 凭 userID 从云端取激活码并激活。设置页激活区「找回激活码」入口使用
// （爱发电购买入口 2026-08-31 移除后现为唯一调用方；成功路径：write 落盘 →
// resetKey → verify → reload）。2026-08-22 从 BuyTomato.svelte 迁入共用。
export async function activateFromCloud(
    msg404: string, msgNet: string, plugin: Product,
) {
    if (!userID.get()) {
        await siyuan.pushMsg(tomatoI18n.如果要激活插件请先登录思源本体的账户);
        return;
    }
    let r: { ec: number; em?: string; code?: string };
    try {
        const res = await fetch(`${FC_BASE_URL}/activate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userID: userID.get(), plugin }),
        });
        r = await res.json();
    } catch {
        await siyuan.pushMsg(msgNet);
        return;
    }
    if (r.ec !== 200 || !r.code) {
        // bad params（云端 plugin 枚举滞后等参数级拒绝）映射版本提示，其余 404 走 msg404、
        // 未知 em 原样展示便于排查
        const em = r.ec === 404 ? msg404
            : r.em === "bad params" ? tomatoI18n.参数不被支持请更新插件重试
            : r.em || msgNet;
        await siyuan.pushMsg(em);
        return;
    }
    await siyuan.pushMsg(tomatoI18n.已完成购买正在激活);
    userToken.write(r.code);
    // 云端取回的码天然已备份（license/{plugin}/{userID} 即其来源），写指纹挡后续查询
    licenseCloudSynced.write(fingerprintOf(r.code));
    resetKey();
    if (await verifyFnByProduct(plugin)()) {
        window.location.reload();
    }
}

// 找回激活码（spec 2026-08-23 方案 A 三分支，本地优先、只在此入口触网）：
// 1 已备份短路：当前码指纹已回填且本地码 ldID 型验签有效 → 0 次网络调用
// 2 上传回填：本地码 ldID 型验签有效但指纹未匹配（首次/布尔老值/多产品/换码）→
//   POST /license-upload，200 后写指纹落盘；name 型不在此列（无绑定意义，走分支 3）
// 3 云端找回：本地无码/无效/name 型 → activateFromCloud（200 时其内部已写指纹）。
// 短路必须双条件：本地无码时哪怕指纹存在也走分支 3——挡死「清掉本地 token 点找回
// 拿回码」的真实场景（清 token 不清指纹时）
export async function recoverFromCloud(plugin: Product) {
    const v = await verifyLocalCode(plugin);
    if (v.valid && v.ldID) {
        if (isLicenseSynced(licenseCloudSynced.get(), userToken.get())) {
            await siyuan.pushMsg(tomatoI18n.激活码已备份云端无需找回);
            return;
        }
        // verifyUserSign 的 checkUserID 已保证 ldID === userID.get()，此守卫仅防御性保留
        if (!userID.get()) {
            await siyuan.pushMsg(tomatoI18n.如果要激活插件请先登录思源本体的账户);
            return;
        }
        let r: { ec: number; em?: string };
        try {
            const res = await fetch(`${FC_BASE_URL}/license-upload`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userID: userID.get(), plugin, code: userToken.get() }),
            });
            r = await res.json();
        } catch {
            await siyuan.pushMsg(tomatoI18n.备份激活码失败请检查网络后重试);
            return;
        }
        if (r.ec !== 200) {
            // 服务端与本地同款验签，合法客户端理论到不了这步——em 原样展示便于排查
            await siyuan.pushMsg(r.em || tomatoI18n.备份激活码失败请检查网络后重试);
            return;
        }
        licenseCloudSynced.write(fingerprintOf(userToken.get()));
        await siyuan.pushMsg(tomatoI18n.激活码已备份到云端);
        return;
    }
    await activateFromCloud(
        tomatoI18n.未查询到该账号的激活记录,
        tomatoI18n.找回激活码失败请检查网络后重试,
        plugin,
    );
}

// 自动回填（spec 批次 B2）：ActivationCard 本地粘贴激活码路径、本地验签通过后、
// reload 之前调用一次（reload 会掐断在途请求，调用方必须 await 本函数）。
// 一切失败静默——回填是兜底不是主流程，绝不打断激活体验，漏传的下次找回入口还能补
export async function backfillCloudOnce(plugin: Product) {
    const token = userToken.get();
    // name 型（FREE_KEY 等）不绑 userID、云端槽位无从落，跳过（token 第 3 段为类型）
    if (token.split("_")[2] !== "ldID") return;
    // 同码已回填过：零网络直接返回
    if (isLicenseSynced(licenseCloudSynced.get(), token)) return;
    let r: { ec: number; em?: string };
    try {
        const res = await fetch(`${FC_BASE_URL}/license-upload`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userID: userID.get(), plugin, code: token }),
        });
        r = await res.json();
    } catch {
        return;
    }
    if (r.ec === 200) {
        await licenseCloudSynced.write(fingerprintOf(token));
    }
}
