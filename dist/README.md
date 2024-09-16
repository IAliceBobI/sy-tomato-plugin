[中文](https://github.com/IAliceBobI/sy-tomato-plugin/blob/main/README_zh_CN.md)

# Tomato Toolbox

> [I guess the image below is probably broken 😢, check here!](https://gitee.com/TokenzQdBN/sy-tomato-plugin/blob/main/README_zh_CN.md)

## Configuration
<details>
  
  <img src="assets/settings.gif" alt="drawing" width="800"/>
  
  > [To support and encourage, please visit here](https://gitee.com/TokenzQdBN/sy-tomato-plugin/blob/main/README_zh_CN.md#bug-feedback-recommendations)
  
  > [Unable to open images? Check here](https://gitee.com/TokenzQdBN/sy-tomato-plugin/blob/main/README_zh_CN.md)
</details>

---

## `Right-click Menu` and `Icon Menu`
<details>
  
  <img src="assets/menu.png" alt="drawing" width="600"/>
  <img src="assets/iconmenu.png" alt="drawing" width="600"/>
</details>

---

## Tomato Clock

**Status Bar Tomato Clock**
<details>
  
  *Quick Test* can add `0.01` minutes, for example, the configuration: `0.01,5,10,15,25,30`
  
  <img src="assets/tomatoClockCfg.png" alt="drawing" width="300"/>
  
  <img src="assets/statustomato.png" alt="drawing" width="300"/>

  > [Unable to open images? Check here](https://gitee.com/TokenzQdBN/sy-tomato-plugin/blob/main/README_zh_CN.md)

  * **0**: Cancel timing
  * **5**: Time for five minutes
  * …
  * **25**: Time for twenty-five minutes

  *Custom durations are supported.*
  *The timer will continue from the last session even after restarting SiYuan.*
  *Remaining time can be viewed.*
</details>

**Random content playback after timing ends**
<details>
  
  Randomly reads content from a specified file and displays it after timing ends.
  
  The demo file is `demo`, which includes text, images, IFrame links, videos, and audio.
  
  *`Escape` can close the pop-up window*
  
  <img src="assets/randVedio.gif" alt="drawing" width="600"/>
</details>

**Change background image after timing**
<details>
  
  A picture is needed for both light and dark modes.
  
  <img src="assets/changeBG.gif" alt="drawing" width="600"/>
  
  > [Unable to open images? Check here](https://gitee.com/TokenzQdBN/sy-tomato-plugin/blob/main/README_zh_CN.md)
</details>

---

## AI Knowledge Base Q&A `Ctrl+Shift+S`
<details>
  
  For SiYuan documents, ask questions and include references to the sources in the answers.
  
  Based on the Baidu Qianfan Knowledge Base.
  
  <img src="assets/knowledgeShow.gif" alt="drawing" width="800"/>
  
  ### 1 Open Configuration
  
  <img src="assets/knowledgeCfg.png" alt="drawing" width="400"/>
  
  ### 2 [Create API Key](https://console.bce.baidu.com/ai_apaas/secretKey)
  
  Follow the link in the configuration to register an account, create an API key, and fill it into the toolbox configuration.
  
  <img src="assets/knowledgeToken.png" alt="drawing" width="200"/>
  
  ### 3 [Create Knowledge Base](https://console.bce.baidu.com/ai_apaas/personalSpace/knowledgeBase)
  
  <img src="assets/knowledgeCreateKnowledge.png" alt="drawing" width="500"/>
  
  *You need to upload a random file first, otherwise you cannot create a knowledge base. Delete it later. All options are set to default.*
  
  <img src="assets/knowledgeCreateKnowledgeID.png" alt="drawing" width="300"/>
  
  Fill the ID into the toolbox configuration.
  
  ### 4 [Create Application](https://console.bce.baidu.com/ai_apaas/personalSpace/app)
  
  <img src="assets/knowledgeCreateApp.png" alt="drawing" width="800"/>
  
  *1 Must add the knowledge base created earlier.*
  
  *2 You can choose `ERNIE Bot 4.0`*
  
  *3 Publish, you need the ID after publishing*
  
  <img src="assets/knowledgeCreateAppID.png" alt="drawing" width="300"/>
  
  Get the ID after publishing and fill it into the toolbox configuration.
  
  At this point, it is ready to use.
  
</details>

---

## Capture Fleeting Thoughts
<details>
  
  Collect fleeting thoughts into the daily note, supporting image insertion from `camera` and `gallery`.
  
  ### Button Descriptions
  
  | 📸 Camera | 🖼️ Gallery |
  |---|---|
  | 📩 Insert into daily note | 🗑️ Clear list, clear input box |
  | 🔄 Sync data to cloud | |
  
  ### Using on Mobile
  
  *The original intent of the `Capture Fleeting Thoughts` feature is to quickly insert inspirations on mobile devices.*
  
  <img src="assets/idea1.jpg" alt="drawing" width="400"/>
  <img src="assets/idea2.jpg" alt="drawing" width="400"/>
  
  > [Unable to open images? Check here](https://gitee.com/TokenzQdBN/sy-tomato-plugin/blob/main/README_zh_CN.md)
  
  ### Possible Categories of Recorded Information
  
  | Location: 🏞️: Paragraph Block | Health: 💪: Paragraph Block | Social: 💬: Paragraph Block |
  |---|---|---|
  | Life: 🍴: Paragraph Block | Study: 📚: Paragraph Block | Work: 💼: Paragraph Block |
  | Task: 📌: **Task Block** | | |
  
  ### `Avoid Cloud Sync Conflicts` Option
  
  *Default is off, needs to be enabled in the settings.*
  
  <img src="assets/ideaconflict.png" alt="drawing" width="600"/>
  
  Reason: Simultaneous writing to Dailynote from both desktop and mobile can cause content inconsistency, leading to conflicts during synchronization.
  
  Therefore, simultaneous modification of the same file by both ends should be avoided.
  
  When this option is enabled, the mobile end will not directly write to the daily note but will write to a sub-file of the daily note.
  
  The desktop end merges the sub-file into the daily note indirectly.
  
  The mobile end is more inclined to record and does not directly modify the daily note.
  
  The desktop end is for organizing and maintaining, and can directly modify the daily note.
  
  > Advantage: No sync conflicts.
  
  > Advantage: Mobile and desktop synchronization via cloud features without needing to enable server. For example: Settings -> Cloud -> S3 -> aliyun OSS.
  
  > Disadvantage: Newly inserted fleeting thoughts cannot be directly seen in the mobile daily note, and need to be merged by the desktop end.
  
  ### Can be used in conjunction with the `Text to Reference` feature introduced below. Quick insertion of references.
  
  <img src="assets/fastref.gif" alt="drawing" width="600"/>
  
  > [Unable to open images? Check here](https://gitee.com/TokenzQdBN/sy-tomato-plugin/blob/main/README_zh_CN.md)
  
  ### Using on Desktop
  
  *While watching a <small>big</small> movie, you can also quickly `ctrl+Q` to open a small window and record inspirations.*
  
  If it doesn't work, check if there is a **conflict** with the `shortcut keys`.
  
  <img src="assets/ideadesktop.gif" alt="drawing" width="600"/>
  
  `ctrl+q` can be called from outside the application.
  `escape` to close.
  `shift+enter` for soft line breaks.
  `enter` to write into the daily note of the day.
  
  > [Unable to open images? Check here](https://gitee.com/TokenzQdBN/sy-tomato-plugin/blob/main/README_zh_CN.md)
</details>

---

## Text to Reference Conversion
<details>
  
  <img src="assets/text2ref.gif" alt="drawing" width="600" />
  
  ### `@@`: Exact Conversion:
  
  For example, in a content block, `aaa @@bb ccc` will be converted to `aaa bb ccc` where `bb` is a reference.
  
  Use `@` to isolate references from other text. For instance, `EE@@ABC@FF` will be converted to `EEABCFF` where `ABC` is a reference.
  
  ### `@@@`: Fuzzy Conversion:
  
  For example, in a content block, `aaa @@@剑仙 ccc` may be converted to `aaa 九位剑仙 ccc` if there is already a file named `九位剑仙`.
  
  If there is no existing file name containing `剑仙`, the text `@@@剑仙` will be converted to `@剑仙@`.
  
  **When creating a file, you can make a flashcard for it and add a pinyin attribute to the file. This needs to be enabled in the configuration.**
</details>

---

## Flashcard Priority
<details>
  
  <img src="assets/cardpri1.gif" alt="drawing" width="600" />
  
  Set priority for flashcards, with higher numerical priority being reviewed first.
  
  Within the same priority level, the order is shuffled each time for review.
  
  After setting, you can review directly using `alt+0`.
  
  The plugin sorts flashcards based on priority before review.
  
  The priority is stored in the flashcard's custom attribute `card-priority`.
  
  You can adjust it manually or through the buttons below the flashcard.
  
  The priority range is 0 to 100, with a default priority of 50. Flashcards without a set priority also default to 50.
  
  **Postponement:**
  
  Postponed flashcards are added to bookmarks for easy viewing of all postponed flashcards.
  
  After postponing a flashcard, the due date is displayed. When the time comes, it automatically returns to normal status.
  
  Postponed flashcards will not be sent to the user for review.
  
  You can also hover over the priority to view the number of review times.
  
  <img src="assets/cardSusp.gif" alt="drawing" width="600"/>
  
  > [If you can't open the image, please check here](https://gitee.com/TokenzQdBN/sy-tomato-plugin/blob/main/README_zh_CN.md)
</details>

---

## Add/Delete Flashcard Buttons During Review
<details>
  
  Please enable the `Flashcard Tools` in the configuration.
  
  **Review Interface Shortcuts:**
  
  Cancel card making: `ctrl+9`
  Skip card: `ctrl+8`
  Change priority: `ctrl+;`
  
  <img src="assets/delCard.gif" alt="drawing" width="700"/>
  
  **List Card Making:**
  
  `ctrl+1` to create a list and make a card. In a list card, using `ctrl+1` again cancels card making.
  
  <img src="assets/createCard.gif" alt="drawing" width="700"/>
  
  > [If you can't open the image, please check here](https://gitee.com/TokenzQdBN/sy-tomato-plugin/blob/main/README_zh_CN.md)
  
  **Cancel Card Making for All Cards in a Document**
  
  <img src="assets/removeCardsInDoc.gif" alt="drawing" width="700"/>
</details>

---

## Bottom Backlinks
<details>
  
  Incorporate a bottom backlinks area similar to that in `logseq`. For list/outline blocks, we can see their parent and child blocks. The parent is viewed from the breadcrumb, and the child from the content.
  
  ### Concept Bar/Reference Bar
  
  **`Hierarchical Concept`: File names like `AA|BB|CC`, its bottom backlinks, the top double-link bar, might show: `AA*  AA|BB*  AA|BB|CC*` if available. (Red circle in the image)**
  
  **`Related Concepts`: Other double-links in the double-link bar besides `Hierarchical Concept`.**
  
  *Below demonstrates the `Hierarchical Concept Forest` with the `Text to Reference` feature enabled.*
  
  <img src="assets/bkAndText2ref.gif" alt="drawing" width="600"/>
  
  **Backlinks Area Tools: Edit, drag, copy with one click, move with one click, real-time search filtering, mark whether a backlink belongs to the current document, etc...**
  
  <img src="assets/bottomBK.png" alt="drawing" width="1000"/>
  
  > Right-click menu in the document allows enabling and disabling the bottom backlinks for this document.
  
  > [If images cannot be opened, please check here](https://gitee.com/TokenzQdBN/sy-tomato-plugin/blob/main/README_zh_CN.md)
  
  ### Place Unrelated Content at the Bottom
  
  <img src="assets/uncorrelated.gif" alt="drawing" width="1000"/>
  
  ### Bottom Backlinks::Search Syntax
  
  *The input box supports real-time search for multiple `keywords`.*
  
  **Separate `keywords` with `spaces`, and if a `keyword` is preceded by an `exclamation mark`, it means the backlink should not contain this `keyword`.**
  
  **For example:** `Xiaoming Xiaohong !Laowang !Wangzong` will search for backlinks containing `Xiaoming` and `Xiaohong` but not containing `Laowang` or `Wangzong`.
  
  **If `keywords` are separated by `|`, it means any of these `keywords` should appear.**
  
  **For example:** `Xiaoming Xiaohong|Ruhua !Laowang !Wangzong` will search for backlinks containing `Xiaoming` and at least one of `Xiaohong` or `Ruhua`, but not containing `Laowang` or `Wangzong`.
  
  **For example:** `Xiaoming Laopao Xiaohong|Ruhua|Qiuju !Laowang !Wangzong` will search for backlinks containing `Xiaoming` and `Laopao`, and at least one of `Xiaohong`, `Ruhua`, or `Qiuju`, but not containing `Laowang` or `Wangzong`.
  
  > The `Bottom Backlinks Area` is default off, please turn it on from the configuration.
</details>

---

## Bidirectional Links
<details>
  
  ### Usage 1
  
  <img src="assets/bilink1.gif" alt="drawing" width="600"/>
  
  Use `Alt+F1` to select the first block, and use `Alt+F2` at the second block to create two links that jump to each other.
  
  `alt+shift+F1` can fix bidirectional links. For example, if you cut and paste content and the block ID changes, you can use `alt+shift+F1` to repair it.

  <img src="assets/fixbrokenlnks.gif" alt="drawing" width="400"/>

  ### Usage 2

  link to bottom: `Alt+F3`

  <img src="assets/bilink1bottom.gif" alt="drawing" width="400"/>

  ### Usage 3
  
  <img src="assets/bilink2.gif" alt="drawing" width="600"/>
  
  Shortcut: `Alt+/` or select the corresponding function from the menu.
  
  > **Tip** Multiple lines can be selected, but the shortcut key: `Alt+/` must be used.
  
  > [If images cannot be opened, please check here](https://gitee.com/TokenzQdBN/sy-tomato-plugin/blob/main/README_zh_CN.md)
</details>

---

## Content Reminder `ctrl+3`
<details>
  
  *Set a reminder date for a content block!*
  
  **Place the cursor on the `content block` to be selected, and choose `Set Reminder` from the right-click menu**
  
  <img src="assets/scheduleSetTime.gif" alt="drawing" width="600"/>
  
  *After setting the time, an automatic time bookmark will be added. Check it in the bookmarks panel.*
  
  *After the reminder, the bookmark will be automatically deleted*
  
  > The reminder feature is default off, please turn it on in the configuration.
  
  **Pressing `ctrl+3` twice consecutively copies the block ID where the cursor is located**
  
  <img src="assets/scheduleCopyID.gif" alt="drawing" width="400"/>
  
  > [If images cannot be opened, please check here](https://gitee.com/TokenzQdBN/sy-tomato-plugin/blob/main/README_zh_CN.md)
</details>

---

## Reading Point
<details>
  
  <img src="assets/readingpoint.gif" alt="drawing" width="800"/>
  
  *A reading point is the last position read in a document, which is recorded in the `bookmark` and automatically deletes other `bookmarks` within the current file to maintain only one `bookmark` in the file.*
  
  **Place the cursor on the `content block` to be selected, use the right-click menu, or directly use `Ctrl+2`.**
  
  **To view the `bookmark` later, you can directly check the `bookmarks panel`. You can also click the `Reading Point` (ctrl+4) icon in the upper right corner to view more detailed information.**
  
  <img src="assets/bookmark.png" alt="drawing" width="600"/>
  
  > The Reading Point has been upgraded: In addition to the previous bookmark function, flashcards have been added, utilizing the scheduling capabilities of flashcards, and also saving which files have been viewed at the time.
  
  > **Note** The grouping method of the `Reading Point` icon is different from that of the bookmarks panel.
</details>

---

## Cleaning Invalid Flashcards
<details>
  
  <img src="assets/cleancards.gif" alt="drawing" width="600"/>
  
  *If the content where the flashcards are located has been deleted, these invalid flashcards still exist on the disk. We can delete them.*
  
  **Open the command palette and select `Clean All Invalid Flashcards`**
  
  > **Note** Do not use this feature while the index is being rebuilt. The index being rebuilt is not yet complete, and the plugin may be misled by the index, leading to accidental deletion of flashcards.
  
  > **Note** If you use this feature after closing the `notebook`, normal flashcards may also be considered invalid. Therefore, all notebooks should be open when using this feature.
  
  > **Note** Make a backup before using!
  
  > [If you can't open the image, click here](https://gitee.com/TokenzQdBN/sy-tomato-plugin/blob/main/README_zh_CN.md)
</details>

---

## Handling Long Content Operations
<details>
  
  *Copying, moving, and deleting long content drives me crazy! Here, I use a simple method to handle such operations!*
  
  **Moving Operation**
  
  <img src="assets/longMove.gif" alt="drawing" width="600"/>
  
  *Suppose there are `Document 1` and `Document 2`, in `Document 1`, wrap the content to be moved with `aacc1` and `aacc2`, then insert `aacc3` at a certain position in `Document 2`, and finally open the `command palette` and select `Batch Move Large Continuous Content`*
  
  **This moving operation will transfer the flashcards along with the content, without changing the review status of the flashcards. Simple `ctrl+c,v` will make the involved flashcards invalid.**
  
  > **Note** `aacc1`, `aacc2`, `aacc3` must not have spaces before or after, otherwise the plugin will not find them.
  
  <img src="assets/cmd.png" alt="drawing" width="600"/>
  
  **Copying Operation**
  
  <img src="assets/longCopy.gif" alt="drawing" width="600"/>
  
  **Deleting Operation**
  
  Similar to the moving operation, but select the delete command and do not need to write `aacc3`.
</details>

---

## Image Overlay (Flashcard Image Censoring)
<details>
  
  <img src="assets/overlay.gif" alt="drawing" width="800"/>
  
  **Usage:** Right-click on the image block -> Plugin -> Add Image Overlay.
  
  This feature is disabled by default and needs to be enabled in the `Tomato Toolbox` configuration.
  
  **To view the original image, double-click on the area without the overlay in the image.**
  
  **Supports image zooming. Overlays created in older versions need to be re-edited to support zooming.**
  
  **Supports mouse drag to draw a rectangle.**
  
  > Why this feature?
  >
  > My needs are slightly different from the `Image Overlay` feature of [siyuan-plugin-flash-enhance](https://github.com/zxhd863943427/siyuan-plugin-flash-enhance). I want the image to always be covered, regardless of whether it is in flashcard review, unless the mouse hovers over it, the overlay will be removed. For an image with multiple overlays, only the overlay under the mouse will disappear. (Some code referenced from: [siyuan-plugin-flash-enhance](https://github.com/zxhd863943427/siyuan-plugin-flash-enhance), thanks to: [zxhd863943427](https://github.com/zxhd863943427))
  
  > [If you can't open the image, click here](https://gitee.com/TokenzQdBN/sy-tomato-plugin/blob/main/README_zh_CN.md)
</details>

---

## Move Content to Daily Note
<details>
  
  `Ctrl+6`
  
  <img src="assets/move2dailynote.gif" alt="drawing" width="700"/>
  
  Move the content block at the cursor or all selected content to the bottom of today's daily note.
  
  Supports right-click and shortcut keys, disabled by default, please enable from the configuration.
  
  > Only moves the selected single line or multiple lines of content, or the block at the cursor when nothing is selected.
  
  > [If you can't open the image, click here](https://gitee.com/TokenzQdBN/sy-tomato-plugin/blob/main/README_zh_CN.md)
</details>

---

## Delete Checked Tasks (Command Palette) `shift+alt+u`
<details>
  
  <img src="assets/taskrm.gif" alt="drawing" width="600"/>
  
  Right-click menu, enabled by default, deletes checked tasks within the current document.
  
  > [If you can't open the image, click here](https://gitee.com/TokenzQdBN/sy-tomato-plugin/blob/main/README_zh_CN.md)
</details>

## Uncheck Tasks (Command Palette) `shift+alt+d`
<details>
  
  Right-click menu, enabled by default, unchecks all tasks in the current document.
</details>

---

## Top Toolbar
<details>
  
  ![Alt text](assets/nextdailynote.png)
  
  ### Open Previous/Next Daily Note (Configuration: Move Content to Daily Note)
  
  **The last two icons represent the previous and next daily notes**
  
  `alt+w`, `alt+q`
  
  > Default is off, please enable from configuration: "Move Content to Daily Note" feature.
  
  ### Open Flashcards (Configuration: Enable Toolbar Button) `alt+0`
  
  **The lightning icon is** default open.
  
  ### Global Document Navigation (Configuration: Enable Toolbar Button) `alt+1`
  
  Automatically opens the document tree, collapses documents, and navigates to the document. Only the path of the target document is expanded, other document paths are collapsed.
  
  ### Refresh Virtual References (Configuration: Enable Toolbar Button) `F5`
  
  Default open.
  
  ### Language Switch Button (Configuration: Enable Toolbar Button)
  
  Default off.
  
  > Some of the above shortcuts conflict with the official ones and need to be removed before they can take effect. Alternatively, modify the shortcuts of this plugin.
</details>

---

## Artificial Intelligence (Streaming Stream)
<details>
  
  Supported: *ERNIE, DeepSeek, Moonshot, OpenAI in the Source Configuration.*
  
  First, write keys in the configuration:
  
  <img src="assets/baiduAI1.png" alt="drawing" width="400"/>
  
  Then use the shortcut `Alt+Shift+S` for `selected text` or `text at the cursor`:
  
  <img src="assets/AI_OP.gif" alt="drawing" width="700"/>
  
  > [If the image cannot be opened, please check here](https://gitee.com/TokenzQdBN/sy-tomato-plugin/blob/main/README_zh_CN.md)
</details>

---

## Copy Multiple Blocks as a Image
<details>
  
  <img src="assets/copAsImg.gif" alt="drawing" width="900"/>
</details>

---

## Additional Features
<details>
  
  ### Static Backlinks
  
  Exportable bottom backlinks.
  
  For files with a large number of backlinks, using static backlinks is stress-free.
  
  <img src="assets/statickLnk.gif" alt="drawing" width="800"/>
  
  > [Unable to open the image? Click here](https://gitee.com/TokenzQdBN/sy-tomato-plugin/blob/main/README_zh_CN.md)
  
  ### Move Document Content to Another Document
  
  <img src="assets/moveDocs.gif" alt="drawing" width="600"/>
  
  ### Merge Documents
  
  <img src="assets/mergeDocs.gif" alt="drawing" width="600"/>
  
  Right-click at a certain point in `Document B` -> Plugins -> Quick Menu, find the `Merge Documents` button.
  
  Move the content of `Document A` to the right-click location, transfer the references and properties of `Document A` to `Document B`.
  
  Delete `Document A`.
  
  > [Unable to open the image? Click here](https://gitee.com/TokenzQdBN/sy-tomato-plugin/blob/main/README_zh_CN.md)
  
  ### Convert Selected Text to Reference
  
  Shortcut key: `F3`
  
  <img src="assets/text2refF3.gif" alt="drawing" width="500"/>
  
  > [Unable to open the image? Click here](https://gitee.com/TokenzQdBN/sy-tomato-plugin/blob/main/README_zh_CN.md)
  
  ### One-click Bookmarking
  
  One-click bookmarking `ctrl+f1`
  One-click deletion of all bookmarks in the current document `ctrl+f2`
  
  <img src="assets/flagBookmark.gif" alt="drawing" width="500"/>
  
  > [Unable to open the image? Click here](https://gitee.com/TokenzQdBN/sy-tomato-plugin/blob/main/README_zh_CN.md)
  
  ### Jump to Block ID in Clipboard
  
  <img src="assets/gotoBlockID.gif" alt="drawing" width="500"/>
  
  > [Unable to open the image? Click here](https://gitee.com/TokenzQdBN/sy-tomato-plugin/blob/main/README_zh_CN.md)
  
  ### Add Selected Text and Its Pinyin as Aliases in the Document for Easy Search by Pinyin. Ctrl+shift+y
  
  Default is off, needs to be turned on from the configuration. Then use it in the right-click menu after selecting the text.
  
  <img src="assets/addPinyin.gif" alt="drawing" width="800"/>
  
  ### Organize Images, Videos, and Audios Under Assets
  
  *If there are too many files under assets, it's a minefield, accidentally clicking on them can cause a freeze. I personally organize these files into a folder structure by year and month.*
  
  <img src="assets/tidyAssets.gif" alt="drawing" width="800"/>
  
  ### Create an Empty Xmind File
  
  *Requires Xmind to be installed first*
  
  <img src="assets/createXmid.gif" alt="drawing" width="500"/>
  
  > [Unable to open the image? Click here](https://gitee.com/TokenzQdBN/sy-tomato-plugin/blob/main/README_zh_CN.md)
  
  ### Make Content Blurry Alt+Shift+D
  
  The first press applies a blur effect, the second press removes the blur effect.
  
  <img src="assets/makeItBlur.gif" alt="drawing" width="300"/>
  
  ### Create a Table Using Alt+Shift+T
  
  Columns in a table are separated by the '|' character for multiple lines.
  
  <img src="assets/makeTab.gif" alt="drawing" width="300"/>
  
  ### Paragraph block read-only function `Alt+Shift+L`
  
  ### Can locate the backlinks of a specified block, as well as virtual forward links `Alt+Shift+A`
  
  ### Delete Content and Flashcards `ctrl+alt+d`

  Simultaneously delete the selected or cursor-positioned content block, document, and corresponding flashcards. If the cursor is at the title, it deletes the document. If deleting a document, it first deletes the flashcards within it.

  ### Click on the reference count in the upper right corner of the block to locate all backlinks.
  
  <img src="assets/openRefByClick.gif" alt="drawing" width="600"/>
</details>

# Acknowledgements

<details>
  <summary>Thank you to all the generous supporters, your donations are of great significance to the development of my plugins.</summary>

* 2024-08 [Tisamn](https://afdian.com/u/cef7f2e42a0f11efb03952540025c377)
* 2024-08 `edapan`
* 2024-08 [虚青海](https://afdian.com/a/xqh042)
* 2024-08 `duanduan`
* 2024-07 `凭风引`
* 2024-07 `**岚`
* 2024-06 [虚青海](https://afdian.com/a/xqh042)
* 2024-06 [爱发电用户_jykN](https://afdian.com/u/20b38264295811efb0695254001e7c00)
* 2024-06 `雨`
* 2024-06 `*超`
* 2024-06 `**峰`
* 2024-06 [固元膏v](https://afdian.com/u/d1fe450cbf4b11ea9ffa52540025c377)
* 2024-05 `*超`
* 2024-05 `**瑞`
* 2024-05 `**瑞`
* 2024-05 `**刚`
* 2024-05 `*驰`
* 2024-05 [盐酸有点咸](https://afdian.com/u/379a287008a111efa3c552540025c377)
* 2024-04 `*江`
* 2024-04 [无糖](https://afdian.com/u/7eefa1207fe711ee971552540025c377)
* 2024-04 `典典`
* 2024-03 `**清`
* 2024-03 [JeffreyChen](https://afdian.com/a/JeffreyChen)
* 2024-03 `八面来风`
* 2024-03 `**清`
* 2024-03 `*理`
* 2024-02 `八面来风`
* 2024-02 `*5770`
* 2024-02 `**轩`
* 2024-02 `**航`
* 2024-02 `**航`
* 2024-02 `**龙`
* 2024-02 `**棉`
* 2024-01 [QQQOrange](https://afdian.com/u/2c73a3c6a1f011eeb98a52540025c377)
* 2024-01 `燃烬`
* 2024-01 `*舟`
* 2024-01 `*元`
* 2024-01 [赐我一胖](https://afdian.com/u/74d98cf66f0711eda8ca52540025c377)
* 2023-12 [爱发电用户_WGH7](https://afdian.com/u/ceefbee4a48111ee983f5254001e7c00)
* 2023-12 [爱发电用户_Pv38](https://afdian.com/u/3911fecaa3ad11ee8fa95254001e7c00)
* 2023-12 [赐我一胖](https://afdian.com/u/74d98cf66f0711eda8ca52540025c377)
* 2023-12 [QQQOrange](https://afdian.com/u/2c73a3c6a1f011eeb98a52540025c377)
* 2023-12 [没头脑和不高兴](https://afdian.com/u/25e08b1eb1a511edbb3d5254001e7c00)
* 2023-12 [爱发电用户_EbBe](https://afdian.com/u/d11e3c741bc711ee95eb52540025c377)
* 2023-12 [爱发电用户_b2864](https://afdian.com/u/b286492496af11eea38752540025c377)

</details>

# Donations, Encouragement, and Reminders for Updates 🎉

<div>
<img src="https://player-pubpic.oss-cn-beijing.aliyuncs.com/static/wx1.png" alt="Alipay" width="300" />
</div>
<br>
<div>
<img src="https://player-pubpic.oss-cn-beijing.aliyuncs.com/static/zfb1.jpg" alt="WeChat" width="300" />
</div>

# Changelog

## 2024-09-14

* New Feature: Render references containing a specified prefix as tags.

## 2024-09-13

* Quick Documentation: Add "Document Backside" (Draft), where each document can switch between the backside and the front side using `F4`. The default shortcut is likely to conflict, so please adjust it.

## 2024-09-12

* Bottom backlinks: supports sorting by title.

## 2024-09-09

* Bottom backlinks: Feature optimization. You can now jump from the title to the bottom backlinks.

<details>
  <summary>more changelogs</summary>

## 2024-09-08

* The logic for traversing daily notes has been improved and is more reasonable.

## 2024-09-02

* Miscellaneous: `Alt+Shift+A`, can locate the backlinks of a specified block, as well as virtual forward links
* Reading point: `ctrl+4`, redesigned for more convenience and speed.

## 2024-09-01

* Bottom backlinks: Can be sorted by modification time in descending order, or by creation time in descending order.
* add `link to block bottom` function.

## 2024-08-31

* Configurable, move the HomeEnd icon to the left.

## 2024-08-27

* Show custom properties of the document. Can be turned on from the settings.

## 2024-08-26

* Some minor updates
* Bottom backlink: adding concise mode
  
## 2024-08-22

* Upgrade dependencies.
* Improve loading speed.

## 2024-08-18

* `ctrl+1` Experience is smooth!

## 2024-08-16

* Move to the daily note: Add a copy function. It can copy to a new file.

## 2024-08-14

* Miscellaneous: ctrl+alt+d simultaneously deletes the selected content block, the content block at the cursor, the document, and the corresponding flashcards. If the cursor is at the title, it deletes the document. If it is deleting a document, it first deletes the flashcards within it.

## 2024-08-12

* Move to the daily note: Add a copy function. The anchor text can be set.
* config: Permanently display Home, End icons on the right side of the document.

## 2024-08-11

* `alt+shift+F1` can fix bidirectional links. For example, if you cut and paste content and the block ID changes, you can use `alt+shift+F1` to repair it.

## 2024-08-09

* Miscellaneous: Copy the document as standard markdown.
* Bottom Backlinks: Ability to manually set the number of columns.
* Bottom Backlinks: Default to collapsing the probability bar.
* Knowledge Base: Ability to delete documents and sub-documents.

## 2024-08-08

* Bidirectional interlinking: Text can be omitted for the link. 

## 2024-08-06

* fastnote: Create file with Ctrl+N, locate the last file with Ctrl+Alt+N. Need to enable from the settings.

## 2024-08-05

* AI Knowledge Base: It has been upgraded to a pure plugin function and no longer requires an additional `EXE` file to act as a forwarder.

## 2024-08-01

* Tomato Timer: Background image has been upgraded to enhance visual appeal.
  
## 2024-07-31

* Bottom Backlinks: Fixed a bug that caused a 5-second delay. Now, bottom backlinks can be loaded instantly.
* Miscellaneous: Locate all backlinks for a block. `Alt+Shift+A`.
* Miscellaneous: Click on the reference count in the upper right corner of the block to locate all backlinks.

## 2024-07-30

* Configurable: When the mouse hovers over, display the blanked-out content in the flashcard.

## 2024-07-26

* Move to Today's Notes: You can choose to move to the bottom of the document.
* Delete the reading point of the current document, shortcut key: `ctrl+F7`



## 2024-07-17

* Bottom Inverse Links: Column Count Adaptive.

## 2024-07-15

* Tomato Timer: After the countdown ends, a video can be randomly selected from a specified file and its sub-files for playback.

## 2024-07-13

* Knowledge Base: A single document can be uploaded separately.

## 2024-07-12

* Knowledge Base Q&A: Ask a question about Siyuan Document, and include a citation of the source in the answer.

## 2024-07-05

* Organize images, videos, and audio in the Assets folder: Fix the bug of converting resource names to lowercase.

## 2024-07-04

* New feature: Paragraph block read-only function `alt+shift+L`, can be enabled in Miscellaneous.
* New feature: Display Memo above content, can be enabled in settings.
* Copy as image: Fix background color.

## 2024-07-03

* Flash Idea Bug Fix: Incorrect image address when inserting images.
* Added feature: Copy multiple blocks as a image.

## 2024-07-02

* The Pomodoro timer can now be placed on the left side of the status bar.

## 2024-07-01

* Flashcard Priority: Allows you to locate the file containing the flashcard within the document tree. Useful for reviewing flashcards. [thx](https://ld246.com/article/1719737172053/comment/1719741383007?r=player#comments)
* Flash Thoughts support the insertion of video and audio.
* Display the time difference between flash thoughts, in minutes.

## 2024-06-27

* AI: Add tab prompt words.
* Content tabulation: alt+shift+t. Use '|' to separate multiple lines into columns for tabulation.

## 2024-06-26

* Add the feature to make the content blurry and unclear. Alt+Shift+D. Need to turn on miscellaneous features.

## 2024-06-25

* Flashcard Priority: Fix bug where adjustments were not triggering a refresh.
* Flashcard Priority: Add options to hide the slider and pause button.

## 2024-06-21

* Bottom-level backlinks: Fix the bug where the number of referenced documents cannot be set to zero.

## 2024-06-20

* Change the color of the settings icon.
* Clean up invalid flashcards: Fix an exception caused by an empty notebook.
* Journal browsing: altW altQ can select a fixed notebook or the current notebook.
* Reading points: Display bookmarks of all notebooks.

## 2024-06-16

* Browsing Diary Feature: Supports selecting a default notebook.
* Log Browsing Alt+W: Cursor Positioning.

## 2024-06-15

* AI: max temperature to two.
* Bottom Backlink: Adjusting the window size for hierarchical concept.

## 2024-06-14

* readingpoint: fix a bug.
* buttom backlink: by default, disabled auto refresh

## 2024-06-13

* readingpoint css style updated
* Cleaning up invalid flashcards for upgrade, not relying on indexes, for security updates.
* The image sorting feature has been upgraded to be compatible with databases and other special scenarios.
* config

## 2024-06-12

* The AI interface can execute quickly with ALT+X.
* i18n

## 2024-06-11

* Before cleaning up the invalid flash cards, check whether the user has set a secret key to automatically create local snapshots.
* Fixed a bug in sorting assets.
* Fixed a bug in document positioning.
* Partial i18n.
* Increased robustness.
* When creating a reference, whether to add Jianpin can be chosen.

## 2024-06-10

* AI: Mobile support added.
* AI: Integration of deepseek, moonshot, and siyuan configurations.
* AI functionality partially reworked. Selection of text followed by `Alt+Shift+S`.
* Configuration section reworked.

## 2024-06-08

* Updated parts of i18n.
* Updated dependency libraries.

## 2024-06-07

* Top toolbar: Added functionality to organize images, videos, and audio under Assets into folders by year and month.
* Not open source.

## 2024-06-06

* Miscellaneous: Added feature to add selected text and its pinyin as aliases in documents. `Ctrl+Shift+Y`.
* Bottom backlinks: Irrelevant content blocks moved to the bottom, especially suitable for mentions.
* Bottom backlinks: Fixed bug where the number of mentions could not be set to 0.
* Top toolbar: Added language switching buttons for various countries. Requires enabling from configuration.

## 2024-06-05

* Bottom backlinks: Progressive cycling of all mentions.
* Bottom backlinks: Added background color during refresh.
* Bottom backlinks: Random display of mentions.

## 2024-06-04

* Pomodoro timer: Pop-up reminder fixed to the top layer after alert.
* Bottom backlinks: Fixed bug where backlinks did not refresh after enabling.

## 2024-06-03

* Status bar Pomodoro timer: Ability to specify a file, content of which is randomly played after timing out.

## 2024-06-02

* Bottom backlinks: Hierarchical concept forest, mobile support added.
* Bottom backlinks: Added hide dailynote button in the concept bar.
* Added transparency to square brackets around references.
* Text-to-reference: Modified logic for fuzzy conversion, no reference created if not found.

## 2024-06-01

* Insert xmind, move document content, clean up document flashcards, delete reading points.
* Optimized long text copying.
* Optimized move to today's dailynote.
* Added gif to readme.

## 2024-05-31

* Thought flashes: Enhanced robustness in avoiding conflicts on mobile.

## 2024-05-30

* Thought flashes: Fixed bug where pinning was not possible.
* Bottom backlinks: Mention section no longer shakes.
* DailyNote tool: Always jumps to the bottom of the file when opening dailynote.
* Thought flashes: Hidden tab.
* Bottom backlinks: Styling adjusted.
* References can be displayed as `[[concept]]`.
* Thought flashes: Configurable display of time and type.

## 2024-05-29

* Bottom backlinks: **Hierarchical concept**: `AA|BB|CC` backlinks display as `AA* AA|BB* AA|BB|CC*` if present.
* Thought flashes: Fixed conflict avoidance bug.
* Thought flashes: Fixed bug where input box showed old content.
* Bottom backlinks: Mobile bug fixed.

## 2024-05-28

* Bottom backlinks: Styling adjustments.
* Photo thought flashes: Configurable fixed write-to file.
* Bottom backlinks: Double-link bar collapsible.

## 2024-05-27

* Photo thought flashes: Bug fixed.
* Inserting single-item lists automatically creates flashcards. `Ctrl+1` and slash functions.
* Photo thought flashes: Desktop version added to dock.
* Ctrl+1: Create single-item lists, list flashcards, and cancel list flashcards.
* Simplified UI functionality removed.
* Photo thought flashes: Input box locked during write-in.

## 2024-05-26

* Fixed bug where mobile version could not open plugins.
* Global positioning of opened documents: Can locate right split window.
* Photo thought flashes: Escape key closes window.
* Photo thought flashes: Shift+Enter for line break.

## 2024-05-25

* Photo thought flashes: Option to choose notebook.
* Photo thought flashes: Persistent toggle for pinning.
* Photo thought flashes: Persistent toggle for continuous input.

## 2024-05-24

* Updated dependencies.
* Photo thought flashes: Added category icons to record list.
* Full mobile support.

## 2024-05-23

* Photo thought flashes: Persistent categorization of records.
* Photo thought flashes: Improved desktop global call-out experience for input box.

## 2024-05-22

* Photo thought flashes: Desktop `Ctrl+q` can call out from outside the application.
* Photo thought flashes: Font size reduced, date removed.
* Photo thought flashes: Default insertion at the top of the diary, can be modified to insert at the bottom.
* Photo thought flashes: Fixed a bug.
* Photo thought flashes: Avoid conflicts caused by simultaneous write-in to dailynote from mobile and desktop.

## 2024-05-21

* New feature — Photo thought flashes: Primarily used on mobile, sends image thoughts to dailynote.
* Photo thought flashes: CSS styling modified.

## 2024-05-20

* Bottom backlinks: Option to disable bottom backlinks for dailynote.
* Task list operations: Can be performed via command palette. Delete, uncheck.

## 2024-05-10

* Text-to-reference: Can use `@` to isolate references from other text. For example, `EE@@ABC@FF` will convert to `EEABCFF` where `ABC` is the reference.
* Text-to-reference: Improved handling of punctuation.
* Bidirectional links: Removed punctuation.

## 2024-05-08

* Bidirectional links: Use `Alt+F1` to select the first block, then use `Alt+F2` at the second block to create reciprocal links.

## 2024-05-07

* Text-to-reference, fuzzy search: Changed to use `@@@`.

## 2024-05-05

* Pomodoro timer, set filename, open file on reminder. Specific strong reminder features. Reminds even when using other software.

## 2024-05-03

* Bottom backlinks: After disabling bottom backlinks, set editor bottom to 200px.
* Removed tag-to-reference feature.
* New feature: Text-to-reference.
* Text-to-reference mode 1: Exact search: Text prefixed with `@@` in paragraph blocks is converted to references.
* Text-to-reference mode 2: Fuzzy search: Text prefixed with `@@@` in paragraph blocks is converted to references. For example, `@@@sword` might be converted to `swordmaster` reference if `swordmaster` exists. If not, create `sword` file and convert to reference.

## 2024-05-02

* Bidirectional links changed to hyperlinks.

## 2024-04-30

* Bottom backlinks: After moving content to a document, references within the document are converted to links.

## 2024-04-29

* Bottom backlinks: Continued prevention of shaking.
* Bottom backlinks: Improved moving functionality, bidirectional links.
* Bottom backlinks: Content made more compact.

## 2024-04-25

* Simplified UI: Document tree: Removed icons before document deletion, more, and new.
* Closed Feishu feedback channel.

## 2024-04-23

* Fixed bug where tag-to-reference did not work.
* Fixed several bugs.
* Bottom backlinks disappearing and not reappearing bug fixed.
* Quick menu removed, some functions moved to new module: `Miscellaneous`, AI part retained, still `Alt+Shift+S`.

## 2024-04-21

* Document tree: Removed icons before document deletion, reducing interference and improving work efficiency.
* Write a book: Improved outline formatting.

## 2024-04-19

* Bottom backlinks: Paths rendered using @html method.

## 2024-04-18

* Write a book: Extracted annotations, converted to dynamic references.

## 2024-04-17

* Write a book: When extracting annotations, links replace references.

## 2024-04-16

* Write a book: Complete the function - copy books.
* Write a book: Add the function to collect annotations.
* Quick menu: Count the number of words, ignoring the content of annotations.
* Improve message reminders.
* Bottom backlinks: Add sequence numbers to bottom backlinks.
* Bottom backlinks: After moving to a file, replace the original position with a `siyuan://` link.
* Bottom backlinks: Add functions to copy embedded blocks to documents and copy dynamic references to documents.

## 2024-04-15

* Quick menu: When copying selected content, ignore annotations.

## 2024-04-14

* Fix BaiduAI.

## 2024-04-12

* Read-only mode can open the quick menu.

## 2024-04-11

* Tag to reference: Add full pinyin and abbreviation attributes to documents. Tag to reference and F3 function in the quick menu share this configuration. Default is off.
* Write a book: Optimize table of contents layout.

## 2024-04-07

* Icon occlusion: Support large images, can be scaled.

## 2024-04-04

* Bottom backlinks: Improve the speed of copying content to documents.

## 2024-04-02

* Write a book: Improve performance. Chapter sorting. Buttons use plain text.
* Fix the bug of image occlusion.

## 2024-04-01

* Add write a book function `ctrl+F3`: Find an empty file, right-click `Initialize Book`.

## 2024-03-30

* Switch annotations: `ctrl+\`, the `Copy Full Text` in the quick menu will ignore content with annotations.
* Bottom backlinks add configuration: Default is to turn off bottom backlinks, need to explicitly open from the menu.

## 2024-03-26

* ctrl+F1 add cancel bookmark 🚩
* ctrl+F2 cancel all bookmarks 🚩 in the current document

## 2024-03-25

* Mark and jump back and forth within the document: ctrl+F1 marks content blocks with small flags, ctrl+F2 deletes all small flag bookmarks in the document.

## 2024-03-23

* Priority bar in review provides positioning function.
* Add small dots to the priority bar for easy estimation of priority.

## 2024-03-22

* Bottom backlinks: Click on the concept in the double link bar to filter the backlink panel. Click (single select), ctrl click (and), shift click (exclude), alt click (or).

## 2024-03-20

* Content reminder bug.

## 2024-03-19

* Bottom backlinks: The mention count can be set to 0.
* Right-click menu: Restore all postponed flashcards. Automatically maintain postponed flashcard bookmarks.
* Quick menu adds insert single item list function.
* Slash: Add insert single item list function. Filter: ["item", "single", "list", "list", "single item", "dxlb", "lb"] Filter: ["comment", "zsdxlb", "list", "zs"]
* Bottom backlinks: After moving content, do not leave blank lines.

## 2024-03-18

* Modify the icon of image occlusion.

## 2024-03-17

* Quick menu: If the paragraph block starts with `;;`, it will be treated as an annotation. The `Copy Current Document` function in the quick menu will ignore annotations.
* Optimize the performance of the reading point directory.
* Flashcard priority: F6, can batch set increments for flashcards.

## 2024-03-15

* Daily note does not display bottom backlinks.
* Fix the bug of long documents not displaying bottom backlinks.

## 2024-03-14

* Solve AI error code: the length of messages must be an odd number.

## 2024-03-13

* Modify priority during review: `ctrl+;`
* Optimize the interaction of modifying priority.
* Quick menu: New xmind file at the cursor position.
* Documents in the document flow do not enable bottom backlinks. [*](https://ld246.com/article/1710291740876)

## 2024-03-12

* Alt+Shift+S: Directly send the selected content to the AI.
* Provide shortcut keys to jump to the bookmark location of the current document.

## 2024-03-10

* Top toolbar: Add document positioning function. Automatically open the document tree, fold documents, and position documents. Only the path of the target document is expanded, and other document paths are folded.
* Bottom backlinks: No more shaking.

## 2024-03-09

* Bidirectional link optimization.

## 2024-03-06

* Reading can handle progressive reading slices.
* Reading points inherit the old review status.

## 2024-03-05

* Improve document merging function.
* Quick menu: Add strikethrough effect.

## 2024-03-04

* Flashcard review interface: Skip the current card before seeing the answer `ctrl+8`
* Flashcard review interface: Delete the current card before seeing the answer `ctrl+9`
* Add the function to delete reading points in the quick menu.

## 2024-03-03

* Flashcard review interface: Add postponement function

## 2024-03-02

* Add a little CSS effect to the reading points.

## 2024-03-01

* Merge documents change copy to move, improve speed. Can also retain flashcard status.
* Merge document function into quick menu.
* Fix a bug.

## 2024-02-29

* Flashcard review UI: After deleting a flashcard, automatically click "skip"

## 2024-02-28

* Reading points upgraded: In addition to retaining the previous bookmark function, flashcards are also added, utilizing the planning ability of flashcards, and also saving which files have been viewed at that time.
* Reading points: Add right-click function `Set Reading Point (no environment)`, add reading, only include information of the current document. `Ctrl+7`
* Fix flashcard postponement function.

## 2024-02-27

* Quick menu: Add function to jump to the bookmark location of the current document.
* Quick menu: Copy the current document as standard markdown to the clipboard.
* Speed up the cleaning of invalid flashcards.
* Flashcard priority: Postponing flashcards also modifies the expiration time of flashcards. The expiration time of replying to flashcards is changed to now.
* Quick menu: AI function, support selected part of text in a block, support selecting one or multiple blocks.
* Bottom backlinks: In the right-click menu of the document, you can enable and disable bottom backlinks for this document.

## 2024-02-26

* Optimize static backlinks.

## 2024-02-25

* Modify the style of static backlinks.

## 2024-02-23

* Flashcard priority: Add support for document flashcards

## 2024-02-22

* Static backlinks: Exclude self-references within the current document.
* Speed up moving to today's notes and other optimizations.
* Static backlinks: Delete static backlinks function.
* Batch modify attributes.

## 2024-02-21

* Some right-click functions moved to: Quick menu.
* Quick menu adds: Static backlinks.
* Static backlinks: Can be manually refreshed.

## 2024-02-20

* Add quick menu function
* Support Wenxin Yiyan 4.0

## 2024-02-18

* Bottom backlinks: Modify breadcrumb style.

## 2024-02-17

* List tool: Add new function, continuous enter no longer breaks the list block. (Need to be enabled in configuration) (To break the list from the middle: shift+tab)

## 2024-02-15

* Added feature: Delete checked tasks within a document.

## 2024-02-14

* Optimized modification speed: Prioritization and postponement of large sets of flashcards.

## 2024-02-07

* Added menu icon.
* Tomato timer: Notify remaining time after canceling the countdown.
* Priority adjustment for consecutive retries and simplicity, configurable from settings.

## 2024-02-06

* Fixed nesting bug in bottom backlinks.
* Reduced jitter in bottom backlinks.
* Added background to status bar tomato timer option to enhance focus.
* Option to set default mention count in bottom backlinks.
* Background added to status bar tomato timer option, supports light and dark modes.

## 2024-02-05

* Editable and draggable bottom backlinks.
* Postponed flashcards added to bookmarks.
* Option to postpone flashcards from block icon menu.
* Ability to postpone unfinished flashcards by n days.
* Ignored postponed flashcards in reading points.

## 2024-02-04

* Flashcards priority: No longer display postponed flashcards.

## 2024-02-03

* Bottom backlinks sorted in reverse chronological order by update time.
* Timed reminders: Content blocks reminded are bookmarked instead of tagged. Bookmarks auto-deleted after reminder.
* Tomato timer resumes counting after restart.

## 2024-02-02

* Flashcard postponement set by number of days. Default is two days. Supports fractions like 0.0001 days, about 10 seconds.
* Option to configure new references created from tags to auto-generate flashcards.

## 2024-01-31

* Clicking flashcard priority button in embedded blocks no longer triggers pop-up in embedded blocks.
* Added shortcut for refreshing virtual references.
* Added tool to cancel all flashcards within the current document.
* Flashcard priority: Low-priority flashcards have a chance to review early.
* Added postponement feature to flashcard priority.

## 2024-01-30

* Updated dependency libraries.

## 2024-01-29

* Bottom backlinks: Color-coded distinction between links to this document and other documents. Option to hide links to this document. Copy and move external document links to the bottom of this document.
* Fixed inaccurate reference count in bottom backlinks.

## 2024-01-28

* Adjusted tag-to-reference feature: Excludes tags with suffixes `.html` `.xhtml`.
* Adjusted tag-to-reference feature: Excludes tags with prefixes `@` `tag`.

## 2024-01-27

* Adjusted position of flashcard priority button.

## 2024-01-26

* Added copy ID feature for regular reminders.
* Added right-click menu to uncheck all tasks in the current document.
* Direct input of new priority when clicking priority on flashcard top right.

## 2024-01-25

* Improved refresh virtual references function.
* Reading view added to right-click menu, mobile support for generating reading point directory files. Requires manual opening of files to view.
* Mobile server support.
* Increased randomness in flashcard priority.

## 2024-01-24

* Added topbar icon for refreshing virtual references.

## 2024-01-23

* Updated readme.
* Excluded "*" and "@" in bottom backlinks conceptual area.

## 2024-01-22

* Bottom backlinks: Adjusted layout to reduce distracting elements.
* Excluded daily notes like `2024-01-22@第4周-星期一` in bottom backlinks conceptual area.

## 2024-01-21

* Hierarchical references: Maximize prevention of duplicate reference creation.
* Fixed bugs, added exit button for iPad image occlusion, oversized dialog boxes, and inability to exit.

## 2024-01-20

* Flashcard priority changed to input from dialog box.
* Added buttons below flashcards for priority adjustment.

## 2024-01-19

* Modified cleanup flashcard notification time.
* Optimized daily note traversal function.

## 2024-01-18

* Updated dependency libraries.
* Daily note switching supports logs with `week` in the name, e.g., `/daily note/{{now | date "2006"}}/{{now | date "2006-01"}}/{{now | date "2006-01-02"}}-{{now | ISOWeek}}`.

## 2024-01-16

* Flashcard priority feature, significantly accelerated.

## 2024-01-14

* Added feature: Tag-to-reference, retains hierarchical relationship of tags.
* Tag-to-reference, improved speed and smoothness.

## 2024-01-13

* Redesigned list card creation, performance improved.

## 2024-01-12

* Excluded daily notes like `2024-01-22` in bottom backlinks conceptual area.

## 2024-01-11

* Priority currently uses partial sorting method temporarily.

## 2024-01-10

* Added flashcard priority feature.
* Fixed bug where flashcard priority not enabled prevented review.

## 2024-01-09

* Updated readme images.
* Added document merge feature, including reference transfer, content copy, and attribute copy.

## 2024-01-07

* Fixed issue where delete flashcard button disappeared during review.

## 2024-01-05

* Corrected typos in help for batch deleting content blocks.

## 2024-01-04

* Added working prompts for flashcard cleanup feature.
* Significantly increased speed of batch copying.
* Upgraded dependency libraries.

## 2024-01-03

* Enhanced usability for previous and next logs.

## 2024-01-02

* Optimized performance of previous and next daily notes.
* Hotkeys no longer trigger outside the application. If there are hotkey conflicts, set them manually.
* Added hotkeys for previous and next logs: alt+q, alt+w.
* Enhanced usability for previous and next logs.

## 2024-01-01

* Added topbar button to open flashcards.
* Added topbar buttons to open previous and next daily notes.
* Topbar icons not displayed on mobile.

## 2023-12-31

* Removed redundant icons.

## 2023-12-30

* Moved blocks to daily note: Provided default notebook configuration.

## 2023-12-28

* Image occlusion: Occlusion marked as 1~9, A~Z, followed by #.

## 2023-12-27

* Image occlusion: Supports image scaling.
* Image occlusion: Supports mouse drag to draw rectangles.

## 2023-12-26

* Bottom backlinks: Ignored cards under books in progressive learning plugin.
* Tomato timer: Added button to view remaining time.

## 2023-12-25

* Bottom backlinks: Modified input box length.

## 2023-12-24

* Bidirectional links: Fixed bug where document names could not be read during flashcard review.

## 2023-12-21

* Flashcard tool: Optimized appearance of delete card button.
* Flashcard tool: Added hotkey, no confirmation box, direct card deletion.

## 2023-12-20

* Flashcard tool: Added delete flashcard button during review.
* Flashcard tool: Clarified delete card button prompt to eliminate ambiguity.

## 2023-12-19

* Bottom backlinks: Added separator.
* Added new feature, move content blocks to daily note.
* Bottom backlinks: Added separator again.

## 2023-12-18

* Bottom backlinks: Shortened `mention` cache time.
* Batch copy function provided robustness.
* Bottom backlinks not displayed during flash

## 2023-12-17

* Bottom Backlinks: Add a backlinks area outside the editor, which can be enabled from plugin settings.
* Bottom Backlinks: Can only enable either internal or external backlinks in the configuration.
* Bottom Backlinks: Retain one mode for easier maintenance.
* Bottom Backlinks: Adjust the icon for automatic refresh.

## 2023-12-16

* Bottom Backlinks: Attach to the last line.
* Enhance the robustness of bottom backlinks.

## 2023-12-15

* Number of mentions in bottom backlinks, independent between documents.
* Search box in bottom backlinks supports complex syntax.

## 2023-12-14

* Optimize bottom backlinks experience, improve smoothness, reduce lag and flickering.
* Fix issue where bottom backlinks appeared in the middle of long documents.
* Display progress of expanding mentions.
* Bottom Backlinks: Add exclusion feature to quickly exclude unwanted backlinks.

## 2023-12-13

* Bottom Backlinks area: Add mention toggle.
* Backlink query box provides paste and clear buttons.
* Controllable number of mentions.

## 2023-12-12

* Bottom backlinks fully support search.
* `Bidirectional Links`: If inserting a link at the beginning of a document, insert `specific content` instead of `document name`.
* `Bidirectional Links`: Fix bug where links with appearance might generate duplicate links.
* `Bidirectional Links`: Add IAL to links inserted at the beginning of files to avoid repeated insertion of links.

## 2023-12-11

* Fix issue where backlinks appeared in the middle of files.
* After triggering `Bidirectional Links` feature, cursor is positioned at the end of the block. [*](https://github.com/IAliceBobI/sy-tomato-plugin/issues/6)
* Fix bug where `Bidirectional Links` could not recognize links with appearance. [*](https://github.com/IAliceBobI/sy-tomato-plugin/issues/7)

## 2023-12-10

* Bottom backlinks no longer insert js embed blocks or modify document content. Instead, they are displayed directly at the bottom of the page.

## 2023-12-09

* Modify the style of the backlink search box.
* Concurrent reading of backlinks.
* Clear cache.

## 2023-12-08

* [Add switch to control whether to insert a level 1 heading when inserting backlinks, to quickly locate backlinks in the outline. Default is off.](https://github.com/IAliceBobI/sy-tomato-plugin/issues/5)
* [Fix anomalies after refreshing and editing js embed blocks.](https://github.com/IAliceBobI/sy-tomato-plugin/issues/4)

## 2023-12-07

* Beautify the reference count of backlinks.
* Use openTab for some backlink searches, replacing the original "siyuan://"
* More thoroughly extract related backlinks (concepts) for searching.
* Insert backlinks and mentions while inserting a level 1 heading for outline positioning.
* Do not receive protyle destroy events.
* Destroy Svelte when closing Dialog.
* Sync right-click menu functions to block icon menu to support App version.
* Automatically insert bottom backlinks. Mentions require manual insertion.

## 2023-12-06

* Adjust Dialog

## 2023-12-05

* Refactor configuration code.
* [Tomato clock supports custom durations.](https://github.com/IAliceBobI/sy-tomato-plugin/issues/3)
* [Fix bugs](https://ld246.com/article/1701445627641/comment/1701761268877?r=player#comments)

## 2023-12-04

* Redesign bottom backlinks area.
* [Split backlinks and mentions into two independent menus.](https://github.com/IAliceBobI/sy-tomato-plugin/issues/2)

## 2023-12-03

* Add a bottom backlinks area inspired by `logseq`.

## 2023-12-02

* Refactor

## 2023-12-01

* Configurable features whether to enable.
* Add a minimalist backlinks panel.

## 2023-11-29

* Code refactoring.
* Reminder part rewritten in svelte.
* Check block existence before batch moving, deleting, and copying to avoid rebuilding indexes.

## 2023-11-27

* Bidirectional Links: Change the dynamic anchor at the cursor to static and pop up a reminder.

## 2023-11-25

* Support copying content with modified appearance.
* Bidirectional Links: Add reverse links to linked content.

## 2023-11-22

* Fix bug where invalid flashcard deletion mistakenly deleted document flashcards.

## 2023-11-18

* Add content menu

## 2023-11-16

* Wait for 4 seconds after long content operations for more reliable indexing.

## 2023-11-15

* Library refactored to maintain code consistency, necessitating a version update.
* Update README.
* After setting timed reminders, automatically add time TAG.

## 2023-11-14

* When copying long text, the copy should remove flashcard properties.

## 2023-11-13

* Improve the smoothness of operations related to `reading points`.

## 2023-11-12

* If indexing is problematic, flashcard creation will fail. Failure prompts have been added.
* Also pushed to Gitee.

## 2023-11-10

* Improve operational smoothness
* Fix bug in copying long content

## 2023-11-08

* First version

</details>