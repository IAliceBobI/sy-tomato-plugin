import { TomatoI18nABCMAX } from "./gconst";

// 订单号信任制激活（在线租约，2026-09-25）新增键；09-26 翻译批补齐 es/fr/ja/it/de/he/ru/pl
// 八语种。术语对齐 text1 `拍下价格档无需等发码`（订单号/兑换码/淘宝勿另造译法；ru 兑换码
// 定稿=код активации，与激活码同词，两码并列处只写一次不重复）。
export abstract class TomatoI18nABC14 extends TomatoI18nABCMAX {
    public get 粘贴订单号兑换码或激活码() {
        switch (this.lang) {
            case "zh_CN": return "粘贴订单号 / 兑换码 / 激活码";
            case "es_ES": return "Nº de pedido / código de canje / código de activación";
            case "fr_FR": return "N° de commande / code d'échange / code d'activation";
            case "ja_JP": return "注文番号 / 引き換えコード / アクティベーションコード";
            case "zh_CHT": return "粘貼訂單號 / 兌換碼 / 激活碼";
            case "it_IT": return "Numero d'ordine / codice di riscatto / codice di attivazione";
            case "de_DE": return "Bestellnummer / Einlösungscode / Aktivierungscode";
            case "he_IL": return "מספר הזמנה / קוד מימוש / קוד הפעלה";
            case "ru_RU": return "Номер заказа / код активации";
            case "pl_PL": return "Numer zamówienia / kod wymiany / kod aktywacyjny";
            case "en_US":
            default: return "Order no. / redeem code / activation code";
        }
    }

    public get 订单号激活说明() {
        switch (this.lang) {
            case "zh_CN": return "已购买？可粘贴淘宝订单编号、兑换码或激活码。填订单号可先用后核：提交立即解锁，人工核对通过后转为永久授权；填报不实将失去该激活方式。";
            case "es_ES": return "¿Ya compró? Pegue su número de pedido de Taobao, código de canje o código de activación. Con el número de pedido se activa al instante y se revisa manualmente después; si el dato resulta falso, perderá esta vía de activación.";
            case "fr_FR": return "Déjà acheté ? Collez votre numéro de commande Taobao, code d'échange ou code d'activation. Le numéro de commande déverrouille immédiatement, avec vérification manuelle ensuite ; toute fausse déclaration entraîne la perte de ce mode d'activation.";
            case "ja_JP": return "購入済みですか？淘宝（Taobao）の注文番号・引き換えコード・アクティベーションコードを貼り付けできます。注文番号はすぐに解放され、人的確認を経て永久化されます。虚偽申告の場合、この方式は利用できなくなります";
            case "zh_CHT": return "已購買？可粘貼淘寶訂單編號、兌換碼或激活碼。填訂單號可先用後核：提交立即解鎖，人工核對通過後轉為永久授權；填報不實將失去該激活方式。";
            case "it_IT": return "Hai già acquistato? Incolla il numero d'ordine Taobao, il codice di riscatto o il codice di attivazione. Il numero d'ordine sblocca subito, con verifica manuale in seguito; le dichiarazioni false fanno perdere questo metodo di attivazione.";
            case "de_DE": return "Schon gekauft? Fügen Sie Ihre Taobao-Bestellnummer, den Einlösungscode oder Aktivierungscode ein. Die Bestellnummer schaltet sofort frei und wird danach manuell geprüft; falsche Angaben führen zum Verlust dieser Aktivierungsmethode.";
            case "he_IL": return "כבר קניתם? הדביקו את מספר ההזמנה מטאובאו, קוד מימוש או קוד הפעלה. מספר הזמנה משחרר מיד ונבדק ידנית לאחר מכן; דיווח כוזב יביא לאיבוד דרך הפעלה זו";
            case "ru_RU": return "Уже купили? Вставьте номер заказа Taobao или код активации. Номер заказа разблокирует сразу, с ручной проверкой позже; недостоверные данные приведут к потере этого способа активации";
            case "pl_PL": return "Już kupiłeś? Wklej numer zamówienia Taobao, kod wymiany lub kod aktywacyjny. Numer zamówienia odblokowuje od razu, a ręczna weryfikacja następuje później; fałszywe zgłoszenie skutkuje utratą tej metody aktywacji";
            case "en_US":
            default: return "Already purchased? Paste your Taobao order no., redeem code or activation code. Order no. unlocks instantly with manual review afterwards; false claims will lose this activation method.";
        }
    }

