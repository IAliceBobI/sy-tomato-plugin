/**
 * 激活码验签纯函数（2026-09-09 recite MCP 战役 □3 抽出）：前端 user.ts 与 recite kernel.js
 * （goja 无 DOM/window）双端共用一份实现，防两处漂移。行为与原 user.ts 内联版逐句等价
 * （拆分时未动任何判定顺序）；时间与登录身份由调用方注入——前端用内核 currentTimeMs +
 * window.siyuan.user，kernel 用 Date.now（即内核钟）+ getCloudUser。
 */
import { ec as EC } from 'elliptic';
import { Md5 } from 'ts-md5';

const MY_PUBKEY = "044ad3bfb46f3b89979dd551a5dada23f8502f8a0c54d247e1f8d31e5d7705a978df1ef30ba5a4b5206f0b0f573c8f76feada715f949430187f62f5640ca144aa7";
const ec = new EC('secp256k1');
const keyPair = ec.keyFromPublic(MY_PUBKEY, 'hex');

function md5(s: string): string {
    const h = new Md5();
    h.appendStr(s == null ? "" : s);
    return h.end().toString();
}

export interface UserSignResult {
    valid: boolean;
    /** 签名本身验过（绑定/黑名单判定前）——调用方据此决定是否展示有效期 */
    signOk: boolean;
    exp: string;
    ldID: string;
    name: string;
}

/**
 * 验一张激活码：tokenSign 形如 `1656951563417_22240101_ldID_siyuanTomatoCode_30qqqq…`
 * （included 前后各半，后半为 secp256k1 对 MD5(included 前半段+included) 的签名）。
 * nowYmd=yyyymmdd 与 exp 定宽字符串比较；currentUserID=当前登录（ldID 型绑定用，
 * name 型免绑定）。黑名单与 included 包含性判定同原版。
 */
export function verifyUserSignPure(tokenSign: string, included: string, nowYmd: string, currentUserID: string): UserSignResult {
    let signValid = false;
    let userPart = "";
    let userPartShort = "";
    let exp = "";
    let ldID = "";
    let name = "";
    {
        const parts = tokenSign?.split(included);
        if (parts?.length === 2) {
            userPartShort = parts[0];
            userPart = userPartShort + included;
            const sign = parts[1];
            try {
                const msgHash = md5(userPart);
                signValid = keyPair.verify(msgHash, sign);
            } catch {
                signValid = false;
            }
        }
    }
    {
        const ps = userPartShort.split("_");
        if (ps.length === 3) {
            exp = ps[1];
            if (ps[2] === "ldID") {
                ldID = ps[0];
            } else if (ps[2] === "name") {
                name = ps[0];
            }
        }
    }
    // 签名态定格（绑定/黑名单判定前）——原版 expStore 展示发生在 checkUserID 顶部，
    // 即只要签名验过就展示有效期，绑定失败也照展；signOk 保留这一时机语义
    const signOk = signValid;
    if (signValid) {
        // checkUserID 原语义：nowYmd<=exp 且 ldID 绑定当前登录（name 型免绑定）
        signValid = nowYmd <= exp && (!!ldID ? ldID === currentUserID : !!name);
    }

    if ([
        "e1255da1e2caf502a408c34c8d336ae7",
    ].includes(md5(userPartShort + "_siyuanTomatoCode"))) signValid = false;
    if ([
        "e0cb783f11f5c6d8e3891124c8f06fb6",
    ].includes(md5(userPartShort + "_siyuanProgressiveCode"))) signValid = false;
    if ([
        "9fac2fca1710a5a38eac53df8cddb9bd",
    ].includes(md5(userPartShort.split("_").at(0)))) signValid = false;

    if (included && !tokenSign.includes(included)) signValid = false;
    return { valid: signValid, signOk, exp, ldID, name };
}
