[中文](https://github.com/IAliceBobI/sy-tomato-plugin/blob/main/README_zh_CN.md)

# Tomato Toolbox

## Pomodoro Timer

### The first tool is the status bar Pomodoro timer:

![](./assets/statustomato.png)

* **0**: Cancel countdown
* **5**: Set timer for five minutes
* ...
* **25**: Set timer for twenty-five minutes

![](./assets/tomatoTimeup.png)

## Content Reminder

*Next is the content block reminder tool.*

### First, click on the content you want to set a reminder for, then press `Shift+Alt+P` to open the `Command Palette`.

> The plugin can only identify which content block to process when clicked with a mouse. It cannot detect cursor movement using the keyboard.

![Alt text](./assets/cmdEntry.png)

### Select the command "Set a reminder date for the current content block". You can also use the shortcut `Ctrl+3`.
![Alt text](./assets/cmd.png)

### Set the time
![Alt text](./assets/scheduleSetTime.png)

### Reminder

![Alt text](./assets/remind.png)

## Reading Point

*A reading point is the last position you read in a document. We store it in a `bookmark` and automatically remove other `bookmarks` within the current file. This keeps only one `bookmark` in this file.*

### First, click on the `content block` you want to set as the reading point. Then, you can either select "Set reading point" from the `Command Palette` by pressing `Shift+Alt+P` or use the shortcut `Ctrl+2`.

> The plugin can only identify which content block to process when clicked with a mouse. It cannot detect cursor movement using the keyboard.

![Alt text](./assets/cmd.png)

### To view the `bookmark`, you can directly view the `bookmark panel`. Alternatively, you can click on the `Reading Point` (ctrl+4) icon in the top right corner to view more detailed information.

![Alt text](./assets/bookmark.png)

> **Note:** The grouping in the `Reading Point` icon is different from the bookmark panel.

## Cleaning Invalid Flashcards

*If the content containing a flashcard is deleted, the invalid flashcard remains on the disk. We can delete it.*

### Open the `Command Palette` and select "Clean all invalid flashcards".

![Alt text](./assets/cmd.png)

> **Note:** Do not use this feature while the index is being rebuilt. Creating an index during the rebuild.

> **Note:** If you use the flashcards without opening all the notebooks and then close them, even valid flashcards will be considered invalid. Therefore, make sure to open all the notebooks before using them.

> **Note:** Make sure to backup before using!

## Operations on Long Contents

*Copying, moving, and deleting operations on long contents can be frustrating! Here, I use a simple method to handle such operations!*

> If you notice any missing content after performing an operation, please refresh the page with F5. This can happen if the operation was performed too quickly and the page didn't have enough time to update!

### Move Operation

*Assume there are `Document 1` and `Document 2`. In `Document 1`, wrap the content to be moved with two lines `aacc1` and `aacc2`. Then, insert `aacc3` at a certain position in `Document 2`. Finally, open the `Command Palette` and select `Batch Move a Large Amount of Continuous Content`.*

> **Note:** `Document 1` and `Document 2` can be the same document, i.e., moving or copying within the same document.

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

Previously, creating flashcards for the entire list was a bit cumbersome as you had to select the entire list. If you could create flashcards by simply placing the cursor anywhere within the list, it would be much more convenient. That's where the "Quick List Flashcard" feature comes in.

You can place the cursor on `a3` or any other location like `a2`, `a1`, `a0`, and then press `Ctrl+1`. Alternatively, you can open the `Command Palette` and select `Add List Flashcard`.

## Welcome to communication

QQ Group: 263961482
