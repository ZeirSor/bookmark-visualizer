import type { BookmarkTableRow } from "../../domain";

const CSV_HEADERS = [
  "title",
  "url",
  "folderPath",
  "note",
  "tags",
  "previewImageUrl",
  "description",
  "createdAt",
  "updatedAt"
] as const;

export function exportBookmarkRowsToCsv(rows: BookmarkTableRow[]): string {
  const lines = [
    CSV_HEADERS.join(","),
    ...rows.map((row) =>
      [
        row.title,
        row.url,
        row.folderPath,
        row.note ?? "",
        row.tags.join(";"),
        row.previewImageUrl ?? "",
        row.description ?? "",
        row.createdAt ?? "",
        row.updatedAt ?? ""
      ]
        .map(escapeCsvCell)
        .join(",")
    )
  ];

  return `${lines.join("\n")}\n`;
}

function escapeCsvCell(value: string): string {
  if (!/[",\n\r]/.test(value)) {
    return value;
  }

  return `"${value.replaceAll('"', '""')}"`;
}
