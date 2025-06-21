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
    public get 非VIP上限为两个() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "非VIP上限为两个";
            case "es_ES": return "El límite para no VIP es dos";
            case "fr_FR": return "La limite pour les non VIP est de deux";
            case "ja_JP": return "非VIPの上限は2つです";
            case "zh_CHT": return "非VIP上限為兩個";
            case "it_IT": return "Il limite per i non VIP è due";
            case "de_DE": return "Das Limit für Nicht-VIPs beträgt zwei";
            case "he_IL": return "המגבלה ללא VIP היא שניים";
            case "ru_RU": return "Лимит для не-VIP — два";
            case "pl_PL": return "Limit dla nie-VIP to dwa";
            case "en_US":
            default: return "Non-VIP limit is two";
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
