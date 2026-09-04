import { TomatoI18nABC14 } from "./text14";

export abstract class TomatoI18nABC13 extends TomatoI18nABC14 {
     public get 悬浮球() {
        switch (this.lang) {
            case "zh_CN": return "悬浮球";
            case "es_ES": return "Bola flotante";
            case "fr_FR": return "Boule flottante";
            case "ja_JP": return "フローティングボール";
            case "zh_CHT": return "懸浮球";
            case "it_IT": return "Sfera fluttuante";
            case "de_DE": return "Schwebende Kugel";
            case "he_IL": return "כדור צף";
            case "ru_RU": return "Плавающий шар";
            case "pl_PL": return "Pływająca kula";
            case "en_US":
            default: return "Floating ball";
        }
    }
    public get 使用小窗打开() {
        switch (this.lang) {
            case "zh_CN": return "使用小窗打开";
            case "es_ES": return "Abrir en ventana pequeña";
            case "fr_FR": return "Ouvrir dans une petite fenêtre";
            case "ja_JP": return "小さいウィンドウで開く";
            case "zh_CHT": return "使用小窗打開";
            case "it_IT": return "Apri in finestra piccola";
            case "de_DE": return "Im kleinen Fenster öffnen";
            case "he_IL": return "פתח בחלון קטן";
            case "ru_RU": return "Открыть в маленьком окне";
            case "pl_PL": return "Otwórz w małym oknie";
            case "en_US":
            default: return "Open in small window";
        }
    }
    public get 图标() {
        switch (this.lang) {
            case "zh_CN": return "图标";
            case "es_ES": return "Icono";
            case "fr_FR": return "Icône";
            case "ja_JP": return "アイコン";
            case "zh_CHT": return "圖標";
            case "it_IT": return "Icona";
            case "de_DE": return "Symbol";
            case "he_IL": return "סמל";
            case "ru_RU": return "Иконка";
            case "pl_PL": return "Ikona";
            case "en_US":
            default: return "Icon";
        }
    }
    public get 文档名() {
        switch (this.lang) {
            case "zh_CN": return "文档名";
            case "es_ES": return "Nombre del documento";
            case "fr_FR": return "Nom du document";
            case "ja_JP": return "ドキュメント名";
            case "zh_CHT": return "文件名";
            case "it_IT": return "Nome del documento";
            case "de_DE": return "Dokumentenname";
            case "he_IL": return "שם מסמך";
            case "ru_RU": return "Имя документа";
            case "pl_PL": return "Nazwa dokumentu";
            case "en_US":
            default: return "Document name";
        }
    }
    public get 快捷键() {
        switch (this.lang) {
            case "zh_CN": return "快捷键";
            case "es_ES": return "Atajo de teclado";
            case "fr_FR": return "Raccourci clavier";
            case "ja_JP": return "ショートカットキー";
            case "zh_CHT": return "快捷鍵";
            case "it_IT": return "Tasto di scelta rapida";
            case "de_DE": return "Tastenkürzel";
            case "he_IL": return "קיצור מקשים";
            case "ru_RU": return "Горячая клавиша";
            case "pl_PL": return "Skrót klawiszowy";
            case "en_US":
            default: return "Shortcut key";
        }
    }
    public get 找不到文档() {
        switch (this.lang) {
            case "zh_CN": return "找不到文档";
            case "es_ES": return "No se encontró el documento";
            case "fr_FR": return "Document introuvable";
            case "ja_JP": return "ドキュメントが見つかりません";
            case "zh_CHT": return "找不到文件";
            case "it_IT": return "Documento non trovato";
            case "de_DE": return "Dokument nicht gefunden";
            case "he_IL": return "המסמך לא נמצא";
            case "ru_RU": return "Документ не найден";
            case "pl_PL": return "Nie znaleziono dokumentu";
            case "en_US":
            default: return "Document not found";
        }
    }
    public get 绑定文档到悬浮按钮() {
        switch (this.lang) {
            case "zh_CN": return "绑定文档到悬浮按钮";
            case "es_ES": return "Vincular documento al botón flotante";
            case "fr_FR": return "Lier le document au bouton flottant";
            case "ja_JP": return "ドキュメントをフローティングボタンにバインド";
            case "zh_CHT": return "綁定文件到懸浮按鈕";
            case "it_IT": return "Associa documento al pulsante flottante";
            case "de_DE": return "Dokument an Schwebeschaltfläche binden";
            case "he_IL": return "קשר מסמך לכפתור הצף";
            case "ru_RU": return "Привязать документ к плавающей кнопке";
            case "pl_PL": return "Powiąż dokument z przyciskiem pływającym";
            case "en_US":
            default: return "Bind document to floating button";
        }
    }
    public get 绑定快捷键到悬浮按钮() {
        switch (this.lang) {
            case "zh_CN": return "绑定快捷键到悬浮按钮";
            case "es_ES": return "Vincular atajo al botón flotante";
            case "fr_FR": return "Lier le raccourci au bouton flottant";
            case "ja_JP": return "ショートカットキーをフローティングボタンにバインド";
            case "zh_CHT": return "綁定快捷鍵到懸浮按鈕";
            case "it_IT": return "Associa scorciatoia al pulsante flottante";
            case "de_DE": return "Tastenkürzel an Schwebeschaltfläche binden";
            case "he_IL": return "קשר קיצור מקשים לכפתור הצף";
            case "ru_RU": return "Привязать горячую клавишу к плавающей кнопке";
            case "pl_PL": return "Powiąż skrót z przyciskiem pływającym";
            case "en_US":
            default: return "Bind shortcut key to floating button";
        }
    }
    public get 键() {
        switch (this.lang) {
            case "zh_CN": return "键";
            case "es_ES": return "Tecla";
            case "fr_FR": return "Touche";
            case "ja_JP": return "キー";
            case "zh_CHT": return "鍵";
            case "it_IT": return "Tasto";
            case "de_DE": return "Taste";
            case "he_IL": return "מקש";
            case "ru_RU": return "Клавиша";
            case "pl_PL": return "Klawisz";
            case "en_US":
            default: return "Key";
        }
    }
    public get 桌面端() {
        switch (this.lang) {
            case "zh_CN": return "桌面端";
            case "es_ES": return "Escritorio";
            case "fr_FR": return "Bureau";
            case "ja_JP": return "デスクトップ";
            case "zh_CHT": return "桌面端";
            case "it_IT": return "Desktop";
            case "de_DE": return "Desktop";
            case "he_IL": return "שולחן עבודה";
            case "ru_RU": return "Десктоп";
            case "pl_PL": return "Pulpit";
            case "en_US":
            default: return "Desktop";
        }
    }
    public get 移动端() {
        switch (this.lang) {
            case "zh_CN": return "移动端";
            case "es_ES": return "Móvil";
            case "fr_FR": return "Mobile";
            case "ja_JP": return "モバイル";
            case "zh_CHT": return "移動端";
            case "it_IT": return "Mobile";
            case "de_DE": return "Mobil";
            case "he_IL": return "נייד";
            case "ru_RU": return "Мобильный";
            case "pl_PL": return "Mobilny";
            case "en_US":
            default: return "Mobile";
        }
    }
    public get 特殊绑定当天日志() {
        switch (this.lang) {
            case "zh_CN": return "特殊：绑定当天日志";
            case "es_ES": return "Especial: vincular el registro del día";
            case "fr_FR": return "Spécial : lier le journal du jour";
            case "ja_JP": return "特別：当日のログをバインド";
            case "zh_CHT": return "特殊：綁定當天日誌";
            case "it_IT": return "Speciale: associa il registro del giorno";
            case "de_DE": return "Speziell: Tagesprotokoll binden";
            case "he_IL": return "מיוחד: קישור יומן היום";
            case "ru_RU": return "Особое: привязать журнал за день";
            case "pl_PL": return "Specjalne: powiąż dziennik dnia";
            case "en_US":
            default: return "Special: bind today's log";
        }
    }
    public 非VIP上限为x个(x: number, unit: string) {
        switch (this.lang) {
            case "zh_CN": return `非VIP上限为${x}个${unit}`;
            case "es_ES": return `El límite para no VIP es de ${x} ${unit}`;
            case "fr_FR": return `La limite pour les non VIP est de ${x} ${unit}`;
            case "ja_JP": return `非VIPの上限は${x}${unit}です`;
            case "zh_CHT": return `非VIP上限為${x}個${unit}`;
            case "it_IT": return `Il limite per i non VIP è di ${x} ${unit}`;
            case "de_DE": return `Das Limit für Nicht-VIPs beträgt ${x} ${unit}`;
            case "he_IL": return `המגבלה ללא VIP היא ${x} ${unit}`;
            case "ru_RU": return `Лимит для не-VIP составляет ${x} ${unit}`;
            case "pl_PL": return `Limit dla nie-VIP to ${x} ${unit}`;
            case "en_US":
            default: return `Non-VIP limit is ${x} ${unit}`;
        }
    }
    public get 在当前文档中定位() {
        switch (this.lang) {
            case "zh_CN": return "在当前文档中定位";
            case "es_ES": return "Localizar en el documento actual";
            case "fr_FR": return "Localiser dans le document actuel";
            case "ja_JP": return "現在のドキュメントで位置を特定";
            case "zh_CHT": return "在當前文件中定位";
            case "it_IT": return "Individua nel documento corrente";
            case "de_DE": return "Im aktuellen Dokument lokalisieren";
            case "he_IL": return "אתר במסמך הנוכחי";
            case "ru_RU": return "Найти в текущем документе";
            case "pl_PL": return "Zlokalizuj w bieżącym dokumencie";
            case "en_US":
            default: return "Locate in current document";
        }
    }
    public get vip功能() {
        switch (this.lang) {
            case "zh_CN": return "VIP功能";
            case "es_ES": return "Función VIP";
            case "fr_FR": return "Fonction VIP";
            case "ja_JP": return "VIP機能";
            case "zh_CHT": return "VIP功能";
            case "it_IT": return "Funzione VIP";
            case "de_DE": return "VIP-Funktion";
            case "he_IL": return "פונקציית VIP";
            case "ru_RU": return "Функция VIP";
            case "pl_PL": return "Funkcja VIP";
            case "en_US":
            default: return "VIP feature";
        }
    }
    public get 解除悬浮球与文档之间的绑定() {
        switch (this.lang) {
            case "zh_CN": return "解除悬浮球与文档之间的绑定";
            case "es_ES": return "Desvincular la bola flotante del documento";
            case "fr_FR": return "Dissocier la boule flottante du document";
            case "ja_JP": return "フローティングボールとドキュメントの関連付けを解除";
            case "zh_CHT": return "解除懸浮球與文件之間的綁定";
            case "it_IT": return "Scollega la sfera fluttuante dal documento";
            case "de_DE": return "Verbindung zwischen schwebender Kugel und Dokument aufheben";
            case "he_IL": return "בטל קישור בין הכדור הצף למסמך";
            case "ru_RU": return "Отвязать плавающий шар от документа";
            case "pl_PL": return "Odłącz pływającą kulę od dokumentu";
            case "en_US":
            default: return "Unbind floating ball from document";
        }
    }
    public get 创建闪卡时添加所有虚拟引用到第一行() {
        switch (this.lang) {
            case "zh_CN": return "创建闪卡时，添加所有虚拟引用，到第一行";
            case "es_ES": return "Al crear una tarjeta, añade todas las referencias virtuales a la primera línea";
            case "fr_FR": return "Lors de la création d'une carte, ajoutez toutes les références virtuelles à la première ligne";
            case "ja_JP": return "フラッシュカード作成時、すべての仮想参照を最初の行に追加します";
            case "zh_CHT": return "建立閃卡時，將所有虛擬引用添加到第一行";
            case "it_IT": return "Quando crei una flashcard, aggiungi tutti i riferimenti virtuali alla prima riga";
            case "de_DE": return "Beim Erstellen einer Karte alle virtuellen Verweise in die erste Zeile einfügen";
            case "he_IL": return "בעת יצירת כרטיס פלאש, הוסף את כל ההפניות הווירטואליות לשורה הראשונה";
            case "ru_RU": return "При создании карточки добавьте все виртуальные ссылки в первую строку";
            case "pl_PL": return "Podczas tworzenia fiszki dodaj wszystkie wirtualne odnośniki do pierwszego wiersza";
            case "en_US":
            default: return "When creating a flashcard, add all virtual references to the first line";
        }
    }
    public get 移动内容到dailynote后原文改为链接() {
        switch (this.lang) {
            case "zh_CN": return "移动内容到dailynote后，原文改为链接";
            case "es_ES": return "Después de mover el contenido a dailynote, el texto original se convierte en un enlace";
            case "fr_FR": return "Après avoir déplacé le contenu vers dailynote, le texte original devient un lien";
            case "ja_JP": return "内容をdailynoteに移動した後、元のテキストはリンクに変更されます";
            case "zh_CHT": return "移動內容到dailynote後，原文改為連結";
            case "it_IT": return "Dopo aver spostato il contenuto su dailynote, il testo originale viene trasformato in un link";
            case "de_DE": return "Nach dem Verschieben des Inhalts zu dailynote wird der Originaltext zu einem Link";
            case "he_IL": return "לאחר העברת התוכן ל-dailynote, הטקסט המקורי הופך לקישור";
            case "ru_RU": return "После перемещения содержимого в dailynote исходный текст становится ссылкой";
            case "pl_PL": return "Po przeniesieniu treści do dailynote oryginalny tekst zostaje zamieniony na link";
            case "en_US":
            default: return "After moving content to dailynote, the original text becomes a link";
        }
    }
    public get 前缀文档树() {
        switch (this.lang) {
            case "zh_CN": return "前缀文档树";
            case "es_ES": return "Árbol de documentos de prefijo";
            case "fr_FR": return "Arbre de documents préfixés";
            case "ja_JP": return "プレフィックスドキュメントツリー";
            case "zh_CHT": return "前綴文件樹";
            case "it_IT": return "Albero dei documenti prefisso";
            case "de_DE": return "Präfix-Dokumentbaum";
            case "he_IL": return "עץ מסמכים עם קידומת";
            case "ru_RU": return "Дерево документов с префиксом";
            case "pl_PL": return "Drzewo dokumentów z prefiksem";
            case "en_US":
            default: return "Prefix document tree";
        }
    }
    public get 阅读点保存到指定文档() {
        switch (this.lang) {
            case "zh_CN": return "阅读点保存到指定文档";
            case "es_ES": return "Guardar punto de lectura en el documento especificado";
            case "fr_FR": return "Enregistrer le point de lecture dans le document spécifié";
            case "ja_JP": return "読書ポイントを指定したドキュメントに保存";
            case "zh_CHT": return "閱讀點保存到指定文件";
            case "it_IT": return "Salva il punto di lettura nel documento specificato";
            case "de_DE": return "Lesepunkt im angegebenen Dokument speichern";
            case "he_IL": return "שמור נקודת קריאה במסמך שצוין";
            case "ru_RU": return "Сохранить точку чтения в указанном документе";
            case "pl_PL": return "Zapisz punkt czytania w wybranym dokumencie";
            case "en_US":
            default: return "Save reading point to specified document";
        }
    }
    public get 最大列出的文件数量() {
        switch (this.lang) {
            case "zh_CN": return "最大列出的文件数量";
            case "es_ES": return "Cantidad máxima de archivos listados";
            case "fr_FR": return "Nombre maximal de fichiers listés";
            case "ja_JP": return "一覧表示されるファイルの最大数";
            case "zh_CHT": return "最大列出的檔案數量";
            case "it_IT": return "Numero massimo di file elencati";
            case "de_DE": return "Maximal aufgelistete Dateianzahl";
            case "he_IL": return "המספר המרבי של קבצים שמוצגים";
            case "ru_RU": return "Максимальное количество перечисленных файлов";
            case "pl_PL": return "Maksymalna liczba wyświetlanych plików";
            case "en_US":
            default: return "Maximum number of listed files";
        }
    }
    public get 使用当前文档名字的前缀() {
        switch (this.lang) {
            case "zh_CN": return "使用当前文档名字的前缀";
            case "es_ES": return "Usar el prefijo del nombre del documento actual";
            case "fr_FR": return "Utiliser le préfixe du nom du document actuel";
            case "ja_JP": return "現在のドキュメント名のプレフィックスを使用";
            case "zh_CHT": return "使用當前文件名字的前綴";
            case "it_IT": return "Usa il prefisso del nome del documento corrente";
            case "de_DE": return "Präfix des aktuellen Dokumentnamens verwenden";
            case "he_IL": return "השתמש בקידומת שם המסמך הנוכחי";
            case "ru_RU": return "Использовать префикс имени текущего документа";
            case "pl_PL": return "Użyj prefiksu nazwy bieżącego dokumentu";
            case "en_US":
            default: return "Use the prefix of the current document name";
        }
    }
    public get 块关系图帮助() {
        switch (this.lang) {
            case "zh_CN":
                return "图中：backspace删节点或连线；  拖拽创建连线则相应创建引用；  alt点击定位到文档<br>文档中：右键菜单可以定位到图中。若要快速创建引用，用双向互链功能";
            case "es_ES":
                return "En el gráfico: backspace elimina nodos o conexiones; arrastrar para crear una conexión también crea una referencia; alt-clic para localizar el documento<br>En el documento: el menú contextual permite localizar en el gráfico. Para crear referencias rápidamente, use la función de enlace bidireccional";
            case "fr_FR":
                return "Dans le graphique : backspace supprime les nœuds ou les liens ; faire glisser pour créer un lien crée également une référence ; alt-clic pour localiser le document<br>Dans le document : le menu contextuel permet de localiser dans le graphique. Pour créer rapidement une référence, utilisez la fonction de liaison bidirectionnelle";
            case "ja_JP":
                return "グラフ内：backspaceでノードやリンクを削除；ドラッグでリンクを作成すると参照も作成されます；altクリックでドキュメントに移動<br>ドキュメント内：右クリックメニューでグラフ内に移動できます。素早く参照を作成するには双方向リンク機能を使ってください";
            case "zh_CHT":
                return "圖中：backspace 刪除節點或連線；拖曳建立連線則相應建立引用；alt 點擊定位到文件<br>文件中：右鍵選單可以定位到圖中。若要快速建立引用，請用雙向互鏈功能";
            case "it_IT":
                return "Nel grafico: backspace elimina nodi o collegamenti; trascinando per creare un collegamento si crea anche un riferimento; alt-clic per localizzare il documento<br>Nel documento: il menu contestuale consente di localizzare nel grafico. Per creare rapidamente riferimenti, usa la funzione di collegamento bidirezionale";
            case "de_DE":
                return "Im Diagramm: Backspace löscht Knoten oder Verbindungen; Ziehen zum Erstellen einer Verbindung erstellt auch eine Referenz; Alt-Klick, um das Dokument zu lokalisieren<br>Im Dokument: Das Kontextmenü ermöglicht das Lokalisieren im Diagramm. Um schnell Referenzen zu erstellen, verwenden Sie die bidirektionale Verknüpfungsfunktion";
            case "he_IL":
                return "בגרף: backspace מוחק צמתים או קישורים; גרירה ליצירת קישור יוצרת גם הפניה; alt+קליק ממקם למסמך<br>במסמך: תפריט לחיצה ימנית מאפשר מיקום בגרף. ליצירת הפניות במהירות, השתמש בפונקציית קישור דו-כיווני";
            case "ru_RU":
                return "В графе: backspace удаляет узлы или связи; перетаскивание для создания связи также создаёт ссылку; alt-клик для перехода к документу<br>В документе: контекстное меню позволяет найти в графе. Для быстрого создания ссылок используйте функцию двусторонней связи";
            case "pl_PL":
                return "Na wykresie: backspace usuwa węzły lub połączenia; przeciągnięcie w celu utworzenia połączenia tworzy również odniesienie; alt-klik, aby zlokalizować dokument<br>W dokumencie: menu kontekstowe pozwala zlokalizować na wykresie. Aby szybko utworzyć odniesienia, użyj funkcji dwukierunkowego łączenia";
            case "en_US":
            default:
                return "In the graph: backspace deletes nodes or connections; dragging to create a connection also creates a reference; alt-click to locate the document<br>In the document: right-click menu allows locating in the graph. To quickly create references, use the bidirectional link feature";
        }
    }
    public get 定位到文档() {
        switch (this.lang) {
            case "zh_CN": return "定位到文档<br><br>backspace删节点或连线<br><br>拖拽创建连线则相应创建引用<br><br>alt点击定位到文档";
            case "es_ES": return "Localizar en el documento<br><br>backspace elimina nodos o conexiones<br><br>arrastrar para crear una conexión también crea una referencia<br><br>alt-clic para localizar el documento";
            case "fr_FR": return "Localiser dans le document<br><br>backspace supprime les nœuds ou les liens<br><br>faire glisser pour créer un lien crée également une référence<br><br>alt-clic pour localiser le document";
            case "ja_JP": return "ドキュメントに移動<br><br>backspaceでノードやリンクを削除<br><br>ドラッグでリンクを作成すると参照も作成されます<br><br>altクリックでドキュメントに移動";
            case "zh_CHT": return "定位到文件<br><br>backspace 刪除節點或連線<br><br>拖曳建立連線則相應建立引用<br><br>alt 點擊定位到文件";
            case "it_IT": return "Individua nel documento<br><br>backspace elimina nodi o collegamenti<br><br>trascinando per creare un collegamento si crea anche un riferimento<br><br>alt-clic per localizzare il documento";
            case "de_DE": return "Im Dokument lokalisieren<br><br>Backspace löscht Knoten oder Verbindungen<br><br>Ziehen zum Erstellen einer Verbindung erstellt auch eine Referenz<br><br>Alt-Klick, um das Dokument zu lokalisieren";
            case "he_IL": return "אתר במסמך<br><br>backspace מוחק צמתים או קישורים<br><br>גרירה ליצירת קישור יוצרת גם הפניה<br><br>alt+קליק ממקם למסמך";
            case "ru_RU": return "Найти в документе<br><br>backspace удаляет узлы или связи<br><br>перетаскивание для создания связи также создаёт ссылку<br><br>alt-клик для перехода к документу";
            case "pl_PL": return "Zlokalizuj w dokumencie<br><br>backspace usuwa węzły lub połączenia<br><br>przeciągnięcie w celu utworzenia połączenia tworzy również odniesienie<br><br>alt-klik, aby zlokalizować dokument";
            case "en_US":
            default: return "Locate in document<br><br>backspace deletes nodes or connections<br><br>dragging to create a connection also creates a reference<br><br>alt-click to locate the document";
        }
    }
    public get 批量改前缀() {
        switch (this.lang) {
            case "zh_CN": return "批量改前缀";
            case "es_ES": return "Cambiar prefijo por lotes";
            case "fr_FR": return "Modifier le préfixe en lot";
            case "ja_JP": return "プレフィックスを一括変更";
            case "zh_CHT": return "批量改前綴";
            case "it_IT": return "Modifica prefisso in blocco";
            case "de_DE": return "Präfix stapelweise ändern";
            case "he_IL": return "שנה קידומת בכמות";
            case "ru_RU": return "Массовое изменение префикса";
            case "pl_PL": return "Zmień prefiks zbiorczo";
            case "en_US":
            default: return "Batch change prefix";
        }
    }
    public get 确定() {
        switch (this.lang) {
            case "zh_CN": return "确定";
            case "es_ES": return "Confirmar";
            case "fr_FR": return "Confirmer";
            case "ja_JP": return "確定";
            case "zh_CHT": return "確定";
            case "it_IT": return "Conferma";
            case "de_DE": return "Bestätigen";
            case "he_IL": return "אישור";
            case "ru_RU": return "Подтвердить";
            case "pl_PL": return "Potwierdź";
            case "en_US":
            default: return "Confirm";
        }
    }
    public get 请输入新前缀() {
        switch (this.lang) {
            case "zh_CN": return "请输入新前缀";
            case "es_ES": return "Por favor, introduzca el nuevo prefijo";
            case "fr_FR": return "Veuillez saisir le nouveau préfixe";
            case "ja_JP": return "新しいプレフィックスを入力してください";
            case "zh_CHT": return "請輸入新前綴";
            case "it_IT": return "Inserisci il nuovo prefisso";
            case "de_DE": return "Bitte neuen Präfix eingeben";
            case "he_IL": return "הזן קידומת חדשה";
            case "ru_RU": return "Пожалуйста, введите новый префикс";
            case "pl_PL": return "Wprowadź nowy prefiks";
            case "en_US":
            default: return "Please enter the new prefix";
        }
    }
    public get 请输入原前缀() {
        switch (this.lang) {
            case "zh_CN": return "请输入原前缀";
            case "es_ES": return "Por favor, introduzca el prefijo original";
            case "fr_FR": return "Veuillez saisir l'ancien préfixe";
            case "ja_JP": return "元のプレフィックスを入力してください";
            case "zh_CHT": return "請輸入原前綴";
            case "it_IT": return "Inserisci il prefisso originale";
            case "de_DE": return "Bitte ursprünglichen Präfix eingeben";
            case "he_IL": return "הזן קידומת מקורית";
            case "ru_RU": return "Пожалуйста, введите исходный префикс";
            case "pl_PL": return "Wprowadź oryginalny prefiks";
            case "en_US":
            default: return "Please enter the original prefix";
        }
    }
    public get 重命名完成() {
        switch (this.lang) {
            case "zh_CN": return "重命名完成";
            case "es_ES": return "Renombrado completado";
            case "fr_FR": return "Renommage terminé";
            case "ja_JP": return "名前の変更が完了しました";
            case "zh_CHT": return "重命名完成";
            case "it_IT": return "Rinomina completata";
            case "de_DE": return "Umbenennung abgeschlossen";
            case "he_IL": return "השם שונה בהצלחה";
            case "ru_RU": return "Переименование завершено";
            case "pl_PL": return "Zmieniono nazwę";
            case "en_US":
            default: return "Rename completed";
        }
    }
    public get 已经创建快照() {
        switch (this.lang) {
            case "zh_CN": return "已经创建快照，如果有问题，可以从快照回滚";
            case "es_ES": return "Se ha creado una instantánea, si hay algún problema, puede restaurar desde la instantánea";
            case "fr_FR": return "Une capture d'écran a été créée, en cas de problème, vous pouvez revenir à la capture";
            case "ja_JP": return "スナップショットが作成されました。問題があればスナップショットからロールバックできます";
            case "zh_CHT": return "已經建立快照，如果有問題，可以從快照回滾";
            case "it_IT": return "È stato creato uno snapshot, in caso di problemi puoi ripristinare dallo snapshot";
            case "de_DE": return "Snapshot wurde erstellt. Bei Problemen können Sie auf den Snapshot zurücksetzen";
            case "he_IL": return "נוצרה תמונת מצב, אם יש בעיה ניתן לשחזר מהתמונה";
            case "ru_RU": return "Снимок создан, при возникновении проблем можно откатиться к снимку";
            case "pl_PL": return "Utworzono migawkę, w razie problemów możesz przywrócić z migawki";
            case "en_US":
            default: return "Snapshot has been created. If there are any issues, you can roll back from the snapshot";
        }
    }
    public get 绑定文档到Tab() {
        switch (this.lang) {
            case "zh_CN": return "绑定文档到Tab";
            case "es_ES": return "Vincular documento a la pestaña";
            case "fr_FR": return "Lier le document à l'onglet";
            case "ja_JP": return "ドキュメントをタブにバインド";
            case "zh_CHT": return "綁定文件到Tab";
            case "it_IT": return "Associa documento alla scheda";
            case "de_DE": return "Dokument an Tab binden";
            case "he_IL": return "קשר מסמך ללשונית";
            case "ru_RU": return "Привязать документ к вкладке";
            case "pl_PL": return "Powiąż dokument z kartą";
            case "en_US":
            default: return "Bind document to tab";
        }
    }
    public get ctrl点击删除按钮() {
        switch (this.lang) {
            case "zh_CN": return "ctrl点击删除按钮";
            case "es_ES": return "Ctrl clic para eliminar el botón";
            case "fr_FR": return "Ctrl-clic pour supprimer le bouton";
            case "ja_JP": return "Ctrlクリックでボタンを削除";
            case "zh_CHT": return "ctrl點擊刪除按鈕";
            case "it_IT": return "Ctrl clic per eliminare il pulsante";
            case "de_DE": return "Strg-Klick, um die Schaltfläche zu löschen";
            case "he_IL": return "Ctrl קליק למחיקת הכפתור";
            case "ru_RU": return "Ctrl-клик для удаления кнопки";
            case "pl_PL": return "Ctrl kliknij, aby usunąć przycisk";
            case "en_US":
            default: return "Ctrl click to delete button";
        }
    }
    public get 如果块很多请放到超级块内否则会很慢() {
        switch (this.lang) {
            case "zh_CN": return "如果块很多，请放到超级块内，否则会很慢";
            case "es_ES": return "Si hay muchos bloques, colóquelos dentro de un super bloque, de lo contrario será muy lento";
            case "fr_FR": return "S'il y a beaucoup de blocs, placez-les dans un super bloc, sinon cela sera très lent";
            case "ja_JP": return "ブロックが多い場合は、スーパーブロック内に入れてください。そうしないと非常に遅くなります";
            case "zh_CHT": return "如果區塊很多，請放到超級區塊內，否則會很慢";
            case "it_IT": return "Se ci sono molti blocchi, inseriscili in un superblocco, altrimenti sarà molto lento";
            case "de_DE": return "Wenn es viele Blöcke gibt, legen Sie sie in einen Superblock, sonst wird es sehr langsam";
            case "he_IL": return "אם יש הרבה בלוקים, שים אותם בתוך בלוק-על, אחרת זה יהיה איטי מאוד";
            case "ru_RU": return "Если блоков много, поместите их в суперблок, иначе будет очень медленно";
            case "pl_PL": return "Jeśli jest dużo bloków, umieść je w superbloku, w przeciwnym razie będzie bardzo wolno";
            case "en_US":
            default: return "If there are many blocks, please put them inside a super block, otherwise it will be very slow";
        }
    }

