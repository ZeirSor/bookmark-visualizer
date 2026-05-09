import type { BookmarkNode, FolderOption } from "../../features/bookmarks";
import { openExtensionShortcutSettings, openWorkspace } from "../../features/popup";
import type { SettingsState } from "../../features/settings";
import { SEARCH_CATEGORIES, SEARCH_ENGINES } from "../../features/newtab";
import { ChevronRightIcon } from "../components/PopupIcons";
import { DefaultFolderMenu } from "./settings/DefaultFolderMenu";
import { Keycap, SelectRow, SettingsSection, SwitchRow } from "./settings/SettingsRows";

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
  const searchEngineOptions = SEARCH_ENGINES.map((engine) => ({
    label: engine.label,
    value: engine.id
  }));
  const searchCategoryOptions = SEARCH_CATEGORIES.map((category) => ({
    label: category.label,
    value: category.id
  }));
  const layoutModeOptions = [
    { label: "标准", value: "standard" },
    { label: "动态侧栏", value: "sidebar" },
    { label: "分区 Tab", value: "tabs" }
  ];
  const defaultOpenTabOptions = [
    { label: "保存", value: "save" },
    { label: "管理", value: "manage" },
    { label: "设置", value: "settings" }
  ];
  const themeModeOptions = [
    { label: "跟随系统", value: "system" },
    { label: "浅色", value: "light" },
    { label: "深色", value: "dark" }
  ];

  return (
    <section className="settings-tab tab-scroll-area">
      <SettingsSection title="新标签页">
        <SwitchRow
          checked={settings.newTabOverrideEnabled}
          label="绑定新标签页"
          description="开启后，点击浏览器 + 会打开 Bookmark Visualizer 新标签页。"
          onChange={(value) => updateSettings({ newTabOverrideEnabled: value })}
        />
        <SelectRow
          label="默认搜索引擎"
          description="用于 New Tab 网络搜索建议。"
          value={settings.newTabDefaultSearchEngineId}
          options={searchEngineOptions}
          onChange={(value) => updateSettings({ newTabDefaultSearchEngineId: value })}
        />
        <SelectRow
          label="默认搜索类型"
          description="控制搜索框默认聚焦的搜索范围。"
          value={settings.newTabDefaultSearchCategory}
          options={searchCategoryOptions}
          onChange={(value) =>
            updateSettings({
              newTabDefaultSearchCategory: value as SettingsState["newTabDefaultSearchCategory"]
            })
          }
        />
        <SelectRow
          label="布局模式"
          description="切换 New Tab 信息布局。"
          value={settings.newTabLayoutMode}
          options={layoutModeOptions}
          onChange={(value) =>
            updateSettings({ newTabLayoutMode: value as SettingsState["newTabLayoutMode"] })
          }
        />
      </SettingsSection>

      <SettingsSection title="快捷键">
        <div className="shortcut-row">
          <span>保存当前网页</span>
          <Keycap>Ctrl+Shift+S</Keycap>
        </div>
        <SwitchRow
          checked={settings.enablePageCtrlSShortcut}
          label="页面内 Ctrl+S 保存"
          description="开启后，普通网页中的 Ctrl+S / Command+S 会打开 Bookmark Visualizer popup；输入框内不会拦截。"
          onChange={(value) => updateSettings({ enablePageCtrlSShortcut: value })}
        />
        <div className="shortcut-row">
          <span>打开完整管理页</span>
          <Keycap muted>未设置</Keycap>
        </div>
        <button
          type="button"
          className="text-action"
          onClick={() => void openExtensionShortcutSettings()}
        >
          配置快捷键
        </button>
      </SettingsSection>

      <SettingsSection title="默认保存位置">
        <DefaultFolderMenu
          defaultCompactPath={defaultCompactPath}
          defaultFolderId={defaultFolderId}
          defaultPath={defaultPath}
          recentFolders={recentFolders}
          tree={tree}
          updateDefaultFolder={updateDefaultFolder}
        />
      </SettingsSection>

      <SettingsSection title="保存行为">
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
      </SettingsSection>

      <SettingsSection title="界面偏好">
        <SelectRow
          label="默认打开页"
          value={settings.popupDefaultOpenTab}
          options={defaultOpenTabOptions}
          onChange={(value) =>
            updateSettings({ popupDefaultOpenTab: value as SettingsState["popupDefaultOpenTab"] })
          }
        />
        <SelectRow
          label="主题"
          description="当前用于保存界面偏好持久化。"
          value={settings.popupThemeMode}
          options={themeModeOptions}
          onChange={(value) =>
            updateSettings({ popupThemeMode: value as SettingsState["popupThemeMode"] })
          }
        />
      </SettingsSection>

      <button type="button" className="advanced-settings-button" onClick={() => void openWorkspace()}>
        打开高级设置 <ChevronRightIcon />
      </button>
    </section>
  );
}
