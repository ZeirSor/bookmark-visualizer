# 06. 关键代码片段

> 这些片段是给程序员的实现参考，不要求逐字复制。落地时应结合现有代码风格、lint、测试和类型定义调整。

## 1. newtab.html

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Bookmark Visualizer · 新标签页</title>
  </head>
  <body>
    <div id="newtab-root"></div>
    <script type="module" src="/src/newtab/main.tsx"></script>
  </body>
</html>
```

## 2. vite.config.ts

```ts
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
```

## 3. SettingsState 扩展

`src/features/settings/index.ts`

```ts
export type NewTabLayoutMode = "standard" | "sidebar" | "tabs";
export type NewTabSearchCategory = "web" | "image" | "news" | "video" | "maps";

export interface SettingsState {
  showBookmarksInTree: boolean;
  theme: "light" | "dark";
  cardDensity: "comfortable";
  cardSize: CardSize;
  sidebarWidth: number;
  popupAutoCloseAfterSave: boolean;
  popupShowSuccessToast: boolean;
  popupRememberLastFolder: boolean;
  popupShowThumbnail: boolean;
  popupDefaultOpenTab: PopupDefaultOpenTab;
  popupThemeMode: PopupThemeMode;
  popupDefaultFolderId?: string;

  newTabOverrideEnabled: boolean;
  newTabDefaultSearchEngineId: string;
  newTabDefaultSearchCategory: NewTabSearchCategory;
  newTabLayoutMode: NewTabLayoutMode;
  newTabShowRecentActivity: boolean;
  newTabShowStorageUsage: boolean;
  newTabShortcutsPerRow: number;
}
```

## 4. normalizeSettings 新增逻辑

`src/features/settings/settingsService.ts`

```ts
export function normalizeSettings(settings?: Partial<SettingsState>): SettingsState {
  return {
    // existing fields...
    showBookmarksInTree: settings?.showBookmarksInTree ?? defaultSettings.showBookmarksInTree,
    theme: settings?.theme === "dark" ? "dark" : "light",
    cardDensity: "comfortable",
    cardSize: normalizeCardSize(settings?.cardSize),
    sidebarWidth: normalizeSidebarWidth(settings?.sidebarWidth),
    popupAutoCloseAfterSave:
      settings?.popupAutoCloseAfterSave ?? defaultSettings.popupAutoCloseAfterSave,
    popupShowSuccessToast:
      settings?.popupShowSuccessToast ?? defaultSettings.popupShowSuccessToast,
    popupRememberLastFolder:
      settings?.popupRememberLastFolder ?? defaultSettings.popupRememberLastFolder,
    popupShowThumbnail: settings?.popupShowThumbnail ?? defaultSettings.popupShowThumbnail,
    popupDefaultOpenTab: normalizePopupDefaultOpenTab(settings?.popupDefaultOpenTab),
    popupThemeMode: normalizePopupThemeMode(settings?.popupThemeMode),
    popupDefaultFolderId: normalizeOptionalId(settings?.popupDefaultFolderId),

    newTabOverrideEnabled:
      settings?.newTabOverrideEnabled ?? defaultSettings.newTabOverrideEnabled,
    newTabDefaultSearchEngineId: normalizeSearchEngineId(settings?.newTabDefaultSearchEngineId),
    newTabDefaultSearchCategory: normalizeSearchCategory(settings?.newTabDefaultSearchCategory),
    newTabLayoutMode: normalizeNewTabLayoutMode(settings?.newTabLayoutMode),
    newTabShowRecentActivity:
      settings?.newTabShowRecentActivity ?? defaultSettings.newTabShowRecentActivity,
    newTabShowStorageUsage:
      settings?.newTabShowStorageUsage ?? defaultSettings.newTabShowStorageUsage,
    newTabShortcutsPerRow: normalizeShortcutsPerRow(settings?.newTabShortcutsPerRow)
  };
}

function normalizeSearchEngineId(id?: string): string {
  const value = id?.trim();
  return value || defaultSettings.newTabDefaultSearchEngineId;
}

function normalizeSearchCategory(category?: SettingsState["newTabDefaultSearchCategory"]) {
  if (
    category === "web" ||
    category === "image" ||
    category === "news" ||
    category === "video" ||
    category === "maps"
  ) {
    return category;
  }
  return defaultSettings.newTabDefaultSearchCategory;
}

function normalizeNewTabLayoutMode(mode?: SettingsState["newTabLayoutMode"]) {
  if (mode === "standard" || mode === "sidebar" || mode === "tabs") {
    return mode;
  }
  return defaultSettings.newTabLayoutMode;
}

function normalizeShortcutsPerRow(value?: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return defaultSettings.newTabShortcutsPerRow;
  }
  return Math.min(10, Math.max(4, Math.round(value)));
}
```

## 5. Popup 设置开关

`src/popup/tabs/SettingsTab.tsx`

```tsx
<section className="settings-card">
  <div className="section-heading">
    <h2>新标签页</h2>
  </div>
  <SwitchRow
    checked={settings.newTabOverrideEnabled}
    label="绑定新标签页"
    onChange={(value) => updateSettings({ newTabOverrideEnabled: value })}
  />
  <p className="settings-hint">
    开启后，点击浏览器 + 会打开 Bookmark Visualizer 新标签页；关闭后保留浏览器默认新标签页。
  </p>
  <SelectRow
    label="默认搜索引擎"
    value={settings.newTabDefaultSearchEngineId}
    onChange={(value) => updateSettings({ newTabDefaultSearchEngineId: value })}
  >
    <option value="google">Google</option>
    <option value="bing">Bing</option>
    <option value="duckduckgo">DuckDuckGo</option>
  </SelectRow>
  <SelectRow
    label="布局模式"
    value={settings.newTabLayoutMode}
    onChange={(value) => updateSettings({ newTabLayoutMode: value as SettingsState["newTabLayoutMode"] })}
  >
    <option value="standard">标准</option>
    <option value="sidebar">动态侧栏</option>
    <option value="tabs">分区 Tab</option>
  </SelectRow>
