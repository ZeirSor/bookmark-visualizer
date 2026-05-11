import { IconButton } from "../../design-system";
import { CloseIcon, ExternalLinkIcon, RecentIcon } from "./PopupIcons";

export function PopupTopBar({
  onClose,
  onOpenManager,
  onViewHistory
}: {
  onViewHistory(): void;
  onOpenManager(): void;
  onClose(): void;
}) {
  return (
    <header className="popup-topbar">
      <div className="popup-topbar-brand">
        <img src="/icons/icon-128.png" alt="" className="popup-topbar-logo" />
        <span className="popup-topbar-title">
          <strong>我的书签</strong>
          <small>Bookmark Visualizer</small>
        </span>
      </div>
      <div className="popup-topbar-actions" aria-label="Popup tools">
        <IconButton
          className="topbar-tool-button"
          icon={<RecentIcon />}
          label="查看最近保存"
          onClick={onViewHistory}
        />
        <IconButton
          className="topbar-tool-button"
          icon={<ExternalLinkIcon />}
          label="打开完整管理页"
          onClick={onOpenManager}
        />
        <IconButton
          className="topbar-tool-button"
          icon={<CloseIcon />}
          label="关闭"
          onClick={onClose}
        />
      </div>
    </header>
  );
}
