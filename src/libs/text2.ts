import { TomatoI18nABC3 } from "./text3";

export abstract class TomatoI18nABC2 extends TomatoI18nABC3 {
    public get maxBkDocs最大展开的反链文件数() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "最大展开的反链文件数（一个文件里可能有多个反链）";
            case "es_ES":
                return "Número máximo de documentos de retroenlaces expandidos (un documento puede tener múltiples retroenlaces)";
            case "fr_FR":
                return "Nombre maximal de documents de liens retournés dépliés (un document peut contenir plusieurs liens retournés)";
            case "ja_JP":
                return "最大展開のバックリンクドキュメント数（1 つのドキュメントに複数のバックリンクがある場合があります）";
            case "zh_CHT":
                return "最大展開的反向鏈接文件數（一個文件中可能有多個反向鏈接）";

            default:
                return "Maximum number of expanded backlink documents (a document may have multiple backlinks)";
        }
    }
    public get mentionDocs最大展开的提及文件数() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "最大展开的提及文件数（一个文件里可能有多个提及）";
            case "es_ES":
                return "Número máximo de documentos de menciones expandidos (un documento puede tener múltiples menciones)";
            case "fr_FR":
                return "Nombre maximal de documents de mentions dépliés (un document peut contenir plusieurs mentions)";
            case "ja_JP":
                return "最大展開の言及ドキュメント数（1 つのドキュメントに複数の言及がある場合があります）";
            case "zh_CHT":
                return "最大展開的提及文件數（一個文件中可能有多個提及）";

            default:
                return "Maximum number of expanded mention documents (a document may have multiple mentions)";
        }
    }
    public get defaultBkDisabled底部反链默认关闭() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "底部反链默认关闭。需要右键菜单中单独为有需要的文档打开"
            case "es_ES":
                return "Enlace de retroceso inferior desactivado por defecto. Se necesita abrir individualmente para los documentos necesarios desde el menú del botón derecho"
            case "fr_FR":
                return "Le lien de retour inférieur est désactivé par défaut. Il est nécessaire d'ouvrir individuellement pour les documents nécessaires à partir du menu du bouton droit"
            case "ja_JP":
                return "下部のバックリンクはデフォルトで無効です。必要なドキュメントについては、右クリックメニューから個別に開く必要があります"
            case "zh_CHT":
                return "底部反鏈接默認關閉。需要右鍵菜單中單獨為有需要的文檔打開"

            default:
                return "Bottom backlink is off by default. You need to individually open it for necessary documents from the right-click menu"
        }
    }

    public get DisableDailyNote禁用底部反链() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "在DailyNote中，禁用底部反链";
            case "es_ES":
                return "En DailyNote, desactivar el enlace de retroceso en la parte inferior";
            case "fr_FR":
                return "Dans DailyNote, désactiver le lien de retour en bas";
            case "ja_JP":
                return "DailyNoteで、下部のバックリンクを無効にする";
            case "zh_CHT":
                return "在DailyNote中，禁用底部反鏈接";

            default:
                return "In DailyNote, disable the bottom backlink";
        }
    }

    public get enableBK启用禁用文档的底部反链() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "启用/禁用文档的底部反链";
            case "es_ES":
                return "Habilitar/deshabilitar el enlace de retroceso en la parte inferior del documento";
            case "fr_FR":
                return "Activer/désactiver le lien de retour en bas du document";
            case "ja_JP":
                return "ドキュメントの下部のバックリンクを有効/無効にする";
            case "zh_CHT":
                return "啟用/禁用文件底部的反向連結";

            default:
                return "Enable/Disable the backlink at the bottom of the document";
        }
    }

    public get hierarchical层级概念深林() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "层级概念深林（建议文档名类似：'AA | BB | CC'）";
            case "es_ES":
                return "Bosque de conceptos jerárquicos (se sugiere un nombre de documento similar a: 'AA | BB | CC')";
            case "fr_FR":
                return "Forêt de concepts hiérarchiques (nom de document suggéré : 'AA | BB | CC')";
            case "ja_JP":
                return "階層的な概念の森（ドキュメント名は 'AA | BB | CC' のようにすることを推奨）";
            case "zh_CHT":
                return "層級概念深林（建議文件名類似：'AA | BB | CC'）";

            default:
                return "Hierarchical Concept Forest (Suggested document name similar to: 'AA | BB | CC')";
        }
    }

    public get createdRef创建引用成功() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "创建引用成功";
            case "es_ES":
                return "Referencia creada con éxito";
            case "fr_FR":
                return "Référence créée avec succès";
            case "ja_JP":
                return "参照を正常に作成しました";
            case "zh_CHT":
                return "成功創建引用";

            default:
                return "Reference created successfully";
        }
    }

    public get createdEmb创建嵌入块成功() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "创建嵌入块成功";
            case "es_ES":
                return "Bloque incrustado creado con éxito";
            case "fr_FR":
                return "Bloc intégré créé avec succès";
            case "ja_JP":
                return "埋め込みブロックの作成に成功しました";
            case "zh_CHT":
                return "成功創建嵌入塊";

            default:
                return "Embedded block created successfully";
        }
    }

    public get copyBlock复制块成功() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "复制块成功";
            case "es_ES":
                return "Bloque copiado con éxito";
            case "fr_FR":
                return "Bloc copié avec succès";
            case "ja_JP":
                return "ブロックのコピーに成功しました";
            case "zh_CHT":
                return "成功複製塊";

            default:
                return "Block copied successfully";
        }
    }

    public get movedBlock移动块成功() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "移动块成功";
            case "es_ES":
                return "Bloque movido con éxito";
            case "fr_FR":
                return "Bloc déplacé avec succès";
            case "ja_JP":
                return "ブロックの移動に成功しました";
            case "zh_CHT":
                return "成功移動塊";

            default:
                return "Block moved successfully";
        }
    }

    public get foldRefBar收缩此双链栏() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "收缩此概念/引用栏";
            case "es_ES":
                return "Contraer esta barra de concepto/referencia";
            case "fr_FR":
                return "Réduire cette barre de concept/référence";
            case "ja_JP":
                return "このコンセプト/リファレンスバーを折りたたむ";
            case "zh_CHT":
                return "收縮此概念/引用欄";

            default:
                return "Collapse this Concept/Reference Bar"
        }
    }

    public get dailynote隐藏() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "隐藏所有dailynotes";
            case "es_ES":
                return "Ocultar todas las dailynotes";
            case "fr_FR":
                return "Masquer tous les dailynotes";
            case "ja_JP":
                return "すべてのdailynotesを非表示にする";
            case "zh_CHT":
                return "隱藏所有dailynotes";

            default:
                return "Hide all dailynotes"
        }
    }

    public get openConceptForest打开层级概念() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "打开层级概念（适用于，反链中有多个类似这样结构的引用 'AA | BB | CC'）";
            case "es_ES":
                return "Abrir concepto jerárquico (aplicable a, en los enlaces inversos con varias referencias de esta estructura 'AA | BB | CC')";
            case "fr_FR":
                return "Ouvrir le concept hiérarchique (applicable à, dans les liens inverses avec plusieurs références de cette structure 'AA | BB | CC')";
            case "ja_JP":
                return "階層的な概念を開く（反リンクにこのような構造の参照 'AA | BB | CC' が複数ある場合に適用）";
            case "zh_CHT":
                return "打開層級概念（適用於，反鏈中有多個類似這樣結構的引用 'AA | BB | CC'）";

            default:
                return "Open hierarchical concept (applicable to, in backlinks with multiple references of this structure 'AA | BB | CC')"
        }
    }

    public get 番茄工具箱配置() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return `番茄工具箱的配置`
            case "es_ES":
                return `Configuración de la caja de herramientas de tomate`
            case "fr_FR":
                return `Configuration de la boîte à outils de la tomate`
            case "ja_JP":
                return `トマトツールボックスの設定`
            case "zh_CHT":
                return `番茄工具箱的配置`

            default:
                return `Tomato toolbox configuration`
        }
    }
    public get 暂时隐藏本文档链接() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "暂时隐藏本文档链接";
            case "es_ES":
                return "ocultar temporalmente el enlace de este documento";
            case "fr_FR":
                return "masquer temporairement le lien de ce document";
            case "ja_JP":
                return "一時的にこのドキュメントのリンクを非表示にする";
            case "zh_CHT":
                return "暫時隱藏本文檔連結";

            default:
                return "temporarily hide the link of this document";
        }
    }
    public get 清空() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "清空";
            case "es_ES":
                return "vaciar";
            case "fr_FR":
                return "vider";
            case "ja_JP":
                return "クリア";
            case "zh_CHT":
                return "清空";

            default:
                return "clear";
        }
    }

    public get 点击查看搜索语法() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "点击查看：搜索语法";
            case "es_ES":
                return "haga clic para ver: sintaxis de búsqueda";
            case "fr_FR":
                return "cliquez pour voir : syntaxe de recherche";
            case "ja_JP":
                return "クリックして表示：検索構文";
            case "zh_CHT":
                return "點擊查看：搜索語法";

            default:
                return "click to view: search syntax";
        }
    }

    public get 搜索语法() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "搜索的语法";
            case "es_ES":
                return "sintaxis de búsqueda";
            case "fr_FR":
                return "syntaxe de recherche";
            case "ja_JP":
                return "検索の構文";
            case "zh_CHT":
                return "搜索的語法";

            default:
                return "search syntax";
        }
    }

    public get 移动到文档() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "移动内容到文档";
            case "es_ES":
                return "mover contenido a documento";
            case "fr_FR":
                return "déplacer le contenu vers le document";
            case "ja_JP":
                return "内容をドキュメントに移動";
            case "zh_CHT":
                return "移動內容到文檔";

            default:
                return "move content to document";
        }
    }

    public get 复制到文档() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "复制内容到文档";
            case "es_ES":
                return "copiar contenido a documento";
            case "fr_FR":
                return "copier le contenu vers le document";
            case "ja_JP":
                return "内容をドキュメントにコピー";
            case "zh_CHT":
                return "複製內容到文檔";

            default:
                return "copy content to document";
        }
    }

    public get 嵌入到文档() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "在文档中插嵌入块";
            case "es_ES":
                return "insertar bloque incrustado en el documento";
            case "fr_FR":
                return "insérer un bloc intégré dans le document";
            case "ja_JP":
                return "ドキュメントに埋め込みブロックを挿入";
            case "zh_CHT":
                return "在文檔中插嵌入塊";

            default:
                return "insert embedded block in document";
        }
    }

    public get 引用到文档() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "在文档中插入引用";
            case "es_ES":
                return "insertar referencia en el documento";
            case "fr_FR":
                return "insérer une référence dans le document";
            case "ja_JP":
                return "ドキュメントに参照を挿入";
            case "zh_CHT":
                return "在文檔中插入引用";

            default:
                return "insert reference in document";
        }
    }
    public get 恢复到原来的位置() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "恢复到原来的位置";
            case "es_ES":
                return "restaurar a la posición original";
            case "fr_FR":
                return "restaurer à la position d'origine";
            case "ja_JP":
                return "元の位置に復元";
            case "zh_CHT":
                return "恢復到原來的位置";

            default:
                return "restore to original position";
        }
    }
    public get 永久置于底部(): string {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "永久置于底部";
            case "es_ES":
                return "Permanecer en la parte inferior";
            case "fr_FR":
                return "Toujours en bas";
            case "ja_JP":
                return "常に下部に配置";
            case "zh_CHT":
                return "永久置於底部";
            case "it_IT":
                return "Mantieni sempre in basso";

            default:
                return "Always stick to the bottom";
        }
    }
    public get 不刷新() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "不刷新";
            case "es_ES":
                return "no refrescar";
            case "fr_FR":
                return "ne pas rafraîchir";
            case "ja_JP":
                return "更新しない";
            case "zh_CHT":
                return "不刷新";

            default:
                return "do not refresh";
        }
    }

    public get 刷新中() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "刷新中";
            case "es_ES":
                return "actualizando";
            case "fr_FR":
                return "en cours de rafraîchissement";
            case "ja_JP":
                return "更新中";
            case "zh_CHT":
                return "刷新中";

            default:
                return "refreshing";
        }
    }

    public get 滑动到顶部() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "滑动到顶部";
            case "es_ES":
                return "deslizar hasta la parte superior";
            case "fr_FR":
                return "glisser vers le haut";
            case "ja_JP":
                return "一番上までスライド";
            case "zh_CHT":
                return "滑動到頂部";

            default:
                return "slide to top";
        }
    }

    public get 人工智能() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "人工智能";
            case "es_ES":
                return "inteligencia artificial";
            case "fr_FR":
                return "intelligence artificielle";
            case "ja_JP":
                return "人工知能";
            case "zh_CHT":
                return "人工智能";

            default:
                return "artificial intelligence";
        }
    }



    public get 没有失效闪卡() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "没有失效闪卡";
            case "es_ES":
                return "No hay tarjetas flash inactivas";
            case "fr_FR":
                return "Aucune carte flash invalide";
            case "ja_JP":
                return "無効なフラッシュカードはありません";
            case "zh_CHT":
                return "沒有失效閃卡";

            default:
                return "No invalid flash cards";
        }
    }

    public get 复习闪卡时才能使用此功能() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "复习闪卡时才能使用此功能";
            case "es_ES":
                return "Esta función solo está disponible al revisar tarjetas de repaso";
            case "fr_FR":
                return "Cette fonction est uniquement disponible lors de la révision des cartes à flash";
            case "ja_JP":
                return "復習カードを使用するときにのみこの機能を使用できます";
            case "zh_CHT":
                return "複習閃卡時才能使用此功能";

            default:
                return "This feature is only available when reviewing flashcards";
        }
    }

    public get 请确认原文内容() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "请确认原文内容";
            case "es_ES":
                return "Por favor, confirma el contenido original";
            case "fr_FR":
                return "Veuillez confirmer le contenu original";
            case "ja_JP":
                return "元の内容を確認してください";
            case "zh_CHT":
                return "請確認原文內容";

            default:
                return "Please confirm the original content";
        }
    }

    public get 删除内容块() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "删除内容块";
            case "es_ES":
                return "Eliminar Bloque de Contenido";
            case "fr_FR":
                return "Supprimer le Bloc de Contenu";
            case "ja_JP":
                return "コンテンツブロックを削除";
            case "zh_CHT":
                return "刪除內容塊";

            default:
                return "Delete Content Block";
        }
    }

    public get 取消制卡() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "取消制卡";
            case "es_ES":
                return "Cancelar la fabricación de tarjetas"; // Spanish
            case "fr_FR":
                return "Annuler la fabrication de cartes"; // French
            case "ja_JP":
                return "カード製造をキャンセル"; // Japanese
            case "zh_CHT":
                return "取消制卡"; // Traditional Chinese

            default:
                return "Cancel card manufacturing"; // English
        }
    }

    public get 定位闪卡() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "定位闪卡";
            case "es_ES":
                return "tarjeta de ubicación"; // Spanish (Spain)
            case "fr_FR":
                return "carte de localisation"; // French (France)
            case "ja_JP":
                return "位置指定カード"; // Japanese (Japan)
            case "zh_CHT":
                return "定位閃卡"; // Traditional Chinese (Taiwan)

            default:
                return "location flashcard"; // English (United States)
        }
    }
    public get 数值大的优先复习() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "数值大的优先复习";
            case "es_ES":
                return "Repasar prioridad de valores grandes";
            case "fr_FR":
                return "Réviser en priorité les valeurs élevées";
            case "ja_JP":
                return "大きな値から優先的に復習する";
            case "zh_CHT":
                return "數值大的優先複習";

            default:
                return "Review with higher values first";
        }
    }

    public get 使用鼠标滚轮来调整() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "使用鼠标滚轮来调整";
            case "es_ES":
                return "Usar la rueda del ratón para ajustar";
            case "fr_FR":
                return "Utiliser la molette de la souris pour ajuster";
            case "ja_JP":
                return "マウスのホイールを使用して調整する";
            case "zh_CHT":
                return "使用滑鼠滾輪來調整";

            default:
                return "Use the mouse wheel to adjust";
        }
    }

    public 推迟x小时(hours: number) {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return `推迟${hours.toFixed(1)}小时`;
            case "es_ES":
                return `Retrasar ${hours.toFixed(1)} horas`;
            case "fr_FR":
                return `Retarder ${hours.toFixed(1)} heures`;
            case "ja_JP":
                return `${hours.toFixed(1)}時間遅れる`;
            case "zh_CHT":
                return `推遲${hours.toFixed(1)}小時`;

            default:
                return `Delay by ${hours.toFixed(1)} hours`;
        }
    }

    public 推迟余下闪卡x小时(hours: number) {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return `推迟余下闪卡${hours.toFixed(1)}小时`;
            case "es_ES":
                return `Retrasar el resto de tarjetas flash por ${hours.toFixed(1)} horas`;
            case "fr_FR":
                return `Retarder le reste des cartes flash de ${hours.toFixed(1)} heures`;
            case "ja_JP":
                return `残りのフラッシュカードを${hours.toFixed(1)}時間遅らせる`;
            case "zh_CHT":
                return `推遲剩餘閃卡${hours.toFixed(1)}小時`;

            default:
                return `Postpone the rest of the flashcards for ${hours.toFixed(1)} hours`;
        }
    }

    public get 没处理过的闪卡都被推迟() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "没处理过的闪卡都被推迟";
            case "es_ES":
                return "Las tarjetas flash no procesadas se retrasan";
            case "fr_FR":
                return "Les flashcards non traitées sont reportées";
            case "ja_JP":
                return "未処理のフラッシュカードは延期されます";
            case "zh_CHT":
                return "未處理的閃卡都被推遲";

            default:
                return "Unprocessed flashcards are postponed";
        }
    }

    public get 正在确认无效闪卡请耐心等待() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "正在确认无效闪卡，请耐心等待……";
            case "es_ES":
                return "Confirmando tarjeta flash inválida, por favor espere pacientemente...";
            case "fr_FR":
                return "En cours de confirmation de carte flash invalide, veuillez patienter...";
            case "ja_JP":
                return "無効なフラッシュカードを確認中です。お待ちください...";
            case "zh_CHT":
                return "正在確認無效的閃卡，請耐心等待...";

            default:
                return "Confirming invalid flashcard, please wait...";
        }
    }

    public get 闪卡优先级() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "闪卡优先级";
            case "es_ES":
                return "Prioridad de la tarjeta relámpago";
            case "fr_FR":
                return "Priorité de la carte flash";
            case "ja_JP":
                return "カード優先度";
            case "zh_CHT":
                return "閃卡優先級";
            case "it_IT":
                return "Priorità della scheda flash";

            default:
                return "Flashcard Priority";
        }
    }

    public get 点击修改优先级() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "点击修改优先级";
            case "es_ES":
                return "Haga clic para modificar la prioridad";
            case "fr_FR":
                return "Cliquez pour modifier la priorité";
            case "ja_JP":
                return "クリックして優先度を変更する";
            case "zh_CHT":
                return "點擊修改優先級";

            default:
                return "Click to Modify Priority";
        }
    }

    public get 推迟与取消推迟() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "推迟/取消推迟";
            case "es_ES":
                return "Diferir/Cancelar diferimiento";
            case "fr_FR":
                return "Reportez-vous/Annuler le report";
            case "ja_JP":
                return "延期/延期をキャンセル";
            case "zh_CHT":
                return "延期/取消延期";

            default:
                return "Postpone/Cancel Postpone";
        }
    }

    public get 拖动闪卡优先级() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "拖动闪卡优先级";
            case "es_ES":
                return "Prioridad de arrastrar tarjetas de destello";
            case "fr_FR":
                return "Priorité de glissement de la carte flash";
            case "ja_JP":
                return "フラッシュカードのドラッグ優先度";
            case "zh_CHT":
                return "拖動閃卡優先級";

            default:
                return "Drag Flashcard Priority";
        }
    }

    public get 恢复所有暂停的闪卡() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "恢复所有暂停的闪卡";
            case "es_ES":
                return "Restaurar todos los flashcards pausados";
            case "fr_FR":
                return "Restaurer toutes les flashcards en pause";
            case "ja_JP":
                return "一時停止したフラッシュカードをすべて再開する";
            case "zh_CHT":
                return "恢復所有暫停的閃卡";

            default:
                return "Resume all paused flashcards";
        }
    }

    public get 推迟当前所有未复习完成的闪卡() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "推迟当前所有未复习完成的闪卡";
            case "es_ES":
                return "Aplazar todas las tarjetas flash no revisadas actualmente";
            case "fr_FR":
                return "Repousser toutes les cartes flash non revues actuellement";
            case "ja_JP":
                return "現在の未復習完了のフラッシュカードを延期する";
            case "zh_CHT":
                return "推遲目前所有未複習完成的閃卡";

            default:
                return "Postpone all unreviewed flashcards currently";
        }
    }

    public get 为闪卡设置优先级() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "为闪卡设置优先级";
            case "es_ES":
                return "Establecer prioridad para la tarjeta flash";
            case "fr_FR":
                return "Définir la priorité de la carte flash";
            case "ja_JP":
                return "フラッシュカードの優先度を設定する";
            case "zh_CHT":
                return "為閃卡設定優先級";

            default:
                return "Set Priority for Flashcard";
        }
    }

    public get 恢复闪卡() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "恢复闪卡";
            case "es_ES":
                return "Restaurar tarjeta flash";
            case "fr_FR":
                return "Restaurer la carte flash";
            case "ja_JP":
                return "フラッシュカードを復元";
            case "zh_CHT":
                return "恢復閃卡";

            default:
                return "Restore Flashcard";
        }
    }

    public get 你还没秘钥插件无法为您创建本地快照() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "你还没秘钥，插件无法为您创建本地快照。请先到【设置 - 关于 - 数据仓库密钥】中创建秘钥";
            case "es_ES":
                return "Aún no tienes una clave, el complemento no puede crear una instantánea local para ti. Por favor, crea una clave en [Configuración - Acerca de - Clave de repositorio de datos]";
            case "fr_FR":
                return "Vous n'avez pas encore de clé, le plugin ne peut pas créer une capture instantanée locale pour vous. Veuillez créer une clé dans [Paramètres - À propos - Clé du dépôt de données]";
            case "ja_JP":
                return "まだキーがありません。プラグインはローカルスナップショットを作成できません。[設定 - 詳細 - データリポジトリキー]でキーを作成してください";
            case "zh_CHT":
                return "你還沒秘鑰，插件無法為您創建本地快照。請先到【設置 - 關於 - 數據倉庫密鑰】中創建秘鑰";

            default:
                return "You do not have a key yet, the plugin cannot create a local snapshot for you. Please create a key in [Settings - About - Data Repository Key]";
        }
    }



}
