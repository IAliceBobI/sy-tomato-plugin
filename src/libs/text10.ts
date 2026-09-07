import { TomatoI18nABC11 } from "./text11";

export abstract class TomatoI18nABC10 extends TomatoI18nABC11 {

    public get 切换到文档背面() {
        switch (this.lang) {
            case "zh_CN": return "切换到文档背面";
            case "es_ES": return "Cambiar a la parte posterior del documento";
            case "fr_FR": return "Passer à l'arrière du document";
            case "ja_JP": return "ドキュメントの裏面に切り替える";
            case "zh_CHT": return "切換到文檔背面";
            case "it_IT": return "Passa al retro del documento";
            case "de_DE": return "Zur Rückseite des Dokuments wechseln";
            case "he_IL": return "מעבר לצד האחורי של המסמך";
            case "ru_RU": return "Перейти к обратной стороне документа";
            case "pl_PL": return "Przejdź do tyłu dokumentu";
            case "en_US":
            default: return "Switch to document backside";
        }
    }

    public get 用选中的行创建超级块超级块制卡取消制卡() {
        switch (this.lang) {
            case "zh_CN": return "用选中的行创建超级块、超级块制卡、取消制卡";
            case "es_ES": return "Crear bloque de línea seleccionada, crear tarjeta flash, cancelar creación";
            case "fr_FR": return "Créer un bloc avec les lignes sélectionnées, créer une carte flash, annuler la création";
            case "ja_JP": return "選択した行でスーパーブロックを作成、スーパーブロックカード作成、作成をキャンセル";
            case "zh_CHT": return "用選定的行創建超級塊、超級塊製卡、取消製卡";
            case "it_IT": return "Crea blocco con le righe selezionate, crea carta flash, annulla creazione";
            case "de_DE": return "Ausgewählte Zeilen in Superblock konvertieren, Flashkarte erstellen, Erstellung abbrechen";
            case "he_IL": return "צור סופר בלוק עם השורות שנבחרו, צור כרטיס זיכרון, בטל יצירה";
            case "ru_RU": return "Создать суперблок из выделенных строк, создать флеш-карту, отменить создание";
            case "pl_PL": return "Utwórz superblok z wybranych wierszy, utwórz kartę pamięci flash, anuluj tworzenie";
            case "en_US":
            default: return "Create superblock from selected rows, create flashcard, cancel creation";
        }
    }

    public get 取消当前文档内所有闪卡() {
        switch (this.lang) {
            case "zh_CN": return "取消当前文档内所有闪卡";
            case "es_ES": return "Cancelar todas las tarjetas flash en el documento actual";
            case "fr_FR": return "Annuler toutes les cartes mémoire dans le document actuel";
            case "ja_JP": return "現在のドキュメント内のすべてのフラッシュカードをキャンセルする";
            case "zh_CHT": return "取消當前文檔內所有閃卡";
            case "it_IT": return "Annulla tutte le flashcard nel documento corrente";
            case "de_DE": return "Alle Flashcards im aktuellen Dokument abbrechen";
            case "he_IL": return "בטל את כל הכרטיסים במסמך הנוכחי";
            case "ru_RU": return "Отменить все флеш-карты в текущем документе";
            case "pl_PL": return "Anuluj wszystkie karty pamięci w bieżącym dokumencie";
            case "en_US":
            default: return "Cancel all flashcards in the current document";
        }
    }

    public get 快捷键与开关() {
        switch (this.lang) {
            case "zh_CN": return "快捷键与开关";
            case "es_ES": return "Atajos e interruptores";
            case "fr_FR": return "Raccourcis et interrupteurs";
            case "ja_JP": return "ショートカットとスイッチ";
            case "zh_CHT": return "快捷鍵與開關";
            case "it_IT": return "Scorciatoie e interruttori";
            case "de_DE": return "Tastenkombinationen und Schalter";
            case "he_IL": return "קיצורי דרך ומתגים";
            case "ru_RU": return "Горячие клавиши и переключатели";
            case "pl_PL": return "Skróty i przełączniki";
            case "en_US":
            default: return "Shortcuts & Switches";
        }
    }

    public get 语言切换顶栏钮() {
        switch (this.lang) {
            case "zh_CN": return "语言切换顶栏钮";
            case "es_ES": return "Botones de cambio de idioma en la barra superior";
            case "fr_FR": return "Boutons de changement de langue dans la barre supérieure";
            case "ja_JP": return "言語切替トップバーボタン";
            case "zh_CHT": return "語言切換頂欄鈕";
            case "it_IT": return "Pulsanti di cambio lingua nella barra superiore";
            case "de_DE": return "Sprachumschaltungs-Buttons in der oberen Leiste";
            case "he_IL": return "כפתורי החלפת שפה בסרגל העליון";
            case "ru_RU": return "Кнопки переключения языка на верхней панели";
            case "pl_PL": return "Przyciski zmiany języka na górnym pasku";
            case "en_US":
            default: return "Language switch toolbar buttons";
        }
    }

    public get 快捷键如有冲突请调整() {
        switch (this.lang) {
            case "zh_CN": return "快捷键如有冲突或者不灵，请重新指定快捷键";
            case "es_ES": return "Si hay conflictos o no funciona el acceso directo, reconfigúrelo";
            case "fr_FR": return "Si les raccourcis entrent en conflit ou ne fonctionnent pas correctement, veuillez les modifier";
            case "ja_JP": return "ショートカットキーに競合や動作不良がある場合は、再設定してください";
            case "zh_CHT": return "快捷鍵如有衝突或者不靈，請重新指定快捷鍵";
            case "it_IT": return "Se i tasti di scelta rapida sono in conflitto o non funzionano, ridefiniscili";
            case "de_DE": return "Falls Tastenkombinationen konfliktbehaftet oder nicht funktionell sind, neu definieren";
            case "he_IL": return "אם יש התנגשות בקיצורי דרך או שאינם עובדים, אנא הגדר מחדש";
            case "ru_RU": return "Если сочетания клавиш конфликтуют или не работают, измените их";
            case "pl_PL": return "Jeśli skróty klawiaturowe są niespójne lub nie działają, zmień ich przypisanie";
            case "en_US":
            default: return "If shortcut keys are conflicting or not working, please reassign them";
        }
    }

    public get 清理所有失效的闪卡() {
        switch (this.lang) {
            case "zh_CN": return "清理所有失效的闪卡";
            case "es_ES": return "Limpiar todas las tarjetas flash inválidas";
            case "fr_FR": return "Nettoyer toutes les cartes mémoire invalides";
            case "ja_JP": return "無効なフラッシュカードをすべて削除する";
            case "zh_CHT": return "清理所有失效的閃卡";
            case "it_IT": return "Rimuovi tutte le flashcard non valide";
            case "de_DE": return "Alle ungültigen Flashcards bereinigen";
            case "he_IL": return "נקה את כל הכרטיסים הלא תקינים";
            case "ru_RU": return "Очистить все недействительные флеш-карты";
            case "pl_PL": return "Wyczyść wszystkie nieprawidłowe karty pamięci";
            case "en_US":
            default: return "Clean up all invalid flashcards";
        }
    }

