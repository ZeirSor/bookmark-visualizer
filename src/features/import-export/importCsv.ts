import type { BookmarkRecord, FolderRecord } from "../../domain";
import { createEmptyImportPlan, type ImportPlan, type ImportPlanContext } from "./schema";

const REQUIRED_HEADERS = ["title", "url"] as const;

export function createCsvImportPlan(csvText: string, context: ImportPlanContext = {}): ImportPlan {
  const plan = createEmptyImportPlan("csv");
  const rows = parseCsv(csvText);

  if (rows.length === 0) {
    plan.warnings.push("CSV file is empty.");
    return plan;
  }

  const headers = rows[0].map((header) => header.trim());
  const missingHeaders = REQUIRED_HEADERS.filter((header) => !headers.includes(header));
  if (missingHeaders.length > 0) {
    plan.invalidRecords.push({
      row: 0,
      reason: `Missing required CSV headers: ${missingHeaders.join(", ")}.`
    });
    return plan;
  }

  const existingByUrl = new Map(
    (context.existingBookmarks ?? []).map((bookmark) => [bookmark.url, bookmark])
  );
  const existingFolderPaths = new Set(
    (context.existingFolders ?? []).map((folder) => folder.path).filter(Boolean)
  );
  const folderPathsToCreate = new Set<string>();
  const seenUrls = new Set<string>();
  const now = context.now ?? new Date().toISOString();

  rows.slice(1).forEach((cells, index) => {
    const rowNumber = index + 2;
    const record = toRowRecord(headers, cells);
    const title = record.title?.trim() ?? "";
    const url = record.url?.trim() ?? "";
    const folderPath = record.folderPath?.trim();

    if (!title || !url) {
      plan.invalidRecords.push({ row: rowNumber, reason: "CSV row requires title and url.", value: record });
      return;
    }

    if (!isValidUrl(url)) {
      plan.invalidRecords.push({ row: rowNumber, reason: `Invalid URL: ${url}`, value: record });
      return;
    }

    if (seenUrls.has(url)) {
      plan.conflicts.push({
        type: "duplicate-url",
        message: `Duplicate URL in import: ${url}`,
        url
      });
      return;
    }

    seenUrls.add(url);

    if (folderPath && !existingFolderPaths.has(folderPath)) {
      folderPathsToCreate.add(folderPath);
    }

    const bookmark = csvRowToBookmarkRecord(record, rowNumber, now);
    if (existingByUrl.has(url)) {
      plan.bookmarksToUpdate.push(bookmark);
      plan.conflicts.push({
        type: "existing-url",
        message: `URL already exists locally: ${url}`,
        recordId: bookmark.id,
        url
      });
      return;
    }

    plan.bookmarksToCreate.push(bookmark);
  });

  plan.foldersToCreate.push(
    ...Array.from(folderPathsToCreate).map((folderPath) => csvFolderRecord(folderPath, now))
  );

  return plan;
}

function csvRowToBookmarkRecord(
  record: Record<string, string>,
  rowNumber: number,
  now: string
): BookmarkRecord {
  const tags = splitTags(record.tags ?? "");

  return {
    id: `import:csv:${rowNumber}`,
    type: "bookmark",
    title: record.title.trim(),
    url: record.url.trim(),
    folderPath: record.folderPath?.trim() || undefined,
    note: record.note?.trim() || undefined,
    description: record.description?.trim() || undefined,
    previewImageUrl: record.previewImageUrl?.trim() || undefined,
    tagIds: tags.map((tag) => `tag:${slugify(tag)}`),
    createdAt: record.createdAt?.trim() || now,
    updatedAt: record.updatedAt?.trim() || now,
    source: "import",
    syncStatus: "local-only"
  };
}

function csvFolderRecord(folderPath: string, now: string): FolderRecord {
  const segments = folderPath.split("/").map((segment) => segment.trim()).filter(Boolean);
  const title = segments.at(-1) ?? folderPath;

  return {
    id: `import:folder:${slugify(folderPath)}`,
    title,
    path: folderPath,
    createdAt: now,
    updatedAt: now,
    source: "import"
  };
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const nextCharacter = text[index + 1];

    if (character === '"' && inQuotes && nextCharacter === '"') {
      currentCell += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (character === "," && !inQuotes) {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !inQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }
      currentRow.push(currentCell);
      rows.push(currentRow);
      currentRow = [];
      currentCell = "";
      continue;
    }

    currentCell += character;
  }

  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell);
    rows.push(currentRow);
  }

  return rows.filter((row) => row.some((cell) => cell.trim().length > 0));
}

function toRowRecord(headers: string[], cells: string[]): Record<string, string> {
  return Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""]));
}

function splitTags(tags: string): string[] {
  return tags
    .split(/[;,]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function slugify(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
