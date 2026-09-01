import { resolve } from "path";
import { defineConfig } from "vite";
import minimist from "minimist";
import { viteStaticCopy } from "vite-plugin-static-copy";
import livereload from "rollup-plugin-livereload";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import fg from "fast-glob";

const args = minimist(process.argv.slice(2));
const isWatch = args.watch || args.w || false;
// const devDistDir = "./dev";
// const distDir = isWatch ? devDistDir : "./dist";
// console.info("isWatch=>", isWatch);
// console.info("distDir=>", distDir);
const devDistDir = process.env.SYPLUGINDIR ? process.env.SYPLUGINDIR + "/sy-tomato-plugin" : "build";
const distDir = devDistDir;

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "src"),
    },
  },

  plugins: [
    svelte(),
    viteStaticCopy({
      targets: [
        {
          src: "./README*.md",
          dest: "./",
        },
        {
          src: "./icon.png",
          dest: "./",
        },
        {
          src: "./preview.png",
          dest: "./",
        },
        {
          // 群组二维码（QQ 频道 + 飞书群合并压缩图，tools/gen-group-qr.mjs 生成）
          src: "./group-qr.png",
          dest: "./",
        },
        {
          src: "./plugin.json",
          dest: "./",
        },
        {
          // 到点提示音（□2：URL 优先用户自定义，留空回落这枚内置音）
          src: "./audio/*.mp3",
          dest: "./audio/",
        },
      ],
    }),
  ],

  // https://github.com/vitejs/vite/issues/1930
  // https://vitejs.dev/guide/env-and-mode.html#env-files
  // https://github.com/vitejs/vite/discussions/3058#discussioncomment-2115319
  // 在这里自定义变量
  define: {
    "process.env.DEV_MODE": `"${isWatch}"`,
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
  },

  build: {
    // 输出路径
    outDir: distDir,
    emptyOutDir: false,

    // 构建后是否生成 source map 文件
    sourcemap: false,

    // 设置为 false 可以禁用最小化混淆
    // 或是用来指定是应用哪种混淆器
    // boolean | 'terser' | 'esbuild'
    minify: isWatch ? false : "esbuild",

    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(import.meta.dirname, "src/index.ts"),
      // the proper extensions will be added
      fileName: "index",
      formats: ["cjs"],
    },

    rollupOptions: {
      plugins: [
        ...(isWatch
          ? [
            livereload(devDistDir),
            {
              //监听静态资源文件
              name: "watch-external",
              async buildStart() {
                const files = await fg([
                  // "./README*.md",
                  "./plugin.json",
                ]);
                for (const file of files) {
                  this.addWatchFile(file);
                }
              },
            },
          ]
          : [
            // zipPack({
            //   inDir: "./dist",
            //   outDir: "./",
            //   outFileName: "package.zip",
            // }),
          ]),
      ],

      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["siyuan", "process", "fs", "fs/promises", "os", "path", "util", "child_process"],

      output: {
        exports: "named",
        entryFileNames: "[name].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") {
            return "index.css";
          }
          return assetInfo.name;
        },
      },
    },
  },
});
