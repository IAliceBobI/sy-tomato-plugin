import { TomatoI18nABCMAX } from "./gconst";

// 订单号信任制激活（在线租约，2026-09-25）新增键。es/fr/ja/it/de/he/ru/pl 暂以英文
// 兜底（i18n 兜底哲学：缺翻译落英文，英语混排可接受），后续翻译批统一补。
export abstract class TomatoI18nABC14 extends TomatoI18nABCMAX {
    public get 粘贴订单号兑换码或激活码() {
        switch (this.lang) {
            case "zh_CN": return "粘贴订单号 / 兑换码 / 激活码";
            case "zh_CHT": return "粘貼訂單號 / 兌換碼 / 激活碼";
            case "en_US":
            default: return "Order no. / redeem code / activation code";
        }
    }

    public get 订单号激活说明() {
        switch (this.lang) {
            case "zh_CN": return "已购买？可粘贴淘宝订单编号、兑换码或激活码。填订单号可先用后核：提交立即解锁，人工核对通过后转为永久授权；填报不实将失去该激活方式。";
            case "zh_CHT": return "已購買？可粘貼淘寶訂單編號、兌換碼或激活碼。填訂單號可先用後核：提交立即解鎖，人工核對通過後轉為永久授權；填報不實將失去該激活方式。";
            case "en_US":
            default: return "Already purchased? Paste your Taobao order no., redeem code or activation code. Order no. unlocks instantly with manual review afterwards; false claims will lose this activation method.";
        }
    }

    public get 订单号核验中请保持联网() {
        switch (this.lang) {
            case "zh_CN": return "订单号核验中，请保持联网，人工核对通过后自动转为永久授权";
            case "zh_CHT": return "訂單號核驗中，請保持聯網，人工核對通過後自動轉為永久授權";
            case "en_US":
            default: return "Order no. under review — stay online; it becomes permanent once approved";
        }
    }

    public get 该订单号核对未通过() {
        switch (this.lang) {
            case "zh_CN": return "该订单号核对未通过，可换一单重新填写或改用兑换码";
            case "zh_CHT": return "該訂單號核對未通過，可換一單重新填寫或改用兌換碼";
            case "en_US":
            default: return "This order no. was declined. Try another order or use a redeem code";
        }
    }

    public get 已失去订单号激活方式() {
        switch (this.lang) {
            case "zh_CN": return "多次填报不实，已失去订单号激活方式，请使用兑换码或联系卖家";
            case "zh_CHT": return "多次填報不實，已失去訂單號激活方式，請使用兌換碼或聯繫賣家";
            case "en_US":
            default: return "Order no. activation disabled after false claims. Use a redeem code or contact the seller";
        }
    }

    public get 订单号通道已关闭() {
        switch (this.lang) {
            case "zh_CN": return "订单号激活方式已被关闭，请使用兑换码";
            case "zh_CHT": return "訂單號激活方式已被關閉，請使用兌換碼";
            case "en_US":
            default: return "Order no. activation is disabled. Please use a redeem code";
        }
    }

    public get 订单号格式不正确() {
        switch (this.lang) {
            case "zh_CN": return "订单号格式不正确（15~20 位数字）";
            case "zh_CHT": return "訂單號格式不正確（15~20 位數字）";
            case "en_US":
            default: return "Invalid order no. (15-20 digits)";
        }
    }

    public get 申报失败请稍后重试() {
        switch (this.lang) {
            case "zh_CN": return "提交失败，请稍后重试";
            case "zh_CHT": return "提交失敗，請稍後重試";
            case "en_US":
            default: return "Submission failed, please retry later";
        }
    }

    public get 订单号已取消可重新填写() {
        switch (this.lang) {
            case "zh_CN": return "该订单号申报已取消，可重新填写或改用兑换码";
            case "zh_CHT": return "該訂單號申報已取消，可重新填寫或改用兌換碼";
            case "en_US":
            default: return "This order claim was cancelled. Refill or use a redeem code";
        }
    }

    public get 提交成功已临时解锁() {
        switch (this.lang) {
            case "zh_CN": return "提交成功，已临时解锁——人工核对通过后转为永久授权，请保持联网";
            case "zh_CHT": return "提交成功，已臨時解鎖——人工核對通過後轉為永久授權，請保持聯網";
            case "en_US":
            default: return "Submitted and temporarily unlocked — stay online; permanent once approved";
        }
    }
}
