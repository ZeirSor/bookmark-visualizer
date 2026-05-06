import type { BookmarkRecord, FolderRecord } from "../../domain";
import {
  BOOKMARK_VISUALIZER_EXPORT_SCHEMA_VERSION,
  createEmptyImportPlan,
  type ImportPlan,
  type ImportPlanContext,
  type VersionedBookmarkExport
} from "./schema";

export function createJsonImportPlan(
  jsonText: string,
  context: ImportPlanContext = {}
): ImportPlan {
  const plan = createEmptyImportPlan("json");
  const parsed = parseJson(jsonText);

  if (!parsed.ok) {
    plan.invalidRecords.push({ row: 0, reason: parsed.reason });
    return plan;
  }

  const value = parsed.value;
  if (!isRecord(value)) {
    plan.invalidRecords.push({ row: 0, reason: "JSON root must be an object.", value });
    return plan;
  }

  if (value.schemaVersion !== BOOKMARK_VISUALIZER_EXPORT_SCHEMA_VERSION) {
    plan.conflicts.push({
      type: "unsupported-schema",
      message: `Unsupported schemaVersion: ${String(value.schemaVersion)}.`
    });
    return plan;
  }

  const exportData = value as Partial<VersionedBookmarkExport>;
  const bookmarks = Array.isArray(exportData.bookmarks) ? exportData.bookmarks : [];
  const folders = Array.isArray(exportData.folders) ? exportData.folders : [];

  plan.foldersToCreate.push(...collectFoldersToCreate(folders, context.existingFolders ?? []));
  collectBookmarkActions(bookmarks, context, plan);

  return plan;
}

function collectFoldersToCreate(
  folders: unknown[],
  existingFolders: FolderRecord[]
): FolderRecord[] {
  const existingKeys = new Set(existingFolders.flatMap((folder) => [folder.id, folder.path ?? ""]));

  return folders.filter(isFolderRecord).filter((folder) => {
    const keys = [folder.id, folder.path ?? ""].filter(Boolean);
    return keys.every((key) => !existingKeys.has(key));
  });
}

function collectBookmarkActions(
  bookmarks: unknown[],
  context: ImportPlanContext,
  plan: ImportPlan
) {
  const seenUrls = new Set<string>();
  const existingByUrl = new Map(
    (context.existingBookmarks ?? []).map((bookmark) => [bookmark.url, bookmark])
  );

  bookmarks.forEach((bookmark, index) => {
    if (!isBookmarkRecord(bookmark)) {
      plan.invalidRecords.push({
        row: index + 1,
        reason: "Bookmark record must include a title and valid url.",
        value: bookmark
      });
      return;
    }

    if (seenUrls.has(bookmark.url)) {
      plan.conflicts.push({
        type: "duplicate-url",
        message: `Duplicate URL in import: ${bookmark.url}`,
        recordId: bookmark.id,
        url: bookmark.url
      });
      return;
    }

    seenUrls.add(bookmark.url);
    if (existingByUrl.has(bookmark.url)) {
      plan.bookmarksToUpdate.push(bookmark);
      plan.conflicts.push({
        type: "existing-url",
        message: `URL already exists locally: ${bookmark.url}`,
        recordId: bookmark.id,
        url: bookmark.url
      });
      return;
    }

    plan.bookmarksToCreate.push(bookmark);
  });
}

function parseJson(text: string): { ok: true; value: unknown } | { ok: false; reason: string } {
  try {
    return { ok: true, value: JSON.parse(text) as unknown };
  } catch (cause) {
    return {
      ok: false,
      reason: cause instanceof Error ? cause.message : "Unable to parse JSON."
    };
  }
}

function isBookmarkRecord(value: unknown): value is BookmarkRecord {
  return (
    isRecord(value) &&
    value.type === "bookmark" &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    value.title.trim().length > 0 &&
    typeof value.url === "string" &&
    isValidUrl(value.url) &&
    Array.isArray(value.tagIds)
  );
}

function isFolderRecord(value: unknown): value is FolderRecord {
  return isRecord(value) && typeof value.id === "string" && typeof value.title === "string";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