    // □7 阶梯时长单位词（ladderDuration 升档显示用）。面板输入标签曾借用（cardui □3
    // 小时制），cardrenew □1 改回天粒度后退役该用途，现仅服务 durationText
    public get 小时() {
        switch (this.lang) {
            case "zh_CN": return "小时";
            case "es_ES": return "horas";
            case "fr_FR": return "heures";
            case "ja_JP": return "時間";
            case "zh_CHT": return "小時";
            case "it_IT": return "ore";
            case "de_DE": return "Stunden";
            case "he_IL": return "שעות";
            case "ru_RU": return "часов";
            case "pl_PL": return "godzin";
            case "en_US":
            default: return "hours";
        }
    }

    // □7 阶梯时长单位词（spreaddelay，2026-09-07）：ladderDuration 贪心升档显示用，
    // 与「小时」键同族同语种集；复数形态（西文 1 单数瑕疵沿现状，中文环境无感）
    public get 分钟() {
        switch (this.lang) {
            case "zh_CN": return "分钟";
            case "es_ES": return "minutos";
            case "fr_FR": return "minutes";
            case "ja_JP": return "分";
            case "zh_CHT": return "分鐘";
            case "it_IT": return "minuti";
            case "de_DE": return "Minuten";
            case "he_IL": return "דקות";
            case "ru_RU": return "минут";
            case "pl_PL": return "minut";
            case "en_US":
            default: return "minutes";
        }
    }
    public get 天() {
        switch (this.lang) {
            case "zh_CN": return "天";
            case "es_ES": return "días";
            case "fr_FR": return "jours";
            case "ja_JP": return "日";
            case "zh_CHT": return "天";
            case "it_IT": return "giorni";
            case "de_DE": return "Tage";
            case "he_IL": return "ימים";
            case "ru_RU": return "дней";
            case "pl_PL": return "dni";
            case "en_US":
            default: return "days";
        }
    }
    public get 月() {
        switch (this.lang) {
            // 「4个月」而非「4月」——后者与月份（April）撞名，「未来4月内」会被读成未来的四月
            case "zh_CN": return "个月";
            case "es_ES": return "meses";
            case "fr_FR": return "mois";
            case "ja_JP": return "ヶ月";
            case "zh_CHT": return "個月";
            case "it_IT": return "mesi";
            case "de_DE": return "Monate";
            case "he_IL": return "חודשים";
            case "ru_RU": return "месяцев";
            case "pl_PL": return "miesięcy";
            case "en_US":
            default: return "months";
        }
    }
    public get 年() {
        switch (this.lang) {
            case "zh_CN": return "年";
            case "es_ES": return "años";
            case "fr_FR": return "ans";
            case "ja_JP": return "年";
            case "zh_CHT": return "年";
            case "it_IT": return "anni";
            case "de_DE": return "Jahre";
            case "he_IL": return "שנים";
            case "ru_RU": return "лет";
            case "pl_PL": return "lat";
            case "en_US":
            default: return "years";
        }
    }

    public 准备推迟x个闪卡(length: number) {
        switch (this.lang) {
            case "zh_CN": return `准备推迟${length}个闪卡，请先设置推迟天数（整数、小数、负数均可）`;
            case "es_ES": return `Preparando para posponer ${length} tarjetas flash. Establece primero los días de retraso (enteros, decimales o negativos).`;
            case "fr_FR": return `Prêt à reporter ${length} cartes mémoire. Veuillez d'abord définir le nombre de jours (entier, décimal ou négatif).`;
            case "ja_JP": return `${length}枚のフラッシュカードを延期する準備中。まず何日延期するかを設定してください（整数、小数、負数可）。`;
            case "zh_CHT": return `準備延後${length}個閃卡，請先設定延後天數（整數、小數、負數皆可）`;
            case "it_IT": return `Pronto a posticipare ${length} flashcard. Imposta prima il numero di giorni (interi, decimali, negativi).`;
            case "de_DE": return `${length} Lernkarten verschieben. Gib zuerst die Anzahl der Tage ein (ganze Zahlen, Dezimalzahlen, negative Zahlen erlaubt).`;
            case "he_IL": return `מכין לדחות ${length} פלאש קרטיסים, קודם הגדר את מספר הימים (חיובי, שלילי או שבר)`;
            case "ru_RU": return `Готов к переносу ${length} флеш-карт. Сначала задайте количество дней (целое, дробное или отрицательное число).`;
            case "pl_PL": return `Gotowy do odroczenia ${length} fiszek. Najpierw ustaw liczbę dni (całkowite, dziesiętne, ujemne).`;
            case "en_US":
            default: return `Ready to postpone ${length} flashcards. Please set the delay days first (integers, decimals, or negatives allowed).`;
        }
    }

    public 准备分散推迟x个闪卡(length: number) {
        switch (this.lang) {
            case "zh_CN": return `准备分散推迟${length}个闪卡，请先设置推迟天数（整数、小数、负数均可）`;
            case "es_ES": return `Preparando para dispersar y posponer ${length} tarjetas flash. Establece primero los días de retraso.`;
            case "fr_FR": return `Prêt à reporter équitablement ${length} cartes mémoire. Définissez d'abord le délai (en jours, avec chiffres positifs, négatifs ou décimaux).`;
            case "ja_JP": return `${length}枚のフラッシュカードを分散して延期する準備中。まず何日延期するかを設定してください（整数、小数、負数可）。`;
            case "zh_CHT": return `準備分散延後${length}個閃卡，請先設定延後天數（整數、小數、負數皆可）`;
            case "it_IT": return `Pronto a distribuire e posticipare ${length} flashcard. Imposta prima il numero di giorni.`;
            case "de_DE": return `${length} Lernkarten gleichmäßig verschieben. Gib zuerst die Anzahl der Tage ein.`;
            case "he_IL": return `מכין לפזר ולדחות ${length} פלאש קרטיסים, קודם הגדר את המספר של הימים`;
            case "ru_RU": return `Готов к распределенному переносу ${length} флеш-карт. Сначала задайте количество дней.`;
            case "pl_PL": return `Gotowy do rozłożenia na czas ${length} fiszek. Najpierw ustaw liczbę dni.`;
            case "en_US":
            default: return `Ready to spread and postpone ${length} flashcards. Please set the delay days first (integers, decimals, or negatives allowed).`;
        }
    }

    public get 分散推迟闪卡() {
        switch (this.lang) {
            case "zh_CN": return "分散推迟闪卡";
            case "es_ES": return "Posponer tarjetas flash distribuidas";
            case "fr_FR": return "Reporter équitablement les cartes mémoire";
            case "ja_JP": return "分散して延期するフラッシュカード";
            case "zh_CHT": return "分散延後閃卡";
            case "it_IT": return "Posticipa flashcard distribuite";
            case "de_DE": return "Lernkarten gleichmäßig verschieben";
            case "he_IL": return "דיחוי פלאש קרטיסים מפוזרים";
            case "ru_RU": return "Распределить отложенные флеш-карты";
            case "pl_PL": return "Rozłożyć fiszki na czas";
            case "en_US":
            default: return "Spread Postpone Flashcards";
        }
    }

