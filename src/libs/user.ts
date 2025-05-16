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

async function verifyKey(included: string) {
    if (_isValid != null) return _isValid;

    let v = await verifyUserSign(userToken.get(), included);
    if (!v.valid) {
        const FREE_KEY = "freeze7XSGUQr_20250531_name_siyuanTomatoCode_30450221009c482f5a144f605dca52c5c9991501eb98d281755435d6316e666820c718f7ad02207e175822e94fc88fd397bd14f497d123815b91c7d43935a683e26d6bc99c1f76";
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

    if ([
        "",
        // "402f82671ae66425e07eaa0a47c5128723383ff0",
        // "9d07cd325209e7739fe04da41b2b7887e097b268",
        // "5f6df12238cfea797f8c73309dfcf3445fd99d28",
        // "1e4b90d2e70cc02b29ad5232094d6ca6a4853366",
    ].includes(getMd5(userPartShort))) signValid = false;

    if (included && !tokenSign.includes(included)) signValid = false;
    return { exp, valid: signValid };
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