    public get 刷新() {
        switch (this.lang) {
            case "zh_CN": return "刷新";
            case "es_ES": return "Actualizar";
            case "fr_FR": return "Rafraîchir";
            case "ja_JP": return "リフレッシュ";
            case "zh_CHT": return "刷新";
            case "it_IT": return "Aggiorna";
            case "de_DE": return "Aktualisieren";
            case "he_IL": return "רענן";
            case "ru_RU": return "Обновить";
            case "pl_PL": return "Odśwież";
            case "en_US":
            default: return "Refresh";
        }
    }
    public get 退出() {
        switch (this.lang) {
            case "zh_CN": return "退出";
            case "es_ES": return "Salir";
            case "fr_FR": return "Quitter";
            case "ja_JP": return "終了";
            case "zh_CHT": return "退出";
            case "it_IT": return "Esci";
            case "de_DE": return "Beenden";
            case "he_IL": return "צא";
            case "ru_RU": return "Выйти";
            case "pl_PL": return "Wyjdź";
            case "en_US":
            default: return "Exit";
        }
    }
    public get 标题内竖线分割出来的标签() {
        switch (this.lang) {
            case "zh_CN": return "标题内竖线，分割出来的标签，不含最后一部分";
            case "es_ES": return "Etiqueta separada por barra vertical en el título, sin la última parte";
            case "fr_FR": return "Étiquette séparée par une barre verticale dans le titre, sans la dernière partie";
            case "ja_JP": return "タイトル内の縦線で区切られたラベル（最後の部分を除く）";
            case "zh_CHT": return "標題內豎線，分割出來的標籤，不含最後一部分";
            case "it_IT": return "Etichetta separata da barra verticale nel titolo, esclusa l'ultima parte";
            case "de_DE": return "Im Titel durch senkrechten Strich getrenntes Label, ohne den letzten Teil";
            case "he_IL": return "תגית שמופרדת בקו אנכי בכותרת, ללא החלק האחרון";
            case "ru_RU": return "Метка, разделённая вертикальной чертой в заголовке, без последней части";
            case "pl_PL": return "Etykieta wydzielona pionową kreską w tytule, bez ostatniej części";
            case "en_US":
            default: return "Label separated by vertical bar in title, excluding the last part";
        }
    }
    public get 文档数量() {
        switch (this.lang) {
            case "zh_CN": return "文档数量";
            case "es_ES": return "Cantidad de documentos";
            case "fr_FR": return "Nombre de documents";
            case "ja_JP": return "ドキュメント数";
            case "zh_CHT": return "文件數量";
            case "it_IT": return "Numero di documenti";
            case "de_DE": return "Anzahl der Dokumente";
            case "he_IL": return "כמות מסמכים";
            case "ru_RU": return "Количество документов";
            case "pl_PL": return "Liczba dokumentów";
            case "en_US":
            default: return "Document count";
        }
    }
    public get 切换笔记本() {
        switch (this.lang) {
            case "zh_CN": return "切换笔记本，需要刷新";
            case "es_ES": return "Cambiar de cuaderno, es necesario actualizar";
            case "fr_FR": return "Changer de carnet, il est nécessaire de rafraîchir";
            case "ja_JP": return "ノートブックを切り替えるには、更新が必要です";
            case "zh_CHT": return "切換筆記本，需要刷新";
            case "it_IT": return "Cambia quaderno, è necessario aggiornare";
            case "de_DE": return "Notizbuch wechseln, Aktualisierung erforderlich";
            case "he_IL": return "לחליף מחברת, יש צורך לרענן";
            case "ru_RU": return "Переключить блокнот, требуется обновление";
            case "pl_PL": return "Zmień notes, wymagane jest odświeżenie";
            case "en_US":
            default: return "Switch notebooks, need to refresh";
        }
    }
    public get 按需() {
        switch (this.lang) {
            case "zh_CN": return "按需";
            case "es_ES": return "A demanda";
            case "fr_FR": return "Sur demande";
            case "ja_JP": return "必要に応じて";
            case "zh_CHT": return "按需";
            case "it_IT": return "Su richiesta";
            case "de_DE": return "Bedarfsgerecht";
            case "he_IL": return "לפי דרישה";
            case "ru_RU": return "По требованию";
            case "pl_PL": return "Na żądanie";
            case "en_US":
            default: return "On demand";
        }
    }
    public get 标号() {
        switch (this.lang) {
            case "zh_CN": return "标号";
            case "es_ES": return "Etiqueta";
            case "fr_FR": return "Étiquette";
            case "ja_JP": return "番号";
            case "zh_CHT": return "標號";
            case "it_IT": return "Etichetta";
            case "de_DE": return "Nummerierung";
            case "he_IL": return "תווית";
            case "ru_RU": return "Номер";
            case "pl_PL": return "Etykieta";
            case "en_US":
            default: return "Label";
        }
    }
    public get 末尾() {
        switch (this.lang) {
            case "zh_CN": return "末尾";
            case "es_ES": return "Final";
            case "fr_FR": return "Fin";
            case "ja_JP": return "末尾";
            case "zh_CHT": return "末尾";
            case "it_IT": return "Fine";
            case "de_DE": return "Ende";
            case "he_IL": return "סוף";
            case "ru_RU": return "Конец";
            case "pl_PL": return "Koniec";
            case "en_US":
            default: return "End";
        }
    }
    public get 清空筛选() {
        switch (this.lang) {
            case "zh_CN": return "清空筛选";
            case "es_ES": return "Borrar filtro";
            case "fr_FR": return "Effacer le filtre";
            case "ja_JP": return "フィルターをクリア";
            case "zh_CHT": return "清空篩選";
            case "it_IT": return "Cancella filtro";
            case "de_DE": return "Filter löschen";
            case "he_IL": return "נקה מסנן";
            case "ru_RU": return "Очистить фильтр";
            case "pl_PL": return "Wyczyść filtr";
            case "en_US":
            default: return "Clear filter";
        }
    }
    public get 右键菜单管理() {
        switch (this.lang) {
            case "zh_CN": return "右键菜单管理";
            case "es_ES": return "Gestión del menú contextual";
            case "fr_FR": return "Gestion du menu contextuel";
            case "ja_JP": return "右クリックメニュー管理";
            case "zh_CHT": return "右鍵選單管理";
            case "it_IT": return "Gestione menu contestuale";
            case "de_DE": return "Kontextmenü verwalten";
            case "he_IL": return "ניהול תפריט הקשר";
            case "ru_RU": return "Управление контекстным меню";
            case "pl_PL": return "Zarządzanie menu kontekstowym";
            case "en_US":
            default: return "Context menu management";
        }
    }
    public get 右键菜单管理说明() {
        switch (this.lang) {
            case "zh_CN": return "勾选 = 显示在右键菜单；取消勾选 = 隐藏（快捷键与命令面板不受影响）";
            case "zh_CHT": return "勾選 = 顯示在右鍵選單；解除勾選 = 隱藏（快捷鍵與命令面板不受影響）";
            case "ja_JP": return "チェック = 右クリックメニューに表示；解除 = 非表示（ショートカットとコマンドパレットには影響しません）";
            case "en_US":
            default: return "Checked = show in context menu; unchecked = hidden (hotkeys and command palette unaffected)";
        }
    }
    public get 右键菜单项() {
        switch (this.lang) {
            case "zh_CN": return "右键菜单项";
            case "zh_CHT": return "右鍵選單項目";
            case "ja_JP": return "右クリックメニュー項目";
            case "en_US":
            default: return "Context menu items";
        }
    }
    public get 收集到文件项说明() {
        switch (this.lang) {
            case "zh_CN": return "收集到文件一项须先收集过一次（记住目标文件）才会在右键菜单出现；收集四项均无默认快捷键，可在思源的键位设置中自行绑定";
            case "zh_CHT": return "收集到檔案一項須先收集過一次（記住目標檔案）才會在右鍵選單出現；收集四項均無預設快捷鍵，可在思源的鍵位設定中自行綁定";
            case "ja_JP": return "ファイルへ収集は一度収集したことがある（対象ファイルを記憶）場合にのみ右クリックメニューに表示されます。収集4項目ともデフォルトのショートカットはなく、SiYuanのキー設定で割り当てられます";
            case "en_US":
            default: return "Collect to file appears in the context menu only after collecting once (target file remembered); the four collect items have no default hotkeys — bind your own in SiYuan keymap settings";
        }
    }
    public get 日记() {
        switch (this.lang) {
            case "zh_CN": return "日记";
            case "es_ES": return "Diario";
            case "fr_FR": return "Note quotidienne";
            case "ja_JP": return "日記";
            case "zh_CHT": return "日记";
            case "it_IT": return "Nota quotidiana";
            case "de_DE": return "Tagesnotiz";
            case "he_IL": return "יומן";
            case "ru_RU": return "Ежедневник";
            case "pl_PL": return "Dziennik";
            case "en_US":
            default: return "Daily note";
        }
    }
    public get 互链与引用() {
        switch (this.lang) {
            case "zh_CN": return "互链与引用";
            case "es_ES": return "Enlaces y referencias";
            case "fr_FR": return "Liens et références";
            case "ja_JP": return "リンクと参照";
            case "zh_CHT": return "互链与引用";
            case "it_IT": return "Collegamenti e riferimenti";
            case "de_DE": return "Links & Referenzen";
            case "he_IL": return "קישורים והפניות";
            case "ru_RU": return "Ссылки и упоминания";
            case "pl_PL": return "Linki i odniesienia";
            case "en_US":
            default: return "Links & references";
        }
    }
    public get 文档整理() {
        switch (this.lang) {
            case "zh_CN": return "文档整理";
            case "es_ES": return "Herramientas de documentos";
            case "fr_FR": return "Outils de documents";
            case "ja_JP": return "ドキュメント整理";
            case "zh_CHT": return "文档整理";
            case "it_IT": return "Strumenti documento";
            case "de_DE": return "Dokumentwerkzeuge";
            case "he_IL": return "כלי מסמכים";
            case "ru_RU": return "Инструменты документов";
            case "pl_PL": return "Narzędzia dokumentów";
            case "en_US":
            default: return "Document tools";
        }
    }
    public get 图片() {
        switch (this.lang) {
            case "zh_CN": return "图片";
            case "es_ES": return "Imágenes";
            case "fr_FR": return "Images";
            case "ja_JP": return "画像";
            case "zh_CHT": return "图片";
            case "it_IT": return "Immagini";
            case "de_DE": return "Bilder";
            case "he_IL": return "תמונות";
            case "ru_RU": return "Изображения";
            case "pl_PL": return "Obrazy";
            case "en_US":
            default: return "Images";
        }
    }
    public get 智能问答() {
        switch (this.lang) {
            case "zh_CN": return "智能问答";
            case "es_ES": return "Preguntas y respuestas IA";
            case "fr_FR": return "Q&R IA";
            case "ja_JP": return "AI質問";
            case "zh_CHT": return "智能问答";
            case "it_IT": return "Q&R IA";
            case "de_DE": return "KI-Fragen";
            case "he_IL": return "שאלות ותשובות AI";
            case "ru_RU": return "ИИ-вопросы";
            case "pl_PL": return "Pytania AI";
            case "en_US":
            default: return "AI Q&A";
        }
    }
    public get 数据库反链() {
        switch (this.lang) {
            case "zh_CN": return "数据库反链";
            case "es_ES": return "Retroenlaces de base de datos";
            case "fr_FR": return "Rétroliens de base de données";
            case "ja_JP": return "データベースバックリンク";
            case "zh_CHT": return "数据库反链";
            case "it_IT": return "Retrocollegamenti database";
            case "de_DE": return "Datenbank-Rückverweise";
            case "he_IL": return "קישורים לאחור של מסד נתונים";
            case "ru_RU": return "Обратные ссылки БД";
            case "pl_PL": return "Odnośniki bazy danych";
            case "en_US":
            default: return "Database backlinks";
        }
    }
    public get 导出() {
        switch (this.lang) {
            case "zh_CN": return "导出";
            case "es_ES": return "Exportar";
            case "fr_FR": return "Exporter";
            case "ja_JP": return "エクスポート";
            case "zh_CHT": return "导出";
            case "it_IT": return "Esporta";
            case "de_DE": return "Exportieren";
            case "he_IL": return "ייצוא";
            case "ru_RU": return "Экспорт";
            case "pl_PL": return "Eksport";
            case "en_US":
            default: return "Export";
        }
    }
    public get 全部显示() {
        switch (this.lang) {
            case "zh_CN": return "全部显示";
            case "es_ES": return "Mostrar todo";
            case "fr_FR": return "Tout afficher";
            case "ja_JP": return "すべて表示";
            case "zh_CHT": return "全部顯示";
            case "it_IT": return "Mostra tutto";
            case "de_DE": return "Alle anzeigen";
            case "he_IL": return "הצג הכל";
            case "ru_RU": return "Показать все";
            case "pl_PL": return "Pokaż wszystko";
            case "en_US":
            default: return "Show all";
        }
    }
    // □5 顶栏开关说明六键（spec §11.4）：首行一句结论，次行「开＝…关＝…」成对；
    // 正/反/虚用方向符号（当前块 → 目标块）替代术语解释；虚引加「不是真实反链」防误信
    public get 文档模式说明() {
        switch (this.lang) {
            case "zh_CN": return "按文档汇总：列出本文档通过块引用链接到的其他文档。\n开＝文档模式（每篇目标文档一张卡片）；关＝块模式，按光标所在块列出正引、反引、虚引。";
            case "es_ES": return "Por documento: lista los demás documentos enlazados desde este mediante referencias de bloque.\nActivado = modo documento (una tarjeta por documento destino); desactivado = modo bloque, lista las referencias directas, inversas y virtuales del bloque actual.";
            case "fr_FR": return "Par document : liste les autres documents liés depuis celui-ci via des références de bloc.\nActivé = mode document (une carte par document cible) ; désactivé = mode bloc, liste les références directes, inverses et virtuelles du bloc actuel.";
            case "ja_JP": return "ドキュメント単位：このドキュメントからブロック参照でリンクされた他のドキュメントを一覧表示。\nオン＝ドキュメントモード（対象ドキュメントごとに1枚のカード）；オフ＝ブロックモード、カーソルブロックの順・逆・仮想参照を表示。";
            case "zh_CHT": return "按文件彙總：列出本文件透過塊引用連結到的其他文件。\n開＝文件模式（每個目標文件一張卡片）；關＝塊模式，按游標所在塊列出正引、反引、虛引。";
            case "it_IT": return "Per documento: elenca gli altri documenti collegati da questo tramite riferimenti a blocchi.\nAttivo = modalità documento (una scheda per documento di destinazione); disattivo = modalità blocco, elenca i riferimenti diretti, inversi e virtuali del blocco corrente.";
            case "de_DE": return "Pro Dokument: listet alle anderen Dokumente, die dieses über Blockreferenzen verlinkt.\nEin = Dokumentmodus (eine Karte pro Zieldokument); Aus = Blockmodus, listet Vorwärts-/Rückwärts-/virtuelle Referenzen des aktuellen Blocks.";
            case "he_IL": return "לפי מסמך: מפרט את כל המסמכים האחרים שמסמך זה מקשר אליהם באמצעות הפניות בלוקים.\nמופעל = מצב מסמך (כרטיס אחד לכל מסמך יעד); כבוי = מצב בלוק, הצגת ההפניות של הבלוק הנוכחי.";
            case "ru_RU": return "По документу: перечисляет все другие документы, на которые этот документ ссылается блоковыми ссылками.\nВкл = режим документа (по карточке на целевой документ); выкл = режим блока — прямые, обратные и виртуальные ссылки текущего блока.";
            case "pl_PL": return "Według dokumentu: wymienia wszystkie inne dokumenty, do których ten dokument łączy odniesieniami bloków.\nWł. = tryb dokumentu (po jednej karcie na dokument docelowy); wył. = tryb bloku, lista odniesień bieżącego bloku.";
            case "en_US":
            default: return "Per document: lists all other documents linked from this one via block refs.\nOn = document mode (one card per target doc); off = block mode, listing forward/backward/virtual refs of the current block.";
        }
    }
    public get 正引过滤说明() {
        switch (this.lang) {
            case "zh_CN": return "正引＝从当前块出发：光标所在块通过块引用链接了谁（当前块 → 目标块）。\n开＝在面板列出这些被引用的块；关＝隐藏。";
            case "es_ES": return "Directa = saliente: a qué bloques enlaza el bloque actual mediante referencias de bloque (bloque actual → destino).\nActivado = los lista en el panel; desactivado = oculta.";
            case "fr_FR": return "Direct = sortant : vers quels blocs le bloc actuel pointe via des références de bloc (bloc actuel → cible).\nActivé = les liste dans le panneau ; désactivé = masque.";
            case "ja_JP": return "順参照＝送り出し：現在のブロックがブロック参照でリンクしている先（現在ブロック → 参照先）。\nオン＝パネルに一覧表示；オフ＝非表示。";
            case "zh_CHT": return "正引＝從當前塊出發：游標所在塊透過塊引用連結了誰（當前塊 → 目標塊）。\n開＝在面板列出這些被引用的塊；關＝隱藏。";
            case "it_IT": return "Diretto = in uscita: a quali blocchi punta il blocco corrente tramite riferimenti a blocchi (blocco corrente → destinazione).\nAttivo = li elenca nel pannello; disattivo = nasconde.";
            case "de_DE": return "Vorwärts = ausgehend: auf welche Blöcke der aktuelle Block per Blockreferenz verweist (aktueller Block → Ziel).\nEin = im Panel auflisten; Aus = ausblenden.";
            case "he_IL": return "קדימה = יוצא: לאילו בלוקים הבלוק הנוכחי מקושר בהפניית בלוקים (בלוק נוכחי → יעד).\nמופעל = הצגה בפאנל; כבוי = הסתרה.";
            case "ru_RU": return "Прямая = исходящая: на какие блоки текущий блок ссылается блоковыми ссылками (текущий блок → цель).\nВкл = показать в панели; выкл = скрыть.";
            case "pl_PL": return "Bezpośrednie = wychodzące: do których bloków bieżący blok łączy odniesieniami bloków (blok bieżący → cel).\nWł. = lista w panelu; wył. = ukryj.";
            case "en_US":
            default: return "Forward = outgoing: which blocks the current block links to via block refs (current block → target).\nOn = list them in the panel; off = hide.";
        }
    }
    public get 反引过滤说明() {
        switch (this.lang) {
            case "zh_CN": return "反引＝指向当前块：哪些块通过块引用链接到了光标所在块（来源块 → 当前块）。\n开＝列出这些引用来源；关＝隐藏。";
            case "es_ES": return "Inversa = entrante: qué bloques enlazan al bloque actual mediante referencias de bloque (origen → bloque actual).\nActivado = los lista; desactivado = oculta.";
            case "fr_FR": return "Indirect = entrant : quels blocs pointent vers le bloc actuel via des références de bloc (source → bloc actuel).\nActivé = les liste ; désactivé = masque.";
            case "ja_JP": return "逆参照＝受け取り：どのブロックがブロック参照で現在のブロックにリンクしているか（参照元 → 現在ブロック）。\nオン＝一覧表示；オフ＝非表示。";
            case "zh_CHT": return "反引＝指向當前塊：哪些塊透過塊引用連結到游標所在塊（來源塊 → 當前塊）。\n開＝列出這些引用來源；關＝隱藏。";
            case "it_IT": return "Inverso = in entrata: quali blocchi puntano al blocco corrente tramite riferimenti a blocchi (origine → blocco corrente).\nAttivo = li elenca; disattivo = nasconde.";
            case "de_DE": return "Rückwärts = eingehend: welche Blöcke per Blockreferenz auf den aktuellen Block verweisen (Quelle → aktueller Block).\nEin = auflisten; Aus = ausblenden.";
            case "he_IL": return "אחורה = נכנס: אילו בלוקים מקושרים לבלוק הנוכחי בהפניית בלוקים (מקור → בלוק נוכחי).\nמופעל = הצגה; כבוי = הסתרה.";
            case "ru_RU": return "Обратная = входящая: какие блоки ссылаются блоковыми ссылками на текущий блок (источник → текущий блок).\nВкл = показать; выкл = скрыть.";
            case "pl_PL": return "Wsteczne = przychodzące: które bloki łączą odniesieniami bloków do bieżącego bloku (źródło → blok bieżący).\nWł. = lista; wył. = ukryj.";
            case "en_US":
            default: return "Backward = incoming: which blocks link to the current block via block refs (source → current block).\nOn = list them; off = hide.";
        }
    }
    public get 虚引过滤说明() {
        switch (this.lang) {
            case "zh_CN": return "虚引＝没有真实链接的相似候选：按标题/内容文本匹配出与光标块相似的块。\n开＝列出这些「疑似引用」；关＝隐藏。虚引不是思源真实反链，仅供参考。";
            case "es_ES": return "Virtual = texto similar sin enlace real: bloques cuyo título/contenido coincide con el bloque actual.\nActivado = lista esos candidatos; desactivado = oculta. Las referencias virtuales no son retroenlaces reales de SiYuan, solo orientativas.";
            case "fr_FR": return "Virtuel = texte similaire sans lien réel : blocs dont le titre/contenu correspond au bloc actuel.\nActivé = liste ces candidats ; désactivé = masque. Les références virtuelles ne sont pas de vrais rétroliens SiYuan, à titre indicatif.";
            case "ja_JP": return "仮想参照＝実リンクのない類似候補：タイトル/本文が現在のブロックと一致するブロック。\nオン＝該当候補を一覧表示；オフ＝非表示。仮想参照は思源の実逆リンクではないため参考情報です。";
            case "zh_CHT": return "虛引＝沒有真實連結的相似候選：按標題/內容文字比對出與游標塊相似的塊。\n開＝列出這些「疑似引用」；關＝隱藏。虛引不是思源真實反鏈，僅供參考。";
            case "it_IT": return "Virtuale = testo simile senza collegamento reale: blocchi il cui titolo/contenuto corrisponde al blocco corrente.\nAttivo = elenca questi candidati; disattivo = nasconde. I riferimenti virtuali non sono veri backlink di SiYuan, solo indicativi.";
            case "de_DE": return "Virtuell = ähnlicher Text ohne echte Verknüpfung: Blöcke, deren Titel/Inhalt dem aktuellen Block entspricht.\nEin = diese Kandidaten auflisten; Aus = ausblenden. Virtuelle Referenzen sind keine echten SiYuan-Rückverweise, nur Hinweise.";
            case "he_IL": return "וירטואלי = טקסט דומה ללא קישור אמיתי: בלוקים שהכותרת/התוכן שלהם תואם לבלוק הנוכחי.\nמופעל = הצגת מועמדים אלה; כבוי = הסתרה. הפניות וירטואליות אינן קישורים אחוריים אמיתיים של SiYuan, לעיון בלבד.";
            case "ru_RU": return "Виртуальная = похожий текст без реальной ссылки: блоки, чей заголовок/текст совпадает с текущим блоком.\nВкл = показать этих кандидатов; выкл = скрыть. Виртуальные ссылки — не настоящие обратные ссылки SiYuan, только ориентир.";
            case "pl_PL": return "Wirtualne = podobny tekst bez prawdziwego łącza: bloki, których tytuł/treść odpowiada bieżącemu blokowi.\nWł. = lista tych kandydatów; wył. = ukryj. Odwołania wirtualne to nie prawdziwe linki wsteczne SiYuan, tylko wskazówki.";
            case "en_US":
            default: return "Virtual = similar text, no real link: blocks whose title/content matches the current block.\nOn = list these look-alikes; off = hide. Virtual refs are not real SiYuan backlinks, for reference only.";
        }
    }
    public get 批注分区说明() {
        switch (this.lang) {
            case "zh_CN": return "本文档番茄批注的总开关。\n开＝面板底部列出全部批注，点击条目跳回原文；关＝隐藏批注列表。";
            case "es_ES": return "Interruptor principal de las anotaciones tomato de este documento.\nActivado = lista todas las anotaciones en la parte inferior del panel, haz clic para saltar al original; desactivado = oculta la lista.";
            case "fr_FR": return "Interrupteur principal des annotations tomato de ce document.\nActivé = liste toutes les annotations en bas du panneau, cliquez pour revenir à l'original ; désactivé = masque la liste.";
            case "ja_JP": return "このドキュメントのトマト注釈の総スイッチ。\nオン＝パネル下部にすべての注釈を一覧表示、クリックで元の場所へジャンプ；オフ＝一覧を非表示。";
            case "zh_CHT": return "本文件番茄註釋的總開關。\n開＝面板底部列出全部註釋，點擊條目跳回原文；關＝隱藏註釋列表。";
            case "it_IT": return "Interruttore principale delle annotazioni tomato di questo documento.\nAttivo = elenca tutte le annotazioni in fondo al pannello, clicca per tornare all'originale; disattivo = nasconde l'elenco.";
            case "de_DE": return "Hauptschalter für die Tomato-Anmerkungen dieses Dokuments.\nEin = alle Anmerkungen unten im Panel auflisten, Klick springt zur Ursprungsstelle; Aus = Liste ausblenden.";
            case "he_IL": return "מתג ראשי להערות העגבנייה של מסמך זה.\nמופעל = רשימת כל ההערות בתחתית הפאנל, לחיצה מקפיצה למקור; כבוי = הסתרת הרשימה.";
            case "ru_RU": return "Главный выключатель томатных аннотаций этого документа.\nВкл = список всех аннотаций внизу панели, клик переходит к оригиналу; выкл = скрыть список.";
            case "pl_PL": return "Główny przełącznik adnotacji pomidora tego dokumentu.\nWł. = lista wszystkich adnotacji na dole panelu, kliknięcie przenosi do oryginału; wył. = ukryj listę.";
            case "en_US":
            default: return "Master switch for tomato annotations of this document.\nOn = list all annotations at the bottom of the panel, click one to jump back; off = hide the list.";
        }
    }
    public get 预览高度说明() {
        switch (this.lang) {
            case "zh_CN": return "卡片内嵌预览的最大高度（px）。\n数值越大，卡片预览越长、面板占用越多；出厂值 300。";
            case "es_ES": return "Altura máxima (px) de la vista previa incrustada en cada tarjeta.\nCuanto mayor sea el valor, más largas las vistas previas y más espacio ocupa el panel; valor de fábrica 300.";
            case "fr_FR": return "Hauteur maximale (px) de l'aperçu intégré à chaque carte.\nPlus la valeur est grande, plus les aperçus sont longs et plus le panneau prend de place ; valeur d'usine 300.";
            case "ja_JP": return "各カード内プレビューの最大高さ（px）。\n値が大きいほどプレビューが長くなり、パネルの占める幅も増えます。初期値は300。";
            case "zh_CHT": return "卡片內嵌預覽的最大高度（px）。\n數值越大，卡片預覽越長、面板佔用越多；出廠值 300。";
            case "it_IT": return "Altezza massima (px) dell'anteprima incorporata in ogni scheda.\nValore più alto = anteprime più lunghe e pannello più ingombrante; valore di fabbrica 300.";
            case "de_DE": return "Maximale Höhe (px) der in jeder Karte eingebetteten Vorschau.\nJe größer der Wert, desto länger die Vorschauen und desto mehr Platz braucht das Panel; Werkseinstellung 300.";
            case "he_IL": return "גובה מרבי (px) של התצוגה המקדימה בכל כרטיס.\nערך גדול יותר = תצוגות ארוכות יותר ופאנל שתופס יותר מקום; ברירת מחדל 300.";
            case "ru_RU": return "Максимальная высота (px) предпросмотра в карточке.\nБольше значение — длиннее предпросмотр и выше панель; заводское значение 300.";
            case "pl_PL": return "Maksymalna wysokość (px) podglądu wewnątrz karty.\nWiększa wartość = dłuższe podglądy i więcej miejsca w panelu; wartość fabryczna 300.";
            case "en_US":
            default: return "Max height (px) of the preview embedded in each card.\nLarger value = longer previews and a taller panel; factory default 300.";
        }
    }
}
