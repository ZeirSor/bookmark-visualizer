import type { BookmarkNode, FolderOption } from "../../features/bookmarks";
import { openExtensionShortcutSettings, openWorkspace } from "../../features/popup";
import type { SettingsState } from "../../features/settings";
import { SEARCH_CATEGORIES, SEARCH_ENGINES } from "../../features/newtab";
import { ChevronRightIcon } from "../components/PopupIcons";
import { DefaultFolderMenu } from "./settings/DefaultFolderMenu";
import { SelectRow, SwitchRow } from "./settings/SettingsRows";

export function SettingsTab({
  defaultCompactPath,
  defaultFolderId,
  defaultPath,
  recentFolders,
  settings,
  tree,
  updateDefaultFolder,
  updateSettings
}: {
  defaultCompactPath: string;
  defaultFolderId: string;
  defaultPath: string;
  recentFolders: FolderOption[];
  settings: SettingsState;
  tree: BookmarkNode[];
  updateDefaultFolder(folderId: string): void;
  updateSettings(patch: Partial<SettingsState>): void;
}) {
  return (
    <section className="settings-tab tab-scroll-area">
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
          {SEARCH_ENGINES.map((engine) => (
            <option key={engine.id} value={engine.id}>
              {engine.label}
            </option>
          ))}
        </SelectRow>
        <SelectRow
          label="默认搜索类型"
          value={settings.newTabDefaultSearchCategory}
          onChange={(value) =>
            updateSettings({
              newTabDefaultSearchCategory: value as SettingsState["newTabDefaultSearchCategory"]
            })
          }
        >
          {SEARCH_CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </SelectRow>
        <SelectRow
          label="布局模式"
          value={settings.newTabLayoutMode}
          onChange={(value) =>
            updateSettings({ newTabLayoutMode: value as SettingsState["newTabLayoutMode"] })
          }
        >
          <option value="standard">标准</option>
          <option value="sidebar">动态侧栏</option>
          <option value="tabs">分区 Tab</option>
        </SelectRow>
      </section>

      <section className="settings-card">
        <div className="section-heading">
          <h2>快捷键</h2>
        </div>
        <div className="shortcut-row">
          <span>保存当前网页</span>
          <kbd>Ctrl+Shift+S</kbd>
        </div>
        <div className="shortcut-row">
          <span>打开完整管理页</span>
          <kbd className="is-muted">未设置</kbd>
        </div>
        <button
          type="button"
          className="text-action"
          onClick={() => void openExtensionShortcutSettings()}
        >
          配置快捷键
        </button>
      </section>

      <section className="settings-card">
        <div className="section-heading">
          <h2>默认保存位置</h2>
        </div>
        <DefaultFolderMenu
          defaultCompactPath={defaultCompactPath}
          defaultFolderId={defaultFolderId}
          defaultPath={defaultPath}
          recentFolders={recentFolders}
          tree={tree}
          updateDefaultFolder={updateDefaultFolder}
        />
      </section>

      <section className="settings-card">
        <div className="section-heading">
          <h2>保存行为</h2>
        </div>
        <SwitchRow
          checked={settings.popupAutoCloseAfterSave}
          label="保存后自动关闭浮窗"
          onChange={(value) => updateSettings({ popupAutoCloseAfterSave: value })}
        />
        <SwitchRow
          checked={settings.popupShowSuccessToast}
          label="保存后显示成功提示"
          onChange={(value) => updateSettings({ popupShowSuccessToast: value })}
        />
        <SwitchRow
          checked={settings.popupRememberLastFolder}
          label="记住上次保存位置"
          onChange={(value) => updateSettings({ popupRememberLastFolder: value })}
        />
        <SwitchRow
          checked={settings.popupShowThumbnail}
          label="显示网页缩略图"
          onChange={(value) => updateSettings({ popupShowThumbnail: value })}
        />
      </section>

      <section className="settings-card">
        <div className="section-heading">
          <h2>界面偏好</h2>
        </div>
        <SelectRow
          label="默认打开页"
          value={settings.popupDefaultOpenTab}
          onChange={(value) =>
            updateSettings({ popupDefaultOpenTab: value as SettingsState["popupDefaultOpenTab"] })
          }
        >
          <option value="save">保存</option>
          <option value="manage">管理</option>
          <option value="settings">设置</option>
        </SelectRow>
        <SelectRow
          label="主题"
          value={settings.popupThemeMode}
          onChange={(value) =>
            updateSettings({ popupThemeMode: value as SettingsState["popupThemeMode"] })
          }
        >
          <option value="system">跟随系统</option>
          <option value="light">浅色</option>
          <option value="dark">深色</option>
        </SelectRow>
      </section>

      <button type="button" className="advanced-settings-button" onClick={() => void openWorkspace()}>
        打开高级设置 <ChevronRightIcon />
      </button>
    </section>
  );
}
