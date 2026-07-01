import { TomatoI18nABC7 } from "./text7";

export abstract class TomatoI18nABC6 extends TomatoI18nABC7 {
    public 为x张卡输入新的优先级(length: number) {
        switch (this.lang) {
            case "zh_CN":
                return `为${length}张卡输入新的优先级，优先级前缀为'-'或者'+'则表示增量`;
            case "es_ES":
                return `Introduzca una nueva prioridad para ${length} tarjetas, un prefijo de prioridad de '-' o '+' indica un incremento.`;
            case "fr_FR":
                return `Entrez une nouvelle priorité pour ${length} cartes, un préfixe de priorité de '-' ou '+' indique une augmentation.`;
            case "ja_JP":
                return `${length}枚のカードに新しい優先順位を入力してください。優先順位の接頭辞が'-'または'+'の場合、それは増分を意味します。`;
            case "zh_CHT":
                return `為${length}張卡輸入新的優先級，優先級前綴為'-'或者'+'則表示增量`;

            default:
                return `Enter a new priority for ${length} cards, a priority prefix of '-' or '+' indicates an increment.`;
        }
    }

    public get 您的输入有误() {
        switch (this.lang) {
            case "zh_CN":
                return "您的输入有误";
            case "es_ES":
                return "Su entrada es incorrecta";
            case "fr_FR":
                return "Votre entrée est incorrecte";
            case "ja_JP":
                return "入力が間違っています";
            case "zh_CHT":
                return "您的輸入有誤";

            default:
                return "Your input is incorrect";
        }
    }

    public get 正在修改优先级() {
        switch (this.lang) {
            case "zh_CN":
                return "正在修改优先级，请耐心等候……";
            case "es_ES":
                return "Modificando la prioridad, por favor tenga paciencia...";
            case "fr_FR":
                return "Modification de la priorité, veuillez patienter...";
            case "ja_JP":
                return "優先順位を変更しています、お待ちください……";
            case "zh_CHT":
                return "正在修改優先級，請耐心等候……";

            default:
                return "Modifying priority, please wait...";
        }
    }

    public 已经调整了x个闪卡的优先级(count: number) {
        switch (this.lang) {
            case "zh_CN":
                return `已经调整了${count}个闪卡的优先级`;
            case "es_ES":
                return `Se han ajustado las prioridades de ${count} tarjetas de repaso`;
            case "fr_FR":
                return `Les priorités de ${count} cartes flash ont été ajustées`;
            case "ja_JP":
                return `${count}枚のフラッシュカードの優先順位を調整しました`;
            case "zh_CHT":
                return `已經調整了${count}個閃卡的優先級`;

            default:
                return `Priority of ${count} flashcards has been adjusted`;
        }
    }

    public get 设置闪卡优先级为() {
        switch (this.lang) {
            case "zh_CN":
                return "设置闪卡优先级为";
            case "es_ES":
                return "Establecer prioridad de tarjetas como";
            case "fr_FR":
                return "Définir la priorité des cartes comme";
            case "ja_JP":
                return "カードの優先順位を設定する";
            case "zh_CHT":
                return "設定閃卡優先級為";

            default:
                return "Set flashcard priority to";
        }
    }

    public get 批量删除正在检查数据() {
        switch (this.lang) {
            case "zh_CN":
                return "批量删除：正在检查数据……";
            case "es_ES":
                return "Eliminar en masa: comprobando datos...";
            case "fr_FR":
                return "Supprimer en masse: vérification des données...";
            case "ja_JP":
                return "一括削除：データを確認中…";
            case "zh_CHT":
                return "批量刪除：正在檢查數據……";

            default:
                return "Bulk delete: checking data...";
        }
    }

    public get 批量复制移动正在检查数据() {
        switch (this.lang) {
            case "zh_CN":
                return "批量复制/移动：正在检查数据……";
            case "es_ES":
                return "Copiar/mover en masa: comprobando datos...";
            case "fr_FR":
                return "Copier/déplacer en masse: vérification des données...";
            case "ja_JP":
                return "一括コピー/移動：データを確認中…";
            case "zh_CHT":
                return "批量複製/移動：正在檢查數據……";

            default:
                return "Bulk copy/move: checking data...";
        }
    }

