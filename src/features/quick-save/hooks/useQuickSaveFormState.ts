import { useRef, useState, type FormEvent } from "react";
import {
  QUICK_SAVE_CREATE_BOOKMARK,
  type QuickSaveCreatePayload,
  type QuickSavePageDetails
} from "../types";
import { sendQuickSaveMessage } from "../quickSaveClient";

const CLOSE_AFTER_SAVE_MS = 700;

export function useQuickSaveFormState({
  pageDetails,
  selectedFolderId,
  selectedFolderTitle,
  setStatus,
  onClose
}: {
  pageDetails: QuickSavePageDetails;
  selectedFolderId: string;
  selectedFolderTitle: string;
  setStatus(status: string): void;
  onClose(): void;
}) {
  const [title, setTitle] = useState(pageDetails.title);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  async function save() {
    if (saving) {
      return;
    }

    if (!selectedFolderId) {
      setStatus("请选择保存位置。");
      return;
    }

    const payload: QuickSaveCreatePayload = {
      parentId: selectedFolderId,
      title,
      url: pageDetails.url,
      note,
      previewImageUrl: pageDetails.previewImageUrl
    };

    setSaving(true);
    setStatus("");
    const response = await sendQuickSaveMessage({ type: QUICK_SAVE_CREATE_BOOKMARK, payload });

    if (!response.ok) {
      setSaving(false);
      setStatus(response.error);
      return;
    }

    setStatus(`已保存到 ${selectedFolderTitle}。`);
    window.setTimeout(onClose, CLOSE_AFTER_SAVE_MS);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void save();
  }

  return {
    title,
    setTitle,
    note,
    setNote,
    saving,
    previewFailed,
    setPreviewFailed,
    titleInputRef,
    save,
    handleSubmit
  };
}
