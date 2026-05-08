import { useEffect, useState } from "react";
import {
  loadRecentFolderState,
  saveRecentFolder
} from "../../../features/recent-folders";

export function useRecentFolders() {
  const [recentFolderIds, setRecentFolderIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadRecentFolders() {
      try {
        const state = await loadRecentFolderState();
        if (!cancelled) {
          setRecentFolderIds(state.folderIds);
        }
      } catch {
        // 最近文件夹只是辅助 UI，读取失败不阻塞主界面。
      }
    }

    void loadRecentFolders();

    return () => {
      cancelled = true;
    };
  }, []);

  async function rememberRecentFolder(folderId: string) {
    try {
      const state = await saveRecentFolder(folderId);
      setRecentFolderIds(state.folderIds);
    } catch {
      // 最近文件夹写入失败不影响书签移动结果。
    }
  }

  return {
    recentFolderIds,
    rememberRecentFolder
  };
}