    // □7 阶梯时长（spreaddelay）：x=durationText(hours) 组合串
    public 把剩余闪卡分散推迟在未来x时长内(x: string) {
        switch (this.lang) {
            case "zh_CN": return `把剩余闪卡分散推迟在未来${x}内`;
            case "es_ES": return `Distribuir y posponer las tarjetas restantes en las próximas ${x}`;
            case "fr_FR": return `Reporter équitablement les cartes mémoire restantes dans les ${x} prochaines`;
            case "ja_JP": return `残りのフラッシュカードを今後${x}以内に分散して延期する`;
            case "zh_CHT": return `將剩餘閃卡分散延後在未來${x}內`;
            case "it_IT": return `Distribuire e posticipare le flashcard rimanenti nelle prossime ${x}`;
            case "de_DE": return `Verbleibende Lernkarten innerhalb der nächsten ${x} gleichmäßig verschieben`;
            case "he_IL": return `להפיץ ולדחות את הפלשקרטיסים הנותרים למשך ${x} הבאות`;
            case "ru_RU": return `Равномерно перенести оставшиеся флеш-карты на следующие ${x}`;
            case "pl_PL": return `Rozłóż i odłóż pozostałe fiszki na następne ${x}`;
            case "en_US":
            default: return `Spread and postpone remaining flashcards within the next ${x}`;
        }
    }

    public get 推迟多个闪卡分散在一段时间内() {
        switch (this.lang) {
            case "zh_CN": return "闪卡设置内功能：推迟多个闪卡，分散在一段时间内";
            case "es_ES": return "Función dentro de configuración de tarjetas flash: posponer múltiples tarjetas distribuyendo el retraso en un periodo.";
            case "fr_FR": return "Fonctionnalité des paramètres des cartes mémoire : reporter plusieurs cartes sur une période donnée.";
            case "ja_JP": return "フラッシュカード設定内機能：複数のフラッシュカードを一定期間内で分散して延期";
            case "zh_CHT": return "閃卡設置內功能：推遲多個閃卡，分散在一段時間內";
            case "it_IT": return "Funzione all'interno delle impostazioni delle flashcard: posticipare più flashcard distribuendole in un periodo.";
            case "de_DE": return "Funktion in den Lernkarteneinstellungen: Mehrere Lernkarten innerhalb eines Zeitraums gleichmäßig verschieben.";
            case "he_IL": return "פונקציה בתוך הגדרות הפלאשקרטיס: לדחות מספר פלאשקרטיס על פני תקופה";
            case "ru_RU": return "Функция в настройках флеш-карт: отложить несколько карт, распределив их в течение определенного времени.";
            case "pl_PL": return "Funkcja w ustawieniach fiszek: odłóż kilka fiszek na przestrzeni jednego okresu";
            case "en_US":
            default: return "Flashcard settings function: postpone multiple flashcards, distributing them over a period of time.";
        }
    }

    public get 修改文档中闪卡优先级() {
        switch (this.lang) {
            case "zh_CN": return "修改文档中闪卡优先级";
            case "es_ES": return "Modificar prioridad de flashcards en el documento";
            case "fr_FR": return "Modifier la priorité des flashcards dans le document";
            case "ja_JP": return "ドキュメント内のフラッシュカード優先度を変更";
            case "zh_CHT": return "修改文檔中閃卡優先級";
            case "it_IT": return "Modifica priorità delle flashcard nel documento";
            case "de_DE": return "Priorität der Flashcards im Dokument ändern";
            case "he_IL": return "שנה את רמת החשיבות של הפקדים במסמך";
            case "ru_RU": return "Изменить приоритет карточек в документе";
            case "pl_PL": return "Zmień priorytet fiszek w dokumencie";
            case "en_US":
            default: return "Modify flashcard priority in the document";
        }
    }

    public get 推迟闪卡() {
        switch (this.lang) {
            case "zh_CN": return "推迟闪卡";
            case "es_ES": return "Posponer flashcard";
            case "fr_FR": return "Reporter la flashcard";
            case "ja_JP": return "フラッシュカードを延期";
            case "zh_CHT": return "推遲閃卡";
            case "it_IT": return "Rimanda la flashcard";
            case "de_DE": return "Flashcard verschieben";
            case "he_IL": return "דחה את הפקד";
            case "ru_RU": return "Отложить карточку";
            case "pl_PL": return "Odłóż fiszkę";
            case "en_US":
            default: return "Defer flashcard";
        }
    }

    // cardui 后续（2026-09-07 分散推迟健壮性修复）：大批量推迟中途失败的用户提示
    public get 推迟闪卡失败请重试() {
        switch (this.lang) {
            case "zh_CN": return "推迟闪卡失败，请重试";
            case "es_ES": return "Error al diferir flashcards, reintenta";
            case "fr_FR": return "Échec du report des flashcards, réessayez";
            case "ja_JP": return "フラッシュカードの延期に失敗しました。再試行してください";
            case "zh_CHT": return "推遲閃卡失敗，請重試";
            case "it_IT": return "Differimento flashcard fallito, riprova";
            case "de_DE": return "Verschieben von Flashcards fehlgeschlagen, bitte erneut versuchen";
            case "he_IL": return "דחיית הפקדים נכשלה, נסה שוב";
            case "ru_RU": return "Не удалось отложить карточки, повторите попытку";
            case "pl_PL": return "Odłożenie fiszek nie powiodło się, spróbuj ponownie";
            case "en_US":
            default: return "Failed to defer flashcards, please retry";
        }
    }

    // cardui □3：键帽小组的短动作名（原 5 行快捷键文本表的 label 提出为数组，供面板
    // 「动作+键帽」成对渲染；顺序=删块/删卡/跳过/优先级/定位/分散推迟，与调用方 zip）
    public 复习快捷键动作名(): string[] {
        switch (this.lang) {
            case "zh_CN":
                return ["删块", "删卡", "跳过", "优先级", "定位", "分散推迟"];
            case "es_ES":
                return ["Eliminar bloque", "Eliminar flashcard", "Saltar", "Prioridad", "Localizar", "Diferir disperso"];
            case "fr_FR":
                return ["Supprimer bloc", "Supprimer flashcard", "Passer", "Priorité", "Localiser", "Report différé"];
            case "ja_JP":
                return ["ブロック削除", "カード削除", "スキップ", "優先度", "位置指定", "分散延期"];
            case "zh_CHT":
                return ["刪塊", "刪卡", "跳過", "優先級", "定位", "分散推遲"];
            case "it_IT":
                return ["Elimina blocco", "Elimina flashcard", "Salta", "Priorità", "Posiziona", "Differisci distribuito"];
            case "de_DE":
                return ["Block löschen", "Karte löschen", "Überspringen", "Priorität", "Positionieren", "Verteilt verschieben"];
            case "he_IL":
                return ["מחק בלוק", "מחק פקד", "דלג", "עדיפות", "מיקוד", "החרגה מפיזור"];
            case "ru_RU":
                return ["Удалить блок", "Удалить карточку", "Пропустить", "Приоритет", "Определить позицию", "Рассредоточенное отложение"];
            case "pl_PL":
                return ["Usuń blok", "Usuń fiszkę", "Pomiń", "Priorytet", "Lokalizacja", "Rozproszone odkładanie"];
            case "en_US":
            default:
                return ["Delete block", "Delete card", "Skip", "Priority", "Locate", "Spread defer"];
        }
    }

