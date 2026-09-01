import { TomatoI18nABC2 } from "./text2";

export abstract class TomatoI18nABC extends TomatoI18nABC2 {

    public get 复制ID() {
        switch (this.lang) {
            case "zh_CN": return "复制ID";
            case "es_ES": return "Copiar ID";
            case "fr_FR": return "Copier l'ID";
            case "ja_JP": return "IDをコピー";
            case "zh_CHT": return "複製ID";
            case "it_IT": return "Copia ID";
            case "de_DE": return "ID kopieren";
            case "he_IL": return "העתקת מזהה";
            case "ru_RU": return "Скопировать ID";
            case "pl_PL": return "Skopiuj ID";
            case "en_US":
            default: return "Copy ID";
        }
    }

    public get 兑换码或激活码() {
        switch (this.lang) {
            case "zh_CN": return "兑换码 / 激活码";
            case "es_ES": return "Código de canje / Código de activación";
            case "fr_FR": return "Code d'échange / Code d'activation";
            case "ja_JP": return "引き換えコード / アクティベーションコード";
            case "zh_CHT": return "兌換碼 / 激活碼";
            case "it_IT": return "Codice di riscatto / Codice di attivazione";
            case "de_DE": return "Einlösungscode / Aktivierungscode";
            case "he_IL": return "קוד מימוש / קוד הפעלה";
            case "ru_RU": return "Код обмена / Код активации";
            case "pl_PL": return "Kod do wymiany / Kod aktywacyjny";
            case "en_US":
            default: return "Redeem code / Activation code";
        }
    }

    public get 粘贴兑换码或激活码() {
        switch (this.lang) {
            case "zh_CN": return "粘贴兑换码 / 激活码（可整段粘贴消息，自动识别）";
            case "es_ES": return "Pegue el código de canje / activación (puede pegar el mensaje completo, se detecta automáticamente)";
            case "fr_FR": return "Collez le code d'échange / d'activation (message entier accepté, détection automatique)";
            case "ja_JP": return "引き換えコード / アクティベーションコードを貼り付け（メッセージ全体をそのまま貼り付け可、自動識別）";
            case "zh_CHT": return "貼上兌換碼 / 激活碼（可整段貼上訊息，自動識別）";
            case "it_IT": return "Incolla il codice di riscatto / attivazione (puoi incollare l'intero messaggio, riconoscimento automatico)";
            case "de_DE": return "Einlösungs- / Aktivierungscode einfügen (ganze Nachricht möglich, automatische Erkennung)";
            case "he_IL": return "הדבק קוד מימוש / הפעלה (אפשר להדביק את ההודעה כולה, זיהוי אוטומטי)";
            case "ru_RU": return "Вставьте код обмена / активации (можно вставить всё сообщение целиком, распознаётся автоматически)";
            case "pl_PL": return "Wklej kod do wymiany / aktywacyjny (można wkleić całą wiadomość, rozpoznawanie automatyczne)";
            case "en_US":
            default: return "Paste redeem code / activation code (whole message OK, auto-detected)";
        }
    }

    public get 淘宝购买() {
        switch (this.lang) {
            case "zh_CN": return "淘宝购买";
            case "es_ES": return "Comprar en Taobao";
            case "fr_FR": return "Acheter sur Taobao";
            case "ja_JP": return "淘寶（Taobao）で購入";
            case "zh_CHT": return "淘寶購買";
            case "it_IT": return "Acquista su Taobao";
            case "de_DE": return "Auf Taobao kaufen";
            case "he_IL": return "רכישה ב-Taobao";
            case "ru_RU": return "Купить на Taobao";
            case "pl_PL": return "Kup na Taobao";
            case "en_US":
            default: return "Buy on Taobao";
        }
    }

    public get 去淘宝购买() {
        switch (this.lang) {
            case "zh_CN": return "去淘宝购买";
            case "es_ES": return "Ir a Taobao";
            case "fr_FR": return "Aller sur Taobao";
            case "ja_JP": return "淘寶へ移動して購入";
            case "zh_CHT": return "去淘寶購買";
            case "it_IT": return "Vai su Taobao";
            case "de_DE": return "Zu Taobao gehen";
            case "he_IL": return "עבור אל Taobao";
            case "ru_RU": return "Перейти на Taobao";
            case "pl_PL": return "Przejdź na Taobao";
            case "en_US":
            default: return "Go to Taobao";
        }
    }

    public get 拍下后客服发兑换码回来在这里粘贴激活() {
        switch (this.lang) {
            case "zh_CN": return "拍下后客服发兑换码，回来在这里粘贴激活";
            case "es_ES": return "Tras el pedido, atención al cliente le envía un código de canje; péguelo aquí para activar";
            case "fr_FR": return "Après la commande, le service client vous envoie un code d'échange ; collez-le ici pour activer";
            case "ja_JP": return "注文後、カスタマーサポートから引き換えコードが届きます。ここに貼り付けてアクティベートしてください";
            case "zh_CHT": return "下單後客服發兌換碼，回來在這裡貼上激活";
            case "it_IT": return "Dopo l'ordine, il servizio clienti ti invia un codice di riscatto: incollalo qui per attivare";
            case "de_DE": return "Nach der Bestellung sendet der Kundendienst einen Einlösungscode — hier einfügen zum Aktivieren";
            case "he_IL": return "לאחר ההזמנה שירות הלקוחות ישלח קוד מימוש — הדבק אותו כאן להפעלה";
            case "ru_RU": return "После заказа служба поддержки пришлёт код обмена — вставьте его здесь для активации";
            case "pl_PL": return "Po zamówieniu obsługa klienta wyśle kod do wymiany — wklej go tutaj, aby aktywować";
            case "en_US":
            default: return "After ordering, customer service sends you a redeem code — paste it here to activate";
        }
    }

    // 购买弹窗价格指引（2026-08-25 SKU 直达后配套）：{price} 由 BuyTomato 按产品价格表
    // 插值（tomato/progressive 72、recite 10），各语种语序自由
    public get 拍下价格档兑换码收码后回设置页粘贴激活() {
        switch (this.lang) {
            case "zh_CN": return "拍下 ￥{price} 档兑换码，客服发码后回到设置页粘贴到激活框即可";
            case "es_ES": return "Compre el código de canje de ￥{price}; tras recibirlo del atención al cliente, péguelo en el cuadro de activación de la página de ajustes";
            case "fr_FR": return "Achetez le code d'échange à ￥{price} ; après réception du service client, collez-le dans le champ d'activation de la page des paramètres";
            case "ja_JP": return "￥{price} の引き換えコードをご注文ください。コードが届いたら、設定ページのアクティベート入力欄に貼り付けてください";
            case "zh_CHT": return "拍下 ￥{price} 檔兌換碼，客服發碼後回到設定頁貼到激活框即可";
            case "it_IT": return "Acquisti il codice di riscatto da ￥{price}; ricevuto dal servizio clienti, lo incolli nel campo di attivazione della pagina delle impostazioni";
            case "de_DE": return "Bestellen Sie den ￥{price}-Einlösungscode; nach Erhalt vom Kundendienst fügen Sie ihn im Aktivierungsfeld der Einstellungsseite ein";
            case "he_IL": return "הזמינו את קוד המימוש ב-￥{price}; לאחר שתקבלו אותו משירות הלקוחות, הדביקו אותו בשדה ההפעלה בעמוד ההגדרות";
            case "ru_RU": return "Закажите код активации за ￥{price}; получив его от службы поддержки, вставьте в поле активации на странице настроек";
            case "pl_PL": return "Zamów kod wymiany za ￥{price}; po otrzymaniu od obsługi klienta wklej go w pole aktywacji na stronie ustawień";
            case "en_US":
            default: return "Order the ￥{price} redemption code; once customer service sends it, paste it into the activation box on the settings page";
        }
    }

