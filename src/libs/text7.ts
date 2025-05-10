import { TomatoI18nABC8 } from "./text8";

export abstract class TomatoI18nABC7 extends TomatoI18nABC8 {

    public get 不再推送本书() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "不再为我推送本书，可在顶栏的[查看所有渐进学习文档]中开启推送";
            case "es_ES":
                return "No enviar más este libro, puedes habilitar el envío en [Ver todos los documentos de aprendizaje progresivo] en la barra superior";
            case "fr_FR":
                return "Ne plus envoyer ce livre, vous pouvez activer l'envoi dans [Voir tous les documents d'apprentissage progressif] dans la barre supérieure";
            case "ja_JP":
                return "この本をもう送らないでください、トップバーの[すべての段階的学習ドキュメントを表示]で送信を有効にできます";
            case "zh_CHT":
                return "不再為我推送本書，可在頂欄的[查看所有漸進學習文檔]中開啟推送";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "No longer push this book for me, can turn on push in [View all progressive learning documents] in the top bar";
        }
    }

    public get 删除分片并退出() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "删除分片并结束阅读";
            case "es_ES":
                return "Eliminar fragmento y terminar la lectura";
            case "fr_FR":
                return "Supprimer le fragment et terminer la lecture";
            case "ja_JP":
                return "フラグメントを削除して読み終える";
            case "zh_CHT":
                return "刪除分片並結束閱讀";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Delete fragment and end reading";
        }
    }

    public get 删除文档闪卡() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "删除文档闪卡";
            case "es_ES":
                return "Eliminar tarjeta de documento";
            case "fr_FR":
                return "Supprimer la fiche document";
            case "ja_JP":
                return "ドキュメントカードを削除する";
            case "zh_CHT":
                return "刪除文檔閃卡";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Delete document flashcard";
        }
    }

    public get 将文档加入闪卡() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "将文档加入闪卡";
            case "es_ES":
                return "Agregar el documento a la tarjeta";
            case "fr_FR":
                return "Ajouter le document à la fiche";
            case "ja_JP":
                return "ドキュメントをカードに追加する";
            case "zh_CHT":
                return "將文檔加入閃卡";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Add document to flashcard";
        }
    }
    public get 换一本书看() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "换一本书来看";
            case "es_ES":
                return "Cambia a otro libro para leer";
            case "fr_FR":
                return "Changez de livre à lire";
            case "ja_JP":
                return "別の本を読む";
            case "zh_CHT":
                return "換一本書來看";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Switch to another book to read";
        }
    }

    public get 删除分片看下一个分片() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "删除分片，看下一个分片";
            case "es_ES":
                return "Eliminar fragmento, ver el siguiente fragmento";
            case "fr_FR":
                return "Supprimer le fragment, voir le prochain fragment";
            case "ja_JP":
                return "フラグメントを削除し、次のフラグメントを見る";
            case "zh_CHT":
                return "刪除分片，看下一個分片";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Delete fragment, see the next fragment";
        }
    }

    public get 删除分片看上一个分片() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "删除分片，看上一个分片";
            case "es_ES":
                return "Eliminar fragmento, ver el fragmento anterior";
            case "fr_FR":
                return "Supprimer le fragment, voir le fragment précédent";
            case "ja_JP":
                return "フラグメントを削除し、前のフラグメントを見る";
            case "zh_CHT":
                return "刪除分片，看上一個分片";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Delete fragment, see the previous fragment";
        }
    }

    public get 打开本书的闪卡() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "打开本书的闪卡";
            case "es_ES":
                return "Abre las tarjetas flash de este libro";
            case "fr_FR":
                return "Ouvrez les flashcards de ce livre";
            case "ja_JP":
                return "この本のフラッシュカードを開く";
            case "zh_CHT":
                return "打開本書的閃卡";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Open the flashcards of this book";
        }
    }

    public get 关闭分片() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "关闭分片";
            case "es_ES":
                return "Cerrar fragmento";
            case "fr_FR":
                return "Fermer le fragment";
            case "ja_JP":
                return "フラグメントを閉じる";
            case "zh_CHT":
                return "關閉分片";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Close fragment";
        }
    }

    public get 重新插入分片内容() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "重新插入分片的内容";
            case "es_ES":
                return "Reinsertar el contenido del fragmento";
            case "fr_FR":
                return "Réinsérer le contenu du fragment";
            case "ja_JP":
                return "フラグメントの内容を再挿入する";
            case "zh_CHT":
                return "重新插入分片的內容";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Reinsert fragment content";
        }
    }

    public get 删除原文() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "删除原文";
            case "es_ES":
                return "Eliminar el texto original";
            case "fr_FR":
                return "Supprimer le texte original";
            case "ja_JP":
                return "オリジナルのテキストを削除する";
            case "zh_CHT":
                return "刪除原文";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Delete original text";
        }
    }
    public get 下一个分片() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "下一个分片";
            case "es_ES":
                return "Siguiente fragmento";
            case "fr_FR":
                return "Prochain fragment";
            case "ja_JP":
                return "次の断片";
            case "zh_CHT":
                return "下一個片段";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Next fragment";
        }
    }

    public get 上一个分片() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "上一个分片";
            case "es_ES":
                return "Fragmento anterior";
            case "fr_FR":
                return "Fragment précédent";
            case "ja_JP":
                return "前の断片";
            case "zh_CHT":
                return "上一個片段";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Previous fragment";
        }
    }

    public get 打开目录() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "打开目录";
            case "es_ES":
                return "Abrir directorio";
            case "fr_FR":
                return "Ouvrir le répertoire";
            case "ja_JP":
                return "ディレクトリを開く";
            case "zh_CHT":
                return "開啟目錄";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Open directory";
        }
    }
    public get 制卡后追加时间与标题路径() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "制卡后，追加时间与标题路径";
            case "es_ES":
                return "Después de hacer la tarjeta, añada tiempo y ruta del título";
            case "fr_FR":
                return "Après avoir fait la carte, ajoutez du temps et le chemin du titre";
            case "ja_JP":
                return "カード作成後、時間とタイトルパスを追加";
            case "zh_CHT":
                return "製卡後，追加時間與標題路徑";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "After card creation, append time and title path";
        }
    }
    public get 制卡摘抄改变原文背景() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "制卡、摘抄改变原文背景";
            case "es_ES":
                return "Crear tarjetas, extractos cambian el fondo del texto original";
            case "fr_FR":
                return "Créer des cartes, extraits changent l'arrière-plan du texte original";
            case "ja_JP":
                return "カード作成、抜粋は原文の背景を変更する";
            case "zh_CHT":
                return "制卡、摘抄改變原文背景";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Card making, excerpts change the background of the original text";
        }
    }
    public get 制卡摘抄在原文处做标记() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "制卡、摘抄在原文处做标记";
            case "es_ES":
                return "Hacer tarjeta, hacer anotaciones en el texto original";
            case "fr_FR":
                return "Faire une carte, faire des notes dans le texte original";
            case "ja_JP":
                return "カードを作り、原文でマークをつける";
            case "zh_CHT":
                return "製卡、摘抄在原文處做標記";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Make card, make notes in the original text";
        }
    }
    public get 分片内制卡放于分片的子文档内() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "分片内制卡，放于分片的子文档内";
            case "es_ES":
                return "Hacer tarjeta dentro del fragmento, colocar en el subdocumento del fragmento";
            case "fr_FR":
                return "Faire une carte à l'intérieur du fragment, placer dans le sous-document du fragment";
            case "ja_JP":
                return "フラグメント内でカードを作り、フラグメントのサブドキュメントに置く";
            case "zh_CHT":
                return "分片內製卡，放於分片的子文檔內";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Make card within fragment, put in the subdocument of the fragment";
        }
    }
    public get cards前缀文件() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "'cards-'前缀文件: 每本书用于保存闪卡的文件";
            case "es_ES":
                return "Archivo con prefijo 'cards-': Cada libro se utiliza para guardar el archivo de tarjetas";
            case "fr_FR":
                return "Fichier avec préfixe 'cards-': Chaque livre sert à sauvegarder le fichier de cartes";
            case "ja_JP":
                return "'cards-'プレフィックスのファイル：各書籍はフラッシュカードのファイルを保存するために使用されます";
            case "zh_CHT":
                return "'cards-'前綴文件: 每本書用於保存閃卡的文件";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "'cards-' prefix file: Each book is used to save the flashcard file";
        }
    }
    public get 打开分片的同时打开cards文档() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "打开分片的同时打开cards文档";
            case "es_ES":
                return "Abrir el documento de tarjetas al mismo tiempo que se abre el fragmento";
            case "fr_FR":
                return "Ouvrir le document de cartes en même temps que le fragment";
            case "ja_JP":
                return "フラグメントを開くと同時にカードのドキュメントを開く";
            case "zh_CHT":
                return "打開分片的同時打開cards文檔";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Open cards document while opening the fragment";
        }
    }
    public get 在闪卡内复习整个分片时隐藏分片下方按钮() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "在闪卡内复习整个分片时，隐藏分片下方按钮";
            case "es_ES":
                return "Al revisar todo el fragmento dentro de la tarjeta, ocultar el botón debajo del fragmento";
            case "fr_FR":
                return "Lors de la révision de l'ensemble du fragment à l'intérieur de la carte, cacher le bouton sous le fragment";
            case "ja_JP":
                return "フラッシュカード内でフラグメント全体を復習する際、フラグメント下のボタンを隠す";
            case "zh_CHT":
                return "在閃卡內復習整個分片時，隱藏分片下方按鈕";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "When reviewing the entire fragment within the flashcard, hide the button under the fragment";
        }
    }
    public get 切换单卡多卡模式() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "切换单卡多卡模式";
            case "es_ES":
                return "Cambiar modo de tarjeta única a múltiple";
            case "fr_FR":
                return "Passer du mode carte unique au mode multi-cartes";
            case "ja_JP":
                return "シングルカードモードからマルチカードモードに切り替え";
            case "zh_CHT":
                return "切換單卡多卡模式";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Switch single card to multi-card mode";
        }
    }
    public get 清理已经完成的摘抄() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "清理已经完成的摘抄";
            case "es_ES":
                return "Limpiar las citas completadas";
            case "fr_FR":
                return "Nettoyer les citations terminées";
            case "ja_JP":
                return "完了した引用をクリア";
            case "zh_CHT":
                return "清理已經完成的摘抄";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Clean up completed quotes";
        }
    }
    public get 这并不是一个摘抄() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "这并不是一个摘抄";
            case "es_ES":
                return "Esto no es una cita";
            case "fr_FR":
                return "Ce n'est pas une citation";
            case "ja_JP":
                return "これは引用ではありません";
            case "zh_CHT":
                return "這並不是一個摘抄";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "This is not a quote";
        }
    }
    public get 标记摘抄为完成状态并转移闪卡到其他摘抄() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "标记摘抄为完成状态，并转移闪卡到其他摘抄";
            case "es_ES":
                return "Marcar la cita como completada y trasladar las tarjetas a otra cita";
            case "fr_FR":
                return "Marquer la citation comme terminée et déplacer les flashcards vers une autre citation";
            case "ja_JP":
                return "引用を完了とマークし、フラッシュカードを他の引用に移動";
            case "zh_CHT":
                return "標記摘抄為完成狀態，並轉移閃卡到其他摘抄";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Mark the quote as completed and move flashcards to another quote";
        }
    }
    public get 打开下一个摘抄() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "打开下一个摘抄";
            case "es_ES":
                return "Abrir la siguiente cita";
            case "fr_FR":
                return "Ouvrir la citation suivante";
            case "ja_JP":
                return "次の引用を開く";
            case "zh_CHT":
                return "打開下一個摘抄";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Open the next quote";
        }
    }
    public get 打开前一个摘抄() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "打开前一个摘抄";
            case "es_ES":
                return "Abrir la cita anterior";
            case "fr_FR":
                return "Ouvrir la citation précédente";
            case "ja_JP":
                return "前の引用を開く";
            case "zh_CHT":
                return "打開前一個摘抄";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Open the previous quote";
        }
    }
    public get 查看摘抄轨迹链() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "查看摘抄轨迹链";
            case "es_ES":
                return "Ver cadena de trazas de extracto";
            case "fr_FR":
                return "Voir la chaîne de traces d'extrait";
            case "ja_JP":
                return "抽出トレースチェーンを見る";
            case "zh_CHT":
                return "查看摘抄軌跡鏈";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "View excerpt trace chain";
        }
    }


    public get 不删除已经产生的分片等文件() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "不删除已经产生的分片等文件";
            case "es_ES":
                return "No eliminar archivos de fragmentos ya generados, etc.";
            case "fr_FR":
                return "Ne pas supprimer les fichiers de fragments déjà générés, etc.";
            case "ja_JP":
                return "既に生成されたフラグメントなどのファイルを削除しない";
            case "zh_CHT":
                return "不刪除已經產生的分片等文件";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Do not delete already generated fragment files, etc.";
        }
    }

    public get 删除() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "删除";
            case "es_ES":
                return "Eliminar";
            case "fr_FR":
                return "Supprimer";
            case "ja_JP":
                return "削除";
            case "zh_CHT":
                return "刪除";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Delete";
        }
    }

    public get 重新分片() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "重新分片";
            case "es_ES":
                return "Refragmentar";
            case "fr_FR":
                return "Refragmenter";
            case "ja_JP":
                return "再フラグメンテーション";
            case "zh_CHT":
                return "重新分片";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Refragment";
        }
    }

    public get 阅读() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "阅读";
            case "es_ES":
                return "Leer";
            case "fr_FR":
                return "Lire";
            case "ja_JP":
                return "読む";
            case "zh_CHT":
                return "閱讀";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Read";
        }
    }

    public get 断句() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "断句";
            case "es_ES":
                return "Segmentación de frases";
            case "fr_FR":
                return "Segmentation de phrases";
            case "ja_JP":
                return "フレーズのセグメンテーション";
            case "zh_CHT":
                return "斷句";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Sentence segmentation";
        }
    }
    public get 末尾() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "末尾块";
            case "es_ES":
                return "último bloque";
            case "fr_FR":
                return "dernier bloc";
            case "ja_JP":
                return "最後のブロック";
            case "zh_CHT":
                return "最後一個塊";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "last block";
        }
    }
    public get 标号() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "添加标号";
            case "es_ES":
                return "Agregar etiqueta";
            case "fr_FR":
                return "Ajouter une étiquette";
            case "ja_JP":
                return "ラベルを追加";
            case "zh_CHT":
                return "添加標號";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Add label";
        }
    }

    public get 忽略() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "忽略";
            case "es_ES":
                return "Ignorar";
            case "fr_FR":
                return "Ignorer";
            case "ja_JP":
                return "無視する";
            case "zh_CHT":
                return "忽略";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Ignore";
        }
    }

    public get 进度() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "进度";
            case "es_ES":
                return "Progreso";
            case "fr_FR":
                return "Progression";
            case "ja_JP":
                return "進行状況";
            case "zh_CHT":
                return "進度";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Progress";
        }
    }

    public get 书名() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "书名";
            case "es_ES":
                return "Título del libro";
            case "fr_FR":
                return "Titre du livre";
            case "ja_JP":
                return "書籍名";
            case "zh_CHT":
                return "書名";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Book title";
        }
    }

    public get 只删除记录与辅助数据不删除分片不删除闪卡等删除() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "只删除记录与辅助数据，不删除分片，不删除闪卡等。<br>删除：";
            case "es_ES":
                return "Solo elimina registros y datos auxiliares, no elimina fragmentos, tarjetas, etc.<br>Eliminar:";
            case "fr_FR":
                return "Supprime uniquement les enregistrements et les données d'assistance, sans supprimer les fragments, les cartes, etc.<br>Supprimer:";
            case "ja_JP":
                return "レコードと補助データのみを削除し、フラグメントやカードなどは削除しません。<br>削除：";
            case "zh_CHT":
                return "只刪除記錄與輔助數據，不刪除分片，不刪除閃卡等。<br>刪除：";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Only delete records and auxiliary data, do not delete fragments, flash cards, etc.<br>Delete:";
        }
    }

    public get 找不到此书籍() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "找不到此书籍";
            case "es_ES":
                return "No se puede encontrar este libro";
            case "fr_FR":
                return "Impossible de trouver ce livre";
            case "ja_JP":
                return "この本が見つかりません";
            case "zh_CHT":
                return "找不到此書籍";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Cannot find this book";
        }
    }

    public x处修改完成(total: string) {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return `${total}处修改完成！`;
            case "es_ES":
                return `${total} cambios realizados!`;
            case "fr_FR":
                return `${total} modifications effectuées!`;
            case "ja_JP":
                return `${total}箇所の変更が完了しました！`;
            case "zh_CHT":
                return `${total}處修改完成！`;
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return `${total} changes made!`;
        }
    }

    public get 扫描索引中请耐心等待() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "扫描索引中，请耐心等待……";
            case "es_ES":
                return "Indexando, por favor espere...";
            case "fr_FR":
                return "Indexation en cours, veuillez patienter...";
            case "ja_JP":
                return "インデックス作成中、お待ちください...";
            case "zh_CHT":
                return "掃描索引中，請耐心等待……";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Indexing, please wait...";
        }
    }

    public get 正在替换start与add替换为超链接() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "正在替换'*'与'@'替换为超链接……";
            case "es_ES":
                return "Reemplazando '*' y '@' con enlaces...";
            case "fr_FR":
                return "Remplacement de '*' et '@' par des liens...";
            case "ja_JP":
                return "'*'と'@'をリンクに置き換え中...";
            case "zh_CHT":
                return "正在替換'*'與'@'替換為超連結……";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Replacing '*' and '@' with links...";
        }
    }

    public get 即将创建本地备份() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "即将创建本地备份";
            case "es_ES":
                return "Creando una copia de seguridad local...";
            case "fr_FR":
                return "Création d'une sauvegarde locale...";
            case "ja_JP":
                return "ローカルバックアップを作成します...";
            case "zh_CHT":
                return "即將創建本地備份";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Creating a local backup...";
        }
    }

    public get startAdd替换为超链接() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "⚠️'*'与'@'替换为超链接";
            case "es_ES":
                return "⚠️'*' y '@' se reemplazan por enlaces";
            case "fr_FR":
                return "⚠️'*' et '@' sont remplacés par des liens";
            case "ja_JP":
                return "⚠️'*'と'@'はリンクに置き換えられます";
            case "zh_CHT":
                return "⚠️'*'與'@'替換為超連結";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "⚠️'*' and '@' are replaced with links";
        }
    }

    public get 给分片内段落标上序号() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "给分片内段落标上序号";
            case "es_ES":
                return "Numerando párrafos en fragmentos";
            case "fr_FR":
                return "Numérotation des paragraphes dans les fragments";
            case "ja_JP":
                return "フラグメント内の段落に番号を付ける";
            case "zh_CHT":
                return "給分片內段落標上序號";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Numbering paragraphs in fragments";
        }
    }

    public get 自动断句() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "自动断句";
            case "es_ES":
                return "Autopuntuación";
            case "fr_FR":
                return "Auto-punctuation";
            case "ja_JP":
                return "自動句点";
            case "zh_CHT":
                return "自動斷句";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Auto-punctuation";
        }
    }

    public get cancel取消() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "取消";
            case "es_ES":
                return "cancelar";
            case "fr_FR":
                return "annuler";
            case "ja_JP":
                return "キャンセル";
            case "zh_CHT":
                return "取消";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "cancel";
        }
    }
    public get 显示上一分片最后一个内容块() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "显示上一分片最后一个内容块";
            case "es_ES":
                return "mostrar el último bloque de contenido del fragmento anterior";
            case "fr_FR":
                return "afficher le dernier bloc de contenu du fragment précédent";
            case "ja_JP":
                return "前のフラグメントの最後のコンテンツブロックを表示";
            case "zh_CHT":
                return "顯示上一分片最後一個內容塊";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "show the last content block of the previous fragment";
        }
    }
    public get 断句为无序表() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "断句为无序表";
            case "es_ES":
                return "frasear como lista desordenada";
            case "fr_FR":
                return "phraser comme une liste non ordonnée";
            case "ja_JP":
                return "無秩序なリストとしてフレーズ";
            case "zh_CHT":
                return "斷句為無序表";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "phrase as an unordered list";
        }
    }
    public get 断句为任务块() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "断句为任务块";
            case "es_ES":
                return "frasear como bloque de tarea";
            case "fr_FR":
                return "phraser comme un bloc de tâche";
            case "ja_JP":
                return "タスクブロックとしてフレーズ";
            case "zh_CHT":
                return "斷句為任務塊";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "phrase as a task block";
        }
    }
    public get 断句为段落块() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "断句为段落块";
            case "es_ES":
                return "frasear como bloque de párrafo";
            case "fr_FR":
                return "phraser comme un bloc de paragraphe";
            case "ja_JP":
                return "段落ブロックとしてフレーズ";
            case "zh_CHT":
                return "斷句為段落塊";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "phrase as a paragraph block";
        }
    }
    public get 不断句() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "不断句";
            case "es_ES":
                return "no frases";
            case "fr_FR":
                return "pas de phrases";
            case "ja_JP":
                return "フレーズなし";
            case "zh_CHT":
                return "不斷句";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "no phrases";
        }
    }
    public get 新建分片时给段落标上序号() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "新建分片时，给段落标上序号";
            case "es_ES":
                return "al crear un nuevo fragmento, numerar los párrafos";
            case "fr_FR":
                return "lors de la création d'un nouveau fragment, numéroter les paragraphes";
            case "ja_JP":
                return "新しいフラグメントを作成するときに段落に番号をつける";
            case "zh_CHT":
                return "新建分片時，給段落標上序號";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "when creating a new fragment, number the paragraphs";
        }
    }
    public get 把阅读到的分片设置为闪卡() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "把阅读到的分片设置为闪卡";
            case "es_ES":
                return "Establecer el fragmento leído como tarjeta de memoria";
            case "fr_FR":
                return "Définir le fragment lu comme flashcard";
            case "ja_JP":
                return "読んだフラグメントをフラッシュカードに設定する";
            case "zh_CHT":
                return "將讀到的片段設置為閃卡";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Set the read fragment as flashcard";
        }
    }

   

    public get 移动到下一分片内() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "移动到下一分片内";
            case "es_ES":
                return "Mover al siguiente fragmento";
            case "fr_FR":
                return "Passer au fragment suivant";
            case "ja_JP":
                return "次のフラグメントに移動する";
            case "zh_CHT":
                return "移動到下一片段內";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Move to the next fragment";
        }
    }

    public get 移动到上一分片内() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "移动到上一分片内";
            case "es_ES":
                return "Mover al fragmento anterior";
            case "fr_FR":
                return "Passer au fragment précédent";
            case "ja_JP":
                return "前のフラグメントに移動する";
            case "zh_CHT":
                return "移動到上一片段內";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Move to the previous fragment";
        }
    }

    public get 构建打开目录中请稍后片刻() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "构建/打开目录中，请稍后片刻……";
            case "es_ES":
                return "Construyendo/abriendo el directorio, por favor espere un momento...";
            case "fr_FR":
                return "Construction/ouverture du répertoire, veuillez patienter un instant...";
            case "ja_JP":
                return "ディレクトリを作成/開く中、少々お待ちください...";
            case "zh_CHT":
                return "建立/開啟目錄中，請稍後片刻……";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Building/opening directory, please wait a moment...";
        }
    }

    public get 首次构建目录请稍后片刻() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "首次，构建目录，请稍后片刻……";
            case "es_ES":
                return "Primera vez, construyendo el directorio, por favor espere un momento...";
            case "fr_FR":
                return "Première fois, construction du répertoire, veuillez patienter un instant...";
            case "ja_JP":
                return "初めて、ディレクトリを作成中、少々お待ちください...";
            case "zh_CHT":
                return "首次，建立目錄，請稍後片刻……";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "First time, building directory, please wait a moment...";
        }
    }

    public get 找不到分片内容() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "找不到分片内容";
            case "es_ES":
                return "No se puede encontrar el contenido del fragmento";
            case "fr_FR":
                return "Contenu du fragment introuvable";
            case "ja_JP":
                return "フラグメントの内容が見つかりません";
            case "zh_CHT":
                return "找不到片段內容";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Cannot find fragment content"
        }
    }

    public get 各级标题数() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "各级标题数";
            case "es_ES":
                return "Número de títulos de cada nivel";
            case "fr_FR":
                return "Nombre de titres de chaque niveau";
            case "ja_JP":
                return "各レベルのタイトル数";
            case "zh_CHT":
                return "各級標題數";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Number of titles at each level"
        }
    }

    public get 总内容块数() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "总内容块数";
            case "es_ES":
                return "Número total de bloques de contenido";
            case "fr_FR":
                return "Nombre total de blocs de contenu";
            case "ja_JP":
                return "総コンテンツブロック数";
            case "zh_CHT":
                return "總內容塊數";
            case "it_IT":
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Total number of content blocks"
        }
    }
    public get 跳到分片或回到原文() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "跳到分片或回到原文";
            case "es_ES":
                return "Saltar al fragmento o volver al texto original";
            case "fr_FR":
                return "Aller au fragment ou revenir au texte original";
            case "ja_JP":
                return "フラグメントにジャンプまたは原文に戻る";
            case "zh_CHT":
                return "跳到分片或回到原文";
            case "it_IT":
                return "Vai al frammento o torna al testo originale";
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Jump to fragment or return to original text";
        }
    }
    public get 提取笔记到底部() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "提取笔记到底部";
            case "es_ES":
                return "Mover nota al final";
            case "fr_FR":
                return "Déplacer la note vers le bas";
            case "ja_JP":
                return "ノートを最下行に移動";
            case "zh_CHT":
                return "將筆記移到底部";
            case "it_IT":
                return "Sposta appunto in fondo";
            case "de_DE":
            case "he_IL":
            case "ru_RU":
            case "pl_PL":
            case "en_US":
            default:
                return "Move note to bottom";
        }
    }
    public get 新闪卡存入的笔记本ID() {
        // 补充缺少的语言
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "新闪卡存入的笔记本ID";
            case "es_ES":
                return "ID del cuaderno donde se guarda la nueva tarjeta flash";
            case "fr_FR":
                return "ID du carnet dans lequel la nouvelle carte flash est enregistrée";
            case "ja_JP":
                return "新しいフラッシュカードが保存されるノートブックのID";
            case "zh_CHT":
                return "新閃卡存入的筆記本ID";
            case "it_IT":
                return "ID del notebook in cui viene salvata la nuova scheda flash";
            case "de_DE":
                return "ID des Notizbuchs, in das die neue Flash-Karte gespeichert wird";
            case "he_IL":
                return "מזהה الدفتر الذي يتم حفظ بطاقة الفلاش الجديدة فيه"; // 注意：此翻译使用了从右向左书写的希伯来语
            case "ru_RU":
                return "ID блокнота, в который сохраняется новая флеш-карта";
            case "pl_PL":
                return "ID notesa, do którego zapisywana jest nowa karta flash";
            case "en_US":
            default:
                return "Notebook ID where the new flash card is saved";
        }
    }
    public get 右键菜单把内容移动到相邻分片中() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "右键菜单：把内容移动到相邻分片中";
            case "es_ES":
                return "Menú contextual: Mover contenido a la partición adyacente";
            case "fr_FR":
                return "Menu contextuel : Déplacer le contenu vers la partition adjacente";
            case "ja_JP":
                return "右クリックメニュー：コンテンツを隣接するパーティションに移動";
            case "zh_CHT":
                return "右鍵菜單：將內容移動到相鄰分片中";
            case "it_IT":
                return "Menu contestuale: Sposta il contenuto nella partizione adiacente";
            case "de_DE":
                return "Kontextmenü: Inhalt in die benachbarte Partition verschieben";
            case "he_IL":
                return "תפריט ימני: העבר תוכן לחלוקה הסמוכה";
            case "ru_RU":
                return "Контекстное меню: Переместить содержимое в соседний раздел";
            case "pl_PL":
                return "Menu podręczne: Przenieś zawartość do sąsiedniej partycji";
            case "en_US":
            default:
                return "Context menu: Move content to the adjacent shard";
        }
    }
    public get 收集内容到文件() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "收集内容到文件";
            case "es_ES": return "Recopilar contenido en un archivo";
            case "fr_FR": return "Collecter le contenu dans un fichier";
            case "ja_JP": return "コンテンツをファイルに収集";
            case "zh_CHT": return "收集內容到檔案";
            case "it_IT": return "Raccogli contenuto in un file";
            case "de_DE": return "Inhalt in eine Datei sammeln";
            case "he_IL": return "לאסוף תוכן לקובץ";
            case "ru_RU": return "Собрать содержимое в файл";
            case "pl_PL": return "Zbierz zawartość do pliku";
            case "en_US":
            default: return "Collect content to a file";
        }
    }
    public get 收集内容到文件功能总是收集到dailynote() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "收集内容到文件功能，总是收集到dailynote";
            case "es_ES": return "La función de recopilar contenido en archivos siempre recopila en dailynote";
            case "fr_FR": return "La fonction de collecte de contenu vers les fichiers collecte toujours vers dailynote";
            case "ja_JP": return "ファイルへの内容収集機能は常にdailynoteに収集します";
            case "zh_CHT": return "收集內容到文件功能，總是收集到dailynote";
            case "it_IT": return "La funzione di raccolta contenuti in file raccoglie sempre in dailynote";
            case "de_DE": return "Die Funktion \"Inhalte in Dateien sammeln\" sammelt immer in dailynote";
            case "he_IL": return "פונקציית איסוף תוכן לקובץ תמיד אוספת ל-dailynote";
            case "ru_RU": return "Функция сбора содержимого в файлы всегда собирает в dailynote";
            case "pl_PL": return "Funkcja zbierania treści do plików zawsze zbiera do dailynote";
            case "en_US":
            default: return "Collect content to file feature always collects to dailynote";
        }
    }

    public get 启用菜单() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "启用菜单";
            case "es_ES": return "Habilitar menú";
            case "fr_FR": return "Activer le menu";
            case "ja_JP": return "メニューを有効にする";
            case "zh_CHT": return "啟用菜單";
            case "it_IT": return "Abilita menu";
            case "de_DE": return "Menü aktivieren";
            case "he_IL": return "הפעל תפריט";
            case "ru_RU": return "Включить меню";
            case "pl_PL": return "Włącz menu";
            case "en_US":
            default: return "Enable menu";
        }
    }

    public get 制卡() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "制卡";
            case "es_ES": return "Crear tarjeta";
            case "fr_FR": return "Créer une carte";
            case "ja_JP": return "カード作成";
            case "zh_CHT": return "製卡";
            case "it_IT": return "Crea carta";
            case "de_DE": return "Karte erstellen";
            case "he_IL": return "צור כרטיס";
            case "ru_RU": return "Создать карту";
            case "pl_PL": return "Utwórz kartę";
            case "en_US":
            default: return "Create card";
        }
    }

    public get 原地制卡() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "原地制卡";
            case "es_ES": return "Crear tarjeta en el lugar";
            case "fr_FR": return "Créer une carte sur place";
            case "ja_JP": return "その場でカード作成";
            case "zh_CHT": return "原地製卡";
            case "it_IT": return "Crea carta sul posto";
            case "de_DE": return "Karte vor Ort erstellen";
            case "he_IL": return "צור כרטיס במקום";
            case "ru_RU": return "Создать карту на месте";
            case "pl_PL": return "Utwórz kartę na miejscu";
            case "en_US":
            default: return "Create card in place";
        }
    }
    public get 制卡并发到dailycard() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "制卡并发到dailycard";
            case "es_ES": return "Tarjeta de fabricación enviada a dailycard";
            case "fr_FR": return "Carte fabriquée envoyée à dailycard";
            case "ja_JP": return "カード作成してdailycardに送信";
            case "zh_CHT": return "製卡併發到dailycard";
            case "it_IT": return "Carta prodotta inviata a dailycard";
            case "de_DE": return "Karte hergestellt und an dailycard gesendet";
            case "he_IL": return "כרטיס מיוצר נשלח ל-dailycard";
            case "ru_RU": return "Изготовленная карта отправлена в dailycard";
            case "pl_PL": return "Wyprodukowana karta wysłana do dailycard";
            case "en_US":
            default: return "Card made and sent to dailycard";
        }
    }
    public get 制卡并发到dailycard无引用() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "制卡并发到dailycard(无引用)";
            case "es_ES": return "Tarjeta de fabricación enviada a dailycard (sin referencia)";
            case "fr_FR": return "Carte fabriquée envoyée à dailycard (sans référence)";
            case "ja_JP": return "カード作成してdailycardに送信(参照なし)";
            case "zh_CHT": return "製卡併發到dailycard(無引用)";
            case "it_IT": return "Carta prodotta inviata a dailycard (senza riferimento)";
            case "de_DE": return "Karte hergestellt und an dailycard gesendet (ohne Referenz)";
            case "he_IL": return "כרטיס מיוצר נשלח ל-dailycard (ללא הפניה)";
            case "ru_RU": return "Изготовленная карта отправлена в dailycard (без ссылки)";
            case "pl_PL": return "Wyprodukowana karta wysłana do dailycard (bez referencji)";
            case "en_US":
            default: return "Card made and sent to dailycard (no reference)";
        }
    }
    public get 多行标记() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "多行标记";
            case "es_ES": return "Marcado multilínea";
            case "fr_FR": return "Marquage multiligne";
            case "ja_JP": return "複数行マーク";
            case "zh_CHT": return "多行標記";
            case "it_IT": return "Marcatura multiriga";
            case "de_DE": return "Mehrzeilen-Markierung";
            case "he_IL": return "סימון מרובה שורות";
            case "ru_RU": return "Многострочная маркировка";
            case "pl_PL": return "Znacznik wieloliniowy";
            case "en_US":
            default: return "Multi-line mark";
        }
    }
    public get 二次使用为取消效果() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "二次使用为取消效果";
            case "es_ES": return "El segundo uso cancela el efecto";
            case "fr_FR": return "La deuxième utilisation annule l'effet";
            case "ja_JP": return "2回目の使用で効果をキャンセル";
            case "zh_CHT": return "二次使用為取消效果";
            case "it_IT": return "Il secondo uso annulla l'effetto";
            case "de_DE": return "Zweite Nutzung hebt den Effekt auf";
            case "he_IL": return "שימוש שני מבטל את האפקט";
            case "ru_RU": return "Повторное использование отменяет эффект";
            case "pl_PL": return "Drugie użycie anuluje efekt";
            case "en_US":
            default: return "Second use cancels the effect";
        }
    }
    public get 请先配置AI() {
        switch (this.conf.appearance.lang) {
            case "zh_CN": return "请先配置思源本体的AI";
            case "es_ES": return "Por favor, primero configure la IA de Siyuan";
            case "fr_FR": return "Veuillez d'abord configurer l'IA de Siyuan";
            case "ja_JP": return "最初に、思源のAIを設定してください";
            case "zh_CHT": return "請先配置思源本體的AI";
            case "it_IT": return "Per favore, configura prima l'IA di Siyuan";
            case "de_DE": return "Bitte konfigurieren Sie zunächst die KI von Siyuan";
            case "he_IL": return "먼저 사전 설정을 완료해주세요 시스템";
            case "ru_RU": return "Сначала настройте ИИ Сивань";
            case "pl_PL": return "Najpierw skonfiguruj sztuczną inteligencję Siyuan";
            case "en_US":
            default: return "Please first configure the AI of Siyuan";
        }
    }


}
