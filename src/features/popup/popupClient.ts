import type {
  QuickSaveCreatePayload,
  QuickSaveInitialState,
  QuickSaveRequest,
  QuickSaveResponse
} from "../quick-save";
import {
  QUICK_SAVE_CREATE_BOOKMARK,
  QUICK_SAVE_CREATE_FOLDER,
  QUICK_SAVE_GET_INITIAL_STATE
} from "../quick-save";
import type { QuickSaveCreateFolderPayload } from "../quick-save/createFolder";
import {
  isPopupSaveableUrl,
  normalizePopupPageDetails,
  type PopupExtractedPageDetails,
  type PopupPageDetails
} from "./tabDetails";

export async function getCurrentTabDetails(): Promise<PopupPageDetails> {
  if (!canUseChromeTabs()) {
    return normalizePopupPageDetails({
      title: "Bookmark Visualizer",
      url: "https://example.com/",
      favIconUrl: undefined
    });
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let extracted: PopupExtractedPageDetails | undefined;

  if (tab?.id && isPopupSaveableUrl(tab.url) && chrome.scripting?.executeScript) {
    try {
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractPopupPageDetailsFromPage
      });
      extracted = result?.result;
    } catch {
      extracted = undefined;
    }
  }

  return normalizePopupPageDetails(tab, extracted);
}

export async function loadQuickSaveInitialState(): Promise<QuickSaveInitialState> {
  const response = await sendQuickSaveRequest({ type: QUICK_SAVE_GET_INITIAL_STATE });
  if (!response.ok || !("state" in response)) {
    throw new Error(response.ok ? "无法读取保存位置。" : response.error);
  }

  return response.state;
}

export async function createQuickSaveBookmark(payload: QuickSaveCreatePayload): Promise<string> {
  const response = await sendQuickSaveRequest({
    type: QUICK_SAVE_CREATE_BOOKMARK,
    payload
  });

  if (!response.ok || !("bookmarkId" in response)) {
    throw new Error(response.ok ? "保存失败。" : response.error);
  }

  return response.bookmarkId;
}

export async function createQuickSaveFolder(
  payload: QuickSaveCreateFolderPayload
): Promise<Extract<QuickSaveResponse, { ok: true; folder: unknown }>> {
  const response = await sendQuickSaveRequest({
    type: QUICK_SAVE_CREATE_FOLDER,
    payload
  });

  if (!response.ok || !("folder" in response)) {
    throw new Error(response.ok ? "新建文件夹失败。" : response.error);
  }

  return response;
}

export async function openWorkspace(path = "index.html"): Promise<void> {
  if (typeof chrome !== "undefined" && chrome.tabs?.create && chrome.runtime?.getURL) {
    await chrome.tabs.create({ url: chrome.runtime.getURL(path) });
    window.close();
    return;
  }

  window.open(path, "_blank", "noopener,noreferrer");
}

async function sendQuickSaveRequest(message: QuickSaveRequest): Promise<QuickSaveResponse> {
  if (typeof chrome === "undefined" || !chrome.runtime?.sendMessage) {
    return { ok: false, error: "当前环境不支持扩展消息。" };
  }

  return (await chrome.runtime.sendMessage(message)) as QuickSaveResponse;
}

function canUseChromeTabs(): boolean {
  return typeof chrome !== "undefined" && Boolean(chrome.tabs?.query);
}

function extractPopupPageDetailsFromPage(): PopupExtractedPageDetails {
  const readMeta = (selector: string) =>
    document.querySelector<HTMLMetaElement>(selector)?.content?.trim() ?? "";
  const absolutize = (value: string) => {
    if (!value) {
      return "";
    }

    try {
      return new URL(value, location.href).href;
    } catch {
      return "";
    }
  };
  const firstImage = Array.from(document.images).find((image) => {
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    return Boolean(image.currentSrc || image.src) && width >= 80 && height >= 80;
  });
  const favicon =
    document.querySelector<HTMLLinkElement>('link[rel~="icon"]')?.href?.trim() ||
    document.querySelector<HTMLLinkElement>('link[rel="shortcut icon"]')?.href?.trim() ||
    "";

  return {
    url: location.href,
    title:
      readMeta('meta[property="og:title"]') ||
      readMeta('meta[name="twitter:title"]') ||
      document.title ||
      location.hostname,
    previewImageUrl:
      absolutize(
        readMeta('meta[property="og:image"]') ||
          readMeta('meta[name="twitter:image"]') ||
          favicon ||
          firstImage?.currentSrc ||
          firstImage?.src ||
          ""
      ) || undefined
  };
}