    // 云端参数级错误兜底（2026-08-25「找回激活码显示 Bad Parameter」实测）：plugin 枚举
    // 云端滞后时返回 bad params 原文，对用户无意义——映射为版本提示
    public get 参数不被支持请更新插件重试() {
        switch (this.lang) {
            case "zh_CN": return "请求参数不被支持，请更新插件到最新版本后重试";
            case "es_ES": return "Parámetro no admitido; actualice el plugin a la última versión e inténtelo de nuevo";
            case "fr_FR": return "Paramètre non pris en charge ; mettez le plugin à jour puis réessayez";
            case "ja_JP": return "パラメータがサポートされていません。プラグインを最新版に更新して再試行してください";
            case "zh_CHT": return "請求參數不被支持，請更新插件到最新版本後重試";
            case "it_IT": return "Parametro non supportato; aggiorna il plugin all'ultima versione e riprova";
            case "de_DE": return "Parameter nicht unterstützt — aktualisieren Sie das Plugin und versuchen Sie es erneut";
            case "he_IL": return "פרמטר לא נתמך; עדכנו את התוסף לגרסה האחרונה ונסו שוב";
            case "ru_RU": return "Параметр не поддерживается — обновите плагин до последней версии и повторите";
            case "pl_PL": return "Parametr nieobsługiwany; zaktualizuj wtyczkę do najnowszej wersji i spróbuj ponownie";
            case "en_US":
            default: return "Request parameter not supported — please update the plugin to the latest version and retry";
        }
    }

    public get 未识别到兑换码或激活码() {
        switch (this.lang) {
            case "zh_CN": return "未识别到兑换码或激活码";
            case "es_ES": return "No se detectó ningún código de canje o activación";
            case "fr_FR": return "Aucun code d'échange ou d'activation détecté";
            case "ja_JP": return "引き換えコードまたはアクティベーションコードが認識されませんでした";
            case "zh_CHT": return "未識別到兌換碼或激活碼";
            case "it_IT": return "Nessun codice di riscatto o attivazione rilevato";
            case "de_DE": return "Kein Einlösungs- oder Aktivierungscode erkannt";
            case "he_IL": return "לא זוהה קוד מימוש או הפעלה";
            case "ru_RU": return "Код обмена или активации не распознан";
            case "pl_PL": return "Nie wykryto kodu do wymiany ani aktywacyjnego";
            case "en_US":
            default: return "No redeem code or activation code detected";
        }
    }

    public get 兑换成功正在激活() {
        switch (this.lang) {
            case "zh_CN": return "兑换成功，正在激活";
            case "es_ES": return "Canjeado con éxito, activando";
            case "fr_FR": return "Échangé avec succès, activation en cours";
            case "ja_JP": return "引換に成功しました。アクティベート中です";
            case "zh_CHT": return "兌換成功，正在激活";
            case "it_IT": return "Riscattato con successo, attivazione in corso";
            case "de_DE": return "Erfolgreich eingelöst, Aktivierung läuft";
            case "he_IL": return "המימוש בוצע בהצלחה, מבצע הפעלה";
            case "ru_RU": return "Код успешно активирован, выполняется включение";
            case "pl_PL": return "Wymieniono pomyślnie, trwa aktywacja";
            case "en_US":
            default: return "Redeemed successfully, activating";
        }
    }
    public get 兑换失败() {
        switch (this.lang) {
            case "zh_CN": return "兑换失败";
            case "es_ES": return "Error al canjear";
            case "fr_FR": return "Échec de l'échange";
            case "ja_JP": return "引換に失敗しました";
            case "zh_CHT": return "兌換失敗";
            case "it_IT": return "Riscatto non riuscito";
            case "de_DE": return "Einlösung fehlgeschlagen";
            case "he_IL": return "המימוש נכשל";
            case "ru_RU": return "Не удалось активировать код";
            case "pl_PL": return "Wymiana nie powiodła się";
            case "en_US":
            default: return "Redeem failed";
        }
    }
    public get 兑换失败请检查网络后重试() {
        switch (this.lang) {
            case "zh_CN": return "兑换失败，请检查网络后重试";
            case "es_ES": return "Error al canjear, compruebe la red e inténtelo de nuevo";
            case "fr_FR": return "Échec de l'échange, vérifiez le réseau et réessayez";
            case "ja_JP": return "引換に失敗しました。ネットワークを確認して再試行してください";
            case "zh_CHT": return "兌換失敗，請檢查網絡後重試";
            case "it_IT": return "Riscatto non riuscito, controlla la rete e riprova";
            case "de_DE": return "Einlösung fehlgeschlagen, bitte Netzwerk prüfen und erneut versuchen";
            case "he_IL": return "המימוש נכשל, בדוק את הרשת ונסה שוב";
            case "ru_RU": return "Не удалось активировать код, проверьте сеть и повторите попытку";
            case "pl_PL": return "Wymiana nie powiodła się, sprawdź sieć i spróbuj ponownie";
            case "en_US":
            default: return "Redeem failed, please check network and retry";
        }
    }
    public get 激活码已备份云端无需找回() {
        switch (this.lang) {
            case "zh_CN": return "激活码已备份云端，无需找回";
            case "es_ES": return "El código de activación ya está respaldado en la nube, no es necesario recuperarlo";
            case "fr_FR": return "Le code d'activation est déjà sauvegardé dans le cloud, inutile de le récupérer";
            case "ja_JP": return "アクティベーションコードはクラウドにバックアップ済みのため、復元は不要です";
            case "zh_CHT": return "激活碼已備份雲端，無需找回";
            case "it_IT": return "Il codice di attivazione è già salvato nel cloud, non è necessario recuperarlo";
            case "de_DE": return "Der Aktivierungscode ist bereits in der Cloud gesichert, eine Wiederherstellung ist nicht nötig";
            case "he_IL": return "קוד ההפעלה כבר מגובה בענן, אין צורך לשחזר אותו";
            case "ru_RU": return "Код активации уже сохранён в облаке, восстанавливать его не нужно";
            case "pl_PL": return "Kod aktywacyjny jest już zapisany w chmurze, nie ma potrzeby go odzyskiwać";
            case "en_US":
            default: return "Activation code is already backed up to the cloud, no need to recover";
        }
    }
    public get 激活码已备份到云端() {
        switch (this.lang) {
            case "zh_CN": return "激活码已备份到云端";
            case "es_ES": return "Código de activación respaldado en la nube";
            case "fr_FR": return "Code d'activation sauvegardé dans le cloud";
            case "ja_JP": return "アクティベーションコードをクラウドにバックアップしました";
            case "zh_CHT": return "激活碼已備份到雲端";
            case "it_IT": return "Codice di attivazione salvato nel cloud";
            case "de_DE": return "Aktivierungscode in der Cloud gesichert";
            case "he_IL": return "קוד ההפעלה גובה בענן";
            case "ru_RU": return "Код активации сохранён в облако";
            case "pl_PL": return "Kod aktywacyjny zapisany w chmurze";
            case "en_US":
            default: return "Activation code backed up to the cloud";
        }
    }
    public get 备份激活码失败请检查网络后重试() {
        switch (this.lang) {
            case "zh_CN": return "备份激活码失败，请检查网络后重试";
            case "es_ES": return "Error al respaldar el código de activación, compruebe la red e inténtelo de nuevo";
            case "fr_FR": return "Échec de la sauvegarde du code d'activation, vérifiez le réseau et réessayez";
            case "ja_JP": return "アクティベーションコードのバックアップに失敗しました。ネットワークを確認して再試行してください";
            case "zh_CHT": return "備份激活碼失敗，請檢查網絡後重試";
            case "it_IT": return "Backup del codice di attivazione non riuscito, controlla la rete e riprova";
            case "de_DE": return "Sicherung des Aktivierungscodes fehlgeschlagen, bitte Netzwerk prüfen und erneut versuchen";
            case "he_IL": return "גיבוי קוד ההפעלה נכשל, בדוק את הרשת ונסה שוב";
            case "ru_RU": return "Не удалось сохранить код активации в облако, проверьте сеть и повторите попытку";
            case "pl_PL": return "Nie udało się utworzyć kopii kodu aktywacyjnego, sprawdź sieć i spróbuj ponownie";
            case "en_US":
            default: return "Failed to back up the activation code, please check the network and retry";
        }
    }
    public get 兑换码格式不正确() {
        switch (this.lang) {
            case "zh_CN": return "兑换码格式不正确";
            case "es_ES": return "Formato de código de canje incorrecto";
            case "fr_FR": return "Format du code d'échange incorrect";
            case "ja_JP": return "引換コードの形式が正しくありません";
            case "zh_CHT": return "兌換碼格式不正確";
            case "it_IT": return "Formato del codice di riscatto non valido";
            case "de_DE": return "Format des Einlösungscodes ist ungültig";
            case "he_IL": return "תבנית קוד המימוש שגויה";
            case "ru_RU": return "Неверный формат кода активации";
            case "pl_PL": return "Nieprawidłowy format kodu do wymiany";
            case "en_US":
            default: return "Invalid redeem code format";
        }
    }
    public get 兑换码不存在() {
        switch (this.lang) {
            case "zh_CN": return "兑换码不存在";
            case "es_ES": return "El código de canje no existe";
            case "fr_FR": return "Le code d'échange n'existe pas";
            case "ja_JP": return "引換コードが存在しません";
            case "zh_CHT": return "兌換碼不存在";
            case "it_IT": return "Il codice di riscatto non esiste";
            case "de_DE": return "Einlösungscode existiert nicht";
            case "he_IL": return "קוד המימוש אינו קיים";
            case "ru_RU": return "Код активации не найден";
            case "pl_PL": return "Kod do wymiany nie istnieje";
            case "en_US":
            default: return "Redeem code not found";
        }
    }
    public get 兑换码已被使用() {
        switch (this.lang) {
            case "zh_CN": return "兑换码已被使用";
            case "es_ES": return "El código de canje ya ha sido utilizado";
            case "fr_FR": return "Le code d'échange a déjà été utilisé";
            case "ja_JP": return "引換コードは既に使用されています";
            case "zh_CHT": return "兌換碼已被使用";
            case "it_IT": return "Il codice di riscatto è già stato utilizzato";
            case "de_DE": return "Einlösungscode wurde bereits verwendet";
            case "he_IL": return "קוד המימוש כבר שומש";
            case "ru_RU": return "Код активации уже использован";
            case "pl_PL": return "Kod do wymiany został już wykorzystany";
            case "en_US":
            default: return "Redeem code already used";
        }
    }
    public get 兑换码面值与插件价格不符() {
        switch (this.lang) {
            case "zh_CN": return "兑换码面值与插件价格不符";
            case "es_ES": return "El valor del código de canje no coincide con el precio del plugin";
            case "fr_FR": return "La valeur du code d'échange ne correspond pas au prix du plugin";
            case "ja_JP": return "引換コードの額面がプラグインの価格と一致しません";
            case "zh_CHT": return "兌換碼面值與插件價格不符";
            case "it_IT": return "Il valore del codice di riscatto non corrisponde al prezzo del plugin";
            case "de_DE": return "Der Nennwert des Einlösungscodes stimmt nicht mit dem Plugin-Preis überein";
            case "he_IL": return "ערך קוד המימוש אינו תואם למחיר התוסף";
            case "ru_RU": return "Номинал кода активации не соответствует цене плагина";
            case "pl_PL": return "Nominał kodu nie zgadza się z ceną wtyczki";
            case "en_US":
            default: return "Redeem code value doesn't match plugin price";
        }
    }

