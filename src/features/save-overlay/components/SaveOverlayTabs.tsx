import type { ReactNode } from "react";
import { FolderIcon, SaveIcon, SettingsIcon } from "../../../popup/components/PopupIcons";
import type { SaveOverlayTabId } from "../hooks/useSaveOverlayBootstrap";

const TABS: Array<{ id: SaveOverlayTabId; label: string; icon: ReactNode }> = [
  { id: "save", label: "保存", icon: <SaveIcon /> },
  { id: "manage", label: "管理", icon: <FolderIcon /> },
  { id: "settings", label: "设置", icon: <SettingsIcon /> }
];

export function SaveOverlayTabs({
  activeTab,
  onChangeTab
}: {
  activeTab: SaveOverlayTabId;
  onChangeTab(tab: SaveOverlayTabId): void;
}) {
  return (
    <nav className="popup-tabs save-overlay-tabs" role="tablist" aria-label="保存浮层功能">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={activeTab === tab.id ? "is-active" : ""}
          role="tab"
          aria-selected={activeTab === tab.id}
          tabIndex={activeTab === tab.id ? 0 : -1}
          onClick={() => onChangeTab(tab.id)}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