    public get 请先打开笔记本() {
        switch (this.lang) {
            case "zh_CN":
                return "请先打开笔记本";
            case "es_ES":
                return "Por favor, abra el cuaderno primero";
            case "fr_FR":
                return "Veuillez ouvrir le carnet d'abord";
            case "ja_JP":
                return "まずはノートを開いてください";
            case "zh_CHT":
                return "請先打開筆記本";

            default:
                return "Please open the notebook first";
        }
    }

    public 您配置的笔记本x是否已经打开了(boxID: string) {
        switch (this.lang) {
            case "zh_CN":
                return `您配置的笔记本'${boxID}'是否已经打开了？`;
            case "es_ES":
                return `¿Ha abierto el cuaderno configurado '${boxID}'?`;
            case "fr_FR":
                return `Avez-vous déjà ouvert le carnet configuré '${boxID}' ?`;
            case "ja_JP":
                return `設定されたノート'${boxID}'はすでに開いていますか？`;
            case "zh_CHT":
                return `您配置的筆記本'${boxID}'是否已經打開了？`;

            default:
                return `Has the configured notebook '${boxID}' been opened?`;
        }
    }

    public get 缩放() {
        switch (this.lang) {
            case "zh_CN":
                return "缩放";
            case "es_ES":
                return "Zoom";
            case "fr_FR":
                return "Zoom";
            case "ja_JP":
                return "ズーム";
            case "zh_CHT":
                return "縮放";

            default:
                return "Zoom";
        }
    }

    public get 删除最后一个遮挡层() {
        switch (this.lang) {
            case "zh_CN":
                return "删除最后一个遮挡层";
            case "es_ES":
                return "Eliminar último nivel de obstrucción";
            case "fr_FR":
                return "Supprimer la dernière couche d'obstruction";
            case "ja_JP":
                return "最後の遮蔽層を削除する";
            case "zh_CHT":
                return "刪除最後一個遮擋層";

            default:
                return "Delete last overlay";
        }
    }

    public get 保存并退出() {
        switch (this.lang) {
            case "zh_CN":
                return "保存并退出";
            case "es_ES":
                return "Guardar y salir";
            case "fr_FR":
                return "Enregistrer et quitter";
            case "ja_JP":
                return "保存して終了";
            case "zh_CHT":
                return "保存並退出";

            default:
                return "Save and exit";
        }
    }

    public get 图片制卡支持拖拽画矩形() {
        switch (this.lang) {
            case "zh_CN":
                return "图片制卡（支持拖拽画矩形）";
            case "es_ES":
                return "Crear tarjetas de imágenes (soporta arrastrar para dibujar rectángulos)";
            case "fr_FR":
                return "Créer des cartes d'images (prend en charge le glisser-déposer pour dessiner des rectangles)";
            case "ja_JP":
                return "画像カード作成（ドラッグして長方形を描画することをサポート）";
            case "zh_CHT":
                return "圖片制卡（支持拖拽畫矩形）";

            default:
                return "Image card creation (supports dragging to draw rectangles)";
        }
    }

    public get 当前文档无书签() {
        switch (this.lang) {
            case "zh_CN":
                return "当前文档无书签";
            case "es_ES":
                return "El documento actual no tiene marcadores";
            case "fr_FR":
                return "Le document actuel n'a pas de signets";
            case "ja_JP":
                return "現在のドキュメントにはブックマークがありません";
            case "zh_CHT":
                return "當前文檔無書籤";

            default:
                return "Current document has no bookmarks";
        }
    }

    public 复习时间复习次数(time: string, reps: number) {
        switch (this.lang) {
            case "zh_CN":
                return `复习时间：${time}\n复习次数：${reps}\n【点击修改优先级】\n【数值高的优先复习】`;
            case "es_ES":
                return `Tiempo de estudio: ${time}\nVeces de repaso: ${reps}\n【Haga clic para modificar la prioridad】\n【Mayor valor, prioridad de repaso más alta】`;
            case "fr_FR":
                return `Temps de révision : ${time}\nNombre de répétitions : ${reps}\n【Cliquez pour modifier la priorité】\n【Valeur élevée, révision prioritaire】`;
            case "ja_JP":
                return `復習時間：${time}\n復習回数：${reps}\n【優先順位を変更するにはクリックしてください】\n【数値が高いほど優先的に復習】`;
            case "zh_CHT":
                return `複習時間：${time}\n複習次數：${reps}\n【點擊修改優先級】\n【數值高的優先複習】`;

            default:
                return `Review time: ${time}\nReview reps: ${reps}\n【Click to modify priority】\n【Higher value, higher priority for review】`;
        }
    }

