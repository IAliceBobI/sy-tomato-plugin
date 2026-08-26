import { ec as EC } from 'elliptic';
import { getMd5, siyuan, Siyuan, timeUtil } from './utils';
import { userID, userToken, writableWithGet } from './stores';

const MY_PUBKEY = "044ad3bfb46f3b89979dd551a5dada23f8502f8a0c54d247e1f8d31e5d7705a978df1ef30ba5a4b5206f0b0f573c8f76feada715f949430187f62f5640ca144aa7";
const ec = new EC('secp256k1');
const keyPair = ec.keyFromPublic(MY_PUBKEY, 'hex')
let _isValid: boolean = null;

export function lastVerifyResult(): boolean {
    return _isValid;
}

export const expStore = writableWithGet("")

export function getUserCodeExp(_exp: string) {
    if (!_exp) return ""
    return `${_exp.slice(0, 4)} / ${_exp.slice(4, 6)} / ${_exp.slice(6)}`
}

export function isMe() {
    return Siyuan?.user?.userId === "1656951563417";
}

export function resetKey() {
    _isValid = null;
}

export async function verifyKeyTomato() {
    return verifyKey("_siyuanTomatoCode_")
}

export async function verifyKeyProgressive() {
    return verifyKey("_siyuanProgressiveCode_")
}

export async function verifyKeyRecite() {
    // v5 □8（2026-08-26）码互通拍板：progressive Pro（￥29）单向送 recite——recite 面板
    // 粘贴 progressive 激活码同样解锁 recite Pro（￥10 recite 码不反向解锁 progressive，
    // 避免商业倒挂）。三产品同公钥仅 included 标记分流，seller/云端零改动。
    // 必须先无副作用验签（verifyUserSign 只读 token）：若先走 verifyKey 失败会塞
    // FREE_KEY 覆盖用户原 token，progressive 码就丢了。
    if (_isValid != null) return _isValid;
    const cross = await verifyUserSign(userToken.get(), "_siyuanProgressiveCode_");
    if (cross.valid) {
        _isValid = true;
        return true;
    }
    return verifyKey("_siyuanReciteCode_");
}

// 产品标识（2026-08 recite 商业化引入第三产品）：verify/redeem/购买组件共用的分流参数类型
export type Product = "tomato" | "progressive" | "recite";

// 无副作用本地验签（找回激活码·三分支判定用）：只读 userToken，不碰 _isValid 缓存、
// 不写 token——绝不能走 verifyKey（它无效时会静默把 token 换成免费试用码）。
// verifyUserSign 内含 checkUserID（exp 有效性 + ldID 绑定当前登录 userID），「有效」
// 已含绑定判定；name 型不做云端备份，调用方须自判 ldID 非空
export const INCLUDED_BY_PRODUCT: Record<Product, string> = {
    tomato: "_siyuanTomatoCode_",
    progressive: "_siyuanProgressiveCode_",
    recite: "_siyuanReciteCode_",
};

// verify 分流查表（2026-08 三产品化）：ActivationCard / redeem / BuyTomato 共用，
// 替代散落的 product === "tomato" ? ... : ... 三元链
export function verifyFnByProduct(product: Product): () => Promise<boolean> {
    return product === "tomato" ? verifyKeyTomato
        : product === "progressive" ? verifyKeyProgressive
        : verifyKeyRecite;
}

export async function verifyLocalCode(
    plugin: Product,
): Promise<{ valid: boolean; ldID: string; name: string; exp: string }> {
    const included = INCLUDED_BY_PRODUCT[plugin];
    const v = await verifyUserSign(userToken.get(), included);
    return { valid: v.valid, ldID: v.ldID, name: v.name, exp: v.exp };
}

// verifyKey 失败时塞进 store 的过期免费码（20250721）。导出供展示层识别清空：
// 未激活态输入框预填它会让买家粘贴前须手动清空（2026-08-24 评审 P1）。
export const FREE_KEY = "freeze7XSGUQr_20250721_name_siyuanTomatoCode_30440220584fbd1f344fbadcde83242f7bd87356b0b3186141fc820acfe820d68efb1c0102205a28181a774d96e5c46e1366954ea69f106faa11cb28a8ea7c1d19b87f8bb314";

async function verifyKey(included: string) {
    if (_isValid != null) return _isValid;

    let v = await verifyUserSign(userToken.get(), included);
    if (!v.valid) {
        userToken.set(FREE_KEY);
        v = await verifyUserSign(FREE_KEY, "_siyuanTomatoCode_");
    }
    _isValid = v.valid;
    return _isValid;
}

async function verifyUserSign(tokenSign: string, included: string) {
    let signValid = false;
    let userPart = "";
    let userPartShort = "";
    let exp = "";
    let ldID = "";
    let name = "";
    {
        // 1656951563417_22240101_ldID_siyuanTomatoCode_30qqqqqqqqqqqqqq..
        const parts = tokenSign?.split(included);
        if (parts?.length === 2) {
            userPartShort = parts[0];
            userPart = userPartShort + included;
            const sign = parts[1];
            try {
                const msgHash = getMd5(userPart)
                signValid = keyPair.verify(msgHash, sign);
            } catch {
                signValid = false;
            }
        }
    }
    {
        // freecbly0fNG4_20241206_name
        // 1656951563417_22240101_ldID
        const ps = userPartShort.split("_")
        if (ps.length === 3) {
            exp = ps[1];
            if (ps[2] === "ldID") {
                ldID = ps[0];
            } else if (ps[2] === "name") {
                name = ps[0];
            }
        }
    }
    if (signValid) {
        signValid = await checkUserID(ldID, name, exp);
    }

    // if ([
    //     "",
    // ].includes(getMd5(userPartShort))) signValid = false;
    if ([
        "e1255da1e2caf502a408c34c8d336ae7",
    ].includes(getMd5(userPartShort + "_siyuanTomatoCode"))) signValid = false;
    if ([
        "e0cb783f11f5c6d8e3891124c8f06fb6",
    ].includes(getMd5(userPartShort + "_siyuanProgressiveCode"))) signValid = false;
    if ([
        "9fac2fca1710a5a38eac53df8cddb9bd",
    ].includes(getMd5(userPartShort.split("_").at(0)))) signValid = false;

    if (included && !tokenSign.includes(included)) signValid = false;
    return { exp, valid: signValid, ldID, name };
}

async function checkUserID(ldID: string, name: string, exp: string) {
    const ms = await siyuan.currentTimeMs();
    const { y, M, d } = timeUtil.nowYMDStrPad(new Date(ms));
    const nowStr = y + M + d;
    expStore.set(getUserCodeExp(exp));
    if (nowStr <= exp) {
        if (ldID) {
            return ldID === userID.get();
        } else if (name) {
            return true;
        }
    }
    return false;
}
