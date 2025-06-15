import { TomatoI18nABC } from "./libs/text1";

export class TomatoI18n extends TomatoI18nABC {

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

    public get 时间到播放声音() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "时间到播放声音（可以是网络url或者本地路径c:\\abc.mp3）";
            case "es_ES": return "Reproducir sonido cuando termine el tiempo (puede ser una URL o una ruta local como c:\\abc.mp3)";
            case "fr_FR": return "Jouer un son à la fin du temps (peut être une URL ou un chemin local comme c:\\abc.mp3)";
            case "ja_JP": return "時間になったら音を再生（URLまたはローカルパスc:\\abc.mp3が使用可能）";
            case "zh_CHT": return "時間到播放聲音（可以是網路url或本地路徑c:\\abc.mp3）";
            case "it_IT": return "Riproduci suono allo scadere del tempo (può essere un URL o un percorso locale come c:\\abc.mp3)";
            case "de_DE": return "Ton abspielen, wenn die Zeit abgelaufen ist (kann eine URL oder ein lokaler Pfad wie c:\\abc.mp3 sein)";
            case "he_IL": return "נגן צליל כאשר הזמן נגמר (יכול להיות כתובת URL או נתיב מקומי כמו c:\\abc.mp3)";
            case "ru_RU": return "Воспроизвести звук по окончании времени (может быть URL или локальный путь, например c:\\abc.mp3)";
            case "pl_PL": return "Odtwórz dźwięk po upływie czasu (może to być adres URL lub lokalna ścieżka, np. c:\\abc.mp3)";
            case "en_US":
            default: return "Play sound when time is up (can be a URL or local path like c:\\abc.mp3)";
        }
    }

    public get 刷新文档正引() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "刷新文档正引";
            case "es_ES": return "Actualizar citas directas del documento";
            case "fr_FR": return "Rafraîchir les citations directes du document";
            case "ja_JP": return "ドキュメントのインライン引用を更新";
            case "zh_CHT": return "刷新文件正引";
            case "it_IT": return "Aggiorna citazioni dirette del documento";
            case "de_DE": return "Direktzitate im Dokument aktualisieren";
            case "he_IL": return "רענן ציטוטים ישירים במסמך";
            case "ru_RU": return "Обновить прямые цитаты в документе";
            case "pl_PL": return "Odśwież cytaty bezpośrednie w dokumencie";
            case "en_US":
            default: return "Refresh document direct citations";
        }
    }

    public get 导出工作空间() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "导出工作空间";
            case "es_ES": return "Exportar espacio de trabajo";
            case "fr_FR": return "Exporter l'espace de travail";
            case "ja_JP": return "ワークスペースをエクスポート";
            case "zh_CHT": return "導出工作空間";
            case "it_IT": return "Esporta spazio di lavoro";
            case "de_DE": return "Arbeitsbereich exportieren";
            case "he_IL": return "ייצא סביבת עבודה";
            case "ru_RU": return "Экспортировать рабочее пространство";
            case "pl_PL": return "Eksportuj przestrzeń roboczą";
            case "en_US":
            default: return "Export workspace";
        }
    }

    public get 全量导出() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "全量导出";
            case "es_ES": return "Exportación completa";
            case "fr_FR": return "Exportation complète";
            case "ja_JP": return "全量エクスポート";
            case "zh_CHT": return "全量導出";
            case "it_IT": return "Esportazione completa";
            case "de_DE": return "Vollständiger Export";
            case "he_IL": return "ייצוא מלא";
            case "ru_RU": return "Полный экспорт";
            case "pl_PL": return "Eksport pełny";
            case "en_US":
            default: return "Full export";
        }
    }

    public get 增量导出() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "增量导出";
            case "es_ES": return "Exportación incremental";
            case "fr_FR": return "Exportation incrémentielle";
            case "ja_JP": return "増分エクスポート";
            case "zh_CHT": return "增量導出";
            case "it_IT": return "Esportazione incrementale";
            case "de_DE": return "Inkrementeller Export";
            case "he_IL": return "ייצוא הדרגתי";
            case "ru_RU": return "Инкрементальный экспорт";
            case "pl_PL": return "Eksport przyrostowy";
            case "en_US":
            default: return "Incremental export";
        }
    }

    public get 没有需要导出的文档() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "没有需要导出的文档";
            case "es_ES": return "No hay documentos para exportar";
            case "fr_FR": return "Aucun document à exporter";
            case "ja_JP": return "エクスポートするドキュメントがありません";
            case "zh_CHT": return "沒有需要導出的文件";
            case "it_IT": return "Nessun documento da esportare";
            case "de_DE": return "Keine Dokumente zum Exportieren vorhanden";
            case "he_IL": return "אין מסמכים לייצא";
            case "ru_RU": return "Нет документов для экспорта";
            case "pl_PL": return "Brak dokumentów do eksportu";
            case "en_US":
            default: return "No documents to export";
        }
    }

    public get 导出工作空间正在进行中请稍后再试() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "导出工作空间正在进行中，请稍后再试";
            case "es_ES": return "La exportación del espacio de trabajo está en curso, inténtalo de nuevo más tarde";
            case "fr_FR": return "L'exportation de l'espace de travail est en cours, veuillez réessayer plus tard";
            case "ja_JP": return "ワークスペースのエクスポートが進行中です。しばらくしてから再試行してください";
            case "zh_CHT": return "導出工作空間正在進行中，請稍後再試";
            case "it_IT": return "L'esportazione dello spazio di lavoro è in corso, riprova più tardi";
            case "de_DE": return "Der Export des Arbeitsbereichs läuft, bitte versuche es später erneut";
            case "he_IL": return "ייצוא סביבת העבודה מתבצע כעת, נסה שוב מאוחר יותר";
            case "ru_RU": return "Экспорт рабочего пространства выполняется, попробуйте позже";
            case "pl_PL": return "Trwa eksport przestrzeni roboczej, spróbuj ponownie później";
            case "en_US":
            default: return "Workspace export is in progress, please try again later";
        }
    }

    public 间隔x分钟检查所有闪卡加上默认优先级(x: string) {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return `每间隔${x}分钟检查所有闪卡，并加上默认优先级`;
            case "es_ES": return `Comprobar todas las tarjetas flash cada ${x} minutos y asignar la prioridad predeterminada`;
            case "fr_FR": return `Vérifier toutes les flashcards toutes les ${x} minutes et attribuer la priorité par défaut`;
            case "ja_JP": return `${x}分ごとにすべてのフラッシュカードをチェックし、デフォルトの優先度を付与`;
            case "zh_CHT": return `每間隔${x}分鐘檢查所有閃卡，並加上預設優先級`;
            case "it_IT": return `Controlla tutte le flashcard ogni ${x} minuti e assegna la priorità predefinita`;
            case "de_DE": return `Alle ${x} Minuten alle Karteikarten überprüfen und Standardpriorität zuweisen`;
            case "he_IL": return `בדוק את כל כרטיסי הברק כל ${x} דקות והוסף עדיפות ברירת מחדל`;
            case "ru_RU": return `Проверять все флеш-карты каждые ${x} минут и назначать приоритет по умолчанию`;
            case "pl_PL": return `Sprawdzaj wszystkie fiszki co ${x} minut i ustaw domyślny priorytet`;
            case "en_US":
            default: return `Check all flashcards every ${x} minutes and assign default priority`;
        }
    }

    public get 不扫描优先级() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "不扫描优先级";
            case "es_ES": return "No escanear prioridad";
            case "fr_FR": return "Ne pas scanner la priorité";
            case "ja_JP": return "優先度をスキャンしない";
            case "zh_CHT": return "不掃描優先級";
            case "it_IT": return "Non scansionare la priorità";
            case "de_DE": return "Priorität nicht scannen";
            case "he_IL": return "אל תסרוק עדיפות";
            case "ru_RU": return "Не сканировать приоритет";
            case "pl_PL": return "Nie skanuj priorytetu";
            case "en_US":
            default: return "Do not scan priority";
        }
    }

    public get 导出工作空间到此文件夹() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "导出工作空间到此文件夹";
            case "es_ES": return "Exportar espacio de trabajo a esta carpeta";
            case "fr_FR": return "Exporter l'espace de travail dans ce dossier";
            case "ja_JP": return "ワークスペースをこのフォルダーにエクスポート";
            case "zh_CHT": return "導出工作空間到此資料夾";
            case "it_IT": return "Esporta spazio di lavoro in questa cartella";
            case "de_DE": return "Arbeitsbereich in diesen Ordner exportieren";
            case "he_IL": return "ייצא סביבת עבודה לתיקיה זו";
            case "ru_RU": return "Экспортировать рабочее пространство в эту папку";
            case "pl_PL": return "Eksportuj przestrzeń roboczą do tego folderu";
            case "en_US":
            default: return "Export workspace to this folder";
        }
    }
    public get 添加到导出工作空间的白名单() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "添加到导出工作空间的白名单";
            case "es_ES": return "Agregar a la lista blanca del espacio de trabajo de exportación";
            case "fr_FR": return "Ajouter à la liste blanche de l'espace de travail d'exportation";
            case "ja_JP": return "エクスポートワークスペースのホワイトリストに追加";
            case "zh_CHT": return "添加到導出工作空間的白名單";
            case "it_IT": return "Aggiungere alla lista bianca dello spazio di lavoro di esportazione";
            case "de_DE": return "Zur Whitelist des Export-Arbeitsbereichs hinzufügen";
            case "he_IL": return "הוסף לרשימה הלבנה של סביבת העבודה לייצוא";
            case "ru_RU": return "Добавить в белый список рабочего пространства экспорта";
            case "pl_PL": return "Dodaj do białej listy przestrzeni roboczej eksportu";
            case "en_US":
            default: return "Add to export workspace whitelist";
        }
    }
    public get 白名单为空请先在文档树中右键添加文档() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "白名单为空，请先在文档树中右键添加文档";
            case "es_ES": return "La lista blanca está vacía. Por favor, agregue un documento haciendo clic derecho en el árbol de documentos.";
            case "fr_FR": return "La liste blanche est vide. Veuillez ajouter un document en cliquant avec le bouton droit dans l'arborescence des documents.";
            case "ja_JP": return "ホワイトリストが空です。まず文書ツリーで右クリックして文書を追加してください。";
            case "zh_CHT": return "白名單為空，請先在文檔樹中右鍵添加文檔";
            case "it_IT": return "L'elenco bianco è vuoto. Aggiungere un documento facendo clic con il pulsante destro del mouse nell'albero dei documenti.";
            case "de_DE": return "Die Whitelist ist leer. Bitte fügen Sie ein Dokument hinzu, indem Sie mit der rechten Maustaste im Dokumentenbaum klicken.";
            case "he_IL": return "רשימת הלבן ריקה. אנא הוסף מסמך על ידי לחיצה ימנית בעץ המסמכים.";
            case "ru_RU": return "Белый список пуст. Пожалуйста, добавьте документ, щелкнув правой кнопкой мыши в дереве документов.";
            case "pl_PL": return "Lista białej jest pusta. Proszę dodać dokument, klikając prawym przyciskiem myszy w drzewie dokumentów.";
            case "en_US":
            default: return "The whitelist is empty. Please add a document by right-clicking in the document tree.";
        }
    }
    public get 可以填写小数() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "可以填写小数";
            case "es_ES": return "Se pueden introducir decimales";
            case "fr_FR": return "Les décimales peuvent être saisies";
            case "ja_JP": return "小数を入力できます";
            case "zh_CHT": return "可以填寫小數";
            case "it_IT": return "È possibile inserire decimali";
            case "de_DE": return "Dezimalzahlen können eingegeben werden";
            case "he_IL": return "ניתן להזין מספרים עשרוניים";
            case "ru_RU": return "Можно вводить десятичные числа";
            case "pl_PL": return "Można wprowadzać liczby dziesiętne";
            case "en_US":
            default: return "Decimals can be entered";
        }
    }

    public 每x秒执行一次增量导出(x: string) {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return `每${x}秒执行一次增量导出`;
            case "es_ES": return `Realizar una exportación incremental cada ${x} segundos`;
            case "fr_FR": return `Effectuer une exportation incrémentielle toutes les ${x} secondes`;
            case "ja_JP": return `${x}秒ごとに増分エクスポートを実行`;
            case "zh_CHT": return `每${x}秒執行一次增量導出`;
            case "it_IT": return `Esegui un'esportazione incrementale ogni ${x} secondi`;
            case "de_DE": return `Alle ${x} Sekunden einen inkrementellen Export durchführen`;
            case "he_IL": return `בצע ייצוא הדרגתי כל ${x} שניות`;
            case "ru_RU": return `Выполнять инкрементальный экспорт каждые ${x} секунд`;
            case "pl_PL": return `Wykonuj eksport przyrostowy co ${x} sekund`;
            case "en_US":
            default: return `Perform incremental export every ${x} seconds`;
        }
    }

    public 添加了x个文件夹(x: number) {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return `添加了 ${x} 个文件夹`;
            case "es_ES": return `Se han añadido ${x} carpetas`;
            case "fr_FR": return `${x} dossiers ajoutés`;
            case "ja_JP": return `${x}個のフォルダーを追加しました`;
            case "zh_CHT": return `已添加 ${x} 個資料夾`;
            case "it_IT": return `Aggiunte ${x} cartelle`;
            case "de_DE": return `${x} Ordner hinzugefügt`;
            case "he_IL": return `נוספו ${x} תיקיות`;
            case "ru_RU": return `Добавлено папок: ${x}`;
            case "pl_PL": return `Dodano ${x} folderów`;
            case "en_US":
            default: return `Added ${x} folders`;
        }
    }
    public get 黑名单为空可在文档树中右键添加() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "黑名单为空，可在文档树中右键添加";
            case "es_ES": return "La lista negra está vacía. Puede agregar haciendo clic derecho en el árbol de documentos.";
            case "fr_FR": return "La liste noire est vide. Vous pouvez ajouter en cliquant avec le bouton droit dans l'arborescence des documents.";
            case "ja_JP": return "ブラックリストが空です。ドキュメントツリーで右クリックして追加できます。";
            case "zh_CHT": return "黑名單為空，可在文件樹中右鍵添加";
            case "it_IT": return "La blacklist è vuota. Puoi aggiungere facendo clic con il tasto destro nell'albero dei documenti.";
            case "de_DE": return "Die schwarze Liste ist leer. Sie können im Dokumentenbaum per Rechtsklick hinzufügen.";
            case "he_IL": return "הרשימה השחורה ריקה. ניתן להוסיף על ידי לחיצה ימנית בעץ המסמכים.";
            case "ru_RU": return "Черный список пуст. Можно добавить, щелкнув правой кнопкой мыши в дереве документов.";
            case "pl_PL": return "Czarna lista jest pusta. Możesz dodać, klikając prawym przyciskiem myszy w drzewie dokumentów.";
            case "en_US":
            default: return "The blacklist is empty. You can add by right-clicking in the document tree.";
        }
    }
    public get 添加到导出工作空间的黑名单() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "添加到导出工作空间的黑名单";
            case "es_ES": return "Agregar a la lista negra del espacio de trabajo de exportación";
            case "fr_FR": return "Ajouter à la liste noire de l'espace de travail d'exportation";
            case "ja_JP": return "エクスポートワークスペースのブラックリストに追加";
            case "zh_CHT": return "添加到導出工作空間的黑名單";
            case "it_IT": return "Aggiungere alla blacklist dello spazio di lavoro di esportazione";
            case "de_DE": return "Zur Blacklist des Export-Arbeitsbereichs hinzufügen";
            case "he_IL": return "הוסף לרשימה השחורה של סביבת העבודה לייצוא";
            case "ru_RU": return "Добавить в черный список рабочего пространства экспорта";
            case "pl_PL": return "Dodaj do czarnej listy przestrzeni roboczej eksportu";
            case "en_US":
            default: return "Add to export workspace blacklist";
        }
    }
    public get 确保导出符合配置() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "确保导出符合配置";
            case "es_ES": return "Asegúrese de que la exportación cumpla con la configuración";
            case "fr_FR": return "Assurez-vous que l'exportation est conforme à la configuration";
            case "ja_JP": return "エクスポートが設定に準拠していることを確認してください";
            case "zh_CHT": return "確保導出符合配置";
            case "it_IT": return "Assicurati che l'esportazione sia conforme alla configurazione";
            case "de_DE": return "Stellen Sie sicher, dass der Export den Einstellungen entspricht";
            case "he_IL": return "ודא שהייצוא תואם את ההגדרות";
            case "ru_RU": return "Убедитесь, что экспорт соответствует настройкам";
            case "pl_PL": return "Upewnij się, że eksport jest zgodny z konfiguracją";
            case "en_US":
            default: return "Ensure export matches configuration";
        }
    }
    public 每x分钟确保导出符合配置(x: string) {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return `每${x}分钟确保导出符合配置`;
            case "es_ES": return `Asegúrese de que la exportación cumpla con la configuración cada ${x} minutos`;
            case "fr_FR": return `Assurez-vous que l'exportation est conforme à la configuration toutes les ${x} minutes`;
            case "ja_JP": return `${x}分ごとにエクスポートが設定に準拠していることを確認してください`;
            case "zh_CHT": return `每${x}分鐘確保導出符合配置`;
            case "it_IT": return `Assicurati che l'esportazione sia conforme alla configurazione ogni ${x} minuti`;
            case "de_DE": return `Stellen Sie alle ${x} Minuten sicher, dass der Export den Einstellungen entspricht`;
            case "he_IL": return `ודא שהייצוא תואם את ההגדרות כל ${x} דקות`;
            case "ru_RU": return `Убедитесь, что экспорт соответствует настройкам каждые ${x} минут`;
            case "pl_PL": return `Upewnij się, że eksport jest zgodny z konfiguracją co ${x} minut`;
            case "en_US":
            default: return `Ensure export matches configuration every ${x} minutes`;
        }
    }

    public get 将选中的内容转为引用() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "将选中的内容转为引用";
            case "es_ES": return "Convertir el contenido seleccionado en cita";
            case "fr_FR": return "Convertir le contenu sélectionné en citation";
            case "ja_JP": return "選択した内容を引用に変換";
            case "zh_CHT": return "將選中的內容轉為引用";
            case "it_IT": return "Converti il contenuto selezionato in citazione";
            case "de_DE": return "Ausgewählten Inhalt in Zitat umwandeln";
            case "he_IL": return "הפוך את התוכן שנבחר לציטוט";
            case "ru_RU": return "Преобразовать выбранное содержимое в цитату";
            case "pl_PL": return "Zamień zaznaczoną treść na cytat";
            case "en_US":
            default: return "Convert selected content to quote";
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