    public get 复习时删除当前闪卡() {
        switch (this.lang) {
            case "zh_CN": return "复习时删除当前闪卡";
            case "es_ES": return "Eliminar flashcard actual durante revisión";
            case "fr_FR": return "Supprimer la flashcard actuelle pendant la révision";
            case "ja_JP": return "復習中に現在のフラッシュカードを削除";
            case "zh_CHT": return "複習時刪除目前閃卡";
            case "it_IT": return "Elimina flashcard corrente durante revisione";
            case "de_DE": return "Aktuelle Flashcard beim Wiederholen löschen";
            case "he_IL": return "מחק את הפקד הנוכחי בזמן סקירה";
            case "ru_RU": return "Удалить текущую карточку во время повторения";
            case "pl_PL": return "Usuń bieżącą fiszkę podczas powtarzania";
            case "en_US":
            default: return "Delete current flashcard during review";
        }
    }

    public get 复习时跳过当前闪卡() {
        switch (this.lang) {
            case "zh_CN": return "复习时跳过当前闪卡";
            case "es_ES": return "Saltar flashcard actual durante revisión";
            case "fr_FR": return "Passer la flashcard actuelle pendant la révision";
            case "ja_JP": return "復習中に現在のフラッシュカードをスキップ";
            case "zh_CHT": return "複習時跳過目前閃卡";
            case "it_IT": return "Salta flashcard corrente durante revisione";
            case "de_DE": return "Aktuelle Flashcard beim Wiederholen überspringen";
            case "he_IL": return "דלג על הפקד הנוכחי בזמן סקירה";
            case "ru_RU": return "Пропустить текущую карточку во время повторения";
            case "pl_PL": return "Pomiń bieżącą fiszkę podczas powtarzania";
            case "en_US":
            default: return "Skip current flashcard during review";
        }
    }

    public get 闪卡复习时打开闪卡设置() {
        switch (this.lang) {
            case "zh_CN": return "闪卡复习时打开闪卡设置";
            case "es_ES": return "Abrir configuración de flashcard durante revisión";
            case "fr_FR": return "Ouvrir les paramètres de la flashcard pendant la révision";
            case "ja_JP": return "フラッシュカード復習時に設定を開く";
            case "zh_CHT": return "閃卡複習時打開閃卡設定";
            case "it_IT": return "Apri impostazioni flashcard durante revisione";
            case "de_DE": return "Flashcard-Einstellungen während Wiederholung öffnen";
            case "he_IL": return "פתח הגדרות פקד בזמן סקירה";
            case "ru_RU": return "Открыть настройки карточки во время повторения";
            case "pl_PL": return "Otwórz ustawienia fiszki podczas powtarzania";
            case "en_US":
            default: return "Open flashcard settings during review";
        }
    }

    public get 数量() {
        switch (this.lang) {
            case "zh_CN": return "数量";
            case "es_ES": return "Cantidad";
            case "fr_FR": return "Quantité";
            case "ja_JP": return "数量";
            case "zh_CHT": return "數量";
            case "it_IT": return "Quantità";
            case "de_DE": return "Anzahl";
            case "he_IL": return "כמות";
            case "ru_RU": return "Количество";
            case "pl_PL": return "Ilość";
            case "en_US":
            default: return "Quantity";
        }
    }

    public get menu添加右键菜单() {
        switch (this.lang) {
            case "zh_CN": return "添加右键菜单";
            case "es_ES": return "Agregar menú contextual";
            case "fr_FR": return "Ajouter menu contextuel";
            case "ja_JP": return "右クリックメニューを追加";
            case "zh_CHT": return "添加右鍵菜單";
            case "it_IT": return "Aggiungi menu contestuale";
            case "de_DE": return "Kontextmenü hinzufügen";
            case "he_IL": return "הוסף תפריט לחיצה ימנית";
            case "ru_RU": return "Добавить контекстное меню";
            case "pl_PL": return "Dodaj menu kontekstowe";
            case "en_US":
            default: return "Add right-click menu";
        }
    }

    public get 规避云端同步冲突() {
        switch (this.lang) {
            case "zh_CN":
                return "规避云端同步冲突：移动端插入闪念到Dailynote的子文件，桌面端自动合并闪念到Dailynote";
            case "es_ES":
                return "Evitar conflictos de sincronización en la nube: Insertar pensamientos en subarchivos de Dailynote desde dispositivos móviles, y fusionar automáticamente en Dailynote desde escritorio";
            case "fr_FR":
                return "Éviter les conflits de synchronisation cloud : insérer des pensées dans les sous-fichiers de Dailynote depuis un mobile, et les fusionner automatiquement dans Dailynote depuis le bureau";
            case "ja_JP":
                return "クラウド同期の競合回避：モバイルからDailynoteのサブファイルにアイデアを挿入し、デスクトップ側で自動的にDailynoteに統合";
            case "zh_CHT":
                return "規避雲端同步衝突：移動端插入閃念到Dailynote的子檔案，桌面端自動合併閃念到Dailynote";
            case "it_IT":
                return "Evita i conflitti di sincronizzazione cloud: inserisci idee nei sottodocumenti di Dailynote da dispositivi mobili e uniscili automaticamente a Dailynote dal desktop";
            case "de_DE":
                return "Cloud-Synchronisationskonflikte vermeiden: Einfügen von Gedanken in Unterdateien von Dailynote über Mobilgeräte, automatische Zusammenführung mit Dailynote auf dem Desktop";
            case "he_IL":
                return "הימנע מהסתבכות סנכרון ענן: הכנס מחשבות לתתי קבצים של Dailynote מהטלפון, ושרף אוטומטית ל-Dailynote מהשולחן";
            case "ru_RU":
                return "Избегать конфликтов синхронизации в облаке: добавлять идеи в подфайлы Dailynote с мобильных устройств и автоматически объединять их в Dailynote с рабочего стола";
            case "pl_PL":
                return "Unikaj konfliktów synchronizacji chmurowej: dodawaj notatki do podplików Dailynote z urządzeń mobilnych i automatycznie łącz je z Dailynote z komputera";
            case "en_US":
            default:
                return "Avoid cloud sync conflicts: insert notes into Dailynote's subfiles from mobile, auto-merge notes into Dailynote from desktop";
        }
    }

    public get 去除笔记颜色() {
        switch (this.lang) {
            case "zh_CN": return "去除笔记颜色";
            case "es_ES": return "Quitar color de nota";
            case "fr_FR": return "Supprimer la couleur de la note";
            case "ja_JP": return "ノートの色を削除する";
            case "zh_CHT": return "去除筆記顏色";
            case "it_IT": return "Rimuovi il colore della nota";
            case "de_DE": return "Notenfarbe entfernen";
            case "he_IL": return "הסרת צבע הערה";
            case "ru_RU": return "Убрать цвет заметки";
            case "pl_PL": return "Usuń kolor notatki";
            case "en_US": return "Remove note color";
            default: return "Remove note color";
        }
    }

