import type { CSSProperties } from "react";
import { useSiteFavicon, type FaviconSize } from "../features/favicon";

type SiteFaviconFallback =
  | string
  | {
      kind: "brand" | "letter" | "image";
      value: string;
      background?: string;
    };

interface SiteFaviconProps {
  url: string;
  title?: string;
  size?: FaviconSize;
  className?: string;
  fallback?: SiteFaviconFallback;
}

export function SiteFavicon({ url, title, size = 32, className, fallback }: SiteFaviconProps) {
  const favicon = useSiteFavicon({ url, size });
  const fallbackImage = typeof fallback === "object" && fallback.kind === "image" ? fallback.value : undefined;
  const imageUrl = favicon.imageUrl ?? fallbackImage;
  const fallbackBackground = typeof fallback === "object" ? fallback.background : undefined;
  const classes = ["site-favicon", `site-favicon-${size}`, className].filter(Boolean).join(" ");

  return (
    <span className={classes} aria-hidden="true">
      {imageUrl ? (
        <img src={imageUrl} alt="" loading="lazy" />
      ) : (
        <span
          className="site-favicon-fallback"
          style={fallbackBackground ? ({ "--site-favicon-fallback-bg": fallbackBackground } as CSSProperties) : undefined}
        >
          {getFallbackLabel({ fallback, title, url })}
        </span>
      )}
    </span>
  );
}

function getFallbackLabel({
  fallback,
  title,
  url
}: {
  fallback?: SiteFaviconFallback;
  title?: string;
  url: string;
}): string {
  if (typeof fallback === "string" && fallback.trim()) {
    return fallback.trim().slice(0, 2).toLocaleUpperCase();
  }

  if (typeof fallback === "object" && fallback.kind !== "image" && fallback.value.trim()) {
    return fallback.value.trim().slice(0, 2).toLocaleUpperCase();
  }

  const source = title?.trim() || getHostname(url) || url;
  return (source.trim()[0] || "?").toLocaleUpperCase();
}

function getHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