    public get 未开始计时() {
        switch (this.lang) {
            case "zh_CN":
                return "未开始计时";
            case "es_ES":
                return "No ha comenzado la cuenta regresiva";
            case "fr_FR":
                return "La minuterie n'a pas commencé";
            case "ja_JP":
                return "タイマーがまだ始まっていません";
            case "zh_CHT":
                return "尚未開始計時";

            default:
                return "Timer has not started";
        }
    }

    public 剩余时间(name: string, minutes: number, seconds: number) {
        switch (this.lang) {
            case "zh_CN":
                return `${name}🍅剩余： ${minutes}分 ${seconds}秒`;
            case "es_ES":
                return `${name}🍅 Restante: ${minutes} minutos ${seconds} segundos`;
            case "fr_FR":
                return `${name}🍅 Restant : ${minutes} minutes ${seconds} secondes`;
            case "ja_JP":
                return `${name}🍅 残り： ${minutes}分 ${seconds}秒`;
            case "zh_CHT":
                return `${name}🍅 剩餘： ${minutes}分 ${seconds}秒`;

            default:
                return `${name}🍅 Remaining: ${minutes} minutes ${seconds} seconds`;
        }
    }

    public get 查看剩余时间() {
        switch (this.lang) {
            case "zh_CN":
                return "查看剩余时间";
            case "es_ES":
                return "Ver el tiempo restante";
            case "fr_FR":
                return "Voir le temps restant";
            case "ja_JP":
                return "残り時間を確認";
            case "zh_CHT":
                return "查看剩餘時間";

            default:
                return "View remaining time";
        }
    }

    public 推迟x个闪卡y天(length: number, days: string) {
        switch (this.lang) {
            case "zh_CN":
                return `推迟${length}个闪卡${days}天`;
            case "es_ES":
                return `posponer ${length} tarjetas de memoria por ${days} días`;
            case "fr_FR":
                return `reporter ${length} cartes flash pour ${days} jours`;
            case "ja_JP":
                return `${length}枚のスマートカードを${days}日延期`;
            case "zh_CHT":
                return `延後${length}個閃卡${days}天`;

            default:
                return `postpone ${length} flashcards for ${days} days`;
        }
    }

    public get 更新阅读点目录() {
        switch (this.lang) {
            case "zh_CN":
                return "更新：阅读点目录";
            case "es_ES":
                return "Actualizar: Catálogo de puntos de lectura";
            case "fr_FR":
                return "Mise à jour : Catalogue des points de lecture";
            case "ja_JP":
                return "更新：読書ポイントカタログ";
            case "zh_CHT":
                return "更新：閱讀點目錄";

            default:
                return "Update: Reading Points Catalog";
        }
    }

    public get 阅读点目录已是最新() {
        switch (this.lang) {
            case "zh_CN":
                return "阅读点目录已是最新";
            case "es_ES":
                return "El catálogo de puntos de lectura está actualizado";
            case "fr_FR":
                return "Le catalogue des points de lecture est à jour";
            case "ja_JP":
                return "読書ポイントカタログは最新です";
            case "zh_CHT":
                return "閱讀點目錄已是最新";

            default:
                return "Reading Points Catalog is up to date";
        }
    }

    public get 阅读点() {
        switch (this.lang) {
            case "zh_CN":
                return "阅读点：";
            case "es_ES":
                return "Punto de lectura:";
            case "fr_FR":
                return "Point de lecture :";
            case "ja_JP":
                return "読書ポイント：";
            case "zh_CHT":
                return "閱讀點：";

            default:
                return "Reading Point:";
        }
    }

    public get 光标() {
        switch (this.lang) {
            case "zh_CN":
                return "光标";
            case "es_ES":
                return "Cursor";
            case "fr_FR":
                return "Curseur";
            case "ja_JP":
                return "カーソル";
            case "zh_CHT":
                return "光標";

            default:
                return "Cursor";
        }
    }

