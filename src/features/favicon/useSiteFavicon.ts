import { useEffect, useState } from "react";
import { resolveFavicon } from "./faviconResolver";
import type { FaviconResolveResult, FaviconSize } from "./types";

export interface UseSiteFaviconOptions {
  url: string;
  size?: FaviconSize;
}

export interface UseSiteFaviconResult {
  imageUrl?: string;
  status: FaviconResolveResult["status"] | "idle" | "loading";
  source?: FaviconResolveResult["source"];
}

export function useSiteFavicon({ url, size = 32 }: UseSiteFaviconOptions): UseSiteFaviconResult {
  const [result, setResult] = useState<UseSiteFaviconResult>({ status: url ? "loading" : "idle" });

  useEffect(() => {
    let isMounted = true;

    if (!url) {
      setResult({ status: "idle" });
      return () => {
        isMounted = false;
      };
    }

    setResult({ status: "loading" });

    void resolveFavicon(url, { size }).then((next) => {
      if (!isMounted) {
        return;
      }

      setResult({
        imageUrl: next.url,
        status: next.status,
        source: next.source
      });
    });

    return () => {
      isMounted = false;
    };
  }, [size, url]);

  return result;
}
