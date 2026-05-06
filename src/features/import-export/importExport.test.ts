import { describe, expect, it } from "vitest";
import type { BookmarkRecord, BookmarkTableRow, FolderRecord } from "../../domain";
import { exportBookmarkRowsToCsv } from "./exportCsv";
import { buildVersionedJsonExport } from "./exportJson";
import { createCsvImportPlan } from "./importCsv";
import { createJsonImportPlan } from "./importJson";
import {
  BOOKMARK_VISUALIZER_EXPORT_APP,
  BOOKMARK_VISUALIZER_EXPORT_SCHEMA_VERSION
} from "./schema";

const now = "2026-05-06T00:00:00.000Z";

describe("versioned JSON import/export", () => {
  it("builds the project-owned versioned JSON export shape", () => {
    const exportData = buildVersionedJsonExport({
      folders: [folder("import:folder:research", "Research")],
      bookmarks: [bookmark("import:bookmark:example", "Example", "https://example.com")],
      exportedAt: now
    });

    expect(exportData).toMatchObject({
      schemaVersion: BOOKMARK_VISUALIZER_EXPORT_SCHEMA_VERSION,
      exportedAt: now,
      app: BOOKMARK_VISUALIZER_EXPORT_APP
    });
    expect(exportData.bookmarks).toHaveLength(1);
    expect(exportData.tags).toEqual([]);
    expect(exportData.activities).toEqual([]);
    expect(exportData.externalMappings).toEqual([]);
  });

  it("creates a non-mutating JSON dry-run plan with creates, updates, and duplicate warnings", () => {
    const importData = buildVersionedJsonExport({
      folders: [folder("import:folder:research", "Research")],
      bookmarks: [
        bookmark("import:bookmark:new", "New", "https://new.example.com"),
        bookmark("import:bookmark:existing", "Existing", "https://existing.example.com"),
        bookmark("import:bookmark:duplicate", "Duplicate", "https://new.example.com"),
        { ...bookmark("import:bookmark:invalid", "", "https://invalid.example.com"), title: "" }
      ],
      exportedAt: now
    });

    const plan = createJsonImportPlan(JSON.stringify(importData), {
      existingBookmarks: [bookmark("browser:100", "Existing Local", "https://existing.example.com")],
      now
    });

    expect(plan.bookmarksToCreate.map((record) => record.id)).toEqual(["import:bookmark:new"]);
    expect(plan.bookmarksToUpdate.map((record) => record.id)).toEqual([
      "import:bookmark:existing"
    ]);
    expect(plan.foldersToCreate.map((record) => record.id)).toEqual(["import:folder:research"]);
    expect(plan.conflicts.map((conflict) => conflict.type)).toEqual([
      "existing-url",
      "duplicate-url"
    ]);
    expect(plan.invalidRecords).toHaveLength(1);
  });

  it("rejects unsupported JSON schema versions before planning writes", () => {
    const plan = createJsonImportPlan(
      JSON.stringify({
        schemaVersion: 99,
        bookmarks: []
      })
    );

    expect(plan.bookmarksToCreate).toEqual([]);
    expect(plan.conflicts[0]).toMatchObject({ type: "unsupported-schema" });
  });
});

describe("CSV import/export", () => {
  it("exports table rows with CSV escaping and semicolon tags", () => {
    const rows: BookmarkTableRow[] = [
      {
        id: "browser:100",
        title: 'Hello, "World"',
        url: "https://example.com",
        folderPath: "Root/Research",
        note: "Line one\nLine two",
        tags: ["AI", "Tool"]
      }
    ];

    expect(exportBookmarkRowsToCsv(rows)).toBe(
      'title,url,folderPath,note,tags,previewImageUrl,description,createdAt,updatedAt\n"Hello, ""World""",https://example.com,Root/Research,"Line one\nLine two",AI;Tool,,,,\n'
    );
  });

  it("creates a CSV dry-run plan with folders, tags, updates, duplicates, and invalid URLs", () => {
    const csv = [
      "title,url,folderPath,note,tags,previewImageUrl,description,createdAt,updatedAt",
      '"New, Item",https://new.example.com,Root/Research,Important,AI;Tool,https://img.example.com/a.png,Description,,',
      "Existing,https://existing.example.com,Root/Research,,Docs,,,2026-01-01T00:00:00.000Z,",
      "Duplicate,https://new.example.com,Root/Research,,,,,",
      "Broken,not-a-url,Root/Research,,,,,"
    ].join("\n");

    const plan = createCsvImportPlan(csv, {
      existingBookmarks: [bookmark("browser:100", "Existing Local", "https://existing.example.com")],
      existingFolders: [folder("browser:1", "Root")],
      now
    });

    expect(plan.bookmarksToCreate).toHaveLength(1);
    expect(plan.bookmarksToCreate[0]).toMatchObject({
      title: "New, Item",
      url: "https://new.example.com",
      note: "Important",
      previewImageUrl: "https://img.example.com/a.png",
      description: "Description",
      tagIds: ["tag:ai", "tag:tool"]
    });
    expect(plan.bookmarksToUpdate.map((record) => record.url)).toEqual([
      "https://existing.example.com"
    ]);
    expect(plan.foldersToCreate.map((record) => record.path)).toEqual(["Root/Research"]);
    expect(plan.conflicts.map((conflict) => conflict.type)).toEqual([
      "existing-url",
      "duplicate-url"
    ]);
    expect(plan.invalidRecords.map((record) => record.reason)).toEqual(["Invalid URL: not-a-url"]);
  });

  it("reports missing CSV headers without creating an import plan", () => {
    const plan = createCsvImportPlan("title,folderPath\nExample,Root");

    expect(plan.bookmarksToCreate).toEqual([]);
    expect(plan.invalidRecords[0].reason).toContain("Missing required CSV headers");
  });
});

function bookmark(id: string, title: string, url: string): BookmarkRecord {
  return {
    id,
    type: "bookmark",
    title,
    url,
    tagIds: [],
    createdAt: now,
    updatedAt: now,
    source: id.startsWith("browser:") ? "browser" : "import"
  };
}

function folder(id: string, title: string): FolderRecord {
  return {
    id,
    title,
    path: title,
    createdAt: now,
    updatedAt: now,
    source: id.startsWith("browser:") ? "browser" : "import"
  };
}