    public get 已完成购买正在激活() {
        switch (this.lang) {
            case "zh_CN": return "已获取激活码，正在激活";
            case "es_ES": return "Licencia recibida, activando";
            case "fr_FR": return "Licence reçue, activation en cours";
            case "ja_JP": return "アクティベーションコードを取得しました。アクティベート中です";
            case "zh_CHT": return "已獲取激活碼，正在激活";
            case "it_IT": return "Licenza ricevuta, attivazione in corso";
            case "de_DE": return "Lizenz erhalten, Aktivierung läuft";
            case "he_IL": return "הרישיון התקבל, מבצע הפעלה";
            case "ru_RU": return "Лицензия получена, выполняется активация";
            case "pl_PL": return "Otrzymano licencję, trwa aktywacja";
            case "en_US":
            default: return "License received, activating";
        }
    }
    public get 找回激活码() {
        switch (this.lang) {
            case "zh_CN": return "找回激活码";
            case "es_ES": return "Recuperar licencia";
            case "fr_FR": return "Récupérer la licence";
            case "ja_JP": return "ライセンスを復元";
            case "zh_CHT": return "找回激活碼";
            case "it_IT": return "Recupera licenza";
            case "de_DE": return "Lizenz wiederherstellen";
            case "he_IL": return "שחזור רישיון";
            case "ru_RU": return "Восстановить лицензию";
            case "pl_PL": return "Odzyskaj licencję";
            case "en_US":
            default: return "Recover license";
        }
    }
    public get 未查询到该账号的激活记录() {
        switch (this.lang) {
            case "zh_CN": return "该账号没有云端激活记录（仅兑换码兑换的激活码支持找回）";
            case "es_ES": return "No hay registro de activación en la nube para esta cuenta (solo los códigos canjeados se pueden recuperar)";
            case "fr_FR": return "Aucun enregistrement d'activation dans le cloud pour ce compte (seuls les codes échangés peuvent être récupérés)";
            case "ja_JP": return "このアカウントのクラウドアクティベーション記録がありません（引換コードでアクティベートしたコードのみ復元できます）";
            case "zh_CHT": return "該賬號沒有雲端激活記錄（僅兌換碼兌換的激活碼支持找回）";
            case "it_IT": return "Nessuna attivazione cloud trovata per questo account (solo i codici riscattati possono essere recuperati)";
            case "de_DE": return "Keine Cloud-Aktivierung für dieses Konto gefunden (nur eingelöste Codes können wiederhergestellt werden)";
            case "he_IL": return "לא נמצא רישיון בענן לחשבון זה (ניתן לשחזר רק קודים שנממשו)";
            case "ru_RU": return "Для этой учётной записи нет облачной активации (восстановить можно только коды, активированные обменом)";
            case "pl_PL": return "Brak aktywacji w chmurze dla tego konta (odzyskać można tylko kody wymienione)";
            case "en_US":
            default: return "No cloud activation found for this account (only redeemed codes can be recovered)";
        }
    }
    public get 找回激活码失败请检查网络后重试() {
        switch (this.lang) {
            case "zh_CN": return "找回激活码失败，请检查网络后重试";
            case "es_ES": return "No se pudo recuperar la licencia, compruebe su red y reintente";
            case "fr_FR": return "Échec de la récupération de la licence, vérifiez votre réseau et réessayez";
            case "ja_JP": return "ライセンスの復元に失敗しました。ネットワークを確認して再試行してください";
            case "zh_CHT": return "找回激活碼失敗，請檢查網絡後重試";
            case "it_IT": return "Recupero della licenza non riuscito, controlla la rete e riprova";
            case "de_DE": return "Lizenzwiederherstellung fehlgeschlagen, prüfen Sie Ihr Netzwerk und versuchen Sie es erneut";
            case "he_IL": return "שחזור הרישיון נכשל, בדקו את הרשת ונסו שוב";
            case "ru_RU": return "Не удалось восстановить лицензию, проверьте сеть и повторите попытку";
            case "pl_PL": return "Nie udało się odzyskać licencji, sprawdź sieć i spróbuj ponownie";
            case "en_US":
            default: return "Failed to recover license, check your network and retry";
        }
    }
    public get 跳到当前文档的阅读点() {
        switch (this.lang) {
            case "zh_CN": return "跳到当前文档的阅读点";
            case "es_ES": return "Saltar al punto de lectura del documento actual";
            case "fr_FR": return "Aller au point de lecture du document actuel";
            case "ja_JP": return "現在のドキュメントの読書位置にジャンプ";
            case "zh_CHT": return "跳至當前文檔的閱讀點";
            case "it_IT": return "Vai al punto di lettura del documento corrente";
            case "de_DE": return "Zum Lesezeichen des aktuellen Dokuments springen";
            case "he_IL": return "קפוץ לנקודת הקריאה של המסמך הנוכחי";
            case "ru_RU": return "Перейти к точке чтения текущего документа";
            case "pl_PL": return "Przejdź do punktu odczytu bieżącego dokumentu";
            case "en_US":
            default: return "Jump to current document's reading point";
        }
    }

