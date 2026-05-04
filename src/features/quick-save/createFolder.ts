export interface QuickSaveCreateFolderPayload {
  parentId: string;
  title: string;
}

export function normalizeQuickSaveFolderTitle(title: string): string {
  const normalized = title.trim();

  if (!normalized) {
    throw new Error("文件夹名称不能为空。");
  }

  return normalized;
}
