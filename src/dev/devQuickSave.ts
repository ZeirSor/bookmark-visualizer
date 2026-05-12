import { handleQuickSaveMessage } from "../background/quickSaveHandlers";
import type { QuickSaveRequest, QuickSaveResponse } from "../features/quick-save";
import { loadDevState } from "./devState";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function handleDevQuickSaveMessage(
  message: QuickSaveRequest
): Promise<QuickSaveResponse> {
  const state = loadDevState();

  if (state.behaviorScenario === "saveFailure") {
    return { ok: false, error: "（Dev mock）保存失败：书签 API 返回错误。" };
  }

  if (state.behaviorScenario === "bookmarkReadFailure") {
    return { ok: false, error: "（Dev mock）读取书签数据失败。" };
  }

  if (state.behaviorScenario === "permissionMissing") {
    return { ok: false, error: "（Dev mock）权限缺失，无法操作书签。" };
  }

  if (state.behaviorScenario === "delay500") {
    await delay(500);
  } else if (state.behaviorScenario === "delay1500") {
    await delay(1500);
  }

  return handleQuickSaveMessage(message);
}