    public get 删除当前文档的阅读点() {
        switch (this.lang) {
            case "zh_CN": return "删除当前文档的阅读点";
            case "es_ES": return "Eliminar el punto de lectura del documento actual";
            case "fr_FR": return "Supprimer le point de lecture du document actuel";
            case "ja_JP": return "現在のドキュメントの読書位置を削除";
            case "zh_CHT": return "刪除當前文檔的閱讀點";
            case "it_IT": return "Elimina il punto di lettura del documento corrente";
            case "de_DE": return "Lesezeichen des aktuellen Dokuments löschen";
            case "he_IL": return "מחק את נקודת הקריאה של המסמך הנוכחי";
            case "ru_RU": return "Удалить точку чтения текущего документа";
            case "pl_PL": return "Usuń punkt odczytu bieżącego dokumentu";
            case "en_US":
            default: return "Delete current document's reading point";
        }
    }

    public get 查看阅读点() {
        switch (this.lang) {
            case "zh_CN": return "查看阅读点";
            case "es_ES": return "Ver punto de lectura";
            case "fr_FR": return "Voir le point de lecture";
            case "ja_JP": return "読書位置を表示";
            case "zh_CHT": return "查看閱讀點";
            case "it_IT": return "Visualizza punto di lettura";
            case "de_DE": return "Lesezeichen anzeigen";
            case "he_IL": return "הצג נקודת קריאה";
            case "ru_RU": return "Посмотреть точку чтения";
            case "pl_PL": return "Wyświetl punkt odczytu";
            case "en_US":
            default: return "View reading point";
        }
    }

    public get 模糊查找引用() {
        switch (this.lang) {
            case "zh_CN": return "选中文字，模糊查找并插入引用";
            case "es_ES": return "Seleccionar texto, buscar aproximadamente e insertar cita";
            case "fr_FR": return "Sélectionner du texte, effectuer une recherche approximative et insérer une référence";
            case "ja_JP": return "テキストを選択し、曖昧検索して参照を挿入";
            case "zh_CHT": return "選中文字，模糊查找並插入引用";
            case "it_IT": return "Seleziona testo, cerca approssimativamente e inserisci citazione";
            case "de_DE": return "Text auswählen, ungefähre Suche durchführen und Zitat einfügen";
            case "he_IL": return "בחר טקסט, חפש בערך והכנס ציטוט";
            case "ru_RU": return "Выделите текст, выполните приблизительный поиск и вставьте ссылку";
            case "pl_PL": return "Zaznacz tekst, przeszukaj przybliżony i wstaw cytowanie";
            case "en_US":
            default: return "Select text, fuzzy search and insert citation";
        }
    }

    public get 模糊查找链接() {
        switch (this.lang) {
            case "zh_CN": return "选中文字，模糊查找并插入链接";
            case "es_ES": return "Seleccionar texto, buscar aproximadamente e insertar enlace";
            case "fr_FR": return "Sélectionner du texte, effectuer une recherche approximative et insérer un lien";
            case "ja_JP": return "テキストを選択し、曖昧検索してリンクを挿入";
            case "zh_CHT": return "選中文字，模糊查找並插入鏈接";
            case "it_IT": return "Seleziona testo, cerca approssimativamente e inserisci collegamento";
            case "de_DE": return "Text auswählen, ungefähre Suche durchführen und Link einfügen";
            case "he_IL": return "בחר טקסט, חפש בערך והכנס קישור";
            case "ru_RU": return "Выделите текст, выполните приблизительный поиск и вставьте ссылку";
            case "pl_PL": return "Zaznacz tekst, przeszukaj przybliżony i wstaw link";
            case "en_US":
            default: return "Select text, fuzzy search and insert link";
        }
    }

    public get 文本转引用() {
        switch (this.lang) {
            case "zh_CN": return "文本转引用：@@精确转换，@@@模糊转换";
            case "es_ES": return "Texto a cita: @@conversión exacta, @@@conversión aproximada";
            case "fr_FR": return "Texte à référence : @@conversion précise, @@@conversion approximative";
            case "ja_JP": return "テキストを引用に変換：@@正確な変換、@@@曖昧な変換";
            case "zh_CHT": return "文本轉引用：@@精確轉換，@@@模糊轉換";
            case "it_IT": return "Testo a citazione: @@conversione precisa, @@@conversione approssimativa";
            case "de_DE": return "Text in Zitat umwandeln: @@genau, @@@ungefähr";
            case "he_IL": return "המר טקסט לציטוט: @@המרה מדויקת, @@@המרה מקרבת";
            case "ru_RU": return "Преобразование текста в цитату: @@точное преобразование, @@@приблизительное преобразование";
            case "pl_PL": return "Tekst na cytowanie: @@konwersja dokładna, @@@konwersja przybliżona";
            case "en_US":
            default: return "Text to citation: @@exact conversion, @@@fuzzy conversion";
        }
    }

    public get 复习闪卡() {
        switch (this.lang) {
            case "zh_CN": return "复习闪卡";
            case "es_ES": return "Tarjetas de repaso";
            case "fr_FR": return "Fiches d'apprentissage";
            case "ja_JP": return "復習フラッシュカード";
            case "zh_CHT": return "複習閃卡";
            case "it_IT": return "Schede di revisione";
            case "de_DE": return "Lernkarten wiederholen";
            case "he_IL": return "כרטיסי זיכרון לחזרה";
            case "ru_RU": return "Повторяющиеся карточки";
            case "pl_PL": return "Karty powtórkowe";
            case "en_US":
            default: return "Review flashcards";
        }
    }

    public get 刷新虚拟引用() {
        switch (this.lang) {
            case "zh_CN": return "刷新虚拟引用";
            case "es_ES": return "Actualizar referencia virtual";
            case "fr_FR": return "Actualiser la référence virtuelle";
            case "ja_JP": return "仮想参照を更新";
            case "zh_CHT": return "刷新虛擬引用";
            case "it_IT": return "Aggiorna riferimento virtuale";
            case "de_DE": return "Virtuelles Zitat aktualisieren";
            case "he_IL": return "רענן ציטוט וירטואלי";
            case "ru_RU": return "Обновить виртуальную ссылку";
            case "pl_PL": return "Odśwież odniesienie wirtualne";
            case "en_US":
            default: return "Refresh virtual reference";
        }
    }

    public get 突出定位文档() {
        switch (this.lang) {
            case "zh_CN": return "突出定位文档";
            case "es_ES": return "Resaltar y localizar documento";
            case "fr_FR": return "Mettre en évidence et localiser le document";
            case "ja_JP": return "強調して文書を特定";
            case "zh_CHT": return "突出定位文檔";
            case "it_IT": return "Evidenzia e localizza documento";
            case "de_DE": return "Dokument hervorheben und lokalisieren";
            case "he_IL": return "הדגש ומצא את המסמך";
            case "ru_RU": return "Выделить и найти документ";
            case "pl_PL": return "Wyróżnij i zlokalizuj dokument";
            case "en_US":
            default: return "Highlight and locate document";
        }
    }

    public get 渐进阅读摘抄模式() {
        switch (this.lang) {
            case "zh_CN": return "渐进阅读(摘抄模式)";
            case "es_ES": return "Lectura progresiva (modo extracto)";
            case "fr_FR": return "Lecture progressive (mode extrait)";
            case "ja_JP": return "段階的読書（抜粋モード）";
            case "zh_CHT": return "漸進閱讀（摘抄模式）";
            case "it_IT": return "Lettura progressiva (modalità estratto)";
            case "de_DE": return "Progressives Lesen (Auszugmodus)";
            case "he_IL": return "קריאה מקדמת (מצב תמצית)";
            case "ru_RU": return "Постепенное чтение (режим выписки)";
            case "pl_PL": return "Czytanie postępowe (tryb cytatów)";
            case "en_US":
            default: return "Incremental reading (excerpt mode)";
        }
    }

    public get 提取笔记() {
        switch (this.lang) {
            case "zh_CN": return "提取笔记";
            case "es_ES": return "Extraer nota";
            case "fr_FR": return "Extraire la note";
            case "ja_JP": return "ノートを抽出";
            case "zh_CHT": return "提取筆記";
            case "it_IT": return "Estrai la nota";
            case "de_DE": return "Notiz extrahieren";
            case "he_IL": return "влек שים לב";
            case "ru_RU": return "Извлечь заметку";
            case "pl_PL": return "Wyodrębnij notatkę";
            case "en_US":
            default: return "Extract note";
        }
    }

