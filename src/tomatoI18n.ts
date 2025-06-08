import { TomatoI18nABC } from "./libs/text1";

export class TomatoI18n extends TomatoI18nABC {
    public get 间隔x分钟检查所有闪卡加上默认优先级() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "每多少分钟，扫描所有闪卡，补上默认优先级，0为不扫描";
            case "es_ES": return "Cada cuántos minutos, escanear todas las tarjetas flash y añadir prioridad predeterminada (0 para desactivar)";
            case "fr_FR": return "Toutes les X minutes, scanner toutes les cartes mémoire et ajouter la priorité par défaut (0 pour désactiver)";
            case "ja_JP": return "何分ごとにすべてのフラッシュカードをスキャンし、デフォルトの優先度を追加するか（0でスキャンしない）";
            case "zh_CHT": return "每多少分鐘，掃描所有閃卡，補上默認優先級，0為不掃描";
            case "it_IT": return "Ogni quanti minuti, scansiona tutte le flashcard e aggiungi la priorità predefinita (0 per disabilitare)";
            case "de_DE": return "Alle X Minuten alle Karteikarten scannen und Standardpriorität hinzufügen (0 deaktiviert)";
            case "he_IL": return "כל כמה דקות, סרוק את כל הכרטיסיות והוסף עדיפות ברירת מחדל (0 כדי לכבות)";
            case "ru_RU": return "Каждые сколько минут сканировать все карточки и добавлять приоритет по умолчанию (0 для отключения)";
            case "pl_PL": return "Co ile minut skanować wszystkie fiszki i dodawać domyślny priorytet (0 aby wyłączyć)";
            case "en_US":
            default: return "Scan all flashcards and add default priority every X minutes (0 to disable)";
        }
    }

    public get 打开批注页签() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "打开批注页签";
            case "es_ES": return "Abrir pestaña de anotaciones";
            case "fr_FR": return "Ouvrir l'onglet d'annotation";
            case "ja_JP": return "注釈タブを開く";
            case "zh_CHT": return "打開批註頁籤";
            case "it_IT": return "Apri scheda annotazioni";
            case "de_DE": return "Annotationen-Tab öffnen";
            case "he_IL": return "פתח את לשונית ההערות";
            case "ru_RU": return "Открыть вкладку аннотаций";
            case "pl_PL": return "Otwórz zakładkę adnotacji";
            case "en_US":
            default: return "Open annotation tab";
        }
    }

    public get 所有原文都加引用() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "所有原文都加引用";
            case "es_ES": return "Añadir cita a todos los textos originales";
            case "fr_FR": return "Ajouter une citation à tous les textes originaux";
            case "ja_JP": return "すべての原文に引用を追加";
            case "zh_CHT": return "所有原文都加引用";
            case "it_IT": return "Aggiungi citazione a tutti i testi originali";
            case "de_DE": return "Zitat zu allen Originaltexten hinzufügen";
            case "he_IL": return "הוסף ציטוט לכל הטקסטים המקוריים";
            case "ru_RU": return "Добавить цитирование ко всем исходным текстам";
            case "pl_PL": return "Dodaj cytat do wszystkich oryginalnych tekstów";
            case "en_US":
            default: return "Add citation to all original texts";
        }
    }

    public get 块折叠助手() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "块折叠助手";
            case "es_ES": return "Asistente de plegado de bloques";
            case "fr_FR": return "Assistant de repliement de blocs";
            case "ja_JP": return "ブロック折りたたみヘルパー";
            case "zh_CHT": return "塊折疊助手";
            case "it_IT": return "Assistente piegatura blocchi";
            case "de_DE": return "Block-Falt-Hilfe";
            case "he_IL": return "עוזר קיפול בלוקים";
            case "ru_RU": return "Помощник сворачивания блоков";
            case "pl_PL": return "Pomocnik zwijania bloków";
            case "en_US":
            default: return "Block folding helper";
        }
    }

    public get 超级块() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "超级块";
            case "es_ES": return "Super bloque";
            case "fr_FR": return "Super bloc";
            case "ja_JP": return "スーパーブロック";
            case "zh_CHT": return "超級塊";
            case "it_IT": return "Super blocco";
            case "de_DE": return "Super-Block";
            case "he_IL": return "בלוק על";
            case "ru_RU": return "Супер блок";
            case "pl_PL": return "Super blok";
            case "en_US":
            default: return "Super block";
        }
    }

    public get 表格() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "表格";
            case "es_ES": return "Tabla";
            case "fr_FR": return "Tableau";
            case "ja_JP": return "表";
            case "zh_CHT": return "表格";
            case "it_IT": return "Tabella";
            case "de_DE": return "Tabelle";
            case "he_IL": return "טבלה";
            case "ru_RU": return "Таблица";
            case "pl_PL": return "Tabela";
            case "en_US":
            default: return "Table";
        }
    }

    public get 列表块() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "列表块";
            case "es_ES": return "Bloque de lista";
            case "fr_FR": return "Bloc de liste";
            case "ja_JP": return "リストブロック";
            case "zh_CHT": return "列表塊";
            case "it_IT": return "Blocco elenco";
            case "de_DE": return "Listenblock";
            case "he_IL": return "בלוק רשימה";
            case "ru_RU": return "Блок списка";
            case "pl_PL": return "Blok listy";
            case "en_US":
            default: return "List block";
        }
    }

    public get 引述块() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "引述块";
            case "es_ES": return "Bloque de cita";
            case "fr_FR": return "Bloc de citation";
            case "ja_JP": return "引用ブロック";
            case "zh_CHT": return "引述塊";
            case "it_IT": return "Blocco citazione";
            case "de_DE": return "Zitatblock";
            case "he_IL": return "בלוק ציטוט";
            case "ru_RU": return "Блок цитирования";
            case "pl_PL": return "Blok cytatu";
            case "en_US":
            default: return "Quote block";
        }
    }

    public get 在块的右上角显示折叠图标() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "在块的右上角显示折叠图标";
            case "es_ES": return "Mostrar el icono de plegar en la esquina superior derecha del bloque";
            case "fr_FR": return "Afficher l'icône de réduction dans le coin supérieur droit du bloc";
            case "ja_JP": return "ブロックの右上に折りたたみアイコンを表示";
            case "zh_CHT": return "在區塊的右上角顯示折疊圖示";
            case "it_IT": return "Mostra l'icona di compressione nell'angolo in alto a destra del blocco";
            case "de_DE": return "Minimieren-Symbol in der oberen rechten Ecke des Blocks anzeigen";
            case "he_IL": return "הצג את סמל הקיפול בפינה הימנית העליונה של הבלוק";
            case "ru_RU": return "Показать значок сворачивания в правом верхнем углу блока";
            case "pl_PL": return "Pokaż ikonę zwijania w prawym górnym rogu bloku";
            case "en_US":
            default: return "Show collapse icon at the top right corner of the block";
        }
    }

    public get 标题() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "标题";
            case "es_ES": return "Título";
            case "fr_FR": return "Titre";
            case "ja_JP": return "タイトル";
            case "zh_CHT": return "標題";
            case "it_IT": return "Titolo";
            case "de_DE": return "Titel";
            case "he_IL": return "כותרת";
            case "ru_RU": return "Заголовок";
            case "pl_PL": return "Tytuł";
            case "en_US":
            default: return "Title";
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
