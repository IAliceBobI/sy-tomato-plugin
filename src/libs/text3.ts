import { TomatoI18nABC4 } from "./text4";

export abstract class TomatoI18nABC3 extends TomatoI18nABC4 {
    public get 添加智能体ID() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "添加智能体ID";
            case "es_ES":
                return "Añadir ID de agente";
            case "fr_FR":
                return "Ajouter l'ID de l'agent";
            case "ja_JP":
                return "エージェントIDを追加";
            case "zh_CHT":
                return "添加智能體ID";
            case "it_IT":
                return "Aggiungi ID agente";

            default:
                return "Add Agent ID";
        }
    }

    public get 调试智能体() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "调试智能体";
            case "es_ES":
                return "Depurar agente";
            case "fr_FR":
                return "Déboguer l'agent";
            case "ja_JP":
                return "エージェントをデバッグ";
            case "zh_CHT":
                return "調試智能體";
            case "it_IT":
                return "Debug agente";

            default:
                return "Debug Agent";
        }
    }

    public get 清理Coze多余文件() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "清理Coze多余文件";
            case "es_ES":
                return "Limpiar archivos innecesarios de Coze";
            case "fr_FR":
                return "Nettoyer les fichiers superflus de Coze";
            case "ja_JP":
                return "Cozeの不要なファイルをクリーンアップ";
            case "zh_CHT":
                return "清理Coze多餘文件";
            case "it_IT":
                return "Pulizia file superflui di Coze";

            default:
                return "Clean up unnecessary Coze files";
        }
    }
    public get conceptBarTitle点击(): string {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "点击(跳转), shift+alt点击(或者), ctrl点击(并且), shift点击(排除), alt点击(单选)";
            case "es_ES":
                return "Haz clic (saltar), shift+alt clic (o), ctrl clic (y), shift clic (excluir), alt clic (selección única)";
            case "fr_FR":
                return "Cliquez (sauter), shift+alt clic (ou), ctrl clic (et), shift clic (exclure), alt clic (sélection unique)";
            case "ja_JP":
                return "クリック（ジャンプ）、shift+altクリック（または）、ctrlクリック（および）、shiftクリック（除外）、altクリック（単一選択）";
            case "zh_CHT":
                return "點擊(跳轉), shift+alt點擊(或者), ctrl點擊(並且), shift點擊(排除), alt點擊(單選)";
            case "it_IT":
                return "Clic (salta), shift+alt clic (o), ctrl clic (e), shift clic (escludi), alt clic (selezione singola)";

            default:
                return "Click (jump), shift+alt click (or), ctrl click (and), shift click (exclude), alt click (single select)";
        }
    }

    public get ctrl点击清空enter搜索(): string {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "ctrl点击清空,enter搜索";
            case "es_ES":
                return "ctrl+clic para borrar, enter para buscar";
            case "fr_FR":
                return "ctrl+clic pour effacer, entrée pour rechercher";
            case "ja_JP":
                return "ctrl+クリックでクリア、enterで検索";
            case "zh_CHT":
                return "ctrl點擊清空,enter搜索";
            case "it_IT":
                return "ctrl+clicca per cancellare, invio per cercare";
            case "de_DE":
                return "ctrl+Klick zum Löschen, Enter zum Suchen";
            case "he_IL":
                return "ctrl+לחץ כדי לנקות, enter כדי לחפש";
            case "ru_RU":
                return "ctrl+клик для очистки, enter для поиска";
            case "pl_PL":
                return "ctrl+kliknij, aby wyczyścić, enter, aby wyszukać";
            case "en_US":
            default:
                return "ctrl+click to clear, enter to search";
        }
    }
    public get shiftEnter2write() {
        // 补充缺失的语言
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "Shift+Enter写入";
            case "es_ES":
                return "Shift+Enter para escribir";
            case "fr_FR":
                return "Shift+Enter pour écrire";
            case "ja_JP":
                return "Shift+Enterで書き込む";
            case "zh_CHT":
                return "Shift+Enter寫入";
            case "it_IT":
                return "Shift+Enter per scrivere";
            case "de_DE":
                return "Shift+Enter zum Schreiben";
            case "he_IL":
                return "Shift+Enter לכתיבה";
            case "ru_RU":
                return "Shift+Enter для записи";
            case "pl_PL":
                return "Shift+Enter do pisania";
            case "en_US":
            default:
                return "Shift+Enter to write";
        }
    }
    public get 导出所有文档到单个文件() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "导出所有文档到单个文件"; // Chinese (Simplified)
            case "es_ES":
                return "Exportar todos los documentos a un solo archivo"; // Spanish
            case "fr_FR":
                return "Exporter tous les documents dans un seul fichier"; // French
            case "ja_JP":
                return "すべてのドキュメントを1つのファイルにエクスポート"; // Japanese
            case "zh_CHT":
                return "導出所有文檔到單個文件"; // Chinese (Traditional)
            case "it_IT":
                return "Esporta tutti i documenti in un unico file"; // Italian
            case "de_DE":
                return "Alle Dokumente in einer Datei exportieren"; // German
            case "he_IL":
                return "ייצא את כל המסמכים לקובץ בודד"; // Hebrew
            case "ru_RU":
                return "Экспортировать все документы в один файл"; // Russian
            case "pl_PL":
                return "Wyeksportuj wszystkie dokumenty do jednego pliku"; // Polish
            case "en_US":
                return "Export all documents to a single file"; // English
            default:
                return "Export all documents to a single file"; // Default to English
        }
    }
    public get 上传当前笔记本() {
        // 请为我补充缺失的语言
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "上传当前笔记本";
            case "es_ES":
                return "Subir cuaderno actual"; // Spanish
            case "fr_FR":
                return "Télécharger le carnet actuel"; // French
            case "ja_JP":
                return "現在のノートブックをアップロード"; // Japanese
            case "zh_CHT":
                return "上傳當前筆記本"; // Traditional Chinese
            case "it_IT":
                return "Carica il notebook corrente"; // Italian
            case "de_DE":
                return "Aktuelles Notizbuch hochladen"; // German
            case "he_IL":
                return "העלה את מחברת הנוכחי"; // Hebrew
            case "ru_RU":
                return "Загрузить текущую тетрадь"; // Russian
            case "pl_PL":
                return "Prześlij aktualną notes"; // Polish
            case "en_US":
                return "Upload current notebook"; // English
            default:
                return "Upload current notebook"; // Default to English or another preferred language
        }
    }
    public get 重置最小上传时间() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "重置最小上传时间";
            case "es_ES":
                return "Restablecer el tiempo mínimo de subida";
            case "fr_FR":
                return "Réinitialiser le temps minimum pour télécharger";
            case "ja_JP":
                return "最小アップロード時間をリセットする";
            case "zh_CHT":
                return "重置最小上傳時間";
            case "it_IT":
                return "Reimposta il tempo minimo per il caricamento";
            case "de_DE":
                return "Mindest-Hochladezeit zurücksetzen";
            case "he_IL":
                return "אפס את זמן העלאה המינימלי";
            case "ru_RU":
                return "Сбросить минимальное время для загрузки";
            case "pl_PL":
                return "Zresetuj minimalny czas wysyłki";
            case "en_US":
            default:
                return "Reset minimum upload time";
        }
    }

    public 只上传这个时间之后更新的内容(x: string) {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return `只上传${x}之后更新的内容`;
            case "es_ES":
                return `Subir solo contenido actualizado después de ${x}`;
            case "fr_FR":
                return `Télécharger uniquement les contenus mis à jour après ${x}`;
            case "ja_JP":
                return `${x}以降に更新されたコンテンツのみをアップロードする`;
            case "zh_CHT":
                return `僅上傳${x}之後更新的內容`;
            case "it_IT":
                return `Carica solo i contenuti aggiornati dopo ${x}`;
            case "de_DE":
                return `Nur Inhalte hochladen, die nach ${x} aktualisiert wurden`;
            case "he_IL":
                return `העלה רק תוכן שעודכן לאחר ${x}`;
            case "ru_RU":
                return `Загружать только обновленный контент после ${x}`;
            case "pl_PL":
                return `Prześlij tylko zaktualizowane treści po ${x}`;
            case "en_US":
            default:
                return `Upload only content updated after ${x}`;
        }
    }
    public get 清理所有文件() {
        // 请为我补充缺失的语言
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "清理coze中所有文件";
            case "es_ES":
                return "Borrar todos los archivos de coze";
            case "fr_FR":
                return "Supprimer tous les fichiers de coze";
            case "ja_JP":
                return "coze内のすべてのファイルを削除";
            case "zh_CHT":
                return "清理coze中的所有文件";
            case "it_IT":
                return "Cancella tutti i file di coze";
            case "de_DE":
                return "Alle Dateien in coze löschen";
            case "he_IL":
                return "למחוק את כל הקבצים ב-coze";
            case "ru_RU":
                return "Удалить все файлы coze";
            case "pl_PL":
                return "Usuń wszystkie pliki coze";
            case "en_US":
                return "Delete all files in coze";
            default:
                // 默认情况下使用英文
                return "Delete all files in coze";
        }
    }
    public get 删除Coze中当前文件以及子文件() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "删除Coze中当前文件以及子文件";
            case "es_ES":
                return "Eliminar el archivo actual y sus subarchivos en Coze";
            case "fr_FR":
                return "Supprimer le fichier actuel et ses sous-fichiers dans Coze";
            case "ja_JP":
                return "Coze内の現在のファイルとそのサブファイルを削除する";
            case "zh_CHT":
                return "刪除Coze中目前檔案及其子檔案";
            case "it_IT":
                return "Elimina il file corrente e i suoi sottofile in Coze";
            case "de_DE":
                return "Löschen Sie die aktuelle Datei und ihre Unterdateien in Coze";
            case "he_IL":
                return "מחק את הקובץ הנוכחי והקובצי תתי שלו ב-Coze";
            case "ru_RU":
                return "Удалить текущий файл и его подфайлы в Coze";
            case "pl_PL":
                return "Usuń bieżący plik oraz jego podpliki w Coze";
            case "en_US":
            default:
                return "Delete the current file and its subfiles in Coze";
        }
    }
    public get 激活码() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "激活码";
            case "es_ES":
                return "Código de activación";
            case "fr_FR":
                return "Code d'activation";
            case "ja_JP":
                return "アクティベーションコード";
            case "zh_CHT":
                return "啟用碼";
            case "it_IT":
                return "Codice di attivazione";
            case "de_DE":
                return "Aktivierungscode";
            case "he_IL":
                return "קוד הפעלה";
            case "ru_RU":
                return "Код активации";
            case "pl_PL":
                return "Kod aktywacyjny";
            case "en_US":
            default:
                return "Activation code";
        }
    }
    public get 激活() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "激活";
            case "es_ES":
                return "Activar";
            case "fr_FR":
                return "Activer";
            case "ja_JP":
                return "有効化";
            case "zh_CHT":
                return "激活"; // 繁体中文与简体中文使用相同术语
            case "it_IT":
                return "Attiva";
            case "de_DE":
                return "Aktivieren";
            case "he_IL":
                return "הפעלה";
            case "ru_RU":
                return "Активировать";
            case "pl_PL":
                return "Aktywuj";
            case "en_US":
            default:
                return "Activate";
        }
    }
    public get 已经激活() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": // 简体中文
                return "已经激活";
            case "es_ES": // 西班牙语
                return "Ya activado";
            case "fr_FR": // 法语
                return "Déjà activé";
            case "ja_JP": // 日语
                return "すでにアクティブ化されています";
            case "zh_CHT": // 繁体中文
                return "已經激活";
            case "it_IT": // 意大利语
                return "Già attivato";
            case "de_DE": // 德语
                return "Bereits aktiviert";
            case "he_IL": // 希伯来语
                return "כבר מופעל";
            case "ru_RU": // 俄语
                return "Уже активировано";
            case "pl_PL": // 波兰语
                return "Już aktywowany";
            case "en_US": // 英语（美国）
            default: // 默认语言
                return "Already activated";
        }
    }
    public get 没有激活() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": // 简体中文
                return "没有激活";
            case "es_ES": // 西班牙语
                return "No activado";
            case "fr_FR": // 法语
                return "Non activé";
            case "ja_JP": // 日语
                return "アクティブ化されていません";
            case "zh_CHT": // 繁体中文
                return "沒有激活";
            case "it_IT": // 意大利语
                return "Non attivato";
            case "de_DE": // 德语
                return "Nicht aktiviert";
            case "he_IL": // 希伯来语
                return "לא מופעל";
            case "ru_RU": // 俄语
                return "Не активировано";
            case "pl_PL": // 波兰语
                return "Nie aktywowany";
            case "en_US": // 英语（美国）
            default: // 默认语言
                return "Not activated";
        }
    }
    public get 复制() {
        // 补充缺失语言。
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "复制"; // 简体中文
            case "es_ES": return "Copiar"; // 西班牙语
            case "fr_FR": return "Copier"; // 法语
            case "ja_JP": return "コピー"; // 日语
            case "zh_CHT": return "複製"; // 繁体中文
            case "it_IT": return "Copia"; // 意大利语
            case "de_DE": return "Kopieren"; // 德语
            case "he_IL": return "העתק"; // 希伯来语
            case "ru_RU": return "Копировать"; // 俄语
            case "pl_PL": return "Kopiuj"; // 波兰语
            case "en_US": return "Copy"; // 英语（美国）
            default: return "Copy"; // 默认返回英语
        }
    }
    public get 如果要激活插件请先登录思源本体的账户() {
        // 补充缺失语言。
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "如果要激活插件，请先登录思源本体的账户";
            case "es_ES":
                return "Si desea activar el complemento, inicie sesión en la cuenta principal de Siyuan primero.";
            case "fr_FR":
                return "Pour activer le plugin, veuillez d'abord vous connecter au compte principal de Siyuan.";
            case "ja_JP":
                return "プラグインを有効にするには、まず思源のメインアカウントにログインしてください。";
            case "zh_CHT":
                return "如果要啟用插件，請先登錄思源主體的賬戶。";
            case "it_IT":
                return "Per attivare il plugin, accedi prima all'account principale di Siyuan.";
            case "de_DE":
                return "Um das Plugin zu aktivieren, melden Sie sich bitte zuerst bei Ihrem Siyuan-Hauptkonto an.";
            case "he_IL":
                return "אם ברצונך להפעיל את התוסף, אנא התחבר לחשבון הראשי של Siyuan תחילה.";
            case "ru_RU":
                return "Чтобы активировать плагин, сначала войдите в основную учетную запись Siyuan.";
            case "pl_PL":
                return "Aby aktywować wtyczkę, najpierw zaloguj się na główne konto Siyuan.";
            case "en_US":
            default:
                return "If you want to activate the plugin, please log in to the main Siyuan account first.";
        }
    }
    public get 文档() {
        // 根据语言配置返回对应的翻译
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "文档"; // 简体中文
            case "es_ES": return "Documento"; // 西班牙语
            case "fr_FR": return "Document"; // 法语
            case "ja_JP": return "ドキュメント"; // 日语
            case "zh_CHT": return "文件"; // 繁体中文
            case "it_IT": return "Documento"; // 意大利语
            case "de_DE": return "Dokument"; // 德语
            case "he_IL": return "מסמך"; // 希伯来语
            case "ru_RU": return "Документ"; // 俄语
            case "pl_PL": return "Dokument"; // 波兰语
            case "en_US": return "Document"; // 英语（美国）
            default: return "Document";
        }
    }
    public get 文档正引说明() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "VIP功能：展示当前文档中所有正引内容。";
            case "es_ES": return "Función VIP: Muestra todas las citas directas en el documento actual.";
            case "fr_FR": return "Fonction VIP : Affiche toutes les citations directes dans le document actuel.";
            case "ja_JP": return "VIP機能：現在のドキュメント内のすべての直接引用内容を表示します。";
            case "zh_CHT": return "VIP功能：顯示當前文件中所有正引內容。";
            case "it_IT": return "Funzione VIP: Visualizza tutte le citazioni dirette nel documento attuale.";
            case "de_DE": return "VIP-Funktion: Zeigt alle direkten Zitate im aktuellen Dokument an.";
            case "he_IL": return "תכונת VIP: מציגה את כל תוכן הציטוטים הישירים במסמך הנוכחי.";
            case "ru_RU": return "VIP - функция: отображает все прямые цитаты в текущем документе.";
            case "pl_PL": return "Funkcja VIP: Wyświetla wszystkie bezpośrednie cytaty w aktualnym dokumencie.";
            case "en_US":
            default:
                return "VIP feature: Displays all direct citations in the current document.";
        }
    }
    public get 隐藏同步块右上角菜单() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "隐藏同步块右上角菜单";
            case "es_ES": return "Ocultar el menú de la esquina superior derecha del bloque de sincronización";
            case "fr_FR": return "Masquer le menu en haut à droite du bloc de synchronisation";
            case "ja_JP": return "同期ブロックの右上メニューを隠す";
            case "zh_CHT": return "隱藏同步區塊右上角菜單";
            case "it_IT": return "Nascondi il menu nell'angolo in alto a derecha del blocco di sincronizzazione";
            case "de_DE": return "Menü in der oberen rechten Ecke des Synchronisierungsblocks ausblenden";
            case "he_IL": return "הסתר תפריט בפינה הימנית העליונה של בלוק הסנכרון";
            case "ru_RU": return "Скрыть меню в верхнем правом углу блока синхронизации";
            case "pl_PL": return "Ukryj menu w prawym górnym rogu bloku synchronizacji";
            case "en_US": return "Hide the top-right menu of the sync block";
            default: return "Hide the top-right menu of the sync block";
        }
    }
    public get 给文档添加简拼别名() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "给文档添加简拼别名";
            case "es_ES": return "Agregar alias de pinyin abreviado al documento";
            case "fr_FR": return "Ajouter un alias de pinyin abrégé au document";
            case "ja_JP": return "ドキュメントに簡略ピンインの別名を追加する";
            case "zh_CHT": return "給文檔添加簡拼別名";
            case "it_IT": return "Aggiungi alias di pinyin abbreviato al documento";
            case "de_DE": return "Fügen Sie dem Dokument einen Alias für das abgekürzte Pinyin hinzu";
            case "he_IL": return "הוסף כינוי פינין מקוצר למסמך";
            case "ru_RU": return "Добавить сокращенное пиньин-алиас к документу";
            case "pl_PL": return "Dodaj alias skróconego pinyin do dokumentu";
            case "en_US": return "给文档添加简拼别名";
            default: return "给文档添加简拼别名";
        }
    }
    public get 过期时间() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "过期时间";
            case "es_ES": return "Tiempo de expiración";
            case "fr_FR": return "Date d'expiration";
            case "ja_JP": return "有効期限";
            case "zh_CHT": return "過期時間";
            case "it_IT": return "Tempo di scadenza";
            case "de_DE": return "Ablaufzeit";
            case "he_IL": return "זמן תפוגה";
            case "ru_RU": return "Время истечения срока";
            case "pl_PL": return "Czas wygaśnięcia";
            case "en_US": return "Expiration Time";
            default: return "Expiration Time";
        }
    }
    public get 购买() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "购买";
            case "es_ES": return "Comprar";
            case "fr_FR": return "Acheter";
            case "ja_JP": return "購入する";
            case "zh_CHT": return "購買";
            case "it_IT": return "Acquistare";
            case "de_DE": return "Kaufen";
            case "he_IL": return "לקנות";
            case "ru_RU": return "Купить";
            case "pl_PL": return "Kupić";
            case "en_US": return "Purchase";
            default: return "Purchase";
        }
    }
    public get 点击打开店铺() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "点击打开店铺";
            case "es_ES": return "Haz clic para abrir la tienda";
            case "fr_FR": return "Cliquez pour ouvrir la boutique";
            case "ja_JP": return "クリックして店舗を開く";
            case "zh_CHT": return "點擊打開店鋪";
            case "it_IT": return "Fai clic per aprire il negozio";
            case "de_DE": return "Klicken Sie, um den Shop zu öffnen";
            case "he_IL": return "לחץ כדי לפתוח את החנות";
            case "ru_RU": return "Нажмите, чтобы открыть магазин";
            case "pl_PL": return "Kliknij, aby otworzyć sklep";
            case "en_US": return "Click to open the store";
            default: return "Click to open the store";
        }
    }
    public get 点击复制按钮进入店铺将复制的内容发给客服() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "点击复制按钮，进入店铺，将复制的内容发给客服";
            case "es_ES": return "Haga clic en el botón de copiar, entre en la tienda y envíe el contenido copiado al servicio al cliente";
            case "fr_FR": return "Cliquez sur le bouton de copie, entrez dans le magasin et envoyez le contenu copié au service client";
            case "ja_JP": return "コピーのボタンをクリックして、店舗に入り、コピーした内容をカスタマーサービスに送信します";
            case "zh_CHT": return "點擊複製按鈕，進入店鋪，將複製的內容發給客服";
            case "it_IT": return "Fai clic sul pulsante di copia, entra nel negozio e invia il contenuto copiato al servizio clienti";
            case "de_DE": return "Klicken Sie auf die Kopierschaltfläche, gehen Sie in den Laden und senden Sie den kopierten Inhalt an den Kundendienst";
            case "he_IL": return "לחץ על כפתור העתק, היכנס לחנות ושלח את התוכן שהועתק למשתמש שירות לקוחות";
            case "ru_RU": return "Нажмите кнопку копирования, зайдите в магазин и отправьте скопированное содержимое в службу поддержки";
            case "pl_PL": return "Kliknij przycisk kopiowania, wejdź do sklepu i wyślij skopiowaną zawartość do obsługi klienta";
            case "en_US":
            default: return "Click the copy button, enter the store, and send the copied content to customer service";
        }
    }
    public get 淘宝店二维码() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "淘宝店二维码";
            case "es_ES": return "Código QR de la tienda Taobao";
            case "fr_FR": return "Code QR du magasin Taobao";
            case "ja_JP": return "タオバオ店のQRコード";
            case "zh_CHT": return "淘寶店二維碼";
            case "it_IT": return "Codice QR del negozio Taobao";
            case "de_DE": return "Taobao-Shop QR-Code";
            case "he_IL": return "קוד QR של חנות טאובאו";
            case "ru_RU": return "QR-код магазина Taobao";
            case "pl_PL": return "Kod QR sklepu Taobao";
            case "en_US":
            default: return "Taobao Store QR Code";
        }
    }
    public get 一次付费终身使用() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "一次付费，终身使用";
            case "es_ES": return "Paga una vez, úsalo de por vida";
            case "fr_FR": return "Payer une fois, utiliser à vie";
            case "ja_JP": return "一度支払い、一生利用";
            case "zh_CHT": return "一次付費，終身使用";
            case "it_IT": return "Pagamento unico, utilizzo a vita";
            case "de_DE": return "Einmalige Zahlung, lebenslange Nutzung";
            case "he_IL": return "תשלום חד פעמי, שימוש לכל החיים";
            case "ru_RU": return "Один раз заплатить, использовать всю жизнь";
            case "pl_PL": return "Jednorazowa opłata, używanie przez całe życie";
            case "en_US":
            default: return "Pay once, use for life";
        }
    }
    public get 功能特性() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "功能特性";
            case "es_ES": return "Características";
            case "fr_FR": return "Fonctionnalités";
            case "ja_JP": return "機能特性";
            case "zh_CHT": return "功能特性";
            case "it_IT": return "Caratteristiche";
            case "de_DE": return "Funktionen";
            case "he_IL": return "תכונות";
            case "ru_RU": return "Функции";
            case "pl_PL": return "Funkcje";
            case "en_US":
            default: return "Features";
        }
    }
    public get 终身() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "终身";
            case "es_ES": return "De por vida";
            case "fr_FR": return "À vie";
            case "ja_JP": return "一生";
            case "zh_CHT": return "終身";
            case "it_IT": return "A vita";
            case "de_DE": return "Lebenslang";
            case "he_IL": return "לכל החיים";
            case "ru_RU": return "На всю жизнь";
            case "pl_PL": return "Na całe życie";
            case "en_US":
            default: return "Lifetime";
        }
    }
    public get 购买番茄工具箱VIP版() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "购买番茄工具箱VIP版";
            case "es_ES": return "Comprar la versión VIP de Tomato Toolbox";
            case "fr_FR": return "Acheter la version VIP de Tomato Toolbox";
            case "ja_JP": return "トマトツールボックスVIP版を購入";
            case "zh_CHT": return "購買番茄工具箱VIP版";
            case "it_IT": return "Acquista la versione VIP di Tomato Toolbox";
            case "de_DE": return "Kaufen Sie die VIP-Version von Tomato Toolbox";
            case "he_IL": return "קנה את גרסת ה-VIP של תיבת הכלים טומטו";
            case "ru_RU": return "Купить VIP-версию Tomato Toolbox";
            case "pl_PL": return "Kup wersję VIP Tomato Toolbox";
            case "en_US":
            default: return "Purchase Tomato Toolbox VIP Edition";
        }
    }
    public get 番茄工具箱() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "番茄工具箱";
            case "es_ES": return "Herramientas Pomodoro";
            case "fr_FR": return "Boîte à outils Pomodoro";
            case "ja_JP": return "トマトツールボックス";
            case "zh_CHT": return "番茄工具箱";
            case "it_IT": return "Strumenti Pomodoro";
            case "de_DE": return "Pomodoro-Werkzeugkasten";
            case "he_IL": return "תיבת כלים פומודורו";
            case "ru_RU": return "Помидорный набор инструментов";
            case "pl_PL": return "Narzędzia Pomodoro";
            case "en_US": return "Pomodoro Toolbox";
            default: return "Pomodoro Toolbox";
        }
    }
    public get 渐进学习() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "渐进学习";
            case "es_ES": return "Aprendizaje progresivo";
            case "fr_FR": return "Apprentissage progressif";
            case "ja_JP": return "段階的学習";
            case "zh_CHT": return "漸進學習";
            case "it_IT": return "Apprendimento progressivo";
            case "de_DE": return "Schrittweise Lernmethode";
            case "he_IL": return "למידה הדרגתית";
            case "ru_RU": return "Постепенное обучение";
            case "pl_PL": return "Progresywne uczenie się";
            case "en_US": return "Progressive Learning";
            default: return "Progressive Learning";
        }
    }
    public get 购买渐进学习VIP版() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "购买渐进学习VIP版";
            case "es_ES": return "Comprar la versión VIP de aprendizaje progresivo";
            case "fr_FR": return "Acheter la version VIP d'apprentissage progressif";
            case "ja_JP": return "段階的学習のVIP版を購入する";
            case "zh_CHT": return "購買漸進學習VIP版";
            case "it_IT": return "Acquista la versione VIP di apprendimento progressivo";
            case "de_DE": return "Kaufe die VIP - Version des schrittweisen Lernens";
            case "he_IL": return "רכישת גרסת VIP של למידה הדרגתית";
            case "ru_RU": return "Купить VIP - версию постепенного обучения";
            case "pl_PL": return "Kup wersję VIP progresywnego uczenia się";
            case "en_US": return "Buy the VIP version of Progressive Learning";
            default: return "Buy the VIP version of Progressive Learning";
        }
    }
    public get 大部分功能不需要激活() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "大部分功能不需要激活";
            case "es_ES": return "La mayoría de las funciones no requieren activación";
            case "fr_FR": return "La plupart des fonctionnalités ne nécessitent pas d'activation";
            case "ja_JP": return "ほとんどの機能はアクティベーション不要です";
            case "zh_CHT": return "大部分功能不需要激活";
            case "it_IT": return "La maggior parte delle funzionalità non richiede attivazione";
            case "de_DE": return "Die meisten Funktionen erfordern keine Aktivierung";
            case "he_IL": return "רוב התכונות אינן דורשות הפעלה";
            case "ru_RU": return "Большинство функций не требует активации";
            case "pl_PL": return "Większość funkcji nie wymaga aktywacji";
            case "en_US": return "Most features do not require activation";
            default: return "Most features do not require activation";
        }
    }

    public get 超级块制卡时所选内容视作问题() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "超级块制卡时，所选内容视作问题";
            case "es_ES":
                return "Al crear tarjetas con bloques superiores, el contenido seleccionado se considera una pregunta";
            case "fr_FR":
                return "Lors de la création de cartes avec des blocs supérieurs, le contenu sélectionné est considéré comme une question";
            case "ja_JP":
                return "スーパーブロックでカードを作成する際、選択された内容は質問と見なされます";
            case "zh_CHT":
                return "超級塊制卡時，所選內容視作問題";
            case "it_IT":
                return "Durante la creazione di carte con blocchi superiori, il contenuto selezionato viene considerato una domanda";

            default:
                return "When creating cards with super blocks, the selected content is treated as a question";
        }
    }
    public get 用超级块来制卡() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "用超级块来制卡";
            case "es_ES":
                return "Crear tarjetas con bloques superiores";
            case "fr_FR":
                return "Créer des cartes avec des blocs supérieurs";
            case "ja_JP":
                return "スーパーブロックでカードを作成";
            case "zh_CHT":
                return "用超級塊來制卡";
            case "it_IT":
                return "Crea carte con blocchi superiori";

            default:
                return "Create cards with super blocks";
        }
    }
    public get 列表制卡时从第二行开始缩进() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "列表制卡时从第二行开始缩进";
            case "es_ES":
                return "Indentar desde la segunda línea al crear una lista";
            case "fr_FR":
                return "Indenter à partir de la deuxième ligne lors de la création d'une liste";
            case "ja_JP":
                return "リスト作成時に2行目からインデントする";
            case "zh_CHT":
                return "列表製卡時從第二行開始縮進";
            case "it_IT":
                return "Indentazione dalla seconda riga durante la creazione di una lista";

            default:
                return "Indent from the second line when creating a list";
        }
    }
    public get 卡片最上面添加相关概念() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "制卡后，在卡片最上面添加相关概念";
            case "es_ES":
                return "Después de crear la tarjeta, agregar conceptos relacionados en la parte superior";
            case "fr_FR":
                return "Après avoir créé la carte, ajouter des concepts liés en haut";
            case "ja_JP":
                return "カードを作成した後、カードの上部に関連する概念を追加";
            case "zh_CHT":
                return "製卡後，在卡片最上面添加相關概念";
            case "it_IT":
                return "Dopo aver creato la carta, aggiungi concetti correlati nella parte superiore";

            default:
                return "After creating the card, add related concepts at the top";
        }
    }
    public get 给闪卡添加底部边框() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "制卡后，给闪卡添加底部边框";
            case "es_ES":
                return "Después de crear la tarjeta, añadir un borde inferior a la tarjeta flash.";
            case "fr_FR":
                return "Après avoir créé la carte, ajoutez une bordure inférieure à la carte flash.";
            case "ja_JP":
                return "カードを作成後、フラッシュカードの下部にボーダーを追加します。";
            case "zh_CHT":
                return "製卡後，給閃卡添加底部邊框";
            case "it_IT":
                return "Dopo aver creato la scheda, aggiungi un bordo inferiore alla scheda flash.";

            default:
                return "After creating the card, add a bottom border to the flashcard.";
        }
    }
    public get 上一页() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "上一页";
            case "es_ES":
                return "Anterior";
            case "fr_FR":
                return "Précédent";
            case "ja_JP":
                return "前へ";
            case "zh_CHT":
                return "上一頁";
            case "it_IT":
                return "Precedente";

            default:
                return "Previous";
        }
    }
    public get 下一页() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "下一页";
            case "es_ES":
                return "Siguiente";
            case "fr_FR":
                return "Suivant";
            case "ja_JP":
                return "次へ";
            case "zh_CHT":
                return "下一頁";
            case "it_IT":
                return "Successivo";

            default:
                return "Next";
        }
    }
    public get 显示上一个分片的最后一个块() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "显示上一个分片的最后一个块";
            case "es_ES":
                return "Mostrar el último bloque del fragmento anterior";
            case "fr_FR":
                return "Afficher le dernier bloc du fragment précédent";
            case "ja_JP":
                return "前のセグメントの最後のブロックを表示";
            case "zh_CHT":
                return "顯示上一個分片的最後一個塊";
            case "it_IT":
                return "Mostra l'ultimo blocco del frammento precedente";

            default:
                return "Show the last block of the previous fragment";
        }
    }

    public get 总字数() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "总字数　　";
            case "es_ES":
                return "Número total de palabras";
            case "fr_FR":
                return "Nombre total de mots";
            case "ja_JP":
                return "総単語数";
            case "zh_CHT":
                return "總字數　　";
            case "it_IT":
                return "Numero totale di parole";

            default:
                return "Total word count";
        }
    }

    public 平均每个标题下有x块(blockNum: number) {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return `平均每个标题下有　　: ${blockNum} 个块`;
            case "es_ES":
                return `Promedio de bloques por título: ${blockNum} bloques`;
            case "fr_FR":
                return `Moyenne de blocs par titre : ${blockNum} blocs`;
            case "ja_JP":
                return `平均タイトルごとのブロック数：${blockNum} ブロック`;
            case "zh_CHT":
                return `平均每個標題下有　　: ${blockNum} 個塊`;
            case "it_IT":
                return `Media di blocchi per titolo: ${blockNum} blocchi`;

            default:
                return `Average number of blocks per title: ${blockNum} blocks`;
        }
    }

    public 平均每个块的字数(x: number) {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return `平均每个块的字数　　: ${x} 个字`;
            case "es_ES":
                return `Promedio de palabras por bloque: ${x} palabras`;
            case "fr_FR":
                return `Moyenne de mots par bloc : ${x} mots`;
            case "ja_JP":
                return `平均ブロックごとの単語数：${x} 語`;
            case "zh_CHT":
                return `平均每個塊的字數　　: ${x} 個字`;
            case "it_IT":
                return `Media di parole per blocco: ${x} parole`;

            default:
                return `Average number of words per block: ${x} words`;
        }
    }

    public 平均每个块的文本长度(x: number) {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return `平均每个块的文本长度: ${x}`;
            case "es_ES":
                return `Longitud media de texto por bloque: ${x}`;
            case "fr_FR":
                return `Longueur moyenne de texte par bloc : ${x}`;
            case "ja_JP":
                return `平均ブロックごとのテキスト長：${x}`;
            case "zh_CHT":
                return `平均每個塊的文本長度: ${x}`;
            case "it_IT":
                return `Lunghezza media del testo per blocco: ${x}`;

            default:
                return `Average text length per block: ${x}`;
        }
    }

    public get 总文本长度() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "总文本长度";
            case "es_ES":
                return "Longitud total del texto";
            case "fr_FR":
                return "Longueur totale du texte";
            case "ja_JP":
                return "テキストの総長";
            case "zh_CHT":
                return "總文本長度";
            case "it_IT":
                return "Lunghezza totale del testo";

            default:
                return "Total text length";
        }
    }

    public get 按文本长度拆分() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return `按文本长度拆分，留空为不拆分`;
            case "es_ES":
                return `Dividir por longitud de texto, dejar en blanco para no dividir`;
            case "fr_FR":
                return `Diviser par longueur de texte, laisser vide pour ne pas diviser`;
            case "ja_JP":
                return `テキスト長で分割、空白の場合は分割しません`;
            case "zh_CHT":
                return `按文本長度拆分，留空為不拆分`;
            case "it_IT":
                return `Dividi per lunghezza del testo, lascia vuoto per non dividere`;

            default:
                return `Split by text length, leave empty to not split`;
        }
    }
    public get 请耐心等待() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "请耐心等待";
            case "es_ES":
                return "Por favor, espere";
            case "fr_FR":
                return "Veuillez patienter";
            case "ja_JP":
                return "しばらくお待ちください";
            case "zh_CHT":
                return "請稍等待";
            case "it_IT":
                return "Attendere prego";

            default:
                return "Please wait";
        }
    }
    public get 上网查询所选内容() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "上网查询所选内容";
            case "es_ES":
                return "Buscar en línea el contenido seleccionado";
            case "fr_FR":
                return "Rechercher en ligne le contenu sélectionné";
            case "ja_JP":
                return "選択した内容をオンラインで検索";
            case "zh_CHT":
                return "上網查詢所選內容";
            case "it_IT":
                return "Cerca online il contenuto selezionato";

            default:
                return "Search online for selected content";
        }
    }
    public get 在上方插入汉语拼音() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "在上方插入汉语拼音。";
            case "es_ES":
                return "Insertar pinyin arriba.";
            case "fr_FR":
                return "Insérer le pinyin ci-dessus.";
            case "ja_JP":
                return "上にピンインを挿入する。";
            case "zh_CHT":
                return "在上方插入漢語拼音。";
            case "it_IT":
                return "Inserisci il pinyin sopra.";

            default:
                return "Insert pinyin above.";
        }
    }
    public get 在闪卡底部添加边框() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "在闪卡底部添加边框";
            case "es_ES":
                return "Agregar borde en la parte inferior de la tarjeta flash";
            case "fr_FR":
                return "Ajouter une bordure en bas de la carte flash";
            case "ja_JP":
                return "フラッシュカードの下部にボーダーを追加";
            case "zh_CHT":
                return "在閃卡底部添加邊框";
            case "it_IT":
                return "Aggiungi bordo in fondo alla scheda flash";

            default:
                return "Add border at the bottom of the flashcard";
        }
    }
    public get 在闪卡末尾插上一条横线() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "在闪卡末尾插上一条横线";
            case "es_ES":
                return "Agregar una línea al final de la tarjeta de memoria";
            case "fr_FR":
                return "Ajouter une ligne à la fin de la carte mémoire";
            case "ja_JP":
                return "フラッシュカードの末尾に横線を挿入する";
            case "zh_CHT":
                return "在閃卡末尾插上一條橫線";
            case "it_IT":
                return "Inserisci una linea alla fine della flashcard";

            default:
                return "Insert a horizontal line at the end of the flashcard";
        }
    }
    public get 新开窗口如何打开() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "新页签: 0不打开，1打开到前台，2打开到后台，3打开到右边，4打开到底部，5移动到新窗口，6打开到前台1秒";
            case "es_ES":
                return "Nueva pestaña: 0 no abrir, 1 abrir en primer plano, 2 abrir en segundo plano, 3 abrir a la derecha, 4 abrir en la parte inferior, 5 mover a una nueva ventana, 6 abrir en primer plano durante 1 segundo";
            case "fr_FR":
                return "Nouvel onglet : 0 ne pas ouvrir, 1 ouvrir au premier plan, 2 ouvrir en arrière-plan, 3 ouvrir à droite, 4 ouvrir en bas, 5 déplacer vers une nouvelle fenêtre, 6 ouvrir au premier plan pendant 1 seconde";
            case "ja_JP":
                return "新しいタブ: 0 開かない, 1 前面に開く, 2 背面に開く, 3 右に開く, 4 下に開く, 5 新しいウィンドウに移動, 6 前面に1秒間開く";
            case "zh_CHT":
                return "新頁籤: 0不開啟，1開啟到前台，2開啟到後台，3開啟到右邊，4開啟到底部，5移動到新視窗，6開啟到前台1秒";
            case "it_IT":
                return "Nuova scheda: 0 non aprire, 1 aprire in primo piano, 2 aprire in background, 3 aprire a destra, 4 aprire in basso, 5 spostare in una nuova finestra, 6 aprire in primo piano per 1 secondo";

            default:
                return "New tab: 0 do not open, 1 open in foreground, 2 open in background, 3 open to the right, 4 open to the bottom, 5 move to new window, 6 open in foreground for 1 second";
        }
    }
    public get 对分片制卡额外链接到分片() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "对分片制卡，闪卡除了链接到原文，还额外链接到分片。";
            case "es_ES":
                return "Para las tarjetas fragmentadas, las tarjetas flash están adicionalmente vinculadas a los fragmentos además de estar vinculadas al texto original.";
            case "fr_FR":
                return "Pour les cartes fragmentées, les cartes flash sont en outre liées aux fragments en plus d'être liées au texte original.";
            case "ja_JP":
                return "分割されたカードについて、フラッシュカードは原文にリンクするだけでなく、分割にも追加でリンクします。";
            case "zh_CHT":
                return "對分片制卡，閃卡除了鏈接到原文，還額外鏈接到分片。";

            default:
                return "For fragmented card making, flashcards are additionally linked to fragments in addition to being linked to the original text.";
        }
    }
    public get 闪卡的回溯使用链接() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "闪卡的回溯使用链接，否则用引用。";
            case "es_ES":
                return "Enlace de retroceso de la tarjeta flash, de lo contrario usa la referencia.";
            case "fr_FR":
                return "Lien de retour de la carte flash, sinon utilisez la référence.";
            case "ja_JP":
                return "フラッシュカードのリグレッションリンク、それ以外の場合は参照を使用します。";
            case "zh_CHT":
                return "閃卡的回溯使用連結，否則用引用。";

            default:
                return "Flashcard regression link, otherwise use reference.";
        }
    }
    public get 制卡时在末尾添加空行() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "制卡时，在末尾添加空行";
            case "es_ES":
                return "Al crear una tarjeta, agrega una línea en blanco al final";
            case "fr_FR":
                return "Lors de la création d'une carte, ajoutez une ligne vide à la fin";
            case "ja_JP":
                return "カード作成時に、末尾に空行を追加します";
            case "zh_CHT":
                return "制卡時，在末尾添加空行";

            default:
                return "When creating a card, add a blank line at the end";
        }
    }
    public get 摘抄不加入回溯链接() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "摘抄不加入回溯链接";
            case "es_ES":
                return "Extracto sin enlace retrospectivo";
            case "fr_FR":
                return "Extrait sans lien rétrospectif";
            case "ja_JP":
                return "引用にリンクを含めない";
            case "zh_CHT":
                return "摘抄不加入回溯鏈接";

            default:
                return "Excerpt without backlink";
        }
    }
    public get 分片不加入回溯链接() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "分片不加入回溯链接";
            case "es_ES":
                return "Fragmento no incluido en enlaces retrospectivos";
            case "fr_FR":
                return "Fragment non inclus dans les liens de rétrospection";
            case "ja_JP":
                return "フラグメントを遡及リンクに含めない";
            case "zh_CHT":
                return "分片不加入回溯鏈接";

            default:
                return "Fragment not included in backtrace links";
        }
    }
    public get 合并所有分片到新文件() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "合并所有分片到新文件";
            case "es_ES":
                return "Combinar todos los fragmentos en un nuevo archivo";
            case "fr_FR":
                return "Fusionner tous les fragments dans un nouveau fichier";
            case "ja_JP":
                return "すべてのフラグメントを新しいファイルにマージ";
            case "zh_CHT":
                return "合併所有分片到新文件";

            default:
                return "Merge all fragments into a new file";
        }
    }
    public get 摘录单词并加入闪卡并用AI解释() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "摘录单词并加入闪卡并用AI解释";
            case "es_ES":
                return "Extraer palabras y añadir a tarjetas flash con explicación de IA";
            case "fr_FR":
                return "Extraire des mots et ajouter aux fiches flash avec explication par IA";
            case "ja_JP":
                return "単語を抜粋してフラッシュカードに追加し、AIによる説明を行う";
            case "zh_CHT":
                return "摘錄單詞並加入閃卡並用AI解釋";

            default:
                return "Extract words and add to flashcards with AI explanation";
        }
    }
    public get 摘录单词() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "摘录单词";
            case "es_ES":
                return "Extraer palabras";
            case "fr_FR":
                return "Extraire des mots";
            case "ja_JP":
                return "単語を抜粋する";
            case "zh_CHT":
                return "摘錄單詞";

            default:
                return "Extract words";
        }
    }

    public get 摘录单词并加入闪卡() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "摘录单词并加入闪卡";
            case "es_ES":
                return "Extraer palabras y añadir a tarjetas flash";
            case "fr_FR":
                return "Extraire des mots et ajouter aux fiches";
            case "ja_JP":
                return "単語を抜粋してフラッシュカードに追加";
            case "zh_CHT":
                return "摘錄單詞並加入閃卡";

            default:
                return "Extract words and add to flashcards";
        }
    }
    public get 渐进学习的设置() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "渐进学习的设置";
            case "es_ES":
                return "Configuración de aprendizaje progresivo";
            case "fr_FR":
                return "Paramètres d'apprentissage progressif";
            case "ja_JP":
                return "段階的な学習の設定";
            case "zh_CHT":
                return "漸進學習的設定";

            default:
                return "Progressive Learning Settings";
        }
    }
    public get 按标点断句列表() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "按标点断句，形成列表/大纲";
            case "es_ES":
                return "Segmentar por puntuación, formar lista/esquema";
            case "fr_FR":
                return "Segmenter par ponctuation, former une liste/un plan";
            case "ja_JP":
                return "句読点で区切り、リスト/アウトラインを作成する";
            case "zh_CHT":
                return "按標點斷句，形成列表/大綱";

            default:
                return "Segment by punctuation, form list/outline";
        }
    }

    public get 按标点断句Checkbox() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "按标点断句，形成任务列表(可以ctrl+enter勾选任务)";
            case "es_ES":
                return "Segmentar por puntuación, formar lista de tareas (puede seleccionar tareas con ctrl+enter)";
            case "fr_FR":
                return "Segmenter par ponctuation, former une liste de tâches (vous pouvez cocher les tâches avec ctrl+enter)";
            case "ja_JP":
                return "句読点で区切り、タスクリストを作成する(ctrl+enterでタスクをチェックできます)";
            case "zh_CHT":
                return "按標點斷句，形成任務列表(可以ctrl+enter勾選任務)";

            default:
                return "Segment by punctuation, form task list (you can check tasks with ctrl+enter)";
        }
    }

    public get 按标点断句() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "按标点断句";
            case "es_ES":
                return "Segmentar por puntuación";
            case "fr_FR":
                return "Segmenter par ponctuation";
            case "ja_JP":
                return "句読点で区切る";
            case "zh_CHT":
                return "按標點斷句";

            default:
                return "Segment by punctuation";
        }
    }


}