    public get 订单号核验中请保持联网() {
        switch (this.lang) {
            case "zh_CN": return "订单号核验中，请保持联网，人工核对通过后自动转为永久授权";
            case "es_ES": return "Número de pedido en revisión — manténgase conectado; se vuelve permanente una vez aprobado";
            case "fr_FR": return "Numéro de commande en cours de vérification — restez connecté ; il devient permanent une fois approuvé";
            case "ja_JP": return "注文番号を確認中です——オンラインのままお待ちください。承認後に永久化します";
            case "zh_CHT": return "訂單號核驗中，請保持聯網，人工核對通過後自動轉為永久授權";
            case "it_IT": return "Numero d'ordine in verifica — resta connesso; diventa permanente dopo l'approvazione";
            case "de_DE": return "Bestellnummer wird geprüft — bleiben Sie online; sie wird nach Freigabe dauerhaft";
            case "he_IL": return "מספר ההזמנה בבדיקה — הישארו מחוברים לאינטרנט; לאחר אישור הוא הופך לקבוע";
            case "ru_RU": return "Номер заказа на проверке — оставайтесь онлайн; после одобрения он станет постоянным";
            case "pl_PL": return "Numer zamówienia w weryfikacji — pozostań online; po zatwierdzeniu staje się trwały";
            case "en_US":
            default: return "Order no. under review — stay online; it becomes permanent once approved";
        }
    }

    public get 该订单号核对未通过() {
        switch (this.lang) {
            case "zh_CN": return "该订单号核对未通过，可换一单重新填写或改用兑换码";
            case "es_ES": return "Este número de pedido fue rechazado. Pruebe con otro pedido o use un código de canje";
            case "fr_FR": return "Ce numéro de commande a été refusé. Essayez une autre commande ou utilisez un code d'échange";
            case "ja_JP": return "この注文番号は承認されませんでした。別の注文番号をお試しくださるか、引き換えコードをご利用ください";
            case "zh_CHT": return "該訂單號核對未通過，可換一單重新填寫或改用兌換碼";
            case "it_IT": return "Questo numero d'ordine è stato rifiutato. Prova con un altro ordine o usa un codice di riscatto";
            case "de_DE": return "Diese Bestellnummer wurde abgelehnt. Versuchen Sie eine andere Bestellung oder verwenden Sie einen Einlösungscode";
            case "he_IL": return "מספר הזמנה זה נדחה. נסו הזמנה אחרת או השתמשו בקוד המימוש";
            case "ru_RU": return "Этот номер заказа отклонён. Попробуйте другой заказ или используйте код активации";
            case "pl_PL": return "Ten numer zamówienia został odrzucony. Spróbuj innego zamówienia lub użyj kodu wymiany";
            case "en_US":
            default: return "This order no. was declined. Try another order or use a redeem code";
        }
    }

    public get 已失去订单号激活方式() {
        switch (this.lang) {
            case "zh_CN": return "多次填报不实，已失去订单号激活方式，请使用兑换码或联系卖家";
            case "es_ES": return "Activación por número de pedido deshabilitada tras declaraciones falsas reiteradas. Use un código de canje o contacte con el vendedor";
            case "fr_FR": return "Activation par numéro de commande désactivée après fausses déclarations répétées. Utilisez un code d'échange ou contactez le vendeur";
            case "ja_JP": return "虚偽申告が続いたため、注文番号によるアクティベーションは利用できなくなりました。引き換えコードをご利用いただくか、出品者へご連絡ください";
            case "zh_CHT": return "多次填報不實，已失去訂單號激活方式，請使用兌換碼或聯繫賣家";
            case "it_IT": return "Attivazione tramite numero d'ordine disabilitata dopo dichiarazioni false ripetute. Usa un codice di riscatto o contatta il venditore";
            case "de_DE": return "Aktivierung per Bestellnummer nach wiederholt falschen Angaben deaktiviert. Verwenden Sie einen Einlösungscode oder kontaktieren Sie den Verkäufer";
            case "he_IL": return "הפעלה במספר הזמנה בוטלה לאחר דיווחים כוזבים חוזרים. השתמשו בקוד המימוש או פנו למוכר";
            case "ru_RU": return "Возможность активации по номеру заказа утрачена после недостоверных данных. Используйте код активации или свяжитесь с продавцом";
            case "pl_PL": return "Aktywacja numerem zamówienia wyłączona po fałszywych zgłoszeniach. Użyj kodu wymiany lub skontaktuj się ze sprzedawcą";
            case "en_US":
            default: return "Order no. activation disabled after false claims. Use a redeem code or contact the seller";
        }
    }

