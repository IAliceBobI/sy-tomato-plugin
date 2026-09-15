---
name: tomato-plugin-skills
description: 思源番茄插件（sy-tomato-plugin）AI 工具使用文档：pomodoro 专注统计、search 知识库检索两工具的参数契约、常见坑与配置指引。
---

# 番茄插件 AI 工具技能文档

思源笔记番茄插件向 AI 提供两个工具（外加本 skills 工具自身），全部**只读免费**。首次使用前建议通读本文档，可显著减少试错轮次。

## 通用契约

- 所有工具返回统一结构 `{success, data, error}`：`success=true` 看 `data`；`success=false` 时 `error` 自带修复指引（缺参数/缺配置/非法 id 都会告诉你怎么改），**勿凭空调用重试，先读 error**。
- 思源 id 形态=14 位时间戳+7 位字符（如 `20230101120000-abcdefg`），**不是名称**。笔记本 id 可用 `/api/notebook/lsNotebooks` 查；文档/块 id 可从块右键菜单「复制块 ID」或 SQL `select * from blocks` 获得。
- 工具在两个门脸行为一致：外部 Agent 走内核 `/mcp`（工具名带 `plugin__sy_tomato_plugin__` 前缀）；插件内部面板直调。
- 外部知识库问答（智谱 BigModel 通道）不在此工具面内：它是插件「知识库」域的面板能力（dock 面板问答+文档树右键同步），配置在插件设置→AI 助手→知识库通道。

## pomodoro：专注与闪卡统计

单工具+action 枚举，看「过去发生了什么」。

- `get_focuses(range)`：专注统计。range 支持 `'today'`（默认）/`'week'`（近 7 天）/`'month'`（近 30 天）/单日 `'YYYY-MM-DD'`/区间 `'YYYY-MM-DD..YYYY-MM-DD'`。返回按日番茄数/分钟数+汇总+绑定文档的累计专注榜。
  - 数据口径：只统计**自然到点完成**的工作段（中途中断不计）；逐段明细（何时~何时）不存在，只有按日聚合。
  - 文档专注榜来自文档属性 `custom-tomato-focus`（值=累计分钟），可用 SQL 验证：`select * from attributes where name='custom-tomato-focus'`。
- `get_flashcards()`：闪卡归属统计。全库卡块数+按卡组计数+按宿主文档计数+渐进摘抄书的归书聚合。无参数。
  - 到期复习数属内核 riff 调度库（3.9.0 v2 重写在途），本工具不暴露。
- `echo(message)`：通道自检，回显文本。排查「工具到底通没通」时先用它。

## search：知识库内容块检索

按自然语言语义或关键词找内容块，适合作为问答/总结的上下文来源。

- 参数：`query`（必填，检索词）、`engine`（`'auto'` 默认/`'semantic'`/`'fts'`）、`box`（笔记本 id）、`path`（文档 id 或文档树 id 路径）、`limit`（每页块数，默认 8 上限 20）、`page`（页码，默认 1）。
- **id 陷阱（最常踩）**：`box`/`path` 只认思源 id 形态。人类可读标题路径（如 `/读书笔记/某书`）会被内核**静默整条丢弃连 box 一起**，伪装成全库搜索——本工具已做预校验拦截并报错，看到相关 error 换成 id 即可。
- `path` 过滤必须**伴 `box`**（思源检索通道的 paths=boxID/docID 形态）。
- `engine='auto'`：语义可用走语义；语义**空结果自动回退关键词**（嵌入服务失败与真无命中返回面不可区分）；`engine='semantic'` 强制语义，未配嵌入模型会报错并给配置指引（此时改用 `'fts'` 或先看下方配置节）。
- 返回紧凑块结构+`siyuan://` 链接（转述给用户可点击溯源）；`matchedBlockCount` 报总命中数，**勿深翻页**——深翻成本线性涨，改用更精确的 query 或 box/path 收窄更有效。

## 配置指引（用户侧）

| 配置 | 位置 | 影响的工具 |
|---|---|---|
| 嵌入模型（语义检索） | 思源设置→AI→嵌入 | search 的 semantic/auto 通道（未配置自动降级关键词，无需用户操作） |

配置是用户（人）的操作，AI 能做的是把指引转述给用户；除嵌入模型外的插件配置不在 AI 可写面内。
