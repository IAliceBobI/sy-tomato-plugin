import { TomatoI18nABC } from "./libs/text1";

export class TomatoI18n extends TomatoI18nABC {
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