    public get 对比原文() {
        switch (this.lang) {
            case "zh_CN": return "对比原文";
            case "es_ES": return "Comparar con el original";
            case "fr_FR": return "Comparer avec l'original";
            case "ja_JP": return "原文と比較";
            case "zh_CHT": return "對比原文";
            case "it_IT": return "Confronta con l'originale";
            case "de_DE": return "Mit Original vergleichen";
            case "he_IL": return "השווה למקור";
            case "ru_RU": return "Сравнить с оригиналом";
            case "pl_PL": return "Porównaj z oryginałem";
            case "en_US":
            default: return "Compare with original";
        }
    }

    public get 双向互链选择块() {
        switch (this.lang) {
            case "zh_CN": return "双向互链：选择块";
            case "es_ES": return "Enlace bidireccional: Seleccionar bloque";
            case "fr_FR": return "Lien bidirectionnel : Sélectionner le bloc";
            case "ja_JP": return "双方向リンク：ブロックを選択";
            case "zh_CHT": return "雙向互鏈：選擇塊";
            case "it_IT": return "Link bidirezionale: Seleziona blocco";
            case "de_DE": return "Bidirektionaler Link: Block auswählen";
            case "he_IL": return "קישור דו כיווני: בחר בלוק";
            case "ru_RU": return "Двусторонняя ссылка: выбрать блок";
            case "pl_PL": return "Dwukierunkowe łącze: Wybierz blok";
            case "en_US":
            default: return "Bidirectional Link: Select Block";
        }
    }

    public get 双向互链创建往返链() {
        switch (this.lang) {
            case "zh_CN": return "双向互链：创建往返链";
            case "es_ES": return "Enlace bidireccional: Crear enlace de ida y vuelta";
            case "fr_FR": return "Lien bidirectionnel : Créer un lien aller-retour";
            case "ja_JP": return "双方向リンク：往復リンクを作成";
            case "zh_CHT": return "雙向互鏈：創建往返鏈";
            case "it_IT": return "Link bidirezionale: Crea collegamento di andata e ritorno";
            case "de_DE": return "Bidirektionaler Link: Hin- und Rückverknüpfung erstellen";
            case "he_IL": return "קישור דו כיווני: צור קישור הלוך ושוב";
            case "ru_RU": return "Двусторонняя ссылка: Создать двусторонний линк";
            case "pl_PL": return "Dwukierunkowe łącze: Utwórz połączenie w przód i w tył";
            case "en_US":
            default: return "Bidirectional Link: Create Back-and-Forth Link";
        }
    }

    public get 取消勾选当前文档所有已完成的todo任务() {
        switch (this.lang) {
            case "zh_CN": return "取消勾选当前文档所有已完成的todo任务";
            case "es_ES": return "Desmarcar todas las tareas completadas en el documento actual";
            case "fr_FR": return "Décocher toutes les tâches terminées dans le document actuel";
            case "ja_JP": return "現在のドキュメント内の完了したすべてのTODOタスクのチェックを外す";
            case "zh_CHT": return "取消勾選目前文件中所有已完成的待辦事項";
            case "it_IT": return "Deseleziona tutte le attività completate nel documento corrente";
            case "de_DE": return "Alle abgeschlossenen Aufgaben im aktuellen Dokument abwählen";
            case "he_IL": return "בטל את סימון כל המשימות שהושלמו במסמך הנוכחי";
            case "ru_RU": return "Снять отметки с завершенных задач в текущем документе";
            case "pl_PL": return "Odznacz wszystkie ukończone zadania w bieżącym dokumencie";
            case "en_US":
            default: return "Uncheck all completed todo tasks in the current document";
        }
    }

    public get 删除当前文档所有已完成的todo任务() {
        switch (this.lang) {
            case "zh_CN": return "删除当前文档所有已完成的todo任务";
            case "es_ES": return "Eliminar todas las tareas completadas en el documento actual";
            case "fr_FR": return "Supprimer toutes les tâches terminées dans le document actuel";
            case "ja_JP": return "現在のドキュメント内の完了したすべてのTODOタスクを削除";
            case "zh_CHT": return "刪除目前文件中所有已完成的待辦事項";
            case "it_IT": return "Elimina tutte le attività completate nel documento corrente";
            case "de_DE": return "Alle abgeschlossenen Aufgaben im aktuellen Dokument löschen";
            case "he_IL": return "מחק את כל המשימות שהושלמו במסמך הנוכחי";
            case "ru_RU": return "Удалить все завершенные задачи в текущем документе";
            case "pl_PL": return "Usuń wszystkie ukończone zadania w bieżącym dokumencie";
            case "en_US":
            default: return "Delete all completed todo tasks in the current document";
        }
    }

    public get 跳转到剪贴板中ID的块() {
        switch (this.lang) {
            case "zh_CN": return "跳转到剪贴板中ID的块";
            case "es_ES": return "Ir al bloque con el ID del portapapeles";
            case "fr_FR": return "Aller au bloc avec l'ID du presse-papiers";
            case "ja_JP": return "クリップボード内のIDに該当するブロックへ移動";
            case "zh_CHT": return "跳轉到剪貼簿中ID的塊";
            case "it_IT": return "Vai al blocco con l'ID negli appunti";
            case "de_DE": return "Gehe zum Block mit der ID aus der Zwischenablage";
            case "he_IL": return "מעבר לבלוק עם ה-ID מהלוח";
            case "ru_RU": return "Перейти к блоку с ID из буфера обмена";
            case "pl_PL": return "Przejdź do bloku z ID ze schowka";
            case "en_US":
            default: return "Jump to block with ID in clipboard";
        }
    }

    public get 添加一个flag书签() {
        switch (this.lang) {
            case "zh_CN": return "添加一个🚩书签";
            case "es_ES": return "Agregar un 🚩 marcador";
            case "fr_FR": return "Ajouter un signet 🚩";
            case "ja_JP": return "🚩しおりを追加";
            case "zh_CHT": return "新增一個🚩書籤";
            case "it_IT": return "Aggiungi un segnalibro 🚩";
            case "de_DE": return "Füge ein 🚩 Lesezeichen hinzu";
            case "he_IL": return "הוסף סימנייה 🚩";
            case "ru_RU": return "Добавить закладку 🚩";
            case "pl_PL": return "Dodaj zakładkę 🚩";
            case "en_US":
            default: return "Add a 🚩 bookmark";
        }
    }

    public get 删除所有flag书签() {
        switch (this.lang) {
            case "zh_CN": return "删除所有🚩书签";
            case "es_ES": return "Eliminar todos los marcadores 🚩";
            case "fr_FR": return "Supprimer tous les signets 🚩";
            case "ja_JP": return "🚩しおりをすべて削除";
            case "zh_CHT": return "刪除所有🚩書籤";
            case "it_IT": return "Rimuovi tutti i segnalibri 🚩";
            case "de_DE": return "Alle 🚩 Lesezeichen entfernen";
            case "he_IL": return "מחק את כל הסימניות 🚩";
            case "ru_RU": return "Удалить все закладки 🚩";
            case "pl_PL": return "Usuń wszystkie zakładki 🚩";
            case "en_US":
            default: return "Remove all 🚩 bookmarks";
        }
    }

    public get 杂项许多小功能() {
        switch (this.lang) {
            case "zh_CN": return "杂项：许多小功能";
            case "es_ES": return "Miscelánea: Muchas pequeñas funciones";
            case "fr_FR": return "Divers : Plein de petites fonctionnalités";
            case "ja_JP": return "その他：さまざまな小さな機能";
            case "zh_CHT": return "雜項：許多小功能";
            case "it_IT": return "Varie: Tante piccole funzioni";
            case "de_DE": return "Verschiedenes: Viele kleine Funktionen";
            case "he_IL": return "שונות: פונקציות קטנות רבות";
            case "ru_RU": return "Разное: Множество мелких функций";
            case "pl_PL": return "Różne: Wiele małych funkcji";
            case "en_US":
            default: return "Miscellaneous: Many small features";
        }
    }

