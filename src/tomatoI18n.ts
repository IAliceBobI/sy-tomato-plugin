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
    // 番茄钟 □1（暂停/继续+自动循环+常驻倒计时，2026-08-29）
    public get 自动循环() {
        switch (this.lang) {
            case "zh_CN": return "工作/休息自动循环（工作结束自动进入休息，休息结束自动回到工作）";
            case "zh_CHT": return "工作/休息自動循環（工作結束自動進入休息，休息結束自動回到工作）";
            case "es_ES": return "Ciclo automático trabajo/descanso (al terminar el trabajo entra en descanso, al terminar el descanso vuelve al trabajo)";
            case "fr_FR": return "Cycle automatique travail/pause (à la fin du travail, passage en pause ; à la fin de la pause, retour au travail)";
            case "ja_JP": return "作業/休憩の自動サイクル（作業終了で自動的に休憩へ、休憩終了で自動的に作業へ）";
            case "en_US":
            default: return "Auto work/break cycle (break starts automatically after work, work resumes after break)";
        }
    }
    public get 休息时长分钟() {
        switch (this.lang) {
            case "zh_CN": return "休息时长（分钟）";
            case "zh_CHT": return "休息時長（分鐘）";
            case "es_ES": return "Duración del descanso (minutos)";
            case "fr_FR": return "Durée de la pause (minutes)";
            case "ja_JP": return "休憩時間（分）";
            case "en_US":
            default: return "Break length (minutes)";
        }
    }
    public get 暂停计时() {
        switch (this.lang) {
            case "zh_CN": return "暂停计时";
            case "zh_CHT": return "暫停計時";
            case "es_ES": return "Pausar cuenta regresiva";
            case "fr_FR": return "Mettre en pause";
            case "ja_JP": return "タイマーを一時停止";
            case "en_US":
            default: return "Pause timer";
        }
    }
    public get 继续计时() {
        switch (this.lang) {
            case "zh_CN": return "继续计时";
            case "zh_CHT": return "繼續計時";
            case "es_ES": return "Reanudar cuenta regresiva";
            case "fr_FR": return "Reprendre le compte à rebours";
            case "ja_JP": return "タイマーを再開";
            case "en_US":
            default: return "Resume timer";
        }
    }
    public 进入休息分钟(minute: number) {
        switch (this.lang) {
            case "zh_CN": return `🍅进入休息：${minute} 分钟`;
            case "zh_CHT": return `🍅進入休息：${minute} 分鐘`;
            case "es_ES": return `🍅Comienza el descanso: ${minute} minutos`;
            case "fr_FR": return `🍅Début de la pause : ${minute} minutes`;
            case "ja_JP": return `🍅休憩開始：${minute} 分`;
            case "en_US":
            default: return `🍅Break started: ${minute} minutes`;
        }
    }
    public 休息结束开始工作(minute: number) {
        switch (this.lang) {
            case "zh_CN": return `☕休息结束，开始工作：${minute} 分钟`;
            case "zh_CHT": return `☕休息結束，開始工作：${minute} 分鐘`;
            case "es_ES": return `☕Fin del descanso, vuelve al trabajo: ${minute} minutos`;
            case "fr_FR": return `☕Fin de la pause, au travail : ${minute} minutes`;
            case "ja_JP": return `☕休憩終了、作業開始：${minute} 分`;
            case "en_US":
            default: return `☕Break over, back to work: ${minute} minutes`;
        }
    }
    public 休息N分钟(minute: number) {
        switch (this.lang) {
            case "zh_CN": return `休息 ${minute} 分钟`;
            case "zh_CHT": return `休息 ${minute} 分鐘`;
            case "es_ES": return `Descanso de ${minute} minutos`;
            case "fr_FR": return `Pause de ${minute} minutes`;
            case "ja_JP": return `${minute} 分休憩`;
            case "en_US":
            default: return `${minute}-minute break`;
        }
    }
    public get 点击跳到下一阶段() {
        switch (this.lang) {
            case "zh_CN": return "点击跳到下一阶段（工作↔休息）";
            case "zh_CHT": return "點擊跳到下一階段（工作↔休息）";
            case "es_ES": return "Clic para saltar a la siguiente fase (trabajo↔descanso)";
            case "fr_FR": return "Cliquer pour passer à la phase suivante (travail↔pause)";
            case "ja_JP": return "クリックで次のフェーズへ（作業↔休憩）";
            case "en_US":
            default: return "Click to skip to the next phase (work↔break)";
        }
    }
    public get 专注时长写入文档() {
        switch (this.lang) {
            case "zh_CN": return "专注时长写入文档";
            case "zh_CHT": return "專注時長寫入文檔";
            case "es_ES": return "Escribir los minutos de concentración en el documento";
            case "fr_FR": return "Écrire les minutes de concentration dans le document";
            case "ja_JP": return "集中時間をドキュメントに書き込む";
            case "en_US":
            default: return "Write focus minutes to document";
        }
    }
    public get 到点提示音() {
        switch (this.lang) {
            case "zh_CN": return "到点提示音";
            case "zh_CHT": return "到點提示音";
            case "es_ES": return "Sonido al terminar";
            case "fr_FR": return "Son à la fin";
            case "ja_JP": return "終了時にサウンドを再生";
            case "en_US":
            default: return "Play sound on completion";
        }
    }
    public 今日番茄N个M分钟(pomo: number, min: number) {
        switch (this.lang) {
            case "zh_CN": return `今日 ${pomo} 番茄 · ${min} 分钟`;
            case "zh_CHT": return `今日 ${pomo} 番茄 · ${min} 分鐘`;
            case "es_ES": return `Hoy: ${pomo} pomodoros · ${min} minutos`;
            case "fr_FR": return `Aujourd'hui : ${pomo} pomodoros · ${min} minutes`;
            case "ja_JP": return `今日 ${pomo} ポモドーロ · ${min} 分`;
            case "en_US":
            default: return `Today: ${pomo} pomodoros · ${min} min`;
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
    public get 加书失败请重试() {
        switch (this.lang) {
            case "zh_CN": return "加书失败，请重试";
            case "zh_CHT": return "加書失敗，請重試";
            case "es_ES": return "Error al añadir el libro, inténtelo de nuevo";
            case "fr_FR": return "Échec de l'ajout du livre, veuillez réessayer";
            case "ja_JP": return "本の追加に失敗しました。再試行してください";
            case "en_US":
            default: return "Failed to Add the Book, Please Retry";
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

    // v5 □4：问题/心得标记（thinkQueue 状态机）与摘抄对话框瘦身
    public get 摘抄并标问题() {
        switch (this.lang) {
            case "zh_CN": return "摘抄并标问题（定期重访直到弄懂）";
            case "es_ES": return "Extraer y marcar como pregunta";
            case "fr_FR": return "Extraire et marquer comme question";
            case "ja_JP": return "摘録して質問としてマーク";
            case "zh_CHT": return "摘抄並標問題";
            case "it_IT": return "Estrai e contrassegna come domanda";
            case "de_DE": return "Extrahieren und als Frage markieren";
            case "he_IL": return "חלץ וסמן כשאלה";
            case "ru_RU": return "Извлечь и пометить как вопрос";
            case "pl_PL": return "Wyodrębnij i oznacz jako pytanie";
            case "ar_SA": return "استخرج وعلّم كسؤال";
            case "pt_BR": return "Extrair e marcar como pergunta";
            case "en_US":
            default: return "Digest & mark as question";
        }
    }

    public get 问题已解决() {
        switch (this.lang) {
            case "zh_CN": return "问题已解决（转心得，不再重访）";
            case "es_ES": return "Pregunta resuelta";
            case "fr_FR": return "Question résolue";
            case "ja_JP": return "質問が解決しました";
            case "zh_CHT": return "問題已解決";
            case "it_IT": return "Domanda risolta";
            case "de_DE": return "Frage gelöst";
            case "he_IL": return "השאלה נפתרה";
            case "ru_RU": return "Вопрос решён";
            case "pl_PL": return "Pytanie rozwiązane";
            case "ar_SA": return "تم حل السؤال";
            case "pt_BR": return "Pergunta resolvida";
            case "en_US":
            default: return "Question resolved";
        }
    }

    public get 还没懂稍后再看() {
        switch (this.lang) {
            case "zh_CN": return "还没懂，稍后再看";
            case "es_ES": return "Aún no lo entiendo, más tarde";
            case "fr_FR": return "Pas encore compris, plus tard";
            case "ja_JP": return "まだ分かりません、後で";
            case "zh_CHT": return "還沒懂，稍後再看";
            case "it_IT": return "Non capito ancora, più tardi";
            case "de_DE": return "Noch nicht verstanden, später";
            case "he_IL": return "עוד לא הבנתי, מאוחר יותר";
            case "ru_RU": return "Пока не понял, позже";
            case "pl_PL": return "Jeszcze nie rozumiem, później";
            case "ar_SA": return "لم أفهم بعد، لاحقًا";
            case "pt_BR": return "Ainda não entendi, mais tarde";
            case "en_US":
            default: return "Still not understood, revisit later";
        }
    }

    public get 标为心得() {
        switch (this.lang) {
            case "zh_CN": return "标为心得";
            case "es_ES": return "Marcar como idea";
            case "fr_FR": return "Marquer comme idée";
            case "ja_JP": return "心得としてマーク";
            case "zh_CHT": return "標為心得";
            case "it_IT": return "Contrassegna come idea";
            case "de_DE": return "Als Einblick markieren";
            case "he_IL": return "סמן כתובנה";
            case "ru_RU": return "Пометить как вывод";
            case "pl_PL": return "Oznacz jako przemyślenie";
            case "ar_SA": return "علّم كفكرة";
            case "pt_BR": return "Marcar como insight";
            case "en_US":
            default: return "Mark as insight";
        }
    }

    public get 取消心得标记() {
        switch (this.lang) {
            case "zh_CN": return "取消心得标记";
            case "es_ES": return "Quitar marca de idea";
            case "fr_FR": return "Retirer la marque d'idée";
            case "ja_JP": return "心得マークを解除";
            case "zh_CHT": return "取消心得標記";
            case "it_IT": return "Rimuovi contrassegno idea";
            case "de_DE": return "Einblick-Markierung aufheben";
            case "he_IL": return "הסר סימון תובנה";
            case "ru_RU": return "Снять пометку вывода";
            case "pl_PL": return "Usuń oznaczenie przemyślenia";
            case "ar_SA": return "إزالة علامة الفكرة";
            case "pt_BR": return "Remover marca de insight";
            case "en_US":
            default: return "Unmark insight";
        }
    }

    public get 更多工具() {
        switch (this.lang) {
            case "zh_CN": return "更多工具";
            case "es_ES": return "Más herramientas";
            case "fr_FR": return "Plus d'outils";
            case "ja_JP": return "その他のツール";
            case "zh_CHT": return "更多工具";
            case "it_IT": return "Altri strumenti";
            case "de_DE": return "Weitere Werkzeuge";
            case "he_IL": return "כלים נוספים";
            case "ru_RU": return "Ещё инструменты";
            case "pl_PL": return "Więcej narzędzi";
            case "ar_SA": return "المزيد من الأدوات";
            case "pt_BR": return "Mais ferramentas";
            case "en_US":
            default: return "More tools";
        }
    }

    public get 已推迟重访() {
        switch (this.lang) {
            case "zh_CN": return "已推迟，N 天后重访";
            case "es_ES": return "Aplazado, revisita en N días";
            case "fr_FR": return "Reporté, revoir dans N jours";
            case "ja_JP": return "延期しました、N日後に再訪";
            case "zh_CHT": return "已推遲，N天後重訪";
            case "it_IT": return "Rinviato, rivedrai tra N giorni";
            case "de_DE": return "Verschoben, Wiederholung in N Tagen";
            case "he_IL": return "נדחה, ייבדק שוב בעוד N ימים";
            case "ru_RU": return "Отложено, повтор через N дней";
            case "pl_PL": return "Odroczone, powrót za N dni";
            case "ar_SA": return "تم التأجيل، إعادة زيارة بعد N يومًا";
            case "pt_BR": return "Adiado, revisita em N dias";
            case "en_US":
            default: return "Postponed, revisit in N days";
        }
    }

    // ============ v5 □12 重访调度通用化（zh+en 一等，其余落 en） ============

    public get 重访调度() {
        switch (this.lang) {
            case "zh_CN": return "重访调度…";
            case "zh_CHT": return "重訪調度…";
            case "en_US":
            default: return "Revisit schedule…";
        }
    }

    public get 曲线重访() {
        switch (this.lang) {
            case "zh_CN": return "曲线重访（3·6·12…60 天）";
            case "zh_CHT": return "曲線重訪（3·6·12…60 天）";
            case "en_US":
            default: return "Curve revisit (3·6·12…60d)";
        }
    }

    public 每N天重访(n: number) {
        switch (this.lang) {
            case "zh_CN": return `每 ${n} 天重访`;
            case "zh_CHT": return `每 ${n} 天重訪`;
            case "en_US":
            default: return `Revisit every ${n} days`;
        }
    }

    public get 移除重访调度() {
        switch (this.lang) {
            case "zh_CN": return "移除重访调度";
            case "zh_CHT": return "移除重訪調度";
            case "en_US":
            default: return "Remove revisit schedule";
        }
    }

    public get 推迟到明天() {
        switch (this.lang) {
            case "zh_CN": return "推迟到明天";
            case "zh_CHT": return "推遲到明天";
            case "en_US":
            default: return "Postpone to tomorrow";
        }
    }

    public get 本轮已完成() {
        switch (this.lang) {
            case "zh_CN": return "本轮已完成";
            case "zh_CHT": return "本輪已完成";
            case "en_US":
            default: return "Round done";
        }
    }

    public get 已完成转心得() {
        switch (this.lang) {
            case "zh_CN": return "已完成，转为心得";
            case "zh_CHT": return "已完成，轉為心得";
            case "en_US":
            default: return "Done, marked as insight";
        }
    }

    public 已完成重访(n: number) {
        switch (this.lang) {
            case "zh_CN": return `已完成，${n} 天后重访`;
            case "zh_CHT": return `已完成，${n} 天後重訪`;
            case "en_US":
            default: return `Done, revisit in ${n} days`;
        }
    }

    public get 已设曲线重访() {
        switch (this.lang) {
            case "zh_CN": return "已设曲线重访，3 天后首次重访";
            case "zh_CHT": return "已設曲線重訪，3 天後首次重訪";
            case "en_US":
            default: return "Curve revisit set, first in 3 days";
        }
    }

    public 已设每N天重访(n: number) {
        switch (this.lang) {
            case "zh_CN": return `已设每 ${n} 天重访`;
            case "zh_CHT": return `已設每 ${n} 天重訪`;
            case "en_US":
            default: return `Revisit every ${n} days set`;
        }
    }

    public get 调度已移除() {
        switch (this.lang) {
            case "zh_CN": return "已移除重访调度";
            case "zh_CHT": return "已移除重訪調度";
            case "en_US":
            default: return "Revisit schedule removed";
        }
    }

    public get 重访到期待办() {
        switch (this.lang) {
            case "zh_CN": return "重访到期待办";
            case "zh_CHT": return "重訪到期待辦";
            case "en_US":
            default: return "Due revisits";
        }
    }

    // ============ v5 □16 摘抄工作流深化（zh+en 一等，其余落 en） ============

    public get 整篇摘抄() {
        switch (this.lang) {
            case "zh_CN": return "整篇摘抄";
            case "zh_CHT": return "整篇摘抄";
            case "en_US":
            default: return "Digest whole doc";
        }
    }

    public get 分片已重建() {
        switch (this.lang) {
            case "zh_CN": return "分片已重建";
            case "zh_CHT": return "分片已重建";
            case "en_US":
            default: return "Piece rebuilt";
        }
    }

    public get 暂无到期重访() {
        switch (this.lang) {
            case "zh_CN": return "暂无到期重访";
            case "zh_CHT": return "暫無到期重訪";
            case "en_US":
            default: return "No due revisits";
        }
    }

    // ============ v5 □5 浮条三态（docs/prog-v5-floatbar-design.md；zh+en 一等，其余落 en） ============

    public get 浮条() {
        switch (this.lang) {
            case "zh_CN": return "浮条";
            case "zh_CHT": return "浮條";
            case "en_US":
            default: return "Float bar";
        }
    }

    public get 收起() {
        switch (this.lang) {
            case "zh_CN": return "收起";
            case "zh_CHT": return "收起";
            case "en_US":
            default: return "Collapse";
        }
    }

    // □14b 平铺区折叠钮 tooltip（单行制：折叠/展开是自解释动作，无用法句无快捷键）
    public get 收起工具区() {
        switch (this.lang) {
            case "zh_CN": return "收起工具区";
            case "zh_CHT": return "收起工具區";
            case "en_US":
            default: return "Collapse the tray";
        }
    }

    public get 展开工具区() {
        switch (this.lang) {
            case "zh_CN": return "展开工具区";
            case "zh_CHT": return "展開工具區";
            case "en_US":
            default: return "Expand the tray";
        }
    }

    public get 浮条主排按钮提示() {
        switch (this.lang) {
            case "zh_CN": return "勾选的按钮站片态浮条首行，未勾的落首行下方平铺区小格（永不消失）；桌面也可在浮条上直接拖拽换位（含低频与高级钮），效果同勾选";
            case "zh_CHT": return "勾選的按鈕站片態浮條首行，未勾的落首行下方平鋪區小格（永不消失）；桌面也可在浮條上直接拖拽換位（含低頻與高級鈕），效果同勾選";
            case "en_US":
            default: return "Checked buttons sit on the first row; unchecked ones become small cells in the flat area below (never lost). On desktop you can also drag buttons directly on the bar, including low-frequency and advanced ones.";
        }
    }

    // □10 平铺区短标签（docs/prog-floatbar-ux-redesign.md □10 视觉规格 i18n 清单 2026-08-29）：
    // 只供格内文字（2-6 字），tooltip 全名走既有长文案 getter，两层互不挤占。
    // zh_CHT 由规格表给定，其余语种回落 en（缺翻译落英文既有哲学）。
    public get 换书() {
        switch (this.lang) {
            case "zh_CN": return "换书";
            case "zh_CHT": return "換書";
            case "en_US":
            default: return "Swap book";
        }
    }
    public get 下片删() {
        switch (this.lang) {
            case "zh_CN": return "下片删";
            case "zh_CHT": return "下片刪";
            case "en_US":
            default: return "Next (del)";
        }
    }
    public get 回看() {
        switch (this.lang) {
            case "zh_CN": return "回看";
            case "zh_CHT": return "回看";
            case "en_US":
            default: return "Re-read";
        }
    }
    public get 上片删() {
        switch (this.lang) {
            case "zh_CN": return "上片删";
            case "zh_CHT": return "上片刪";
            case "en_US":
            default: return "Prev (del)";
        }
    }
    public get 重插() {
        switch (this.lang) {
            case "zh_CN": return "重插";
            case "zh_CHT": return "重插";
            case "en_US":
            default: return "Reinsert";
        }
    }
    public get 删原文() {
        switch (this.lang) {
            case "zh_CN": return "删原文";
            case "zh_CHT": return "刪原文";
            case "en_US":
            default: return "Del original";
        }
    }
    public get 删片退出() {
        switch (this.lang) {
            case "zh_CN": return "删片退出";
            case "zh_CHT": return "刪片退出";
            case "en_US":
            default: return "Del & exit";
        }
    }
    public get 不再推送() {
        switch (this.lang) {
            case "zh_CN": return "不再推送";
            case "zh_CHT": return "不再推送";
            case "en_US":
            default: return "Mute book";
        }
    }
    public get 原地制卡短() {
        switch (this.lang) {
            case "zh_CN": return "原地制卡";
            case "zh_CHT": return "原地製卡";
            case "en_US":
            default: return "Card here";
        }
    }
    public get 制日卡() {
        switch (this.lang) {
            case "zh_CN": return "制日卡";
            case "zh_CHT": return "製日卡";
            case "en_US":
            default: return "Daily card";
        }
    }
    public get 制日卡无引() {
        switch (this.lang) {
            case "zh_CN": return "制日卡无引";
            case "zh_CHT": return "製日卡無引";
            case "en_US":
            default: return "Daily no-ref";
        }
    }
    public get 多行() {
        switch (this.lang) {
            case "zh_CN": return "多行";
            case "zh_CHT": return "多行";
            case "en_US":
            default: return "Multiline";
        }
    }
    public get 收集() {
        switch (this.lang) {
            case "zh_CN": return "收集";
            case "zh_CHT": return "收集";
            case "en_US":
            default: return "Collect";
        }
    }
    public get 移上一片() {
        switch (this.lang) {
            case "zh_CN": return "移上一片";
            case "zh_CHT": return "移上一片";
            case "en_US":
            default: return "Move prev";
        }
    }
    public get 移下一片() {
        switch (this.lang) {
            case "zh_CN": return "移下一片";
            case "zh_CHT": return "移下一片";
            case "en_US":
            default: return "Move next";
        }
    }
    public get 提取全部() {
        switch (this.lang) {
            case "zh_CN": return "提取全部";
            case "zh_CHT": return "提取全部";
            case "en_US":
            default: return "Extract all";
        }
    }
    public get 提取到底() {
        switch (this.lang) {
            case "zh_CN": return "提取到底";
            case "zh_CHT": return "提取到底";
            case "en_US":
            default: return "To bottom";
        }
    }
    public get 去色() {
        switch (this.lang) {
            case "zh_CN": return "去色";
            case "zh_CHT": return "去色";
            case "en_US":
            default: return "Uncolor";
        }
    }
    public get 恢复颜色() {
        switch (this.lang) {
            case "zh_CN": return "恢复颜色";
            case "zh_CHT": return "恢復顏色";
            case "en_US":
            default: return "Recolor";
        }
    }
    public get 合并() {
        switch (this.lang) {
            case "zh_CN": return "合并";
            case "zh_CHT": return "合併";
            case "en_US":
            default: return "Merge";
        }
    }
    /** □10 平铺区高级动作解析不到编辑器时的 toast（reasoning review P2） */
    public get 分片编辑器未就绪() {
        switch (this.lang) {
            case "zh_CN": return "未找到可用编辑器，请先打开分片文档";
            case "zh_CHT": return "未找到可用編輯器，請先打開分片文檔";
            case "en_US":
            default: return "No editor found; open the piece document first";
        }
    }

    public get 分片() {
        switch (this.lang) {
            case "zh_CN": return "分片";
            case "zh_CHT": return "分片";
            case "en_US":
            default: return "Piece";
        }
    }

    public get 摘抄() {
        switch (this.lang) {
            case "zh_CN": return "摘抄";
            case "zh_CHT": return "摘抄";
            case "en_US":
            default: return "Digest";
        }
    }

    public get 本书附属卡() {
        switch (this.lang) {
            case "zh_CN": return "本书附属卡·到期 {N}";
            case "zh_CHT": return "本書附屬卡·到期 {N}";
            case "en_US":
            default: return "Book cards · {N} due";
        }
    }

    /** 附属卡（无到期占位）：设置面板按钮池等列名场景，占位版见 本书附属卡 */
    public get 附属卡() {
        switch (this.lang) {
            case "zh_CN": return "本书附属卡";
            case "zh_CHT": return "本書附屬卡";
            case "en_US":
            default: return "Book cards";
        }
    }

    public get 下一片删本片() {
        switch (this.lang) {
            case "zh_CN": return "下一片·删本片";
            case "zh_CHT": return "下一片·刪本片";
            case "en_US":
            default: return "Next piece (delete this)";
        }
    }

    public get 纯回看上一片() {
        switch (this.lang) {
            case "zh_CN": return "纯回看上一片";
            case "zh_CHT": return "純回看上一片";
            case "en_US":
            default: return "Re-read previous piece";
        }
    }

    public get 打开原书() {
        switch (this.lang) {
            case "zh_CN": return "打开原书";
            case "zh_CHT": return "打開原書";
            case "en_US":
            default: return "Open the book";
        }
    }

    public get 回原书() {
        switch (this.lang) {
            case "zh_CN": return "回原书";
            case "zh_CHT": return "回原書";
            case "en_US":
            default: return "Back to book";
        }
    }

    public get 继续读() {
        switch (this.lang) {
            case "zh_CN": return "继续读（从断点开片）";
            case "zh_CHT": return "繼續讀（從斷點開片）";
            case "en_US":
            default: return "Continue reading";
        }
    }

    public get 摘抄汇总() {
        switch (this.lang) {
            case "zh_CN": return "摘抄汇总";
            case "zh_CHT": return "摘抄匯總";
            case "en_US":
            default: return "All digests of this book";
        }
    }

    public get 归档本书() {
        switch (this.lang) {
            case "zh_CN": return "归档本书";
            case "zh_CHT": return "歸檔本書";
            case "en_US":
            default: return "Archive this book";
        }
    }

    public get 归档本书确认() {
        switch (this.lang) {
            case "zh_CN": return "归档《{name}》？原书将退出一切推送，摘抄永久留存。";
            case "zh_CHT": return "歸檔《{name}》？原書將退出一一切推送，摘抄永久留存。";
            case "en_US":
            default: return "Archive \"{name}\"? The book stops being served; digests are kept forever.";
        }
    }

    public get 已归档本书() {
        switch (this.lang) {
            case "zh_CN": return "已归档本书";
            case "zh_CHT": return "已歸檔本書";
            case "en_US":
            default: return "Book archived";
        }
    }

    public get 送进仿写() {
        switch (this.lang) {
            case "zh_CN": return "送进仿写";
            case "zh_CHT": return "送進仿寫";
            case "en_US":
            default: return "Send to Recite";
        }
    }

    public get 摘抄选中内容() {
        switch (this.lang) {
            case "zh_CN": return "摘抄选中内容";
            case "zh_CHT": return "摘抄選中內容";
            case "en_US":
            default: return "Digest selection";
        }
    }

    public get 更多操作() {
        switch (this.lang) {
            case "zh_CN": return "更多操作";
            case "zh_CHT": return "更多操作";
            case "en_US":
            default: return "More";
        }
    }

    public get 留档() {
        switch (this.lang) {
            case "zh_CN": return "留档";
            case "zh_CHT": return "留檔";
            case "en_US":
            default: return "Keep (no schedule)";
        }
    }

    public get 思考() {
        switch (this.lang) {
            case "zh_CN": return "思考";
            case "zh_CHT": return "思考";
            case "en_US":
            default: return "Think";
        }
    }

    public get 背诵() {
        switch (this.lang) {
            case "zh_CN": return "背诵";
            case "zh_CHT": return "背誦";
            case "en_US":
            default: return "Recite";
        }
    }

    public get 单词() {
        switch (this.lang) {
            case "zh_CN": return "单词";
            case "zh_CHT": return "單詞";
            case "en_US":
            default: return "Word";
        }
    }

    public get 仿写() {
        switch (this.lang) {
            case "zh_CN": return "仿写";
            case "zh_CHT": return "仿寫";
            case "en_US":
            default: return "Rewrite";
        }
    }

    public get 多行挑选() {
        switch (this.lang) {
            case "zh_CN": return "多行挑选";
            case "zh_CHT": return "多行挑選";
            case "en_US":
            default: return "Pick lines";
        }
    }

    public get 请先选择要摘抄的块() {
        switch (this.lang) {
            case "zh_CN": return "请先选择要摘抄的块";
            case "zh_CHT": return "請先選擇要摘抄的塊";
            case "en_US":
            default: return "Select blocks to digest first";
        }
    }

    public get 请先选中文本() {
        switch (this.lang) {
            case "zh_CN": return "请先选中文本";
            case "zh_CHT": return "請先選中文本";
            case "en_US":
            default: return "Select text first";
        }
    }

    public get 本书还没有摘抄() {
        switch (this.lang) {
            case "zh_CN": return "本书还没有摘抄";
            case "zh_CHT": return "本書還沒有摘抄";
            case "en_US":
            default: return "No digests for this book yet";
        }
    }

    public get 未找到仿写插件功能() {
        switch (this.lang) {
            case "zh_CN": return "未找到仿写插件功能，请确认 recite 已安装启用";
            case "zh_CHT": return "未找到仿寫插件功能，請確認 recite 已安裝啟用";
            case "en_US":
            default: return "Recite plugin not available";
        }
    }

    public get 渐进学习浮条开关() {
        switch (this.lang) {
            case "zh_CN": return "浮条与悬浮球总开关";
            case "zh_CHT": return "浮條與懸浮球總開關";
            case "en_US":
            default: return "Toggle float bar & ball";
        }
    }

    // v5 □6 状态栏火苗 + 左 Dock 舰队总览（zh+en 一等，缺翻译落英文）
    public get 舰队总览() {
        switch (this.lang) {
            case "zh_CN": return "舰队总览";
            case "zh_CHT": return "艦隊總覽";
            case "en_US":
            default: return "Reading fleet";
        }
    }

    public get 今日阅读() {
        switch (this.lang) {
            case "zh_CN": return "今日阅读";
            case "zh_CHT": return "今日閱讀";
            case "en_US":
            default: return "Today";
        }
    }

    public 火苗提示(read: number, quota: number, debt: number) {
        switch (this.lang) {
            case "zh_CN": return `今日已读 ${read}/${quota} · 欠债 ${debt}\n点击直达下一片`;
            case "zh_CHT": return `今日已讀 ${read}/${quota} · 欠債 ${debt}\n點擊直達下一片`;
            case "en_US":
            default: return `Today ${read}/${quota} · debt ${debt}\nClick for next piece`;
        }
    }

    public 欠N片(n: number) {
        switch (this.lang) {
            case "zh_CN": return `欠 ${n} 片`;
            case "zh_CHT": return `欠 ${n} 片`;
            case "en_US":
            default: return `${n} owed`;
        }
    }

    public get 每日目标() {
        switch (this.lang) {
            case "zh_CN": return "每日目标片数";
            case "zh_CHT": return "每日目標片數";
            case "en_US":
            default: return "Daily quota";
        }
    }

    public 每日目标N片(n: number) {
        switch (this.lang) {
            case "zh_CN": return `每日目标 ${n} 片`;
            case "zh_CHT": return `每日目標 ${n} 片`;
            case "en_US":
            default: return `Daily quota: ${n}`;
        }
    }

    public get 近14天阅读() {
        switch (this.lang) {
            case "zh_CN": return "近14天阅读";
            case "zh_CHT": return "近14天閱讀";
            case "en_US":
            default: return "Last 14 days";
        }
    }

    public get 开始今日阅读() {
        switch (this.lang) {
            case "zh_CN": return "开始今日阅读";
            case "zh_CHT": return "開始今日閱讀";
            case "en_US":
            default: return "Start today's reading";
        }
    }

    public get 加入第一本书() {
        switch (this.lang) {
            case "zh_CN": return "把当前文档加入渐进阅读";
            case "zh_CHT": return "把當前文檔加入漸進閱讀";
            case "en_US":
            default: return "Add current doc as first book";
        }
    }

    public get 管理书目() {
        switch (this.lang) {
            case "zh_CN": return "管理书目";
            case "zh_CHT": return "管理書目";
            case "en_US":
            default: return "Manage books";
        }
    }

    public get 已读完() {
        switch (this.lang) {
            case "zh_CN": return "已读完";
            case "zh_CHT": return "已讀完";
            case "en_US":
            default: return "Finished";
        }
    }

    public 共N本书(n: number) {
        switch (this.lang) {
            case "zh_CN": return `${n} 本书`;
            case "zh_CHT": return `${n} 本書`;
            case "en_US":
            default: return `${n} ${n === 1 ? "book" : "books"}`;
        }
    }

    public get 书架空空() {
        switch (this.lang) {
            case "zh_CN": return "书架空空，从一本书开始吧";
            case "zh_CHT": return "書架空空，從一本書開始吧";
            case "en_US":
            default: return "Empty shelf — start with a book";
        }
    }

    public get 书架空空说明() {
        switch (this.lang) {
            case "zh_CN": return "把长书切成分片，每日滚筒轮转，读完即删";
            case "zh_CHT": return "把長書切成分片，每日滾筒輪轉，讀完即刪";
            case "en_US":
            default: return "Slice a long book, rotate daily, delete as read";
        }
    }

    public get 加载中() {
        switch (this.lang) {
            case "zh_CN": return "加载中…";
            case "zh_CHT": return "載入中…";
            case "en_US":
            default: return "Loading…";
        }
    }

    public get 导流仿写已装() {
        switch (this.lang) {
            case "zh_CN": return "仿写练习（recite）";
            case "zh_CHT": return "仿寫練習（recite）";
            case "en_US":
            default: return "Recite practice";
        }
    }

    public get 导流仿写未装() {
        switch (this.lang) {
            case "zh_CN": return "仿写插件（recite）未安装";
            case "zh_CHT": return "仿寫插件（recite）未安裝";
            case "en_US":
            default: return "Recite plugin not installed";
        }
    }

    // ===== v5 □8 皮肤系统（2026-08-26，QQ 秀三维正交 + 参数微调） =====

    // 皮肤/形态/材质雅名：zh 为键（theme.ts 注册表 zhName），繁化/英译查表兜底原值。
    // 专有雅名不进六语种全翻（i18n 兜底哲学：非英语互混才是 bug，英语兜底可接受）
    private static readonly SKIN_ZH_CHT: Record<string, string> = {
        "青瓷黛蓝": "青瓷黛藍", "琉璃琥珀": "琉璃琥珀", "松烟黛紫": "松煙黛紫",
        "绯樱落霞": "緋櫻落霞", "苍山雾雪": "蒼山霧雪", "墨玉轻雾": "墨玉輕霧",
        "经典泪滴": "經典淚滴", "鹅毛笔羽焰": "鵝毛筆羽焰", "纸灯笼焰": "紙燈籠焰",
        "双芯双焰": "雙芯雙焰", "破浪焰": "破浪焰",
        "素面": "素面", "毛玻璃": "毛玻璃", "宣纸": "宣紙",
    };
    private static readonly SKIN_EN: Record<string, string> = {
        "青瓷黛蓝": "Celadon Azure", "琉璃琥珀": "Glass Amber", "松烟黛紫": "Pine-Smoke Plum",
        "绯樱落霞": "Sakura Sunset", "苍山雾雪": "Misty Mountains", "墨玉轻雾": "Ink Jade Mist",
        "经典泪滴": "Classic Teardrop", "鹅毛笔羽焰": "Quill Plume", "纸灯笼焰": "Paper Lantern",
        "双芯双焰": "Twin Flames", "破浪焰": "Breaking Wave",
        "素面": "Surface", "毛玻璃": "Frosted Glass", "宣纸": "Rice Paper",
    };

    public 皮肤名(zh: string) {
        switch (this.lang) {
            case "zh_CN": return zh;
            case "zh_CHT": return TomatoI18n.SKIN_ZH_CHT[zh] ?? zh;
            default: return TomatoI18n.SKIN_EN[zh] ?? zh;
        }
    }

    public get 皮肤外观() {
        switch (this.lang) {
            case "zh_CN": return "皮肤外观";
            case "zh_CHT": return "皮膚外觀";
            case "en_US":
            default: return "Appearance";
        }
    }

    public get 功能全免费说明() {
        switch (this.lang) {
            case "zh_CN": return "功能全部免费；Pro 一个价解锁整个皮肤系统（三维混搭、参数微调与未来新皮）";
            case "zh_CHT": return "功能全部免費；Pro 一個價解鎖整個皮膚系統（三維混搭、參數微調與未來新皮）";
            case "en_US":
            default: "All features free; Pro unlocks the whole skin system (3D mix, fine-tuning & future skins)";
        }
    }

    public get 配色主题() {
        switch (this.lang) {
            case "zh_CN": return "配色主题";
            case "zh_CHT": return "配色主題";
            case "en_US":
            default: return "Color theme";
        }
    }

    public get 火苗形态() {
        switch (this.lang) {
            case "zh_CN": return "火苗形态";
            case "zh_CHT": return "火苗形態";
            case "en_US":
            default: return "Flame shape";
        }
    }

    public get 容器材质() {
        switch (this.lang) {
            case "zh_CN": return "容器材质";
            case "zh_CHT": return "容器材質";
            case "en_US":
            default: return "Panel material";
        }
    }

    public get 参数微调() {
        switch (this.lang) {
            case "zh_CN": return "参数微调（基于选中配色）";
            case "zh_CHT": return "參數微調（基於選中配色）";
            case "en_US":
            default: return "Fine-tune (on selected theme)";
        }
    }

    public get 色相() {
        switch (this.lang) {
            case "zh_CN": return "色相";
            case "zh_CHT": return "色相";
            case "en_US":
            default: return "Hue";
        }
    }

    public get 亮度() {
        switch (this.lang) {
            case "zh_CN": return "亮度";
            case "zh_CHT": return "亮度";
            case "en_US":
            default: return "Brightness";
        }
    }

    // ===== 渐进 □2 设置选择化：新页签下拉选项 + 笔记本选择器（存量值 0-6 原样兼容） =====
    public get 打开方式不打开() {
        switch (this.lang) {
            case "zh_CN": return "不打开";
            case "zh_CHT": return "不開啟";
            case "en_US":
            default: return "Do not open";
        }
    }
    public get 打开方式前台页签() {
        switch (this.lang) {
            case "zh_CN": return "前台页签";
            case "zh_CHT": return "前台頁籤";
            case "en_US":
            default: return "Foreground tab";
        }
    }
    public get 打开方式后台页签() {
        switch (this.lang) {
            case "zh_CN": return "后台页签";
            case "zh_CHT": return "後台頁籤";
            case "en_US":
            default: return "Background tab";
        }
    }
    public get 打开方式右侧分屏() {
        switch (this.lang) {
            case "zh_CN": return "右侧分屏";
            case "zh_CHT": return "右側分割";
            case "en_US":
            default: return "Split right";
        }
    }
    public get 打开方式底部分屏() {
        switch (this.lang) {
            case "zh_CN": return "底部分屏";
            case "zh_CHT": return "底部分割";
            case "en_US":
            default: return "Split bottom";
        }
    }
    public get 打开方式独立窗口() {
        switch (this.lang) {
            case "zh_CN": return "独立窗口";
            case "zh_CHT": return "獨立視窗";
            case "en_US":
            default: return "Separate window";
        }
    }
    public get 打开方式瞄一眼自动返回() {
        switch (this.lang) {
            case "zh_CN": return "瞄一眼（1.5 秒后自动返回原文）";
            case "zh_CHT": return "瞄一眼（1.5 秒後自動返回原文）";
            case "en_US":
            default: return "Peek (auto-return in 1.5s)";
        }
    }
    public get 未设置跟随当前文档() {
        switch (this.lang) {
            case "zh_CN": return "未设置（跟随当前文档）";
            case "zh_CHT": return "未設定（跟隨當前文檔）";
            case "en_US":
            default: return "Not set (follow current document)";
        }
    }
    public get 已失效请重新选择() {
        switch (this.lang) {
            case "zh_CN": return "已失效（请重新选择）";
            case "zh_CHT": return "已失效（請重新選擇）";
            case "en_US":
            default: return "invalid — re-pick";
        }
    }

    public get 自定义名称() {
        switch (this.lang) {
            case "zh_CN": return "自定义名称（显示在主题卡上）";
            case "zh_CHT": return "自定義名稱（顯示在主題卡上）";
            case "en_US":
            default: return "Custom name (shown on theme card)";
        }
    }

    public get 重置微调() {
        switch (this.lang) {
            case "zh_CN": return "重置";
            case "zh_CHT": return "重置";
            case "en_US":
            default: return "Reset";
        }
    }

    public get 皮肤Pro提示() {
        switch (this.lang) {
            case "zh_CN": return "Pro 皮肤需激活解锁（功能不受影响）";
            case "zh_CHT": return "Pro 皮膚需啟用解鎖（功能不受影響）";
            case "en_US":
            default: return "Pro skin requires activation (features unaffected)";
        }
    }

    public get 微调Pro提示() {
        switch (this.lang) {
            case "zh_CN": return "参数微调是 Pro 功能";
            case "zh_CHT": return "參數微調是 Pro 功能";
            case "en_US":
            default: return "Fine-tuning is a Pro feature";
        }
    }

    // ===== □14 收费门恢复（2026-08-30）：断句整体 Pro + 生词 AI（收录免费，AI 拦+引导） =====
    public get 断句Pro提示() {
        switch (this.lang) {
            case "zh_CN": return "断句是 Pro 功能（段落/任务/列表三档），不断句免费；激活后可用";
            case "zh_CHT": return "斷句是 Pro 功能（段落/任務/列表三檔），不斷句免費；啟用後可用";
            case "es_ES": return "La segmentación de frases es una función Pro (párrafo/tarea/lista); sin segmentación es gratis; disponible tras activar";
            case "fr_FR": return "La découpe en phrases est une fonction Pro (paragraphe/tâche/liste) ; sans découpe c'est gratuit ; disponible après activation";
            case "ja_JP": return "文分割は Pro 機能です（段落/タスク/リスト）。分割なしは無料、有効化後に利用できます";
            case "en_US":
            default: return "Sentence splitting is a Pro feature (paragraph/task/list); no-split stays free; unlock by activating";
        }
    }

    public get 生词AIPro提示() {
        switch (this.lang) {
            case "zh_CN": return "生词 AI 翻译/造句是 Pro 功能，生词收录免费";
            case "zh_CHT": return "生詞 AI 翻譯/造句是 Pro 功能，生詞收錄免費";
            case "es_ES": return "La traducción/ejemplos con IA de palabras es Pro; recopilar palabras es gratis";
            case "fr_FR": return "La traduction/exemples IA des mots est Pro ; collecter des mots est gratuit";
            case "ja_JP": return "単語の AI 翻訳・例文は Pro 機能です。単語の収録は無料";
            case "en_US":
            default: return "Word AI translation/examples is a Pro feature; collecting words is free";
        }
    }

    // ===== 加书弹窗视觉翻新（渐进 □10，2026-08-30）新增键，方案=docs/prog-config-ui-revamp.md =====
    public get 文档统计() {
        switch (this.lang) {
            case "zh_CN": return "文档统计";
            case "zh_CHT": return "文檔統計";
            case "es_ES": return "Estadísticas del documento";
            case "fr_FR": return "Statistiques du document";
            case "ja_JP": return "文書の統計";
            case "en_US":
            default: return "Document stats";
        }
    }
    public get 切分设置() {
        switch (this.lang) {
            case "zh_CN": return "切分设置";
            case "zh_CHT": return "切分設置";
            case "es_ES": return "Ajustes de división";
            case "fr_FR": return "Réglages de découpage";
            case "ja_JP": return "分割設定";
            case "en_US":
            default: return "Split settings";
        }
    }
    public get 分片选项() {
        switch (this.lang) {
            case "zh_CN": return "分片选项";
            case "zh_CHT": return "分片選項";
            case "es_ES": return "Opciones de fragmentos";
            case "fr_FR": return "Options des fragments";
            case "ja_JP": return "断片オプション";
            case "en_US":
            default: return "Fragment options";
        }
    }
    public get 标题级别() {
        switch (this.lang) {
            case "zh_CN": return "标题级别";
            case "zh_CHT": return "標題級別";
            case "es_ES": return "Niveles de título";
            case "fr_FR": return "Niveaux de titres";
            case "ja_JP": return "見出しレベル";
            case "en_US":
            default: return "Heading levels";
        }
    }
    public get 每片字数() {
        switch (this.lang) {
            case "zh_CN": return "每片字数";
            case "zh_CHT": return "每片字數";
            case "es_ES": return "Palabras por fragmento";
            case "fr_FR": return "Mots par fragment";
            case "ja_JP": return "断片あたりの文字数";
            case "en_US":
            default: return "Words per piece";
        }
    }
    public get 为0时不拆分() {
        switch (this.lang) {
            case "zh_CN": return "为 0 时不拆分";
            case "zh_CHT": return "為 0 時不拆分";
            case "es_ES": return "0 significa no dividir por longitud";
            case "fr_FR": return "0 = pas de division par longueur";
            case "ja_JP": return "0 は長さで分割しない";
            case "en_US":
            default: return "0 = no split by length";
        }
    }
    public get 断句方式() {
        switch (this.lang) {
            case "zh_CN": return "断句方式";
            case "zh_CHT": return "斷句方式";
            case "es_ES": return "División de oraciones";
            case "fr_FR": return "Découpage des phrases";
            case "ja_JP": return "文の区切り方";
            case "en_US":
            default: return "Sentence splitting";
        }
    }
    public get 平均每标题块数() {
        switch (this.lang) {
            case "zh_CN": return "平均每标题块数";
            case "zh_CHT": return "平均每標題塊數";
            case "es_ES": return "Bloques por título";
            case "fr_FR": return "Blocs par titre";
            case "ja_JP": return "見出しあたりのブロック数";
            case "en_US":
            default: return "Blocks per heading";
        }
    }
    public get 平均每块字数() {
        switch (this.lang) {
            case "zh_CN": return "平均每块字数";
            case "zh_CHT": return "平均每塊字數";
            case "es_ES": return "Palabras por bloque";
            case "fr_FR": return "Mots par bloc";
            case "ja_JP": return "ブロックあたりの文字数";
            case "en_US":
            default: return "Words per block";
        }
    }
    public get 平均每块文本长度() {
        switch (this.lang) {
            case "zh_CN": return "平均每块文本长度";
            case "zh_CHT": return "平均每塊文本長度";
            case "es_ES": return "Longitud de texto por bloque";
            case "fr_FR": return "Longueur de texte par bloc";
            case "ja_JP": return "ブロックあたりのテキスト長";
            case "en_US":
            default: return "Text length per block";
        }
    }

    // ===== v5 □9 收尾 i18n（2026-08-27，Dock 档位胶囊 + 数据管理区 + 书卡未分片） =====

    public 档位标签(q: number) {
        switch (this.lang) {
            case "zh_CN": return q <= 1 ? "轻" : q >= 5 ? "冲" : "常";
            case "zh_CHT": return q <= 1 ? "輕" : q >= 5 ? "衝" : "常";
            case "en_US":
            default: return q <= 1 ? "Light" : q >= 5 ? "Burst" : "Steady";
        }
    }

    public get 未分片() {
        switch (this.lang) {
            case "zh_CN": return "未分片";
            case "zh_CHT": return "未分片";
            case "en_US":
            default: return "No pieces";
        }
    }

    public get 数据管理() {
        switch (this.lang) {
            case "zh_CN": return "数据管理";
            case "zh_CHT": return "數據管理";
            case "en_US":
            default: return "Data management";
        }
    }

    public get 归拢老数据() {
        switch (this.lang) {
            case "zh_CN": return "归拢老数据";
            case "zh_CHT": return "歸攏老數據";
            case "en_US":
            default: return "Consolidate legacy data";
        }
    }

    public get progData未创建说明() {
        switch (this.lang) {
            case "zh_CN": return "未创建（首次产生摘抄时自动创建）";
            case "zh_CHT": return "未創建（首次產生摘抄時自動創建）";
            case "en_US":
            default: return "Not created yet (auto-created on first excerpt)";
        }
    }

    public get progData已创建索引中() {
        switch (this.lang) {
            case "zh_CN": return "已创建（位置索引建立中）";
            case "zh_CHT": return "已創建（位置索引建立中）";
            case "en_US":
            default: return "Created (index pending)";
        }
    }

    public get 归拢中() {
        switch (this.lang) {
            case "zh_CN": return "归拢中…";
            case "zh_CHT": return "歸攏中…";
            case "en_US":
            default: return "Consolidating…";
        }
    }

    public get 找不到可用笔记本() {
        switch (this.lang) {
            case "zh_CN": return "找不到可用笔记本";
            case "zh_CHT": return "找不到可用筆記本";
            case "en_US":
            default: return "No available notebook";
        }
    }

    public 归拢结果(moved: number, failed: number, cleaned: number, skipped: number) {
        switch (this.lang) {
            case "zh_CN":
            case "zh_CHT":
                return `归拢 ${moved} 个摘抄夹` +
                    (failed ? `（失败 ${failed}）` : "") +
                    `，清理空分片夹 ${cleaned} 个` +
                    (skipped ? `，日记摘抄 ${skipped} 篇未动` : "");
            case "en_US":
            default:
                return `Consolidated ${moved} excerpt folders` +
                    (failed ? ` (${failed} failed)` : "") +
                    `, cleaned ${cleaned} empty piece dirs` +
                    (skipped ? `, ${skipped} diary excerpts untouched` : "");
        }
    }

    // ===== 书籍状态判定链（2026-08-28，死书/闭笔记本兜底 + 管理页重设计） =====

    public 本书还未分片(name: string) {
        switch (this.lang) {
            case "zh_CN": return `《${name}》还未分片`;
            case "zh_CHT": return `《${name}》還未分片`;
            case "en_US":
            default: return `"${name}" has no pieces yet`;
        }
    }

    public 本书还未分片立即重新分片吗(name: string) {
        switch (this.lang) {
            case "zh_CN": return `《${name}》还未分片，立即重新分片吗？`;
            case "zh_CHT": return `《${name}》還未分片，立即重新分片嗎？`;
            case "en_US":
            default: return `"${name}" has no pieces yet. Re-split now?`;
        }
    }

    public 书在已关闭的笔记本中(name: string) {
        switch (this.lang) {
            case "zh_CN": return `《${name}》在已关闭的笔记本中，打开笔记本后可继续阅读`;
            case "zh_CHT": return `《${name}》在已關閉的筆記本中，打開筆記本後可繼續閱讀`;
            case "en_US":
            default: return `"${name}" is in a closed notebook; reopen it to continue reading`;
        }
    }

    public 书原文档已不存在(name: string, fsUnavailable: boolean) {
        switch (this.lang) {
            case "zh_CN": return fsUnavailable
                ? `《${name}》的原文档找不到（也可能在已关闭的笔记本中）`
                : `《${name}》的原文档已不存在`;
            case "zh_CHT": return fsUnavailable
                ? `《${name}》的原文檔找不到（也可能在已關閉的筆記本中）`
                : `《${name}》的原文檔已不存在`;
            case "en_US":
            default: return fsUnavailable
                ? `"${name}" not found (it may be in a closed notebook)`
                : `"${name}" no longer exists`;
        }
    }

    public 清理该书渐进记录确认(name: string) {
        switch (this.lang) {
            case "zh_CN": return `清理《${name}》的渐进阅读记录？\n只删除记录与分片索引，不影响摘抄、心得、单词等沉淀物，也不删除任何文档。`;
            case "zh_CHT": return `清理《${name}》的漸進閱讀記錄？\n只刪除記錄與分片索引，不影響摘抄、心得、單詞等沉澱物，也不刪除任何文檔。`;
            case "en_US":
            default: return `Remove progressive-reading records of "${name}"?\nOnly the record and piece index are removed; excerpts, notes and vocabulary are untouched, and no document is deleted.`;
        }
    }

    public get 已清理该书记录() {
        switch (this.lang) {
            case "zh_CN": return "已清理该书记录";
            case "zh_CHT": return "已清理該書記錄";
            case "en_US":
            default: return "Records removed";
        }
    }

    public get 笔记本已关闭() {
        switch (this.lang) {
            case "zh_CN": return "笔记本已关闭";
            case "zh_CHT": return "筆記本已關閉";
            case "en_US":
            default: return "Notebook closed";
        }
    }

    public get 打开笔记本后自动恢复阅读() {
        switch (this.lang) {
            case "zh_CN": return "打开笔记本后自动恢复阅读";
            case "zh_CHT": return "打開筆記本後自動恢復閱讀";
            case "en_US":
            default: return "Reading resumes once the notebook is reopened";
        }
    }

    public get 疑似失效() {
        switch (this.lang) {
            case "zh_CN": return "疑似失效";
            case "zh_CHT": return "疑似失效";
            case "en_US":
            default: return "Missing";
        }
    }

    public get 文档已不存在可能已删除或移动() {
        switch (this.lang) {
            case "zh_CN": return "文档已不存在（可能已删除或移动）";
            case "zh_CHT": return "文檔已不存在（可能已刪除或移動）";
            case "en_US":
            default: return "Document not found (deleted or moved)";
        }
    }

    public get 清理记录() {
        switch (this.lang) {
            case "zh_CN": return "清理记录";
            case "zh_CHT": return "清理記錄";
            case "en_US":
            default: return "Remove records";
        }
    }

    public get 分片设置() {
        switch (this.lang) {
            case "zh_CN": return "分片设置";
            case "zh_CHT": return "分片設置";
            case "en_US":
            default: return "Piece settings";
        }
    }

    public get 未分片请先分片后再阅读() {
        switch (this.lang) {
            case "zh_CN": return "未分片——请先分片后再阅读";
            case "zh_CHT": return "未分片——請先分片後再閱讀";
            case "en_US":
            default: return "No pieces yet — split before reading";
        }
    }

    // □11 三行制 tooltip 用法句（docs/prog-floatbar-ux-redesign.md □11.3 清单 2026-08-29，vision-glm 产出）：
    // 42 个 tip 前缀 getter 只供 tooltip 第二行；按钮名复用 □10 短标签与既有长文案 getter。三语种，default 落 en。
    public get tip摘抄() {
        switch (this.lang) {
            case "zh_CN": return "展开子排选去向：摘选中块，或光标所在块";
            case "zh_CHT": return "展開子排選去向：摘選中塊，或游標所在塊";
            case "en_US":
            default: return "Open the destination row: digests selected blocks, or the cursor block";
        }
    }

    public get tip本书附属卡() {
        switch (this.lang) {
            case "zh_CN": return "打开本书附属闪卡复习，胶囊为今日到期数";
            case "zh_CHT": return "打開本書附屬閃卡複習，膠囊為今日到期數";
            case "en_US":
            default: return "Review this book's flashcards; badge counts those due today";
        }
    }

    public get tip换书() {
        switch (this.lang) {
            case "zh_CN": return "这本先放着：滚筒轮转，打开下一本书";
            case "zh_CHT": return "這本先放著：滾筒輪轉，打開下一本書";
            case "en_US":
            default: return "Set this book aside; rotation moves on and opens the next";
        }
    }

    public get tip下片删() {
        switch (this.lang) {
            case "zh_CN": return "读完当前片：删除它，打开本书下一分片";
            case "zh_CHT": return "讀完當前片：刪除它，打開本書下一分片";
            case "en_US":
            default: return "Delete this fragment and open the next";
        }
    }

    public get tip回看() {
        switch (this.lang) {
            case "zh_CN": return "跳到上一个分片，不删除任何片";
            case "zh_CHT": return "跳到上一個分片，不刪除任何片";
            case "en_US":
            default: return "Go back to the previous fragment; nothing is deleted";
        }
    }

    public get tip打开原书() {
        switch (this.lang) {
            case "zh_CN": return "打开当前分片所属的原书文档";
            case "zh_CHT": return "打開當前分片所屬的原書文檔";
            case "en_US":
            default: return "Open the book document this fragment belongs to";
        }
    }

    public get tip下一个分片() {
        switch (this.lang) {
            case "zh_CN": return "打开下一分片，当前片保留不删";
            case "zh_CHT": return "打開下一分片，當前片保留不刪";
            case "en_US":
            default: return "Open the next fragment; this one is kept";
        }
    }

    public get tip上片删() {
        switch (this.lang) {
            case "zh_CN": return "删除当前分片，跳回上一个分片";
            case "zh_CHT": return "刪除當前分片，跳回上一個分片";
            case "en_US":
            default: return "Delete this fragment and jump back to the previous";
        }
    }

    public get tip关闭分片() {
        switch (this.lang) {
            case "zh_CN": return "退出分片阅读并收起浮条，分片保留";
            case "zh_CHT": return "退出分片閱讀並收起浮條，分片保留";
            case "en_US":
            default: return "Exit fragment reading and hide the bar; the fragment stays";
        }
    }

    public get tip继续读() {
        switch (this.lang) {
            case "zh_CN": return "从上次断点接着读：打开本书下一分片";
            case "zh_CHT": return "從上次斷點接著讀：打開本書下一分片";
            case "en_US":
            default: return "Resume at your last breakpoint and open the next fragment";
        }
    }

    public get tip摘抄汇总() {
        switch (this.lang) {
            case "zh_CN": return "打开本书所有摘抄的汇总文档";
            case "zh_CHT": return "打開本書所有摘抄的彙總文檔";
            case "en_US":
            default: return "Open the document gathering all digests of this book";
        }
    }

    public get tip归档本书() {
        switch (this.lang) {
            case "zh_CN": return "本书移入归档、退出今日轮转，会先弹确认";
            case "zh_CHT": return "本書移入歸檔、退出今日輪轉，會先彈確認";
            case "en_US":
            default: return "Archives this book and skips it in rotation, after confirming";
        }
    }

    public get tip送进仿写() {
        switch (this.lang) {
            case "zh_CN": return "把这篇摘抄送进仿写练习插件练仿写";
            case "zh_CHT": return "把這篇摘抄送進仿寫練習插件練仿寫";
            case "en_US":
            default: return "Send this digest to the Recite plugin for imitation practice";
        }
    }

    public get tip回原书() {
        switch (this.lang) {
            case "zh_CN": return "定位到这条摘抄的原文位置并打开";
            case "zh_CHT": return "定位到這條摘抄的原文位置並打開";
            case "en_US":
            default: return "Jump to and open the source text of this digest";
        }
    }

    public get tip打开目录() {
        switch (this.lang) {
            case "zh_CN": return "打开本书分片目录树，可跳到任意分片";
            case "zh_CHT": return "打開本書分片目錄樹，可跳到任意分片";
            case "en_US":
            default: return "Open the fragment tree and jump to any fragment";
        }
    }

    public get tip重插() {
        switch (this.lang) {
            case "zh_CN": return "把原文重新插入一遍，恢复工作台初始内容";
            case "zh_CHT": return "把原文重新插入一遍，恢復工作台初始內容";
            case "en_US":
            default: return "Reinsert the original text to reset the workspace";
        }
    }

    public get tip删原文() {
        switch (this.lang) {
            case "zh_CN": return "删除片内所有原文块，只留自己写的笔记";
            case "zh_CHT": return "刪除片內所有原文塊，只留自己寫的筆記";
            case "en_US":
            default: return "Delete all original blocks, keeping only your notes";
        }
    }

    public get tip删片退出() {
        switch (this.lang) {
            case "zh_CN": return "删除当前分片并退出分片阅读";
            case "zh_CHT": return "刪除當前分片並退出分片閱讀";
            case "en_US":
            default: return "Delete this fragment and exit fragment reading";
        }
    }

    public get tip不再推送() {
        switch (this.lang) {
            case "zh_CN": return "本书不再出片，可在左 Dock 管理书目恢复";
            case "zh_CHT": return "本書不再出片，可在左 Dock 管理書目恢復";
            case "en_US":
            default: return "Mute this book for today; restore it in the left Dock";
        }
    }

    public get tip制卡() {
        switch (this.lang) {
            case "zh_CN": return "选中块制卡；未选中用光标块，拖蓝文字做填空";
            case "zh_CHT": return "選中塊製卡；未選中用游標塊，拖藍文字做填空";
            case "en_US":
            default: return "Card selected blocks, or the cursor block; a text selection becomes a cloze";
        }
    }

    public get tip原地制卡() {
        switch (this.lang) {
            case "zh_CN": return "在选中块（或光标块）后方就地插入闪卡";
            case "zh_CHT": return "在選中塊（或游標塊）後方就地插入閃卡";
            case "en_US":
            default: return "Insert a card in place right after the selected or cursor block";
        }
    }

    public get tip制日卡() {
        switch (this.lang) {
            case "zh_CN": return "选中/光标块制卡，存入 Daily Card 文件夹";
            case "zh_CHT": return "選中/游標塊製卡，存入 Daily Card 資料夾";
            case "en_US":
            default: return "Card selected/cursor blocks and file them in the Daily Card folder";
        }
    }

    public get tip制日卡无引() {
        switch (this.lang) {
            case "zh_CN": return "同制日卡，但卡面不带原文引用";
            case "zh_CHT": return "同製日卡，但卡面不帶原文引用";
            case "en_US":
            default: return "Like Daily card, but the card omits the source reference";
        }
    }

    public get tip多行() {
        switch (this.lang) {
            case "zh_CN": return "选中块批量挖空（可再点取消）；拖蓝时只挖选中文字";
            case "zh_CHT": return "選中塊批量挖空（可再點取消）；拖藍時只挖選中文字";
            case "en_US":
            default: return "Cloze selected blocks in bulk (toggle); a text selection clozes only itself";
        }
    }

    public get tip收集() {
        switch (this.lang) {
            case "zh_CN": return "把选中块复制进本书 summary-* 收集文件";
            case "zh_CHT": return "把選中塊複製進本書 summary-* 收集文件";
            case "en_US":
            default: return "Copy selected blocks into this book's summary file";
        }
    }

    public get tip移上一片() {
        switch (this.lang) {
            case "zh_CN": return "把选中块移到上一分片";
            case "zh_CHT": return "把選中塊移到上一分片";
            case "en_US":
            default: return "Move the selected blocks to the previous fragment";
        }
    }

    public get tip移下一片() {
        switch (this.lang) {
            case "zh_CN": return "把选中块移到下一分片";
            case "zh_CHT": return "把選中塊移到下一分片";
            case "en_US":
            default: return "Move the selected blocks to the next fragment";
        }
    }

    public get tip提取全部() {
        switch (this.lang) {
            case "zh_CN": return "把所有分片里的笔记提取到 keys- 文档";
            case "zh_CHT": return "把所有分片裡的筆記提取到 keys- 文檔";
            case "en_US":
            default: return "Extract notes from all fragments into the keys document";
        }
    }

    public get tip提取到底() {
        switch (this.lang) {
            case "zh_CN": return "把本片笔记聚合成一个块，放到文档底部";
            case "zh_CHT": return "把本片筆記聚合成一個塊，放到文檔底部";
            case "en_US":
            default: return "Gather this fragment's notes into one block at the bottom";
        }
    }

    public get tip提取笔记() {
        switch (this.lang) {
            case "zh_CN": return "把本片笔记提取到 keys- 文档";
            case "zh_CHT": return "把本片筆記提取到 keys- 文檔";
            case "en_US":
            default: return "Extract this fragment's notes into the keys document";
        }
    }

    public get tip去色() {
        switch (this.lang) {
            case "zh_CN": return "去掉本片笔记的颜色标记，内容不动";
            case "zh_CHT": return "去掉本片筆記的顏色標記，內容不動";
            case "en_US":
            default: return "Remove color marks on these notes; the text stays intact";
        }
    }

    public get tip恢复颜色() {
        switch (this.lang) {
            case "zh_CN": return "恢复被「去色」去掉的笔记颜色";
            case "zh_CHT": return "恢復被「去色」去掉的筆記顏色";
            case "en_US":
            default: return "Bring back the colors removed by Uncolor";
        }
    }

    public get tip合并() {
        switch (this.lang) {
            case "zh_CN": return "把所有分片合并成一个新文档，得到你的新版书";
            case "zh_CHT": return "把所有分片合併成一個新文檔，得到你的新版書";
            case "en_US":
            default: return "Merge all fragments into a new document of your own";
        }
    }

    public get tip留档() {
        switch (this.lang) {
            case "zh_CN": return "把选中（或光标）块摘进本书 digest- 文件夹";
            case "zh_CHT": return "把選中（或游標）塊摘進本書 digest- 文件夾";
            case "en_US":
            default: return "Digest selected or cursor blocks into this book's digest folder";
        }
    }

    public get tip思考() {
        switch (this.lang) {
            case "zh_CN": return "摘下选中/光标块标为问题：3 天后重访，解决转心得";
            case "zh_CHT": return "摘下選中/游標塊標為問題：3 天後重訪，解決轉心得";
            case "en_US":
            default: return "Digest the block as a question; revisit in 3 days, resolution turns to insight";
        }
    }

    public get tip背诵() {
        switch (this.lang) {
            case "zh_CN": return "摘下选中（或光标）块并加入闪卡复习";
            case "zh_CHT": return "摘下選中（或游標）塊並加入閃卡複習";
            case "en_US":
            default: return "Digest selected or cursor blocks and add them to flashcard review";
        }
    }

    public get tip单词() {
        switch (this.lang) {
            case "zh_CN": return "把选中的单词或短语收进本书单词本";
            case "zh_CHT": return "把選中的單詞或短語收進本書單詞本";
            case "en_US":
            default: return "Add the selected word or phrase to this book's vocabulary";
        }
    }

    public get tip仿写() {
        switch (this.lang) {
            case "zh_CN": return "把当前文档送进仿写练习，开启仿写模式";
            case "zh_CHT": return "把當前文檔送進仿寫練習，開啟仿寫模式";
            case "en_US":
            default: return "Send the current document to Recite as an imitation drill";
        }
    }

    public get tip重访调度() {
        switch (this.lang) {
            case "zh_CN": return "为选中块设置或调整重访提醒的时间与频率";
            case "zh_CHT": return "為選中塊設置或調整重訪提醒的時間與頻率";
            case "en_US":
            default: return "Set or adjust revisit time and frequency for this block";
        }
    }

    public get tip整篇摘抄() {
        switch (this.lang) {
            case "zh_CN": return "把整片或整文一次摘走，无需先选中";
            case "zh_CHT": return "把整片或整文一次摘走，無需先選中";
            case "en_US":
            default: return "Digest the whole document in one go, no selection needed";
        }
    }

    public get tip多行挑选() {
        switch (this.lang) {
            case "zh_CN": return "打开多行选择面板，批量挑块摘抄";
            case "zh_CHT": return "打開多行選擇面板，批量挑塊摘抄";
            case "en_US":
            default: return "Open the line picker and digest blocks in batches";
        }
    }

    public get tip更多操作() {
        switch (this.lang) {
            case "zh_CN": return "打开完整的摘抄去向设置对话框";
            case "zh_CHT": return "打開完整的摘抄去向設置對話框";
            case "en_US":
            default: return "Open the full digest destination dialog";
        }
    }

    // ---- □11 浮条统一落地（2026-08-30）：自由态/浮层族/胶囊 ----
    public get 自由摘抄模式() {
        switch (this.lang) {
            case "zh_CN": return "自由摘抄模式：任意文档唤出浮条摘抄（⌥Z）";
            case "zh_CHT": return "自由摘抄模式：任意文檔喚出浮條摘抄（⌥Z）";
            case "en_US":
            default: return "Free digest mode: summon the float bar in any doc (⌥Z)";
        }
    }
    public get 加书() {
        switch (this.lang) {
            case "zh_CN": return "加书";
            case "zh_CHT": return "加書";
            case "en_US":
            default: return "Add book";
        }
    }
    public get tip加书() {
        switch (this.lang) {
            case "zh_CN": return "把当前文档加入渐进阅读，弹出分片设置；加完本会话内浮条变书态";
            case "zh_CHT": return "把當前文檔加入漸進閱讀，彈出分片設定；加完本會話內浮條變書態";
            case "en_US":
            default: return "Add the current doc to progressive reading via the split dialog; the bar becomes book mode afterwards";
        }
    }
    public get 路线图() {
        switch (this.lang) {
            case "zh_CN": return "路线图";
            case "zh_CHT": return "路線圖";
            case "en_US":
            default: return "Route map";
        }
    }
    public get tip路线图() {
        switch (this.lang) {
            case "zh_CN": return "查看本书全部摘抄树（支路→主干）与批注，点击跳转";
            case "zh_CHT": return "查看本書全部摘抄樹（支路→主幹）與批註，點擊跳轉";
            case "en_US":
            default: return "View the book's full digest tree (branch → trunk) and comments; click to jump";
        }
    }
    public get 路线指引() {
        switch (this.lang) {
            case "zh_CN": return "路线指引";
            case "zh_CHT": return "路線指引";
            case "en_US":
            default: return "Route guide";
        }
    }
    public get tip路线指引() {
        switch (this.lang) {
            case "zh_CN": return "你在这里——看当前文档上能做什么、能去哪";
            case "zh_CHT": return "你在這裡——看當前文檔上能做什麼、能去哪";
            case "en_US":
            default: return "You are here — see what you can do and where you can go from this doc";
        }
    }
    public get 本书摘抄() {
        switch (this.lang) {
            case "zh_CN": return "本书摘抄";
            case "zh_CHT": return "本書摘抄";
            case "en_US":
            default: return "Book digests";
        }
    }
    public get tip本书摘抄() {
        switch (this.lang) {
            case "zh_CN": return "查看本书摘抄清单与当前块所在分片，点击跳转";
            case "zh_CHT": return "查看本書摘抄清單與當前塊所在分片，點擊跳轉";
            case "en_US":
            default: return "View the book's digest list and the piece of the current block; click to jump";
        }
    }
    public get tip路径胶囊() {
        switch (this.lang) {
            case "zh_CN": return "来自：点击回原文（原文块→片→重切→书，自动降级）";
            case "zh_CHT": return "來自：點擊回原文（原文塊→片→重切→書，自動降級）";
            case "en_US":
            default: return "Came from: click to go back (source block → piece → rebuild → book, auto fallback)";
        }
    }
    public get 摘抄树() {
        switch (this.lang) {
            case "zh_CN": return "摘抄树";
            case "zh_CHT": return "摘抄樹";
            case "en_US":
            default: return "Digest tree";
        }
    }
    public get 本书批注() {
        switch (this.lang) {
            case "zh_CN": return "本书批注";
            case "zh_CHT": return "本書批註";
            case "en_US":
            default: return "Book comments";
        }
    }
    public get 本书没有大纲标题() {
        switch (this.lang) {
            case "zh_CN": return "本书没有大纲标题";
            case "zh_CHT": return "本書沒有大綱標題";
            case "en_US":
            default: return "No headings in this book";
        }
    }
    public get 当前块所在分片() {
        switch (this.lang) {
            case "zh_CN": return "当前块所在分片";
            case "zh_CHT": return "當前塊所在分片";
            case "en_US":
            default: return "Piece of the current block";
        }
    }
    public 第N片(n: number) {
        switch (this.lang) {
            case "zh_CN": return `第 ${n} 片`;
            case "zh_CHT": return `第 ${n} 片`;
            case "en_US":
            default: return `Piece ${n}`;
        }
    }
    public get 跳到该分片() {
        switch (this.lang) {
            case "zh_CN": return "跳到该分片";
            case "zh_CHT": return "跳到該分片";
            case "en_US":
            default: return "Jump to this piece";
        }
    }
    public get 移动端菜单显示开始学习() {
        switch (this.lang) {
            case "zh_CN": return "移动端菜单显示：开始学习（桌面右键项已退役——火苗/书态 ▶/🔄 三重覆盖）";
            case "zh_CHT": return "行動端選單顯示：開始學習（桌面右鍵項已退役——火苗/書態 ▶/🔄 三重覆蓋）";
            case "en_US":
            default: return "Mobile menu: Start reading (desktop context-menu item retired — flame / book ▶ / 🔄 cover it)";
        }
    }
    public get 该块不在分片索引中() {
        switch (this.lang) {
            case "zh_CN": return "该块不在分片索引中（可能是新加入的内容）";
            case "zh_CHT": return "該塊不在分片索引中（可能是新加入的內容）";
            case "en_US":
            default: return "This block is not in the piece index (may be newly added)";
        }
    }
    public get 本书摘抄清单() {
        switch (this.lang) {
            case "zh_CN": return "本书摘抄清单";
            case "zh_CHT": return "本書摘抄清單";
            case "en_US":
            default: return "Digest list";
        }
    }

    // 路线指引浮层四态文案（静态路线表，与帮助文档「使用路线图」章同源）
    public get 路线指引书() {
        switch (this.lang) {
            case "zh_CN": return "你在读一本书";
            case "zh_CHT": return "你在讀一本書";
            case "en_US":
            default: return "You are on a book";
        }
    }
    public get 路线书继续读() {
        switch (this.lang) {
            case "zh_CN": return "继续读：从断点切出下一片，进入阅读主循环";
            case "zh_CHT": return "繼續讀：從斷點切出下一片，進入閱讀主循環";
            case "en_US":
            default: return "Continue reading: cut the next piece";
        }
    }
    public get 路线书摘抄() {
        switch (this.lang) {
            case "zh_CN": return "摘抄：选中即摘，留档/思考/背诵/单词/送仿写";
            case "zh_CHT": return "摘抄：選中即摘，留檔/思考/背誦/單詞/送仿寫";
            case "en_US":
            default: return "Digest: keep / think / recite / word / send to recite";
        }
    }
    public get 路线书附属卡() {
        switch (this.lang) {
            case "zh_CN": return "附属卡：复习本书摘抄产生的闪卡";
            case "zh_CHT": return "附屬卡：複習本書摘抄產生的閃卡";
            case "en_US":
            default: return "Attached cards: review this book's flashcards";
        }
    }
    public get 路线书目录() {
        switch (this.lang) {
            case "zh_CN": return "目录：按大纲标题跳到对应分片";
            case "zh_CHT": return "目錄：按大綱標題跳到對應分片";
            case "en_US":
            default: return "Contents: jump to the piece of a heading";
        }
    }
    public get 路线书追溯() {
        switch (this.lang) {
            case "zh_CN": return "本书摘抄：清单+当前块所在分片";
            case "zh_CHT": return "本書摘抄：清單+當前塊所在分片";
            case "en_US":
            default: return "Book digests: list + the piece of the current block";
        }
    }
    public get 路线书归档() {
        switch (this.lang) {
            case "zh_CN": return "归档：读完了，退出推送、摘抄永久留存";
            case "zh_CHT": return "歸檔：讀完了，退出推送、摘抄永久留存";
            case "en_US":
            default: return "Archive: done reading — stop scheduling, digests stay";
        }
    }
    public get 路线指引片() {
        switch (this.lang) {
            case "zh_CN": return "你在一片上";
            case "zh_CHT": return "你在一片上";
            case "en_US":
            default: return "You are on a piece";
        }
    }
    public get 路线片下一片() {
        switch (this.lang) {
            case "zh_CN": return "下一片：读完删片前进（片是一次性餐具）";
            case "zh_CHT": return "下一片：讀完刪片前進（片是一次性餐具）";
            case "en_US":
            default: return "Next: read done, delete this piece and move on";
        }
    }
    public get 路线片回看() {
        switch (this.lang) {
            case "zh_CN": return "回看：回上一片，不删";
            case "zh_CHT": return "回看：回上一片，不刪";
            case "en_US":
            default: return "Back: previous piece, kept intact";
        }
    }
    public get 路线片摘抄() {
        switch (this.lang) {
            case "zh_CN": return "摘抄：选中即摘，去向同书态";
            case "zh_CHT": return "摘抄：選中即摘，去向同書態";
            case "en_US":
            default: return "Digest: same destinations as on a book";
        }
    }
    public get 路线片原书() {
        switch (this.lang) {
            case "zh_CN": return "原书：跳回原书原文处";
            case "zh_CHT": return "原書：跳回原書原文處";
            case "en_US":
            default: return "Source: jump back to the original text";
        }
    }
    public get 路线片制卡() {
        switch (this.lang) {
            case "zh_CN": return "制卡：制卡四钮，选中/光标块做闪卡";
            case "zh_CHT": return "製卡：製卡四鈕，選中/游標塊做閃卡";
            case "en_US":
            default: return "Cards: make flashcards from selected/cursor blocks";
        }
    }
    public get 路线片收集提取() {
        switch (this.lang) {
            case "zh_CN": return "收集与提取：归拢片上笔记到新文档";
            case "zh_CHT": return "收集與提取：歸攏片上筆記到新文檔";
            case "en_US":
            default: return "Collect & extract: gather notes into new docs";
        }
    }
    public get 路线片换书() {
        switch (this.lang) {
            case "zh_CN": return "换书：滚筒跳到下一本书";
            case "zh_CHT": return "換書：滾筒跳到下一本書";
            case "en_US":
            default: return "Swap: roller jumps to the next book";
        }
    }
    public get 路线指引摘抄() {
        switch (this.lang) {
            case "zh_CN": return "你在读一篇摘抄";
            case "zh_CHT": return "你在讀一篇摘抄";
            case "en_US":
            default: return "You are on a digest";
        }
    }
    public get 路线摘抄送仿写() {
        switch (this.lang) {
            case "zh_CN": return "送仿写：把这篇摘抄送进仿写练习";
            case "zh_CHT": return "送仿寫：把這篇摘抄送進仿寫練習";
            case "en_US":
            default: return "Recite: send this digest to recitation practice";
        }
    }
    public get 路线摘抄回原书() {
        switch (this.lang) {
            case "zh_CN": return "回原书：原文块→片→重切→书，自动降级";
            case "zh_CHT": return "回原書：原文塊→片→重切→書，自動降級";
            case "en_US":
            default: return "Back to source: block → piece → rebuild → book, auto fallback";
        }
    }
    public get 路线摘抄路线图() {
        switch (this.lang) {
            case "zh_CN": return "路线图：看全书摘抄树与批注";
            case "zh_CHT": return "路線圖：看全書摘抄樹與批註";
            case "en_US":
            default: return "Route map: the book's digest tree and comments";
        }
    }
    public get 路线摘抄汇总() {
        switch (this.lang) {
            case "zh_CN": return "摘抄汇总：打开本书摘抄文件夹";
            case "zh_CHT": return "摘抄匯總：打開本書摘抄文件夾";
            case "en_US":
            default: return "Summary: open the book's digest folder";
        }
    }
    public get 路线摘抄再摘抄() {
        switch (this.lang) {
            case "zh_CN": return "再摘抄：摘抄上再摘，落札记匣";
            case "zh_CHT": return "再摘抄：摘抄上再摘，落札記匣";
            case "en_US":
            default: return "Re-digest: digest a digest, lands in the note box";
        }
    }
    public get 路线指引自由() {
        switch (this.lang) {
            case "zh_CN": return "你在任意文档上（自由摘抄）";
            case "zh_CHT": return "你在任意文檔上（自由摘抄）";
            case "en_US":
            default: return "You are on any doc (free digest)";
        }
    }
    public get 路线自由摘抄() {
        switch (this.lang) {
            case "zh_CN": return "摘抄：摘当前文档，非书文本落札记匣";
            case "zh_CHT": return "摘抄：摘當前文檔，非書文本落札記匣";
            case "en_US":
            default: return "Digest: digests of non-book text land in the note box";
        }
    }
    public get 路线自由加书() {
        switch (this.lang) {
            case "zh_CN": return "加书：把当前文档加入渐进阅读，开始分片读";
            case "zh_CHT": return "加書：把當前文檔加入漸進閱讀，開始分片讀";
            case "en_US":
            default: return "Add book: register this doc into progressive reading";
        }
    }

    // ---- 番茄钟设置面板翻新（2026-08-30 spec 2026-08-29-2259 □2）：短标签 + 帮助行 ----
    public get 番茄钟时长() {
        switch (this.lang) {
            case "zh_CN": return "番茄钟时长";
            case "zh_CHT": return "番茄鐘時長";
            case "es_ES": return "Duración del pomodoro";
            case "fr_FR": return "Durée du pomodoro";
            case "ja_JP": return "ポモドーロの長さ";
            case "en_US":
            default: return "Pomodoro duration";
        }
    }
    public get 番茄钟时长帮助() {
        switch (this.lang) {
            case "zh_CN": return "点选常用时长，或添加自定义分钟数（1~240 分钟）；最多 {max} 档，每档在状态栏占一个图标";
            case "zh_CHT": return "點選常用時長，或添加自訂分鐘數（1~240 分鐘）；最多 {max} 檔，每檔在狀態欄佔一個圖標";
            case "es_ES": return "Seleccione duraciones habituales o añada minutos personalizados (1~240 min); {max} como máximo, cada una ocupa un icono en la barra de estado";
            case "fr_FR": return "Sélectionnez des durées courantes ou ajoutez des minutes personnalisées (1~240 min) ; {max} au maximum, chacune occupe une icône dans la barre d'état";
            case "ja_JP": return "よく使う長さを選択、またはカスタムの分数を追加（1~240分）。最大 {max} 個で、各長さがステータスバーのアイコンを1つ占めます";
            case "en_US":
            default: return "Pick common durations or add custom minutes (1~240 min); up to {max}, each occupies a status bar icon";
        }
    }
    public get 自动循环帮助() {
        switch (this.lang) {
            case "zh_CN": return "工作结束自动进入休息，休息结束回到工作";
            case "zh_CHT": return "工作結束自動進入休息，休息結束回到工作";
            case "es_ES": return "Pasa al descanso automáticamente al terminar el trabajo y vuelve al trabajo al terminar el descanso";
            case "fr_FR": return "Passe automatiquement en pause à la fin du travail et revient au travail à la fin de la pause";
            case "ja_JP": return "作業終了後に自動的に休憩へ移り、休憩終了後に作業へ戻ります";
            case "en_US":
            default: return "Switch to break automatically when work ends, and back to work when break ends";
        }
    }
    public get 随机视频帮助() {
        switch (this.lang) {
            case "zh_CN": return "填思源文档名（不带路径与后缀），到点时从该文档及子文档中随机挑一个视频播放";
            case "zh_CHT": return "填思源文檔名（不帶路徑與後綴），到點時從該文檔及子文檔中隨機挑一個視頻播放";
            case "es_ES": return "Introduzca el nombre de un documento de SiYuan (sin ruta ni extensión); al terminar, se reproducirá un vídeo elegido al azar de ese documento y sus subdocumentos";
            case "fr_FR": return "Saisissez le nom d'un document SiYuan (sans chemin ni extension) ; à la fin, une vidéo sera choisie au hasard parmi ce document et ses sous-documents";
            case "ja_JP": return "思源のドキュメント名（パスと拡張子は不要）を入力。時間になると、そのドキュメントとサブドキュメントから動画を1本ランダムに再生します";
            case "en_US":
            default: return "Enter a SiYuan document name (no path or extension); when time is up, a video is picked at random from that document and its sub-documents";
        }
    }
    public get 明亮模式背景() {
        switch (this.lang) {
            case "zh_CN": return "明亮模式背景";
            case "zh_CHT": return "明亮模式背景";
            case "es_ES": return "Fondo en modo claro";
            case "fr_FR": return "Arrière-plan en mode clair";
            case "ja_JP": return "ライトモードの背景";
            case "en_US":
            default: return "Light mode background";
        }
    }
    public get 明亮模式背景帮助() {
        switch (this.lang) {
            case "zh_CN": return "计时中显示的背景图（浅色主题用）；可用「选择文件」把本地图片存进思源 assets，或直接填 http(s) 链接/站内路径";
            case "zh_CHT": return "計時中顯示的背景圖（淺色主題用）；可用「選擇檔案」把本機圖片存進思源 assets，或直接填 http(s) 連結/站內路徑";
            case "es_ES": return "Imagen de fondo durante la temporización (tema claro); use «Elegir archivo» para guardar una imagen local en assets de SiYuan, o introduzca un enlace http(s) o una ruta interna";
            case "fr_FR": return "Image d'arrière-plan pendant le chronomètre (thème clair) ; utilisez « Choisir un fichier » pour enregistrer une image locale dans les assets de SiYuan, ou saisissez un lien http(s) ou un chemin interne";
            case "ja_JP": return "計時中に表示する背景画像（ライトテーマ用）。「ファイルを選択」でローカル画像を思源の assets に保存するか、http(s) リンクまたは内部パスを直接入力できます";
            case "en_US":
            default: return "Background image shown while timing (for the light theme); use \"Choose file\" to store a local image into SiYuan assets, or enter an http(s) link or an in-app path";
        }
    }
    public get 黑暗模式背景() {
        switch (this.lang) {
            case "zh_CN": return "黑暗模式背景";
            case "zh_CHT": return "黑暗模式背景";
            case "es_ES": return "Fondo en modo oscuro";
            case "fr_FR": return "Arrière-plan en mode sombre";
            case "ja_JP": return "ダークモードの背景";
            case "en_US":
            default: return "Dark mode background";
        }
    }
    public get 黑暗模式背景帮助() {
        switch (this.lang) {
            case "zh_CN": return "计时中显示的背景图（深色主题用），配置方式同上";
            case "zh_CHT": return "計時中顯示的背景圖（深色主題用），設定方式同上";
            case "es_ES": return "Imagen de fondo durante la temporización (tema oscuro); se configura igual que la anterior";
            case "fr_FR": return "Image d'arrière-plan pendant le chronomètre (thème sombre) ; se configure comme la précédente";
            case "ja_JP": return "計時中に表示する背景画像（ダークテーマ用）。設定方法は上と同じ";
            case "en_US":
            default: return "Background image shown while timing (for the dark theme); configured the same way as above";
        }
    }
    public get 背景图透明度帮助() {
        switch (this.lang) {
            case "zh_CN": return "拖动滑块调整计时中背景图的浓淡，拖动时全屏实时预览；0%=全透明（相当于无背景），100%=完全不透明";
            case "zh_CHT": return "拖動滑桿調整計時中背景圖的濃淡，拖動時全螢幕即時預覽；0%=全透明（相當於無背景），100%=完全不透明";
            case "es_ES": return "Arrastre el control deslizante para ajustar la intensidad del fondo durante la temporización, con vista previa en pantalla completa en tiempo real; 0% = totalmente transparente (sin fondo), 100% = totalmente opaco";
            case "fr_FR": return "Faites glisser le curseur pour ajuster l'intensité de l'arrière-plan pendant le chronomètre, avec un aperçu plein écran en temps réel ; 0 % = totalement transparent (aucun fond), 100 % = totalement opaque";
            case "ja_JP": return "スライダーをドラッグして計時中の背景の濃さを調整します。ドラッグ中は全画面でリアルタイムにプレビューされます。0%=完全に透明（背景なし）、100%=完全不透明";
            case "en_US":
            default: return "Drag the slider to adjust the background intensity while timing, with a live full-screen preview while dragging; 0% = fully transparent (no background), 100% = fully opaque";
        }
    }
    public get 添加() {
        switch (this.lang) {
            case "zh_CN": return "添加";
            case "zh_CHT": return "添加";
            case "es_ES": return "Añadir";
            case "fr_FR": return "Ajouter";
            case "ja_JP": return "追加";
            case "en_US":
            default: return "Add";
        }
    }
    public get 自定义分钟数() {
        switch (this.lang) {
            case "zh_CN": return "自定义分钟数";
            case "zh_CHT": return "自訂分鐘數";
            case "es_ES": return "Minutos personalizados";
            case "fr_FR": return "Minutes personnalisées";
            case "ja_JP": return "カスタム分数";
            case "en_US":
            default: return "Custom minutes";
        }
    }
    // ── 提示音选择化（□3）：下拉行短标签/音色名/试听/选文件/校验/toast/帮助 ──
    public get 提示音() {
        switch (this.lang) {
            case "zh_CN": return "提示音";
            case "zh_CHT": return "提示音";
            case "es_ES": return "Sonido de aviso";
            case "fr_FR": return "Son d'alerte";
            case "ja_JP": return "通知音";
            case "en_US":
            default: return "Notice sound";
        }
    }
    public get 提示音帮助() {
        switch (this.lang) {
            case "zh_CN": return "到点时播放的声音；选「自定义」后可填 http(s) 链接，或用「选择文件」把本地音频存进思源 assets";
            case "zh_CHT": return "到點時播放的聲音；選「自訂」後可填 http(s) 連結，或用「選擇檔案」把本地音訊存進思源 assets";
            case "es_ES": return "Sonido que se reproduce al terminar; con «Personalizado» puede introducir un enlace http(s) o usar «Elegir archivo» para guardar el audio local en assets de SiYuan";
            case "fr_FR": return "Son joué à la fin du temps ; avec « Personnalisé », saisissez un lien http(s) ou utilisez « Choisir un fichier » pour enregistrer l'audio local dans les assets de SiYuan";
            case "ja_JP": return "時間になると再生される音。「カスタム」では http(s) リンクを入力するか、「ファイルを選択」でローカル音声を思源の assets に保存できます";
            case "en_US":
            default: return "Sound played when time is up; pick \"Custom\" to enter an http(s) link, or use \"Choose file\" to store a local audio into SiYuan assets";
        }
    }
    public get 提示音默认() {
        switch (this.lang) {
            case "zh_CN": return "默认（双音）";
            case "zh_CHT": return "預設（雙音）";
            case "es_ES": return "Predeterminado (doble tono)";
            case "fr_FR": return "Par défaut (double ton)";
            case "ja_JP": return "デフォルト（2 音）";
            case "en_US":
            default: return "Default (ding-dong)";
        }
    }
    public get 提示音清脆铃() {
        switch (this.lang) {
            case "zh_CN": return "清脆铃";
            case "zh_CHT": return "清脆鈴";
            case "es_ES": return "Campana nítida";
            case "fr_FR": return "Cloche claire";
            case "ja_JP": return "澄んだベル";
            case "en_US":
            default: return "Crisp bell";
        }
    }
    public get 提示音柔和钟() {
        switch (this.lang) {
            case "zh_CN": return "柔和钟声";
            case "zh_CHT": return "柔和鐘聲";
            case "es_ES": return "Campana suave";
            case "fr_FR": return "Carillon doux";
            case "ja_JP": return "柔らかい鐘";
            case "en_US":
            default: return "Soft chime";
        }
    }
    public get 提示音木鱼() {
        switch (this.lang) {
            case "zh_CN": return "木鱼双敲";
            case "zh_CHT": return "木魚雙敲";
            case "es_ES": return "Bloque de madera";
            case "fr_FR": return "Bloc de bois";
            case "ja_JP": return "木魚";
            case "en_US":
            default: return "Woodblock";
        }
    }
    public get 自定义() {
        switch (this.lang) {
            case "zh_CN": return "自定义";
            case "zh_CHT": return "自訂";
            case "es_ES": return "Personalizado";
            case "fr_FR": return "Personnalisé";
            case "ja_JP": return "カスタム";
            case "en_US":
            default: return "Custom";
        }
    }
    public get 试听() {
        switch (this.lang) {
            case "zh_CN": return "试听";
            case "zh_CHT": return "試聽";
            case "es_ES": return "Escuchar";
            case "fr_FR": return "Écouter";
            case "ja_JP": return "試聴";
            case "en_US":
            default: return "Preview";
        }
    }
    public get 选择文件() {
        switch (this.lang) {
            case "zh_CN": return "选择文件…";
            case "zh_CHT": return "選擇檔案…";
            case "es_ES": return "Elegir archivo…";
            case "fr_FR": return "Choisir un fichier…";
            case "ja_JP": return "ファイルを選択…";
            case "en_US":
            default: return "Choose file…";
        }
    }
    public get 提示音地址无效() {
        switch (this.lang) {
            case "zh_CN": return "地址需以 http(s):// 或 / 开头；本地音频请用「选择文件」上传（浏览器安全策略不允许直接引用本机路径）";
            case "zh_CHT": return "位址需以 http(s):// 或 / 開頭；本地音訊請用「選擇檔案」上傳（瀏覽器安全策略不允許直接引用本機路徑）";
            case "es_ES": return "La dirección debe empezar por http(s):// o / ; para audio local use «Elegir archivo» (la política del navegador no permite rutas locales directas)";
            case "fr_FR": return "L'adresse doit commencer par http(s):// ou / ; pour un audio local, utilisez « Choisir un fichier » (le navigateur interdit les chemins locaux directs)";
            case "ja_JP": return "アドレスは http(s):// または / で始まる必要があります。ローカル音声は「ファイルを選択」でアップロードしてください（ブラウザーのセキュリティ上、ローカルパスの直接参照は不可）";
            case "en_US":
            default: return "Address must start with http(s):// or / ; for local audio use \"Choose file\" (browser security forbids direct local paths)";
        }
    }
    public get 提示音播放失败() {
        switch (this.lang) {
            case "zh_CN": return "提示音播放失败，请检查自定义地址";
            case "zh_CHT": return "提示音播放失敗，請檢查自訂位址";
            case "es_ES": return "No se pudo reproducir el aviso; compruebe la dirección personalizada";
            case "fr_FR": return "Échec de lecture du son d'alerte ; vérifiez l'adresse personnalisée";
            case "ja_JP": return "通知音の再生に失敗しました。カスタムアドレスを確認してください";
            case "en_US":
            default: return "Failed to play the notice sound; check the custom address";
        }
    }
    public get 提示音上传失败() {
        switch (this.lang) {
            case "zh_CN": return "音频上传失败，请重试";
            case "zh_CHT": return "音訊上傳失敗，請重試";
            case "es_ES": return "No se pudo subir el audio; inténtelo de nuevo";
            case "fr_FR": return "Échec de l'envoi de l'audio ; réessayez";
            case "ja_JP": return "音声のアップロードに失敗しました。再試行してください";
            case "en_US":
            default: return "Failed to upload the audio; please retry";
        }
    }
    public get 提示音文件类型不支持() {
        switch (this.lang) {
            case "zh_CN": return "请选择音频文件（mp3、wav、ogg、m4a 等）";
            case "zh_CHT": return "請選擇音訊檔案（mp3、wav、ogg、m4a 等）";
            case "es_ES": return "Elija un archivo de audio (mp3, wav, ogg, m4a, …)";
            case "fr_FR": return "Choisissez un fichier audio (mp3, wav, ogg, m4a, …)";
            case "ja_JP": return "音声ファイルを選択してください（mp3、wav、ogg、m4a など）";
            case "en_US":
            default: return "Please choose an audio file (mp3, wav, ogg, m4a, …)";
        }
    }
    // ── 背景图自定义（□4）：空态/占位/校验/toast ──
    public get 背景未设置() {
        switch (this.lang) {
            case "zh_CN": return "未设置";
            case "zh_CHT": return "未設定";
            case "es_ES": return "No fijado";
            case "fr_FR": return "Non défini";
            case "ja_JP": return "未設定";
            case "en_US":
            default: return "Not set";
        }
    }
    public get 背景图片失效() {
        switch (this.lang) {
            case "zh_CN": return "图片失效";
            case "zh_CHT": return "圖片失效";
            case "es_ES": return "Rota";
            case "fr_FR": return "Cassée";
            case "ja_JP": return "読込失敗";
            case "en_US":
            default: return "Broken";
        }
    }
    public get 背景未设置占位() {
        switch (this.lang) {
            case "zh_CN": return "未设置，计时中无背景";
            case "zh_CHT": return "未設定，計時中無背景";
            case "es_ES": return "Sin configurar: no hay fondo durante la temporización";
            case "fr_FR": return "Non défini : aucun arrière-plan pendant le chronomètre";
            case "ja_JP": return "未設定：計時中の背景なし";
            case "en_US":
            default: return "Not set; no background while timing";
        }
    }
    public get 背景地址无效() {
        switch (this.lang) {
            case "zh_CN": return "地址需以 http(s):// 或 / 开头；本地图片请用「选择文件」上传（浏览器安全策略不允许直接引用本机路径）";
            case "zh_CHT": return "地址需以 http(s):// 或 / 開頭；本機圖片請用「選擇檔案」上傳（瀏覽器安全策略不允許直接引用本機路徑）";
            case "es_ES": return "La dirección debe empezar por http(s):// o / ; para imágenes locales use «Elegir archivo» (la política del navegador no permite rutas locales directas)";
            case "fr_FR": return "L'adresse doit commencer par http(s):// ou / ; pour une image locale, utilisez « Choisir un fichier » (le navigateur interdit les chemins locaux directs)";
            case "ja_JP": return "アドレスは http(s):// または / で始める必要があります。ローカル画像は「ファイルを選択」でアップロードしてください（ブラウザのセキュリティポリシーによりローカルパスは直接参照できません）";
            case "en_US":
            default: return "The address must start with http(s):// or / ; use \"Choose file\" to upload a local image (browser security policy blocks local paths)";
        }
    }
    public get 背景文件类型不支持() {
        switch (this.lang) {
            case "zh_CN": return "请选择图片文件（png、jpg、webp、gif 等）";
            case "zh_CHT": return "請選擇圖片檔案（png、jpg、webp、gif 等）";
            case "es_ES": return "Elija un archivo de imagen (png, jpg, webp, gif, …)";
            case "fr_FR": return "Choisissez un fichier image (png, jpg, webp, gif, …)";
            case "ja_JP": return "画像ファイルを選択してください（png、jpg、webp、gif など）";
            case "en_US":
            default: return "Please choose an image file (png, jpg, webp, gif, …)";
        }
    }
    public get 背景上传失败() {
        switch (this.lang) {
            case "zh_CN": return "图片上传失败，请重试";
            case "zh_CHT": return "圖片上傳失敗，請重試";
            case "es_ES": return "No se pudo subir la imagen; inténtelo de nuevo";
            case "fr_FR": return "Échec de l'envoi de l'image ; réessayez";
            case "ja_JP": return "画像のアップロードに失敗しました。再試行してください";
            case "en_US":
            default: return "Failed to upload the image; please retry";
        }
    }
}

// public[^get]+\(  查找所有的函数
export const tomatoI18n = new TomatoI18n();
