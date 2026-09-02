// sy-tomato-plugin/vitest.config.ts

import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    globals: true,
    reporters: ["verbose"],
    projects: [
      {
        // siyuan npm 包只有类型声明、无运行时入口；src/libs 的 import 链全靠 named-import "siyuan"，
        // 单测里落到这个 Proxy stub 上（root 级 resolve.alias 不会被 projects 继承，必须放条目内）。
        // 契约测试（tests/contract）直接 fetch dev 实例（6807，SIYUAN_URL 可覆盖）、不 import siyuan，不需要。
        resolve: {
          alias: [
            {
              find: /^siyuan$/,
              replacement: fileURLToPath(new URL("./tests/unit/__stubs__/siyuan.cjs", import.meta.url)),
            },
          ],
        },
        test: {
          name: "unit",
          // 纯函数单测，不依赖 6806 活实例：npm run test:unit
          // happy-dom 纯 JS 无原生依赖；jsdom 会顶层 require canvas（fabric 的传递依赖，
          // 本机二进制缺 pixman 直接 dlopen 失败），故不用 jsdom。
          include: ["tests/unit/**/*.test.ts"],
          setupFiles: ["./tests/unit/setup.ts"],
          environment: "happy-dom",
        },
      },
      {
        test: {
          name: "contract",
          // 契约测试，对 dev 实例（6807，SIYUAN_URL 可覆盖）验证思源 API 行为：make test-t
          include: ["tests/contract/**/*.test.ts"],
          setupFiles: ["./tests/setup.ts"],
          testTimeout: 30000,
          hookTimeout: 30000,
          // setup.ts 是每文件各跑一遍的 setupFile，文件级并行会把 getOrCreateTestNotebook 的
          // 「查-建」竞态放大成一窝同名笔记本（模块级缓存不跨 worker；2026-09-02 实锤 3s 冒 7 个），串行保原子
          fileParallelism: false,
        },
      },
    ],
  },
});
