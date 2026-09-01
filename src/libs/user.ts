import { ec as EC } from 'elliptic';
import { getMd5, siyuan, Siyuan, timeUtil } from './utils';
import { userID, userToken, writableWithGet } from './stores';

const MY_PUBKEY = "044ad3bfb46f3b89979dd551a5dada23f8502f8a0c54d247e1f8d31e5d7705a978df1ef30ba5a4b5206f0b0f573c8f76feada715f949430187f62f5640ca144aa7";
const ec = new EC('secp256k1');
const keyPair = ec.keyFromPublic(MY_PUBKEY, 'hex')
// □3 V2（2026-08-31）：验证结果 store 化——PairBar 等响应式组件读 $vipVerified 即时
// 跟随（原模块变量读取在验证后灰态滞后到重挂）；lastVerifyResult() 签名不变返回
// .get()，既有命令式调用点零改动。null=未验证。
const _isValid = writableWithGet<boolean | null>(null);
export const vipVerified = _isValid;

export function lastVerifyResult(): boolean {
    return _isValid.get();
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
    _isValid.set(null);
}

export async function verifyKeyTomato() {
    return verifyKey("_siyuanTomatoCode_")
}

export async function verifyKeyProgressive() {
    return verifyKey("_siyuanProgressiveCode_")
}

export async function verifyKeyRecite() {
    // v5 □8（2026-08-26）码互通拍板：progressive Pro（￥72，□9 终稿现价）单向送 recite——recite 面板
    // 粘贴 progressive 激活码同样解锁 recite Pro（￥10 recite 码不反向解锁 progressive，
    // 避免商业倒挂）。三产品同公钥仅 included 标记分流，seller/云端零改动。
    // 先无副作用验签（verifyUserSign 只读 token）判互通，再落本产品通道
    // （2026-09-01 □5 后 verifyKey 失败已不回写 token，无覆盖风险）。
    if (_isValid.get() != null) return _isValid.get();
    const cross = await verifyUserSign(userToken.get(), "_siyuanProgressiveCode_");
    if (cross.valid) {
        _isValid.set(true);
        return true;
    }
    return verifyKey("_siyuanReciteCode_");
}

// 产品标识（2026-08 recite 商业化引入第三产品）：verify/redeem/购买组件共用的分流参数类型
export type Product = "tomato" | "progressive" | "recite";

// 无副作用本地验签（找回激活码·三分支判定用）：只读 userToken，不碰 _isValid 懒缓存、
// 不触发网络判定——与 verifyKey 必须隔离（2026-09-01 □5 起后者失败已不改写 token，但
// 三分支判定要的是可重复的纯本地结果，不能被懒缓存短路）。
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

// 过期免费码（20250721，早已验不过）。2026-09-01 □5 起不再写入 store——verifyKey 失败时
// 曾把它 set 进 userToken 污染共享 settingCfg，任何 write（DialogSvelte 存弹窗位置的
// userID.write() 是常客）都会把真码持久覆盖成 FREE_KEY 落盘（dev 实例 token 降级事故根因）。
// 保留导出仅供展示层识别清空磁盘/内存里的历史存量（2026-08-24 评审 P1：未激活态输入框
// 预填长串须手动清空）。
export const FREE_KEY = "freeze7XSGUQr_20250721_name_siyuanTomatoCode_30440220584fbd1f344fbadcde83242f7bd87356b0b3186141fc820acfe820d68efb1c0102205a28181a774d96e5c46e1366954ea69f106faa11cb28a8ea7c1d19b87f8bb314";

// 失败只置 _isValid=false，绝不改写 userToken：真码遇到环境性失败（e2e 坏码窗口/身份判定
// 抖动）时码留在原处，下次验证自愈；坏码留待外部（e2e 恢复/用户重粘）纠正，插件不越权覆盖。
async function verifyKey(included: string) {
    if (_isValid.get() != null) return _isValid.get();

    const v = await verifyUserSign(userToken.get(), included);
    _isValid.set(v.valid);
    return v.valid;
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
