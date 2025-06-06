import { TomatoI18nABC6 } from "./text6";

export abstract class TomatoI18nABC5 extends TomatoI18nABC6 {
    public get 给无序列表加上背景色() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "给无序列表加上背景色";
            case "es_ES":
                return "Añadir color de fondo a la lista desordenada";
            case "fr_FR":
                return "Ajouter une couleur d'arrière-plan à la liste non ordonnée";
            case "ja_JP":
                return "無順序リストに背景色を追加";
            case "zh_CHT":
                return "給無序清單加上背景色";
            case "it_IT":
                return "Aggiungi colore di sfondo alla lista non ordinata";

            default:
                return "Add background color to unordered list";
        }
    }
    public get 禁用强提醒() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "禁用强提醒";
            case "es_ES":
                return "Deshabilitar recordatorios fuertes";
            case "fr_FR":
                return "Désactiver les rappels insistants";
            case "ja_JP":
                return "強力なリマインダーを無効にする";
            case "zh_CHT":
                return "禁用強提醒"; // Traditional Chinese can be the same or a traditional version of zh_CN text.
            case "it_IT":
                return "Disattiva promemoria forti";

            default:
                return "Disable strong reminders";
        }
    }
    public get 用对话框的形式打开阅读点() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "用对话框的形式打开阅读点";
            case "es_ES":
                return "Abrir punto de lectura en forma de diálogo";
            case "fr_FR":
                return "Ouvrir le point de lecture sous forme de dialogue";
            case "ja_JP":
                return "ダイアログ形式で読書ポイントを開く";
            case "zh_CHT":
                return "用對話框的形式打開閱讀點";
            case "it_IT":
                return "Aprire il punto di lettura in forma di dialogo";

            default:
                return "Open reading point in dialog form";
        }
    }
    public get 触发快捷键时弹出对话框() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "触发快捷键时弹出对话框(速度更快)";
            case "es_ES":
                return "Mostrar cuadro de diálogo al activar la tecla de acceso rápido (más rápido)";
            case "fr_FR":
                return "Afficher la boîte de dialogue lors de l'activation de la touche de raccourci (plus rapide)";
            case "ja_JP":
                return "ショートカットキーを押したときにダイアログを表示する（より速い）";
            case "zh_CHT":
                return "觸發快捷鍵時彈出對話框(速度更快)";
            case "it_IT":
                return "Mostra finestra di dialogo al premere del tasto di scelta rapida (più veloce)";

            default:
                return "Show dialog when shortcut key is triggered (faster)";
        }
    }
    public get 同步块选择() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "同步块-选择";
            case "es_ES":
                return "Bloque de sincronización - Seleccionar";
            case "fr_FR":
                return "Bloc de synchronisation - Sélectionner";
            case "ja_JP":
                return "同期ブロック - 選択";
            case "zh_CHT":
                return "同步塊-選擇";
            case "it_IT":
                return "Blocco di sincronizzazione - Seleziona";

            default:
                return "Sync Block - Select";
        }
    }
    public get 同步块创建() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "同步块-创建";
            case "es_ES":
                return "Bloque de sincronización - Crear";
            case "fr_FR":
                return "Bloc de synchronisation - Créer";
            case "ja_JP":
                return "同期ブロック - 作成";
            case "zh_CHT":
                return "同步塊-創建";
            case "it_IT":
                return "Blocco di sincronizzazione - Crea";

            default:
                return "Sync Block - Create";
        }
    }
    public get 同步块() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "同步块";
            case "es_ES":
                return "Bloque de sincronización";
            case "fr_FR":
                return "Bloc de synchronisation";
            case "ja_JP":
                return "同期ブロック";
            case "zh_CHT":
                return "同步塊";
            case "it_IT":
                return "Blocco di sincronizzazione";

            default:
                return "Synchronization Block";
        }
    }

    public 已在x个地方同步(x: number) {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return `已在${x}个地方同步`;
            case "es_ES":
                return `Sincronizado en ${x} lugares`;
            case "fr_FR":
                return `Synchronisé en ${x} endroits`;
            case "ja_JP":
                return `${x}箇所で同期されました`;
            case "zh_CHT":
                return `已在${x}個地方同步`;
            case "it_IT":
                return `Sincronizzato in ${x} luoghi`;

            default:
                return `Synchronized in ${x} places`;
        }
    }
    public get 保存() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "保存";
            case "es_ES":
                return "Guardar";
            case "fr_FR":
                return "Enregistrer";
            case "ja_JP":
                return "保存";
            case "zh_CHT":
                return "保存";
            case "it_IT":
                return "Salva";

            default:
                return "Save";
        }
    }
    public get 自动() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "自动";
            case "es_ES":
                return "Automático";
            case "fr_FR":
                return "Automatique";
            case "ja_JP":
                return "自動";
            case "zh_CHT":
                return "自動";
            case "it_IT":
                return "Automatico";

            default:
                return "Auto";
        }
    }
    public 延迟x秒后执行(x: number) {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return `延迟${x}秒后执行，请勿修改`;
            case "es_ES":
                return `Ejecutar después de ${x} segundos, no modificar`;
            case "fr_FR":
                return `Exécuter après ${x} secondes, ne pas modifier`;
            case "ja_JP":
                return `${x}秒後に実行、変更しないでください`;
            case "zh_CHT":
                return `延遲${x}秒後執行，請勿修改`;
            case "it_IT":
                return `Esegui dopo ${x} secondi, non modificare`;

            default:
                return `Execute after ${x} seconds, do not modify`;
        }
    }
    public get 全部打开() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "全部打开";
            case "es_ES":
                return "Abrir todo";
            case "fr_FR":
                return "Tout ouvrir";
            case "ja_JP":
                return "すべて開く";
            case "zh_CHT":
                return "全部打開";
            case "it_IT":
                return "Apri tutto";

            default:
                return "Open all";
        }
    }
    public get 自动隐藏() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "自动隐藏";
            case "es_ES":
                return "Ocultar automáticamente";
            case "fr_FR":
                return "Masquer automatiquement";
            case "ja_JP":
                return "自動非表示";
            case "zh_CHT":
                return "自動隱藏";
            case "it_IT":
                return "Nascondi automaticamente";

            default:
                return "Auto hide";
        }
    }
    public get 添加到原始块的链接() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "添加到原始块的链接";
            case "es_ES":
                return "Enlace a bloque original";
            case "fr_FR":
                return "Lien vers le bloc original";
            case "ja_JP":
                return "元のブロックへのリンク";
            case "zh_CHT":
                return "添加到原始塊的連結";
            case "it_IT":
                return "Collegamento al blocco originale";

            default:
                return "Link to original block";
        }
    }
    public get 添加到原始块的引用() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "添加到原始块的引用";
            case "es_ES":
                return "Referencia al bloque original";
            case "fr_FR":
                return "Référence au bloc original";
            case "ja_JP":
                return "元のブロックへの参照";
            case "zh_CHT":
                return "添加到原始塊的引用";
            case "it_IT":
                return "Riferimento al blocco originale";

            default:
                return "Reference to original block";
        }
    }
    public get 设为原始块() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "设为原始块";
            case "es_ES":
                return "Establecer como bloque original";
            case "fr_FR":
                return "Définir comme bloc original";
            case "ja_JP":
                return "元のブロックに設定";
            case "zh_CHT":
                return "設為原始塊";
            case "it_IT":
                return "Imposta come blocco originale";

            default:
                return "Set as Original Block";
        }
    }
    public get 全部删除() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "全部删除";
            case "es_ES":
                return "Eliminar todo";
            case "fr_FR":
                return "Tout supprimer";
            case "ja_JP":
                return "すべて削除";
            case "zh_CHT":
                return "全部刪除";
            case "it_IT":
                return "Elimina tutto";

            default:
                return "Delete All";
        }
    }
    public get 删除其他() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "删除其他";
            case "es_ES":
                return "Eliminar otros";
            case "fr_FR":
                return "Supprimer les autres";
            case "ja_JP":
                return "他を削除";
            case "zh_CHT":
                return "刪除其他";
            case "it_IT":
                return "Elimina altri";

            default:
                return "Delete Others";
        }
    }
    public get 同步失败() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "同步失败";
            case "es_ES":
                return "Fallo de sincronización";
            case "fr_FR":
                return "Échec de synchronisation";
            case "ja_JP":
                return "同期に失敗しました";
            case "zh_CHT":
                return "同步失敗";
            case "it_IT":
                return "Sincronizzazione fallita";

            default:
                return "Synchronization failed";
        }
    }
    public get 无复本块() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "无复本块";
            case "es_ES":
                return "Sin bloque de copia";
            case "fr_FR":
                return "Aucun bloc de copie";
            case "ja_JP":
                return "コピーブロックなし";
            case "zh_CHT":
                return "無複本塊";
            case "it_IT":
                return "Nessun blocco di copia";

            default:
                return "No copy block";
        }
    }
    public get 重置版本() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "重置版本";
            case "es_ES":
                return "Versión de reinicio";
            case "fr_FR":
                return "Version de réinitialisation";
            case "ja_JP":
                return "リセットバージョン";
            case "zh_CHT":
                return "重置版本";
            case "it_IT":
                return "Versione di ripristino";

            default:
                return "Reset Version";
        }
    }
    public get 打开块关系图() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "打开块关系图";
            case "es_ES":
                return "Abrir diagrama de bloques";
            case "fr_FR":
                return "Ouvrir le diagramme de blocs";
            case "ja_JP":
                return "ブロック関係図を開く";
            case "zh_CHT":
                return "打開塊關係圖";
            case "it_IT":
                return "Aprire il diagramma dei blocchi";

            default:
                return "Open block diagram";
        }
    }

 
    public get 批注(): string {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "批注";
            case "es_ES":
                return "Anotación"; // 西班牙语：批注
            case "fr_FR":
                return "Annotation"; // 法语：批注
            case "ja_JP":
                return "注釈"; // 日语：批注
            case "zh_CHT":
                return "註釋"; // 繁体中文：批注
            case "it_IT":
                return "Annotazione"; // 意大利语：批注

            default:
                return "Annotation"; // 英语：批注
        }
    }
    public get 包含正反链() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "包含正反链";
            case "es_ES":
                return "contiene enlaces directos e inversos";
            case "fr_FR":
                return "contient des liens directs et inverses";
            case "ja_JP":
                return "順方向と逆方向のリンクを含む";
            case "zh_CHT":
                return "包含正反鏈";
            case "it_IT":
                return "contiene sia collegamenti diretti che inversi";

            default:
                return "contains both forward and reverse links";
        }
    }
    public get 正引() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "正引";
            case "es_ES":
                return "forward link";
            case "fr_FR":
                return "forward link";
            case "ja_JP":
                return "forward link";
            case "zh_CHT":
                return "正引";
            case "it_IT":
                return "forward link";

            default:
                return "forward link";
        }
    }
    public get 反引() {
        // 补充缺失的语言
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "反引";
            case "es_ES":
                return "enlace inverso";
            case "fr_FR":
                return "lien inverse";
            case "ja_JP":
                return "逆リンク";
            case "zh_CHT":
                return "反引";
            case "it_IT":
                return "collegamento inverso";

            default:
                return "backref";
        }
    }
    public get 虚引() {
        // 补充缺失的语言
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "虚引";
            case "es_ES":
                return "enlace virtual";
            case "fr_FR":
                return "lien virtuel";
            case "ja_JP":
                return "仮想リンク";
            case "zh_CHT":
                return "虛引";
            case "it_IT":
                return "collegamento virtuale";

            default:
                return "virref";
        }
    }
    public get 高度() {
        // 补充缺失的语言
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "高度";
            case "es_ES":
                return "altura";
            case "fr_FR":
                return "hauteur";
            case "ja_JP":
                return "高さ";
            case "zh_CHT":
                return "高度";
            case "it_IT":
                return "altezza";

            default:
                return "height";
        }
    }
    public get 添加批注到日记() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "添加批注到日记";
            case "es_ES":
                return "Agregar anotación al diario";
            case "fr_FR":
                return "Ajouter une annotation au journal";
            case "ja_JP":
                return "日記に注釈を追加";
            case "zh_CHT":
                return "添加批注到日記";
            case "it_IT":
                return "Aggiungi annotazione al diario";

            default:
                return "Add annotation to journal";
        }
    }
    public get 添加批注到新文件() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "添加批注到新文件";
            case "es_ES":
                return "Agregar anotación a un nuevo archivo";
            case "fr_FR":
                return "Ajouter une annotation à un nouveau fichier";
            case "ja_JP":
                return "新しいファイルに注釈を追加";
            case "zh_CHT":
                return "添加批注到新檔案";
            case "it_IT":
                return "Aggiungi annotazione a un nuovo file";

            default:
                return "Add annotation to new file";
        }
    }
    public get 批注添加下划线() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "批注添加下划线";
            case "es_ES":
                return "Añadir subrayado a la anotación";
            case "fr_FR":
                return "Ajouter un soulignement à l'annotation";
            case "ja_JP":
                return "注釈に下線を追加";
            case "zh_CHT":
                return "批注添加下劃線";
            case "it_IT":
                return "Aggiungi sottolineatura all'annotazione";

            default:
                return "Add underline to annotation";
        }
    }
    public get 定位() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "定位";
            case "es_ES":
                return "ubicación";
            case "fr_FR":
                return "localisation";
            case "ja_JP":
                return "位置";
            case "zh_CHT":
                return "定位";
            case "it_IT":
                return "posizione";

            default:
                return "position";
        }
    }
    public get 引用已向上传递() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "引用已向上传递";
            case "es_ES":
                return "La referencia se ha pasado hacia arriba";
            case "fr_FR":
                return "La référence a été transmise vers le haut";
            case "ja_JP":
                return "参照が上に渡されました";
            case "zh_CHT":
                return "引用已向上傳遞";
            case "it_IT":
                return "Il riferimento è stato passato verso l'alto";

            default:
                return "Reference has been passed upwards";
        }
    }
    public get 显示ID() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "显示ID";
            case "es_ES":
                return "Mostrar ID";
            case "fr_FR":
                return "Afficher l'ID";
            case "ja_JP":
                return "IDを表示";
            case "zh_CHT":
                return "顯示ID";
            case "it_IT":
                return "Mostra ID";

            default:
                return "Show ID";
        }
    }
    public get 显示路径() {
        // 补充缺失的语言
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "显示路径";
            case "es_ES":
                return "Mostrar ruta";
            case "fr_FR":
                return "Afficher le chemin";
            case "ja_JP":
                return "パスを表示";
            case "zh_CHT":
                return "顯示路徑";
            case "it_IT":
                return "Mostra percorso";

            default:
                return "Show path";
        }
    }
    public get 向上传递引用到标题() {
        // 补充缺失的语言
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "向上传递引用到标题";
            case "es_ES":
                return "Pasar referencia hacia arriba al título";
            case "fr_FR":
                return "Transmettre la référence vers le titre";
            case "ja_JP":
                return "タイトルに参照を渡す";
            case "zh_CHT":
                return "向上傳遞引用到標題";
            case "it_IT":
                return "Passa il riferimento al titolo";

            default:
                return "Pass reference up to title";
        }
    }
    public get 向上传递引用到超级块() {
        // 补充缺失的语言
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "向上传递引用到超级块";
            case "es_ES":
                return "Pasar referencia hacia arriba al superbloque";
            case "fr_FR":
                return "Transmettre la référence vers le super bloc";
            case "ja_JP":
                return "スーパーブロックに参照を渡す";
            case "zh_CHT":
                return "向上傳遞引用到超級塊";
            case "it_IT":
                return "Passa il riferimento al superblocco";

            default:
                return "Pass reference up to superblock";
        }
    }
    public get 向上传递引用到引述块() {
        // 补充缺失的语言
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "向上传递引用到引述块";
            case "es_ES":
                return "Pasar referencia hacia arriba al bloque de cita";
            case "fr_FR":
                return "Transmettre la référence vers le bloc de citation";
            case "ja_JP":
                return "引用ブロックに参照を渡す";
            case "zh_CHT":
                return "向上傳遞引用到引述塊";
            case "it_IT":
                return "Passa il riferimento al blocco di citazione";

            default:
                return "Pass reference up to quote block";
        }
    }
    public get 复制为引用() {
        // 补充缺失的语言
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "复制为引用";
            case "es_ES":
                return "Copiar como cita";
            case "fr_FR":
                return "Copier comme citation";
            case "ja_JP":
                return "引用としてコピー";
            case "zh_CHT":
                return "複製為引用";
            case "it_IT":
                return "Copia come citazione";

            default:
                return "Copy as citation";
        }
    }
    public get 展开与折叠() {
        // 补充缺失的语言
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "展开与折叠";
            case "es_ES":
                return "Expandir y colapsar";
            case "fr_FR":
                return "Développer et réduire";
            case "ja_JP":
                return "展開と折りたたみ";
            case "zh_CHT":
                return "展開與折疊";
            case "it_IT":
                return "Espandi e comprimi";

            default:
                return "Expand and collapse";
        }
    }
    public get 将选择文字加入文档的别名() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "将选择文字加入文档的别名";
            case "es_ES":
                return "Alias para añadir texto seleccionado al documento";
            case "fr_FR":
                return "Alias pour ajouter le texte sélectionné au document";
            case "ja_JP":
                return "選択したテキストをドキュメントに追加するエイリアス";
            case "zh_CHT":
                return "將選擇文字加入文件的別名";
            case "it_IT":
                return "Alias per aggiungere il testo selezionato al documento";

            default:
                return "Alias to add selected text to document";
        }
    }
    public get 回到第一页() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "回到第一页";
            case "es_ES":
                return "Volver a la primera página";
            case "fr_FR":
                return "Retour à la première page";
            case "ja_JP":
                return "最初のページに戻る";
            case "zh_CHT":
                return "回到第一頁";
            case "it_IT":
                return "Torna alla prima pagina";

            default:
                return "Back to the first page";
        }
    }
    public get 保存查询条件() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "保存查询条件";
            case "es_ES":
                return "Guardar condiciones de búsqueda";
            case "fr_FR":
                return "Enregistrer les critères de recherche";
            case "ja_JP":
                return "検索条件を保存";
            case "zh_CHT":
                return "保存查詢條件";
            case "it_IT":
                return "Salva i criteri di ricerca";

            default:
                return "Save search conditions";
        }
    }
    public get 点击查询ctrl点击删除() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "点击查询，ctrl点击删除";
            case "es_ES":
                return "Clic para consultar, Ctrl + clic para eliminar";
            case "fr_FR":
                return "Cliquer pour rechercher, Ctrl + clic pour supprimer";
            case "ja_JP":
                return "クリックで検索、Ctrl + クリックで削除";
            case "zh_CHT":
                return "點擊查詢，Ctrl + 點擊刪除";
            case "it_IT":
                return "Clic per cercare, Ctrl + clic per eliminare";

            default:
                return "Click to search, Ctrl + click to delete";
        }
    }
    public get 添加空间ID() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "添加空间ID";
            case "es_ES":
                return "Añadir ID de espacio";
            case "fr_FR":
                return "Ajouter un ID d'espace";
            case "ja_JP":
                return "スペースIDを追加";
            case "zh_CHT":
                return "添加空間ID";
            case "it_IT":
                return "Aggiungi ID spazio";

            default:
                return "Add Space ID";
        }
    }

    public get 添加知识库ID() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "添加知识库ID";
            case "es_ES":
                return "Añadir ID de base de conocimientos";
            case "fr_FR":
                return "Ajouter un ID de base de connaissances";
            case "ja_JP":
                return "ナレッジベースIDを追加";
            case "zh_CHT":
                return "添加知識庫ID";
            case "it_IT":
                return "Aggiungi ID knowledge base";

            default:
                return "Add Knowledge Base ID";
        }
    }

    public get 添加令牌() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "添加令牌";
            case "es_ES":
                return "Añadir token";
            case "fr_FR":
                return "Ajouter un jeton";
            case "ja_JP":
                return "トークンを追加";
            case "zh_CHT":
                return "添加令牌";
            case "it_IT":
                return "Aggiungi token";

            default:
                return "Add Token";
        }
    }

    public get 上传当前文档以及所有子文档() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "上传当前文档以及所有子文档";
            case "es_ES":
                return "Subir el documento actual y todos los subdocumentos";
            case "fr_FR":
                return "Télécharger le document actuel et tous les sous-documents";
            case "ja_JP":
                return "現在のドキュメントとすべてのサブドキュメントをアップロード";
            case "zh_CHT":
                return "上傳當前文檔以及所有子文檔";
            case "it_IT":
                return "Carica il documento corrente e tutti i sottodocumenti";

            default:
                return "Upload current document and all subdocuments";
        }
    }
}