    public get 移动端规避云端同步冲突() {
        switch (this.lang) {
            case "zh_CN":
                return "移动端规避云端同步冲突";
            case "es_ES":
                return "Evitar conflictos de sincronización en dispositivos móviles";
            case "fr_FR":
                return "Éviter les conflits de synchronisation sur les appareils mobiles";
            case "ja_JP":
                return "モバイル端末でクラウド同期の競合を回避する";
            case "zh_CHT":
                return "行動裝置避免雲端同步衝突";

            default:
                return "Avoid conflicts in cloud synchronization on mobile devices";
        }
    }

    public get 拍照闪念() {
        switch (this.lang) {
            case "zh_CN":
                return "拍照闪念";
            case "es_ES":
                return "Instantáneas de ideas fugaces";
            case "fr_FR":
                return "Instantanés d'idées fugitives";
            case "ja_JP":
                return "写真で捉えた一瞬のアイデア";
            case "zh_CHT":
                return "拍照閃念";

            default:
                return "Snapshots of fleeting thoughts";
        }
    }

    public get 找不到您配置的文件() {
        switch (this.lang) {
            case "zh_CN":
                return "找不到您配置的文件";
            case "es_ES":
                return "No se encuentra el archivo de configuración";
            case "fr_FR":
                return "Fichier de configuration introuvable";
            case "ja_JP":
                return "設定ファイルが見つかりません";
            case "zh_CHT":
                return "找不到您配置的文件";

            default:
                return "Cannot find your configuration file";
        }
    }

    public get 笔记本() {
        switch (this.lang) {
            case "zh_CN":
                return "笔记本";
            case "es_ES":
                return "cuaderno";
            case "fr_FR":
                return "carnet";
            case "ja_JP":
                return "ノート";
            case "zh_CHT":
                return "筆記本";

            default:
                return "notebook";
        }
    }

    public get 拍照后插入图片() {
        switch (this.lang) {
            case "zh_CN":
                return "拍照后插入图片";
            case "es_ES":
                return "insertar imagen después de tomar una foto";
            case "fr_FR":
                return "insérer une image après avoir pris une photo";
            case "ja_JP":
                return "写真を撮影した後に画像を挿入";
            case "zh_CHT":
                return "拍照後插入圖片";

            default:
                return "insert image after taking a photo";
        }
    }

    public get 从图库插入图片() {
        switch (this.lang) {
            case "zh_CN":
                return "从图库插入图片";
            case "es_ES":
                return "insertar imagen desde la galería";
            case "fr_FR":
                return "insérer une image depuis la galerie";
            case "ja_JP":
                return "ギャラリーから画像を挿入";
            case "zh_CHT":
                return "從圖庫插入圖片";

            default:
                return "insert image from gallery";
        }
    }

    public get 清理列表清理输入框() {
        switch (this.lang) {
            case "zh_CN":
                return "清理列表，清理输入框";
            case "es_ES":
                return "limpiar lista, limpiar cuadro de entrada";
            case "fr_FR":
                return "nettoyer la liste, nettoyer la zone d'entrée";
            case "ja_JP":
                return "リストをクリア、入力ボックスをクリア";
            case "zh_CHT":
                return "清理列表，清理輸入框";

            default:
                return "clear list, clear input box";
        }
    }

    public get 同步数据() {
        switch (this.lang) {
            case "zh_CN":
                return "同步数据";
            case "es_ES":
                return "sincronizar datos";
            case "fr_FR":
                return "synchroniser les données";
            case "ja_JP":
                return "データ同期";
            case "zh_CHT":
                return "同步數據";

            default:
                return "sync data";
        }
    }

    public get 连续输入() {
        switch (this.lang) {
            case "zh_CN":
                return "连续输入";
            case "es_ES":
                return "entrada continua";
            case "fr_FR":
                return "entrée continue";
            case "ja_JP":
                return "連続入力";
            case "zh_CHT":
                return "連續輸入";

            default:
                return "continuous input";
        }
    }

