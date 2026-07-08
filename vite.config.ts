/// <reference types="vitest/config" />
import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const path = process.env.VITE_URL_PREFIX ? "/" + process.env.VITE_URL_PREFIX + "/" : "/";

// https://vitejs.dev/config/
export default defineConfig({
  root: "src/pages",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        ignoreURLParametersMatching: [/./],
      },
      manifest: {
        scope: path,
        name: "将棋タクティクス",
        short_name: "将棋タクティクス",
        description: "将棋タクティクスは戦術と戦略を組み合わせたボードゲームです。",
        theme_color: "#ffffff",
      },
    }),
  ],
  publicDir: resolve(__dirname, "src/public"),
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        "": resolve(__dirname, "src/pages/index.html"),
        list: resolve(__dirname, "src/pages/list/index.html"),
        v1: resolve(__dirname, "src/pages/v1/index.html"),
        guide: resolve(__dirname, "src/pages/guide/index.html"),
        "guide/tutorial": resolve(__dirname, "src/pages/guide/tutorial/index.html"),
        "guide/rule": resolve(__dirname, "src/pages/guide/rule/index.html"),
        "guide/turbulent": resolve(__dirname, "src/pages/guide/turbulent/index.html"),
        "guide/offscreen": resolve(__dirname, "src/pages/guide/offscreen/index.html"),
        "guide/piece": resolve(__dirname, "src/pages/guide/piece/index.html"),
      },
      output: {
        // 各ファイル名にcontent hashを含める。ハッシュが無いとファイル名が毎回同一になり、
        // Service Workerのprecacheがそれらを revision:null(=URLで一意な不変資産)として扱うため、
        // デプロイして中身が変わってもキャッシュを更新せず古いJSを配信し続けてしまう。
        // ハッシュを付けると各ビルドでURLが変わり、precacheが新資産として取得・cache-bustできる。
        entryFileNames: `assets/[name]/bundle-[hash].js`,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === ".css") {
            return "assets/index-[hash].css";
          }
          return `assets/[name]-[hash].[ext]`;
        },
        chunkFileNames: `assets/[name]-[hash].js`,
      },
    },
  },
  server: {
    port: 3000,
  },
  base: path,
  test: {
    include: ["src/**/*.unit.test.ts"],
  },
});
