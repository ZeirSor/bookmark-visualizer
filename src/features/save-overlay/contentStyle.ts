import popupStyles from "../../popup/styles.css?raw";
import saveWindowStyles from "../../save-window/styles.css?raw";
import tokenStyles from "../../styles/tokens.css?raw";

export function createSaveOverlayStyle(): HTMLStyleElement {
  const style = document.createElement("style");
  style.textContent = [
    scopeRoot(tokenStyles),
    scopeRoot(popupStyles),
    scopeRoot(saveWindowStyles),
    overlayStyles
  ].join("\n\n");
  return style;
}

function scopeRoot(styles: string): string {
  return styles.replace(/:root/g, ":host");
}

const overlayStyles = `
:host {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: block;
  color: var(--save-text);
  font-family: var(--save-font-ui);
  pointer-events: none;
}

#root {
  width: 100%;
  height: 100%;
  margin: 0;
  pointer-events: auto;
}

.save-overlay-layer {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 16px;
  background:
    linear-gradient(135deg, rgb(15 23 42 / 0.28), rgb(30 41 59 / 0.18)),
    rgb(15 23 42 / 0.08);
  backdrop-filter: blur(7px);
}

.save-overlay-shell.save-window-shell {
  width: min(960px, calc(100vw - 32px));
  height: min(680px, calc(100vh - 32px));
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 0.72);
  border-radius: 24px;
  background: var(--save-shell);
  box-shadow: 0 34px 100px rgb(15 23 42 / 0.28), 0 2px 12px rgb(15 23 42 / 0.12);
}

.save-overlay-shell .save-overlay-header {
  grid-template-columns: 44px minmax(0, 1fr) 42px;
  padding: 16px 24px 12px;
  background: rgb(255 255 255 / 0.86);
}

.save-overlay-shell .save-overlay-header h1 {
  font-size: 20px;
}

.save-overlay-shell .save-overlay-close-button {
  color: var(--save-text);
}

.save-overlay-shell .save-overlay-tabs button[aria-selected="true"] {
  color: var(--accent);
}

.save-overlay-shell .save-overlay-content {
  min-height: 0;
}

.save-overlay-shell .save-overlay-save-tab {
  min-height: 100%;
}

.folder-path-selector {
  display: grid;
  gap: 10px;
}

.folder-path-trigger {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) 22px;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 56px;
  padding: 9px 12px;
  color: var(--text);
  text-align: left;
  border: 1px solid var(--border);
  border-radius: var(--save-radius-md);
  background: var(--surface);
}

.folder-path-trigger:hover,
.folder-path-trigger:focus-visible,
.folder-path-selector.is-open .folder-path-trigger {
  border-color: var(--save-border-focus);
  background: var(--save-accent-softer);
  outline: none;
  box-shadow: 0 0 0 3px var(--save-accent-ring);
}

.folder-path-trigger > svg:last-child {
  width: 18px;
  height: 18px;
  color: var(--muted);
  transition: transform var(--save-transition-fast);
}

.folder-path-selector.is-open .folder-path-trigger > svg:last-child {
  transform: rotate(90deg);
}

.folder-path-trigger-copy {
  min-width: 0;
  display: grid;
  gap: 3px;
}

.folder-path-trigger-copy strong {
  color: var(--text);
  font-size: 13px;
  line-height: 1.1;
}

.folder-path-trigger-copy small {
  min-width: 0;
  overflow: hidden;
  color: var(--body);
  font-size: 14px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inline-folder-picker {
  display: grid;
  gap: 11px;
  padding: 12px;
  border: 1px solid var(--save-border);
  border-radius: var(--save-radius-lg);
  background: rgb(255 255 255 / 0.98);
  box-shadow: var(--save-shadow-card);
}

.inline-folder-picker-header,
.inline-folder-picker-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.inline-folder-picker-header strong {
  color: var(--text);
  font-size: 14px;
}

.inline-folder-picker-toolbar {
  align-items: stretch;
}

.folder-search-input {
  position: relative;
  display: block;
  min-width: 0;
  flex: 1 1 auto;
}

.folder-search-input > svg {
  position: absolute;
  top: 50%;
  left: 13px;
  width: 18px;
  height: 18px;
  color: var(--muted);
  transform: translateY(-50%);
  pointer-events: none;
}

.folder-search-input input {
  width: 100%;
  height: 40px;
  padding: 0 42px 0 42px;
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--save-radius-sm);
  background: var(--surface);
}

.folder-search-input input::placeholder {
  color: var(--placeholder);
}

.folder-search-input input:focus {
  border-color: var(--save-border-focus);
  outline: none;
  box-shadow: 0 0 0 3px var(--save-accent-ring);
}

.folder-search-input button {
  position: absolute;
  top: 50%;
  right: 7px;
  display: inline-grid;
  width: 28px;
  height: 28px;
  place-items: center;
  color: var(--muted);
  border: 0;
  border-radius: 8px;
  background: transparent;
  transform: translateY(-50%);
}

.folder-search-input button:hover,
.folder-search-input button:focus-visible {
  color: var(--accent);
  background: var(--accent-soft);
  outline: none;
}

.folder-search-input button svg {
  width: 16px;
  height: 16px;
}

.picker-create-toggle {
  min-height: 40px;
  padding: 0 12px;
  color: var(--accent);
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  border: 1px solid rgb(79 70 229 / 0.24);
  border-radius: var(--save-radius-sm);
  background: var(--accent-softer);
}

.picker-create-toggle:hover,
.picker-create-toggle:focus-visible,
.picker-create-toggle.is-active {
  border-color: rgb(79 70 229 / 0.38);
  background: var(--accent-soft);
  outline: none;
}

.inline-folder-picker-body {
  max-height: min(270px, 36vh);
  overflow: auto;
  padding-right: 2px;
}

.folder-tree {
  display: grid;
  gap: 4px;
}

.folder-tree-item {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr);
  align-items: center;
  min-height: 38px;
  border-radius: 10px;
}

.folder-tree-item.is-active,
.folder-tree-item:hover {
  background: var(--save-accent-softer);
}

.folder-tree-item.is-selected {
  background: var(--save-accent-soft);
}

.folder-tree-disclosure {
  display: inline-grid;
  width: 24px;
  height: 32px;
  place-items: center;
  color: var(--muted);
  border: 0;
  border-radius: 7px;
  background: transparent;
}

.folder-tree-disclosure svg {
  width: 16px;
  height: 16px;
  transition: transform var(--save-transition-fast);
}

.folder-tree-item[aria-expanded="true"] .folder-tree-disclosure svg {
  transform: rotate(90deg);
}

.folder-tree-label {
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr) auto;
  align-items: center;
  gap: 9px;
  width: 100%;
  min-height: 38px;
  padding: 5px 8px 5px 4px;
  color: var(--text);
  text-align: left;
  border: 0;
  border-radius: 10px;
  background: transparent;
}

.folder-tree-label:disabled {
  cursor: not-allowed;
  opacity: 0.52;
}

.folder-tree-label:focus-visible,
.folder-tree-disclosure:focus-visible {
  outline: 2px solid var(--save-border-focus);
  outline-offset: 1px;
}

.folder-tree-copy {
  min-width: 0;
  display: grid;
  gap: 2px;
}

.folder-tree-copy strong,
.folder-tree-copy small {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folder-tree-copy strong {
  color: var(--text);
  font-size: 13.5px;
  line-height: 1.2;
}

.folder-tree-copy small {
  color: var(--muted);
  font-size: 12px;
  font-weight: 500;
}

.folder-tree-current {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--accent);
  font-size: 12px;
  font-weight: 700;
}

.folder-tree-current svg {
  width: 14px;
  height: 14px;
}

.inline-picker-empty {
  margin: 0;
  padding: 14px;
  color: var(--muted);
  font-size: 13px;
  text-align: center;
}

.search-results-tree .folder-tree-item {
  padding-left: 0 !important;
}

.save-overlay-shell .create-folder-row {
  margin: 0;
}

@media (max-width: 760px), (max-height: 620px) {
  .save-overlay-layer {
    padding: 8px;
  }

  .save-overlay-shell.save-window-shell {
    width: calc(100vw - 16px);
    height: calc(100vh - 16px);
    border-radius: 18px;
  }

  .save-overlay-shell .save-overlay-header {
    padding: 12px 16px 10px;
  }

  .inline-folder-picker-toolbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
  }
}
`;
