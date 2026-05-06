export function createQuickSaveStyle(): HTMLStyleElement {
  const style = document.createElement("style");
  style.textContent = `
    :host { all: initial; color-scheme: light; }
    * { box-sizing: border-box; }
    svg {
      width: 18px;
      height: 18px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      flex: 0 0 auto;
    }
    .menu-action-icon-slot {
      display: inline-grid;
      width: 20px;
      height: 20px;
      place-items: center;
      color: #64748b;
    }
    .menu-action-icon {
      width: 18px;
      height: 18px;
    }
    .menu-action-label {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .menu-action-trailing {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      color: #64748b;
    }
    .quick-save-layer {
      position: fixed;
      z-index: 2147483647;
      inset: 0;
      display: grid;
      place-items: center;
      padding: 22px;
      font-family: "Helvetica Neue", Arial, ui-sans-serif, system-ui, sans-serif;
      color: #0f172a;
      background: rgb(15 23 42 / 0.18);
    }
    .quick-save-dialog {
      width: min(930px, calc(100vw - 28px));
      max-height: min(780px, calc(100vh - 28px));
      display: grid;
      overflow: auto;
      background: #ffffff;
      border: 1px solid #cfd8e8;
      border-radius: 8px;
    }
    .quick-save-header,
    .quick-save-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 22px;
    }
    .quick-save-header {
      border-bottom: 1px solid #dbe3f0;
    }
    .quick-save-footer {
      border-top: 1px solid #eef2f8;
    }
    h2, h3, h4, p { margin: 0; }
    h2 {
      font-size: 28px;
      line-height: 1.1;
      font-weight: 800;
      letter-spacing: 0;
    }
    h3, h4 {
      font-size: 14px;
      line-height: 1.3;
      font-weight: 800;
      letter-spacing: 0;
    }
    .quick-save-form {
      display: grid;
      gap: 22px;
      padding: 20px 22px 0;
    }
    .page-details-grid {
      display: grid;
      grid-template-columns: 210px minmax(0, 1fr);
      gap: 32px;
      align-items: start;
    }
    .preview-image {
      display: grid;
      width: 210px;
      aspect-ratio: 1 / 1;
      place-items: center;
      overflow: hidden;
      color: #64748b;
      font-size: 13px;
      font-weight: 700;
      background: #f7f7f8;
      border: 1px solid #cfd8e8;
      border-radius: 8px;
    }
    .preview-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .detail-fields {
      display: grid;
      gap: 15px;
    }
    label {
      display: grid;
      gap: 8px;
      color: #5b667a;
      font-size: 14px;
      font-weight: 800;
    }
    input,
    textarea {
      width: 100%;
      min-width: 0;
      color: #111827;
      background: #ffffff;
      border: 1px solid #cfd8e8;
      border-radius: 8px;
      font: inherit;
      font-size: 18px;
      font-weight: 650;
      line-height: 1.35;
      outline: 0;
    }
    input {
      height: 48px;
      padding: 0 16px;
    }
    input[readonly] {
      color: #5b667a;
      background: #f7f7f8;
      cursor: text;
    }
    textarea {
      min-height: 88px;
      resize: vertical;
      padding: 12px 16px;
    }
    input:focus,
    textarea:focus {
      border-color: #002fa7;
      box-shadow: 0 0 0 2px rgb(0 47 167 / 0.16);
    }
    .save-location-panel {
      display: grid;
      gap: 14px;
      padding: 14px;
      border: 1px solid #cfd8e8;
      border-radius: 8px;
    }
    .location-heading {
      display: grid;
      gap: 8px;
    }
    .location-heading p {
      color: #5b667a;
      font-size: 16px;
      font-weight: 700;
    }
    .location-heading span {
      margin-left: 8px;
      color: #002fa7;
      font-weight: 800;
    }
    .location-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.9fr);
      gap: 14px;
    }
    .location-search,
    .folder-browser {
      min-height: 356px;
      padding: 14px;
      border: 1px solid #dbe3f0;
      border-radius: 8px;
      background: #ffffff;
    }
    .location-search {
      display: grid;
      grid-template-rows: auto minmax(0, 1fr) auto;
      gap: 12px;
    }
    .search-box {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 44px;
      padding: 0 12px;
      border: 1px solid #002fa7;
      border-radius: 8px;
    }
    .search-box input {
      height: 42px;
      padding: 0;
      border: 0;
      font-size: 17px;
      font-weight: 600;
    }
    .search-box input:focus {
      box-shadow: none;
    }
    .search-box button {
      width: 30px;
      height: 30px;
      display: grid;
      place-items: center;
      padding: 0;
      color: #334155;
      background: transparent;
      border: 0;
      cursor: pointer;
    }
    .search-results,
    .recent-folders,
    .folder-browser {
      display: grid;
      gap: 10px;
      align-content: start;
    }
    .search-results {
      overflow: auto;
      padding-right: 4px;
      border-bottom: 1px solid #dbe3f0;
      padding-bottom: 10px;
    }
    .folder-result {
      display: grid;
      grid-template-columns: 36px minmax(0, 1fr) 24px;
      align-items: center;
      gap: 12px;
      width: 100%;
      min-height: 58px;
      padding: 8px 10px;
      color: #0f172a;
      text-align: left;
      background: #ffffff;
      border: 1px solid transparent;
      border-radius: 8px;
      cursor: pointer;
    }
    .folder-result:hover,
    .folder-result:focus-visible,
    .folder-result.is-selected {
      background: #f7f7f8;
      border-color: #e3e8f2;
      outline: 0;
    }
    .folder-result svg:first-child {
      width: 30px;
      height: 30px;
      color: #5b667a;
    }
    .folder-result svg.is-filled {
      color: #002fa7;
      fill: #002fa7;
    }
    .folder-result span {
      display: grid;
      gap: 3px;
      min-width: 0;
    }
    .folder-result strong,
    .recent-folders button span,
    .move-folder-button > .menu-action-label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .folder-result small,
    .empty-text {
      color: #64748b;
      font-size: 13px;
      font-weight: 600;
    }
    .check-icon {
      display: grid;
      width: 20px;
      height: 20px;
      color: #ffffff;
      background: #002fa7;
      border-radius: 999px;
      padding: 3px;
    }
    .recent-folders > div {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .recent-folders button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      max-width: 148px;
      height: 36px;
      padding: 0 12px;
      color: #0f172a;
      background: #ffffff;
      border: 1px solid #cfd8e8;
      border-radius: 7px;
      font: inherit;
      font-size: 13px;
      font-weight: 750;
      cursor: pointer;
    }
    .browser-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .folder-breadcrumb {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;
      min-height: 28px;
      color: #64748b;
      font-size: 13px;
      font-weight: 700;
    }
    .folder-breadcrumb span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .folder-breadcrumb button {
      padding: 0;
      color: inherit;
      background: transparent;
      border: 0;
      font: inherit;
      cursor: pointer;
    }
    .folder-breadcrumb button:hover,
    .folder-breadcrumb button:focus-visible {
      color: #002fa7;
      outline: 0;
    }
    .chevron-icon {
      width: 14px;
      height: 14px;
    }
    .browse-list {
      position: relative;
      min-height: 266px;
      overflow: visible;
    }
    .move-menu-list {
      display: grid;
      gap: 8px;
      width: 100%;
    }
    .move-folder-row {
      position: relative;
    }
    .move-folder-row.has-children::after {
      position: absolute;
      top: 0;
      right: -12px;
      bottom: 0;
      width: 14px;
      content: "";
    }
    .move-folder-button {
      display: grid;
      grid-template-columns: 20px minmax(0, 1fr) max-content;
      align-items: center;
      gap: 12px;
      width: 100%;
      min-height: 48px;
      padding: 0 12px;
      color: #0f172a;
      background: #ffffff;
      border: 1px solid transparent;
      border-radius: 8px;
      font: inherit;
      font-size: 15px;
      font-weight: 760;
      text-align: left;
      cursor: pointer;
    }
    .move-folder-button > .menu-action-icon-slot {
      justify-self: center;
    }
    .move-folder-button > .menu-action-label {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .move-folder-button:hover,
    .move-folder-button:focus-visible,
    .move-folder-row.is-selected > .move-folder-button {
      background: #f7f7f8;
      border-color: #e3e8f2;
      outline: 0;
    }
    .move-folder-button:hover .menu-action-icon-slot,
    .move-folder-button:focus-visible .menu-action-icon-slot,
    .move-folder-row.is-current-parent > button .menu-action-icon-slot,
    .move-folder-row.is-selected > button .menu-action-icon-slot,
    .move-folder-row.is-path-highlighted > button .menu-action-icon-slot {
      color: #002fa7;
    }
    .move-folder-button[aria-disabled="true"] {
      color: #94a3b8;
    }
    .move-folder-row.has-children > .move-folder-button[aria-disabled="true"] {
      cursor: pointer;
    }
    .menu-chevron {
      width: 9px;
      height: 9px;
      margin-left: auto;
      border-top: 1.5px solid currentColor;
      border-right: 1.5px solid currentColor;
      transform: rotate(45deg);
      flex: 0 0 auto;
    }
    .move-folder-row-trailing {
      display: inline-flex;
      align-items: center;
      justify-content: flex-end;
      justify-self: end;
      gap: 7px;
      min-width: max-content;
      color: #94a3b8;
    }
    .move-folder-row-trailing .menu-chevron {
      margin-left: 0;
      flex: 0 0 auto;
    }
    .move-menu-note {
      margin-left: 0;
      color: #94a3b8;
      font-size: 12px;
      font-weight: 800;
    }
    .context-submenu {
      position: fixed;
      min-width: 260px;
      max-width: 320px;
      overflow-x: hidden;
      overflow-y: visible;
      overscroll-behavior: contain;
      padding: 8px;
      visibility: hidden;
      pointer-events: none;
      background: #ffffff;
      border: 1px solid #cfd8e8;
      border-radius: 8px;
      opacity: 0;
    }
    .context-submenu.is-floating-cascade {
      visibility: visible;
      pointer-events: auto;
      opacity: 1;
    }
    .create-folder-link {
      min-height: 32px;
      padding: 0 10px;
      color: #002fa7;
      background: #ffffff;
      border: 1px solid #cfd8e8;
      border-radius: 7px;
      font: inherit;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
    }
    .create-folder-link.in-cascade {
      width: 100%;
      margin-top: 8px;
      text-align: left;
    }
    .create-folder-form {
      display: grid;
      grid-template-columns: minmax(120px, 1fr) auto auto;
      gap: 6px;
      align-items: center;
    }
    .create-folder-form.in-cascade {
      margin-top: 8px;
    }
    .create-folder-form input {
      height: 32px;
      padding: 0 8px;
      font-size: 13px;
      font-weight: 650;
    }
    button {
      font-family: inherit;
    }
    .secondary-button,
    .primary-button {
      min-height: 44px;
      padding: 0 18px;
      border-radius: 8px;
      font: inherit;
      font-size: 16px;
      font-weight: 800;
      cursor: pointer;
    }
    .secondary-button {
      color: #0f172a;
      background: #ffffff;
      border: 1px solid #cfd8e8;
    }
    .primary-button {
      color: #ffffff;
      background: #002fa7;
      border: 1px solid #002fa7;
    }
    .primary-button:disabled {
      cursor: default;
      opacity: 0.55;
    }
    .small {
      min-height: 32px;
      padding: 0 10px;
      font-size: 13px;
    }
    .status {
      min-height: 20px;
      color: #002fa7;
      font-size: 13px;
      font-weight: 750;
    }
    @media (max-width: 760px) {
      .quick-save-layer {
        padding: 10px;
      }
      .quick-save-header,
      .quick-save-footer,
      .quick-save-form {
        padding-left: 14px;
        padding-right: 14px;
      }
      .page-details-grid,
      .location-grid {
        grid-template-columns: 1fr;
      }
      .preview-image {
        width: 100%;
        aspect-ratio: 16 / 9;
      }
      .location-search,
      .folder-browser {
        min-height: auto;
      }
      .context-submenu {
        max-width: calc(100vw - 32px);
      }
    }
  `;

  return style;
}
