import type { SettingsState } from "../../features/settings";
import type { SearchCategory } from "../../features/newtab";
import { SEARCH_CATEGORIES, SEARCH_ENGINES } from "../../features/newtab";
import { CloseIcon } from "../../components/icons/AppIcons";
import { Input, Select } from "../../design-system";

export function CustomizeLayoutPanel({
  settings,
  onChange,
  onClose
}: {
  settings: SettingsState;
  onChange(patch: Partial<SettingsState>): void;
  onClose(): void;
}) {
  return (
    <div className="nt-drawer-backdrop" role="presentation" onMouseDown={onClose}>
      <aside
        className="nt-customize-drawer"
        aria-label="自定义布局"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="nt-drawer-header">
          <div>
            <h2>自定义布局</h2>
            <p>调整新标签页的默认显示方式。</p>
          </div>
          <button type="button" aria-label="关闭自定义布局" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <label className="nt-field-row">
          <span>默认搜索引擎</span>
          <Select
            fullWidth
            value={settings.newTabDefaultSearchEngineId}
            options={SEARCH_ENGINES.map((engine) => ({ value: engine.id, label: engine.label }))}
            onValueChange={(value) => onChange({ newTabDefaultSearchEngineId: value })}
          />
        </label>

        <label className="nt-field-row">
          <span>默认搜索类型</span>
          <Select<SearchCategory>
            fullWidth
            value={settings.newTabDefaultSearchCategory}
            options={SEARCH_CATEGORIES.map((category) => ({ value: category.id, label: category.label }))}
            onValueChange={(value) => onChange({ newTabDefaultSearchCategory: value })}
          />
        </label>

        <label className="nt-field-row">
          <span>布局模式</span>
          <Select<SettingsState["newTabLayoutMode"]>
            fullWidth
            value={settings.newTabLayoutMode}
            options={[
              { value: "standard", label: "标准" },
              { value: "sidebar", label: "动态侧栏" },
              { value: "tabs", label: "分区 Tab" }
            ]}
            onValueChange={(value) =>
              onChange({
                newTabLayoutMode: value
              })
            }
          />
        </label>

        <label className="nt-field-row">
          <span>每行快捷方式</span>
          <Input
            fullWidth
            type="number"
            min={4}
            max={10}
            value={settings.newTabShortcutsPerRow}
            onChange={(event) =>
              onChange({ newTabShortcutsPerRow: Number(event.target.value) })
            }
          />
        </label>

        <label className="nt-check-row">
          <span>显示最近活动</span>
          <input
            type="checkbox"
            checked={settings.newTabShowRecentActivity}
            onChange={(event) => onChange({ newTabShowRecentActivity: event.target.checked })}
          />
        </label>

        <label className="nt-check-row">
          <span>显示本地存储说明</span>
          <input
            type="checkbox"
            checked={settings.newTabShowStorageUsage}
            onChange={(event) => onChange({ newTabShowStorageUsage: event.target.checked })}
          />
        </label>
      </aside>
    </div>
  );
}
