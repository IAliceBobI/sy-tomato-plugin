import { TomatoI18nABC } from "./libs/text1";

export class TomatoI18n extends TomatoI18nABC {

    // 渐进设置页卡片化（2026-08-24）新增的分区标题键
    public get 右键菜单() {
        switch (this.lang) {
            case "zh_CN": return "右键菜单";
            case "es_ES": return "Menú contextual";
            case "fr_FR": return "Menu contextuel";
            case "ja_JP": return "右クリックメニュー";
            case "zh_CHT": return "右鍵選單";
            case "it_IT": return "Menu contestuale";
            case "de_DE": return "Kontextmenü";
            case "he_IL": return "תפריט הקשר";
            case "ru_RU": return "Контекстное меню";
            case "pl_PL": return "Menu kontekstowe";
            case "en_US": return "Context menu";
            default: return "Context menu";
        }
    }

    public get 基础设置() {
        switch (this.lang) {
            case "zh_CN": return "基础设置";
            case "es_ES": return "Configuración básica";
            case "fr_FR": return "Réglages de base";
            case "ja_JP": return "基本設定";
            case "zh_CHT": return "基礎設定";
            case "it_IT": return "Impostazioni di base";
            case "de_DE": return "Grundeinstellungen";
            case "he_IL": return "הגדרות בסיסיות";
            case "ru_RU": return "Основные настройки";
            case "pl_PL": return "Ustawienia podstawowe";
            case "en_US": return "Basic settings";
            default: return "Basic settings";
        }
    }

    public get 摘抄与制卡() {
        switch (this.lang) {
            case "zh_CN": return "摘抄与制卡";
            case "es_ES": return "Copiado y tarjetas";
            case "fr_FR": return "Copie et cartes";
            case "ja_JP": return "要約とカード作成";
            case "zh_CHT": return "摘抄與制卡";
            case "it_IT": return "Copia e schede";
            case "de_DE": return "Exzerpieren & Karten";
            case "he_IL": return "מיצוי וכרטיסים";
            case "ru_RU": return "Выписки и карточки";
            case "pl_PL": return "Notatki i fiszki";
            case "en_US": return "Digest & cards";
            default: return "Digest & cards";
        }
    }

    public get 移动端浮条固定顶部() {
        switch (this.lang) {
            case "zh_CN": return "移动端浮条固定顶部";
            case "zh_CHT": return "行動端浮條固定頂部";
            default: return "Mobile floatbar pinned to top";
        }
    }

    public get 分片按钮组() {
        switch (this.lang) {
            case "zh_CN": return "分片按钮组";
            case "es_ES": return "Botones de fragmentos";
            case "fr_FR": return "Boutons de fragments";
            case "ja_JP": return "断片ボタン";
            case "zh_CHT": return "分片按鈕組";
            case "it_IT": return "Pulsanti frammento";
            case "de_DE": return "Fragment-Schaltflächen";
            case "he_IL": return "כפתורי קטעים";
            case "ru_RU": return "Кнопки фрагментов";
            case "pl_PL": return "Przyciski fragmentów";
            case "en_US": return "Fragment buttons";
            default: return "Fragment buttons";
        }
    }

