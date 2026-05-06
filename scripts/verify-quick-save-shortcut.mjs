import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const publicManifestPath = resolve(root, "public/manifest.json");
const serviceWorkerPath = resolve(root, "src/service-worker.ts");
const backgroundPath = resolve(root, "src/background");
const shortcutAccessPath = resolve(root, "src/features/quick-save/shortcutAccess.ts");
const viteConfigPath = resolve(root, "vite.config.ts");
const distManifestPath = resolve(root, "dist/manifest.json");
const distServiceWorkerPath = resolve(root, "dist/service-worker.js");
const distPopupPath = resolve(root, "dist/popup.html");
const distQuickSaveContentPath = resolve(root, "dist/quick-save-content.js");

const expectedCommands = {
  "open-quick-save": {
    default: "Ctrl+Shift+S",
    mac: "Command+Shift+S"
  }
};

const errors = [];
const notes = [];

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function assert(condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

function checkManifest(path, label) {
  const manifest = readJson(path);
  const commandNames = Object.keys(manifest.commands ?? {});

  assert(
    manifest.action?.default_popup === "popup.html",
    `${label}: action.default_popup should be popup.html`
  );

  assert(
    commandNames.length === 1 && commandNames[0] === "open-quick-save",
    `${label}: expected only commands.open-quick-save`
  );

  for (const [commandName, suggestedKey] of Object.entries(expectedCommands)) {
    const command = manifest.commands?.[commandName];
    assert(command, `${label}: missing commands.${commandName}`);
    assert(
      command?.suggested_key?.default === suggestedKey.default,
      `${label}: commands.${commandName}.suggested_key.default should be ${suggestedKey.default}`
    );
    assert(
      command?.suggested_key?.mac === suggestedKey.mac,
      `${label}: commands.${commandName}.suggested_key.mac should be ${suggestedKey.mac}`
    );
  }

  assert(
    !manifest.host_permissions,
    `${label}: popup entry should not declare global host_permissions`
  );
  assert(
    !manifest.content_scripts,
    `${label}: popup entry should not declare global content_scripts`
  );
}

checkManifest(publicManifestPath, "public manifest");

const serviceWorker = readServiceWorkerSources();
const shortcutAccess = readFileSync(shortcutAccessPath, "utf8");
for (const commandName of Object.keys(expectedCommands)) {
  assert(serviceWorker.includes(commandName), `service worker: missing command handler for ${commandName}`);
}
assert(
  !serviceWorker.includes("open-quick-save-fallback"),
  "service worker: fallback quick-save command should not exist"
);
assert(
  shortcutAccess.includes("quick-save-content.js"),
  "shortcut access: quick-save command must inject quick-save-content.js"
);
assert(
  !serviceWorker.includes("chrome.action.onClicked"),
  "service worker: toolbar click should be handled by action.default_popup"
);
assert(
  serviceWorker.includes("onCommand.addListener((command, tab)") ||
    serviceWorker.includes("onCommand.addListener((command,tab)"),
  "service worker: quick-save command should use the command event tab"
);
assert(
  !serviceWorker.includes("_execute_action"),
  "service worker: quick-save must not rely on the toolbar action command"
);

const viteConfig = readFileSync(viteConfigPath, "utf8");
assert(
  viteConfig.includes("src/features/quick-save/content.tsx"),
  "vite config: quick-save React content entry is not bundled explicitly"
);
assert(
  viteConfig.includes("popup.html"),
  "vite config: popup.html is not configured as a build input"
);
assert(
  viteConfig.includes("dist/quick-save-content.js"),
  "vite config: quick-save content output path is not fixed"
);
assert(
  !viteConfig.includes("quick-save-listener"),
  "vite config: global quick-save listener should not be bundled"
);

if (
  existsSync(distManifestPath) ||
  existsSync(distQuickSaveContentPath) ||
  existsSync(distPopupPath)
) {
  assert(existsSync(distManifestPath), "dist: manifest.json is missing");
  assert(existsSync(distServiceWorkerPath), "dist: service-worker.js is missing");
  assert(existsSync(distPopupPath), "dist: popup.html is missing");
  assert(existsSync(distQuickSaveContentPath), "dist: quick-save-content.js is missing");

  if (existsSync(distManifestPath)) {
    checkManifest(distManifestPath, "dist manifest");
  }

  if (existsSync(distServiceWorkerPath)) {
    const distServiceWorker = readFileSync(distServiceWorkerPath, "utf8");
    const distRuntimeChunks = readDistRuntimeChunks();
    assert(
      distServiceWorker.includes("open-quick-save"),
      "dist: service worker is missing open-quick-save"
    );
    assert(
      !distServiceWorker.includes("open-quick-save-fallback"),
      "dist: service worker still contains fallback quick-save command"
    );
    assert(
      distRuntimeChunks.includes("quick-save-content.js"),
      "dist: service worker must inject quick-save-content.js"
    );
    assert(
      !distRuntimeChunks.includes("quick-save-listener.js"),
      "dist: global quick-save listener should not be referenced"
    );
    assert(
      !distServiceWorker.includes("_execute_action"),
      "dist: service worker must not rely on the toolbar action command"
    );
  }

  if (existsSync(distQuickSaveContentPath)) {
    const contentBundle = readFileSync(distQuickSaveContentPath, "utf8").trimStart();
    assert(
      !contentBundle.startsWith("import "),
      "dist: quick-save-content.js must be self-contained and must not start with an ESM import"
    );
  }
} else {
  notes.push("dist not present; run npm run build before checking packaged extension files.");
}

if (errors.length > 0) {
  console.error("Popup entry verification failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Popup entry verification passed.");
for (const note of notes) {
  console.log(`Note: ${note}`);
}

function readDistRuntimeChunks() {
  const chunks = [readFileSync(distServiceWorkerPath, "utf8")];
  const assetsDir = resolve(root, "dist/assets");

  if (existsSync(assetsDir)) {
    for (const fileName of readdirSync(assetsDir)) {
      if (fileName.endsWith(".js")) {
        chunks.push(readFileSync(resolve(assetsDir, fileName), "utf8"));
      }
    }
  }

  return chunks.join("\n");
}

function readServiceWorkerSources() {
  const chunks = [readFileSync(serviceWorkerPath, "utf8")];

  if (existsSync(backgroundPath)) {
    for (const fileName of readdirSync(backgroundPath)) {
      if (fileName.endsWith(".ts")) {
        chunks.push(readFileSync(resolve(backgroundPath, fileName), "utf8"));
      }
    }
  }

  return chunks.join("\n");
}