    public get 拍照闪念全局() {
        switch (this.lang) {
            case "zh_CN": return "拍照闪念（全局）";
            case "es_ES": return "Captura rápida (global)";
            case "fr_FR": return "Capture mentale (globale)";
            case "ja_JP": return "スナップショット思考（グローバル）";
            case "zh_CHT": return "拍照閃念（全域）";
            case "it_IT": return "Istantanea mentale (globale)";
            case "de_DE": return "Schnappschuss-Gedanke (global)";
            case "he_IL": return "רעיון מהיר (גלובלי)";
            case "ru_RU": return "Моментальная мысль (глобально)";
            case "pl_PL": return "Chwilowy pomysł (globalny)";
            case "en_US":
            default: return "Snapshot Thought (Global)";
        }
    }

    public get 拍照闪念收集图片闪念到() {
        switch (this.lang) {
            case "zh_CN": return "拍照闪念：收集图片闪念到 dailynote";
            case "es_ES": return "Captura rápida: Recopilar imágenes rápidas en dailynote";
            case "fr_FR": return "Capture mentale : Collecter les images mentales dans dailynote";
            case "ja_JP": return "スナップショット思考：画像をdailynoteに収集";
            case "zh_CHT": return "拍照閃念：收集圖片閃念到 dailynote";
            case "it_IT": return "Istantanea mentale: Raccogli immagini mentali in dailynote";
            case "de_DE": return "Schnappschuss-Gedanke: Bilder sammeln in dailynote";
            case "he_IL": return "רעיון מהיר: אסוף תמונות לרעיון ב-dailynote";
            case "ru_RU": return "Моментальная мысль: Собрать картинки в dailynote";
            case "pl_PL": return "Chwilowy pomysł: Zbierz obrazy do dailynote";
            case "en_US":
            default: return "Snapshot Thought: Collect image snapshots into dailynote";
        }
    }

    public get 设置阅读点() {
        switch (this.lang) {
            case "zh_CN": return "设置阅读点";
            case "es_ES": return "Establecer punto de lectura";
            case "fr_FR": return "Définir le point de lecture";
            case "ja_JP": return "読書ポイントを設定";
            case "zh_CHT": return "設定閱讀點";
            case "it_IT": return "Imposta punto di lettura";
            case "de_DE": return "Lesezeichen setzen";
            case "he_IL": return "הגדר נקודת קריאה";
            case "ru_RU": return "Установить точку чтения";
            case "pl_PL": return "Ustaw punkt odczytu";
            case "en_US":
            default: return "Set reading point";
        }
    }
    public get 上一个日志() {
        switch (this.lang) {
            case "zh_CN": return "上一个日志";
            case "es_ES": return "Entrada de registro anterior";
            case "fr_FR": return "Entrée de journal précédente";
            case "ja_JP": return "前のログエントリ";
            case "zh_CHT": return "上一個日誌";
            case "it_IT": return "Voce del registro precedente";
            case "de_DE": return "Vorheriger Tagebucheintrag";
            case "he_IL": return "רשומה קודמת";
            case "ru_RU": return "Предыдущая запись журнала";
            case "pl_PL": return "Poprzednia pozycja dziennika";
            case "en_US":
            default: return "Previous log entry";
        }
    }

    public get 下一个日志() {
        switch (this.lang) {
            case "zh_CN": return "下一个日志";
            case "es_ES": return "Siguiente entrada de registro";
            case "fr_FR": return "Entrée de journal suivante";
            case "ja_JP": return "次のログエントリ";
            case "zh_CHT": return "下一個日誌";
            case "it_IT": return "Voce del registro successiva";
            case "de_DE": return "Nächster Tagebucheintrag";
            case "he_IL": return "רשומה הבאה";
            case "ru_RU": return "Следующая запись журнала";
            case "pl_PL": return "Następna pozycja dziennika";
            case "en_US":
            default: return "Next log entry";
        }
    }

    public get dailynote工具() {
        switch (this.lang) {
            case "zh_CN": return "dailynote工具";
            case "es_ES": return "Herramienta de Nota Diaria";
            case "fr_FR": return "Outil de Note Quotidienne";
            case "ja_JP": return "デイリーノートツール";
            case "zh_CHT": return "每日筆記工具";
            case "it_IT": return "Strumento Daily Note";
            case "de_DE": return "Daily-Note-Werkzeug";
            case "he_IL": return "כלי יומן יומי";
            case "ru_RU": return "Инструмент Ежедневной Записи";
            case "pl_PL": return "Narzędzie Dziennych Notatek";
            case "en_US":
            default: return "Daily Note Tool";
        }
    }

    public get 移动内容到dailynote() {
        switch (this.lang) {
            case "zh_CN": return "移动内容到dailynote";
            case "es_ES": return "Mover contenido a la Nota Diaria";
            case "fr_FR": return "Déplacer le contenu vers la Note Quotidienne";
            case "ja_JP": return "コンテンツをデイリーノートに移動";
            case "zh_CHT": return "移動內容到每日筆記";
            case "it_IT": return "Sposta il contenuto alla Daily Note";
            case "de_DE": return "Inhalt in die Daily Note verschieben";
            case "he_IL": return "העבר תוכן ליומן היומי";
            case "ru_RU": return "Переместить содержимое в Ежедневную Запись";
            case "pl_PL": return "Przenieś zawartość do Dziennych Notatek";
            case "en_US":
            default: return "Move content to Daily Note";
        }
    }

    public get 折叠() {
        switch (this.lang) {
            case "zh_CN": return "超级块、引述块等的折叠";
            case "es_ES": return "Colapsar bloques grandes, citas, etc.";
            case "fr_FR": return "Réduire les blocs volumineux, les citations, etc.";
            case "ja_JP": return "スーパーブロック、引用ブロックなどの折りたたみ";
            case "zh_CHT": return "超級塊、引述塊等的摺疊";
            case "it_IT": return "Ridurre blocchi grandi, citazioni, ecc.";
            case "de_DE": return "Zusammenklappen großer Blöcke, Zitate usw.";
            case "he_IL": return "לסגור בלוקים גדולים, ציטוטים וכו'";
            case "ru_RU": return "Сворачивать большие блоки, цитаты и т.д.";
            case "pl_PL": return "Zwijanie dużych bloków, cytowań itp.";
            case "en_US":
            default: return "Collapse large blocks, quotes, etc.";
        }
    }

    public get 展开() {
        switch (this.lang) {
            case "zh_CN": return "超级块、引述块等的展开";
            case "es_ES": return "Expandir bloques grandes, citas, etc.";
            case "fr_FR": return "Développer les blocs volumineux, les citations, etc.";
            case "ja_JP": return "スーパーブロック、引用ブロックなどの展開";
            case "zh_CHT": return "超級塊、引述塊等的展開";
            case "it_IT": return "Espandi blocchi grandi, citazioni, ecc.";
            case "de_DE": return "Ausklappen großer Blöcke, Zitate usw.";
            case "he_IL": return "לפתוח בלוקים גדולים, ציטוטים וכו'";
            case "ru_RU": return "Развертывать большие блоки, цитаты и т.д.";
            case "pl_PL": return "Rozwijanie dużych bloków, cytowań itp.";
            case "en_US":
            default: return "Expand large blocks, quotes, etc.";
        }
    }

    public get 添加顶栏图标() {
        switch (this.lang) {
            case "zh_CN": return "添加顶栏图标";
            case "es_ES": return "Agregar icono en la barra superior";
            case "fr_FR": return "Ajouter une icône dans la barre supérieure";
            case "ja_JP": return "トップバーにアイコンを追加";
            case "zh_CHT": return "添加頂欄圖標";
            case "it_IT": return "Aggiungi icona nella barra superiore";
            case "de_DE": return "Symbol zur oberen Leiste hinzufügen";
            case "he_IL": return "הוסף סמל לפס העליון";
            case "ru_RU": return "Добавить значок в верхнюю панель";
            case "pl_PL": return "Dodaj ikonę do górnego paska";
            case "en_US":
            default: return "Add icon to top bar";
        }
    }