    public get 引用前后加上括号() {
        switch (this.lang) {
            case "zh_CN":
                return "引用前后加上括号：[[概念]]";
            case "es_ES":
                return "Paréntesis alrededor de las citas: [[concepto]]";
            case "fr_FR":
                return "Mettre des parenthèses autour des citations : [[concept]]";
            case "ja_JP":
                return "引用の前後に括弧を付ける：[[概念]]";
            case "zh_CHT":
                return "引用前後加上括號：[[概念]]";

            default:
                return "Put parentheses around quotes: [[concept]]";
        }
    }

    public get 状态栏番茄钟() {
        switch (this.lang) {
            case "zh_CN":
                return "状态栏番茄钟";
            case "es_ES":
                return "Temporizador Pomodoro en la barra de estado";
            case "fr_FR":
                return "Chronomètre Pomodoro dans la barre d'état";
            case "ja_JP":
                return "ステータスバーのポモドーロタイマー";
            case "zh_CHT":
                return "狀態欄番茄鐘";

            default:
                return "Status bar Pomodoro timer";
        }
    }

    public get 番茄钟时长多个间用逗号隔开() {
        switch (this.lang) {
            case "zh_CN":
                return "番茄钟时长（多个间用逗号隔开）";
            case "es_ES":
                return "Duración del temporizador Pomodoro (separadas por comas)";
            case "fr_FR":
                return "Durée du chronomètre Pomodoro (séparées par des virgules)";
            case "ja_JP":
                return "ポモドーロタイマーの長さ（カンマで区切られた複数）";
            case "zh_CHT":
                return "番茄鐘時長（多個間用逗號隔開）";

            default:
                return "Pomodoro timer durations (separated by commas)";
        }
    }
    public get 随机视频() {
        switch (this.lang) {
            case "zh_CN":
                return "随机视频：提供思源的文档名（无路径，无后缀），时间到会从文档与子文档中挑一个视频播放。即使用其他软件，也会弹窗。";
            case "es_ES":
                return "Video aleatorio: Proporciona el nombre del documento de Siyuan (sin ruta, sin extensión). Cuando llegue el tiempo, se seleccionará un video de los documentos y subdocumentos para reproducir. Incluso si se usa otro software, aparecerá una ventana emergente.";
            case "fr_FR":
                return "Vidéo aléatoire : Fournit le nom du document de Siyuan (sans chemin, sans extension). Lorsque le temps est écoulé, un vidéo sera sélectionnée parmi les documents et sous-documents pour être jouée. Même si un autre logiciel est utilisé, une fenêtre contextuelle apparaîtra.";
            case "ja_JP":
                return "ランダムビデオ：思源のドキュメント名（パスなし、拡張子なし）を提供します。時間になると、ドキュメントとサブドキュメントからビデオが選択されて再生されます。他のソフトウェアを使用していても、ポップアップウィンドウが表示されます。";
            case "zh_CHT":
                return "隨機視頻：提供思源的文檔名（無路徑，無後綴），時間到會從文檔與子文檔中挑一個視頻播放。即使用其他軟件，也會彈窗。";

            default:
                return "Random Video: Provides the document name of Siyuan (no path, no extension). When the time comes, a video will be selected from the documents and sub-documents to play. Even if another software is used, a pop-up window will appear.";
        }
    }
    public get 计时后修改背景明亮模式() {
        switch (this.lang) {
            case "zh_CN":
                return "计时后修改背景-明亮模式。比如填入：assets/dd-20240206160021-tz7aefu.jpeg";
            case "es_ES":
                return "Cambiar el fondo después del tiempo - Modo claro. Por ejemplo, ingrese: assets/dd-20240206160021-tz7aefu.jpeg";
            case "fr_FR":
                return "Changer l'arrière-plan après le temps - Mode clair. Par exemple, entrer : assets/dd-20240206160021-tz7aefu.jpeg";
            case "ja_JP":
                return "時間経過後に背景を変更 - 明るいモード。例えば、次のように入力します：assets/dd-20240206160021-tz7aefu.jpeg";
            case "zh_CHT":
                return "計時後修改背景-明亮模式。例如填入：assets/dd-20240206160021-tz7aefu.jpeg";

            default:
                return "Change background after timing - Light mode. For example, enter: assets/dd-20240206160021-tz7aefu.jpeg";
        }
    }