    public get 离线可用新功能可用() {
        switch (this.lang) {
            case "zh_CN": return "离线可用，新功能可用";
            case "es_ES": return "Disponible sin conexión, nuevas funciones disponibles";
            case "fr_FR": return "Disponible hors ligne, de nouvelles fonctionnalités disponibles";
            case "ja_JP": return "オフラインで利用可能、新機能を利用できます";
            case "zh_CHT": return "離線可用，新功能可用";
            case "it_IT": return "Disponibile offline, nuove funzionalità disponibili";
            case "de_DE": return "Offline nutzbar, neue Funktionen verfügbar";
            case "he_IL": return "זמין לא מחובר, תכונות חדשות זמינות";
            case "ru_RU": return "Доступно оффлайн, новые функции доступны";
            case "pl_PL": return "Dostępne offline, nowe funkcje dostępne";
            case "en_US":
            default: return "Available offline, new features available";
        }
    }

    public get 将激活配置中有VIP标志的功能() {
        switch (this.lang) {
            case "zh_CN": return "将激活配置中，有VIP标志的功能";
            case "es_ES": return "Se activarán las funciones con la etiqueta VIP en la configuración";
            case "fr_FR": return "Activera les fonctionnalités marquées VIP dans la configuration";
            case "ja_JP": return "設定内のVIPマークが付いた機能を有効にします";
            case "zh_CHT": return "將激活配置中，有VIP標誌的功能";
            case "it_IT": return "Verranno attivate le funzionalità con il segno VIP nella configurazione";
            case "de_DE": return "Es werden die Funktionen mit dem VIP-Merkmal in der Konfiguration aktiviert";
            case "he_IL": return "יפעילו את התכונות עם סימן VIP בתצורה";
            case "ru_RU": return "Будут активированы функции с пометкой VIP в настройках";
            case "pl_PL": return "Aktywowane zostaną funkcje oznaczane jako VIP w konfiguracji";
            case "en_US":
            default: return "Will activate the functions marked as VIP in the configuration";
        }
    }

    public get 可联系客服获取7天试用激活码() {
        switch (this.lang) {
            case "zh_CN": return "新用户可联系客服，获取7天试用激活码";
            case "es_ES": return "Los nuevos usuarios pueden contactar con el servicio de atención al cliente para obtener un código de activación de prueba de 7 días";
            case "fr_FR": return "Les nouveaux utilisateurs peuvent contacter le service client pour obtenir un code d'activation d'essai de 7 jours";
            case "ja_JP": return "新規ユーザーはサポートに問い合わせることで、7日間の試用版アクティベーションコードを取得できます";
            case "zh_CHT": return "新用戶可聯繫客服，獲取7天試用激活碼";
            case "it_IT": return "I nuovi utenti possono contattare il servizio clienti per ottenere un codice di attivazione per la prova di 7 giorni";
            case "de_DE": return "Neue Benutzer können sich an den Kundensupport wenden, um einen Aktivierungscode für eine 7 - tägige Testversion zu erhalten";
            case "he_IL": return "משתמשים חדשים יכולים לפנות לשירות הלקוחות כדי לקבל קוד הפעלה לניסיון של 7 ימים";
            case "ru_RU": return "Новые пользователи могут связаться с службой поддержки для получения активационного кода на 7 - дневный пробный период";
            case "pl_PL": return "Nowi użytkownicy mogą skontaktować się z obsługą klienta, aby otrzymać kod aktywacyjny na 7 - dniową wersję próbną";
            case "en_US":
            default: return "New users can contact customer service to get a 7 - day trial activation code";
        }
    }
    public get 合并为单个文件() {
        switch (this.lang) {
            case "zh_CN": return "合并为单个文件VIP";
            case "es_ES": return "Combinar en un solo archivo VIP";
            case "fr_FR": return "Fusionner en un seul fichier VIP";
            case "ja_JP": return "VIPとして単一ファイルに結合";
            case "zh_CHT": return "合併為單一檔案VIP";
            case "it_IT": return "Unisci in un singolo file VIP";
            case "de_DE": return "Zu einer einzelnen VIP-Datei zusammenführen";
            case "he_IL": return "למצרך לקובץ בודד VIP";
            case "ru_RU": return "Объединить в один VIP-файл";
            case "pl_PL": return "Scal do jednego pliku VIP";
            case "en_US": return "Merge into single file VIP";
            default: return "Merge into single file VIP";
        }
    }

    public get 此操作不可撤销() {
        switch (this.lang) {
            case "zh_CN": return "此操作不可撤销";
            case "es_ES": return "Esta acción no se puede deshacer";
            case "fr_FR": return "Cette action est irréversible";
            case "ja_JP": return "この操作は元に戻せません";
            case "zh_CHT": return "此操作不可撤銷";
            case "it_IT": return "Questa azione non può essere annullata";
            case "de_DE": return "Diese Aktion kann nicht rückgängig gemacht werden";
            case "he_IL": return "פעולה זו אינה ניתנת לביטול";
            case "ru_RU": return "Это действие невозможно отменить";
            case "pl_PL": return "To działanie jest nieodwracalne";
            case "en_US": return "This action cannot be undone";
            default: return "This action cannot be undone";
        }
    }

    public get 此功能需要激活VIP() {
        switch (this.lang) {
            case "zh_CN": return "此功能需要激活VIP";
            case "es_ES": return "Esta función requiere activar VIP";
            case "fr_FR": return "Cette fonction nécessite l'activation du VIP";
            case "ja_JP": return "この機能を使用するにはVIPを有効にする必要があります";
            case "zh_CHT": return "此功能需要激活VIP";
            case "it_IT": return "Questa funzione richiede l'attivazione del VIP";
            case "de_DE": return "Diese Funktion erfordert die Aktivierung von VIP";
            case "he_IL": return "תכונה זו דורשת הפעלת VIP";
            case "ru_RU": return "Для этой функции требуется активировать VIP";
            case "pl_PL": return "Ta funkcja wymaga aktywacji VIP";
            case "en_US": return "This feature requires activating VIP";
            default: return "This feature requires activating VIP";
        }
    }

    public get 移动() {
        switch (this.lang) {
            case "zh_CN": return "移动";
            case "es_ES": return "Mover";
            case "fr_FR": return "Déplacer";
            case "ja_JP": return "移動";
            case "zh_CHT": return "移動";
            case "it_IT": return "Sposta";
            case "de_DE": return "Verschieben";
            case "he_IL": return "להזיז";
            case "ru_RU": return "Переместить";
            case "pl_PL": return "Przenieś";
            case "en_US":
            default:
                return "Move";
        }
    }