    public get menu不显示菜单不影响快捷键的使用() {
        switch (this.lang) {
            case "zh_CN": return "不显示菜单，不影响快捷键的使用";
            case "es_ES": return "No muestra el menú, no afecta al uso de atajos";
            case "fr_FR": return "Ne pas afficher le menu, ne perturbe pas l'utilisation des raccourcis";
            case "ja_JP": return "メニューを非表示にしてもショートカットの使用には影響しません";
            case "zh_CHT": return "不顯示菜單，不影響快捷鍵的使用";
            case "it_IT": return "Non mostra il menu, non influisce sull'uso delle scorciatoie";
            case "de_DE": return "Menü wird nicht angezeigt, beeinträchtigt Tastenkombinationen nicht";
            case "he_IL": return "לא מציג תפריט, לא משפיע על השימוש בקיצורי דרך";
            case "ru_RU": return "Меню не отображается, использование горячих клавиш не нарушено";
            case "pl_PL": return "Nie pokazuj menu, nie wpływa na użycie skrótów klawiaturowych";
            case "en_US":
            default: return "Menu not shown, does not affect shortcut usage";
        }
    }

    public get 查看所有同步位置() {
        switch (this.lang) {
            case "zh_CN": return "当前同步块所有副本";
            case "es_ES": return "Ver todas las copias del bloque sincronizado";
            case "fr_FR": return "Voir toutes les copies du bloc synchronisé";
            case "ja_JP": return "同期済みブロックのすべてのコピーを表示";
            case "zh_CHT": return "查看所有同步塊副本";
            case "it_IT": return "Visualizza tutte le copie del blocco sincronizzato";
            case "de_DE": return "Alle Kopien des synchronisierten Blocks anzeigen";
            case "he_IL": return "הצג את כל העותקים של הבלוק המסונכרן";
            case "ru_RU": return "Просмотреть все копии синхронизированного блока";
            case "pl_PL": return "Zobacz wszystkie kopie zsynchronizowanego bloku";
            case "en_US":
            default: return "View all synchronized block copies";
        }
    }

    public get 批量删除大量连续内容块() {
        switch (this.lang) {
            case "zh_CN": return "批量删除大量连续内容块";
            case "es_ES": return "Eliminar en bloque grandes bloques de contenido continuo";
            case "fr_FR": return "Supprimer en masse de grands blocs de contenu continus";
            case "ja_JP": return "一括削除 大量の連続コンテンツブロック";
            case "zh_CHT": return "批量刪除大量連續內容塊";
            case "it_IT": return "Elimina in blocco grandi blocchi di contenuto continui";
            case "de_DE": return "Große zusammenhängende Inhaltsblöcke massenweise löschen";
            case "he_IL": return "מחקайте בלוקים גדולים של תוכן רציף בבת אחת";
            case "ru_RU": return "Массовое удаление больших непрерывных блоков содержимого";
            case "pl_PL": return "Usuń masowo duże ciągłe bloki treści";
            case "en_US":
            default: return "Batch delete large continuous content blocks";
        }
    }

    public get 批量移动大量连续内容块() {
        switch (this.lang) {
            case "zh_CN": return "批量移动大量连续内容块";
            case "es_ES": return "Mover en bloque grandes bloques de contenido continuo";
            case "fr_FR": return "Déplacer en masse de grands blocs de contenu continus";
            case "ja_JP": return "一括移動 大量の連続コンテンツブロック";
            case "zh_CHT": return "批量移動大量連續內容塊";
            case "it_IT": return "Sposta in blocco grandi blocchi di contenuto continui";
            case "de_DE": return "Große zusammenhängende Inhaltsblöcke massenweise verschieben";
            case "he_IL": return "הזזו בלוקים גדולים של תוכן רציף בבת אחת";
            case "ru_RU": return "Массовое перемещение больших непрерывных блоков содержимого";
            case "pl_PL": return "Przenieś masowo duże ciągłe bloki treści";
            case "en_US":
            default: return "Batch move large continuous content blocks";
        }
    }

    public get 批量复制大量连续内容块() {
        switch (this.lang) {
            case "zh_CN": return "批量复制大量连续内容块";
            case "es_ES": return "Copiar en bloque grandes bloques de contenido continuo";
            case "fr_FR": return "Copier en masse de grands blocs de contenu continus";
            case "ja_JP": return "一括コピー 大量の連続コンテンツブロック";
            case "zh_CHT": return "批量複製大量連續內容塊";
            case "it_IT": return "Copia in blocco grandi blocchi di contenuto continui";
            case "de_DE": return "Große zusammenhängende Inhaltsblöcke massenweise kopieren";
            case "he_IL": return "העתקו בלוקים גדולים של תוכן רציף בבת אחת";
            case "ru_RU": return "Массовое копирование больших непрерывных блоков содержимого";
            case "pl_PL": return "Skopiuj masowo duże ciągłe bloki treści";
            case "en_US":
            default: return "Batch copy large continuous content blocks";
        }
    }

    public get 批量删除帮助() {
        switch (this.lang) {
            case "zh_CN": return "批量删除帮助: <h4>请分别用 aacc1 与 aacc2 两行把要处理的内容包裹起来。</h4> <h5>aacc1</h5> <h5>今天有个好天气1!</h5> <h5>今天有个好天气2!</h5> <h5>...</h5> <h5>今天有个好天气3!</h5> <h5>aacc2</h5>";
            case "es_ES": return "<h4>Envuelva el contenido a procesar con dos líneas, una aacc1 y otra aacc2.</h4> <h5>aacc1</h5> <h5>Hoy hace buen tiempo 1!</h5> <h5>Hoy hace buen tiempo 2!</h5> <h5>...</h5> <h5>Hoy hace buen tiempo 3!</h5> <h5>aacc2</h5>";
            case "fr_FR": return "<h4>Veuillez envelopper le contenu à traiter avec deux lignes aacc1 et aacc2.</h4> <h5>aacc1</h5> <h5>Il fait beau aujourd'hui 1 !</h5> <h5>Il fait beau aujourd'hui 2 !</h5> <h5>...</h5> <h5>Il fait beau aujourd'hui 3 !</h5> <h5>aacc2</h5>";
            case "ja_JP": return "<h4>処理する内容をaacc1とaacc2の2行で囲んでください。</h4> <h5>aacc1</h5> <h5>今日は良い天気1！</h5> <h5>今日は良い天気2！</h5> <h5>...</h5> <h5>今日は良い天気3！</h5> <h5>aacc2</h5>";
            case "zh_CHT": return "批量刪除幫助: <h4>請分別用 aacc1 與 aacc2 兩行把要處理的內容包裹起來。</h4> <h5>aacc1</h5> <h5>今天有個好天氣1!</h5> <h5>今天有個好天氣2!</h5> <h5>...</h5> <h5>今天有個好天氣3!</h5> <h5>aacc2</h5>";
            case "it_IT": return "<h4>Involucra il contenuto da elaborare con due righe aacc1 e aacc2.</h4> <h5>aacc1</h5> <h5>C'è una bella giornata oggi 1!</h5> <h5>C'è una bella giornata oggi 2!</h5> <h5>...</h5> <h5>C'è una bella giornata oggi 3!</h5> <h5>aacc2</h5>";
            case "de_DE": return "<h4>Umschließen Sie den zu verarbeitenden Inhalt mit zwei Zeilen aacc1 und aacc2.</h4> <h5>aacc1</h5> <h5>Heute ist schönes Wetter 1!</h5> <h5>Heute ist schönes Wetter 2!</h5> <h5>...</h5> <h5>Heute ist schönes Wetter 3!</h5> <h5>aacc2</h5>";
            case "he_IL": return "<h4>סרגו את התוכן שברצונכם לעבד באמצעות שתי שורות - aacc1 ו-aacc2.</h4> <h5>aacc1</h5> <h5>היום יש מזג אוויר נחמד 1!</h5> <h5>היום יש מזג אוויר נחמד 2!</h5> <h5>...</h5> <h5>היום יש מזג אוויר נחמד 3!</h5> <h5>aacc2</h5>";
            case "ru_RU": return "<h4>Оберните контент, который нужно обработать, двумя строками aacc1 и aacc2.</h4> <h5>aacc1</h5> <h5>Сегодня хорошая погода 1!</h5> <h5>Сегодня хорошая погода 2!</h5> <h5>...</h5> <h5>Сегодня хорошая погода 3!</h5> <h5>aacc2</h5>";
            case "pl_PL": return "<h4>Otocz treść do przetworzenia dwoma liniami aacc1 i aacc2.</h4> <h5>aacc1</h5> <h5>Dzisiaj jest ładna pogoda 1!</h5> <h5>Dzisiaj jest ładna pogoda 2!</h5> <h5>...</h5> <h5>Dzisiaj jest ładna pogoda 3!</h5> <h5>aacc2</h5>";
            case "en_US":
            default: return "<h4>Please wrap the content to be processed with two lines aacc1 and aacc2.</h4> <h5>aacc1</h5> <h5>Today is a good day 1!</h5> <h5>Today is a good day 2!</h5> <h5>...</h5> <h5>Today is a good day 3!</h5> <h5>aacc2</h5>";
        }
    }

