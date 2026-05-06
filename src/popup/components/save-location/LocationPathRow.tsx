import { ChevronRightIcon, FolderIcon } from "../PopupIcons";

export function LocationPathRow({
  displayPath,
  fullPathTitle,
  locationMenuOpen,
  onToggleMenu
}: {
  displayPath: string;
  fullPathTitle?: string;
  locationMenuOpen: boolean;
  onToggleMenu(): void;
}) {
  return (
    <div className="location-path-row" title={fullPathTitle || undefined}>
      <span className="location-folder-icon" aria-hidden="true">
        <FolderIcon />
      </span>
      <span className="path-display">{displayPath}</span>
      <span className="current-badge">当前位置</span>
      <button
        type="button"
        className={`location-arrow-button ${locationMenuOpen ? "is-open" : ""}`}
        aria-controls="save-location-picker"
        aria-expanded={locationMenuOpen}
        aria-haspopup="menu"
        aria-label="选择保存位置"
        title="选择保存位置"
        onClick={onToggleMenu}
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
}