    public get 创建快速笔记() {
        switch (this.lang) {
            case "zh_CN": return "创建快速笔记";
            case "es_ES": return "Crear nota rápida";
            case "fr_FR": return "Créer une note rapide";
            case "ja_JP": return "クイックノートを作成";
            case "zh_CHT": return "建立快速筆記";
            case "it_IT": return "Crea nota rapida";
            case "de_DE": return "Schnellnotiz erstellen";
            case "he_IL": return "צור פתק מהיר";
            case "ru_RU": return "Создать быструю заметку";
            case "pl_PL": return "Utwórz szybką notatkę";
            case "en_US":
            default:
                return "Create Quick Note";
        }
    }
    public get 打开最后一个笔记() {
        switch (this.lang) {
            case "zh_CN": return "打开最后一个笔记";
            case "es_ES": return "Abrir la última nota";
            case "fr_FR": return "Ouvrir la dernière note";
            case "ja_JP": return "最後のノートを開く";
            case "zh_CHT": return "開啟最後一個筆記";
            case "it_IT": return "Apri l'ultima nota";
            case "de_DE": return "Letzte Notiz öffnen";
            case "he_IL": return "פתח את הפתק האחרון";
            case "ru_RU": return "Открыть последнюю заметку";
            case "pl_PL": return "Otwórz ostatnią notatkę";
            case "en_US":
            default:
                return "Open Last Note";
        }
    }
    public get 草稿切换() {
        switch (this.lang) {
            case "zh_CN": return "草稿切换";
            case "es_ES": return "Cambio de borrador";
            case "fr_FR": return "Basculer entre les brouillons";
            case "ja_JP": return "下書き切り替え";
            case "zh_CHT": return "草稿切換";
            case "it_IT": return "Cambio bozza";
            case "de_DE": return "Entwurf wechseln";
            case "he_IL": return "לחליף טיוטה";
            case "ru_RU": return "Переключение черновика";
            case "pl_PL": return "Przełączanie szkicu";
            case "en_US":
            default:
                return "Draft Switch";
        }
    }
    public get 请选择词语() {
        switch (this.lang) {
            case "zh_CN": return "请选择词语";
            case "es_ES": return "Por favor, seleccione una palabra";
            case "fr_FR": return "Veuillez sélectionner un mot";
            case "ja_JP": return "単語を選択してください";
            case "zh_CHT": return "請選擇詞語";
            case "it_IT": return "Seleziona una parola";
            case "de_DE": return "Bitte wählen Sie ein Wort";
            case "he_IL": return "בבקשה בחר מילה";
            case "ru_RU": return "Пожалуйста, выберите слово";
            case "pl_PL": return "Proszę wybrać słowo";
            case "en_US":
            default: return "Please select a word";
        }
    }

    public get 摘抄的单词加入到dailycard中() {
        switch (this.lang) {
            case "zh_CN": return "摘抄的单词加入到dailycard中";
            case "es_ES": return "Agregar la palabra resaltada a dailycard";
            case "fr_FR": return "Ajouter le mot souligné au dailycard";
            case "ja_JP": return "強調された単語をdailycardに追加する";
            case "zh_CHT": return "將摘抄的單詞加入到dailycard中";
            case "it_IT": return "Aggiungi la parola evidenziata a dailycard";
            case "de_DE": return "Füge das markierte Wort zu dailycard hinzu";
            case "he_IL": return "הוסף את המילה המודגשת ל-dailycard";
            case "ru_RU": return "Добавить выделенное слово в dailycard";
            case "pl_PL": return "Dodaj zaznaczone słowo do dailycard";
            case "en_US":
            default: return "Add the highlighted word to dailycard";
        }
    }

    public get 摘抄加入到dailycard当天目录下() {
        switch (this.lang) {
            case "zh_CN": return "摘抄加入到dailycard当天目录下";
            case "es_ES": return "Agregar el resaltado al directorio del día en dailycard";
            case "fr_FR": return "Ajouter la mise en évidence au répertoire du jour dans dailycard";
            case "ja_JP": return "強調をdailycard当日ディレクトリに追加する";
            case "zh_CHT": return "將摘抄加入到dailycard當天目錄下";
            case "it_IT": return "Aggiungi l'evidenziazione alla directory giornaliera di dailycard";
            case "de_DE": return "Füge die Markierung zum Tagesverzeichnis in dailycard hinzu";
            case "he_IL": return "הוסף את ההדגשה לתיקיית היום ב-dailycard";
            case "ru_RU": return "Добавить выделение в дневную папку в dailycard";
            case "pl_PL": return "Dodaj zaznaczenie do dzisiejszego katalogu w dailycard";
            case "en_US":
            default: return "Add the highlight to today's directory in dailycard";
        }
    }

    public get 摘抄时生成摘抄轨迹() {
        switch (this.lang) {
            case "zh_CN": return "摘抄时生成摘抄轨迹";
            case "es_ES": return "Generar trayectoria de resaltado al resaltar";
            case "fr_FR": return "Générer un chemin d'extrait lors de la mise en évidence";
            case "ja_JP": return "ハイライト時にハイライト軌跡を生成する";
            case "zh_CHT": return "摘抄時生成摘抄軌跡";
            case "it_IT": return "Genera traccia di evidenziazione durante l'evidenziazione";
            case "de_DE": return "Markierungsverlauf beim Markieren generieren";
            case "he_IL": return "צור מסלול הדגשה בעת הדגשה";
            case "ru_RU": return "Создавать путь выделения при выделении текста";
            case "pl_PL": return "Generuj ścieżkę zaznaczania podczas zaznaczania";
            case "en_US":
            default: return "Generate highlight path when highlighting";
        }
    }

    public get 显示与隐藏工具() {
        switch (this.lang) {
            case "zh_CN": return "显示与隐藏工具";
            case "es_ES": return "Mostrar y ocultar herramientas";
            case "fr_FR": return "Afficher et masquer les outils";
            case "ja_JP": return "ツールの表示と非表示";
            case "zh_CHT": return "顯示與隱藏工具";
            case "it_IT": return "Mostra e nascondi strumenti";
            case "de_DE": return "Werkzeuge ein- und ausblenden";
            case "he_IL": return "הצג והסתר כלים";
            case "ru_RU": return "Показать и скрыть инструменты";
            case "pl_PL": return "Pokaż i ukryj narzędzia";
            case "en_US": return "Show and hide tools";
            default: return "Show and hide tools";
        }
    }

    public get 移动端双击屏幕多行选择() {
        switch (this.lang) {
            case "zh_CN": return "移动端：双击屏幕多行选择";
            case "es_ES": return "Móvil: Selección múltiple con doble toque en la pantalla";
            case "fr_FR": return "Mobile : sélection multiple par double-tap sur l'écran";
            case "ja_JP": return "モバイル：画面をダブルタップして複数行を選択";
            case "zh_CHT": return "移動端：雙擊螢幕多行選擇";
            case "it_IT": return "Mobile: selezione multipla con doppio tap sullo schermo";
            case "de_DE": return "Mobil: Mehrfachauswahl durch Doppelklick auf den Bildschirm";
            case "he_IL": return "נייד: בחירה מרובת שורות עם לחיצה כפולה על המסך";
            case "ru_RU": return "Мобильный: множественный выбор строк двойным касанием экрана";
            case "pl_PL": return "Mobilnie: wielowierszowy wybór przez podwójne stuknięcie ekranu";
            case "en_US": return "Mobile: Multi-line selection by double tapping screen";
            default: return "Mobile: Multi-line selection by double tapping screen";
        }
    }