    public get 批量移动复制帮助() {
        switch (this.lang) {
            case "zh_CN": return "批量移动复制帮助: <h4>请分别用 aacc1 与 aacc2 两行把要处理的内容包裹起来。再到目标位置插入一行 aacc3。</h4> <h5>[文档1]</h5> <h5>aacc1</h5> <h5>今天有个好天气1!</h5> <h5>今天有个好天气2!</h5> <h5>...</h5> <h5>今天有个好天气3!</h5> <h5>aacc2</h5> <h5>[文档2]</h5> <h5>...</h5> <h5>aacc3</h5> <h5>...</h5><h5>(文档1与文档2可以是同一个文档)</h5>";
            case "es_ES": return "<h4>Envuelva el contenido a procesar con las líneas aacc1 y aacc2. Luego inserte una línea aacc3 en la ubicación de destino.</h4> <h5>[Documento1]</h5> <h5>aacc1</h5> <h5>Hoy hace buen tiempo 1!</h5> <h5>Hoy hace buen tiempo 2!</h5> <h5>...</h5> <h5>Hoy hace buen tiempo 3!</h5> <h5>aacc2</h5> <h5>[Documento2]</h5> <h5>...</h5> <h5>aacc3</h5> <h5>...</h5><h5>(Documento1 y Documento2 pueden ser el mismo documento)</h5>";
            case "fr_FR": return "<h4>Encapsulez le contenu à traiter avec les lignes aacc1 et aacc2. Insérez ensuite une ligne aacc3 à l'emplacement cible.</h4> <h5>[Document1]</h5> <h5>aacc1</h5> <h5>Il fait beau aujourd'hui 1 !</h5> <h5>Il fait beau aujourd'hui 2 !</h5> <h5>...</h5> <h5>Il fait beau aujourd'hui 3 !</h5> <h5>aacc2</h5> <h5>[Document2]</h5> <h5>...</h5> <h5>aacc3</h5> <h5>...</h5><h5>(Document1 et Document2 peuvent être le même document)</h5>";
            case "ja_JP": return "<h4>処理する内容をaacc1とaacc2の2行で囲み、次に挿入先にaacc3の1行を挿入してください。</h4> <h5>[ドキュメント1]</h5> <h5>aacc1</h5> <h5>今日は良い天気1！</h5> <h5>今日は良い天気2！</h5> <h5>...</h5> <h5>今日は良い天気3！</h5> <h5>aacc2</h5> <h5>[ドキュメント2]</h5> <h5>...</h5> <h5>aacc3</h5> <h5>...</h5><h5>(ドキュメント1とドキュメント2は同じドキュメントでも構いません)</h5>";
            case "zh_CHT": return "批量移動複製幫助: <h4>請分別用 aacc1 與 aacc2 兩行把要處理的內容包裹起來。再到目標位置插入一行 aacc3。</h4> <h5>[文檔1]</h5> <h5>aacc1</h5> <h5>今天有個好天氣1!</h5> <h5>今天有個好天氣2!</h5> <h5>...</h5> <h5>今天有個好天氣3!</h5> <h5>aacc2</h5> <h5>[文檔2]</h5> <h5>...</h5> <h5>aacc3</h5> <h5>...</h5><h5>(文檔1與文檔2可以是同一個文檔)</h5>";
            case "it_IT": return "<h4>Involucra il contenuto da elaborare con due righe aacc1 e aacc2. Inserisci quindi una riga aacc3 nella posizione desiderata.</h4> <h5>[Documento1]</h5> <h5>aacc1</h5> <h5>C'è una bella giornata oggi 1!</h5> <h5>C'è una bella giornata oggi 2!</h5> <h5>...</h5> <h5>C'è una bella giornata oggi 3!</h5> <h5>aacc2</h5> <h5>[Documento2]</h5> <h5>...</h5> <h5>aacc3</h5> <h5>...</h5><h5>(Documento1 e Documento2 possono essere lo stesso documento)</h5>";
            case "de_DE": return "<h4>Umschließen Sie den zu verarbeitenden Inhalt mit zwei Zeilen aacc1 und aacc2. Fügen Sie dann an der Zielposition eine Zeile aacc3 ein.</h4> <h5>[Dokument1]</h5> <h5>aacc1</h5> <h5>Heute ist schönes Wetter 1!</h5> <h5>Heute ist schönes Wetter 2!</h5> <h5>...</h5> <h5>Heute ist schönes Wetter 3!</h5> <h5>aacc2</h5> <h5>[Dokument2]</h5> <h5>...</h5> <h5>aacc3</h5> <h5>...</h5><h5>(Dokument1 und Dokument2 können dasselbe Dokument sein)</h5>";
            case "he_IL": return "<h4>סרגו את התוכן שברצונכם לעבד באמצעות שתי השורות aacc1 ו- aacc2. לאחר מכן הכניסו שורה אחת של aacc3 במיקום היעד.</h4> <h5>[מסמך1]</h5> <h5>aacc1</h5> <h5>היום יש מזג אוויר נחמד 1!</h5> <h5>היום יש מזג אוויר נחמד 2!</h5> <h5>...</h5> <h5>היום יש מזג אוויר נחמד 3!</h5> <h5>aacc2</h5> <h5>[מסמך2]</h5> <h5>...</h5> <h5>aacc3</h5> <h5>...</h5><h5>(מסמך1 ומסמך2 יכולים להיות אותו מסמך)</h5>";
            case "ru_RU": return "<h4>Оберните контент, который нужно обработать, двумя строками aacc1 и aacc2. Затем вставьте строку aacc3 в нужное место.</h4> <h5>[Документ1]</h5> <h5>aacc1</h5> <h5>Сегодня хорошая погода 1!</h5> <h5>Сегодня хорошая погода 2!</h5> <h5>...</h5> <h5>Сегодня хорошая погода 3!</h5> <h5>aacc2</h5> <h5>[Документ2]</h5> <h5>...</h5> <h5>aacc3</h5> <h5>...</h5><h5>(Документ1 и Документ2 могут быть одним и тем же документом)</h5>";
            case "pl_PL": return "<h4>Otocz treść do przetworzenia dwoma liniami aacc1 i aacc2. Następnie wstaw jedną linię aacc3 w docelowej lokalizacji.</h4> <h5>[Dokument1]</h5> <h5>aacc1</h5> <h5>Dzisiaj jest ładna pogoda 1!</h5> <h5>Dzisiaj jest ładna pogoda 2!</h5> <h5>...</h5> <h5>Dzisiaj jest ładna pogoda 3!</h5> <h5>aacc2</h5> <h5>[Dokument2]</h5> <h5>...</h5> <h5>aacc3</h5> <h5>...</h5><h5>(Dokument1 i Dokument2 mogą być tym samym dokumentem)</h5>";
            case "en_US":
            default: return "<h4>Please wrap the content to be processed with two lines aacc1 and aacc2. Then insert one line aacc3 at the target location.</h4> <h5>[Document1]</h5> <h5>aacc1</h5> <h5>Today is a good day 1!</h5> <h5>Today is a good day 2!</h5> <h5>...</h5> <h5>Today is a good day 3!</h5> <h5>aacc2</h5> <h5>[Document2]</h5> <h5>...</h5> <h5>aacc3</h5> <h5>...</h5><h5>(Document1 and Document2 can be the same document)</h5>";
        }
    }
}