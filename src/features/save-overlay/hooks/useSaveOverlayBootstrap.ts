import { useEffect, useState } from "react";
import { findNodeById, type BookmarkNode } from "../../bookmarks";
import {
  loadQuickSaveInitialState,
  selectInitialPopupFolderId,
  type PopupPageDetails
} from "../../popup";
import type { QuickSaveInitialState } from "../../quick-save";
import { defaultSettings, loadSettings, type SettingsState } from "../../settings";
import type { PopupStatusTone } from "../../../popup/components/PopupFooter";

export type SaveOverlayTabId = "save" | "manage" | "settings";

export function useSaveOverlayBootstrap(pageDetails: PopupPageDetails) {
  const [activeTab, setActiveTab] = useState<SaveOverlayTabId>(
    defaultSettings.popupDefaultOpenTab
  );
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [tree, setTree] = useState<BookmarkNode[]>([]);
  const [recentFolderIds, setRecentFolderIds] = useState<string[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [title, setTitle] = useState(pageDetails.title);
  const [status, setStatus] = useState("");
  const [statusTone, setStatusTone] = useState<PopupStatusTone>("idle");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [initialState, storedSettings] = await Promise.all([
          loadQuickSaveInitialState(),
          loadSettings()
        ]);

        if (cancelled) {
          return;
        }

        setSettings(storedSettings);
        setActiveTab(storedSettings.popupDefaultOpenTab);
        setTitle(pageDetails.title);
        applyInitialState(initialState, storedSettings);
        setPopupStatus(
          pageDetails.canSave ? "" : pageDetails.error ?? "当前页面不支持保存。",
          pageDetails.canSave ? "idle" : "error"
        );
      } catch (cause) {
        if (!cancelled) {
          setPopupStatus(cause instanceof Error ? cause.message : "无法初始化保存浮层。", "error");
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
  }, [pageDetails.canSave, pageDetails.error, pageDetails.title]);

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
