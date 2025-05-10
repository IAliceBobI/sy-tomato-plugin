import { TomatoI18nABC9 } from "./text9";

export abstract class TomatoI18nABC8 extends TomatoI18nABC9 {

    public get 添加AI应用() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "添加AI应用，配置刚加上的知识库，最后发布，得到应用ID";
            case "es_ES":
                return "Agregar aplicación de IA, configurar la base de conocimientos recién agregada, publicar y obtener el ID de la aplicación";
            case "fr_FR":
                return "Ajouter une application AI, configurer la base de connaissances nouvellement ajoutée, publier et obtenir l'ID de l'application";
            case "ja_JP":
                return "AIアプリケーションを追加し、新しく追加された知識ベースを設定し、最後に公開してアプリケーションIDを取得";
            case "zh_CHT":
                return "添加AI應用，配置剛加上的知識庫，最後發布，得到應用ID";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Add AI Application, Configure the Recently Added Knowledge Base, Publish, and Get Application ID";
        }
    }

    public get 更新所有文档成功() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "更新所有文档成功";
            case "es_ES":
                return "Actualización exitosa de todos los documentos";
            case "fr_FR":
                return "Mise à jour réussie de tous les documents";
            case "ja_JP":
                return "すべてのドキュメントの更新に成功";
            case "zh_CHT":
                return "更新所有文檔成功";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Successfully Updated All Documents";
        }
    }

    public get 删除多余的() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "删除多余的";
            case "es_ES":
                return "Eliminar lo sobrante";
            case "fr_FR":
                return "Supprimer le superflu";
            case "ja_JP":
                return "余分なものを削除";
            case "zh_CHT":
                return "刪除多餘的";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Delete Excess";
        }
    }
    public get 清理完成() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "清理完成";
            case "es_ES":
                return "Limpieza completada";
            case "fr_FR":
                return "Nettoyage terminé";
            case "ja_JP":
                return "クリーンアップ完了";
            case "zh_CHT":
                return "清理完成";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Cleanup completed";
        }
    }

    public get 删除重复的() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "删除重复的";
            case "es_ES":
                return "Eliminar duplicados";
            case "fr_FR":
                return "Supprimer les doublons";
            case "ja_JP":
                return "重複を削除";
            case "zh_CHT":
                return "刪除重複的";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Delete duplicates";
        }
    }

    public get 向知识库提问() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "向知识库提问";
            case "es_ES":
                return "Preguntar a la base de conocimientos";
            case "fr_FR":
                return "Poser une question à la base de connaissances";
            case "ja_JP":
                return "知識ベースに質問する";
            case "zh_CHT":
                return "向知識庫提問";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Ask the knowledge base";
        }
    }

    public get 向知识库提问stream() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "向知识库提问（流式）";
            case "es_ES":
                return "Preguntar a la base de conocimientos (stream)";
            case "fr_FR":
                return "Poser une question à la base de connaissances (stream)";
            case "ja_JP":
                return "知識ベースに質問する（ストリーム）";
            case "zh_CHT":
                return "向知識庫提問（流式）";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Ask the knowledge base (stream)";
        }
    }

    public get 清理百度千帆多余文件() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "清理百度千帆多余文件";
            case "es_ES":
                return "Limpiar archivos innecesarios de Baidu Qianfan";
            case "fr_FR":
                return "Nettoyer les fichiers superflus de Baidu Qianfan";
            case "ja_JP":
                return "百度千帆の不要なファイルをクリーンアップ";
            case "zh_CHT":
                return "清理百度千帆多餘文件";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Clean up unnecessary files from Baidu Qianfan";
        }
    }

    public get 打开知识库() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "打开知识库";
            case "es_ES":
                return "Abrir base de conocimientos";
            case "fr_FR":
                return "Ouvrir la base de connaissances";
            case "ja_JP":
                return "知識ベースを開く";
            case "zh_CHT":
                return "打開知識庫";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Open knowledge base";
        }
    }
    public get 上传当前文档以及所有子文档到百度千帆() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "上传当前文档以及所有子文档到百度千帆";
            case "es_ES":
                return "Subir el documento actual y todos los subdocumentos a Baidu Qianfan";
            case "fr_FR":
                return "Télécharger le document actuel et tous les sous-documents sur Baidu Qianfan";
            case "ja_JP":
                return "現在のドキュメントとすべてのサブドキュメントを百度千帆にアップロード";
            case "zh_CHT":
                return "上傳當前文件及所有子文件至百度千帆";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Upload the current document and all sub-documents to Baidu Qianfan";
        }
    }
    public get 在检索问答时() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "在检索问答时，系统通过检索知识点召回对应的切片。开启知识增强，会调用大模型抽取更加丰富的知识点，增加切片的召回率。开启后，会增加文档的处理时长和资源消耗。";
            case "es_ES":
                return "Al buscar respuestas, el sistema recupera las rebanadas correspondientes mediante la búsqueda de conocimientos. Al activar el enriquecimiento del conocimiento, se llama a un modelo grande para extraer conocimientos más ricos, aumentando la tasa de recuperación de las rebanadas. Después de activarlo, aumentará la duración del procesamiento del documento y el consumo de recursos.";
            case "fr_FR":
                return "Lors de la recherche de réponses, le système récupère les tranches correspondantes en recherchant des connaissances. En activant l'enrichissement des connaissances, un grand modèle est appelé pour extraire des connaissances plus riches, augmentant ainsi le taux de récupération des tranches. Après l'avoir activé, cela augmentera la durée de traitement du document et la consommation de ressources.";
            case "ja_JP":
                return "回答を検索する際、システムは知識を検索して対応するスライスを呼び出します。知識の強化を有効にすると、大規模なモデルを呼び出してより豊富な知識を抽出し、スライスの呼び出し率を向上させます。有効にすると、ドキュメントの処理時間とリソース消費が増加します。";
            case "zh_CHT":
                return "在檢索問答時，系統通過檢索知識點召回對應的切片。開啟知識增強，會調用大模型抽取更加豐富的知識點，增加切片的召回率。開啟後，會增加文檔的處理時長和資源消耗。";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "When retrieving answers, the system retrieves the corresponding slices by searching for knowledge points. By enabling knowledge enhancement, a large model is called to extract more rich knowledge points, increasing the recall rate of slices. After enabling, it will increase the processing time and resource consumption of documents.";
        }
    }
    public get 上传当前文档以及所有子文档到百度千帆Enhance() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "上传当前文档以及所有子文档到百度千帆（知识增强）";
            case "es_ES":
                return "Subir el documento actual y todos los subdocumentos a Baidu Qianfan (Mejora del Conocimiento)";
            case "fr_FR":
                return "Télécharger le document actuel et tous les sous-documents vers Baidu Qianfan (Amélioration des Connaissances)";
            case "ja_JP":
                return "現在のドキュメントとすべてのサブドキュメントを百度千帆（知識強化）にアップロードする";
            case "zh_CHT":
                return "上傳當前文件及所有子文件到百度千帆（知識增強）";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Upload the current document and all sub-documents to Baidu Qianfan (Knowledge Enhance)";
        }
    }
    public get 上传当前文档Enchance() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "上传当前文档（知识增强）";
            case "es_ES":
                return "Subir documento actual (mejora de conocimiento)";
            case "fr_FR":
                return "Télécharger le document actuel (amélioration des connaissances)";
            case "ja_JP":
                return "現在のドキュメントをアップロード（知識強化）";
            case "zh_CHT":
                return "上傳當前文檔（知識增強）";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Upload current document (knowledge enhancement)";
        }
    }
    public get 上传当前文档() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "上传当前文档";
            case "es_ES":
                return "Subir documento actual";
            case "fr_FR":
                return "Télécharger le document actuel";
            case "ja_JP":
                return "現在のドキュメントをアップロード";
            case "zh_CHT":
                return "上傳當前文檔";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Upload current document";
        }
    }
    public get 从百度千帆删除当前文件() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "从百度千帆删除当前文件";
            case "es_ES":
                return "Eliminar el archivo actual de Baidu Qianfan";
            case "fr_FR":
                return "Supprimer le fichier actuel de Baidu Qianfan";
            case "ja_JP":
                return "百度千帆から現在のファイルを削除";
            case "zh_CHT":
                return "從百度千帆刪除當前文件";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Delete current file from Baidu Qianfan";
        }
    }
    public get 从百度千帆删除当前文件以及子文件() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "从百度千帆删除当前文件以及子文件";
            case "es_ES":
                return "Eliminar el archivo actual y sus subarchivos de Baidu Qianfan";
            case "fr_FR":
                return "Supprimer le fichier actuel et ses sous-fichiers de Baidu Qianfan";
            case "ja_JP":
                return "百度千帆から現在のファイルとサブファイルを削除";
            case "zh_CHT":
                return "從百度千帆刪除當前文件以及子文件";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Delete current file and subfiles from Baidu Qianfan";
        }
    }
    public get 移动到DailyNote时总是移动到底部() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "移动、复制到DailyNote时总是在底部";
            case "es_ES":
                return "Mover o copiar a DailyNote siempre al final";
            case "fr_FR":
                return "Déplacer ou copier vers DailyNote toujours en bas";
            case "ja_JP":
                return "DailyNoteに移動またはコピーするときは常に最後に";
            case "zh_CHT":
                return "移動、複製到DailyNote時總是在底部";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Move or copy to DailyNote always at the bottom";
        }
    }
    public get 插入阅读点时记录当前所有打开的页签() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "插入阅读点时，记录当前所有打开的页签";
            case "es_ES":
                return "Al insertar un punto de lectura, registrar todas las pestañas abiertas actualmente";
            case "fr_FR":
                return "Lors de l'insertion d'un point de lecture, enregistrer toutes les onglets ouverts actuellement";
            case "ja_JP":
                return "読書ポイントを挿入するとき、現在開いているすべてのタブを記録する";
            case "zh_CHT":
                return "插入閱讀點時，記錄當前所有打開的頁籤";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "When inserting a reading point, record all currently open tabs";
        }
    }
    public get 鼠标悬浮显示闪卡挖空的内容() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "鼠标悬浮时，显示闪卡被挖空的内容";
            case "es_ES":
                return "Mostrar el contenido oculto de la tarjeta flash al pasar el ratón por encima";
            case "fr_FR":
                return "Afficher le contenu masqué de la carte mémoire lors du survol de la souris";
            case "ja_JP":
                return "マウスオーバー時に、カードの隠された内容を表示する";
            case "zh_CHT":
                return "鼠標懸浮時，顯示閃卡被挖空的内容";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Show the cloze content of the flashcard on mouse hover";
        }
    }

    public get 收集当前文档与子文档所有的未完成任务() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "收集当前文档与子文档所有的未完成任务";
            case "es_ES":
                return "Recopilar todas las tareas pendientes del documento actual y sus subdocumentos";
            case "fr_FR":
                return "Collecter toutes les tâches incomplètes du document actuel et de ses sous-documents";
            case "ja_JP":
                return "現在のドキュメントとそのサブドキュメントのすべての未完了タスクを収集する";
            case "zh_CHT":
                return "收集當前文檔與子文檔所有的未完成任務";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Collect all incomplete tasks in the current document and its subdocuments";
        }
    }

    public get 列出当前文档与子文档中没被引用的文档() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "列出当前文档与子文档中，没被引用的文档";
            case "es_ES":
                return "Listar los documentos no referenciados en el documento actual y sus subdocumentos";
            case "fr_FR":
                return "Lister les documents non référencés dans le document actuel et ses sous-documents";
            case "ja_JP":
                return "現在のドキュメントとそのサブドキュメントの中で、参照されていないドキュメントをリストアップする";
            case "zh_CHT":
                return "列出當前文檔與子文檔中，沒被引用的文檔";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "List documents in the current document and its subdocuments that are not referenced";
        }
    }
    public get 定位所有引用Menu(): string {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "打开(虚拟)引用或选中内容";
            case "es_ES":
                return "Abrir (virtual) referencias o contenido seleccionado";
            case "fr_FR":
                return "Ouvrir (virtuel) références ou contenu sélectionné";
            case "ja_JP":
                return "（仮想）参照または選択されたコンテンツを開く";
            case "zh_CHT":
                return "打開(虛擬)引用或選中內容";
            case "it_IT":
                return "Apri (virtuale) riferimenti o contenuto selezionato";
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Open (virtual) references or selected content";
        }
    }
    public get 定位所有引用() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "快捷键与右键菜单，可定位指定块的反链，以及虚拟正链";
            case "es_ES":
                return "Atajos de teclado y menú contextual para localizar las contrapartes de un bloque específico, así como las contrapartes virtuales positivas";
            case "fr_FR":
                return "Raccourcis clavier et menu contextuel pour localiser les contreparties d'un bloc spécifique, ainsi que les contreparties virtuelles positives";
            case "ja_JP":
                return "ショートカットキーと右クリックメニューで、指定ブロックの逆リンクと仮想正リンクを特定できます";
            case "zh_CHT":
                return "快捷鍵與右鍵選單，可定位指定塊的反鏈，以及虛擬正鏈";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Keyboard shortcuts and context menu to locate the backlinks of a specified block, as well as virtual forward links";
        }
    }
    public get 点击引用数打开所有引用() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "点击引用数，可以定位所有引用";
            case "es_ES":
                return "Haga clic en el número de citas para localizar todas las citas";
            case "fr_FR":
                return "Cliquez sur le nombre de citations pour localiser toutes les citations";
            case "ja_JP":
                return "引用数をクリックすると、すべての引用を見つけることができます";
            case "zh_CHT":
                return "點擊引用數，可以定位所有引用";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Click on the citation count to locate all citations";
        }
    }
    public get 背景图透明度() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "背景图透明度，0到1之间。";
            case "es_ES":
                return "Opacidad de la imagen de fondo, entre 0 y 1.";
            case "fr_FR":
                return "Opacité de l'image de fond, entre 0 et 1.";
            case "ja_JP":
                return "背景画像の透明度、0から1の間。";
            case "zh_CHT":
                return "背景圖透明度，0到1之間。";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Background image opacity, between 0 and 1.";
        }
    }
    public get 创建文件时制卡() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "创建文件时制卡";
            case "es_ES":
                return "Crear tarjeta al generar archivo";
            case "fr_FR":
                return "Créer une carte lors de la création de fichier";
            case "ja_JP":
                return "ファイル作成時のカード作成";
            case "zh_CHT":
                return "建立檔案時製卡";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Create card when creating file";
        }
    }
    public get 快速笔记() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "快速笔记";
            case "es_ES":
                return "Notas rápidas";
            case "fr_FR":
                return "Notes rapides";
            case "ja_JP":
                return "クイックノート";
            case "zh_CHT":
                return "快速筆記";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Quick notes";
        }
    }

  
    public get 给链接加文字(): string {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "给链接加文字";
            case "es_ES":
                return "Añadir texto al enlace";
            case "fr_FR":
                return "Ajouter du texte au lien";
            case "ja_JP":
                return "リンクにテキストを追加";
            case "zh_CHT":
                return "給連結加文字";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Add text to link";
        }
    }
    public get 列数量留空为自动计算() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "列数量，留空为自动计算";
            case "es_ES":
                return "Número de columnas, dejar en blanco para cálculo automático";
            case "fr_FR":
                return "Nombre de colonnes, laisser vide pour calcul automatique";
            case "ja_JP":
                return "列数、空白の場合は自動計算";
            case "zh_CHT":
                return "列數量，留空為自動計算";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Number of columns, leave blank for automatic calculation";
        }
    }
    public get 复制文档为标准Markdown() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "复制文档为标准Markdown到剪贴板";
            case "es_ES":
                return "Copiar documento como Markdown estándar al portapapeles";
            case "fr_FR":
                return "Copier le document en Markdown standard dans le presse-papiers";
            case "ja_JP":
                return "標準Markdownとしてドキュメントをクリップボードにコピー";
            case "zh_CHT":
                return "複製文件為標準Markdown到剪貼簿";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Copy document as standard Markdown to clipboard";
        }
    }
    public get 修复双向链接() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "修复双向链接";
            case "es_ES":
                return "Reparar enlaces bidireccionales";
            case "fr_FR":
                return "Réparer les liens bidirectionnels";
            case "ja_JP":
                return "双方向リンクを修正";
            case "zh_CHT":
                return "修復雙向連結";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Fix bidirectional links";
        }
    }
    public get 永久显示文档右侧的HomeEnd图标() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "永久显示文档右侧的Home,End图标。";
            case "es_ES":
                return "Mostrar permanentemente los iconos Home, End en el lado derecho del documento.";
            case "fr_FR":
                return "Afficher en permanence les icônes Home, End à droite du document.";
            case "ja_JP":
                return "ドキュメントの右側にHome,Endアイコンを常に表示します。";
            case "zh_CHT":
                return "永久顯示文件右側的Home,End圖標。";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Permanently display Home, End icons on the right side of the document.";
        }
    }
    public get 简单复制到dailynote(): string {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "简单复制到 dailynote";
            case "es_ES":
                return "Copiar simplemente a dailynote";
            case "fr_FR":
                return "Copier simplement dans dailynote";
            case "ja_JP":
                return "dailynoteに簡単にコピー";
            case "zh_CHT":
                return "簡單複製到 dailynote";
            case "it_IT":
                return "Copia semplicemente in dailynote";
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Simply copy to dailynote";
        }
    }
    public get 复制到dailynote() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "复制到 dailynote";
            case "es_ES":
                return "Copiar a dailynote";
            case "fr_FR":
                return "Copier dans dailynote";
            case "ja_JP":
                return "dailynoteにコピー";
            case "zh_CHT":
                return "複製到 dailynote";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Copy to dailynote";
        }
    }
    public get 复制到dailynote使用的锚文本() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "复制到dailynote使用的锚文本";
            case "es_ES":
                return "Texto de anclaje para copiar a la nota diaria";
            case "fr_FR":
                return "Texte d'ancrage à copier dans la note quotidienne";
            case "ja_JP":
                return "dailynoteにコピーするアンカーテキスト";
            case "zh_CHT":
                return "複製到dailynote使用的錨文本";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Anchor text to copy to daily note";
        }
    }
    public get 复制的内容显示原文的路径() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "复制的内容显示原文的路径";
            case "es_ES":
                return "Ruta del contenido copiado muestra el original";
            case "fr_FR":
                return "Chemin du contenu copié affiche l'original";
            case "ja_JP":
                return "コピーした内容が原文のパスを表示";
            case "zh_CHT":
                return "複製的內容顯示原文的路徑";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Copied content shows original path";
        }
    }

    public get 改变原文的背景() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "改变原文的背景";
            case "es_ES":
                return "Cambiar el fondo del original";
            case "fr_FR":
                return "Changer l'arrière-plan de l'original";
            case "ja_JP":
                return "原文の背景を変更";
            case "zh_CHT":
                return "改變原文的背景";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Change the background of the original text";
        }
    }

    public get 在原文中同时插入阅读点() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "在原文中同时插入阅读点";
            case "es_ES":
                return "Insertar puntos de lectura simultáneamente en el original";
            case "fr_FR":
                return "Insérer des points de lecture simultanément dans l'original";
            case "ja_JP":
                return "原文中に同時に読書ポイントを挿入";
            case "zh_CHT":
                return "在原文中同時插入閱讀點";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Insert reading points simultaneously in the original text";
        }
    }
    public get 使用引用来回溯() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "使用引用来回溯，否则用超链接";
            case "es_ES":
                return "Usar referencias para retroceder, de lo contrario usar hipervínculos";
            case "fr_FR":
                return "Utiliser des références pour revenir en arrière, sinon utiliser des hyperliens";
            case "ja_JP":
                return "参照を使用して戻る、それ以外の場合はハイパーリンクを使用する";
            case "zh_CHT":
                return "使用引用來回溯，否則用超連結";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Use references to backtrack, otherwise use hyperlinks";
        }
    }
    public get 添加批注() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "添加批注";
            case "es_ES":
                return "Agregar anotación";
            case "fr_FR":
                return "Ajouter une annotation";
            case "ja_JP":
                return "注釈を追加";
            case "zh_CHT":
                return "添加批註";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Add annotation";
        }
    }
    public get 删除块以及闪卡() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "删除块以及闪卡（可删除文档）";
            case "es_ES":
                return "Eliminar bloque y tarjetas flash (puede eliminar documentos)";
            case "fr_FR":
                return "Supprimer le bloc et les fiches mémoire (peut supprimer les documents)";
            case "ja_JP":
                return "ブロックとフラッシュカードを削除（ドキュメントを削除可能）";
            case "zh_CHT":
                return "刪除塊以及閃卡（可刪除文檔）";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Delete block and flashcards (can delete documents)";
        }
    }
    public get 添加到新文件() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "添加到新文件";
            case "es_ES":
                return "Agregar a un nuevo archivo";
            case "fr_FR":
                return "Ajouter à un nouveau fichier";
            case "ja_JP":
                return "新しいファイルに追加";
            case "zh_CHT":
                return "添加到新檔案";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Add to new file";
        }
    }
    public get 加入闪卡() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "加入闪卡";
            case "es_ES":
                return "Agregar a tarjetas flash";
            case "fr_FR":
                return "Ajouter à des fiches mémo";
            case "ja_JP":
                return "フラッシュカードに追加";
            case "zh_CHT":
                return "加入閃卡";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Add to flashcards";
        }
    }
    public get 复制到dailynoteNewFile() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "复制到新文件";
            case "es_ES":
                return "Copiar a nuevo archivo";
            case "fr_FR":
                return "Copier dans un nouveau fichier";
            case "ja_JP":
                return "新しいファイルにコピー";
            case "zh_CHT":
                return "複製到新檔案";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Copy to new file";
        }
    }
    public get 请先打开阅读点功能() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "请先打开阅读点功能";
            case "es_ES":
                return "Por favor, activa la función de puntos de lectura primero";
            case "fr_FR":
                return "Veuillez d'abord activer la fonction de points de lecture";
            case "ja_JP":
                return "読書ポイント機能を先に有効にしてください";
            case "zh_CHT":
                return "請先打開閱讀點功能";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Please enable the reading point feature first";
        }
    }
    public get 设置图标放左边() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "设置图标放左边";
            case "es_ES":
                return "Colocar icono a la izquierda";
            case "fr_FR":
                return "Placer l'icône à gauche";
            case "ja_JP":
                return "アイコンを左に配置";
            case "zh_CHT":
                return "設置圖標放左邊";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Set icon to the left";
        }
    }
    public get 末尾添加空行() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "末尾添加空行";
            case "es_ES":
                return "Agregar línea en blanco al final";
            case "fr_FR":
                return "Ajouter une ligne vide à la fin";
            case "ja_JP":
                return "末尾に空行を追加";
            case "zh_CHT":
                return "末尾添加空行";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Add blank line at the end";
        }
    }
    public get 显示topbar() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "显示topbar";
            case "es_ES":
                return "Mostrar barra superior";
            case "fr_FR":
                return "Afficher la barre supérieure";
            case "ja_JP":
                return "トップバーを表示";
            case "zh_CHT":
                return "顯示topbar";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Show topbar";
        }
    }
    public get 简洁模式切换() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "正常/简洁模式切换";
            case "es_ES":
                return "Cambio entre modo normal/simplificado";
            case "fr_FR":
                return "Basculement entre le mode normal/simplifié";
            case "ja_JP":
                return "通常/シンプルモード切り替え";
            case "zh_CHT":
                return "正常/簡潔模式切換";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Toggle normal/concise mode";
        }
    }
    public get 显示文档属性() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "显示文档属性";
            case "es_ES":
                return "Mostrar propiedades del documento";
            case "fr_FR":
                return "Afficher les propriétés du document";
            case "ja_JP":
                return "ドキュメントのプロパティを表示";
            case "zh_CHT":
                return "顯示文件屬性";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Show document properties";
        }
    }
    public get HomeEnd图标放到左边() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "HomeEnd图标放到左边";
            case "es_ES":
                return "Iconos HomeEnd a la izquierda";
            case "fr_FR":
                return "Icônes HomeEnd à gauche";
            case "ja_JP":
                return "HomeEndアイコンを左に配置";
            case "zh_CHT":
                return "HomeEnd圖標放到左邊";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "HomeEnd icons to the left";
        }
    }
    public get 链接到块底部() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "链接到块底部";
            case "es_ES":
                return "Enlazar al fondo del bloque";
            case "fr_FR":
                return "Lier au bas du bloc";
            case "ja_JP":
                return "ブロックの底にリンク";
            case "zh_CHT":
                return "鏈接到塊底部";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Link to block bottom";
        }
    }
    public get 创建时间升序() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "创建时间升序";
            case "es_ES":
                return "Orden ascendente por fecha de creación";
            case "fr_FR":
                return "Ordre croissant par date de création";
            case "ja_JP":
                return "作成日時昇順";
            case "zh_CHT":
                return "創建時間升序";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Ascending order by creation time";
        }
    }
    public get 修改时间升序() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "修改时间升序";
            case "es_ES":
                return "Orden ascendente por fecha de modificación";
            case "fr_FR":
                return "Ordre croissant par date de modification";
            case "ja_JP":
                return "修正日時昇順";
            case "zh_CHT":
                return "修改時間升序";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Ascending order by modification time";
        }
    }
    public get 创建时间降序() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "创建时间降序";
            case "es_ES":
                return "Tiempo de creación descendente";
            case "fr_FR":
                return "Date de création décroissante";
            case "ja_JP":
                return "作成時間降順";
            case "zh_CHT":
                return "創建時間降序";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Creation time descending";
        }
    }
    public get 修改时间降序() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "修改时间降序";
            case "es_ES":
                return "Tiempo de modificación descendente";
            case "fr_FR":
                return "Date de modification décroissante";
            case "ja_JP":
                return "修正時間降順";
            case "zh_CHT":
                return "修改時間降序";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Modification time descending";
        }
    }

}
