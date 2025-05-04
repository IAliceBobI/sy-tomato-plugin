import { TomatoI18nABC } from "./libs/text1";

export class TomatoI18n extends TomatoI18nABC {
    public get 提取所有分片的笔记() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "提取所有分片的笔记";
            case "es_ES": return "Extraer notas de todos los fragmentos";
            case "fr_FR": return "Extraire toutes les notes des fragments";
            case "ja_JP": return "すべてのフラグメントからノートを抽出";
            case "zh_CHT": return "提取所有分片的筆記";
            case "it_IT": return "Estrai tutte le note dai frammenti";
            case "de_DE": return "Extrahiere alle Notizen aus den Fragmenten";
            case "he_IL": return "שלוף את כל הפתקים מכל השרשראות";
            case "ru_RU": return "Извлечь все заметки из фрагментов";
            case "pl_PL": return "Wyodrębnij wszystkie notatki z fragmentów";
            case "en_US":
            default: return "Extract notes from all fragments";
        }
    }

    public get 分片功能() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "分片功能";
            case "es_ES": return "Funcionalidad de fragmentación";
            case "fr_FR": return "Fonctionnalité de fragmentation";
            case "ja_JP": return "フラグメント機能";
            case "zh_CHT": return "分片功能";
            case "it_IT": return "Funzionalità frammento";
            case "de_DE": return "Fragment-Funktion";
            case "he_IL": return "פונקציית שרשראות";
            case "ru_RU": return "Функция фрагментов";
            case "pl_PL": return "Funkcja fragmentu";
            case "en_US":
            default: return "Fragment Functionality";
        }
    }

    public get 用选中的行创建超级块超级块制卡取消制卡() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "用选中的行创建超级块、超级块制卡、取消制卡(ctrl+1)";
            case "es_ES": return "Crear bloque superpuesto, tarjeta de bloque superpuesto y cancelar tarjeta con la línea seleccionada (Ctrl+1)";
            case "fr_FR": return "Créer un bloc superposé, créer une carte de bloc superposé, annuler la création (Ctrl+1)";
            case "ja_JP": return "選択行でスーパーブロックを作成、スーパーブロックカード作成、カード作成をキャンセル（Ctrl+1）";
            case "zh_CHT": return "用選中的一行創建超級塊、超級塊製卡、取消製卡(Ctrl+1)";
            case "it_IT": return "Crea blocco superiore, crea scheda blocco superiore, annulla creazione scheda (Ctrl+1)";
            case "de_DE": return "Erstelle einen Superblock mit der ausgewählten Zeile, erstelle eine Superblock-Karte, erstellung abbrechen (Strg+1)";
            case "he_IL": return "צור בלוק סופר משורת בחירה, צור כרטיס סופר בלוק, בטל יצירה (Ctrl+1)";
            case "ru_RU": return "Создать суперблок из выделенной строки, создать карточку суперблока, отменить создание (Ctrl+1)";
            case "pl_PL": return "Utwórz nadblok z wybranego wiersza, twórz kartę nadbloku, anuluj tworzenie (Ctrl+1)";
            case "en_US":
            default: return "Create a super block with the selected row, create a super block card, cancel creation (Ctrl+1)";
        }
    }

    public get 创建超级块时添加相关匹配到的引用() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "创建超级块时，添加相关匹配到的引用";
            case "es_ES": return "Agregar referencias relacionadas coincidentes al crear un bloque superpuesto";
            case "fr_FR": return "Ajouter des références correspondantes lors de la création d'un bloc superposé";
            case "ja_JP": return "スーパーブロック作成時に一致した関連参照を追加する";
            case "zh_CHT": return "創建超級塊時，添加相關匹配到的引用";
            case "it_IT": return "Aggiungi riferimenti corrispondenti quando si crea un blocco superiore";
            case "de_DE": return "Beim Erstellen eines Superblocks relevante übereinstimmende Referenzen hinzufügen";
            case "he_IL": return "הוסף הפניות תואמות בעת יצירת בלוק סופר";
            case "ru_RU": return "Добавлять соответствующие ссылки при создании суперблока";
            case "pl_PL": return "Dodaj pasujące odniesienia przy tworzeniu nadbloku";
            case "en_US":
            default: return "Add relevant matching references when creating a super block";
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
