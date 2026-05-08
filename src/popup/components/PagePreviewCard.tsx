import {
  isLargePreviewImage,
  shouldContainPreviewImage,
  type PopupPageDetails
} from "../../features/popup";

export function PagePreviewCard({
  details,
  loading,
  previewFailed,
  setPreviewFailed,
  title
}: {
  details?: PopupPageDetails;
  loading: boolean;
  previewFailed: boolean;
  setPreviewFailed(value: boolean): void;
  title: string;
}) {
  if (loading && !details) {
    return (
      <div className="page-preview is-loading" aria-label="正在读取当前网页预览">
        <div className="page-preview-skeleton" aria-hidden="true">
          <span />
          <strong />
          <small />
          <small />
          <i />
        </div>
      </div>
    );
  }

  const shouldContainImage = shouldContainPreviewImage(
    details?.previewImageUrl,
    details?.faviconUrl
  );
  const canUseImage =
    (isLargePreviewImage(details?.previewImageUrl, details?.faviconUrl) || shouldContainImage) &&
    !previewFailed;
  const imageFitClass = shouldContainImage ? "uses-contain-image" : "uses-cover-image";
  const domain = details?.domain || "Bookmark Visualizer";
  const fallbackTitle = title.trim() || details?.title || "Untitled bookmark";

  return (
    <div
      className={`page-preview ${
        canUseImage ? `has-image ${imageFitClass}` : "is-fallback"
      }`}
    >
      {canUseImage ? (
        <>
          <img src={details?.previewImageUrl} alt="" onError={() => setPreviewFailed(true)} />
          <div className="page-preview-image-meta">
            <span className="preview-domain">{domain}</span>
            <strong>{fallbackTitle}</strong>
            <small>{details?.url || "当前网页"}</small>
          </div>
        </>
      ) : (
        <div className="page-preview-fallback is-article">
          <div className="preview-card-topline">
            <span className="preview-domain">{domain}</span>
            <span className="preview-date">当前页面</span>
          </div>
          <strong>{fallbackTitle}</strong>
          <small>{details?.url || "当前网页"}</small>
          <div className="preview-copy-lines" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>
      )}
    </div>
  );
}
