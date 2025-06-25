import { TomatoI18nABC12 } from "./text12";

export abstract class TomatoI18nABC11 extends TomatoI18nABC12 {
    public get 开始学习() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "开始学习";
            case "es_ES": return "Comenzar a aprender";
            case "fr_FR": return "Commencer à apprendre";
            case "ja_JP": return "学習を開始";
            case "zh_CHT": return "開始學習";
            case "it_IT": return "Inizia a imparare";
            case "de_DE": return "Lernen beginnen";
            case "he_IL": return "התחל ללמוד";
            case "ru_RU": return "Начать учиться";
            case "pl_PL": return "Zacznij się uczyć";
            case "en_US":
            default: return "Start Learning";
        }
    }
    public get 开始随机学习() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "开始随机学习";
            case "es_ES": return "Comenzar aprendizaje aleatorio";
            case "fr_FR": return "Démarrer l'apprentissage aléatoire";
            case "ja_JP": return "ランダム学習を開始";
            case "zh_CHT": return "開始隨機學習";
            case "it_IT": return "Inizia apprendimento casuale";
            case "de_DE": return "Zufälliges Lernen beginnen";
            case "he_IL": return "התחל ללמוד באופן אקראי";
            case "ru_RU": return "Начать случайное обучение";
            case "pl_PL": return "Rozpocznij losowe uczenie się";
            case "en_US":
            default: return "Start Random Learning";
        }
    }
    public get 查看所有渐进学习文档() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "查看所有渐进学习文档";
            case "es_ES": return "Ver todos los documentos de aprendizaje progresivo";
            case "fr_FR": return "Voir tous les documents d'apprentissage progressif";
            case "ja_JP": return "すべてのプログレッシブラーニングドキュメントを表示";
            case "zh_CHT": return "查看所有漸進學習文檔";
            case "it_IT": return "Visualizza tutti i documenti di apprendimento progressivo";
            case "de_DE": return "Alle Dokumente des progressiven Lernens anzeigen";
            case "he_IL": return "הצג את כל מסמכי הלמידה ההדרגתית";
            case "ru_RU": return "Просмотреть все документы прогрессивного обучения";
            case "pl_PL": return "Wyświetl wszystkie dokumenty nauki postępowej";
            case "en_US":
            default: return "View All Progressive Learning Documents";
        }
    }
    public get 添加当前文档到渐进阅读分片模式() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "添加当前文档到渐进阅读（分片模式）";
            case "es_ES": return "Agregar documento actual a lectura progresiva (modo fragmentado)";
            case "fr_FR": return "Ajouter le document actuel à la lecture progressive (mode fragmenté)";
            case "ja_JP": return "現在のドキュメントをプログレッシブラーニングに追加（フラグメントモード）";
            case "zh_CHT": return "添加當前文檔到漸進閱讀（分片模式）";
            case "it_IT": return "Aggiungi il documento corrente alla lettura progressiva (modalità frammento)";
            case "de_DE": return "Aktuelles Dokument dem progressiven Lesen hinzufügen (Fragmentmodus)";
            case "he_IL": return "הוסף את המסמך הנוכחי ללימוד ההדרגתי (מצב פיצ'רים)";
            case "ru_RU": return "Добавить текущий документ в режим прогрессивного чтения (фрагментный режим)";
            case "pl_PL": return "Dodaj bieżący dokument do czytania postępowego (tryb fragmentów)";
            case "en_US":
            default: return "Add Current Document to Progressive Reading (Fragment Mode)";
        }
    }
    public get 请选择段落块进行跳转() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "请选择文档内的段落块进行跳转，不支持大纲、超级块等复杂结构里的段落块";
            case "es_ES": return "Seleccione un bloque de párrafo dentro del documento para saltar, no se admiten bloques de párrafo en estructuras complejas como esquemas o bloques superiores";
            case "fr_FR": return "Sélectionnez un bloc de paragraphe dans le document pour effectuer un saut, les blocs de paragraphe dans des structures complexes telles que les plans ou les super blocs ne sont pas pris en charge";
            case "ja_JP": return "ドキュメント内の段落ブロックを選択してジャンプしてください。アウトラインやスーパーブロックなどの複雑な構造内の段落ブロックはサポートされていません";
            case "zh_CHT": return "請選擇文檔內的段落塊進行跳轉，不支援大綱、超級塊等複雜結構裡的段落塊";
            case "it_IT": return "Seleziona un blocco di paragrafo all'interno del documento per effettuare il salto, non sono supportati i blocchi di paragrafo nelle strutture complesse come outline o super blocchi";
            case "de_DE": return "Wählen Sie einen Absatzblock innerhalb des Dokuments für den Sprung aus, Absatzblöcke in komplexen Strukturen wie Gliederungen oder Superblöcken werden nicht unterstützt";
            case "he_IL": return "בחרו בלוק פסקה בתוך המסמך כדי לקפוץ, בלוקים של פסקאות במבנים מורכבים כמו תוכנית או סופר בלוק לא נתמכים";
            case "ru_RU": return "Выберите блок абзаца в документе для перехода, блоки абзацев в сложных структурах, таких как структура или суперблоки, не поддерживаются";
            case "pl_PL": return "Wybierz blok akapitu w dokumencie, aby przejść, nieobsługiwane są bloki akapitów w złożonych strukturach takich jak konspekt lub superbloki";
            case "en_US":
            default: return "Please select a paragraph block within the document to jump to, paragraph blocks in complex structures such as outlines or super blocks are not supported";
        }
    }
    public get topbar添加图标() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "添加topbar图标";
            case "es_ES": return "Agregar icono a la barra superior";
            case "fr_FR": return "Ajouter une icône à la barre supérieure";
            case "ja_JP": return "トップバーにアイコンを追加";
            case "zh_CHT": return "添加topbar圖標";
            case "it_IT": return "Aggiungi icona alla barra superiore";
            case "de_DE": return "Symbol zur Top-Leiste hinzufügen";
            case "he_IL": return "הוסף אייקון לטופבר";
            case "ru_RU": return "Добавить значок в верхнюю панель";
            case "pl_PL": return "Dodaj ikonę do paska górnego";
            case "en_US":
            default: return "Add Topbar Icon";
        }
    }
    public get search搜索配置() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "搜索配置";
            case "es_ES": return "Buscar configuración";
            case "fr_FR": return "Rechercher configuration";
            case "ja_JP": return "設定を検索";
            case "zh_CHT": return "搜尋配置";
            case "it_IT": return "Cerca configurazione";
            case "de_DE": return "Sucheinstellungen";
            case "he_IL": return "חפש הגדרות";
            case "ru_RU": return "Поиск настроек";
            case "pl_PL": return "Szukaj konfiguracji";
            case "en_US":
            default: return "Search Configuration";
        }
    }
    public get 复制文档为纯文本() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "复制文档为纯文本";
            case "es_ES": return "Copiar documento como texto sin formato";
            case "fr_FR": return "Copier le document en texte brut";
            case "ja_JP": return "ドキュメントをプレーンテキストとしてコピー";
            case "zh_CHT": return "複製文件為純文字";
            case "it_IT": return "Copia documento come testo normale";
            case "de_DE": return "Dokument als reinen Text kopieren";
            case "he_IL": return "העתק מסמך כטקסט רגיל";
            case "ru_RU": return "Скопировать документ как обычный текст";
            case "pl_PL": return "Kopiuj dokument jako zwykły tekst";
            case "en_US":
            default: return "Copy Document as Plain Text";
        }
    }

    public get vip版本上线前打赏的金额可以双倍抵扣() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "2025年5月15日前打赏享「翻倍 buff」！金额直接 ×2 抵扣，多出来的部分就当请我们喝快乐水啦～主打一个双向奔赴，入股不亏！";
            case "es_ES": return "¡Donaciones antes del 15 de mayo de 2025 disfrutan de «doble bonificación»! El monto se deduce directamente ×2, ¡la diferencia extra es como invitarnos a un refresco feliz! Principalmente una carrera hacia ambos sentidos, ¡invertir no tiene pérdidas!";
            case "fr_FR": return "Les dons effectués avant le 15 mai 2025 bénéficient d'un « bonus doublé » ! Le montant est déduit directement ×2, la différence supplémentaire est comme si vous nous offriez une boisson rafraîchissante ! Principalement une course vers les deux sens, investir sans perdre !";
            case "ja_JP": return "2025年5月15日までに寄付すると「ダブルボーナス」が適用されます！金額が直接×2で控除され、余分な差額は私たちにおごそかれた幸せドリンクとしましょう～主に双方向への走り込み、投資しても損なし！";
            case "zh_CHT": return "2025年5月15日前贊助享「加倍buff」！金額直接×2抵扣，多出來的部分就當請我們喝快樂水啦～主打一個雙向奔赴，入股不虧！";
            case "it_IT": return "Le donazioni prima del 15 maggio 2025 godono del « bonus doppio »! L'importo viene dedotto direttamente ×2, considera la parte extra come un invito a bere qualcosa di fresco! Soprattutto un investimento reciproco, non ci sono perdite!";
            case "de_DE": return "Spenden vor dem 15. Mai 2025 erhalten einen « Doppel-Bonus »! Der Betrag wird direkt ×2 abgezogen, den zusätzlichen Teil kannst du uns als erfrischendes Getränk spendieren – ein gegenseitiger Gewinn, Investition lohnt sich!";
            case "he_IL": return "寄附 לפני ה-15 במאי 2025 זוכה לבונוס כפול! הסכום נחתך ישירות פי 2, את ההפרש הנוסף תשקול כאילו הזמנת אותנו לשתות משהו מת(refreshing drink). בעיקר מסע דו כיווני, השקעה ללא הפסד!";
            case "ru_RU": return "Пожертвования до 15 мая 2025 г. дают «двойной бонус»! Сумма вычитается сразу ×2, разницу можно считать приглашением угостить нас чем-нибудь освежающим! В основном двусторонний обмен, инвестиции без убытков!";
            case "pl_PL": return "Datki przed 15 maja 2025 r. cieszą się „podwójnym bonusem”! Kwota jest od razu ×2 potrącana, różnicę można uznać za zaproszenie na coś orzeźwiającego! Przede wszystkim dwustronny transfer, inwestycja bez strat!";
            case "en_US":
            default: return "Donations before May 15, 2025 enjoy a «double bonus»! The amount is directly ×2 deducted, consider the extra difference as buying us a refreshing drink! Mainly a mutual investment, no loss at all!";
        }
    }

    public get 点击打开商品() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "点击打开商品";
            case "es_ES": return "Haga clic para abrir el producto";
            case "fr_FR": return "Cliquez pour ouvrir le produit";
            case "ja_JP": return "商品を開くをクリック";
            case "zh_CHT": return "點擊打開商品";
            case "it_IT": return "Clicca per aprire il prodotto";
            case "de_DE": return "Klicken Sie, um das Produkt zu öffnen";
            case "he_IL": return "לחץ כדי לפתוח את המוצר";
            case "ru_RU": return "Нажмите, чтобы открыть товар";
            case "pl_PL": return "Kliknij, aby otworzyć produkt";
            case "en_US":
            default: return "Click to open the product";
        }
    }

    public get 摘抄后加入阅读点() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "摘抄后，加入阅读点（需要番茄工具箱插件）";
            case "es_ES": return "Después de copiar, agrega un punto de lectura (requiere el complemento Tomato Toolbox)";
            case "fr_FR": return "Après avoir copié, ajoutez un point de lecture (nécessite l'extension Tomato Toolbox)";
            case "ja_JP": return "要約後、読了ポイントを追加（トマトツールボックスプラグインが必要）";
            case "zh_CHT": return "摘抄後，加入閱讀點（需要番茄工具箱插件）";
            case "it_IT": return "Dopo aver copiato, aggiungi un punto di lettura (richiede l'estensione Tomato Toolbox)";
            case "de_DE": return "Nach dem Kopieren einen Lesezeichenpunkt hinzufügen (erfordert die Erweiterung Tomato Toolbox)";
            case "he_IL": return "לאחר העתקה, הוסף נקודת קריאה (דורש את תוספת כלי הטומטום)";
            case "ru_RU": return "После копирования добавьте точку чтения (требуется расширение Tomato Toolbox)";
            case "pl_PL": return "Po skopiowaniu dodaj punkt odczytu (wymaga rozszerzenia Tomato Toolbox)";
            case "en_US":
            default: return "After copying, add a reading point (requires Tomato Toolbox extension)";
        }
    }

    public get 取消最后一次选择的内容() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "取消最后一次选择的内容";
            case "es_ES": return "Cancelar el contenido de la última selección";
            case "fr_FR": return "Annuler le contenu de la dernière sélection";
            case "ja_JP": return "最後の選択内容をキャンセル";
            case "zh_CHT": return "取消最後一次選擇的內容";
            case "it_IT": return "Annulla il contenuto dell'ultima selezione";
            case "de_DE": return "Inhalt der letzten Auswahl abbrechen";
            case "he_IL": return "בטל את התוכן של הבחירה האחרונה";
            case "ru_RU": return "Отменить содержимое последнего выбора";
            case "pl_PL": return "Anuluj zawartość ostatniego wyboru";
            case "en_US":
            default: return "Cancel the content of the last selection";
        }
    }

    public get 移动端显示悬浮按钮() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "移动端显示悬浮按钮";
            case "es_ES": return "Mostrar botón flotante en móvil";
            case "fr_FR": return "Afficher le bouton flottant sur mobile";
            case "ja_JP": return "モバイルにフローティングボタンを表示";
            case "zh_CHT": return "移動端顯示懸浮按鈕";
            case "it_IT": return "Mostra pulsante fluttuante su mobile";
            case "de_DE": return "Schwebende Schaltfläche auf Mobilgeräten anzeigen";
            case "he_IL": return "הצג כפתור צף במכשירי טלפון";
            case "ru_RU": return "Показывать плавающую кнопку на мобильных устройствах";
            case "pl_PL": return "Pokaż przycisk pływający na urządzeniach mobilnych";
            case "en_US":
            default: return "Show floating button on mobile";
        }
    }

    public get 桌面端显示悬浮按钮() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "桌面端显示悬浮按钮";
            case "es_ES": return "Mostrar botón flotante en escritorio";
            case "fr_FR": return "Afficher le bouton flottant sur bureau";
            case "ja_JP": return "デスクトップにフローティングボタンを表示";
            case "zh_CHT": return "桌麵端顯示懸浮按鈕";
            case "it_IT": return "Mostra pulsante fluttuante su desktop";
            case "de_DE": return "Schwebende Schaltfläche auf dem Desktop anzeigen";
            case "he_IL": return "הצג כפתור צף על שולחן העבודה";
            case "ru_RU": return "Показывать плавающую кнопку на рабочем столе";
            case "pl_PL": return "Pokaż przycisk pływający na pulpicie";
            case "en_US":
            default: return "Show floating button on desktop";
        }
    }

    public get 关闭悬浮按钮双击可以再次打开() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "关闭悬浮按钮，双击可以再次打开";
            case "es_ES": return "Cierra el botón flotante. Puedes abrirlo de nuevo haciendo doble clic.";
            case "fr_FR": return "Fermez le bouton flottant. Vous pouvez le rouvrir en double-cliquant.";
            case "ja_JP": return "フローティングボタンを閉じます。ダブルクリックで再度開くことができます。";
            case "zh_CHT": return "關閉懸浮按鈕，雙擊可以再次打開";
            case "it_IT": return "Chiudi il pulsante fluttuante. Puoi riaprirlo facendo doppio clic.";
            case "de_DE": return "Schließen Sie die schwebende Schaltfläche. Sie können sie durch Doppelklicken erneut öffnen.";
            case "he_IL": return "סגור את הכפתור הצף. באפשרותך לפתוח אותו שוב על ידי לחיצה כפולה.";
            case "ru_RU": return "Закройте плавающую кнопку. Вы можете открыть ее снова, сделав двойной щелчок.";
            case "pl_PL": return "Zamknij przycisk pływający. Możesz go ponownie otworzyć poprzez podwójne kliknięcie.";
            case "en_US":
            default: return "Close the floating button. You can reopen it by double-clicking.";
        }
    }

    public get 移动端编辑器右上角添加多行选择按钮() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "移动端：编辑器右上角添加多行选择按钮";
            case "es_ES": return "Móvil: Agregar botón de selección múltiple en la esquina superior derecha del editor";
            case "fr_FR": return "Mobile : Ajouter un bouton de sélection multiple dans l'angle supérieur droit de l'éditeur";
            case "ja_JP": return "モバイル：エディター右上に複数行選択ボタンを追加";
            case "zh_CHT": return "移動端：編輯器右上角添加多行選擇按鈕";
            case "it_IT": return "Mobile: Aggiungi pulsante selezione multipla nell'angolo in alto a destra dell'editor";
            case "de_DE": return "Mobil: Mehrfachauswahlschaltfläche in der oberen rechten Ecke des Editors hinzufügen";
            case "he_IL": return "נייד: הוסף כפתור בחירה מרובה בפינה העליונה ימין של העורך";
            case "ru_RU": return "Мобильный: Добавить кнопку множественного выбора в правом верхнем углу редактора";
            case "pl_PL": return "Mobilny: Dodaj przycisk wyboru wielokrotnego w prawym górnym rogu edytora";
            case "en_US": return "Mobile: Add multi-line selection button to the top right corner of the editor";
            default: return "Mobile: Add multi-line selection button to the top right corner of the editor";
        }
    }

    public get 桌面端编辑器右上角添加多行选择按钮() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "桌面端：编辑器右上角添加多行选择按钮";
            case "es_ES": return "Escritorio: Agregar botón de selección múltiple en la esquina superior derecha del editor";
            case "fr_FR": return "Bureau : Ajouter un bouton de sélection multiple dans l'angle supérieur droit de l'éditeur";
            case "ja_JP": return "デスクトップ：エディター右上に複数行選択ボタンを追加";
            case "zh_CHT": return "桌面端：編輯器右上角添加多行選擇按鈕";
            case "it_IT": return "Desktop: Aggiungi pulsante selezione multipla nell'angolo in alto a destra dell'editor";
            case "de_DE": return "Desktop: Mehrfachauswahlschaltfläche in der oberen rechten Ecke des Editors hinzufügen";
            case "he_IL": return "שולחן עבודה: הוסף כפתור בחירה מרובה בפינה העליונה ימין של העורך";
            case "ru_RU": return "Настольный: Добавить кнопку множественного выбора в правый верхний угол редактора";
            case "pl_PL": return "Stacjonarny: Dodaj przycisk wyboru wielokrotnego w prawym górnym rogu edytora";
            case "en_US": return "Desktop: Add multi-line selection button to the top right corner of the editor";
            default: return "Desktop: Add multi-line selection button to the top right corner of the editor";
        }
    }

    public get 移动端编辑器右上角添加多行选择菜单() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "移动端：编辑器右上角添加多行选择菜单";
            case "es_ES": return "Móvil: Añadir menú de selección múltiple en la esquina superior derecha del editor";
            case "fr_FR": return "Mobile : Ajouter un menu de sélection multiple dans l'angle supérieur droit de l'éditeur";
            case "ja_JP": return "モバイル：エディター右上に複数行選択メニューを追加";
            case "zh_CHT": return "移動端：編輯器右上角添加多行選擇菜單";
            case "it_IT": return "Mobile: Aggiungi menu di selezione multipla nell'angolo in alto a destra dell'editor";
            case "de_DE": return "Mobil: Mehrfachauswahldropdown oben rechts im Editor hinzufügen";
            case "he_IL": return "נייד: הוסף תפריט בחירה מרובה בפינה העליונה ימין של העורך";
            case "ru_RU": return "Мобильный: Добавить меню множественного выбора в правом верхнем углу редактора";
            case "pl_PL": return "Mobilny: Dodaj menu wielokrotnego wyboru w prawym górnym rogu edytora";
            case "en_US":
            default: return "Mobile: Add multi-line selection menu to top-right corner of editor";
        }
    }

    public get 桌面端编辑器右上角添加多行选择菜单() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "桌面端：编辑器右上角添加多行选择菜单";
            case "es_ES": return "Escritorio: Añadir menú de selección múltiple en la esquina superior derecha del editor";
            case "fr_FR": return "Bureau : Ajouter un menu de sélection multiple dans l'angle supérieur droit de l'éditeur";
            case "ja_JP": return "デスクトップ：エディター右上に複数行選択メニューを追加";
            case "zh_CHT": return "桌面端：編輯器右上角添加多行選擇菜單";
            case "it_IT": return "Desktop: Aggiungi menu di selezione multipla nell'angolo in alto a destra dell'editor";
            case "de_DE": return "Desktop: Mehrfachauswahldropdown oben rechts im Editor hinzufügen";
            case "he_IL": return "שולחן עבודה: הוסף תפריט בחירה מרובה בפינה העליונה ימין של העורך";
            case "ru_RU": return "Настольный: Добавить меню множественного выбора в правый верхний угол редактора";
            case "pl_PL": return "Stacjonarny: Dodaj menu wielokrotnego wyboru w prawym górnym rogu edytora";
            case "en_US":
            default: return "Desktop: Add multi-line selection menu to top-right corner of editor";
        }
    }

    public get 打开多行选择菜单() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "打开多行选择菜单";
            case "es_ES": return "Abrir menú de selección múltiple";
            case "fr_FR": return "Ouvrir le menu de sélection multiple";
            case "ja_JP": return "複数行選択メニューを開く";
            case "zh_CHT": return "打開多行選擇菜單";
            case "it_IT": return "Apri menu selezione multipla";
            case "de_DE": return "Mehrzeiliges Auswahlfeld öffnen";
            case "he_IL": return "פתח תפריט בחירה מרובה";
            case "ru_RU": return "Открыть меню множественного выбора";
            case "pl_PL": return "Otwórz menu wyboru wielokrotnego";
            case "en_US":
            default: return "Open multi-line selection menu";
        }
    }

    public get 开始执行() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "开始执行";
            case "es_ES": return "Comenzar ejecución";
            case "fr_FR": return "Démarrer l'exécution";
            case "ja_JP": return "実行を開始";
            case "zh_CHT": return "開始執行";
            case "it_IT": return "Inizia esecuzione";
            case "de_DE": return "Ausführung starten";
            case "he_IL": return "התחל ביצוע";
            case "ru_RU": return "Начать выполнение";
            case "pl_PL": return "Rozpocznij wykonywanie";
            case "en_US":
            default: return "Start execution";
        }
    }

    public get 在编辑器右上角添加加入渐进阅读分片模式按钮() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "在编辑器右上角添加加入渐进阅读分片模式按钮";
            case "es_ES": return "Agregar botón para entrar en modo de fragmentos de lectura progresiva en la esquina superior derecha del editor";
            case "fr_FR": return "Ajouter un bouton pour activer le mode fragments de lecture progressive dans le coin supérieur droit de l'éditeur";
            case "ja_JP": return "エディター右上にプログレッシブリーディングフラグメントモードに入るボタンを追加";
            case "zh_CHT": return "在編輯器右上角添加加入漸進閱讀分片模式按鈕";
            case "it_IT": return "Aggiungi un pulsante per attivare la modalità frammenti di lettura progressiva nell'angolo in alto a destra dell'editor";
            case "de_DE": return "Füge einen Schaltfläche hinzu, um im Editor rechts oben in den Modus für progressive Leseabschnitte zu wechseln";
            case "he_IL": return "הוסף כפתור להפעלת מצב קריאה פרוגרסיבית במקטעים בפינה העליונה הימנית של העורך";
            case "ru_RU": return "Добавить кнопку перехода в режим фрагментов прогрессивного чтения в правом верхнем углу редактора";
            case "pl_PL": return "Dodaj przycisk uruchamiający tryb fragmentów czytania postępowego w prawym górnym rogu edytora";
            case "en_US":
            default: return "Add button to enter progressive reading fragment mode in the top right corner of the editor";
        }
    }

    public get 思维导线() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "思维导线";
            case "es_ES": return "hilo de pensamiento";
            case "fr_FR": return "fil de réflexion";
            case "ja_JP": return "マインドワイヤー";
            case "zh_CHT": return "思維導線";
            case "it_IT": return "fili conduttori del pensiero";
            case "de_DE": return "Gedankenfaden";
            case "he_IL": return "חוטי מחשבה";
            case "ru_RU": return "мыслительные провода";
            case "pl_PL": return "przewody myśli";
            case "en_US":
            default: return "mindwire"
        }
    }

    public get 思维导线帮助() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "引用渲染为连线。可根据引用，在段落块间添加连线";
            case "es_ES": return "Las referencias se representan como conexiones. Puedes añadir conexiones entre bloques de párrafos según las referencias";
            case "fr_FR": return "Les références sont rendues sous forme de connexions. Vous pouvez ajouter des connexions entre les blocs de paragraphes en fonction des références";
            case "ja_JP": return "参照は接続線として描画されます。参照に応じて、段落ブロック間の接続線を追加できます";
            case "zh_CHT": return "引用渲染為連線。可根據引用，在段落塊間添加連線";
            case "it_IT": return "Le citazioni vengono rese come connessioni. È possibile aggiungere collegamenti tra blocchi di paragrafi in base alle citazioni";
            case "de_DE": return "Referenzen werden als Verbindungen dargestellt. Anhand von Referenzen können Sie Verbindungen zwischen Absatzblöcken hinzufügen";
            case "he_IL": return "הפניות מצוירות כקווים חיבור. ניתן להוסיף קווי חיבור בין בלוקי פסקאות על פי הפניות";
            case "ru_RU": return "Ссылки отображаются в виде соединительных линий. Можно добавлять линии между блоками абзацев на основе ссылок";
            case "pl_PL": return "Cytowania są renderowane jako połączenia. Możesz dodawać połączenia między blokami akapitów na podstawie cytowań";
            case "en_US":
            default: return "References are rendered as connections. You can add connections between paragraph blocks based on references"
        }
    }

    public get 流动线条效果() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "流动线条效果";
            case "es_ES": return "Efecto de líneas fluidas";
            case "fr_FR": return "Effet de lignes fluides";
            case "ja_JP": return "流動線効果";
            case "zh_CHT": return "流動線條效果";
            case "it_IT": return "Effetto linee fluide";
            case "de_DE": return "Fließende Linien Effekt";
            case "he_IL": return "אפקט קווי זרימה";
            case "ru_RU": return "Эффект текущих линий";
            case "pl_PL": return "Efekt płynących linii";
            case "en_US":
            default: return "Flowing lines effect";
        }
    }

    public get 启用思维导线() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "启用思维导线";
            case "es_ES": return "Habilitar guía de pensamiento";
            case "fr_FR": return "Activer le guide de pensée";
            case "ja_JP": return "思考ガイドを有効化";
            case "zh_CHT": return "啟用思維導線";
            case "it_IT": return "Abilita guida mentale";
            case "de_DE": return "Denkführung aktivieren";
            case "he_IL": return "הפעל מדריך חשיבה";
            case "ru_RU": return "Включить направляющую мышления";
            case "pl_PL": return "Włącz przewodnik myślowy";
            case "en_US":
            default: return "Enable thought guide";
        }
    }

    public get 禁用思维导线() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "禁用思维导线";
            case "es_ES": return "Deshabilitar guía de pensamiento";
            case "fr_FR": return "Désactiver le guide de pensée";
            case "ja_JP": return "思考ガイドを無効化";
            case "zh_CHT": return "禁用思維導線";
            case "it_IT": return "Disabilita guida mentale";
            case "de_DE": return "Denkführung deaktivieren";
            case "he_IL": return "השבת מדריך חשיבה";
            case "ru_RU": return "Отключить направляющую мышления";
            case "pl_PL": return "Wyłącz przewodnik myślowy";
            case "en_US":
            default: return "Disable thought guide";
        }
    }

    public get 在编辑器右上角添加摘抄按钮() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "在编辑器右上角添加摘抄按钮";
            case "es_ES": return "Añadir botón de citas en la esquina superior derecha del editor";
            case "fr_FR": return "Ajouter un bouton de citation dans le coin supérieur droit de l'éditeur";
            case "ja_JP": return "エディターの右上に引用ボタンを追加";
            case "zh_CHT": return "在編輯器右上角添加摘抄按鈕";
            case "it_IT": return "Aggiungi pulsante citazione nell'angolo in alto a destra dell'editor";
            case "de_DE": return "Zitat-Button oben rechts im Editor hinzufügen";
            case "he_IL": return "הוסף כפתור ציטוט בפינה הימנית העליונה של העורך";
            case "ru_RU": return "Добавить кнопку цитирования в правом верхнем углу редактора";
            case "pl_PL": return "Dodaj przycisk cytowania w prawym górnym rogu edytora";
            case "en_US":
            default: return "Add quote button in the upper right corner of the editor";
        }
    }

    public get 启用或禁用全局思维导线() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "启用或禁用全局思维导线";
            case "es_ES": return "Habilitar o deshabilitar el hilo de pensamiento global";
            case "fr_FR": return "Activer ou désactiver le fil de pensée global";
            case "ja_JP": return "グローバル思考スレッドの有効化または無効化";
            case "zh_CHT": return "啟用或禁用全局思維導線";
            case "it_IT": return "Abilita o disabilita il filo di pensiero globale";
            case "de_DE": return "Globalen Gedankenfaden aktivieren oder deaktivieren";
            case "he_IL": return "הפעל או השבת את חוט המחשבה הגלובלי";
            case "ru_RU": return "Включить или отключить глобальную нить мышления";
            case "pl_PL": return "Włącz lub wyłącz globalną nić myślową";
            case "en_US":
            default: return "Enable or disable global thought thread";
        }
    }

    public get 启用或禁用文档思维导线() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "启用或禁用文档思维导线";
            case "es_ES": return "Habilitar o deshabilitar el hilo de pensamiento del documento";
            case "fr_FR": return "Activer ou désactiver le fil de pensée du document";
            case "ja_JP": return "ドキュメント思考スレッドの有効化または無効化";
            case "zh_CHT": return "啟用或禁用文檔思維導線";
            case "it_IT": return "Abilita o disabilita il filo di pensiero del documento";
            case "de_DE": return "Dokument-Gedankenfaden aktivieren oder deaktivieren";
            case "he_IL": return "הפעל או השבת את חוט המחשבה של המסמך";
            case "ru_RU": return "Включить или отключить нить мышления документа";
            case "pl_PL": return "Włącz lub wyłącz dokumentową nić myślową";
            case "en_US":
            default: return "Enable or disable document thought thread";
        }
    }

    public get 豆包智能体ID() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "发布后的豆包智能体ID（可选）";
            case "es_ES": return "ID del agente inteligente Doubao después de la publicación (opcional)";
            case "fr_FR": return "ID de l'agent intelligent Doubao après publication (optionnel)";
            case "ja_JP": return "公開後のDoubaoインテリジェントエージェントID（オプション）";
            case "zh_CHT": return "發布後的豆包智能體ID（可選）";
            case "it_IT": return "ID dell'agente intelligente Doubao dopo la pubblicazione (opzionale)";
            case "de_DE": return "Doubao-Intelligent-Agent-ID nach der Veröffentlichung (optional)";
            case "he_IL": return "מזהה הסוכן החכם של Doubao לאחר הפרסום (אופציונלי)";
            case "ru_RU": return "ID интеллектуального агента Doubao после публикации (необязательно)";
            case "pl_PL": return "ID inteligentnego agenta Doubao po publikacji (opcjonalne)";
            case "en_US":
            default: return "Doubao intelligent agent ID after publishing (optional)";
        }
    }

    public get 需要先发布到豆包再填写发布后的豆包智能体ID() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "需要先发布到豆包，再到设置中，填写发布后的豆包智能体ID";
            case "es_ES": return "Primero debes publicar en Doubao, luego ir a configuración y completar el ID del agente inteligente Doubao después de la publicación";
            case "fr_FR": return "Vous devez d'abord publier sur Doubao, puis aller dans les paramètres et remplir l'ID de l'agent intelligent Doubao après publication";
            case "ja_JP": return "まずDoubaoに公開してから、設定で公開後のDoubaoインテリジェントエージェントIDを入力してください";
            case "zh_CHT": return "需要先發佈到豆包，再到設定中，填寫發佈後的豆包智能體ID";
            case "it_IT": return "Devi prima pubblicare su Doubao, poi andare nelle impostazioni e inserire l'ID dell'agente intelligente Doubao dopo la pubblicazione";
            case "de_DE": return "Sie müssen zuerst auf Doubao veröffentlichen, dann zu den Einstellungen gehen und die Doubao-Intelligent-Agent-ID nach der Veröffentlichung eingeben";
            case "he_IL": return "ראשית עליך לפרסם ב-Doubao, לאחר מכן לעבור להגדרות ולהזין את מזהה הסוכן החכם של Doubao לאחר הפרסום";
            case "ru_RU": return "Сначала необходимо опубликовать в Doubao, затем перейти в настройки и ввести ID интеллектуального агента Doubao после публикации";
            case "pl_PL": return "Najpierw musisz opublikować w Doubao, następnie przejść do ustawień i wprowadzić ID inteligentnego agenta Doubao po publikacji";
            case "en_US":
            default: return "You need to first publish to Doubao, then go to settings and fill in the Doubao intelligent agent ID after publishing";
        }
    }

    public get 帮助() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "帮助";
            case "es_ES": return "Ayuda";
            case "fr_FR": return "Aide";
            case "ja_JP": return "ヘルプ";
            case "zh_CHT": return "幫助";
            case "it_IT": return "Aiuto";
            case "de_DE": return "Hilfe";
            case "he_IL": return "עזרה";
            case "ru_RU": return "Помощь";
            case "pl_PL": return "Pomoc";
            case "en_US":
            default: return "Help";
        }
    }
    public get 文档树工具() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "文档树工具";
            case "es_ES": return "Herramienta de árbol de documentos";
            case "fr_FR": return "Outil d'arborescence de documents";
            case "ja_JP": return "ドキュメントツリーツール";
            case "zh_CHT": return "文檔樹工具";
            case "it_IT": return "Strumento albero documenti";
            case "de_DE": return "Dokumentenbaum-Tool";
            case "he_IL": return "כלי עץ מסמכים";
            case "ru_RU": return "Инструмент дерева документов";
            case "pl_PL": return "Narzędzie drzewa dokumentów";
            case "en_US":
            default: return "Document tree tool";
        }
    }

    public get 只关联星号引用() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "只关联星号*引用";
            case "es_ES": return "Solo asociar referencias con asterisco*";
            case "fr_FR": return "Associer uniquement les références avec astérisque*";
            case "ja_JP": return "アスタリスク*付き参照のみ関連付け";
            case "zh_CHT": return "只關聯星號*引用";
            case "it_IT": return "Associa solo riferimenti con asterisco*";
            case "de_DE": return "Nur Sternchen*-Referenzen verknüpfen";
            case "he_IL": return "קשר רק הפניות עם כוכבית*";
            case "ru_RU": return "Связывать только ссылки со звёздочкой*";
            case "pl_PL": return "Powiązuj tylko odniesienia z gwiazdką*";
            case "en_US":
            default:
                return "Only associate asterisk* references";
        }
    }

    public get 隐藏vip图标() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "隐藏 VIP 图标";
            case "es_ES": return "Ocultar icono VIP";
            case "fr_FR": return "Masquer l'icône VIP";
            case "ja_JP": return "VIPアイコンを非表示";
            case "zh_CHT": return "隱藏 VIP 圖標";
            case "it_IT": return "Nascondi icona VIP";
            case "de_DE": return "VIP-Symbol ausblenden";
            case "he_IL": return "הסתר סמל VIP";
            case "ru_RU": return "Скрыть значок VIP";
            case "pl_PL": return "Ukryj ikonę VIP";
            case "en_US":
            default: return "Hide VIP icon";
        }
    }

    public get 使用实线() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "使用实线";
            case "es_ES": return "Usar línea sólida";
            case "fr_FR": return "Utiliser une ligne pleine";
            case "ja_JP": return "実線を使用";
            case "zh_CHT": return "使用實線";
            case "it_IT": return "Usa linea continua";
            case "de_DE": return "Durchgezogene Linie verwenden";
            case "he_IL": return "השתמש בקו מלא";
            case "ru_RU": return "Использовать сплошную линию";
            case "pl_PL": return "Użyj ciągłej linii";
            case "en_US":
            default: return "Use solid line";
        }
    }
    public get 使用多种颜色() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "使用多种颜色";
            case "es_ES": return "Usar múltiples colores";
            case "fr_FR": return "Utiliser plusieurs couleurs";
            case "ja_JP": return "複数の色を使用";
            case "zh_CHT": return "使用多種顏色";
            case "it_IT": return "Usa più colori";
            case "de_DE": return "Mehrere Farben verwenden";
            case "he_IL": return "השתמש במספר צבעים";
            case "ru_RU": return "Использовать несколько цветов";
            case "pl_PL": return "Użyj wielu kolorów";
            case "en_US":
            default: return "Use multiple colors";
        }
    }
    public get 线条宽度() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "线条宽度";
            case "es_ES": return "Ancho de línea";
            case "fr_FR": return "Largeur de ligne";
            case "ja_JP": return "線の幅";
            case "zh_CHT": return "線條寬度";
            case "it_IT": return "Larghezza linea";
            case "de_DE": return "Linienbreite";
            case "he_IL": return "רוחב קו";
            case "ru_RU": return "Ширина линии";
            case "pl_PL": return "Szerokość linii";
            case "en_US":
            default: return "Line width";
        }
    }
    public get 给所有超级块加上边框() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "给所有超级块加上边框";
            case "es_ES": return "Añadir bordes a todos los superbloques";
            case "fr_FR": return "Ajouter des bordures à tous les super blocs";
            case "ja_JP": return "すべてのスーパーブロックに枠線を追加";
            case "zh_CHT": return "給所有超級塊加上邊框";
            case "it_IT": return "Aggiungi bordi a tutti i super blocchi";
            case "de_DE": return "Rahmen zu allen Superblöcken hinzufügen";
            case "he_IL": return "הוסף מסגרות לכל הבלוקים העל";
            case "ru_RU": return "Добавить границы ко всем супер блокам";
            case "pl_PL": return "Dodaj obramowania do wszystkich super bloków";
            case "en_US":
            default: return "Add borders to all super blocks";
        }
    }
    public get 取消() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "取消";
            case "es_ES": return "Cancelar";
            case "fr_FR": return "Annuler";
            case "ja_JP": return "キャンセル";
            case "zh_CHT": return "取消";
            case "it_IT": return "Annulla";
            case "de_DE": return "Abbrechen";
            case "he_IL": return "ביטול";
            case "ru_RU": return "Отмена";
            case "pl_PL": return "Anuluj";
            case "en_US":
            default: return "Cancel";
        }
    }
    public get 闪卡() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "闪卡";
            case "es_ES": return "Tarjeta de memoria";
            case "fr_FR": return "Carte mémoire";
            case "ja_JP": return "フラッシュカード";
            case "zh_CHT": return "閃卡";
            case "it_IT": return "Scheda didattica";
            case "de_DE": return "Karteikarte";
            case "he_IL": return "כרטיסיית פלאש";
            case "ru_RU": return "Карточка";
            case "pl_PL": return "Fiszka";
            case "en_US":
            default: return "Flashcard";
        }
    }
    public get 时间() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "时间";
            case "es_ES": return "Tiempo";
            case "fr_FR": return "Temps";
            case "ja_JP": return "時間";
            case "zh_CHT": return "時間";
            case "it_IT": return "Tempo";
            case "de_DE": return "Zeit";
            case "he_IL": return "זמן";
            case "ru_RU": return "Время";
            case "pl_PL": return "Czas";
            case "en_US":
            default: return "Time";
        }
    }
    public get 记忆() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "记忆";
            case "es_ES": return "Memoria";
            case "fr_FR": return "Mémoire";
            case "ja_JP": return "記憶";
            case "zh_CHT": return "記憶";
            case "it_IT": return "Memoria";
            case "de_DE": return "Erinnerung";
            case "he_IL": return "זיכרון";
            case "ru_RU": return "Память";
            case "pl_PL": return "Pamięć";
            case "en_US":
            default: return "Memory";
        }
    }
    public get 加入时间() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "加入时间";
            case "es_ES": return "Hora de unión";
            case "fr_FR": return "Heure d'arrivée";
            case "ja_JP": return "参加時間";
            case "zh_CHT": return "加入時間";
            case "it_IT": return "Ora di ingresso";
            case "de_DE": return "Beitrittszeit";
            case "he_IL": return "זמן הצטרפות";
            case "ru_RU": return "Время присоединения";
            case "pl_PL": return "Czas dołączenia";
            case "en_US":
            default: return "Join time";
        }
    }
    public get 记忆上次的输入() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "记忆上次的输入";
            case "es_ES": return "Recordar última entrada";
            case "fr_FR": return "Se souvenir de la dernière entrée";
            case "ja_JP": return "前回の入力を記憶";
            case "zh_CHT": return "記憶上次的輸入";
            case "it_IT": return "Ricorda ultimo input";
            case "de_DE": return "Letzte Eingabe merken";
            case "he_IL": return "זכור קלט אחרון";
            case "ru_RU": return "Запомнить последний ввод";
            case "pl_PL": return "Zapamiętaj ostatnie wprowadzenie";
            case "en_US":
            default: return "Remember last input";
        }
    }
}
