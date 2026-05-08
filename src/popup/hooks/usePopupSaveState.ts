import { useState } from "react";

export function usePopupSaveState() {
  const [note, setNote] = useState("");
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [createParentFolderId, setCreateParentFolderId] = useState<string | undefined>();

  return {
    note,
    setNote,
    query,
    setQuery,
    saving,
    setSaving,
    creatingFolder,
    setCreatingFolder,
    previewFailed,
    setPreviewFailed,
    createOpen,
    setCreateOpen,
    folderName,
    setFolderName,
    createParentFolderId,
    setCreateParentFolderId
  };
}