    public get 分片都加入闪卡() {
        switch (this.lang) {
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
        switch (this.lang) {
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
        switch (this.lang) {
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
        switch (this.lang) {
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
        switch (this.lang) {
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
        switch (this.lang) {
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
        switch (this.lang) {
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
        switch (this.lang) {
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
        switch (this.lang) {
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
        switch (this.lang) {
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
        switch (this.lang) {
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
        switch (this.lang) {
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
        switch (this.lang) {
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
        switch (this.lang) {
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
    public get 禁用初始化渐进学习浮动按钮() {
        switch (this.lang) {
            case "zh_CN": return "禁用初始化渐进学习浮动按钮";
            case "es_ES": return "Deshabilitar inicialización de botones flotantes de aprendizaje progresivo";
            case "fr_FR": return "Désactiver l'initialisation des boutons flottants d'apprentissage progressif";
            case "ja_JP": return "段階的学習フローティングボタンの初期化を無効化";
            case "zh_CHT": return "禁用初始化漸進學習浮動按鈕";
            case "it_IT": return "Disabilita inizializzazione pulsanti fluttuanti apprendimento progressivo";
            case "de_DE": return "Initialisierung der schwebenden Buttons für progressives Lernen deaktivieren";
            case "he_IL": return "השבת אתחול כפתורים צפים של למידה הדרגתית";
            case "ru_RU": return "Отключить инициализацию плавающих кнопок прогрессивного обучения";
            case "pl_PL": return "Wyłącz inicjalizację pływających przycisków progresywnego uczenia się";
            case "ar_SA": return "تعطيل تهيئة أزرار التعلم التدريجي العائمة";
            case "pt_BR": return "Desabilitar inicialização de botões flutuantes de aprendizado progressivo";
            case "en_US":
            default: return "Disable initialization of progressive learning floating buttons";
        }
    }
    public get 恢复笔记颜色() {
        switch (this.lang) {
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
        switch (this.lang) {
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
        switch (this.lang) {
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
        switch (this.lang) {
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
        switch (this.lang) {
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
        switch (this.lang) {
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
        switch (this.lang) {
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
        switch (this.lang) {
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
        switch (this.lang) {
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
        switch (this.lang) {
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
        switch (this.lang) {
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
        switch (this.lang) {
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
        switch (this.lang) {
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
        switch (this.lang) {
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
        switch (this.lang) {
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
        switch (this.lang) {
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
        switch (this.lang) {
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

    public get 导入markdownOrText() {
        switch (this.lang) {
            case "zh_CN": return "导入markdown或者文本文件";
            case "es_ES": return "Importar archivos markdown o de texto";
            case "fr_FR": return "Importer des fichiers markdown ou texte";
            case "ja_JP": return "Markdownまたはテキストファイルをインポート";
            case "zh_CHT": return "匯入markdown或者文字檔案";
            case "it_IT": return "Importa file markdown o di testo";
            case "de_DE": return "Markdown- oder Textdateien importieren";
            case "he_IL": return "ייבוא קובצי markdown או טקסט";
            case "ru_RU": return "Импорт markdown или текстовых файлов";
            case "pl_PL": return "Importuj pliki markdown lub tekstowe";
            case "ar_SA": return "استيراد ملفات markdown أو النص";
            case "pt_BR": return "Importar arquivos markdown ou de texto";
            case "en_US":
            default: return "Import markdown or text files";
        }
    }

    public get 确认() {
        switch (this.lang) {
            case "zh_CN": return "确认";
            case "es_ES": return "Confirmar";
            case "fr_FR": return "Confirmer";
            case "ja_JP": return "確認";
            case "zh_CHT": return "確認";
            case "it_IT": return "Conferma";
            case "de_DE": return "Bestätigen";
            case "he_IL": return "אישור";
            case "ru_RU": return "Подтвердить";
            case "pl_PL": return "Potwierdź";
            case "ar_SA": return "تأكيد";
            case "pt_BR": return "Confirmar";
            case "en_US":
            default: return "Confirm";
        }
    }

    public get utf8Encoding() {
        switch (this.lang) {
            case "zh_CN": return "文件编码必须是utf8";
            case "es_ES": return "La codificación del archivo debe ser UTF-8";
            case "fr_FR": return "L'encodage du fichier doit être UTF-8";
            case "ja_JP": return "ファイルのエンコーディングはUTF-8である必要があります";
            case "zh_CHT": return "文件編碼必須是utf8";
            case "it_IT": return "La codifica del file deve essere UTF-8";
            case "de_DE": return "Die Dateikodierung muss UTF-8 sein";
            case "he_IL": return "קידוד הקובץ חייב להיות UTF-8";
            case "ru_RU": return "Кодировка файла должна быть UTF-8";
            case "pl_PL": return "Kodowanie pliku musi być UTF-8";
            case "ar_SA": return "يجب أن يكون ترميز الملف UTF-8";
            case "pt_BR": return "A codificação do arquivo deve ser UTF-8";
            case "en_US":
            default: return "File encoding must be UTF-8";
        }
    }

    public get 请填写文件的路径() {
        switch (this.lang) {
            case "zh_CN": return "请填写文件的路径";
            case "es_ES": return "Por favor, rellene la ruta del archivo";
            case "fr_FR": return "Veuillez remplir le chemin du fichier";
            case "ja_JP": return "ファイルのパスを入力してください";
            case "zh_CHT": return "請填寫文件的路徑";
            case "it_IT": return "Per favore, inserisci il percorso del file";
            case "de_DE": return "Bitte geben Sie den Dateipfad ein";
            case "he_IL": return "אנא מלא את נתיב הקובץ";
            case "ru_RU": return "Пожалуйста, заполните путь к файлу";
            case "pl_PL": return "Proszę wypełnić ścieżkę pliku";
            case "ar_SA": return "يرجى ملء مسار الملف";
            case "pt_BR": return "Por favor, preencha o caminho do arquivo";
            case "en_US":
            default: return "Please fill in the file path";
        }
    }

    public get 没有有效的摘抄内容() {
        switch (this.lang) {
            case "zh_CN": return "没有有效的摘抄内容";
            case "es_ES": return "No hay contenido de extracción válido";
            case "fr_FR": return "Aucun contenu d'extraction valide";
            case "ja_JP": return "有効な摘抄コンテンツがありません";
            case "zh_CHT": return "沒有有效的摘抄內容";
            case "it_IT": return "Nessun contenuto di estrazione valido";
            case "de_DE": return "Kein gültiger Extraktionsinhalt";
            case "he_IL": return "אין תוכן חילוץ חוקי";
            case "ru_RU": return "Нет действительного содержимого для извлечения";
            case "pl_PL": return "Brak ważnej zawartości ekstrakcji";
            case "ar_SA": return "لا يوجد محتوى استخراج صالح";
            case "pt_BR": return "Nenhum conteúdo de extração válido";
            case "en_US":
            default: return "No valid extraction content";
        }
    }

    public get docNotFound() {
        switch (this.lang) {
            case "zh_CN": return "无法找到文档";
            case "es_ES": return "Documento no encontrado";
            case "fr_FR": return "Document non trouvé";
            case "ja_JP": return "ドキュメントが見つかりません";
            case "zh_CHT": return "無法找到文檔";
            case "it_IT": return "Documento non trovato";
            case "de_DE": return "Dokument nicht gefunden";
            case "he_IL": return "מסמך לא נמצא";
            case "ru_RU": return "Документ не найден";
            case "pl_PL": return "Nie znaleziono dokumentu";
            case "ar_SA": return "المستند غير موجود";
            case "pt_BR": return "Documento não encontrado";
            case "en_US":
            default: return "Document not found";
        }
    }

    public get 需要开启闪卡优先级功能() {
        switch (this.lang) {
            case "zh_CN": return "需要开启闪卡优先级功能";
            case "es_ES": return "Necesita activar la función de prioridad de tarjetas";
            case "fr_FR": return "Besoin d'activer la fonction de priorité des cartes";
            case "ja_JP": return "フラッシュカードの優先度機能を有効にする必要があります";
            case "zh_CHT": return "需要開啟閃卡優先級功能";
            case "it_IT": return "È necessario abilitare la funzione di priorità delle flashcard";
            case "de_DE": return "Kartenprioritätsfunktion muss aktiviert werden";
            case "he_IL": return "צריך להפעיל את פונקציית עדיפות הכרטיס";
            case "ru_RU": return "Нужно включить функцию приоритета карточек";
            case "pl_PL": return "Trzeba włączyć funkcję priorytetu fiszek";
            case "ar_SA": return "بحاجة إلى تفعيل وظيفة أولوية البطاقة";
            case "pt_BR": return "Precisa ativar a função de prioridade do cartão";
            case "en_US":
            default: return "Need to enable card priority feature";
        }
    }
    public get 激活解锁全部功能() {
        switch (this.lang) {
            case "zh_CN": return "激活后解锁全部高级功能";
            case "es_ES": return "Activa para desbloquear todas las funciones avanzadas";
            case "fr_FR": return "Activez pour débloquer toutes les fonctionnalités avancées";
            case "ja_JP": return "アクティベートすると全上位機能が解放されます";
            case "zh_CHT": return "激活後解鎖全部進階功能";
            case "it_IT": return "Attiva per sbloccare tutte le funzioni avanzate";
            case "de_DE": return "Aktivieren Sie, um alle erweiterten Funktionen freizuschalten";
            case "he_IL": return "הפעל כדי לפתוח את כל הפונקציות המתקדמות";
            case "ru_RU": return "Активируйте, чтобы разблокировать все расширенные функции";
            case "pl_PL": return "Aktywuj, aby odblokować wszystkie zaawansowane funkcje";
            case "ar_SA": return "قم بالتفعيل لفتح جميع الميزات المتقدمة";
            case "pt_BR": return "Ative para desbloquear todos os recursos avançados";
            case "en_US":
            default: return "Activate to unlock all advanced features";
        }
    }
    public get 已激活() {
        switch (this.lang) {
            case "zh_CN": return "已激活";
            case "es_ES": return "Activado";
            case "fr_FR": return "Activé";
            case "ja_JP": return "有効化済み";
            case "zh_CHT": return "已激活";
            case "it_IT": return "Attivato";
            case "de_DE": return "Aktiviert";
            case "he_IL": return "הופעל";
            case "ru_RU": return "Активировано";
            case "pl_PL": return "Aktywowano";
            case "ar_SA": return "تم التفعيل";
            case "pt_BR": return "Ativado";
            case "en_US":
            default: return "Activated";
        }
    }
    public get 打开番茄工具箱购买页() {
        switch (this.lang) {
            case "zh_CN": return "打开番茄工具箱购买页";
            case "es_ES": return "Abrir la página de compra de la caja de herramientas Pomodoro";
            case "fr_FR": return "Ouvrir la page d'achat de la boîte à outils Pomodoro";
            case "ja_JP": return "トマトツールボックスの購入ページを開く";
            case "zh_CHT": return "打開番茄工具箱購買頁";
            case "it_IT": return "Apri la pagina di acquisto degli strumenti Pomodoro";
            case "de_DE": return "Kaufseite der Pomodoro-Werkzeugkasten öffnen";
            case "he_IL": return "פתח את דף הרכישה של תיבת כלים פומודורו";
            case "ru_RU": return "Открыть страницу покупки помидорного набора инструментов";
            case "pl_PL": return "Otwórz stronę zakupu narzędzi Pomodoro";
            case "ar_SA": return "افتح صفحة شراء صندوق أدوات بومودورو";
            case "pt_BR": return "Abrir a página de compra da caixa de ferramentas Pomodoro";
            case "en_US":
            default: return "Open the Pomodoro toolbox purchase page";
        }
    }
    public get 打开渐进学习购买页() {
        switch (this.lang) {
            case "zh_CN": return "打开渐进学习购买页";
            case "es_ES": return "Abrir la página de compra de aprendizaje progresivo";
            case "fr_FR": return "Ouvrir la page d'achat de l'apprentissage progressif";
            case "ja_JP": return "段階的学習の購入ページを開く";
            case "zh_CHT": return "打開漸進學習購買頁";
            case "it_IT": return "Apri la pagina di acquisto dell'apprendimento progressivo";
            case "de_DE": return "Kaufseite des progressiven Lernens öffnen";
            case "he_IL": return "פתח את דף הרכישה של למידה הדרגתית";
            case "ru_RU": return "Открыть страницу покупки прогрессивного обучения";
            case "pl_PL": return "Otwórz stronę zakupu progresywnego uczenia się";
            case "ar_SA": return "افتح صفحة شراء التعلم التدريجي";
            case "pt_BR": return "Abrir a página de compra do aprendizado progressivo";
            case "en_US":
            default: return "Open the progressive learning purchase page";
        }
    }
    public get 购买页() {
        switch (this.lang) {
            case "zh_CN": return "购买";
            case "es_ES": return "Comprar";
            case "fr_FR": return "Acheter";
            case "ja_JP": return "購入";
            case "zh_CHT": return "購買";
            case "it_IT": return "Acquista";
            case "de_DE": return "Kaufen";
            case "he_IL": return "רכישה";
            case "ru_RU": return "Купить";
            case "pl_PL": return "Kup";
            case "ar_SA": return "شراء";
            case "pt_BR": return "Comprar";
            case "en_US":
            default: return "Purchase";
        }
    }
    public get 复购或赠送() {
        switch (this.lang) {
            case "zh_CN": return "复购 / 赠送";
            case "es_ES": return "Recomprar / Regalar";
            case "fr_FR": return "Racheter / Offrir";
            case "ja_JP": return "再購入 / ギフト";
            case "zh_CHT": return "復購 / 贈送";
            case "it_IT": return "Riacquista / Regala";
            case "de_DE": return "Erneut kaufen / Verschenken";
            case "he_IL": return "רכישה חוזרת / מתנה";
            case "ru_RU": return "Купить снова / Подарить";
            case "pl_PL": return "Kup ponownie / Podaruj";
            case "ar_SA": return "إعادة الشراء / إهداء";
            case "pt_BR": return "Recomprar / Presentear";
            case "en_US":
            default: return "Buy again / Gift";
        }
    }
    public get 您已购买无需重复购买() {
        switch (this.lang) {
            case "zh_CN": return "您已购买，无需重复购买；如遇问题可联系客服。";
            case "es_ES": return "Ya lo ha comprado, no necesita comprar de nuevo; si tiene problemas, contacte con atención al cliente.";
            case "fr_FR": return "Vous avez déjà acheté, inutile de racheter ; en cas de problème, contactez le service client.";
            case "ja_JP": return "購入済みのため、再購入は不要です。問題がある場合はカスタマーサポートまで。";
            case "zh_CHT": return "您已購買，無需重複購買；如遇問題可聯繫客服。";
            case "it_IT": return "Hai già acquistato, non è necessario ricomprare; in caso di problemi contatta l'assistenza.";
            case "de_DE": return "Sie haben bereits gekauft, ein erneuter Kauf ist nicht nötig; bei Problemen wenden Sie sich an den Support.";
            case "he_IL": return "כבר רכשת, אין צורך לרכוש שוב; בבעיות פנה לשירות הלקוחות.";
            case "ru_RU": return "Вы уже купили, повторная покупка не требуется; при проблемах обратитесь в поддержку.";
            case "pl_PL": return "Już kupiłeś, nie musisz kupować ponownie; w razie problemów skontaktuj się z pomocą techniczną.";
            case "ar_SA": return "لقد اشتريت بالفعل، ولا حاجة للشراء مرة أخرى؛ في حال وجود مشاكل تواصل مع خدمة العملاء.";
            case "pt_BR": return "Você já comprou, não precisa comprar novamente; em caso de problemas, contate o suporte.";
            case "en_US":
            default: return "You have already purchased; no need to buy again. Contact support if you have issues.";
        }
    }

    // 快捷键就地修改（2026-08-24 □5）HotkeyCap 组件文案
    public get 点击修改快捷键() {
        switch (this.lang) {
            case "zh_CN": return "点击修改快捷键\nEsc 取消\nBackspace 删除";
            case "zh_CHT": return "點擊修改快捷鍵\nEsc 取消\nBackspace 刪除";
            case "es_ES": return "Clic para cambiar el atajo\nEsc para cancelar\nRetroceso para eliminar";
            case "fr_FR": return "Cliquer pour modifier le raccourci\nÉchap pour annuler\nRetour arrière pour supprimer";
            case "ja_JP": return "クリックでショートカットを変更\nEsc でキャンセル\nBackspace で削除";
            case "it_IT": return "Clicca per modificare\nEsc per annullare\nBackspace per eliminare";
            case "de_DE": return "Klicken zum Ändern\nEsc zum Abbrechen\nRücktaste zum Löschen";
            case "he_IL": return "לחץ לשינוי הקיצור\nEsc לביטול\nBackspace למחיקה";
            case "ru_RU": return "Нажмите, чтобы изменить\nEsc — отмена\nBackspace — удалить";
            case "pl_PL": return "Kliknij, aby zmienić\nEsc — anuluj\nBackspace — usuń";
            case "ar_SA": return "انقر لتغيير الاختصار\nEsc للإلغاء\nBackspace للحذف";
            case "pt_BR": return "Clique para alterar o atalho\nEsc para cancelar\nBackspace para excluir";
            case "en_US":
            default: return "Click to change hotkey\nEsc to cancel\nBackspace to remove";
        }
    }
    public get 按下新组合键() {
        switch (this.lang) {
            case "zh_CN": return "按下新组合键…";
            case "zh_CHT": return "按下新組合鍵…";
            case "es_ES": return "Pulsa la nueva combinación…";
            case "fr_FR": return "Appuyez sur la nouvelle combinaison…";
            case "ja_JP": return "新しい組み合わせを押してください…";
            case "it_IT": return "Premi la nuova combinazione…";
            case "de_DE": return "Neue Kombination drücken…";
            case "he_IL": return "הקש שילוב חדש…";
            case "ru_RU": return "Нажмите новую комбинацию…";
            case "pl_PL": return "Naciśnij nową kombinację…";
            case "ar_SA": return "اضغط التركيبة الجديدة…";
            case "pt_BR": return "Pressione a nova combinação…";
            case "en_US":
            default: return "Press new combination…";
        }
    }
    public 与其冲突的快捷键(x: string) {
        switch (this.lang) {
            case "zh_CN": return `冲突：${x}`;
            case "zh_CHT": return `衝突：${x}`;
            case "es_ES": return `Conflicto con: ${x}`;
            case "fr_FR": return `Conflit avec : ${x}`;
            case "ja_JP": return `競合：${x}`;
            case "it_IT": return `In conflitto con: ${x}`;
            case "de_DE": return `Konflikt mit: ${x}`;
            case "he_IL": return `התנגשות עם: ${x}`;
            case "ru_RU": return `Конфликтует с: ${x}`;
            case "pl_PL": return `Konflikt z: ${x}`;
            case "ar_SA": return `تعارض مع: ${x}`;
            case "pt_BR": return `Conflito com: ${x}`;
            case "en_US":
            default: return `Conflicts with: ${x}`;
        }
    }
    public 建议改用(x: string) {
        switch (this.lang) {
            case "zh_CN": return `建议改用 ${x}`;
            case "zh_CHT": return `建議改用 ${x}`;
            case "es_ES": return `Prueba ${x}`;
            case "fr_FR": return `Essayez ${x}`;
            case "ja_JP": return `${x} を推奨`;
            case "it_IT": return `Prova ${x}`;
            case "de_DE": return `Versuche ${x}`;
            case "he_IL": return `נסה ${x}`;
            case "ru_RU": return `Попробуйте ${x}`;
            case "pl_PL": return `Wypróbuj ${x}`;
            case "ar_SA": return `جرّب ${x}`;
            case "pt_BR": return `Tente ${x}`;
            case "en_US":
            default: return `Try ${x} instead`;
        }
    }
    public get 快捷键需要修饰键() {
        switch (this.lang) {
            case "zh_CN": return "单字符键会拦截输入，需搭配 ⌘/⌥/⌃ 修饰键";
            case "zh_CHT": return "單字元鍵會攔截輸入，需搭配 ⌘/⌥/⌃ 修飾鍵";
            case "es_ES": return "Las teclas simples bloquean la escritura; añade un modificador ⌘/⌥/⌃";
            case "fr_FR": return "Les touches seules bloquent la saisie ; ajoutez un modificateur ⌘/⌥/⌃";
            case "ja_JP": return "単一キーは入力を妨げます。⌘/⌥/⌃ 修飾キーを追加してください";
            case "it_IT": return "I tasti singoli bloccano la digitazione; aggiungi un modificatore ⌘/⌥/⌃";
            case "de_DE": return "Einzelne Tasten blockieren die Eingabe; füge ⌘/⌥/⌃ hinzu";
            case "he_IL": return "מקש בודד חוסם הקלדה; הוסף מקש החלפה ⌘/⌥/⌃";
            case "ru_RU": return "Одиночные клавиши мешают вводу; добавьте модификатор ⌘/⌥/⌃";
            case "pl_PL": return "Pojedyncze klawisze blokują pisanie; dodaj modyfikator ⌘/⌥/⌃";
            case "ar_SA": return "المفاتيح المفردة تعيق الكتابة؛ أضف مفتاح تعديل ⌘/⌥/⌃";
            case "pt_BR": return "Teclas simples bloqueiam a digitação; adicione um modificador ⌘/⌥/⌃";
            case "en_US":
            default: return "Single keys block typing; add a ⌘/⌥/⌃ modifier";
        }
    }
    public get 系统保留快捷键() {
        switch (this.lang) {
            case "zh_CN": return "系统保留快捷键，不可使用";
            case "zh_CHT": return "系統保留快捷鍵，不可使用";
            case "es_ES": return "Reservado por el sistema";
            case "fr_FR": return "Réservé par le système";
            case "ja_JP": return "システム予約のショートカットです";
            case "it_IT": return "Riservato dal sistema";
            case "de_DE": return "Vom System reserviert";
            case "he_IL": return "שמור למערכת";
            case "ru_RU": return "Зарезервировано системой";
            case "pl_PL": return "Zarezerwowane przez system";
            case "ar_SA": return "محجوز للنظام";
            case "pt_BR": return "Reservado pelo sistema";
            case "en_US":
            default: return "Reserved by the system";
        }
    }
    public get 已恢复默认() {
        switch (this.lang) {
            case "zh_CN": return "已恢复默认";
            case "zh_CHT": return "已恢復預設";
            case "es_ES": return "Restablecido";
            case "fr_FR": return "Réinitialisé";
            case "ja_JP": return "デフォルトに戻しました";
            case "it_IT": return "Ripristinato";
            case "de_DE": return "Zurückgesetzt";
            case "he_IL": return "אופס לברירת מחדל";
            case "ru_RU": return "Сброшено";
            case "pl_PL": return "Przywrócono domyślne";
            case "ar_SA": return "تمت الاستعادة";
            case "pt_BR": return "Redefinido";
            case "en_US":
            default: return "Reset to default";
        }
    }
    public get 已生效() {
        switch (this.lang) {
            case "zh_CN": return "已生效";
            case "zh_CHT": return "已生效";
            case "es_ES": return "Guardado";
            case "fr_FR": return "Enregistré";
            case "ja_JP": return "保存しました";
            case "it_IT": return "Salvato";
            case "de_DE": return "Gespeichert";
            case "he_IL": return "נשמר";
            case "ru_RU": return "Сохранено";
            case "pl_PL": return "Zapisano";
            case "ar_SA": return "تم الحفظ";
            case "pt_BR": return "Salvo";
            case "en_US":
            default: return "Saved";
        }
    }
    public get 随机可用快捷键() {
        switch (this.lang) {
            case "zh_CN": return "随机分配一个可用快捷键（优先短组合）";
            case "zh_CHT": return "隨機分配一個可用快捷鍵（優先短組合）";
            case "es_ES": return "Asignar aleatoriamente un atajo disponible (se prefieren cortos)";
            case "fr_FR": return "Attribuer aléatoirement un raccourci libre (courts privilégiés)";
            case "ja_JP": return "空いているショートカットをランダム割り当て（短い組み合わせを優先）";
            case "it_IT": return "Assegna casualmente una combinazione libera (preferite le corte)";
            case "de_DE": return "Zufällig eine freie Kombination zuweisen (kurze bevorzugt)";
            case "he_IL": return "הקצה אקראית קיצור פנוי (עדיפים קצרים)";
            case "ru_RU": return "Случайно назначить свободную комбинацию (короткие в приоритете)";
            case "pl_PL": return "Losowo przypisz wolny skrót (preferowane krótkie)";
            case "ar_SA": return "تعيين اختصار متاح عشوائيًا (تفضيل القصير)";
            case "pt_BR": return "Atribuir aleatoriamente um atalho livre (curtos preferidos)";
            case "en_US":
            default: return "Assign a random free hotkey (short combos preferred)";
        }
    }
    public get 删除快捷键() {
        switch (this.lang) {
            case "zh_CN": return "删除快捷键（不再响应键盘）";
            case "zh_CHT": return "刪除快捷鍵（不再回應鍵盤）";
            case "es_ES": return "Eliminar el atajo (dejará de responder)";
            case "fr_FR": return "Supprimer le raccourci (ne répondra plus)";
            case "ja_JP": return "ショートカットを削除（キーに反応しなくなります）";
            case "it_IT": return "Elimina la combinazione (non risponderà più)";
            case "de_DE": return "Kombination löschen (reagiert nicht mehr)";
            case "he_IL": return "מחק את הקיצור (לא יגיב יותר)";
            case "ru_RU": return "Удалить комбинацию (перестанет срабатывать)";
            case "pl_PL": return "Usuń skrót (przestanie działać)";
            case "ar_SA": return "حذف الاختصار (لن يستجيب)";
            case "pt_BR": return "Excluir o atalho (deixará de responder)";
            case "en_US":
            default: return "Remove the hotkey (stops responding)";
        }
    }
    public get 恢复默认快捷键() {
        switch (this.lang) {
            case "zh_CN": return "恢复默认键位";
            case "zh_CHT": return "恢復預設鍵位";
            case "es_ES": return "Restablecer el atajo predeterminado";
            case "fr_FR": return "Rétablir le raccourci par défaut";
            case "ja_JP": return "デフォルトのキーに戻す";
            case "it_IT": return "Ripristina la combinazione predefinita";
            case "de_DE": return "Standardkombination wiederherstellen";
            case "he_IL": return "שחזר את קיצור ברירת המחדל";
            case "ru_RU": return "Вернуть комбинацию по умолчанию";
            case "pl_PL": return "Przywróć domyślny skrót";
            case "ar_SA": return "استعادة الاختصار الافتراضي";
            case "pt_BR": return "Restaurar o atalho padrão";
            case "en_US":
            default: return "Restore default hotkey";
        }
    }
    public get 未设置快捷键() {
        switch (this.lang) {
            case "zh_CN": return "未设置";
            case "zh_CHT": return "未設定";
            case "es_ES": return "Sin asignar";
            case "fr_FR": return "Non défini";
            case "ja_JP": return "未設定";
            case "it_IT": return "Non impostato";
            case "de_DE": return "Nicht gesetzt";
            case "he_IL": return "לא מוגדר";
            case "ru_RU": return "Не задано";
            case "pl_PL": return "Nieustawione";
            case "ar_SA": return "غير معين";
            case "pt_BR": return "Não definido";
            case "en_US":
            default: return "Not set";
        }
    }
    public get 已删除() {
        switch (this.lang) {
            case "zh_CN": return "已删除";
            case "zh_CHT": return "已刪除";
            case "es_ES": return "Eliminado";
            case "fr_FR": return "Supprimé";
            case "ja_JP": return "削除しました";
            case "it_IT": return "Eliminato";
            case "de_DE": return "Gelöscht";
            case "he_IL": return "נמחק";
            case "ru_RU": return "Удалено";
            case "pl_PL": return "Usunięto";
            case "ar_SA": return "تم الحذف";
            case "pt_BR": return "Excluído";
            case "en_US":
            default: return "Removed";
        }
    }

    // 番茄钟老模块（TomatoClock/NoteBox/ReadingPointBox 等）从 JSON 轨迁入（2026-08-25 i18n 归一为 TS 轨）
    public get 请等待上个操作完成() {
        switch (this.lang) {
            case "zh_CN": return "请等待上个操作完成！";
            case "zh_CHT": return "請等待上個操作完成！";
            case "es_ES": return "¡espere a que finalice la operación anterior!";
            case "fr_FR": return "Veuillez attendre la fin de l'opération précédente !";
            case "ja_JP": return "前の操作が完了するまで待ってください！";
            case "en_US":
            default: return "Please wait for the previous operation to finish!";
        }
    }
    public get 番茄钟() {
        switch (this.lang) {
            case "zh_CN": return "番茄钟";
            case "zh_CHT": return "番茄鐘";
            case "es_ES": return "Temporizador de tomate";
            case "fr_FR": return "Chronomètre à tomates";
            case "ja_JP": return "トマトクロック";
            case "en_US":
            default: return "Tomato Timer";
        }
    }
    public get 添加图片遮挡层() {
        switch (this.lang) {
            case "zh_CN": return "添加图片遮挡层";
            case "zh_CHT": return "添加圖片遮擋層";
            case "es_ES": return "agregar capa de imagen";
            case "fr_FR": return "Ajouter un calque de masquage d'image";
            case "ja_JP": return "画像オーバーレイを追加";
            case "en_US":
            default: return "Add picture overlay";
        }
    }
    public get 打开目录页书签页() {
        switch (this.lang) {
            case "zh_CN": return "打开目录页/书签页";
            case "zh_CHT": return "打開目錄頁/書籤頁";
            case "es_ES": return "abrir página de índice/marcadores";
            case "fr_FR": return "Ouvrir la page de contenu/page de signets";
            case "ja_JP": return "コンテンツページ/ブックマークページを開く";
            case "en_US":
            default: return "Open contents/bookmark page";
        }
    }
    public get 休息一会儿吧() {
        switch (this.lang) {
            case "zh_CN": return "😊休息一会儿吧！";
            case "zh_CHT": return "😊休息一下吧！";
            case "es_ES": return "😊 Por favor, descansa un momento!";
            case "fr_FR": return "😊 Prenez une pause !";
            case "ja_JP": return "😊 しばらく休憩しましょう！";
            case "en_US":
            default: return "😊 Take a break!";
        }
    }
    public get 分钟后休息() {
        switch (this.lang) {
            case "zh_CN": return "分钟后休息";
            case "zh_CHT": return "分鐘後休息";
            case "es_ES": return "descansar después de minutos";
            case "fr_FR": return "pause après minutes";
            case "ja_JP": return "分後に休憩";
            case "en_US":
            default: return "Take a break after";
        }
    }
    public get 开始计时() {
        switch (this.lang) {
            case "zh_CN": return "开始计时";
            case "zh_CHT": return "開始計時";
            case "es_ES": return "iniciar cuenta regresiva";
            case "fr_FR": return "Démarrer le compte à rebours";
            case "ja_JP": return "カウントダウン開始";
            case "en_US":
            default: return "Start countdown";
        }
    }
    public get 分钟已到() {
        switch (this.lang) {
            case "zh_CN": return "分钟已到";
            case "zh_CHT": return "分鐘已到";
            case "es_ES": return "minutos terminados";
            case "fr_FR": return "minutes écoulées";
            case "ja_JP": return "分間働いた";
            case "en_US":
            default: return "Minutes up";
        }
    }
    public get 请先点击一个内容块() {
        switch (this.lang) {
            case "zh_CN": return "请先点击一个内容块";
            case "zh_CHT": return "請先點擊一個內容塊";
            case "es_ES": return "por favor, haga clic en un bloque de contenido primero";
            case "fr_FR": return "Veuillez cliquer d'abord sur un bloc de contenu";
            case "ja_JP": return "まず内容ブロックをクリックしてください";
            case "en_US":
            default: return "Please click on a block first";
        }
    }
    public get 取消上次的计时() {
        switch (this.lang) {
            case "zh_CN": return "取消上次的计时";
            case "zh_CHT": return "取消上次的計時";
            case "es_ES": return "cancelar la cuenta regresiva anterior";
            case "fr_FR": return "Annuler le compte à rebours précédent";
            case "ja_JP": return "前回のカウントダウンをキャンセル";
            case "en_US":
            default: return "Cancel last countdown";
        }
    }
    public get 取消计时() {
        switch (this.lang) {
            case "zh_CN": return "取消计时";
            case "zh_CHT": return "取消計時";
            case "es_ES": return "cancelar cuenta regresiva";
            case "fr_FR": return "Annuler le compte à rebours";
            case "ja_JP": return "カウントダウンキャンセル";
            case "en_US":
            default: return "Cancel countdown";
        }
    }

    // 渐进学习文案从 progressive JSON 轨迁入（2026-08-25 i18n 归一为 TS 轨）
    public get 请等待索引建立() {
        switch (this.lang) {
            case "zh_CN": return "⏳请等待索引的建立……然后再继续操作……";
            case "zh_CHT": return "⏳請等待索引的建立……然後再繼續操作……";
            case "es_ES": return "⏳ espere a que se establezca el índice... luego continúe con la operación...";
            case "fr_FR": return "⏳Veuillez attendre la création de l'index... puis continuez à opérer...";
            case "ja_JP": return "⏳インデックスの構築を待ってから操作を続けてください……";
            case "en_US":
            default: return "⏳ Please Wait for Indexing to Be Established... Then Continue Operating...";
        }
    }
    public get 重新推送本书() {
        switch (this.lang) {
            case "zh_CN": return "重新推送本书";
            case "zh_CHT": return "重新推送本書";
            case "es_ES": return "reenviar este libro";
            case "fr_FR": return "Réenvoi de ce livre";
            case "ja_JP": return "この本のプッシュを再開";
            case "en_US":
            default: return "Re-push This Book";
        }
    }
    public get 已经忽略本书() {
        switch (this.lang) {
            case "zh_CN": return "已经忽略本书";
            case "zh_CHT": return "已經忽略本書";
            case "es_ES": return "ya se ha ignorado este libro";
            case "fr_FR": return "Ce livre a déjà été ignoré";
            case "ja_JP": return "この本は無視されました";
            case "en_US":
            default: return "This Book Has Been Ignored";
        }
    }
    public get 自动制卡() {
        switch (this.lang) {
            case "zh_CN": return "自动制卡";
            case "zh_CHT": return "自動制卡";
            case "es_ES": return "crear tarjeta automáticamente";
            case "fr_FR": return "créer automatiquement une fiche";
            case "ja_JP": return "自動カード作成";
            case "en_US":
            default: return "Auto Make Card";
        }
    }
    public get 已经是最后一页了() {
        switch (this.lang) {
            case "zh_CN": return "已经是最后一页了";
            case "zh_CHT": return "已經是最後一頁了";
            case "es_ES": return "ya es la última página";
            case "fr_FR": return "c'est déjà la dernière page";
            case "ja_JP": return "これが最後のページです";
            case "en_US":
            default: return "This is the Last Page";
        }
    }
    public get 已经是第一页了() {
        switch (this.lang) {
            case "zh_CN": return "已经是第一页了";
            case "zh_CHT": return "已經是第一頁了";
            case "es_ES": return "ya es la primera página";
            case "fr_FR": return "c'est déjà la première page";
            case "ja_JP": return "これが最初のページです";
            case "en_US":
            default: return "This is the First Page";
        }
    }
    public get 按标题拆分() {
        switch (this.lang) {
            case "zh_CN": return "标题级别1~6，b是粗体单独一行，逗号隔开，留空不拆分。";
            case "zh_CHT": return "標題級別1~6，b是粗體單獨一行，逗號隔開，留空不拆分。";
            case "es_ES": return "niveles de título 1~6, b es negrita en una línea separada, separados por comas, dejar en blanco para no dividir.";
            case "fr_FR": return "niveaux de titres 1~6, b pour gras sur une ligne séparée, séparés par des virgules, laisser vide pour ne pas diviser.";
            case "ja_JP": return "見出しレベル1〜6、bは太字で1行、カンマで区切り、空欄は分割しない。";
            case "en_US":
            default: return "Heading Levels 1~6, b for Bold on a Separate Line, Comma Separated, Leave Blank for No Split.";
        }
    }
    public get 渐进学习菜单() {
        switch (this.lang) {
            case "zh_CN": return "渐进学习菜单";
            case "zh_CHT": return "漸進學習菜單";
            case "es_ES": return "menú de aprendizaje progresivo";
            case "fr_FR": return "Menu d'apprentissage progressif";
            case "ja_JP": return "漸進学習メニュー";
            case "en_US":
            default: return "Progressive Reading Menu";
        }
    }
    public get 该分片内容已失效() {
        switch (this.lang) {
            case "zh_CN": return "该分片内容已失效（源块已被删除），已跳过";
            case "zh_CHT": return "該分片內容已失效（源塊已被刪除），已跳過";
            case "es_ES": return "este fragmento no está disponible (bloques de origen eliminados), omitido";
            case "fr_FR": return "cette pièce est indisponible (blocs sources supprimés), ignorée";
            case "ja_JP": return "このシャープは無効です（元ブロックが削除済み）、スキップしました";
            case "en_US":
            default: return "This Piece Is Unavailable (Source Blocks Deleted), Skipped";
        }
    }
    public get 正在为您打开文档片段() {
        switch (this.lang) {
            case "zh_CN": return "正在为您打开文档片段，请耐心等待……";
            case "zh_CHT": return "正在為您打開文檔片段，請耐心等待……";
            case "es_ES": return "abriendo el fragmento del documento para ti, por favor ten paciencia...";
            case "fr_FR": return "Ouverture de la pièce de document pour vous, veuillez patienter...";
            case "ja_JP": return "ドキュメントのシャープを開いています、お待ちください……";
            case "en_US":
            default: return "Opening Document Piece for You, Please Wait...";
        }
    }
    public get 请先打开一个文档() {
        switch (this.lang) {
            case "zh_CN": return "请先打开一个文档";
            case "zh_CHT": return "請先打開一個文檔";
            case "es_ES": return "por favor, abra primero un documento";
            case "fr_FR": return "Veuillez d'abord ouvrir un document";
            case "ja_JP": return "まずドキュメントを開いてください";
            case "en_US":
            default: return "Please Open a Document First";
        }
    }
    public get 取消自动文档制卡() {
        switch (this.lang) {
            case "zh_CN": return "取消自动文档制卡";
            case "zh_CHT": return "取消自動文檔制卡";
            case "es_ES": return "cancelar creación automática de tarjetas de documento";
            case "fr_FR": return "Annuler la création automatique de fiches de document";
            case "ja_JP": return "自動ドキュメントカード作成をキャンセル";
            case "en_US":
            default: return "Cancel Auto Document Card Making";
        }
    }
    public get 自动文档制卡() {
        switch (this.lang) {
            case "zh_CN": return "自动文档制卡";
            case "zh_CHT": return "自動文檔制卡";
            case "es_ES": return "crear tarjetas de documento automáticamente";
            case "fr_FR": return "Création automatique de fiches de document";
            case "ja_JP": return "自動ドキュメントカード作成";
            case "en_US":
            default: return "Auto Document Card Making";
        }
    }
    public get 似乎书本已被删除() {
        switch (this.lang) {
            case "zh_CN": return "似乎{bookID}已经被删除";
            case "zh_CHT": return "似乎{bookID}已經被刪除";
            case "es_ES": return "parece que {bookID} ha sido eliminado";
            case "fr_FR": return "Il semble que {bookID} ait été supprimé";
            case "ja_JP": return "{bookID}は削除された可能性があります";
            case "en_US":
            default: return "It Seems {bookID} Has Been Removed";
        }
    }
    public get 找不到文档对应的笔记本() {
        switch (this.lang) {
            case "zh_CN": return "找不到文档对应的笔记本：";
            case "zh_CHT": return "找不到文檔對應的筆記本：";
            case "es_ES": return "no se puede encontrar la libreta correspondiente al documento:";
            case "fr_FR": return "Impossible de trouver le cahier correspondant au document :";
            case "ja_JP": return "対応するノートブックが見つかりません：";
            case "en_US":
            default: return "Cannot Find the Notebook Corresponding to the Document:";
        }
    }
    public get 未找到文档请等待索引() {
        switch (this.lang) {
            case "zh_CN": return "未找到文档，请重新建立索引或者等待索引建立完成";
            case "zh_CHT": return "未找到文檔，請重新建立索引或者等待索引建立完成";
            case "es_ES": return "no se encontró el documento, por favor vuelva a crear el índice o espere a que se complete el índice";
            case "fr_FR": return "Document non trouvé, veuillez recréer l'index ou attendre la fin de la création de l'index";
            case "ja_JP": return "ドキュメントが見つかりませんでした、インデックスを再構築するか、インデックス構築が完了するのを待ってください";
            case "en_US":
            default: return "Document Not Found, Please Rebuild Index or Wait for Indexing to Complete";
        }
    }
    public get 请先将此文档加入渐进学习列表() {
        switch (this.lang) {
            case "zh_CN": return "请先将此文档加入渐进学习列表";
            case "zh_CHT": return "請先將此文檔加入漸進學習列表";
            case "es_ES": return "por favor, agregue primero este documento a la lista de aprendizaje progresivo";
            case "fr_FR": return "Veuillez d'abord ajouter ce document à la liste d'apprentissage progressif";
            case "ja_JP": return "まずこのドキュメントを漸進学習リストに追加してください";
            case "en_US":
            default: return "Please Add This Document to the Progressive Reading List First";
        }
    }
    public get 添加文档到渐进阅读() {
        switch (this.lang) {
            case "zh_CN": return "添加文档/重新添加文档到渐进阅读";
            case "zh_CHT": return "添加文檔/重新添加文檔到漸進閱讀";
            case "es_ES": return "agregar documento/volver a agregar documento al aprendizaje progresivo";
            case "fr_FR": return "Ajouter/réajouter un document à la lecture progressive";
            case "ja_JP": return "ドキュメントを漸進読書に追加/再追加";
            case "en_US":
            default: return "Add/Re-add Document to Progressive Reading";
        }
    }
    public get 删除并下一个() {
        switch (this.lang) {
            case "zh_CN": return "🗑 ➡";
            case "zh_CHT": return "🗑 ➡";
            case "es_ES": return "🗑 ➡";
            case "fr_FR": return "🗑 ➡";
            case "ja_JP": return "🗑 ➡";
            case "en_US":
            default: return "🗑 ➡";
        }
    }
    public get 删除并返回() {
        switch (this.lang) {
            case "zh_CN": return "⬅ 🗑";
            case "zh_CHT": return "⬅ 🗑";
            case "es_ES": return "⬅ 🗑";
            case "fr_FR": return "⬅ 🗑";
            case "ja_JP": return "⬅ 🗑";
            case "en_US":
            default: return "⬅ 🗑";
        }
    }
    public get 您还没添加任何文档() {
        switch (this.lang) {
            case "zh_CN": return "您还没添加任何文档。";
            case "zh_CHT": return "您還沒添加任何文檔。";
            case "es_ES": return "aún no ha agregado ningún documento.";
            case "fr_FR": return "Vous n'avez encore ajouté aucun document.";
            case "ja_JP": return "まだドキュメントを追加していません。";
            case "en_US":
            default: return "You Haven't Added Any Documents Yet.";
        }
    }
}

// public[^get]+\(  查找所有的函数
export const tomatoI18n = new TomatoI18n();