    public get 计时后修改背景黑暗模式() {
        switch (this.lang) {
            case "zh_CN":
                return "计时后修改背景-黑暗模式。比如填入：assets/dd-20240206160021-tz7aefa.jpeg";
            case "es_ES":
                return "Cambiar el fondo después del tiempo - Modo oscuro. Por ejemplo, ingrese: assets/dd-20240206160021-tz7aefa.jpeg";
            case "fr_FR":
                return "Changer l'arrière-plan après le temps - Mode sombre. Par exemple, entrer : assets/dd-20240206160021-tz7aefa.jpeg";
            case "ja_JP":
                return "時間経過後に背景を変更 - ダークモード。例えば、次のように入力します：assets/dd-20240206160021-tz7aefa.jpeg";
            case "zh_CHT":
                return "計時後修改背景-黑暗模式。例如填入：assets/dd-20240206160021-tz7aefa.jpeg";

            default:
                return "Change background after timing - Dark mode. For example, enter: assets/dd-20240206160021-tz7aefa.jpeg";
        }
    }

    public get 开启toolbar按钮() {
        switch (this.lang) {
            case "zh_CN":
                return "开启toolbar按钮：闪卡、刷新虚拟引用、全局文档定位、各国语言";
            case "es_ES":
                return "Activar botón de la barra de herramientas: tarjetas flash, actualizar referencias virtuales, posicionamiento global de documentos, idiomas";
            case "fr_FR":
                return "Activer le bouton de la barre d'outils : flashcards, rafraîchir les références virtuelles, positionnement global des documents, langues";
            case "ja_JP":
                return "ツールバーボタンを有効にする：フラッシュカード、仮想参照の更新、ドキュメントのグローバル位置決め、言語";
            case "zh_CHT":
                return "開啟工具列按鈕：閃卡、刷新虛擬引用、全域文件定位、各國語言";

            default:
                return "Enable toolbar button: flashcards, refresh virtual references, global document positioning, languages";
        }
    }

    public get 整理assets下的图片() {
        switch (this.lang) {
            case "zh_CN":
                return "整理 assets 下的图片、视频、音频的工具";
            case "es_ES":
                return "Herramienta para organizar imágenes, videos y audios en assets";
            case "fr_FR":
                return "Outil pour organiser les images, vidéos et audios dans assets";
            case "ja_JP":
                return "assets内の画像、ビデオ、オーディオを整理するツール";
            case "zh_CHT":
                return "整理 assets 下的圖片、視頻、音頻的工具";

            default:
                return "Tool to organize images, videos, and audios in assets";
        }
    }

    public get 显示语言切换按钮() {
        switch (this.lang) {
            case "zh_CN":
                return "显示语言切换按钮";
            case "es_ES":
                return "Mostrar botón de cambio de idioma";
            case "fr_FR":
                return "Afficher le bouton de changement de langue";
            case "ja_JP":
                return "言語切替ボタンを表示";
            case "zh_CHT":
                return "顯示語言切換按鈕";

            default:
                return "Show language switch button";
        }
    }

    public get 内容提醒() {
        switch (this.lang) {
            case "zh_CN":
                return "内容提醒";
            case "es_ES":
                return "Recordatorio de contenido";
            case "fr_FR":
                return "Rappel de contenu";
            case "ja_JP":
                return "コンテンツリマインダー";
            case "zh_CHT":
                return "內容提醒";

            default:
                return "Content reminder";
        }
    }
    public get 闪卡工具() {
        switch (this.lang) {
            case "zh_CN":
                return "闪卡工具";
            case "es_ES":
                return "Herramienta de tarjetas flash";
            case "fr_FR":
                return "Outil de cartes flash";
            case "ja_JP":
                return "フラッシュカードツール";
            case "zh_CHT":
                return "閃卡工具";

            default:
                return "Flashcard tool";
        }
    }

    public get 连续2次重来加优先级连续2次简单减优先级() {
        switch (this.lang) {
            case "zh_CN":
                return "连续2次重来加优先级，连续2次简单减优先级";
            case "es_ES":
                return "Prioridad agregada por 2 repeticiones consecutivas, prioridad reducida por 2 simples consecutivos";
            case "fr_FR":
                return "Priorité ajoutée pour 2 redémarrages consécutifs, priorité réduite pour 2 simples consécutifs";
            case "ja_JP":
                return "連続2回の再開で優先度アップ、連続2回のシンプルで優先度ダウン";
            case "zh_CHT":
                return "連續2次重來加優先級，連續2次簡單減優先級";

            default:
                return "Priority added for 2 consecutive retries, priority reduced for 2 consecutive simples";
        }
    }

