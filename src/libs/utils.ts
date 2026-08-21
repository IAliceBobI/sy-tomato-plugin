// utils.ts —— 各领域工具模块的 re-export 桶（2026-08 重构，原 3231 行大杂烩按域拆分）。
// 所有历史导入路径（含 progressive 插件的跨插件相对导入）保持不变。
// 新代码建议直接从具体领域模块导入：
//   globals.ts    —— 思源内核全局对象（Siyuan/NewLute/NewNodeID）、插件实例取用、node fs
//   timeUtil.ts   —— 时间/日期
//   strUtils.ts   —— 字符串/正则/markdown 文本
//   miscUtils.ts  —— 数组/对象/流程控制等泛型小工具
//   syncHash.ts   —— 同步块内容哈希（cyrb53/normalizeForHash）
//   domUtils.ts   —— 纯 DOM/protyle/编辑器工具
//   blockUtils.ts —— 块 DOM 操作（引用/链接/cleanDiv 家族）
//   siyuanApi.ts  —— 思源内核 HTTP API 封装（siyuan 大对象 + siyuanCache）
//   fileScanUtils.ts —— 文件全量扫描/无效数据库清理/插件配置健康（tryFixCfg）
//   notebookUtils.ts —— 笔记本取用/文档树批量导出/块卡日志小工具
export * from "./globals";
export * from "./timeUtil";
export * from "./strUtils";
export * from "./miscUtils";
export * from "./syncHash";
export * from "./domUtils";
export * from "./blockUtils";
export * from "./siyuanApi";
export * from "./fileScanUtils";
export * from "./notebookUtils";