    public get 桌面端多行选择后Shift双击左键打开摘抄菜单() {
        switch (this.lang) {
            case "zh_CN": return "桌面端：多行选择后Shift双击左键，打开摘抄菜单";
            case "es_ES": return "Escritorio: Después de seleccionar varias líneas, haz doble clic izquierdo con Shift para abrir el menú de extractos";
            case "fr_FR": return "Bureau : après avoir sélectionné plusieurs lignes, cliquez deux fois avec le bouton gauche tout en maintenant Majuscule pour ouvrir le menu des extraits";
            case "ja_JP": return "デスクトップ：複数行選択後、Shiftを押しながら左クリックをダブルクリックして引用メニューを開く";
            case "zh_CHT": return "桌面端：多行選擇後Shift雙擊左鍵，打開摘抄菜單";
            case "it_IT": return "Desktop: dopo aver selezionato più righe, fai doppio clic col tasto sinistro tenendo premuto Shift per aprire il menu degli estratti";
            case "de_DE": return "Desktop: Nach mehrzeiliger Auswahl Linksklick mit Shift doppelt klicken, um das Zitatmenü zu öffnen";
            case "he_IL": return "שולחן עבודה: לאחר בחירת מספר שורות, לחץ פעמיים עם מקש Shift כדי לפתוח את תפריט ההעתקות";
            case "ru_RU": return "Настольный компьютер: после выбора нескольких строк нажмите левую кнопку мыши дважды с зажатым Shift, чтобы открыть меню выдержек";
            case "pl_PL": return "Komputer stacjonarny: po wybraniu wielu linii kliknij dwukrotnie lewym przyciskiem myszy z wciśniętym Shift, aby otworzyć menu cytatów";
            case "en_US": return "Desktop: After multi-line selection, Shift + double left-click to open the excerpt menu";
            default: return "Desktop: After multi-line selection, Shift + double left-click to open the excerpt menu";
        }
    }

    public get 向上选择() {
        switch (this.lang) {
            case "zh_CN": return "向上选择";
            case "es_ES": return "Seleccionar hacia arriba";
            case "fr_FR": return "Sélectionner vers le haut";
            case "ja_JP": return "上方向に選択";
            case "zh_CHT": return "向上選擇";
            case "it_IT": return "Seleziona verso l'alto";
            case "de_DE": return "Nach oben auswählen";
            case "he_IL": return "בחר כלפי מעלה";
            case "ru_RU": return "Выбор вверх";
            case "pl_PL": return "Wybierz w górę";
            case "en_US": return "Select upwards";
            default: return "Select upwards";
        }
    }

    public get 向下选择() {
        switch (this.lang) {
            case "zh_CN": return "向下选择";
            case "es_ES": return "Seleccionar hacia abajo";
            case "fr_FR": return "Sélectionner vers le bas";
            case "ja_JP": return "下方向に選択";
            case "zh_CHT": return "向下選擇";
            case "it_IT": return "Seleziona verso il basso";
            case "de_DE": return "Nach unten auswählen";
            case "he_IL": return "בחר כלפי מטה";
            case "ru_RU": return "Выбор вниз";
            case "pl_PL": return "Wybierz w dół";
            case "en_US": return "Select downwards";
            default: return "Select downwards";
        }
    }

    public get 摘抄不加入闪卡() {
        switch (this.lang) {
            case "zh_CN": return "摘抄不加入闪卡";
            case "es_ES": return "El extracto no se agrega a las tarjetas";
            case "fr_FR": return "L'extrait n'est pas ajouté aux cartes mémoire";
            case "ja_JP": return "引用はフラッシュカードに追加されません";
            case "zh_CHT": return "摘抄不加入閃卡";
            case "it_IT": return "L'estrazione non viene aggiunta alle flashcard";
            case "de_DE": return "Zitate werden nicht zu Lernkarten hinzugefügt";
            case "he_IL": return "העתקה לא מתווספת לקלטות";
            case "ru_RU": return "Выдержка не добавляется в карточки";
            case "pl_PL": return "Cytat nie zostanie dodany do fiszek";
            case "en_US": return "Excerpt not added to flashcards";
            default: return "Excerpt not added to flashcards";
        }
    }

    public get 只有最新的一个摘抄加入闪卡() {
        switch (this.lang) {
            case "zh_CN": return "只有最新的一个摘抄加入闪卡";
            case "es_ES": return "Solo el último extracto se agrega a las tarjetas";
            case "fr_FR": return "Seul le dernier extrait est ajouté aux cartes mémoire";
            case "ja_JP": return "最新の引用のみがフラッシュカードに追加されます";
            case "zh_CHT": return "只有最新的壹個摘抄加入閃卡";
            case "it_IT": return "Solo l'ultimo estratto viene aggiunto alle flashcard";
            case "de_DE": return "Nur das letzte Zitat wird zu Lernkarten hinzugefügt";
            case "he_IL": return "רק ההעתקה האחרונה מתווספת לקלטות";
            case "ru_RU": return "Только последняя выдержка добавляется в карточки";
            case "pl_PL": return "Tylko najnowszy cytat zostanie dodany do fiszek";
            case "en_US": return "Only the latest excerpt is added to flashcards";
            default: return "Only the latest excerpt is added to flashcards";
        }
    }

    public get 每个摘抄都加入闪卡() {
        switch (this.lang) {
            case "zh_CN": return "每个摘抄都加入闪卡";
            case "es_ES": return "Todos los extractos se agregan a las tarjetas";
            case "fr_FR": return "Tous les extraits sont ajoutés aux cartes mémoire";
            case "ja_JP": return "すべての引用をフラッシュカードに追加";
            case "zh_CHT": return "每個摘抄都加入閃卡";
            case "it_IT": return "Tutti gli estratti vengono aggiunti alle flashcard";
            case "de_DE": return "Alle Zitate werden zu Lernkarten hinzugefügt";
            case "he_IL": return "כל ההעתקות מתווספות לקלטות";
            case "ru_RU": return "Все выдержки добавляются в карточки";
            case "pl_PL": return "Wszystkie cytaty zostają dodane do fiszek";
            case "en_US": return "All excerpts are added to flashcards";
            default: return "All excerpts are added to flashcards";
        }
    }

    public get 执行摘抄() {
        switch (this.lang) {
            case "zh_CN": return "摘抄";
            case "es_ES": return "Extraer";
            case "fr_FR": return "Extraire";
            case "ja_JP": return "抜粋";
            case "zh_CHT": return "摘抄";
            case "it_IT": return "Estrai";
            case "de_DE": return "Extrahieren";
            case "he_IL": return "צטט";
            case "ru_RU": return "Выписать";
            case "pl_PL": return "Cytuj";
            case "en_US":
            default: return "Digest";
        }
    }

    // 2026-09-02 用户反馈落地：「留档（纯摘抄）」与「背诵（摘抄并制卡）」分别独立命令/快捷键
    public get 执行摘抄留档() {
        switch (this.lang) {
            case "zh_CN": return "摘抄留档";
            case "es_ES": return "Extraer (archivo)";
            case "fr_FR": return "Extraire (archivage)";
            case "ja_JP": return "抜粋（保存）";
            case "zh_CHT": return "摘抄留檔";
            case "it_IT": return "Estrai (archivio)";
            case "de_DE": return "Extrahieren (Archiv)";
            case "he_IL": return "צטט (ארכיון)";
            case "ru_RU": return "Выписать (архив)";
            case "pl_PL": return "Cytuj (archiwum)";
            case "en_US":
            default: return "Digest (archive)";
        }
    }