    public get 长内容工具() {
        switch (this.lang) {
            case "zh_CN":
                return "长内容工具";
            case "es_ES":
                return "Herramienta de contenido largo";
            case "fr_FR":
                return "Outil de contenu long";
            case "ja_JP":
                return "長いコンテンツツール";
            case "zh_CHT":
                return "長內容工具";

            default:
                return "Long content tool";
        }
    }

    public get 双向互链() {
        switch (this.lang) {
            case "zh_CN":
                return "双向互链";
            case "es_ES":
                return "Enlace bidireccional";
            case "fr_FR":
                return "Lien bidirectionnel";
            case "ja_JP":
                return "双方向リンク";
            case "zh_CHT":
                return "雙向互鏈";

            default:
                return "Bidirectional link";
        }
    }

    public get 打开DailyNote时总是跳到底部() {
        switch (this.lang) {
            case "zh_CN":
                return "打开DailyNote时，总是跳到底部。";
            case "es_ES":
                return "Al abrir DailyNote, siempre saltar al final.";
            case "fr_FR":
                return "Lors de l'ouverture de DailyNote, toujours aller au bas.";
            case "ja_JP":
                return "DailyNoteを開くときは、常に下にジャンプします。";
            case "zh_CHT":
                return "打開DailyNote時，總是跳到底部。";

            default:
                return "Always jump to the bottom when opening DailyNote.";
        }
    }
    public get 图片遮挡() {
        switch (this.lang) {
            case "zh_CN":
                return "图片遮挡";
            case "es_ES":
                return "Obstrucción de la imagen";
            case "fr_FR":
                return "Obstruction de l'image";
            case "ja_JP":
                return "画像の遮断";
            case "zh_CHT":
                return "圖片遮擋";

            default:
                return "Image obstruction";
        }
    }
    public get 底部反链() {
        switch (this.lang) {
            case "zh_CN":
                return "底部反链";
            case "es_ES":
                return "Enlace inverso inferior";
            case "fr_FR":
                return "Lien inverse inférieur";
            case "ja_JP":
                return "下部リバースリンク";
            case "zh_CHT":
                return "底部反鏈";

            default:
                return "Bottom backlink";
        }
    }
    public get 将选择文字与其拼音加入文档的别名() {
        switch (this.lang) {
            case "zh_CN":
                return "将选择文字与其拼音加入文档的别名";
            case "es_ES":
                return "Añadir el texto seleccionado y su pinyin como alias en el documento";
            case "fr_FR":
                return "Ajouter le texte sélectionné et son pinyin comme alias dans le document";
            case "ja_JP":
                return "選択したテキストとそのピンインをドキュメントのエイリアスとして追加する";
            case "zh_CHT":
                return "將選擇文字與其拼音加入文檔的別名";

            default:
                return "Add selected text and its pinyin as an alias in the document";
        }
    }
    public get 也加入简拼() {
        switch (this.lang) {
            case "zh_CN":
                return "也加入简拼";
            case "es_ES":
                return "También añadir el pinyin abreviado";
            case "fr_FR":
                return "Ajouter également le pinyin abrégé";
            case "ja_JP":
                return "簡略ピンインも追加する";
            case "zh_CHT":
                return "也加入簡拼";

            default:
                return "Also add the abbreviated pinyin";
        }
    }
    public get 添加引用时自动制卡() {
        switch (this.lang) {
            case "zh_CN":
                return "添加引用时自动制卡";
            case "es_ES":
                return "Crear tarjeta automáticamente al agregar una cita";
            case "fr_FR":
                return "Créer une carte automatiquement lors de l'ajout d'une citation";
            case "ja_JP":
                return "引用を追加するときに自動的にカードを作成";
            case "zh_CHT":
                return "添加引用時自動製卡";

            default:
                return "Automatically create a card when adding a quote";
        }
    }


}
