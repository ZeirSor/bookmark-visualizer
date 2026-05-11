import { Button } from "../../design-system";
import { CheckIcon } from "./PopupIcons";

export type PopupStatusTone = "idle" | "info" | "success" | "error";

export function PopupFooter({
  canSave,
  formId,
  saving,
  selectedTitle,
  status,
  statusTone
}: {
  canSave: boolean;
  formId: string;
  saving: boolean;
  selectedTitle: string;
  status: string;
  statusTone: PopupStatusTone;
}) {
  const trimmedStatus = status.trim();
  const isSuccess = statusTone === "success";
  const isError = statusTone === "error";

  return (
    <footer className="popup-footer">
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
        <Button
          type="button"
          variant="secondary"
          size="lg"
          className="secondary-action"
          onClick={() => window.close()}
        >
          取消
        </Button>
        <Button
          type="submit"
          form={formId}
          variant="primary"
          size="lg"
          className="primary-action"
          disabled={!canSave}
          loading={saving}
        >
          {saving ? "保存中..." : selectedTitle ? `保存到 ${selectedTitle}` : "保存"}
        </Button>
      </div>
    </footer>
  );
}
