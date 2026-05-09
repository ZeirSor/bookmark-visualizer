import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const publicManifestPath = resolve(root, "public/manifest.json");
const serviceWorkerPath = resolve(root, "src/background/serviceWorker.ts");
const messageRouterPath = resolve(root, "src/background/messageRouter.ts");
const quickSaveHandlersPath = resolve(root, "src/background/quickSaveHandlers.ts");
const popupClientPath = resolve(root, "src/features/popup/popupClient.ts");
const viteConfigPath = resolve(root, "vite.config.ts");
const distManifestPath = resolve(root, "dist/manifest.json");
const distServiceWorkerPath = resolve(root, "dist/service-worker.js");
const distPopupPath = resolve(root, "dist/popup.html");

const errors = [];
const notes = [];

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function readText(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) {
    errors.push(message);
  }
}

function checkManifest(path, label) {
  const manifest = readJson(path);
  const commandNames = Object.keys(manifest.commands ?? {});
  const actionCommand = manifest.commands?._execute_action;
  const legacyCommand = manifest.commands?.["open-quick-save"];

  assert(
    manifest.action?.default_popup === "popup.html",
    `${label}: action.default_popup must be popup.html`
  );
  assert(
    typeof manifest.action?.default_title === "string" &&
      /Bookmark Visualizer|保存/.test(manifest.action.default_title),
    `${label}: action.default_title should name Bookmark Visualizer or save behavior`
  );
  assert(
    commandNames.includes("_execute_action"),
    `${label}: commands._execute_action is required for the toolbar popup shortcut`
  );
  assert(
    actionCommand?.suggested_key?.default === "Ctrl+Shift+S",
    `${label}: _execute_action default shortcut must be Ctrl+Shift+S`
  );
  assert(
    actionCommand?.suggested_key?.mac === "Command+Shift+S",
    `${label}: _execute_action mac shortcut must be Command+Shift+S`
  );
  assert(
    !legacyCommand?.suggested_key,
    `${label}: commands.open-quick-save must not keep a suggested_key`
  );
  assert(!manifest.host_permissions, `${label}: must not add broad host_permissions`);
  assert(!manifest.content_scripts, `${label}: must not add global content_scripts`);
}

checkManifest(publicManifestPath, "public manifest");

const serviceWorker = readText(serviceWorkerPath);
assert(
  !serviceWorker.includes("registerSaveExperienceHandlers"),
  "service worker: must not register save overlay/window action handlers"
);
assert(
  !serviceWorker.includes("registerCommandHandlers"),
  "service worker: must not register legacy open-quick-save command handlers"
);
assert(
  serviceWorker.includes("registerMessageRouter()"),
  "service worker: must register the runtime message router"
);
assert(
  serviceWorker.includes("registerNewTabRedirect()"),
  "service worker: must keep new tab redirect registration"
);

const messageRouter = readText(messageRouterPath);
const quickSaveHandlers = readText(quickSaveHandlersPath);
const popupClient = readText(popupClientPath);
for (const messageType of [
  "QUICK_SAVE_GET_INITIAL_STATE",
  "QUICK_SAVE_CREATE_BOOKMARK",
  "QUICK_SAVE_CREATE_FOLDER"
]) {
  assert(popupClient.includes(messageType), `popup client: missing ${messageType}`);
  assert(quickSaveHandlers.includes(messageType), `quick-save handlers: missing ${messageType}`);
}
assert(
  messageRouter.includes("handleQuickSaveMessage"),
  "message router: must still route popup quick-save messages"
);

const viteConfig = readText(viteConfigPath);
assert(viteConfig.includes("popup.html"), "vite config: popup.html must remain a build input");
assert(
  viteConfig.includes("src/service-worker.ts"),
  "vite config: service worker must remain a build input"
);

if (existsSync(distManifestPath) || existsSync(distPopupPath) || existsSync(distServiceWorkerPath)) {
  assert(existsSync(distManifestPath), "dist: manifest.json is missing");
  assert(existsSync(distPopupPath), "dist: popup.html is missing");
  assert(existsSync(distServiceWorkerPath), "dist: service-worker.js is missing");

  if (existsSync(distManifestPath)) {
    checkManifest(distManifestPath, "dist manifest");
  }

  if (existsSync(distServiceWorkerPath)) {
    const distServiceWorker = readText(distServiceWorkerPath);
    assert(
      !distServiceWorker.includes("open-quick-save"),
      "dist: service worker should not contain the legacy open-quick-save command path"
    );
    assert(
      !distServiceWorker.includes("chrome.action.onClicked"),
      "dist: service worker should not register toolbar click save-overlay handlers"
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
