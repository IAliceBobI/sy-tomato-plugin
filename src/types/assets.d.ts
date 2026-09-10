// vite ?raw 内联导入的类型声明（tsconfig 的 vite/client 被注释，自备最小面）。
// 用例=agentSkills/SKILL.md 编译期内联进 skills 工具（双门脸同源、零运行时文件 IO）。
declare module "*?raw" {
  const content: string;
  export default content;
}
