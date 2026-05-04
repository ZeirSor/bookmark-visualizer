import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        index: fileURLToPath(new URL("index.html", import.meta.url)),
        "service-worker": fileURLToPath(new URL("src/service-worker.ts", import.meta.url)),
        "quick-save-content": fileURLToPath(
          new URL("src/features/quick-save/content.ts", import.meta.url)
        )
      },
      output: {
        entryFileNames: (chunkInfo) =>
          chunkInfo.name === "service-worker"
            ? "service-worker.js"
            : chunkInfo.name === "quick-save-content"
              ? "quick-save-content.js"
              : "assets/[name]-[hash].js"
      }
    }
  },
  test: {
    environment: "node",
    globals: true
  }
});