    public get 订单号通道已关闭() {
        switch (this.lang) {
            case "zh_CN": return "订单号激活方式已被关闭，请使用兑换码";
            case "es_ES": return "La activación por número de pedido está deshabilitada. Use un código de canje";
            case "fr_FR": return "L'activation par numéro de commande est désactivée. Utilisez un code d'échange";
            case "ja_JP": return "注文番号によるアクティベーションは現在使用できません。引き換えコードをご利用ください";
            case "zh_CHT": return "訂單號激活方式已被關閉，請使用兌換碼";
            case "it_IT": return "L'attivazione tramite numero d'ordine è disabilitata. Usa un codice di riscatto";
            case "de_DE": return "Die Aktivierung per Bestellnummer ist deaktiviert. Bitte verwenden Sie einen Einlösungscode";
            case "he_IL": return "ערוץ מספר ההזמנה סגור. השתמשו בקוד המימוש";
            case "ru_RU": return "Активация по номеру заказа отключена. Пожалуйста, используйте код активации";
            case "pl_PL": return "Aktywacja numerem zamówienia jest wyłączona. Użyj kodu wymiany";
            case "en_US":
            default: return "Order no. activation is disabled. Please use a redeem code";
        }
    }

    public get 订单号格式不正确() {
        switch (this.lang) {
            case "zh_CN": return "订单号格式不正确（15~20 位数字）";
            case "es_ES": return "Número de pedido no válido (15-20 dígitos)";
            case "fr_FR": return "Numéro de commande invalide (15-20 chiffres)";
            case "ja_JP": return "注文番号の形式が正しくありません（15〜20桁の数字）";
            case "zh_CHT": return "訂單號格式不正確（15~20 位數字）";
            case "it_IT": return "Numero d'ordine non valido (15-20 cifre)";
            case "de_DE": return "Ungültige Bestellnummer (15-20 Ziffern)";
            case "he_IL": return "מספר הזמנה בפורמט שגוי (15-20 ספרות)";
            case "ru_RU": return "Неверный формат номера заказа (15-20 цифр)";
            case "pl_PL": return "Nieprawidłowy numer zamówienia (15-20 cyfr)";
            case "en_US":
            default: return "Invalid order no. (15-20 digits)";
        }
    }

    public get 申报失败请稍后重试() {
        switch (this.lang) {
            case "zh_CN": return "提交失败，请稍后重试";
            case "es_ES": return "Error al enviar, reintente más tarde";
            case "fr_FR": return "Échec de l'envoi, réessayez plus tard";
            case "ja_JP": return "送信に失敗しました。しばらくしてからもう一度お試しください";
            case "zh_CHT": return "提交失敗，請稍後重試";
            case "it_IT": return "Invio non riuscito, riprova più tardi";
            case "de_DE": return "Übermittlung fehlgeschlagen, bitte später erneut versuchen";
            case "he_IL": return "השליחה נכשלה, נסו שוב מאוחר יותר";
            case "ru_RU": return "Не удалось отправить, повторите позже";
            case "pl_PL": return "Wysyłka nie powiodła się, spróbuj ponownie później";
            case "en_US":
            default: return "Submission failed, please retry later";
        }
    }

    public get 订单号已取消可重新填写() {
        switch (this.lang) {
            case "zh_CN": return "该订单号申报已取消，可重新填写或改用兑换码";
            case "es_ES": return "Esta solicitud de pedido fue cancelada. Vuelva a rellenarla o use un código de canje";
            case "fr_FR": return "Cette déclaration de commande a été annulée. Remplissez à nouveau ou utilisez un code d'échange";
            case "ja_JP": return "この注文番号の申告は取り消されました。再度ご入力いただくか、引き換えコードをご利用ください";
            case "zh_CHT": return "該訂單號申報已取消，可重新填寫或改用兌換碼";
            case "it_IT": return "Questa richiesta d'ordine è stata annullata. Compilala di nuovo o usa un codice di riscatto";
            case "de_DE": return "Diese Bestellangabe wurde storniert. Füllen Sie sie erneut aus oder verwenden Sie einen Einlösungscode";
            case "he_IL": return "הגשת מספר ההזמנה הזה בוטלה. מלאו מחדש או השתמשו בקוד המימוש";
            case "ru_RU": return "Эта заявка по номеру заказа отменена. Заполните заново или используйте код активации";
            case "pl_PL": return "To zgłoszenie zamówienia zostało anulowane. Wypełnij ponownie lub użyj kodu wymiany";
            case "en_US":
            default: return "This order claim was cancelled. Refill or use a redeem code";
        }
    }

