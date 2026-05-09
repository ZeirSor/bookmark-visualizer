import { useEffect, useState } from "react";
import {
  findNodeById,
  type BookmarkNode
} from "../../features/bookmarks";
import {
  getCurrentTabDetails,
  loadQuickSaveInitialState,
  selectInitialPopupFolderId,
  type SaveSourceParams,
  type PopupPageDetails
} from "../../features/popup";
import type { QuickSaveInitialState } from "../../features/quick-save";
import {
  defaultSettings,
  loadSettings,
  type SettingsState
} from "../../features/settings";
import type { PopupStatusTone } from "../components/PopupFooter";

export type PopupTab = "save" | "manage" | "settings";

export interface UsePopupBootstrapOptions {
  sourceParams?: SaveSourceParams;
}

export function usePopupBootstrap(options: UsePopupBootstrapOptions = {}) {
  const [activeTab, setActiveTab] = useState<PopupTab>(defaultSettings.popupDefaultOpenTab);
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [pageDetails, setPageDetails] = useState<PopupPageDetails>();
  const [tree, setTree] = useState<BookmarkNode[]>([]);
  const [recentFolderIds, setRecentFolderIds] = useState<string[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("");
  const [statusTone, setStatusTone] = useState<PopupStatusTone>("idle");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [details, initialState, storedSettings] = await Promise.all([
          getCurrentTabDetails(options.sourceParams),
          loadQuickSaveInitialState(),
          loadSettings()
        ]);

        if (cancelled) {
          return;
        }

        setPageDetails(details);
        setSettings(storedSettings);
        setActiveTab(storedSettings.popupDefaultOpenTab);
        setTitle(details.title);
        applyInitialState(initialState, storedSettings);
        setPopupStatus(
          details.canSave ? "" : details.error ?? "当前页面不支持保存。",
          details.canSave ? "idle" : "error"
        );
      } catch (cause) {
        if (!cancelled) {
          setPopupStatus(cause instanceof Error ? cause.message : "无法初始化 Popup。", "error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [options.sourceParams]);

  function applyInitialState(state: QuickSaveInitialState, storedSettings: SettingsState) {
    setTree(state.tree);
    setRecentFolderIds(state.recentFolderIds);
    const initialFolderId = selectInitialPopupFolderId({
      tree: state.tree,
      recentFolderIds: state.recentFolderIds,
      rememberLastFolder: storedSettings.popupRememberLastFolder,
      popupDefaultFolderId: storedSettings.popupDefaultFolderId,
      fallbackFolderId: state.defaultFolderId
    });

    if (initialFolderId && findNodeById(state.tree, initialFolderId)) {
      setSelectedFolderId(initialFolderId);
    }
  }

  function setPopupStatus(message: string, tone: PopupStatusTone) {
    setStatus(message);
    setStatusTone(message.trim() ? tone : "idle");
  }

  return {
    activeTab,
    setActiveTab,
    settings,
    setSettings,
    pageDetails,
    tree,
    setTree,
    recentFolderIds,
    setRecentFolderIds,
    selectedFolderId,
    setSelectedFolderId,
    title,
    setTitle,
    status,
    statusTone,
    setPopupStatus,
    loading
  };
}
