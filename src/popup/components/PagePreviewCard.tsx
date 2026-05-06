import { isLargePreviewImage, type PopupPageDetails } from "../../features/popup";

export function PagePreviewCard({
  details,
  previewFailed,
  setPreviewFailed,
  title
}: {
  details?: PopupPageDetails;
  previewFailed: boolean;
  setPreviewFailed(value: boolean): void;
  title: string;
}) {
  const canUseImage = isLargePreviewImage(details?.previewImageUrl, details?.faviconUrl) && !previewFailed;
  const domain = details?.domain || "Bookmark Visualizer";
  const fallbackTitle = title.trim() || details?.title || "Untitled bookmark";

  return (
    <div className={`page-preview ${canUseImage ? "has-image" : "is-fallback"}`}>
      {canUseImage ? (
        <img src={details?.previewImageUrl} alt="" onError={() => setPreviewFailed(true)} />
      ) : (
        <div className="page-preview-fallback">
          <span className="preview-domain">{domain}</span>
          <strong>{fallbackTitle}</strong>
          <small>{details?.url || "当前网页"}</small>
        </div>
      )}
    </div>
  );
}
