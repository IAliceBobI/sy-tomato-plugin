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
    public get 添加文档() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "添加文档";
            case "es_ES": return "Agregar documento";
            case "fr_FR": return "Ajouter un document";
            case "ja_JP": return "ドキュメントを追加";
            case "zh_CHT": return "添加文件";
            case "it_IT": return "Aggiungi documento";
            case "de_DE": return "Dokument hinzufügen";
            case "he_IL": return "הוסף מסמך";
            case "ru_RU": return "Добавить документ";
            case "pl_PL": return "Dodaj dokument";
            case "en_US":
            default: return "Add document";
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
