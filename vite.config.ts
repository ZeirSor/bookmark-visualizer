import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { build as buildWithEsbuild, type Plugin as EsbuildPlugin } from "esbuild";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const quickSaveContentEntry = fileURLToPath(
  new URL("src/features/quick-save/content.tsx", import.meta.url)
);
const quickSaveContentOutput = fileURLToPath(new URL("dist/quick-save-content.js", import.meta.url));
const saveOverlayContentEntry = fileURLToPath(
  new URL("src/features/save-overlay/content.tsx", import.meta.url)
);
const saveOverlayContentOutput = fileURLToPath(
  new URL("dist/save-overlay-content.js", import.meta.url)
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
          sourcemap: false,
          plugins: [rawTextPlugin()]
        };

        await buildWithEsbuild({
          ...bundleOptions,
          entryPoints: [quickSaveContentEntry],
          outfile: quickSaveContentOutput
        });
        await buildWithEsbuild({
          ...bundleOptions,
          entryPoints: [saveOverlayContentEntry],
          outfile: saveOverlayContentOutput
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

function rawTextPlugin(): EsbuildPlugin {
  return {
    name: "raw-text",
    setup(build) {
      build.onResolve({ filter: /\?raw$/ }, (args) => ({
        path: resolve(args.resolveDir, args.path.replace(/\?raw$/, "")),
        namespace: "raw-text"
      }));
      build.onLoad({ filter: /.*/, namespace: "raw-text" }, async (args) => ({
        contents: `export default ${JSON.stringify(await readFile(args.path, "utf8"))};`,
        loader: "js"
      }));
    }
  };
}
