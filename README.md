[SRC/源码](https://github.com/IAliceBobI/sy-plugins/tree/main/sy-tomato-plugin)

[中文](https://github.com/IAliceBobI/sy-plugins/blob/main/sy-tomato-plugin/README_zh_CN.md)

# Tomato Toolbox

## Pomodoro Timer

*Status Bar Pomodoro Timer*

![](./assets/statustomato.png)

* **0**: Cancel countdown
* **5**: Set timer for five minutes
* ...
* **25**: Set timer for twenty-five minutes

![](./assets/tomatoTimeup.png)

## Content Reminder

*Set a reminder date for a content block!*

**Position the cursor to select the "content block".**

![Alt text](./assets/cmdEntry.png)

**using the content menu**

![Alt text](assets/contentMenu.png)

**Set Time**

![Alt text](./assets/scheduleSetTime.png)

*Setting the time will automatically add a time tag.*

![Alt text](./assets/aftersettime.png)

*We can see the scheduled reminders in the tag panel.*

![Alt text](./assets/seefromtagpanel.png)

**Reminding**

![Alt text](./assets/remind.png)

**Delete Time Tag**

*Currently, users need to take care of deleting the time tags themselves!*

## Reading Point

*A reading point refers to the last position you read in a document. We save it as a `bookmark` and automatically remove any other `bookmarks` within the current file. This ensures that there is only one `bookmark` within the document.*

**Position the cursor to select the "content block", then using the content menu**

![Alt text](assets/contentMenu.png)

**To view the `bookmark`, you can directly view the `bookmark panel`. Alternatively, you can click on the `Reading Point` (ctrl+4) icon in the top right corner to view more detailed information.**

![Alt text](./assets/bookmark.png)

> **Note:** The grouping in the `Reading Point` icon is different from the bookmark panel.

## Cleaning Invalid Flashcards

*If the content containing a flashcard is deleted, the invalid flashcard remains on the disk. We can delete it.*

**Open the `Command Palette` and select "Clean all invalid flashcards".**

![Alt text](./assets/cmd.png)

> **Note:** Do not use this feature while the index is being rebuilt. The index being rebuilt is not yet complete, and using the feature that relies on the index can lead to misleading results and accidental deletion of flashcards.

> **Note:** If you use the flashcards without opening all the notebooks and then close them, even the valid flashcards will be considered invalid. So make sure to open all the notebooks when using them.

> **Note:** Make sure to backup before using!

## Operations on Long Contents

*Copying, moving, and deleting operations on long contents can be frustrating! Here, I use a simple method to handle such operations!*

> After performing the operation, if you find missing content, please refresh the page by pressing F5. It simply means that you performed the operation too quickly and the page didn't have time to update!

### Move Operation

*Assume there are `Document 1` and `Document 2`. In `Document 1`, wrap the content to be moved with two lines `aacc1` and `aacc2`. Then, insert `aacc3` at a certain position in `Document 2`. Finally, open the `Command Palette` and select `Batch Move a Large Amount of Continuous Content`.*

**This move operation will transfer the 'flashcards' together without changing the review status of the 'flashcards'. However, a simple 'ctrl+c, v' will make the involved 'flashcards' invalid.**

> **Note:** `Document 1` and `Document 2` can be the same document, i.e., moving or copying within the same document.

> **Note:** `aacc1`, `aacc2`, `aacc3` should not have spaces before or after them, otherwise the plugin won't be able to find them.

```
《Document 1》

In the twilight glow,
I stroll along the path in the woods.
The fallen leaves rustle beneath my feet,
and the gentle breeze caresses my face.

aacc1

A glimmer of light shines through the branches and leaves,
like memories flickering in time.
I silently listen to the breath of nature,
feeling life continue in this tranquility.

...A lot of content here...

This is a conversation with nature,
I listen to their voices,
nourishing my soul in this peace,
dancing with life's melody in harmony with nature.

aacc2

In this noisy world,
I have found my own sanctuary.
In the embrace of nature,
I have discovered the power of tranquility and freedom.
```

```
《Document 2》

...
aacc3
...

```

![Alt text](./assets/cmd.png)

### Copy Operation

*Similar to the move operation, but select the copy command.*

### Delete Operation

*Similar to the move operation, but select the delete command and no need to write `aacc3`.*

## Quickly Create Flashcards from a List

For a given list:

* a0
* a1
  * a2
    * a3

Previously, if you wanted to make a card for the entire list, it was cumbersome as you needed to select the entire list. If you only need the cursor to be at any position within the list to make a card, it would be more convenient. Thus, the "List Quick Card Creation" feature was introduced.

You can place the cursor on `a3` or any other location like `a2`, `a1`, `a0`, and then press `Ctrl+1`. Alternatively, you can open the `Command Palette` and select `Add List Flashcard`.

**or using the content menu**

![Alt text](assets/contentMenu.png)

# Bug Feedback and Suggestions

QQ Group: 263961482

[Alternatively, submit issues on GitHub](https://github.com/IAliceBobI/sy-tomato-plugin/issues)

[Or, you can submit your question on the official forum.](https://ld246.com/tag/siyuan)

# Changelog

## 2023-11-18

* add content menu

## 2023-11-16

* Wait for 4 seconds after performing a long content operation for added reliability.

## 2023-11-15

* The library has been refactored, and in order to keep our code consistent, we can only update the version.
* Update the README.
* After setting a scheduled reminder, it will automatically add a time tag.

## 2023-11-14

* When copying long texts, the copy should remove flashcard attributes.

## 2023-11-13

* Improve the smoothness of operations related to "reading points".

## 2023-11-12

* If there is an issue with the index, the flashcard creation will fail. A failure prompt has already been added.
* Push to Gitee.

## 2023-11-10

* Enhance operational fluency
* Fixed the bug related to copying long content.

## 2023-11-08

* The first release.

