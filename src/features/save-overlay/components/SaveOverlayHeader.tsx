import { CloseIcon } from "../../../popup/components/PopupIcons";

export function SaveOverlayHeader({ onClose }: { onClose(): void }) {
  const logoUrl =
    typeof chrome !== "undefined" && chrome.runtime?.getURL
      ? chrome.runtime.getURL("icons/icon-128.png")
      : "/icons/icon-128.png";

  return (
    <header className="popup-header save-overlay-header">
      <img src={logoUrl} alt="" className="app-logo" />
      <div className="brand-block">
        <h1 id="save-overlay-title">保存当前网页</h1>
        <p>Bookmark Visualizer</p>
      </div>
      <button
        type="button"
        className="icon-button save-overlay-close-button"
        aria-label="关闭保存浮层"
        title="关闭"
        onClick={onClose}
      >
        <CloseIcon />
      </button>
    </header>
  );
}
