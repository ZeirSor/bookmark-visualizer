import { useEffect, useRef, useState } from "react";
import type { OperationLogEntry, ToastState } from "../types";
import { getErrorMessage } from "../helpers";

export function useOperationLog({
  setToast
}: {
  setToast(toast: ToastState): void;
}) {
  const [operationLogOpen, setOperationLogOpen] = useState(false);
  const [operationLog, setOperationLog] = useState<OperationLogEntry[]>([]);
  const operationLogRef = useRef<OperationLogEntry[]>([]);

  useEffect(() => {
    operationLogRef.current = operationLog;
  }, [operationLog]);

  function addOperation(operation: Omit<OperationLogEntry, "id" | "createdAt" | "status">): string {
    const id = crypto.randomUUID();
    const entry: OperationLogEntry = {
      id,
      createdAt: Date.now(),
      status: "ready",
      ...operation
    };

    operationLogRef.current = [entry, ...operationLogRef.current];
    setOperationLog(operationLogRef.current);

    return id;
  }

  async function undoOperation(id: string) {
    const entry = operationLogRef.current.find((item) => item.id === id);

    if (!entry?.undo || entry.status !== "ready") {
      return;
    }

    try {
      await entry.undo();
      operationLogRef.current = operationLogRef.current.map((item) =>
        item.id === id ? { ...item, status: "undone" } : item
      );
      setOperationLog(operationLogRef.current);
      setToast({ message: "已撤回该操作。" });
    } catch (cause) {
      operationLogRef.current = operationLogRef.current.map((item) =>
        item.id === id ? { ...item, status: "failed" } : item
      );
      setOperationLog(operationLogRef.current);
      setToast({ message: getErrorMessage(cause, "撤回失败。") });
    }
  }

  return {
    operationLogOpen,
    setOperationLogOpen,
    operationLog,
    addOperation,
    undoOperation
  };
}
