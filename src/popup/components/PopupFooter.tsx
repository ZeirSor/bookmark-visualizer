import { CheckIcon } from "./PopupIcons";

export function PopupFooter({
  canSave,
  formId,
  isError,
  saving,
  selectedTitle,
  status
}: {
  canSave: boolean;
  formId: string;
  isError: boolean;
  saving: boolean;
  selectedTitle: string;
  status: string;
}) {
  return (
    <footer className="popup-footer">
      <div className={`status-line ${isError ? "is-error" : ""}`} aria-live="polite">
        {status ? (
          status
        ) : (
          <>
            <CheckIcon />
            <span>快捷键：Ctrl+Shift+S</span>
          </>
        )}
      </div>
      <div className="footer-actions">
        <button type="button" className="secondary-action" onClick={() => window.close()}>
          取消
        </button>
        <button
          type="submit"
          form={formId}
          className="primary-action"
          disabled={saving || !canSave}
        >
          {saving ? "保存中..." : selectedTitle ? `保存到 ${selectedTitle}` : "保存"}
        </button>
      </div>
    </footer>
  );
}
