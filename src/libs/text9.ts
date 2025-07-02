import { TomatoI18nABC10 } from "./text10";

export abstract class TomatoI18nABC9 extends TomatoI18nABC10 {

    public get 阅读点加入闪卡() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "阅读点加入闪卡";
            case "es_ES":
                return "Punto de lectura añadido a la tarjeta flash";
            case "fr_FR":
                return "Point de lecture ajouté à la carte mémoire";
            case "ja_JP":
                return "読書ポイントをフラッシュカードに追加";
            case "zh_CHT":
                return "閱讀點加入閃卡";

            default:
                return "Reading point added to flashcard";
        }
    }
    public get 跳到底部反链() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "跳到底部反链";
            case "es_ES":
                return "Ir a las referencias inversas al final";
            case "fr_FR":
                return "Aller aux références inverses en bas";
            case "ja_JP":
                return "ページ下部の逆リンクに移動";
            case "zh_CHT":
                return "跳到底部反鏈";

            default:
                return "Jump to Backlinks at the Bottom";
        }
    }
    public get 在标题下添加跳转到底部的按钮() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "在标题下添加跳转到底部的按钮";
            case "es_ES":
                return "Agregar botón para saltar al final debajo del título";
            case "fr_FR":
                return "Ajouter un bouton pour sauter en bas sous le titre";
            case "ja_JP":
                return "タイトルの下にページの最後にジャンプするボタンを追加";
            case "zh_CHT":
                return "在標題下添加跳轉到底部的按鈕";

            default:
                return "Add jump to bottom button under the title";
        }
    }

    public get 跳转顶部() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "跳转顶部";
            case "es_ES":
                return "Saltar al inicio";
            case "fr_FR":
                return "Sauter en haut";
            case "ja_JP":
                return "ページの先頭にジャンプ";
            case "zh_CHT":
                return "跳轉頂部";

            default:
                return "Jump to top";
        }
    }
    public get 默认折叠概念栏() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "默认折叠概念栏";
            case "es_ES":
                return "Barra de conceptos plegable predeterminada";
            case "fr_FR":
                return "Barre de concepts repliable par défaut";
            case "ja_JP":
                return "デフォルトで折りたたまれるコンセプトバー";
            case "zh_CHT":
                return "預設摺疊概念欄";

            default:
                return "Default collapsible concept bar";
        }
    }
    public get 反链启用只读模式(): string {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "反链启用只读模式，提高性能";
            case "es_ES":
                return "El modo de solo lectura para enlaces inversos se activa y mejora el rendimiento.";
            case "fr_FR":
                return "Le mode lecture seule pour les liens entrants est activé et améliore les performances.";
            case "ja_JP":
                return "バックリンクの読み取り専用モードが有効になり、パフォーマンスが向上します。";
            case "zh_CHT":
                return "反向鏈接啟用唯讀模式，提高性能。";

            default:
                return "Backlink enable read-only mode to improve performance.";
        }
    }
    public get 过滤下面显示的反链提及() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "在下面显示的反链提及中过滤。可点击问号查看语法。";
            case "es_ES":
                return "Filtrar las menciones de enlaces inversos mostrados a continuación.";
            case "fr_FR":
                return "Filtrer les mentions de liens inverses affichées ci-dessous.";
            case "ja_JP":
                return "以下に表示されるバックリンクの言及をフィルタリングします。疑問符をクリックして構文を確認できます。";
            case "zh_CHT":
                return "在下面顯示的反向鏈接提及中過濾。可點擊問號查看語法。";

            default:
                return "Filter the backlink mentions shown below. Click the question mark to view the syntax.";
        }
    }
    public get 搜索反链提及() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "搜索本文档所有反链提及，搜索范围不受最大展开数限制。";
            case "es_ES":
                return "Buscar todas las menciones de enlaces inversos en este documento. El alcance de búsqueda no está limitado por el número máximo de expansiones.";
            case "fr_FR":
                return "Rechercher toutes les mentions de liens inverses dans ce document. La portée de la recherche n'est pas limitée par le nombre maximal d'expansions.";
            case "ja_JP":
                return "この文書内のすべてのバックリンクの言及を検索します。検索範囲は最大展開数に制限されません。";
            case "zh_CHT":
                return "搜尋本文檔所有反向鏈接提及，搜索範圍不受最大展開數限制。";

            default:
                return "Search for all backlink mentions in this document. The search scope is not limited by the maximum number of expansions.";
        }
    }
    public get 标题字母升序() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "标题字母升序";
            case "es_ES":
                return "Título alfabético ascendente";
            case "fr_FR":
                return "Titre par ordre alphabétique croissant";
            case "ja_JP":
                return "タイトルアルファベット昇順";
            case "zh_CHT":
                return "標題字母升序";

            default:
                return "Title Alphabetical Ascending";
        }
    }

    public get 标题字母降序() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "标题字母降序";
            case "es_ES":
                return "Título alfabético descendente";
            case "fr_FR":
                return "Titre par ordre alphabétique décroissant";
            case "ja_JP":
                return "タイトルアルファベット降順";
            case "zh_CHT":
                return "標題字母降序";

            default:
                return "Title Alphabetical Descending";
        }
    }

    public get 标题自然数升序() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "标题自然数升序";
            case "es_ES":
                return "Título numérico natural ascendente";
            case "fr_FR":
                return "Titre par ordre numérique naturel croissant";
            case "ja_JP":
                return "タイトル自然数昇順";
            case "zh_CHT":
                return "標題自然數升序";

            default:
                return "Title Natural Number Ascending";
        }
    }

    public get 标题自然数降序() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "标题自然数降序";
            case "es_ES":
                return "Título numérico natural descendente";
            case "fr_FR":
                return "Titre par ordre numérique naturel décroissant";
            case "ja_JP":
                return "タイトル自然数降順";
            case "zh_CHT":
                return "標題自然數降序";

            default:
                return "Title Natural Number Descending";
        }
    }

    public get 将指定的引用渲染为标签(): string {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "把包含指定前缀的引用，渲染为标签。每个前缀用逗号隔开。";
            case "es_ES":
                return "Renderizar referencias que contienen un prefijo específico como etiquetas. Separe cada prefijo con una coma.";
            case "fr_FR":
                return "Rendre les références contenant un préfixe spécifié en tant qu'étiquettes. Séparez chaque préfixe par une virgule.";
            case "ja_JP":
                return "指定されたプレフィックスを含む参照をタグとしてレンダリングします。各プレフィックスはカンマで区切ります。";
            case "zh_CHT":
                return "把包含指定前綴的引用，渲染為標籤。每個前綴用逗號隔開。";

            default:
                return "Render references containing a specified prefix as tags. Separate each prefix with a comma.";
        }
    }
    public get 使用链接否则用引用() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "打开使用链接，关闭使用引用。";
            case "es_ES":
                return "Abra usando el enlace, cierre usando la referencia.";
            case "fr_FR":
                return "Ouvrez en utilisant le lien, fermez en utilisant la référence.";
            case "ja_JP":
                return "リンクを使用して開き、参照を使用して閉じます。";
            case "zh_CHT":
                return "打開使用連結，關閉使用引用。";

            default:
                return "Open using the link, close using the reference.";
        }
    }
    public get 总是保持已经加载的内容() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "总是保持已经加载的内容";
            case "es_ES":
                return "Mantener siempre el contenido ya cargado";
            case "fr_FR":
                return "Toujours conserver le contenu déjà chargé";
            case "ja_JP":
                return "常に既にロードされたコンテンツを保持する";
            case "zh_CHT":
                return "總是保持已經加載的內容";

            default:
                return "Always keep the already loaded content";
        }
    }
    public get 阅读点统一保存(): string {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "阅读点统一保存";
            case "es_ES":
                return "Guardar uniformemente los puntos de lectura";
            case "fr_FR":
                return "Enregistrer uniformément les points de lecture";
            case "ja_JP":
                return "読書ポイントを統一して保存する";
            case "zh_CHT":
                return "閱讀點統一保存";

            default:
                return "Uniformly save reading points";
        }
    }
    public get 数据库充当反链() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "数据库反链：用数据库来充当反链面板，把反链自动插入数据库中";
            case "es_ES":
                return "Enlaces inversos de base de datos: Utilice la base de datos como un panel de enlaces inversos e inserte automáticamente los enlaces inversos en la base de datos.";
            case "fr_FR":
                return "Liens inverses de base de données : Utilisez la base de données comme panneau de liens inverses et insérez automatiquement les liens inversos dans la base de données.";
            case "ja_JP":
                return "データベースの逆リンク：データベースを逆リンクパネルとして使用し、逆リンクを自動的にデータベースに挿入します。";
            case "zh_CHT":
                return "資料庫反鏈：用資料庫充當反鏈面板，把反鏈自動插入資料庫中。";
            case "it_IT":
                return "Collegamenti inversi del database: Usa il database come un pannello di collegamenti inversi e inserisci automaticamente i collegamenti inversi nel database.";

            default:
                return "Database backlinks: Use the database as a backlink panel and automatically insert backlinks into the database.";
        }
    }
    public get 刷新数据库反链() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "刷新数据库反链";
            case "es_ES":
                return "Actualizar enlaces inversos de la base de datos"; // 西班牙语
            case "fr_FR":
                return "Actualiser les backlinks de la base de données"; // 法语
            case "ja_JP":
                return "データベースの逆参照を更新する"; // 日语
            case "zh_CHT":
                return "刷新數據庫反鏈"; // 繁体中文
            case "it_IT":
                return "Aggiorna i backlink del database"; // 意大利语

            default:
                return "Refresh database backlinks"; // 英语
        }
    }
    public get 删除失效的闪卡() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "删除失效的闪卡。删卡时没有先取消闪卡，而是直接把闪卡的内容删除，则闪卡没有对应的内容，变成失效闪卡。（使用前请先创建备份）";
            case "es_ES":
                return "Eliminar tarjetas interactivas caducadas. Si se elimina el contenido de una tarjeta interactiva sin cancelarla primero, la tarjeta no tendrá contenido correspondiente y se convertirá en una tarjeta caducada. (Cree una copia de seguridad antes de usarla).";
            case "fr_FR":
                return "Supprimer les cartes mémoire expirées. Si vous supprimez le contenu d'une carte mémoire sans la désactiver d'abord, la carte n'aura plus de contenu correspondant et deviendra une carte mémoire expirée. (Faites une sauvegarde avant de l'utiliser).";
            case "ja_JP":
                return "無効なフラッシュカードを削除します。フラッシュカードをキャンセルせずに直接その内容を削除すると、フラッシュカードに対応する内容がなくなり、無効なフラッシュカードになります。（使用前にバックアップを作成してください）。";
            case "zh_CHT":
                return "刪除失效的閃卡。若未先取消閃卡，而是直接刪除閃卡內容，則閃卡將沒有對應內容，變成失效閃卡。（使用前請先建立備份）。";
            case "it_IT":
                return "Eliminare le schede lampo scadute. Se si elimina il contenuto di una scheda lampo senza prima annullarla, la scheda non avrà più un contenuto corrispondente e diventerà una scheda scaduta. (Fare un backup prima di utilizzarla).";

            default:
                return "Delete expired flashcards. If you delete the content of a flashcard without canceling it first, the flashcard will have no corresponding content and become an expired flashcard. (Create a backup before using it).";
        }
    }
    public get 删除失效的数据库() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "删除失效的数据库。与失效的闪卡一样，从文档中删除数据库，数据库还是会在/data/storage/av 下存在。（使用前请先创建备份）";
            case "es_ES":
                return "Eliminar la base de datos no válida. Al igual que las tarjetas flash no válidas, eliminar la base de datos del documento. La base de datos aún existirá en /data/storage/av. (Cree una copia de seguridad antes de usarla).";
            case "fr_FR":
                return "Supprimer la base de données non valide. Comme les cartes mémoire non valides, supprimer la base de données du document. La base de données existera toujours sous /data/storage/av. (Faites une sauvegarde avant de l'utiliser).";
            case "ja_JP":
                return "無効なデータベースを削除します。無効なフラッシュカードと同じように、ドキュメントからデータベースを削除しますが、データベースは依然として/data/storage/avに存在します。（使用前にバックアップを作成してください）。";
            case "zh_CHT":
                return "刪除失效的資料庫。與失效的閃卡一樣，從文件中刪除資料庫，資料庫仍會在/data/storage/av 下存在。（使用前請先創建備份）。";
            case "it_IT":
                return "Eliminare il database non valido. Come le flashcard non valide, eliminare il database dal documento. Il database sarà ancora presente in /data/storage/av. (Creare un backup prima di utilizzarlo).";

            default:
                return "Delete the invalid database. Just like invalid flashcards, delete the database from the document. The database will still exist under /data/storage/av. (Create a backup before using it).";
        }
    }
    public get 将选中的内容移到下边() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "将选中的内容移到下边";
            case "es_ES":
                return "Mover el contenido seleccionado hacia abajo";
            case "fr_FR":
                return "Déplacer le contenu sélectionné vers le bas";
            case "ja_JP":
                return "選択した内容を下に移動する";
            case "zh_CHT":
                return "將選中的內容移到下邊";
            case "it_IT":
                return "Spostare il contenuto selezionato verso il basso";

            default:
                return "Move the selected content to the bottom";
        }
    }
    public get 隐藏修改时间和创建时间(): string {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "隐藏修改时间和创建时间";
            case "es_ES":
                return "Ocultar la hora de modificación y la hora de creación";
            case "fr_FR":
                return "Masquer l'heure de modification et l'heure de création";
            case "ja_JP":
                return "修正日時と作成日時を非表示にする";
            case "zh_CHT":
                return "隱藏修改時間和創建時間";
            case "it_IT":
                return "Nascondi ora di modifica e ora di creazione";

            default:
                return "Hide modification time and creation time";
        }
    }
    // TypeScript get property: translate and fill the rest langs on returns for me, give me typescript function. dont modify function name what i give you.
    public get 移动内容后添加指向原来位置的链接() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "移动内容后，添加指向原来位置的链接";
            case "es_ES":
                return "Después de mover el contenido, agregue un enlace que apunte a la ubicación original";
            case "fr_FR":
                return "Après avoir déplacé le contenu, ajoutez un lien pointant vers l'emplacement d'origine";
            case "ja_JP":
                return "コンテンツを移動した後、元の場所を指すリンクを追加します";
            case "zh_CHT":
                return "移動內容後，添加指向原來位置的鏈接";
            case "it_IT":
                return "Dopo aver spostato il contenuto, aggiungi un collegamento che punta alla posizione originale";

            default:
                return "After moving the content, add a link pointing to the original location";
        }
    }
    public get 插入相关的层级概念() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "插入相关的层级概念";
            case "es_ES":
                return "Concepto de jerarquía relacionado de inserción";
            case "fr_FR":
                return "Insérer le concept de hiérarchie connexe";
            case "ja_JP":
                return "関連する階層概念を挿入";
            case "zh_CHT":
                return "插入相關的層級概念";
            case "it_IT":
                return "Inserisci il concetto gerarchico correlato";

            default:
                return "Insert related hierarchical concepts";
        }
    }
    public get 给引用加上效果() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "给引用加上效果";
            case "es_ES":
                return "Aplicar efecto a la cita";
            case "fr_FR":
                return "Appliquer un effet à la citation";
            case "ja_JP":
                return "引用に効果を追加する";
            case "zh_CHT":
                return "給引用加上效果";
            case "it_IT":
                return "Applica effetto alla citazione";

            default:
                return "Apply effect to the quote";
        }
    }
    // TypeScript get property: translate and fill the rest langs on returns for me, give me typescript function. dont modify function name what i give you.
    public get 自定义图标() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "自定义图标";
            case "es_ES":
                return "Icono personalizado";
            case "fr_FR":
                return "Icône personnalisée";
            case "ja_JP":
                return "カスタムアイコン";
            case "zh_CHT":
                return "自訂圖標";
            case "it_IT":
                return "icona personalizzata";

            default:
                return "Custom Icon";
        }
    }
    public get 在悬浮窗内显示底部反链() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "在悬浮窗内显示底部反链";
            case "es_ES":
                return "Mostrar el enlace inverso inferior en la ventana flotante";
            case "fr_FR":
                return "Afficher le lien inverse inférieur dans la fenêtre flottante";
            case "ja_JP":
                return "フロートウィンドウ内に下部逆リンクを表示する";
            case "zh_CHT":
                return "在懸浮窗內顯示底部反鏈";
            case "it_IT":
                return "Visualizza il link inverso inferiore nella finestra flottante";

                return "Display the bottom backlink in the floating window";
            default:
                return "";
        }
    }
    // TypeScript get property: translate and fill the rest langs on returns for me, give me typescript function. dont modify function name what i give you.
    public get 立即刷新() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "立即刷新";
            case "es_ES":
                return "Actualizar inmediatamente";
            case "fr_FR":
                return "Actualiser immédiatement";
            case "ja_JP":
                return "直ちに更新";
            case "zh_CHT":
                return "立即刷新";
            case "it_IT":
                return "Aggiorna immediatamente";

            default:
                return "Refresh immediately";
        }
    }
    public get 移动到Dailynote() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "移动到 Dailynote";
            case "es_ES":
                return "Mover a Dailynote";
            case "fr_FR":
                return "Déplacer vers Dailynote";
            case "ja_JP":
                return "Dailynoteに移動";
            case "zh_CHT":
                return "移動到 Dailynote";
            case "it_IT":
                return "Sposta su Dailynote";

            default:
                return "Move to Dailynote";
        }
    }
    public get 把指向当前文档的引用删除() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "把指向当前文档的引用删除";
            case "es_ES":
                return "Eliminar referencias al documento actual";
            case "fr_FR":
                return "Supprimer les références au document actuel";
            case "ja_JP":
                return "現在のドキュメントへの参照を削除";
            case "zh_CHT":
                return "把指向當前文檔的引用刪除";
            case "it_IT":
                return "Elimina riferimenti al documento corrente";

            default:
                return "Remove references to the current document";
        }
    }
    public get VIP密钥() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "VIP密钥";
            case "es_ES":
                return "Clave VIP";
            case "fr_FR":
                return "Clé VIP";
            case "ja_JP":
                return "VIPキー";
            case "zh_CHT":
                return "VIP密鑰";
            case "it_IT":
                return "Chiave VIP";

            default:
                return "VIP Key";
        }
    }
    public get 测试密钥的合法性() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "测试密钥的合法性";
            case "es_ES":
                return "Probar la legalidad de la clave";
            case "fr_FR":
                return "Tester la légalité de la clé";
            case "ja_JP":
                return "キーの合法性をテストする";
            case "zh_CHT":
                return "測試密鑰的合法性";
            case "it_IT":
                return "Verificare la legalità della chiave";

            default:
                return "Test the legality of the key";
        }
    }
    public get 嵌入互链创建() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "嵌入互链-创建";
            case "es_ES":
                return "Crear enlace incrustado";
            case "fr_FR":
                return "Créer un lien intégré";
            case "ja_JP":
                return "埋め込みリンクの作成";
            case "zh_CHT":
                return "嵌入互鏈-創建";
            case "it_IT":
                return "Crea collegamento incorporato";

            default:
                return "Create Embedded Link";
        }
    }

    public get 嵌入互链选择() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "嵌入互链-选择";
            case "es_ES":
                return "Seleccionar enlace incrustado";
            case "fr_FR":
                return "Sélectionner un lien intégré";
            case "ja_JP":
                return "埋め込みリンクの選択";
            case "zh_CHT":
                return "嵌入互鏈-選擇";
            case "it_IT":
                return "Seleziona collegamento incorporato";

            default:
                return "Select Embedded Link";
        }
    }
    public get 总是退出聚焦() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "总是退出聚焦（闪卡除外）";
            case "es_ES":
                return "Siempre salir de enfoque (excepto tarjetas flash)";
            case "fr_FR":
                return "Toujours quitter le focus (sauf pour les cartes mémoire)";
            case "ja_JP":
                return "常にフォーカスを外す（カードを除く）";
            case "zh_CHT":
                return "總是退出聚焦（閃卡除外）";
            case "it_IT":
                return "Esci sempre dallo stato di attenzione (escluse le flashcard)";

            default:
                return "Always exit focus (except flashcards)";
        }
    }
    public get 块关系图() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "块关系图";
            case "es_ES":
                return "Diagrama de relaciones de bloques"; // 西班牙语翻译  
            case "fr_FR":
                return "Diagramme de relations de blocs"; // 法语翻译  
            case "ja_JP":
                return "ブロック関係図"; // 日语翻译  
            case "zh_CHT":
                return "區塊關係圖"; // 繁体中文翻译  
            case "it_IT":
                return "Diagramma delle relazioni tra blocchi"; // 意大利语翻译  

            default:
                return "Block Relationship Diagram"; // 英语翻译，同时作为默认情况  
        }
    }
    public get 最大连续段落块数量() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "最大连续段落块数量";
            case "es_ES":
                return "Cantidad máxima de bloques de párrafos continuos";
            case "fr_FR":
                return "Nombre maximal de blocs de paragraphes consécutifs";
            case "ja_JP":
                return "連続段落ブロックの最大数";
            case "zh_CHT":
                return "最大連續段落塊數量";
            case "it_IT":
                return "Numero massimo di blocchi di paragrafi consecutivi";

            default:
                return "Maximum consecutive paragraph block count";
        }
    }
    public get 最大节点数量() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "最大节点数量";
            case "es_ES":
                return "Cantidad máxima de nodos";
            case "fr_FR":
                return "Nombre maximal de nœuds";
            case "ja_JP":
                return "ノードの最大数";
            case "zh_CHT":
                return "最大節點數量";
            case "it_IT":
                return "Numero massimo di nodi";

            default:
                return "Maximum node count";
        }
    }
    public get 定位到图中的节点() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "定位到图中节点";
            case "es_ES":
                return "Ir al nodo en la gráfica";
            case "fr_FR":
                return "Aller au nœud dans le graphique";
            case "ja_JP":
                return "グラフ内のノードに移動";
            case "zh_CHT":
                return "定位到圖中節點";
            case "it_IT":
                return "Vai al nodo nel grafico";

            default:
                return "Go to node in graph";
        }
    }
    public get 关联两个块选择() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "关联两个块-选择";
            case "es_ES":
                return "Asociar dos bloques - Selección";
            case "fr_FR":
                return "Associer deux blocs - Sélection";
            case "ja_JP":
                return "２つのブロックを関連付ける - 選択";
            case "zh_CHT":
                return "關聯兩個區塊 - 選擇";
            case "it_IT":
                return "Associa due blocchi - Selezione";

            default:
                return "Associate two blocks - Selection";
        }
    }
    public get 关联两个块创建() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "关联两个块-创建";
            case "es_ES":
                return "Asociar dos bloques - Creación";
            case "fr_FR":
                return "Associer deux blocs - Création";
            case "ja_JP":
                return "２つのブロックを関連付ける - 作成";
            case "zh_CHT":
                return "關聯兩個區塊 - 建立";
            case "it_IT":
                return "Associa due blocchi - Creazione";

            default:
                return "Associate two blocks - Creation";
        }
    }
    public get 互相插入引用于下方选择() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "互相插入引用于下方-选择";
            case "es_ES":
                return "Insertar referencias mutuamente debajo - Seleccionar";
            case "fr_FR":
                return "Insérer des références mutuelles ci-dessous - Sélectionner";
            case "ja_JP":
                return "相互参照を下に挿入 - 選択";
            case "zh_CHT":
                return "互相插入引用于下方-選擇";
            case "it_IT":
                return "Inserisci riferimenti reciproci sotto - Seleziona";

            default:
                return "Insert references mutually below - Select";
        }
    }
    public get 互相插入引用于下方创建() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "互相插入引用于下方-创建";
            case "es_ES":
                return "Insertar referencias mutuamente debajo - Crear";
            case "fr_FR":
                return "Insérer des références mutuelles ci-dessous - Créer";
            case "ja_JP":
                return "相互参照を下に挿入 - 作成";
            case "zh_CHT":
                return "互相插入引用于下方-創建";
            case "it_IT":
                return "Inserisci riferimenti reciproci sotto - Crea";

            default:
                return "Insert references mutually below - Create";
        }
    }
    public get 切换横向与纵向() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "切换横向与纵向";
            case "es_ES":
                return "Cambiar entre horizontal y vertical";
            case "fr_FR":
                return "Basculer entre horizontal et vertical";
            case "ja_JP":
                return "横向と縦向を切り替える";
            case "zh_CHT":
                return "切換橫向與縱向";
            case "it_IT":
                return "Cambia tra orizzontale e verticale";

            default:
                return "Switch between horizontal and vertical";
        }
    }
    public get 删除所选段落() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "用选中段落创建文档后，删除所选段落";
            case "es_ES":
                return "Después de crear un documento con los párrafos seleccionados, eliminar los párrafos seleccionados";
            case "fr_FR":
                return "Après avoir créé un document avec les paragraphes sélectionnés, supprimer les paragraphes sélectionnés";
            case "ja_JP":
                return "選択した段落でドキュメントを作成した後、選択した段落を削除する";
            case "zh_CHT":
                return "用選中段落創建文檔後，刪除所選段落";
            case "it_IT":
                return "Dopo aver creato un documento con i paragrafi selezionati, eliminare i paragrafi selezionati";

            default:
                return "After creating a document with the selected paragraphs, delete the selected paragraphs";
        }
    }
    public get 正在添加阅读点() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "正在添加阅读点";
            case "es_ES":
                return "Añadiendo punto de lectura";
            case "fr_FR":
                return "Ajout d'un point de lecture";
            case "ja_JP":
                return "読書ポイントを追加中";
            case "zh_CHT":
                return "正在添加閱讀點";
            case "it_IT":
                return "Aggiunta del punto di lettura";

            default:
                return "Adding reading point";
        }
    }
    public get 左键点击节点跳转到文档() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "左键点击节点跳转到文档";
            case "es_ES":
                return "Haz clic con el botón izquierdo en el nodo para ir al documento";
            case "fr_FR":
                return "Cliquez avec le bouton gauche sur le nœud pour accéder au document";
            case "ja_JP":
                return "ノードを左クリックしてドキュメントに移動";
            case "zh_CHT":
                return "左鍵點擊節點跳轉到文件";
            case "it_IT":
                return "Fai clic sinistro sul nodo per accedere al documento";

            default:
                return "Left-click the node to navigate to the document";
        }
    }
    public get 极简无序列表样式() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "极简无序列表样式";
            case "es_ES":
                return "Estilo de lista desordenada minimalista";
            case "fr_FR":
                return "Style de liste non ordonnée minimaliste";
            case "ja_JP":
                return "ミニマルな無順序リストスタイル";
            case "zh_CHT":
                return "極簡無序列表樣式";
            case "it_IT":
                return "Stile di elenco non ordinato minimalista";

            default:
                return "Minimalist unordered list style";
        }
    }
}
