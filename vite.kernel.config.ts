import { resolve } from "path";
import { defineConfig } from "vite";

// 内核插件（kernel.js）构建线：ES 单文件产物，跑在内核进程内嵌 goja 虚拟机（v3.7.0+）。
// 与前端产物同目录共存，双向 emptyOutDir:false 防清空；siyuan 全局由内核注入故 external。
// 照 sy-progressive-plugin 同款（契约事实源=docs/agents/debugging/kernel/mcp.md）。
const devDistDir = process.env.SYPLUGINDIR ? process.env.SYPLUGINDIR + "/sy-tomato-plugin" : "build";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "src"),
    },
  },

  build: {
    outDir: devDistDir,
    emptyOutDir: false,
    sourcemap: false,
    minify: process.env.NODE_ENV === "development" ? false : "esbuild",

    lib: {
      entry: resolve(import.meta.dirname, "src/kernel.ts"),
      fileName: "kernel",
      formats: ["es"],
    },

    rollupOptions: {
      external: ["siyuan", "process"],
      output: {
        entryFileNames: "kernel.js",
        // goja 无动态加载，内核插件必须单文件
        codeSplitting: false,
      },
    },
  },
});
