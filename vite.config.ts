import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { build as buildWithEsbuild } from "esbuild";
import { fileURLToPath } from "node:url";

const pageShortcutContentEntry = fileURLToPath(
  new URL("src/features/page-shortcut/content.ts", import.meta.url)
);
const pageShortcutContentOutput = fileURLToPath(
  new URL("dist/page-shortcut-content.js", import.meta.url)
);

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    {
      name: "bundle-extension-content-scripts",
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
          entryPoints: [pageShortcutContentEntry],
          outfile: pageShortcutContentOutput
        });
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL("index.html", import.meta.url)),
        popup: fileURLToPath(new URL("popup.html", import.meta.url)),
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