</section>
```

## 6. 条件重定向 service

`src/features/newtab/newTabRedirect.ts`

```ts
import { loadSettings } from "../settings";

const NEW_TAB_URLS = new Set(["chrome://newtab/", "edge://newtab/"]);
const redirectingTabIds = new Set<number>();

export function registerNewTabRedirect(): void {
  if (typeof chrome === "undefined" || !chrome.tabs?.onCreated || !chrome.tabs?.update) {
    return;
  }

  chrome.tabs.onCreated.addListener((tab) => {
    void maybeRedirectNewTab(tab);
  });

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (!changeInfo.url && !tab.pendingUrl) {
      return;
    }
    void maybeRedirectNewTab({ ...tab, id: tabId });
  });
}

async function maybeRedirectNewTab(tab: chrome.tabs.Tab): Promise<void> {
  const tabId = tab.id;
  if (!tabId || redirectingTabIds.has(tabId)) {
    return;
  }

  if (!isBrowserNewTab(tab)) {
    return;
  }

  const settings = await loadSettings();
  if (!settings.newTabOverrideEnabled) {
    return;
  }

  const targetUrl = chrome.runtime.getURL("newtab.html");
  if (tab.url === targetUrl || tab.pendingUrl === targetUrl) {
    return;
  }

  redirectingTabIds.add(tabId);
  try {
    await chrome.tabs.update(tabId, { url: targetUrl });
  } finally {
    window.setTimeout?.(() => redirectingTabIds.delete(tabId), 1000);
  }
}

function isBrowserNewTab(tab: chrome.tabs.Tab): boolean {
  const url = tab.pendingUrl || tab.url || "";
  return NEW_TAB_URLS.has(url);
}
```

注意：service worker 环境不一定有 `window.setTimeout` 类型提示；实际代码可直接用全局 `setTimeout`。

## 7. 注册重定向

`src/background/serviceWorker.ts`

```ts
import { registerCommandHandlers } from "./commandHandlers";
import { registerMessageRouter } from "./messageRouter";
import { registerNewTabRedirect } from "../features/newtab/newTabRedirect";

export function registerServiceWorker(): void {
  registerCommandHandlers();
  registerMessageRouter();
  registerNewTabRedirect();
}
```

## 8. NewTabApp 基础骨架

```tsx
import { useEffect, useMemo, useState } from "react";
import { bookmarksAdapter } from "../lib/chrome";
import { loadSettings, type SettingsState, defaultSettings } from "../features/settings";
import { loadNewTabState, defaultNewTabState, type NewTabState } from "../features/newtab";
import type { BookmarkNode } from "../features/bookmarks";
import "./styles.css";

export function NewTabApp() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [tree, setTree] = useState<BookmarkNode[]>([]);
  const [state, setState] = useState<NewTabState>(defaultNewTabState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [nextSettings, nextTree, nextState] = await Promise.all([
          loadSettings(),
          bookmarksAdapter.getTree(),
          loadNewTabState()
        ]);

        if (!cancelled) {
          setSettings(nextSettings);
          setTree(nextTree);
          setState(nextState);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const viewModel = useMemo(
    () => deriveNewTabViewModel({ tree, state, settings }),
    [tree, state, settings]
  );

  return (
    <main className="newtab-shell">
      {/* NewTabHeader / SearchPanel / PinnedShortcutGrid / BookmarkGroupStrip / Sidebar */}
    </main>
  );
}
```

## 9. 搜索 URL 构建

```ts
export function isProbablyUrl(query: string): boolean {
  const value = query.trim();
  if (!value || value.includes(" ")) return false;
  if (/^https?:\/\//i.test(value)) return true;
  return /^[\w-]+(\.[\w-]+)+/.test(value);
}

export function normalizeInputUrl(query: string): string {
  const value = query.trim();
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}
```

## 10. 打开管理页 deep link

```ts
export async function openWorkspaceFolder(folderId: string): Promise<void> {
  const path = `index.html?folderId=${encodeURIComponent(folderId)}`;
  if (typeof chrome !== "undefined" && chrome.tabs?.create && chrome.runtime?.getURL) {
    await chrome.tabs.create({ url: chrome.runtime.getURL(path) });
    return;
  }
  window.open(path, "_blank", "noopener,noreferrer");
}
```

## 11. manifest.test 建议改法

```ts
it("does not use static new tab override because new tab binding is runtime-toggleable", () => {
  const manifest = readManifest();
  expect(manifest.chrome_url_overrides).toBeUndefined();
});

it("includes the tabs permission required by runtime-toggleable new tab redirect", () => {
  const manifest = readManifest();
  expect(manifest.permissions).toContain("tabs");
});
```
