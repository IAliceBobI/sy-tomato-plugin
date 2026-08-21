// docUtils.ts —— 文档域工具模块的 re-export 桶（2026-08 重构，原 1000 行大杂烩按域拆分）。
// 所有历史导入路径（含 progressive 插件的跨插件相对导入）保持不变。
// 新代码建议直接从具体领域模块导入：
//   docMergeUtils.ts   —— 文档合并/移动/元数据搬迁（mergeDocs）
//   refDocUtils.ts     —— 引用文档创建（item2ref/createRefDoc）与拼音
//   navUtils.ts        —— 界面导航/打开文件/标签页/文档树定位（OpenSyFile2）
//   assetsTidyUtils.ts —— 附件整理（扫描/搬运/替换引用，assetsApi）
//   blockTreeUtils.ts  —— 块树读取与填充（getDocBlocks/fillChildren/md2divs）
//   docTracerUtils.ts  —— 字数统计与文档追踪（calcWords/DocTracer）
export * from "./docMergeUtils";
export * from "./refDocUtils";
export * from "./navUtils";
export * from "./assetsTidyUtils";
export * from "./blockTreeUtils";
export * from "./docTracerUtils";
