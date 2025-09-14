import { TomatoI18nABC } from "./libs/text1";

export class TomatoI18n extends TomatoI18nABC {

    public get 分片都加入闪卡() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "分片都加入闪卡";
            case "es_ES": return "Añadir todas las fragmentaciones a las tarjetas";
            case "fr_FR": return "Ajouter toutes les partitions aux cartes mémoire";
            case "ja_JP": return "すべての断片をフラッシュカードに追加";
            case "zh_CHT": return "分片都加入閃卡";
            case "it_IT": return "Aggiungi tutte le partizioni alle flashcard";
            case "de_DE": return "Alle Segmente zu Flashcards hinzufügen";
            case "he_IL": return "הוסף את כל הקטעים לכרטיסיות פלאש";
            case "ru_RU": return "Добавить все фрагменты в карточки";
            case "pl_PL": return "Dodaj wszystkie fragmenty do fiszek";
            case "en_US": return "Add all segments to flashcards";
            default: return "Add all segments to flashcards";
        }
    }

    public get 所有() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "所有";
            case "es_ES": return "Todos";
            case "fr_FR": return "Tous";
            case "ja_JP": return "すべて";
            case "zh_CHT": return "所有";
            case "it_IT": return "Tutti";
            case "de_DE": return "Alle";
            case "he_IL": return "הכול";
            case "ru_RU": return "Все";
            case "pl_PL": return "Wszystkie";
            case "en_US":
            default:
                return "All";
        }
    }
    public get 创建所有分片() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "创建所有分片";
            case "es_ES": return "Crear todas las fragmentaciones";
            case "fr_FR": return "Créer toutes les fragments";
            case "ja_JP": return "すべてのシャードを作成";
            case "zh_CHT": return "創建所有分片";
            case "it_IT": return "Crea tutte le frammentazioni";
            case "de_DE": return "Alle Shards erstellen";
            case "he_IL": return "צור את כל הפיצולים";
            case "ru_RU": return "Создать все фрагменты";
            case "pl_PL": return "Utwórz wszystkie fragmenty";
            case "en_US":
            default: return "Create all shards";
        }
    }
    public get 立刻创建所有的分片() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "立刻创建所有的分片（耗时）";
            case "es_ES": return "Crear todas las fragmentaciones de inmediato (tiempo consumido)";
            case "fr_FR": return "Créer immédiatement toutes les fragments (prend du temps)";
            case "ja_JP": return "すべての断片をすぐに作成する（時間がかかります）";
            case "zh_CHT": return "立即創建所有分片（耗時）";
            case "it_IT": return "Crea immediatamente tutte le frammentazioni (richiede tempo)";
            case "de_DE": return "Sofort alle Fragmente erstellen (zeitaufwändig)";
            case "he_IL": return "צור מיד את כל השברים (מצריך זמן)";
            case "ru_RU": return "Создать все фрагменты сразу (занимает время)";
            case "pl_PL": return "Natychmiast utwórz wszystkie fragmenty (czasochłonne)";
            case "ar_SA": return "إنشاء جميع الأجزاء على الفور (يستغرق وقتًا)";
            case "pt_BR": return "Criar todas as fragmentações imediatamente (consome tempo)";
            case "en_US":
            default: return "Create all shards immediately (time-consuming)";
        }
    }

    public get 计划读完本书的天数() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "计划读完本书的天数，'0'为无计划";
            case "es_ES": return "Días planeados para terminar este libro, '0' significa sin plan";
            case "fr_FR": return "Jours prévus pour terminer ce livre, '0' signifie sans plan";
            case "ja_JP": return "この本を読み終える予定日数、'0'は計画なし";
            case "zh_CHT": return "計劃讀完本書的天數，'0'為無計劃";
            case "it_IT": return "Giorni previsti per finire questo libro, '0' significa nessun piano";
            case "de_DE": return "Geplante Tage zum Abschließen dieses Buches, '0' bedeutet kein Plan";
            case "he_IL": return "ימי התוכנית לסיום הספר הזה, '0' פירושו ללא תוכנית";
            case "ru_RU": return "Запланированное количество дней для прочтения этой книги, '0' означает без плана";
            case "pl_PL": return "Zaplanowane dni na przeczytanie tej książki, '0' oznacza brak planu";
            case "ar_SA": return "أيام المخطط لقراءة هذه الكتابة، '0' يعني بدون خطة";
            case "pt_BR": return "Dias planejados para terminar este livro, '0' significa sem plano";
            case "en_US":
            default: return "Days planned to finish this book, '0' means no plan";
        }
    }

    public get 按文本长度拆分() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "按文本长度拆分，'0'为不拆分";
            case "es_ES": return "Dividir por longitud de texto, '0' significa no dividir";
            case "fr_FR": return "Diviser par longueur de texte, '0' signifie ne pas diviser";
            case "ja_JP": return "テキスト長で分割、'0'は分割しない";
            case "zh_CHT": return "按文本長度拆分，'0'為不拆分";
            case "it_IT": return "Dividi per lunghezza del testo, '0' significa non dividere";
            case "de_DE": return "Nach Textlänge aufteilen, '0' bedeutet nicht aufteilen";
            case "he_IL": return "לחלק לפי אורך הטקסט, '0' פירושו לא לחלק";
            case "ru_RU": return "Разделить по длине текста, '0' означает не разделять";
            case "pl_PL": return "Podziel według długości tekstu, '0' oznacza nie dzielić";
            case "ar_SA": return "قسم حسب طول النص، '0' يعني عدم القسمة";
            case "pt_BR": return "Dividir por comprimento de texto, '0' significa não dividir";
            case "en_US":
            default: return "Split by text length, '0' means do not split";
        }
    }
    public get 分片数量() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "分片数量";
            case "es_ES": return "Número de fragmentos";
            case "fr_FR": return "Nombre de fragments";
            case "ja_JP": return "シャード数";
            case "zh_CHT": return "分片數量";
            case "it_IT": return "Numero di frammenti";
            case "de_DE": return "Fragmentanzahl";
            case "he_IL": return "מספר פיסות";
            case "ru_RU": return "Количество фрагментов";
            case "pl_PL": return "Liczba fragmentów";
            case "ar_SA": return "عدد الأجزاء";
            case "pt_BR": return "Número de fragmentos";
            case "en_US":
            default: return "Shard Count";
        }
    }

    public get 计算分片数量() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "计算分片数量";
            case "es_ES": return "Calcular número de fragmentos";
            case "fr_FR": return "Calculer le nombre de fragments";
            case "ja_JP": return "シャード数を計算";
            case "zh_CHT": return "計算分片數量";
            case "it_IT": return "Calcola il numero di frammenti";
            case "de_DE": return "Fragmentanzahl berechnen";
            case "he_IL": return "לחשב מספר פיסות";
            case "ru_RU": return "Вычислить количество фрагментов";
            case "pl_PL": return "Oblicz liczbę fragmentów";
            case "ar_SA": return "حساب عدد الأجزاء";
            case "pt_BR": return "Calcular número de fragmentos";
            case "en_US":
            default: return "Calculate Shard Count";
        }
    }
    public get 天数() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "天数";
            case "es_ES": return "Días";
            case "fr_FR": return "Jours";
            case "ja_JP": return "日数";
            case "zh_CHT": return "天數";
            case "it_IT": return "Giorni";
            case "de_DE": return "Tage";
            case "he_IL": return "ימים";
            case "ru_RU": return "Дни";
            case "pl_PL": return "Dni";
            case "ar_SA": return "أيام";
            case "pt_BR": return "Dias";
            case "en_US":
            default: return "Days";
        }
    }
    public get 已经激活() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "已经激活VIP";
            case "es_ES": return "VIP activado";
            case "fr_FR": return "VIP activé";
            case "ja_JP": return "VIPがアクティブです";
            case "zh_CHT": return "已激活VIP";
            case "it_IT": return "VIP attivato";
            case "de_DE": return "VIP aktiviert";
            case "he_IL": return "VIP הופעל";
            case "ru_RU": return "VIP активирован";
            case "pl_PL": return "VIP aktywowany";
            case "ar_SA": return "تم تنشيط VIP";
            case "pt_BR": return "VIP ativado";
            case "en_US":
            default:
                return "VIP activated";
        }
    }
    public get 没有激活() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "需要激活VIP";
            case "es_ES": return "Se requiere activar el VIP";
            case "fr_FR": return "Activation du VIP requise";
            case "ja_JP": return "VIPをアクティブにする必要があります";
            case "zh_CHT": return "需要激活VIP";
            case "it_IT": return "Attivazione VIP richiesta";
            case "de_DE": return "VIP-Aktivierung erforderlich";
            case "he_IL": return "דרושה הפעלת VIP";
            case "ru_RU": return "Требуется активировать VIP";
            case "pl_PL": return "Wymagane aktywowanie VIP";
            case "ar_SA": return "مطلوب تنشيط VIP";
            case "pt_BR": return "Ativação do VIP necessária";
            case "en_US":
            default:
                return "VIP activation required";
        }
    }
    public 非VIP最多只能激活x个规划学习天数的书籍(x: number) {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return `非VIP最多只能激活${x}个规划学习天数的书籍`;
            case "es_ES": return `Los usuarios no VIP solo pueden activar como máximo ${x} libros con días de estudio programados`;
            case "fr_FR": return `Les utilisateurs non VIP ne peuvent activer qu'un maximum de ${x} livres avec des jours d'étude planifiés`;
            case "ja_JP": return `非VIPユーザーは最大${x}冊の学習日数が計画された書籍をアクティブにできます`;
            case "zh_CHT": return `非VIP最多只能啟用${x}個規劃學習天數的書籍`;
            case "it_IT": return `Gli utenti non VIP possono attivare al massimo ${x} libri con giorni di studio pianificati`;
            case "de_DE": return `Nicht-VIP-Benutzer können maximal ${x} Bücher mit geplanten Lern Tagen aktivieren`;
            case "he_IL": return `משתמשים שאינם VIP יכולים להפעיל לכל היותר ${x} ספרים עם ימי לימוד מתוכננים`;
            case "ru_RU": return `Невозможно активировать более ${x} книг с запланированными днями обучения для не-VIP пользователей`;
            case "pl_PL": return `Użytkownicy nie-VIP mogą aktywować maksymalnie ${x} książek z zaplanowanymi dniami nauki`;
            case "ar_SA": return `لا يمكن للمستخدمين غير الـVIP تنشيط أكثر من ${x} كتابًا مع أيام دراسة محددة`;
            case "pt_BR": return `Usuários não-VIP podem ativar no máximo ${x} livros com dias de estudo planejados`;
            case "en_US":
            default: return `Non-VIP users can activate up to ${x} books with planned study days`;
        }
    }
    public get 计划读书的分片由哪个前端自动创建() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "计划读书的分片由哪个前端自动创建";
            case "es_ES": return "¿Qué frontend crea automáticamente las particiones de lectura programadas?";
            case "fr_FR": return "Quel frontend crée automatiquement les partitions de lecture planifiées ?";
            case "ja_JP": return "計画された読書のシャードはどのフロントエンドによって自動的に作成されますか？";
            case "zh_CHT": return "計劃讀書的分片由哪個前端自動創建？";
            case "it_IT": return "Quale frontend crea automaticamente le partizioni della lettura programmata?";
            case "de_DE": return "Welches Frontend erstellt automatisch die Partitionen für geplantes Lesen?";
            case "he_IL": return "איזה פרונט-אנד יוצר אוטומטית את פיסות הקריאה המתוכננות?";
            case "ru_RU": return "Какой фронтенд автоматически создает фрагменты запланированного чтения?";
            case "pl_PL": return "Który frontend automatycznie tworzy partycje zaplanowanej czytania?";
            case "ar_SA": return "أي واجهة أمامية تقوم بإنشاء أجزاء القراءة المخطط لها تلقائيًا؟";
            case "pt_BR": return "Qual frontend cria automaticamente as partições de leitura planejadas?";
            case "en_US": return "Which frontend automatically creates the shards for scheduled reading?";
            default: return "Which frontend automatically creates the shards for scheduled reading?";
        }
    }
    public get 复习闪卡时隐藏分片按钮组() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "复习闪卡时隐藏分片按钮组";
            case "es_ES": return "Ocultar grupo de botones de fragmentos al revisar flashcards";
            case "fr_FR": return "Masquer le groupe de boutons de fractionnement lors de la révision des cartes mémoire";
            case "ja_JP": return "フラッシュカード復習時に分割ボタングループを非表示にする";
            case "zh_CHT": return "複習閃卡時隱藏分片按鈕組";
            case "it_IT": return "Nascondi il gruppo di pulsanti di suddivisione durante la revisione delle flashcard";
            case "de_DE": return "Gruppierung von Fragmentierungsschaltflächen beim Wiederholen von Lernkarten ausblenden";
            case "he_IL": return "הסתר את קבוצת כפתורי החלוקה בזמן סקירת כרטיסיות הלימוד";
            case "ru_RU": return "Скрывать группу кнопок фрагментации при повторении карточек";
            case "pl_PL": return "Ukryj grupę przycisków fragmentacji podczas powtarzania fiszek";
            case "ar_SA": return "إخفاء مجموعة أزرار التجزئة أثناء مراجعة البطاقات التعليمية";
            case "pt_BR": return "Ocultar grupo de botões de fragmentação ao revisar cartões";
            case "en_US":
            default: return "Hide fragment buttons group when reviewing flashcards";
        }
    }
    public get 恢复笔记颜色() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "恢复笔记颜色";
            case "es_ES": return "Restaurar color de nota";
            case "fr_FR": return "Restaurer la couleur de la note";
            case "ja_JP": return "ノートの色を復元";
            case "zh_CHT": return "恢復筆記顏色";
            case "it_IT": return "Ripristina colore nota";
            case "de_DE": return "Notizfarbe wiederherstellen";
            case "he_IL": return "שחזר צבע הערה";
            case "ru_RU": return "Восстановить цвет заметки";
            case "pl_PL": return "Przywróć kolor notatki";
            case "ar_SA": return "استعادة لون الملاحظة";
            case "pt_BR": return "Restaurar cor da nota";
            case "en_US":
            default: return "Restore note color";
        }
    }
    public get 如果有闪卡可复习自动在后台打开() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "如果有闪卡可复习，自动在后台打开页签，不打断当前工作";
            case "es_ES": return "Si hay tarjetas flash para repasar, abre automáticamente la pestaña en segundo plano sin interrumpir el trabajo actual";
            case "fr_FR": return "Si des cartes flash sont à réviser, ouvre automatiquement l'onglet en arrière-plan sans interrompre le travail en cours";
            case "ja_JP": return "復習するフラッシュカードがある場合、現在の作業を中断せずにバックグラウンドで自動的にタブを開きます";
            case "zh_CHT": return "如果有閃卡可複習，自動在後台打開頁簽，不打斷當前工作";
            case "it_IT": return "Se ci sono flashcard da revisionare, apre automaticamente il tab in secondo piano senza interrompere il lavoro corrente";
            case "de_DE": return "Wenn es Flashcards zum Wiederholen gibt, wird der Tab automatisch im Hintergrund geöffnet, ohne die aktuelle Arbeit zu stören";
            case "he_IL": return "אם יש קלפי פלאש לשינון, תקבל אוטומטית את הלשונית ברקע ללא הפרעה לעבודת הנוכחית";
            case "ru_RU": return "Если есть флешкарты для повторения, автоматически открывается вкладка в фоновом режиме, не прерывая текущую работу";
            case "pl_PL": return "Jeśli istnieją fiszki do powtórzenia, automatycznie otwiera się zakładka w tle, nie przerywając bieżącej pracy";
            case "ar_SA": return "إذا كانت هناك بطاقات فلاش للتعلم، فسيتم فتح التبويب تلقائيًا في الخلفية دون إعاقة العمل الحالي";
            case "pt_BR": return "Se houver flashcards para revisar, abre automaticamente a guia em segundo plano sem interromper o trabalho atual";
            case "en_US": return "If there are flashcards to review, automatically open the tab in the background without interrupting current work";
            default: return "If there are flashcards to review, automatically open the tab in the background without interrupting current work";
        }
    }
    public get 如果无法拖动() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "如果无法拖动，请排除问题，切回官方主题、禁用其他插件再试试。";
            case "es_ES": return "Si no se puede arrastrar, por favor elimine el problema, vuelva al tema oficial y desactive otros complementos para probarlo.";
            case "fr_FR": return "Si vous ne pouvez pas faire glisser, veuillez résoudre le problème, revenir au thème officiel et désactiver les autres plugins pour essayer.";
            case "ja_JP": return "ドラッグできない場合は、問題を解消し、公式テーマに戻し、他のプラグインを無効にして試してみてください。";
            case "zh_CHT": return "如果無法拖動，請排除問題，切回官方主題、禁用其他外掛再試試。";
            case "it_IT": return "Se non è possibile trascinare, risolvi il problema, torna al tema ufficiale e disabilita gli altri plugin per provare.";
            case "de_DE": return "Wenn Sie nicht ziehen können, beheben Sie das Problem, wechseln Sie zurück zum offiziellen Thema und deaktivieren Sie andere Plugins, um es zu versuchen.";
            case "he_IL": return "אם לא ניתן לגרור, נא לפתור את הבעיה, לחזור לנושא הרשמי ולבטל פלגינים אחרים ולנסות.";
            case "ru_RU": return "Если не удается перетащить, устраните проблему, вернитесь к официальной теме и отключите другие плагины, чтобы попробовать.";
            case "pl_PL": return "Jeśli nie można przeciągnąć, rozwiąż problem, wróć do oficjalnego motywu i wyłącz inne wtyczki, aby spróbować.";
            case "ar_SA": return "إذا لم يكن بإمكانك السحب، يرجى حل المشكلة، والعودة إلى الموضوع الرسمي، وتعطيل البرامج الإضافية الأخرى للمحاولة.";
            case "pt_BR": return "Se não puder arrastar, resolva o problema, volte ao tema oficial e desative outros plugins para tentar.";
            case "en_US": return "If you can't drag, please fix the problem, switch back to the official theme, disable other plugins and try again.";
            default: return "If you can't drag, please fix the problem, switch back to the official theme, disable other plugins and try again.";
        }
    }

    public get 清理文档内容到子文档() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "清理文档内容到子文档";
            case "es_ES": return "Limpiar el contenido del documento a subdocumentos";
            case "fr_FR": return "Nettoyer le contenu du document vers des sous-documents";
            case "ja_JP": return "ドキュメント内容をサブドキュメントにクリーンアップ";
            case "zh_CHT": return "清理文檔內容到子文檔";
            case "it_IT": return "Pulisci il contenuto del documento nei sotto-documenti";
            case "de_DE": return "Dokumenteninhalt in Unterdokumente bereinigen";
            case "he_IL": return "נקה את תוכן המסמך למסמכים secundariים";
            case "ru_RU": return "Очистить содержимое документа в поддокументы";
            case "pl_PL": return "Wyczyść zawartość dokumentu do poddokumentów";
            case "ar_SA": return "تنظيف محتوى المستند إلى المستندات الفرعية";
            case "pt_BR": return "Limpar o conteúdo do documento para subdocumentos";
            case "en_US":
            default: return "Clean document content to subdocuments";
        }
    }

    public get 清理文档内容() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "清理文档内容";
            case "es_ES": return "Limpiar contenido del documento";
            case "fr_FR": return "Nettoyer le contenu du document";
            case "ja_JP": return "ドキュメント内容をクリーンアップ";
            case "zh_CHT": return "清理文檔內容";
            case "it_IT": return "Pulisci il contenuto del documento";
            case "de_DE": return "Dokumenteninhalt bereinigen";
            case "he_IL": return "נקה את תוכן המסמך";
            case "ru_RU": return "Очистить содержимое документа";
            case "pl_PL": return "Wyczyść zawartość dokumentu";
            case "ar_SA": return "تنظيف محتوى المستند";
            case "pt_BR": return "Limpar o conteúdo do documento";
            case "en_US":
            default: return "Clean document content";
        }
    }

    public get 补充文件后缀() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "补充文件后缀，空格隔开";
            case "es_ES": return "Extensiones de archivo complementarias, separadas por espacios";
            case "fr_FR": return "Extensions de fichiers supplémentaires, séparées par des espaces";
            case "ja_JP": return "補足ファイル拡張子、スペースで区切る";
            case "zh_CHT": return "補充文件後綴，空格隔開";
            case "it_IT": return "Estensioni file supplementari, separate da spazi";
            case "de_DE": return "Zusätzliche Dateierweiterungen, durch Leerzeichen getrennt";
            case "he_IL": return "סיומות קבצים משלימות, מופרדות ברווחים";
            case "ru_RU": return "Дополнительные расширения файлов, разделенные пробелами";
            case "pl_PL": return "Dodatkowe rozszerzenia plików, oddzielone spacjami";
            case "ar_SA": return "لواحق الملفات التكميلية، مفصولة بمسافات";
            case "pt_BR": return "Extensões de arquivo complementares, separadas por espaços";
            case "en_US":
            default: return "Supplementary file extensions, separated by spaces";
        }
    }

    public get 选择组别() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "选择组别";
            case "es_ES": return "Seleccionar grupo";
            case "fr_FR": return "Sélectionner un groupe";
            case "ja_JP": return "グループを選択";
            case "zh_CHT": return "選擇組別";
            case "it_IT": return "Seleziona gruppo";
            case "de_DE": return "Gruppe auswählen";
            case "he_IL": return "בחר קבוצה";
            case "ru_RU": return "Выбрать группу";
            case "pl_PL": return "Wybierz grupę";
            case "ar_SA": return "اختر مجموعة";
            case "pt_BR": return "Selecionar grupo";
            case "en_US":
            default: return "Select Group";
        }
    }
    public get 当前模式() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "当前模式";
            case "es_ES": return "Modo actual";
            case "fr_FR": return "Mode actuel";
            case "ja_JP": return "現在のモード";
            case "zh_CHT": return "當前模式";
            case "it_IT": return "Modalità corrente";
            case "de_DE": return "Aktueller Modus";
            case "he_IL": return "מצב נוכחי";
            case "ru_RU": return "Текущий режим";
            case "pl_PL": return "Bieżący tryb";
            case "ar_SA": return "الوضع الحالي";
            case "pt_BR": return "Modo atual";
            case "en_US":
            default: return "Current Mode";
        }
    }
    public get 分组() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "分组";
            case "es_ES": return "Agrupar";
            case "fr_FR": return "Grouper";
            case "ja_JP": return "グループ化";
            case "zh_CHT": return "分組";
            case "it_IT": return "Raggruppa";
            case "de_DE": return "Gruppieren";
            case "he_IL": return "קבץ";
            case "ru_RU": return "Группировать";
            case "pl_PL": return "Grupuj";
            case "ar_SA": return "تجميع";
            case "pt_BR": return "Agrupar";
            case "en_US":
            default: return "Group";
        }
    }
    public get 不分组() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "不分组";
            case "es_ES": return "No agrupar";
            case "fr_FR": return "Ne pas grouper";
            case "ja_JP": return "グループ化しない";
            case "zh_CHT": return "不分組";
            case "it_IT": return "Non raggruppare";
            case "de_DE": return "Nicht gruppieren";
            case "he_IL": return "אל תקבץ";
            case "ru_RU": return "Не группировать";
            case "pl_PL": return "Nie grupuj";
            case "ar_SA": return "لا تجمع";
            case "pt_BR": return "Não agrupar";
            case "en_US":
            default: return "Ungrouped";
        }
    }

    public get 全局修复文档引用() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "全局修复文档引用";
            case "es_ES": return "Reparar referencias de documentos globalmente";
            case "fr_FR": return "Réparer globalement les références de documents";
            case "ja_JP": return "ドキュメント参照をグローバルに修復";
            case "zh_CHT": return "全局修復文檔引用";
            case "it_IT": return "Ripara globalmente i riferimenti ai documenti";
            case "de_DE": return "Dokumentreferenzen global reparieren";
            case "he_IL": return "תקן הפניות מסמך גלובליות";
            case "ru_RU": return "Глобально исправить ссылки на документы";
            case "pl_PL": return "Napraw globalnie odniesienia do dokumentów";
            case "ar_SA": return "إصلاح مراجع المستندات عالميًا";
            case "pt_BR": return "Reparar referências de documentos globalmente";
            case "en_US":
            default: return "Globally repair document references";
        }
    }
    public get 全局加固文档引用() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "全局加固文档引用";
            case "es_ES": return "Reforzar referencias de documentos globalmente";
            case "fr_FR": return "Renforcer globalement les références de documents";
            case "ja_JP": return "ドキュメント参照をグローバルに強化";
            case "zh_CHT": return "全局加固文檔引用";
            case "it_IT": return "Rafforza globalmente i riferimenti ai documenti";
            case "de_DE": return "Dokumentreferenzen global stärken";
            case "he_IL": return "חיזוק הפניות מסמך גלובליות";
            case "ru_RU": return "Глобально усилить ссылки на документы";
            case "pl_PL": return "Wzmocnij globalnie odniesienia do dokumentów";
            case "ar_SA": return "تعزيز مراجع المستندات عالميًا";
            case "pt_BR": return "Reforçar referências de documentos globalmente";
            case "en_US":
            default: return "Globally reinforce document references";
        }
    }

    public get 删除双向链接() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "删除双向链接";
            case "es_ES": return "Eliminar enlace bidireccional";
            case "fr_FR": return "Supprimer le lien bidirectionnel";
            case "ja_JP": return "双方向リンクを削除";
            case "zh_CHT": return "刪除雙向連結";
            case "it_IT": return "Elimina collegamento bidirezionale";
            case "de_DE": return "Bidirektionalen Link löschen";
            case "he_IL": return "מחק קישור דו-כיווני";
            case "ru_RU": return "Удалить двунаправленную ссылку";
            case "pl_PL": return "Usuń link dwukierunkowy";
            case "ar_SA": return "حذف الرابط ثنائي الاتجاه";
            case "pt_BR": return "Excluir link bidirecional";
            case "en_US":
            default: return "Delete Bidirectional Link";
        }
    }

    public get 块编辑器() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "块编辑器";
            case "es_ES": return "Editor de bloques";
            case "fr_FR": return "Éditeur de blocs";
            case "ja_JP": return "ブロックエディター";
            case "zh_CHT": return "塊編輯器";
            case "it_IT": return "Editor di blocchi";
            case "de_DE": return "Block-Editor";
            case "he_IL": return "עורך בלוקים";
            case "ru_RU": return "Редактор блоков";
            case "pl_PL": return "Edytor bloków";
            case "ar_SA": return "محرر الكتل";
            case "pt_BR": return "Editor de blocos";
            case "en_US":
            default: return "Block Editor";
        }
    }

    public get 白名单为空请先在文档树中右键添加文档() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "白名单为空，请在文档树中右键添加文件夹或文档";
            case "es_ES": return "La lista blanca está vacía, haga clic derecho en el árbol de documentos para agregar carpetas o documentos";
            case "fr_FR": return "La liste blanche est vide, faites un clic droit sur l'arbre des documents pour ajouter des dossiers ou des documents";
            case "ja_JP": return "ホワイトリストが空です。ドキュメントツリーで右クリックして、フォルダーまたはドキュメントを追加してください";
            case "zh_CHT": return "白名單為空，請在文件樹中右鍵添加資料夾或文件";
            case "it_IT": return "La whitelist è vuota, fare clic con il tasto destro sull'albero dei documenti per aggiungere cartelle o documenti";
            case "de_DE": return "Die Whitelist ist leer. Klicken Sie mit der rechten Maustaste auf den Dokumentbaum, um Ordner oder Dokumente hinzuzufügen";
            case "he_IL": return "הרשימה הלבנה ריקה, לחץ לחיצה ימנית על עץ המסמכים כדי להוסיף תיקיות או מסמכים";
            case "ru_RU": return "Белый список пуст, щелкните правой кнопкой мыши по дереву документов, чтобы добавить папки или документы";
            case "pl_PL": return "Biała lista jest pusta, kliknij prawym przyciskiem myszy drzewo dokumentów, aby dodać foldery lub dokumenty";
            case "ar_SA": return "القائمة البيضاء فارغة، يرجى النقر بزر الماوس الأيمن على شجرة المستندات لإضافة مجلدات أو مستندات";
            case "pt_BR": return "A lista branca está vazia, clique com o botão direito na árvore de documentos para adicionar pastas ou documentos";
            case "en_US":
            default: return "Whitelist is empty, please right-click in the document tree to add folders or documents";
        }
    }
    public get 黑名单为空可在文档树中右键添加() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "黑名单为空，可在文档树中右键添加文件夹或文档";
            case "es_ES": return "La lista negra está vacía, haga clic derecho en el árbol de documentos para agregar carpetas o documentos";
            case "fr_FR": return "La liste noire est vide, faites un clic droit sur l'arbre des documents pour ajouter des dossiers ou des documents";
            case "ja_JP": return "ブラックリストが空です。ドキュメントツリーで右クリックして、フォルダーまたはドキュメントを追加してください";
            case "zh_CHT": return "黑名單為空，可在文件樹中右鍵添加資料夾或文件";
            case "it_IT": return "La blacklist è vuota, fare clic con il tasto destro sull'albero dei documenti per aggiungere cartelle o documenti";
            case "de_DE": return "Die Blacklist ist leer, klicken Sie mit der rechten Maustaste auf den Dokumentbaum, um Ordner oder Dokumente hinzuzufügen";
            case "he_IL": return "הרשימה השחורה ריקה, לחץ לחיצה ימנית על עץ המסמכים כדי להוסיף תיקיות או מסמכים";
            case "ru_RU": return "Черный список пуст, щелкните правой кнопкой мыши по дереву документов, чтобы добавить папки или документы";
            case "pl_PL": return "Czarna lista jest pusta, kliknij prawym przyciskiem myszy drzewo dokumentów, aby dodać foldery lub dokumenty";
            case "ar_SA": return "القائمة السوداء فارغة، يرجى النقر بزر الماوس الأيمن على شجرة المستندات لإضافة مجلدات أو مستندات";
            case "pt_BR": return "A lista negra está vazia, clique com o botão direito na árvore de documentos para adicionar pastas ou documentos";
            case "en_US":
            default: return "Blacklist is empty, you can right-click in the document tree to add folders or documents";
        }
    }

    public get 导出所有文件() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "导出所有文件";
            case "es_ES": return "Exportar todos los archivos";
            case "fr_FR": return "Exporter tous les fichiers";
            case "ja_JP": return "すべてのファイルをエクスポート";
            case "zh_CHT": return "導出所有文件";
            case "it_IT": return "Esporta tutti i file";
            case "de_DE": return "Alle Dateien exportieren";
            case "he_IL": return "ייצא את כל הקבצים";
            case "ru_RU": return "Экспортировать все файлы";
            case "pl_PL": return "Eksportuj wszystkie pliki";
            case "ar_SA": return "تصدير جميع الملفات";
            case "pt_BR": return "Exportar todos os arquivos";
            case "en_US": return "Export all files";
            default: return "Export all files";
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
            case "ar_SA":
            case "pt_BR":
            case "en_US":
            default:
        }
    }
}

// public[^get]+\(  查找所有的函数
export const tomatoI18n = new TomatoI18n();
