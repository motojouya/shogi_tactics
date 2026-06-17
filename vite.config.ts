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
        name: "KNIW - tactics board game",
        short_name: "KNIW",
        description: "KNIW is a board game that combines tactics and strategy.",
        theme_color: "#ffffff",
      },
    }),
  ],
  publicDir: resolve(__dirname, "public"),
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        "": resolve(__dirname, "src/pages/index.html"),
        new: resolve(__dirname, "src/pages/new/index.html"),
        list: resolve(__dirname, "src/pages/list/index.html"),
        v1: resolve(__dirname, "src/pages/v1/index.html"),
      },
      output: {
        entryFileNames: `assets/[name]/bundle.js`,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === ".css") {
            return "assets/index.css";
          }
          return `assets/[name].[ext]`;
        },
        chunkFileNames: `assets/[name].js`,
      },
    },
  },
  server: {
    port: 3000,
  },
  base: path,
  test: {
    include: ["src/**/*.unit.test.ts", "test/**/*.ts"],
  },
});
