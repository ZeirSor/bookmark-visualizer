# Toolbar Popup 入口健康检查

当前主入口是 Manifest V3 toolbar popup：用户点击工具栏图标或触发 `_execute_action` 快捷键后打开 `popup.html`，由 `src/popup/PopupApp.tsx` 渲染 Save / Manage / Settings。

## Invariants

1. `public/manifest.json` 必须声明 `action.default_popup = "popup.html"`。
2. manifest 默认快捷键使用 `_execute_action`，默认 `Ctrl + Shift + S` / macOS `Command + Shift + S`。
3. `commands.open-quick-save` 不应保留 suggested key。
4. service worker 必须注册 `registerMessageRouter()` 和 `registerNewTabRedirect()`。
5. service worker 不应注册 `registerSaveExperienceHandlers()` 或 legacy `registerCommandHandlers()`。
6. manifest 不应新增全局 `host_permissions` 或默认 `content_scripts`。
7. Vite 构建必须包含 `popup.html` 和 `service-worker.js`。

## Validation

```bash
npm run typecheck
npm run test
npm run build
npm run verify:popup-entry
```

`npm run verify:quick-save-shortcut` 和 `npm run verify:save-window-entry` 仅作为兼容 alias，当前都应检查 popup entry。

## Troubleshooting

- 工具栏图标未打开 popup：检查 manifest 是否缺少 `action.default_popup`，以及 build 后 `dist/manifest.json` 是否同步。
- 快捷键未打开 popup：检查 `commands._execute_action` 是否存在，并在浏览器扩展快捷键设置页确认快捷键分配。
- Popup 保存失败：检查 `src/background/serviceWorker.ts` 是否仍注册 message router，以及 `src/background/messageRouter.ts` 是否仍转发 Quick Save message。
- Popup 保存位置被裁剪：检查 `SaveLocationPicker` 是否使用 `src/components/folder-picker/InlineFolderPicker.tsx`，不要重新接回横向 floating cascade。
