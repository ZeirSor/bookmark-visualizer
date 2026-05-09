import { CheckIcon } from "../../../popup/components/PopupIcons";
import type { PopupStatusTone } from "../../../popup/components/PopupFooter";

export function SaveOverlayFooter({
  canSave,
  formId,
  saving,
  selectedTitle,
  status,
  statusTone,
  onClose
}: {
  canSave: boolean;
  formId: string;
  saving: boolean;
  selectedTitle: string;
  status: string;
  statusTone: PopupStatusTone;
  onClose(): void;
}) {
  const trimmedStatus = status.trim();
  const isSuccess = statusTone === "success";
  const isError = statusTone === "error";

  return (
    <footer className="popup-footer save-overlay-footer">
      <div
        className={`status-line ${isError ? "is-error" : ""} ${isSuccess ? "is-success" : ""}`}
        aria-live="polite"
      >
        {trimmedStatus ? (
          <>
            {isSuccess ? <CheckIcon /> : null}
            <span>{status}</span>
          </>
        ) : (
          <span>快捷键：Ctrl+Shift+S</span>
        )}
      </div>
      <div className="footer-actions">
        <button type="button" className="secondary-action" onClick={onClose}>
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