    public get 提交成功已临时解锁() {
        switch (this.lang) {
            case "zh_CN": return "提交成功，已临时解锁——人工核对通过后转为永久授权，请保持联网";
            case "es_ES": return "Enviado y desbloqueado temporalmente — manténgase conectado; permanente una vez aprobado";
            case "fr_FR": return "Envoyé et déverrouillé temporairement — restez connecté ; permanent une fois approuvé";
            case "ja_JP": return "送信が完了し、一時的に解放されました——引き続きオンラインのままお待ちください。承認後に永久化します";
            case "zh_CHT": return "提交成功，已臨時解鎖——人工核對通過後轉為永久授權，請保持聯網";
            case "it_IT": return "Inviato e sbloccato temporaneamente — resta connesso; permanente dopo l'approvazione";
            case "de_DE": return "Übermittelt und vorübergehend freigeschaltet — bleiben Sie online; dauerhaft nach Freigabe";
            case "he_IL": return "נשלח ושוחרר זמנית — הישארו מחוברים; הופך לקבוע לאחר אישור";
            case "ru_RU": return "Отправлено и временно разблокировано — оставайтесь онлайн; станет постоянным после одобрения";
            case "pl_PL": return "Wysłano i tymczasowo odblokowano — pozostań online; trwałe po zatwierdzeniu";
            case "en_US":
            default: return "Submitted and temporarily unlocked — stay online; permanent once approved";
        }
    }

    // ── need-0926-18 速记间隔「时间计算模式」开关 + 手动重算命令 ──────────────────
    public get 速记间隔计算模式() {
        switch (this.lang) {
            case "zh_CN": return "速记间隔计算模式";
            case "zh_CHT": return "速記間隔計算模式";
            case "en_US":
            default: return "Idea interval mode";
        }
    }

    public get 间隔模式开始() {
        switch (this.lang) {
            case "zh_CN": return "开始模式（间隔记在较早一条，默认）";
            case "zh_CHT": return "開始模式（間隔記在較早一條，預設）";
            case "en_US":
            default: return "Start (interval on the earlier entry, default)";
        }
    }

    public get 间隔模式结束() {
        switch (this.lang) {
            case "zh_CN": return "结束模式（间隔记在较晚一条）";
            case "zh_CHT": return "結束模式（間隔記在較晚一條）";
            case "en_US":
            default: return "End (interval on the later entry)";
        }
    }

    public get 间隔模式说明() {
        switch (this.lang) {
            case "zh_CN": return "开始模式：算「本条到下一条」的间隔、记在本条身上（默认，与旧版一致，最新一条恒无间隔）；结束模式：算「上一条到本条」的间隔、记在本条身上（最早一条无间隔）。间隔都在条目行尾显示；切换保存后自动重算当天日记";
            case "zh_CHT": return "開始模式：算「本條到下一條」的間隔、記在本條身上（預設，與舊版一致，最新一條恆無間隔）；結束模式：算「上一條到本條」的間隔、記在本條身上（最早一條無間隔）。間隔都在條目行尾顯示；切換儲存後自動重算當天日記";
            case "en_US":
            default: return "Start: interval to the next entry, kept on this entry (default, same as before; the newest entry never has one); End: interval since the previous entry, kept on this entry (the oldest entry has none). Intervals always show at the end of the row; saving a switch recalculates today's diary";
        }
    }

    public get 重算速记间隔() {
        switch (this.lang) {
            case "zh_CN": return "重算速记间隔";
            case "zh_CHT": return "重算速記間隔";
            case "en_US":
            default: return "Recalculate idea intervals";
        }
    }

    public get 已重算速记间隔() {
        switch (this.lang) {
            case "zh_CN": return "已重算速记间隔";
            case "zh_CHT": return "已重算速記間隔";
            case "en_US":
            default: return "Idea intervals recalculated";
        }
    }

    public get 当前文档不是日记() {
        switch (this.lang) {
            case "zh_CN": return "当前文档不是日记，请在日记文档中重算";
            case "zh_CHT": return "當前文檔不是日記，請在日記文檔中重算";
            case "en_US":
            default: return "Current document is not a daily note; recalculate inside a daily note";
        }
    }

    // need-0926-16：移动端拍照闪念 Dialog 全屏切换钮 aria-label 两态
    public get 进入全屏() {
        switch (this.lang) {
            case "zh_CN": return "进入全屏";
            case "zh_CHT": return "進入全屏";
            case "en_US":
            default: return "Enter fullscreen";
        }
    }

    public get 退出全屏() {
        switch (this.lang) {
            case "zh_CN": return "退出全屏";
            case "zh_CHT": return "退出全屏";
            case "en_US":
            default: return "Exit fullscreen";
        }
    }
}
