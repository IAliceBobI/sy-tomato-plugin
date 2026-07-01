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