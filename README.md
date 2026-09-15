# Tomato Toolbox

The all-in-one productivity toolbox for SiYuan — one plugin slot for a whole note-taking workflow, fully open source.

## Highlights

- 🧰 **All-in-one toolbox** — 40+ features grouped by scenario: focus, reading, review, capture, references, visualization, AI. One install replaces a row of plugins
- 🍅 **Status-bar Pomodoro** — one click to start; focus/break cycles rotate automatically, with configurable backgrounds and sounds
- 🤖 **AI power** — sync notes into a cloud knowledge base: Q&A grounded in your own notes with sources, and any MCP-connected AI tool can search it; annotation discussions can be saved as content blocks
- 📖 **Reading input loop** — reading points remember where you stopped, annotations mark as you read, and what you read turns into review cards in one click
- 🃏 **Flashcard power-ups** — priority ordering, image cloze, delete-while-reviewing, one-click cleanup of broken cards

## Features

### 🍅 Focus & Time

- **Status-bar Pomodoro** — click to start; focus and break rotate automatically. Custom durations, background images and sounds (bells, wooden fish, your own uploads)
- **Recurring reminders** — periodic tasks that ping you on time

### 📖 Reading & Annotations

- **Reading points** — mark where you stopped, resume right there; jump back via float ball, or turn what you read into review cards
- **Annotations** — underline / highlighter / lace-border mark styles with four panel skins; AI discussions under an annotation can be saved as content blocks

### 🃏 Flashcards & Review

- **Flashcard priority** — important cards come first; streaks adjust priority automatically
- **Image cloze** — blank out parts of an image
- **Delete cards during review** — drop junk cards right in the review UI
- **Clean up broken cards** — remove invalid flashcards in one click

### ⚡ Capture & Quick Notes

- **Photo flash notes** — snap a photo, capture the thought instantly
- **Quick notes** — jot in a mini window outside the app, drafts saved automatically
- **Move to today's notes** — move any block into today's daily note; copy fragments straight from a text selection

### 🔗 References & Sync

- **Sync blocks** — edit once, sync everywhere
- **Bidirectional links** — two blocks referencing each other, jump both ways
- **Text to citation** — turn selected text into a reference block in place
- **Bottom backlinks** — a persistent backlink panel at the bottom of the editor
- **Database backlinks** — backlinks inside database views

### 🧭 Visualization

- **Mind guides** — turn an outline into a mind guide in one click, with selection-based linking
- **Block graphs** — visualize reference relations between blocks
- **Block editor** — open any block in its own focused editor

### 🗂 Doc Organization & Export

- **Workspace export** — export your workspace as Markdown, with allow/deny lists and automatic incremental runs
- **Document merging (Pro)** — merge multiple documents in one click
- **DailyNote tools** — navigate between journals, review past days, move content in bulk

### 🤖 AI

- **AI knowledge-base Q&A** — ask questions over your own notes, streaming answers with sources
- **Knowledge-base sync** — sync chosen docs (subdocs included) to Zhipu BigModel: per-doc whitelist, subtree exclusion, on-tree status marks; AI tools connected via SiYuan MCP can search it too

> Plus a row of editor mini-tools: enhanced folding, multi-select, list tools, copy-as-image, document aliases… right in the context menu, no extra plugin slot needed.

## Free vs Pro

One rule of thumb: **everything you need to read, annotate, memorize and stay focused is free — the whole core loop, unlimited**. Pro adds what Pro is good at: automation that spares you repetitive clicks, bulk actions, and making the workspace yours.

| Domain | Free | Pro adds |
|---|---|---|
| 🍅 Pomodoro | Timer, focus/break rotation, custom durations & sounds | Custom background image with adjustable opacity — set up the focus screen your way |
| 📖 Annotations | All mark styles, panel, all four panel skins, light AI chat under annotations; click an annotation in the panel to jump to its source | Invite AI roles into the discussion; compress a whole discussion into a note; collect annotations recursively incl. sub-documents — gather a whole book's highlights in one pass |
| 🃏 Flashcards | Create, review, priorities, per-document tab review, image cloze, broken-card cleanup | When today's pile is too big, spread the remaining cards over the coming hours (intervals configurable); priority bars auto-hide during review |
| ⚡ Capture | Photo notes, quick notes, reading points | Conflict guard for photo notes across synced devices; delete the source selection once the note is created; flip to a document's backside draft and back with one keystroke |
| 🔗 References | Sync blocks, bidirectional links, text-to-citation, bottom & database backlinks; invalid-ref check & bulk cleanup; click a ref-count to open its backlinks; jump-to-bottom button on the backlink panel; list conversion that keeps refs | Turn what you type into a citation with a space; pinyin aliases so two or three letters cite the right doc; render refs as tags; embed bilinks inline; sync-block menu with origin links |
| 🧭 Visualization | Block graph (incl. click-to-jump), block editor, mind guides | Mind-wire line styles & relation colors — even dense maps stay readable at a glance |
| 🗂 Export | Workspace export on demand, DailyNote tools; always jump to bottom when opening today's note | Scheduled incremental export with automatic cleanup — backup takes care of itself; merge documents into one file |
| 🎈 Floating ball | Jump to docs & keymaps from the ball | Extended list capacity — every doc you keep handy fits |
| 🤖 AI Q&A | Free, fully | — |

**Pro is ¥72, one-time.** Purchase & activation: plugin settings → order → paste the redemption code back in settings — it binds to your SiYuan account automatically and recovers on any device where you log in with the same account.

## Getting Started

1. After installing, look at the SiYuan status bar — click the tomato icon to start your first Pomodoro
2. Open plugin settings (SiYuan Settings → Plugins → Tomato Toolbox) and tune each domain to your liking
3. No need to memorize the rest: search "Tomato" in the command palette, or browse the docs by use case

## Docs & Community

- 📖 **[Documentation](https://my.feishu.cn/docx/IWPcd438yoL3C6xHC0xcOXDKnmh?from=from_copylink)** (Chinese, with GIFs & videos for every feature)
- 🤖 **[Connect AI to SiYuan (MCP)](https://my.feishu.cn/docx/BkRldeWJ7o3T4ExE2fdciZbgnRV)** (Chinese) — let AI query focus stats and search your notes; three-step setup for ZCode / Trae / CodeBuddy / Qoder
- 🙏 [Acknowledgments](https://my.feishu.cn/docx/FQ7udC3jeorfDYxI39ict2UNn2g?from=from_copylink)
- 💬 [QQ Group](https://pd.qq.com/s/r3jz0g16) (Chinese) — feedback and feature requests
- 💬 [Feishu Group](https://applink.feishu.cn/client/chat/chatter/add_by_link?link_token=f08gff0c-d6b0-4a0d-8323-c8a0553e4fff&qr_code=true) (Chinese) — feedback and feature requests
- 📱 Scan to join: ![Group QR codes (left: QQ Channel, right: Feishu)](group-qr.png)
- 🔓 [Open-source repo](https://github.com/IAliceBobI/sy-tomato-plugin) — what you see is what's compiled: built by GitHub Actions

📊 SiYuan Marketplace: 141,000+ downloads

## Support the Author

<div>
<img src="https://player-pubpic.oss-cn-beijing.aliyuncs.com/static/wx1.png" alt="WeChat" width="300" />
</div>
<br>
<div>
<img src="https://player-pubpic.oss-cn-beijing.aliyuncs.com/static/zfb1.jpg" alt="Alipay" width="300" />
</div>
