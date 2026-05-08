import { ChevronRightIcon, FolderIcon } from "../PopupIcons";

export function LocationPathRow({
  displayPath,
  disabled,
  fullPathTitle,
  loading,
  locationMenuOpen,
  onToggleMenu
}: {
  displayPath: string;
  disabled: boolean;
  fullPathTitle?: string;
  loading: boolean;
  locationMenuOpen: boolean;
  onToggleMenu(): void;
}) {
  const visiblePath = loading ? "正在读取保存位置" : displayPath;

  return (
    <div
      className={`location-path-row ${disabled ? "is-disabled" : ""}`}
      aria-disabled={disabled}
      title={fullPathTitle || undefined}
    >
      <span className="location-folder-icon" aria-hidden="true">
        <FolderIcon />
      </span>
      <span className="path-display">{visiblePath}</span>
      {loading ? null : <span className="current-badge">当前位置</span>}
      <button
        type="button"
        className={`location-arrow-button ${locationMenuOpen ? "is-open" : ""}`}
        aria-controls="save-location-picker"
        aria-expanded={locationMenuOpen}
        aria-haspopup="menu"
        aria-label="选择保存位置"
        title="选择保存位置"
        disabled={disabled}
        onClick={onToggleMenu}
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
}
