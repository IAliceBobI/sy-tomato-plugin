import { TomatoI18nABC5 } from "./text5";

export abstract class TomatoI18nABC4 extends TomatoI18nABC5 {
   

    public get 闪念插入到Dailynote顶端() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "闪念插入到Dailynote顶端。";
            case "es_ES":
                return "Insertar flash en la parte superior de Dailynote.";
            case "fr_FR":
                return "Insérer le flash en haut de Dailynote.";
            case "ja_JP":
                return "フラッシュをDailynoteの先頭に挿入します。";
            case "zh_CHT":
                return "閃念插入到Dailynote頂端。";

            default:
                return "Insert flash at the top of Dailynote.";
        }
    }
    public get 显示闪念的时间与类型() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "显示闪念的时间与类型。";
            case "es_ES":
                return "Mostrar el tiempo y tipo de la idea.";
            case "fr_FR":
                return "Afficher le temps et le type de l'éclair.";
            case "ja_JP":
                return "フラッシュの時間とタイプを表示します。";
            case "zh_CHT":
                return "顯示閃念的時間與類型。";

            default:
                return "Display the time and type of the flash.";
        }
    }

    public get 闪念插入到文件() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "闪念插入到文件，填入文件名（无路径，无后缀）（留空为插入到当天dailynote）";
            case "es_ES":
                return "Insertar la idea en el archivo, introduzca el nombre del archivo (sin ruta, sin extensión) (dejar en blanco para insertar en la nota diaria de hoy)";
            case "fr_FR":
                return "Insérer l'éclair dans le fichier, entrer le nom du fichier (sans chemin, sans extension) (laisser vide pour insérer dans la note quotidienne d'aujourd'hui)";
            case "ja_JP":
                return "フラッシュをファイルに挿入し、ファイル名を入力します（パスなし、拡張子なし）（空白の場合は今日のdailynoteに挿入します）";
            case "zh_CHT":
                return "閃念插入到文件，填入文件名（無路徑，無後綴）（留空為插入到當天dailynote）";

            default:
                return "Insert the flash into the file, enter the filename (no path, no suffix) (leave blank to insert into today's dailynote)";
        }
    }

    public get 列表工具() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "列表工具";
            case "es_ES":
                return "Herramientas de lista";
            case "fr_FR":
                return "Outils de liste";
            case "ja_JP":
                return "リストツール";
            case "zh_CHT":
                return "列表工具";

            default:
                return "List Tools";
        }
    }

    public get 阻止连续回车断开列表() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "阻止连续回车断开列表。(若想从中间断开列表：shift+tab)";
            case "es_ES":
                return "Evitar que los retornos consecutivos rompan la lista. (Si quieres romper la lista desde el medio: shift+tab)";
            case "fr_FR":
                return "Empêcher que des retours consécutifs ne cassent la liste. (Si vous voulez casser la liste depuis le milieu : shift+tab)";
            case "ja_JP":
                return "連続したエンターキーでリストが切断されるのを防ぎます。(リストを途中で切断する場合：shift+tab)";
            case "zh_CHT":
                return "阻止連續回車斷開列表。(若想從中間斷開列表：shift+tab)";

            default:
                return "Prevent continuous enter from breaking the list. (If you want to break the list from the middle: shift+tab)";
        }
    }

    public get 注册文心() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "注册Ernie AI：注册后，创建应用，复制API Key与Secret Key即可";
            case "es_ES":
                return "Registrar Ernie AI: después de registrarse, cree una aplicación, copie la API Key y la Secret Key";
            case "fr_FR":
                return "Inscription à Ernie AI : après l'inscription, créez une application, copiez la clé API et la clé secrète";
            case "ja_JP":
                return "Ernie AIに登録：登録後、アプリケーションを作成し、APIキーとシークレットキーをコピーします";
            case "zh_CHT":
                return "註冊Ernie AI：註冊後，創建應用，複製API Key與Secret Key即可";

            default:
                return "Register Ernie AI: After registering, create an application, copy the API Key and Secret Key";
        }
    }

    public get 注册Deepseek创建APIKey() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "注册 Deepseek，创建 API Key";
            case "es_ES":
                return "Registrar Deepseek, crear API Key";
            case "fr_FR":
                return "Inscrivez-vous à Deepseek, créez une clé API";
            case "ja_JP":
                return "Deepseekに登録し、APIキーを作成します";
            case "zh_CHT":
                return "註冊 Deepseek，創建 API Key";

            default:
                return "Register Deepseek, create API Key";
        }
    }

    public get 注册moonshot创建APIKey() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "注册 moonshot，创建 API Key";
            case "es_ES":
                return "Registrar moonshot, crear API Key";
            case "fr_FR":
                return "Inscrivez-vous à moonshot, créez une clé API";
            case "ja_JP":
                return "moonshotに登録し、APIキーを作成します";
            case "zh_CHT":
                return "註冊 moonshot，創建 API Key";

            default:
                return "Register moonshot, create API Key";
        }
    }
    public get 请先选中块() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "请先选中段落块";
            case "es_ES":
                return "Por favor, seleccione primero un bloque"; // 西班牙语：请先选中块  
            case "fr_FR":
                return "Veuillez sélectionner un bloc avant"; // 法语：请先选中块  
            case "ja_JP":
                return "まずブロックを選択してください"; // 日语：请先选中块  
            case "zh_CHT":
                return "請先選中段落塊"; // 繁体中文：请先选中块  
            case "it_IT":
                return "Per favore, selezionare prima un blocco"; // 意大利语：请先选中块  

            default:
                return "Please select a block first"; // 英语（美国）：请先选中块  
        }
    }

    public get 创建往返链成功() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "创建往返链成功";
            case "es_ES":
                return "Creación exitosa de la cadena de ida y vuelta";
            case "fr_FR":
                return "Création réussie de la chaîne aller-retour";
            case "ja_JP":
                return "往復チェーンの作成に成功しました";
            case "zh_CHT":
                return "創建往返鏈成功";

            default:
                return "Successful creation of round trip chain";
        }
    }

    public get 静态反链() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "静态反链";
            case "es_ES":
                return "Enlace inverso estático";
            case "fr_FR":
                return "Lien inverse statique";
            case "ja_JP":
                return "静的逆リンク";
            case "zh_CHT":
                return "靜態反鏈";

            default:
                return "Static backlink";
        }
    }

    public get 禁用底部反链() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "禁用底部反链";
            case "es_ES":
                return "Desactivar el enlace inverso inferior";
            case "fr_FR":
                return "Désactiver le lien inverse en bas";
            case "ja_JP":
                return "下部の逆リンクを無効にする";
            case "zh_CHT":
                return "禁用底部反鏈";

            default:
                return "Disable bottom backlink";
        }
    }

    public get 启用底部反链() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "启用底部反链";
            case "es_ES":
                return "Activar el enlace inverso inferior";
            case "fr_FR":
                return "Activer le lien inverse en bas";
            case "ja_JP":
                return "下部の逆リンクを有効にする";
            case "zh_CHT":
                return "啟用底部反鏈";

            default:
                return "Enable bottom backlink";
        }
    }

    public get 把文档内容移动到这里() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "把文档内容移动到这里";
            case "es_ES":
                return "Mover el contenido del documento aquí";
            case "fr_FR":
                return "Déplacer le contenu du document ici";
            case "ja_JP":
                return "ドキュメントの内容をここに移動する";
            case "zh_CHT":
                return "把文檔內容移動到這裡";

            default:
                return "Move the document content here";
        }
    }
    public get 填入要被清空的文档的ID文档里面的块ID也行会最终得到文档ID() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "填入要被清空的文档的ID，文档里面的块ID也行，会最终得到文档ID";
            case "es_ES":
                return "Ingrese el ID del documento a vaciar, también puede ingresar el ID del bloque dentro del documento, finalmente obtendrá el ID del documento";
            case "fr_FR":
                return "Entrez l'ID du document à vider, vous pouvez également entrer l'ID du bloc dans le document, vous obtiendrez finalement l'ID du document";
            case "ja_JP":
                return "空にする文書のIDを入力してください。文書内のブロックIDも可能です。最終的に文書IDを取得します";
            case "zh_CHT":
                return "輸入要被清空的文件的ID，文件裡面的塊ID也行，會最終得到文件ID";

            default:
                return "Enter the ID of the document to be emptied, you can also enter the block ID inside the document, you will ultimately get the document ID";
        }
    }

    public get 合并文档到这里() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "合并文档到这里，内容属性引用";
            case "es_ES":
                return "Fusionar el documento aquí, referencia de atributo de contenido";
            case "fr_FR":
                return "Fusionner le document ici, référence d'attribut de contenu";
            case "ja_JP":
                return "ここにドキュメントをマージ、コンテンツ属性の参照";
            case "zh_CHT":
                return "合併文件到這裡，內容屬性引用";

            default:
                return "Merge document here, content attribute reference";
        }
    }

    public get 刷新静态反链() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "刷新静态反链";
            case "es_ES":
                return "Actualizar enlaces inversos estáticos";
            case "fr_FR":
                return "Rafraîchir les liens inverses statiques";
            case "ja_JP":
                return "静的バックリンクを更新";
            case "zh_CHT":
                return "刷新靜態反鏈";

            default:
                return "Refresh static backlinks";
        }
    }

    public get 删除静态反链() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "删除静态反链";
            case "es_ES":
                return "Eliminar enlaces inversos estáticos";
            case "fr_FR":
                return "Supprimer les liens inverses statiques";
            case "ja_JP":
                return "静的バックリンクを削除";
            case "zh_CHT":
                return "刪除靜態反鏈";

            default:
                return "Delete static backlinks";
        }
    }
    public get 插入空的脑图流程图文件() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "插入空的脑图、流程图文件";
            case "es_ES":
                return "Insertar un archivo de diagrama mental o flujo vacío";
            case "fr_FR":
                return "Insérer un fichier de carte mentale ou de flux vide";
            case "ja_JP":
                return "空のマインドマップ・フローチャートファイルを挿入";
            case "zh_CHT":
                return "插入空的腦圖、流程圖文件";

            default:
                return "Insert empty mind map/flowchart file";
        }
    }
    public get 脑图名字() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "填写文件名。后缀为 '.xmind' 或 '.drawio'";
            case "es_ES":
                return "Escriba el nombre del archivo. La extensión es '.xmind' o '.drawio'";
            case "fr_FR":
                return "Entrez le nom du fichier. L'extension est '.xmind' ou '.drawio'";
            case "ja_JP":
                return "ファイル名を入力してください。拡張子は '.xmind' または '.drawio'";
            case "zh_CHT":
                return "填寫文件名。後綴為 '.xmind' 或 '.drawio'";

            default:
                return "Enter file name. The extension is '.xmind' or '.drawio'";
        }
    }
    public get SEARCH_HELP() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return `
<div class="b3-dialog__content">
<p>
    <strong>输入的<span class="fn__code">关键词</span>之间用
    <span class="fn__code">空格</span>隔开，
    如果关键词前面加上<span class="fn__code">感叹号</span>，
    代表反链中不能有此关键词。</strong></p>
<br>
<p>
<strong>比如：</strong> <span class="fn__code">小明 小红 !老王 !王总</span>，
将搜索到包含<span class="fn__code">小明</span>，
并且包含<span class="fn__code">小红</span>，
但不包含<span class="fn__code">老王</span>，
也不包含<span class="fn__code">王总</span>的反链。</p>
<br>

<p>
<strong>多个关键词之间用<span class="fn__code">|</span>切分，
代表这些关键词只要有一个出现即可。</strong></p>
<br>
<p>
    <strong>比如：</strong> 
    <span class="fn__code">小明 小红|如花|秋菊 !老王 !王总</span>，
    将搜索到包含<span class="fn__code">小明</span>，
    并且至少包含<span class="fn__code">小红</span>、
    <span class="fn__code">如花</span>、
    <span class="fn__code">秋菊</span>中一个，
    但不包含<span class="fn__code">老王</span>，
    也不包含<span class="fn__code">王总</span>的反链。</p>
<br>
</div>
`;
            case "es_ES":
                return `
<div class="b3-dialog__content">
<p>
    <strong>Introduce las <span class="fn__code">palabras clave</span> separadas por
    <span class="fn__code">espacios</span>,
    si una palabra clave lleva un <span class="fn__code">signo de exclamación</span> delante,
    significa que esta palabra clave no puede aparecer en el enlace de retroceso.</strong></p>
<br>
<p>
<strong>Por ejemplo:</strong> <span class="fn__code">Pepe María !Juan !Jefe</span>,
buscará enlaces de retroceso que contengan <span class="fn__code">Pepe</span>,
y <span class="fn__code">María</span>,
pero no <span class="fn__code">Juan</span>,
ni <span class="fn__code">Jefe</span>.</p>
<br>

<p>
<strong>Para buscar cualquiera de varias palabras clave, sepáralas con un <span class="fn__code">|</span>.</strong></p>
<br>
<p>
    <strong>Por ejemplo:</strong> 
    <span class="fn__code">Pepe María|Ana|Luisa !Juan !Jefe</span>,
    buscará enlaces de retroceso que contengan <span class="fn__code">Pepe</span> y al menos uno de <span class="fn__code">María</span>, <span class="fn__code">Ana</span>, o <span class="fn__code">Luisa</span>,
    pero no <span class="fn__code">Juan</span>,
    ni <span class="fn__code">Jefe</span>.</p>
<br>
</div>
`;
            case "fr_FR":
                return `
<div class="b3-dialog__content">
<p>
    <strong>Entrez les <span class="fn__code">mots clés</span> séparés par des
    <span class="fn__code">espaces</span>,
    si un mot clé est précédé d'un <span class="fn__code">point d'exclamation</span>,
    cela signifie que ce mot clé ne peut pas apparaître dans le backlink.</strong></p>
<br>
<p>
<strong>Par exemple :</strong> <span class="fn__code">Paul Marie !Jean !Chef</span>,
recherchera les backlinks contenant <span class="fn__code">Paul</span>,
et <span class="fn__code">Marie</span>,
mais pas <span class="fn__code">Jean</span>,
ni <span class="fn__code">Chef</span>.</p>
<br>

<p>
<strong>Pour rechercher plusieurs mots clés, séparez-les par un <span class="fn__code">|</span>.</strong></p>
<br>
<p>
    <strong>Par exemple :</strong> 
    <span class="fn__code">Paul Marie|Anne|Louise !Jean !Chef</span>,
    recherchera les backlinks contenant <span class="fn__code">Paul</span> et au moins un de <span class="fn__code">Marie</span>, <span class="fn__code">Anne</span>, ou <span class="fn__code">Louise</span>,
    mais pas <span class="fn__code">Jean</span>,
    ni <span class="fn__code">Chef</span>.</p>
<br>
</div>
`;
            case "ja_JP":
                return `
<div class="b3-dialog__content">
<p>
    <strong><span class="fn__code">キーワード</span>を
    <span class="fn__code">スペース</span>で区切って入力してください。
    キーワードの前に<span class="fn__code">感嘆符</span>をつけると、
    そのキーワードを含まないバックリンクが検索されます。</strong></p>
<br>
<p>
<strong>例えば：</strong> <span class="fn__code">シンジ ミサト !ゲンドウ !総司令</span>と入力すると、<span class="fn__code">シンジ</span>と<span class="fn__code">ミサト</span>を含み、<span class="fn__code">ゲンドウ</span>と<span class="fn__code">総司令</span>を含まないバックリンクが検索されます。</p>
<br>

<p>
<strong>複数のキーワードを<span class="fn__code">|</span>で区切ると、
それらのキーワードのいずれかが含まれていればよいです。</strong></p>
<br>
<p>
    <strong>例えば：</strong> 
    <span class="fn__code">シンジ ミサト|レイ|アスカ !ゲンドウ !総司令</span>と入力すると、<span class="fn__code">シンジ</span>と<span class="fn__code">ミサト</span>、<span class="fn__code">レイ</span>、<span class="fn__code">アスカ</span>のいずれかを含み、<span class="fn__code">ゲンドウ</span>と<span class="fn__code">総司令</span>を含まないバックリンクが検索されます。</p>
<br>
</div>
`;
            case "zh_CHT":
                return `
<div class="b3-dialog__content">
<p>
    <strong>輸入的<span class="fn__code">關鍵詞</span>之間用
    <span class="fn__code">空格</span>隔開，
    如果關鍵詞前面加上<span class="fn__code">驚嘆號</span>，
    代表反鏈中不能有此關鍵詞。</strong></p>
<br>
<p>
<strong>比如：</strong> <span class="fn__code">小明 小紅 !老王 !王總</span>，
將搜索到包含<span class="fn__code">小明</span>，
並且包含<span class="fn__code">小紅</span>，
但不包含<span class="fn__code">老王</span>，
也不包含<span class="fn__code">王總</span>的反鏈。</p>
<br>

<p>
<strong>多個關鍵詞之間用<span class="fn__code">|</span>切分，
代表這些關鍵詞只要有一個出現即可。</strong></p>
<br>
<p>
    <strong>比如：</strong> 
    <span class="fn__code">小明 小紅|如花|秋菊 !老王 !王總</span>，
    將搜索到包含<span class="fn__code">小明</span>，
    並且至少包含<span class="fn__code">小紅</span>、
    <span class="fn__code">如花</span>、
    <span class="fn__code">秋菊</span>中一個，
    但不包含<span class="fn__code">老王</span>，
    也不包含<span class="fn__code">王總</span>的反鏈。</p>
<br>
</div>
`;

            default:
                return `
<div class="b3-dialog__content">
<p>
    <strong>Separate the entered <span class="fn__code">keywords</span> with
    <span class="fn__code">spaces</span>. If a keyword is preceded by a <span class="fn__code">!</span>,
    it means that the backlink should not contain this keyword.</strong></p>
<br>
<p>
<strong>For example:</strong> <span class="fn__code">John Mary !Oldman !Boss</span>,
will search for backlinks containing <span class="fn__code">John</span>,
and <span class="fn__code">Mary</span>,
but not containing <span class="fn__code">Oldman</span>,
nor <span class="fn__code">Boss</span>.</p>
<br>

<p>
<strong>Separate multiple keywords with a <span class="fn__code">|</span>,
it means that as long as one of these keywords appears, it will match.</strong></p>
<br>
<p>
    <strong>For example:</strong> 
    <span class="fn__code">John Mary|Rose|Autumn !Oldman !Boss</span>,
    will search for backlinks containing <span class="fn__code">John</span>,
    and at least one of <span class="fn__code">Mary</span>,
    <span class="fn__code">Rose</span> or
    <span class="fn__code">Autumn</span>,
    but not containing <span class="fn__code">Oldman</span>,
    nor <span class="fn__code">Boss</span>.</p>
<br>
</div>
`;
        }
    }

    public get 整理assets下的图片视频音频() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "整理 assets 下的图片、视频、音频";
            case "es_ES":
                return "Organizando imágenes, videos y audios en assets";
            case "fr_FR":
                return "Organiser les images, vidéos et audios dans assets";
            case "ja_JP":
                return "assetsの画像、ビデオ、オーディオを整理する";
            case "zh_CHT":
                return "整理 assets 下的圖片、視頻、音頻";

            default:
                return "Organizing images, videos, and audios under assets"
        }
    }

    public get 即将创建快照() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "即将创建快照，如果有问题，可从快照恢复。（建议自己手动 alt+h 创建快照保险一些）";
            case "es_ES":
                return "Pronto se creará una instantánea, si hay un problema, se puede restaurar desde la instantánea. (Se recomienda que cree una instantánea manualmente con alt+h para mayor seguridad)";
            case "fr_FR":
                return "Une capture sera bientôt créée, en cas de problème, vous pouvez restaurer à partir de la capture. (Il est recommandé de créer une capture manuellement avec alt+h pour plus de sécurité)";
            case "ja_JP":
                return "スナップショットを作成しようとしています。問題がある場合は、スナップショットから復元できます。（手動でalt+hを使用してスナップショットを作成することをお勧めします）";
            case "zh_CHT":
                return "即將創建快照，如果有問題，可從快照恢復。（建議自己手動 alt+h 創建快照保險一些）";

            default:
                return "About to create a snapshot, if there's a problem, you can restore from the snapshot. (It's recommended to manually create a snapshot with alt+h for more security)"
        }
    }

    public get 已经刷新虚拟引用() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "已经刷新虚拟引用";
            case "es_ES":
                return "Se han actualizado las referencias virtuales";
            case "fr_FR":
                return "Les références virtuelles ont été mises à jour";
            case "ja_JP":
                return "仮想参照が更新されました";
            case "zh_CHT":
                return "已經刷新虛擬引用";

            default:
                return "Virtual references have been refreshed"
        }
    }

    public get 正在转移引用() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "正在转移引用……";
            case "es_ES":
                return "Transfiriendo referencias...";
            case "fr_FR":
                return "Transfert des références...";
            case "ja_JP":
                return "参照を移動しています...";
            case "zh_CHT":
                return "正在轉移引用……";

            default:
                return "Transferring references..."
        }
    }

    public get 正在尝试删除闪卡() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "正在尝试删除闪卡……";
            case "es_ES":
                return "Intentando eliminar tarjetas flash...";
            case "fr_FR":
                return "Tentative de suppression des cartes flash...";
            case "ja_JP":
                return "フラッシュカードを削除しようとしています...";
            case "zh_CHT":
                return "正在嘗試刪除閃卡……";

            default:
                return "Trying to delete flashcards..."
        }
    }

    public get 正在删除老文件() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "正在删除老文件……";
            case "es_ES":
                return "Eliminando archivos antiguos...";
            case "fr_FR":
                return "Suppression des anciens fichiers...";
            case "ja_JP":
                return "古いファイルを削除しています...";
            case "zh_CHT":
                return "正在刪除老文件……";

            default:
                return "Deleting old files..."
        }
    }
    public get assets整理还在进行中() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "assets: 整理还在进行中……";
            case "es_ES":
                return "assets: La organización todavía está en progreso...";
            case "fr_FR":
                return "assets: L'organisation est toujours en cours...";
            case "ja_JP":
                return "assets: 整理はまだ進行中です...";
            case "zh_CHT":
                return "assets: 整理仍在進行中...";

            default:
                return "assets: The organization is still in progress...";
        }
    }

    public assets整理了x个文件(filesCount: number) {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return `assets: 整理了[${filesCount}]个文件`;
            case "es_ES":
                return `assets: Se han organizado [${filesCount}] archivos`;
            case "fr_FR":
                return `assets: [${filesCount}] fichiers ont été organisés`;
            case "ja_JP":
                return `assets: [${filesCount}]つのファイルを整理しました`;
            case "zh_CHT":
                return `assets: 整理了[${filesCount}]個文件`;

            default:
                return `assets: [${filesCount}] files have been organized`;
        }
    }

    public 已经处理了x个块(count: number, filesCount: number, blockCount: number) {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return `已经处理了[${count}/${filesCount}]个文件，[${blockCount}]个块。`;
            case "es_ES":
                return `Se han procesado [${count}/${filesCount}] archivos, [${blockCount}] bloques.`;
            case "fr_FR":
                return `[${count}/${filesCount}] fichiers ont été traités, [${blockCount}] blocs.`;
            case "ja_JP":
                return `[${count}/${filesCount}]つのファイル、[${blockCount}]つのブロックを処理しました。`;
            case "zh_CHT":
                return `已經處理了[${count}/${filesCount}]個文件，[${blockCount}]個塊。`;

            default:
                return `Processed [${count}/${filesCount}] files, [${blockCount}] blocks.`;
        }
    }
    public 准备删除失效闪卡(x: number) {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return `准备删除失效闪卡${x}个`;
            case "es_ES":
                return `Preparándose para eliminar ${x} tarjetas flash no válidas`;
            case "fr_FR":
                return `Préparation à la suppression de ${x} cartes flash non valides`;
            case "ja_JP":
                return `無効なフラッシュカード${x}枚を削除する準備ができています`;
            case "zh_CHT":
                return `準備刪除失效閃卡${x}個`;

            default:
                return `Preparing to delete ${x} invalid flashcards`;
        }
    }
    public get 默认关闭自动刷新() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "默认关闭自动刷新";
            case "es_ES":
                return "Deshabilitar la actualización automática por defecto";
            case "fr_FR":
                return "Désactiver le rafraîchissement automatique par défaut";
            case "ja_JP":
                return "デフォルトで自動更新を無効にする";
            case "zh_CHT":
                return "預設關閉自動刷新";

            default:
                return "Disable auto-refresh by default";
        }
    }
    public get 自动选择一个笔记本() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "自动选择一个笔记本";
            case "es_ES":
                return "Seleccionar automáticamente un cuaderno";
            case "fr_FR":
                return "Sélectionner automatiquement un cahier";
            case "ja_JP":
                return "自動的にノートを選択する";
            case "zh_CHT":
                return "自動選擇一個筆記本";

            default:
                return "Automatically select a notebook";
        }
    }
    public get 选择() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "选择";
            case "es_ES":
                return "Seleccionar";
            case "fr_FR":
                return "Sélectionner";
            case "ja_JP":
                return "選択する";
            case "zh_CHT":
                return "選擇";

            default:
                return "Select";
        }
    }
    public get 知识库问答() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "知识库问答";
            case "es_ES":
                return "Preguntas y respuestas de la base de conocimientos";
            case "fr_FR":
                return "Questions et réponses de la base de connaissances";
            case "ja_JP":
                return "知識ベースの質問と回答";
            case "zh_CHT":
                return "知識庫問答";

            default:
                return "Knowledge Base Q&A";
        }
    }
    public get 隐藏闪卡暂停按钮() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "隐藏闪卡暂停按钮";
            case "es_ES":
                return "Ocultar botón de pausa de tarjetas rápidas";
            case "fr_FR":
                return "Masquer le bouton de pause des cartes flash";
            case "ja_JP":
                return "フラッシュカードのポーズボタンを非表示";
            case "zh_CHT":
                return "隱藏閃卡暫停按鈕";

            default:
                return "Hide Flashcard Pause Button";
        }
    }

    public get 隐藏优先级滑动块() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "隐藏优先级滑动块";
            case "es_ES":
                return "Ocultar control deslizante de prioridad";
            case "fr_FR":
                return "Masquer la barre de défilement de priorité";
            case "ja_JP":
                return "優先度スライダーを非表示";
            case "zh_CHT":
                return "隱藏優先級滑動塊";

            default:
                return "Hide Priority Slider";
        }
    }
    public get 使内容模糊() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "使内容模糊";
            case "es_ES":
                return "Hacer contenido borroso";
            case "fr_FR":
                return "Rendre le contenu flou";
            case "ja_JP":
                return "コンテンツをぼやかす";
            case "zh_CHT":
                return "使內容模糊";

            default:
                return "Make content blurry";
        }
    }
    public get 请将上面的内容制作为表格() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "请将上面的内容制作为表格";
            case "es_ES":
                return "Por favor, convierte el contenido de arriba en una tabla";
            case "fr_FR":
                return "Veuillez transformer le contenu ci-dessus en tableau";
            case "ja_JP":
                return "上の内容をテーブルにまとめます";
            case "zh_CHT":
                return "請將上面的內容製成表格";

            default:
                return "Please format the above content into a table";
        }
    }
    public get 内容制表() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "把有‘|’隔开的内容制表，可选择多行";
            case "es_ES":
                return "Formatea el contenido separado por '|', puedes seleccionar múltiples líneas";
            case "fr_FR":
                return "Met en forme le contenu séparé par '|', vous pouvez sélectionner plusieurs lignes";
            case "ja_JP":
                return "'|'で区切られた内容を表形式にします。複数行を選択できます";
            case "zh_CHT":
                return "將有‘|’分隔的內容製成表格，可選擇多行";

            default:
                return "Format the content separated by '|', multi-line selection is available";
        }
    }
    public get 在文档树中定位() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "在文档树中定位";
            case "es_ES":
                return "Localizar en el árbol de documentos";
            case "fr_FR":
                return "Localiser dans l'arborescence des documents";
            case "ja_JP":
                return "ドキュメントツリーで位置を特定";
            case "zh_CHT":
                return "在文檔樹中定位";

            default:
                return "Locate in the document tree";
        }
    }
    public get 番茄钟在状态栏的右边() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "番茄钟在状态栏的右边";
            case "es_ES":
                return "El pomodoro está a la derecha de la barra de estado";
            case "fr_FR":
                return "Le pomodoro est à droite de la barre d'état";
            case "ja_JP":
                return "ステータスバーの右側にトマト時計があります";
            case "zh_CHT":
                return "番茄鐘在狀態欄的右邊";

            default:
                return "Pomodoro is on the right side of the status bar";
        }
    }
    public get 复制为图片(): string {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "复制为图片";
            case "es_ES":
                return "Copiar como imagen";
            case "fr_FR":
                return "Copier en tant qu'image";
            case "ja_JP":
                return "画像としてコピー";
            case "zh_CHT":
                return "複製為圖片";

            default:
                return "Copy as Picture";
        }
    }
    public get 正在复制为图片请等待() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "正在复制为图片请等待";
            case "es_ES":
                return "Copiando como imagen, por favor espere";
            case "fr_FR":
                return "Copie en cours sous forme d'image, veuillez patienter";
            case "ja_JP":
                return "画像としてコピー中です。お待ちください";
            case "zh_CHT":
                return "正在複製為圖片請等待";

            default:
                return "Copying as image, please wait";
        }
    }
    public get 复制完成() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "复制完成";
            case "es_ES":
                return "Copia completada";
            case "fr_FR":
                return "Copie terminée";
            case "ja_JP":
                return "コピーが完了しました";
            case "zh_CHT":
                return "複製完成";

            default:
                return "Copy completed";
        }
    }
    public get 显示备注() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "显示备注Memo于内容上方";
            case "es_ES":
                return "Mostrar notas memo encima del contenido";
            case "fr_FR":
                return "Afficher les notes memo au-dessus du contenu";
            case "ja_JP":
                return "内容の上にメモを表示";
            case "zh_CHT":
                return "顯示備註Memo於內容上方";

            default:
                return "Show memo notes above content";
        }
    }
    public get 锁定内容() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "锁定内容/解锁内容";
            case "es_ES":
                return "Bloquear contenido/Desbloquear contenido";
            case "fr_FR":
                return "Verrouiller le contenu/Déverrouiller le contenu";
            case "ja_JP":
                return "コンテンツをロック/ロック解除";
            case "zh_CHT":
                return "鎖定內容/解鎖內容";

            default:
                return "Lock Content/Unlock Content";
        }
    }
    public get 百度千帆转发器监听地址() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "百度千帆转发器监听地址";
            case "es_ES":
                return "Dirección de escucha del transmisor de Baidu Qianfan";
            case "fr_FR":
                return "Adresse d'écoute du transmetteur Baidu Qianfan";
            case "ja_JP":
                return "百度千帆転送器リスニングアドレス";
            case "zh_CHT":
                return "百度千帆轉發器監聽地址";

            default:
                return "Baidu Qianfan Transmitter Listening Address";
        }
    }

    public get 添加百度千帆的密钥() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "添加百度千帆的密钥";
            case "es_ES":
                return "Agregar clave de Baidu Qianfan";
            case "fr_FR":
                return "Ajouter la clé de Baidu Qianfan";
            case "ja_JP":
                return "百度千帆のキーを追加";
            case "zh_CHT":
                return "添加百度千帆的密鑰";

            default:
                return "Add Baidu Qianfan Key";
        }
    }

    public get 添加知识库得到ID() {
        switch (this.conf.appearance.lang) {
            case "zh_CN":
                return "添加知识库得到ID";
            case "es_ES":
                return "Agregar base de conocimientos para obtener ID";
            case "fr_FR":
                return "Ajouter une base de connaissances pour obtenir l'ID";
            case "ja_JP":
                return "知識ベースを追加してIDを取得";
            case "zh_CHT":
                return "添加知識庫得到ID";

            default:
                return "Add Knowledge Base to Get ID";
        }
    }


}
