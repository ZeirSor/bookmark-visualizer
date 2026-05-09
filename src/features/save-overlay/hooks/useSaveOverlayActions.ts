import type { FormEvent } from "react";
import { getDisplayTitle, type BookmarkNode } from "../../bookmarks";
import { createQuickSaveBookmark, createQuickSaveFolder, type PopupPageDetails } from "../../popup";
import { normalizeRecentFolderIds } from "../../recent-folders";
import { saveSettings, type SettingsState } from "../../settings";
import {
  openOverlayExtensionPage,
  openOverlayShortcutSettings
} from "../client";
import type { SaveOverlayExtensionPage } from "../types";
import type { PopupStatusTone } from "../../../popup/components/PopupFooter";

const SAVE_CLOSE_DELAY_MS = 650;

export function useSaveOverlayActions({
  createParentFolderId,
  creatingState,
  folderName,
  note,
  onClose,
  pageDetails,
  selectedFolderId,
  selectedTitle,
  setCreateOpen,
  setCreateParentFolderId,
  setFolderName,
  setPopupStatus,
  setQuery,
  setRecentFolderIds,
  setSelectedFolderId,
  setSettings,
  setTree,
  settings,
  savingState,
  title
}: {
  settings: SettingsState;
  setSettings(settings: SettingsState): void;
  pageDetails?: PopupPageDetails;
  selectedFolderId: string;
  setSelectedFolderId(folderId: string): void;
  title: string;
  note: string;
  selectedTitle: string;
  folderName: string;
  createParentFolderId?: string;
  setRecentFolderIds(updater: (current: string[]) => string[]): void;
  setTree(tree: BookmarkNode[]): void;
  setFolderName(name: string): void;
  setCreateOpen(open: boolean): void;
  setCreateParentFolderId(folderId: string | undefined): void;
  setQuery(query: string): void;
  savingState: [boolean, (saving: boolean) => void];
  creatingState: [boolean, (creating: boolean) => void];
  setPopupStatus(message: string, tone: PopupStatusTone): void;
  onClose(): void;
}) {
  const [, setSaving] = savingState;
  const [, setCreatingFolder] = creatingState;

  async function updateSettings(patch: Partial<SettingsState>) {
    const nextSettings = await saveSettings({
      ...settings,
      ...patch
    });
    setSettings(nextSettings);
  }

  async function updateDefaultFolder(folderId: string) {
    setSelectedFolderId(folderId);
    await updateSettings({ popupDefaultFolderId: folderId });
  }

  async function save(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (!pageDetails?.canSave) {
      setPopupStatus("当前页面不支持保存。", "error");
      return;
    }

    if (!selectedFolderId) {
      setPopupStatus("请选择保存位置。", "error");
      return;
    }

    setSaving(true);
    setPopupStatus("", "idle");
    try {
      await createQuickSaveBookmark({
        parentId: selectedFolderId,
        title,
        url: pageDetails.url,
        note,
        previewImageUrl: pageDetails.previewImageUrl,
        pageKind: pageDetails.pageKind,
        sourceUrl: pageDetails.sourceUrl
      });
      setRecentFolderIds((current) => normalizeRecentFolderIds([selectedFolderId, ...current]));
      setPopupStatus(
        settings.popupShowSuccessToast ? `已保存到 ${selectedTitle || "当前文件夹"}。` : "",
        settings.popupShowSuccessToast ? "success" : "idle"
      );

      if (settings.popupAutoCloseAfterSave) {
        window.setTimeout(onClose, SAVE_CLOSE_DELAY_MS);
      }
    } catch (cause) {
      setPopupStatus(cause instanceof Error ? cause.message : "保存失败。", "error");
    } finally {
      setSaving(false);
    }
  }

  async function createFolder() {
    const normalizedName = folderName.trim();
    const parentId = createParentFolderId ?? selectedFolderId;
    if (!normalizedName || !parentId) {
      setPopupStatus("请输入文件夹名称。", "error");
      return;
    }

    setCreatingFolder(true);
    try {
      const response = await createQuickSaveFolder({
        parentId,
        title: normalizedName
      });
      setTree(response.state.tree);
      setRecentFolderIds(() => response.state.recentFolderIds);
      setSelectedFolderId(response.folder.id);
      setFolderName("");
      setCreateOpen(false);
      setCreateParentFolderId(undefined);
      setQuery("");
      setPopupStatus(`已新建 ${getDisplayTitle(response.folder)}。`, "success");
    } catch (cause) {
      setPopupStatus(cause instanceof Error ? cause.message : "新建文件夹失败。", "error");
    } finally {
      setCreatingFolder(false);
    }
  }

  async function openWorkspace(path: SaveOverlayExtensionPage = "index.html") {
    try {
      await openOverlayExtensionPage(path);
      onClose();
    } catch (cause) {
      setPopupStatus(cause instanceof Error ? cause.message : "无法打开完整管理页。", "error");
    }
  }

  async function openShortcutSettings() {
    try {
      await openOverlayShortcutSettings();
      onClose();
    } catch (cause) {
      setPopupStatus(cause instanceof Error ? cause.message : "无法打开快捷键设置。", "error");
    }
  }

  return {
    updateSettings,
    updateDefaultFolder,
    save,
    createFolder,
    openWorkspace,
    openShortcutSettings
  };
}
