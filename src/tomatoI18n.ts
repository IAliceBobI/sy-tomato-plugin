import { TomatoI18nABC } from "./libs/text1";

export class TomatoI18n extends TomatoI18nABC {
    public get 悬浮球() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "悬浮球";
            case "es_ES": return "Bola flotante";
            case "fr_FR": return "Boule flottante";
            case "ja_JP": return "フローティングボール";
            case "zh_CHT": return "懸浮球";
            case "it_IT": return "Sfera fluttuante";
            case "de_DE": return "Schwebende Kugel";
            case "he_IL": return "כדור צף";
            case "ru_RU": return "Плавающий шар";
            case "pl_PL": return "Pływająca kula";
            case "en_US":
            default: return "Floating ball";
        }
    }
    public get 使用小窗打开() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "使用小窗打开";
            case "es_ES": return "Abrir en ventana pequeña";
            case "fr_FR": return "Ouvrir dans une petite fenêtre";
            case "ja_JP": return "小さいウィンドウで開く";
            case "zh_CHT": return "使用小窗打開";
            case "it_IT": return "Apri in finestra piccola";
            case "de_DE": return "Im kleinen Fenster öffnen";
            case "he_IL": return "פתח בחלון קטן";
            case "ru_RU": return "Открыть в маленьком окне";
            case "pl_PL": return "Otwórz w małym oknie";
            case "en_US":
            default: return "Open in small window";
        }
    }
    public get 图标() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "图标";
            case "es_ES": return "Icono";
            case "fr_FR": return "Icône";
            case "ja_JP": return "アイコン";
            case "zh_CHT": return "圖標";
            case "it_IT": return "Icona";
            case "de_DE": return "Symbol";
            case "he_IL": return "סמל";
            case "ru_RU": return "Иконка";
            case "pl_PL": return "Ikona";
            case "en_US":
            default: return "Icon";
        }
    }
    public get 文档名() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "文档名";
            case "es_ES": return "Nombre del documento";
            case "fr_FR": return "Nom du document";
            case "ja_JP": return "ドキュメント名";
            case "zh_CHT": return "文件名";
            case "it_IT": return "Nome del documento";
            case "de_DE": return "Dokumentenname";
            case "he_IL": return "שם מסמך";
            case "ru_RU": return "Имя документа";
            case "pl_PL": return "Nazwa dokumentu";
            case "en_US":
            default: return "Document name";
        }
    }
    public get 快捷键() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "快捷键";
            case "es_ES": return "Atajo de teclado";
            case "fr_FR": return "Raccourci clavier";
            case "ja_JP": return "ショートカットキー";
            case "zh_CHT": return "快捷鍵";
            case "it_IT": return "Tasto di scelta rapida";
            case "de_DE": return "Tastenkürzel";
            case "he_IL": return "קיצור מקשים";
            case "ru_RU": return "Горячая клавиша";
            case "pl_PL": return "Skrót klawiszowy";
            case "en_US":
            default: return "Shortcut key";
        }
    }
    public get 找不到文档() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "找不到文档";
            case "es_ES": return "No se encontró el documento";
            case "fr_FR": return "Document introuvable";
            case "ja_JP": return "ドキュメントが見つかりません";
            case "zh_CHT": return "找不到文件";
            case "it_IT": return "Documento non trovato";
            case "de_DE": return "Dokument nicht gefunden";
            case "he_IL": return "המסמך לא נמצא";
            case "ru_RU": return "Документ не найден";
            case "pl_PL": return "Nie znaleziono dokumentu";
            case "en_US":
            default: return "Document not found";
        }
    }
    public get 绑定文档到悬浮按钮() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "绑定文档到悬浮按钮";
            case "es_ES": return "Vincular documento al botón flotante";
            case "fr_FR": return "Lier le document au bouton flottant";
            case "ja_JP": return "ドキュメントをフローティングボタンにバインド";
            case "zh_CHT": return "綁定文件到懸浮按鈕";
            case "it_IT": return "Associa documento al pulsante flottante";
            case "de_DE": return "Dokument an Schwebeschaltfläche binden";
            case "he_IL": return "קשר מסמך לכפתור הצף";
            case "ru_RU": return "Привязать документ к плавающей кнопке";
            case "pl_PL": return "Powiąż dokument z przyciskiem pływającym";
            case "en_US":
            default: return "Bind document to floating button";
        }
    }
    public get 绑定快捷键到悬浮按钮() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "绑定快捷键到悬浮按钮";
            case "es_ES": return "Vincular atajo al botón flotante";
            case "fr_FR": return "Lier le raccourci au bouton flottant";
            case "ja_JP": return "ショートカットキーをフローティングボタンにバインド";
            case "zh_CHT": return "綁定快捷鍵到懸浮按鈕";
            case "it_IT": return "Associa scorciatoia al pulsante flottante";
            case "de_DE": return "Tastenkürzel an Schwebeschaltfläche binden";
            case "he_IL": return "קשר קיצור מקשים לכפתור הצף";
            case "ru_RU": return "Привязать горячую клавишу к плавающей кнопке";
            case "pl_PL": return "Powiąż skrót z przyciskiem pływającym";
            case "en_US":
            default: return "Bind shortcut key to floating button";
        }
    }
    public get 键() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "键";
            case "es_ES": return "Tecla";
            case "fr_FR": return "Touche";
            case "ja_JP": return "キー";
            case "zh_CHT": return "鍵";
            case "it_IT": return "Tasto";
            case "de_DE": return "Taste";
            case "he_IL": return "מקש";
            case "ru_RU": return "Клавиша";
            case "pl_PL": return "Klawisz";
            case "en_US":
            default: return "Key";
        }
    }
    public get 桌面端() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "桌面端";
            case "es_ES": return "Escritorio";
            case "fr_FR": return "Bureau";
            case "ja_JP": return "デスクトップ";
            case "zh_CHT": return "桌面端";
            case "it_IT": return "Desktop";
            case "de_DE": return "Desktop";
            case "he_IL": return "שולחן עבודה";
            case "ru_RU": return "Десктоп";
            case "pl_PL": return "Pulpit";
            case "en_US":
            default: return "Desktop";
        }
    }
    public get 移动端() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "移动端";
            case "es_ES": return "Móvil";
            case "fr_FR": return "Mobile";
            case "ja_JP": return "モバイル";
            case "zh_CHT": return "移動端";
            case "it_IT": return "Mobile";
            case "de_DE": return "Mobil";
            case "he_IL": return "נייד";
            case "ru_RU": return "Мобильный";
            case "pl_PL": return "Mobilny";
            case "en_US":
            default: return "Mobile";
        }
    }
    public get 特殊绑定当天日志() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "特殊：绑定当天日志";
            case "es_ES": return "Especial: vincular el registro del día";
            case "fr_FR": return "Spécial : lier le journal du jour";
            case "ja_JP": return "特別：当日のログをバインド";
            case "zh_CHT": return "特殊：綁定當天日誌";
            case "it_IT": return "Speciale: associa il registro del giorno";
            case "de_DE": return "Speziell: Tagesprotokoll binden";
            case "he_IL": return "מיוחד: קישור יומן היום";
            case "ru_RU": return "Особое: привязать журнал за день";
            case "pl_PL": return "Specjalne: powiąż dziennik dnia";
            case "en_US":
            default: return "Special: bind today's log";
        }
    }
    public 非VIP上限为x个(x: number, unit: string) {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return `非VIP上限为${x}个${unit}`;
            case "es_ES": return `El límite para no VIP es de ${x} ${unit}`;
            case "fr_FR": return `La limite pour les non VIP est de ${x} ${unit}`;
            case "ja_JP": return `非VIPの上限は${x}${unit}です`;
            case "zh_CHT": return `非VIP上限為${x}個${unit}`;
            case "it_IT": return `Il limite per i non VIP è di ${x} ${unit}`;
            case "de_DE": return `Das Limit für Nicht-VIPs beträgt ${x} ${unit}`;
            case "he_IL": return `המגבלה ללא VIP היא ${x} ${unit}`;
            case "ru_RU": return `Лимит для не-VIP составляет ${x} ${unit}`;
            case "pl_PL": return `Limit dla nie-VIP to ${x} ${unit}`;
            case "en_US":
            default: return `Non-VIP limit is ${x} ${unit}`;
        }
    }
    public get 文档正引说明() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "展示当前文档中所有正引内容";
            case "es_ES": return "Mostrar todo el contenido citado positivamente en el documento actual";
            case "fr_FR": return "Afficher tout le contenu cité positivement dans le document actuel";
            case "ja_JP": return "現在のドキュメント内のすべての正引用内容を表示";
            case "zh_CHT": return "展示當前文件中所有正引內容";
            case "it_IT": return "Mostra tutti i contenuti citati positivamente nel documento corrente";
            case "de_DE": return "Alle positiv zitierten Inhalte im aktuellen Dokument anzeigen";
            case "he_IL": return "הצג את כל התוכן המצוטט באופן חיובי במסמך הנוכחי";
            case "ru_RU": return "Показать все положительно цитируемое содержимое в текущем документе";
            case "pl_PL": return "Pokaż całą pozytywnie cytowaną treść w bieżącym dokumencie";
            case "en_US":
            default: return "Show all positively cited content in the current document";
        }
    }
    public get 在当前文档中定位() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "在当前文档中定位";
            case "es_ES": return "Localizar en el documento actual";
            case "fr_FR": return "Localiser dans le document actuel";
            case "ja_JP": return "現在のドキュメントで位置を特定";
            case "zh_CHT": return "在當前文件中定位";
            case "it_IT": return "Individua nel documento corrente";
            case "de_DE": return "Im aktuellen Dokument lokalisieren";
            case "he_IL": return "אתר במסמך הנוכחי";
            case "ru_RU": return "Найти в текущем документе";
            case "pl_PL": return "Zlokalizuj w bieżącym dokumencie";
            case "en_US":
            default: return "Locate in current document";
        }
    }
    public get vip功能() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "VIP功能";
            case "es_ES": return "Función VIP";
            case "fr_FR": return "Fonction VIP";
            case "ja_JP": return "VIP機能";
            case "zh_CHT": return "VIP功能";
            case "it_IT": return "Funzione VIP";
            case "de_DE": return "VIP-Funktion";
            case "he_IL": return "פונקציית VIP";
            case "ru_RU": return "Функция VIP";
            case "pl_PL": return "Funkcja VIP";
            case "en_US":
            default: return "VIP feature";
        }
    }
    public get 解除悬浮球与文档之间的绑定() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "解除悬浮球与文档之间的绑定";
            case "es_ES": return "Desvincular la bola flotante del documento";
            case "fr_FR": return "Dissocier la boule flottante du document";
            case "ja_JP": return "フローティングボールとドキュメントの関連付けを解除";
            case "zh_CHT": return "解除懸浮球與文件之間的綁定";
            case "it_IT": return "Scollega la sfera fluttuante dal documento";
            case "de_DE": return "Verbindung zwischen schwebender Kugel und Dokument aufheben";
            case "he_IL": return "בטל קישור בין הכדור הצף למסמך";
            case "ru_RU": return "Отвязать плавающий шар от документа";
            case "pl_PL": return "Odłącz pływającą kulę od dokumentu";
            case "en_US":
            default: return "Unbind floating ball from document";
        }
    }
    public get 创建闪卡时添加所有虚拟引用到第一行() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "创建闪卡时，添加所有虚拟引用，到第一行";
            case "es_ES": return "Al crear una tarjeta, añade todas las referencias virtuales a la primera línea";
            case "fr_FR": return "Lors de la création d'une carte, ajoutez toutes les références virtuelles à la première ligne";
            case "ja_JP": return "フラッシュカード作成時、すべての仮想参照を最初の行に追加します";
            case "zh_CHT": return "建立閃卡時，將所有虛擬引用添加到第一行";
            case "it_IT": return "Quando crei una flashcard, aggiungi tutti i riferimenti virtuali alla prima riga";
            case "de_DE": return "Beim Erstellen einer Karte alle virtuellen Verweise in die erste Zeile einfügen";
            case "he_IL": return "בעת יצירת כרטיס פלאש, הוסף את כל ההפניות הווירטואליות לשורה הראשונה";
            case "ru_RU": return "При создании карточки добавьте все виртуальные ссылки в первую строку";
            case "pl_PL": return "Podczas tworzenia fiszki dodaj wszystkie wirtualne odnośniki do pierwszego wiersza";
            case "en_US":
            default: return "When creating a flashcard, add all virtual references to the first line";
        }
    }
    public get 移动内容到dailynote后原文改为链接() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "移动内容到 dailynote 后，原文改为链接";
            case "es_ES": return "Después de mover el contenido a dailynote, el texto original se convierte en un enlace";
            case "fr_FR": return "Après avoir déplacé le contenu vers dailynote, le texte original devient un lien";
            case "ja_JP": return "内容をdailynoteに移動した後、元のテキストはリンクに変更されます";
            case "zh_CHT": return "移動內容到 dailynote 後，原文改為連結";
            case "it_IT": return "Dopo aver spostato il contenuto su dailynote, il testo originale viene trasformato in un link";
            case "de_DE": return "Nach dem Verschieben des Inhalts zu dailynote wird der Originaltext zu einem Link";
            case "he_IL": return "לאחר העברת התוכן ל-dailynote, הטקסט המקורי הופך לקישור";
            case "ru_RU": return "После перемещения содержимого в dailynote исходный текст становится ссылкой";
            case "pl_PL": return "Po przeniesieniu treści do dailynote oryginalny tekst zostaje zamieniony na link";
            case "en_US":
            default: return "After moving content to dailynote, the original text becomes a link";
        }
    }
    public get 前缀文档树() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "前缀文档树";
            case "es_ES": return "Árbol de documentos de prefijo";
            case "fr_FR": return "Arbre de documents préfixés";
            case "ja_JP": return "プレフィックスドキュメントツリー";
            case "zh_CHT": return "前綴文件樹";
            case "it_IT": return "Albero dei documenti prefisso";
            case "de_DE": return "Präfix-Dokumentbaum";
            case "he_IL": return "עץ מסמכים עם קידומת";
            case "ru_RU": return "Дерево документов с префиксом";
            case "pl_PL": return "Drzewo dokumentów z prefiksem";
            case "en_US":
            default: return "Prefix document tree";
        }
    }
    public get aaa() {
        // tyepscript: 翻译为各国语言。写入case的return中。
        // 不要改属性名字，不要添加其他代码，不要改错，就改当前代码片段。en_US与default返回语言一致。
        // 最后删除注释。
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "aaa";
            case "es_ES":
            case "fr_FR":
            case "ja_JP":
            case "zh_CHT":
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
        }
    }
}

// public[^get]+\(  查找所有的函数
export const tomatoI18n = new TomatoI18n();
