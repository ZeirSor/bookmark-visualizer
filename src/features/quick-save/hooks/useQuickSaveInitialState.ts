import { useEffect, useState } from "react";
import { QUICK_SAVE_GET_INITIAL_STATE, type QuickSaveInitialState } from "../types";
import { sendQuickSaveMessage } from "../quickSaveClient";

export function useQuickSaveInitialState({
  onApplyInitialState,
  onReady
}: {
  onApplyInitialState(state: QuickSaveInitialState): void;
  onReady(): void;
}) {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadInitialState() {
      const response = await sendQuickSaveMessage({ type: QUICK_SAVE_GET_INITIAL_STATE });
      if (cancelled) {
        return;
      }

      if (!response.ok || !("state" in response)) {
        setStatus(response.ok ? "无法读取文件夹。" : response.error);
        setLoading(false);
        return;
      }

      onApplyInitialState(response.state);
      setLoading(false);
      onReady();
    }

    void loadInitialState();
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    loading,
    status,
    setStatus
  };
}