    public get 执行摘抄背诵() {
        switch (this.lang) {
            case "zh_CN": return "摘抄背诵";
            case "es_ES": return "Extraer (memorizar)";
            case "fr_FR": return "Extraire (mémorisation)";
            case "ja_JP": return "抜粋（暗記）";
            case "zh_CHT": return "摘抄背誦";
            case "it_IT": return "Estrai (memorizzazione)";
            case "de_DE": return "Extrahieren (Auswendiglernen)";
            case "he_IL": return "צטט (שינון)";
            case "ru_RU": return "Выписать (заучивание)";
            case "pl_PL": return "Cytuj (zapamiętywanie)";
            case "en_US":
            default: return "Digest (recite)";
        }
    }

    public get 执行摘抄并断句() {
        switch (this.lang) {
            case "zh_CN": return "摘抄并断句";
            case "es_ES": return "Extraer y segmentar";
            case "fr_FR": return "Extraire et segmenter";
            case "ja_JP": return "抜粋と文分割";
            case "zh_CHT": return "摘抄並斷句";
            case "it_IT": return "Estrai e suddividi";
            case "de_DE": return "Extrahieren und unterteilen";
            case "he_IL": return "צטט ופצל";
            case "ru_RU": return "Выписать с разбиением";
            case "pl_PL": return "Cytuj i podziel";
            case "en_US":
            default: return "Digest with sentence splitting";
        }
    }

    public get 按照回车拆分为多个段落块() {
        switch (this.lang) {
            case "zh_CN": return "按照回车拆分为多个段落块";
            case "es_ES": return "Dividir en múltiples bloques de párrafos según la tecla Enter";
            case "fr_FR": return "Diviser en plusieurs blocs de paragraphes en fonction de la touche Entrée";
            case "ja_JP": return "改行で複数の段落ブロックに分割する";
            case "zh_CHT": return "按照回車拆分成多個段落塊";
            case "it_IT": return "Dividi in più blocchi di paragrafi in base al tasto Invio";
            case "de_DE": return "In mehrere Absatzblöcke nach Enter aufteilen";
            case "he_IL": return "לחלק לרב חלקים של פסקאות לפי מקש האינטר";
            case "ru_RU": return "Разделить на несколько блоков абзацев по нажатию Enter";
            case "pl_PL": return "Podziel na wiele bloków paragrafów według klawisza Enter";
            case "en_US": return "Split into multiple paragraph blocks by pressing Enter";
            default: return "Split into multiple paragraph blocks by pressing Enter";
        }
    }

    public get 按照标点符号断句并插入下方() {
        switch (this.lang) {
            case "zh_CN": return "按照标点符号断句并插入下方";
            case "es_ES": return "Dividir frases por signos de puntuación e insertar debajo";
            case "fr_FR": return "Couper les phrases selon les signes de ponctuation et insérer en dessous";
            case "ja_JP": return "句読点で文を区切り、下に挿入する";
            case "zh_CHT": return "按照標點符號斷句並插入下方";
            case "it_IT": return "Dividi le frasi in base ai segni di punteggiatura e inserisci sotto";
            case "de_DE": return "Sätze nach Satzzeichen trennen und unten einfügen";
            case "he_IL": return "לחלק משפטים לפי סימני פיסוק ולהכניס למטה";
            case "ru_RU": return "Разделить предложения по знакам препинания и вставить ниже";
            case "pl_PL": return "Podziel zdania według znaków interpunkcyjnych i wstaw poniżej";
            case "en_US": return "Break sentences by punctuation marks and insert below";
            default: return "Break sentences by punctuation marks and insert below";
        }
    }
    get 合并为单个段落块() {
        switch (this.lang) {
            case "zh_CN": return "合并为单个段落块";
            case "es_ES": return "Combinar en un solo bloque de párrafo";
            case "fr_FR": return "Fusionner en un seul bloc de paragraphe";
            case "ja_JP": return "単一の段落ブロックに統合";
            case "zh_CHT": return "合併為單一段落塊";
            case "it_IT": return "Unisci in un singolo blocco di paragrafo";
            case "de_DE": return "Zu einem einzelnen Absatzblock zusammenführen";
            case "he_IL": return "לשלב לקטע פסקה יחיד";
            case "ru_RU": return "Объединить в один абзацный блок";
            case "pl_PL": return "Połącz w jeden blok akapitu";
            case "en_US":
            default: return "Merge into a single paragraph block";
        }
    }


    public get 设置() {
        switch (this.lang) {
            case "zh_CN": return "设置";
            case "es_ES": return "Configuración";
            case "fr_FR": return "Paramètres";
            case "ja_JP": return "設定";
            case "zh_CHT": return "設定";
            case "it_IT": return "Impostazioni";
            case "de_DE": return "Einstellungen";
            case "he_IL": return "הגדרות";
            case "ru_RU": return "Настройки";
            case "pl_PL": return "Ustawienia";
            case "en_US": return "Settings";
            default: return "Settings";
        }
    }

    public get 找不到闪卡() {
        switch (this.lang) {
            case "zh_CN": return "找不到闪卡";
            case "es_ES": return "No se encontraron tarjetas flash";
            case "fr_FR": return "Aucune carte flash trouvée";
            case "ja_JP": return "フラッシュカードが見つかりません";
            case "zh_CHT": return "找不到閃卡";
            case "it_IT": return "Non sono state trovate flashcard";
            case "de_DE": return "Keine Flashcards gefunden";
            case "he_IL": return "לא נמצאו כרטיסי פלאש";
            case "ru_RU": return "Флеш-карты не найдены";
            case "pl_PL": return "Nie znaleziono fiszek";
            case "en_US": return "No flashcards found";
            default: return "No flashcards found";
        }
    }
    public get 提取所有分片的笔记() {
        switch (this.lang) {
            case "zh_CN": return "提取所有分片的笔记";
            case "es_ES": return "Extraer notas de todos los fragmentos";
            case "fr_FR": return "Extraire toutes les notes des fragments";
            case "ja_JP": return "すべてのフラグメントからノートを抽出";
            case "zh_CHT": return "提取所有分片的筆記";
            case "it_IT": return "Estrai tutte le note dai frammenti";
            case "de_DE": return "Extrahiere alle Notizen aus den Fragmenten";
            case "he_IL": return "שלוף את כל הפתקים מכל השרשראות";
            case "ru_RU": return "Извлечь все заметки из фрагментов";
            case "pl_PL": return "Wyodrębnij wszystkie notatki z fragmentów";
            case "en_US":
            default: return "Extract notes from all fragments";
        }
    }

    public get 分片功能() {
        switch (this.lang) {
            case "zh_CN": return "分片功能";
            case "es_ES": return "Funcionalidad de fragmentación";
            case "fr_FR": return "Fonctionnalité de fragmentation";
            case "ja_JP": return "フラグメント機能";
            case "zh_CHT": return "分片功能";
            case "it_IT": return "Funzionalità frammento";
            case "de_DE": return "Fragment-Funktion";
            case "he_IL": return "פונקציית שרשראות";
            case "ru_RU": return "Функция фрагментов";
            case "pl_PL": return "Funkcja fragmentu";
            case "en_US":
            default: return "Fragment Functionality";
        }
    }



}
