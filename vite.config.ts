import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { build as buildWithEsbuild } from "esbuild";
import { fileURLToPath } from "node:url";

const quickSaveContentEntry = fileURLToPath(
  new URL("src/features/quick-save/content.tsx", import.meta.url)
);
const quickSaveContentOutput = fileURLToPath(new URL("dist/quick-save-content.js", import.meta.url));

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    {
      name: "bundle-quick-save-content",
      apply: "build",
      async closeBundle() {
        const bundleOptions = {
          bundle: true,
          format: "iife" as const,
          platform: "browser" as const,
          target: "es2022",
          minify: true,
          sourcemap: false
        };

        await buildWithEsbuild({
          ...bundleOptions,
          entryPoints: [quickSaveContentEntry],
          outfile: quickSaveContentOutput
        });
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL("index.html", import.meta.url)),
        popup: fileURLToPath(new URL("popup.html", import.meta.url)),
        save: fileURLToPath(new URL("save.html", import.meta.url)),
        newtab: fileURLToPath(new URL("newtab.html", import.meta.url)),
        "service-worker": fileURLToPath(new URL("src/service-worker.ts", import.meta.url))
      },
      output: {
        entryFileNames: (chunkInfo) =>
          chunkInfo.name === "service-worker"
            ? "service-worker.js"
            : "assets/[name]-[hash].js"
      }
    }
  },
  test: {
    environment: "node",
    globals: true
  }
});
