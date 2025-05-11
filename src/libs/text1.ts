import { TomatoI18nABC2 } from "./text2";

export abstract class TomatoI18nABC extends TomatoI18nABC2 {
    public get 批量删除大量连续内容块() {
        switch (this.conf.appearance.lang) {
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
        switch (this.conf.appearance.lang) {
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
        switch (this.conf.appearance.lang) {
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
        switch (this.conf.appearance.lang) {
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
        switch (this.conf.appearance.lang) {
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