#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const arg = process.argv[i];
  if (arg.startsWith("--")) {
    const key = arg.slice(2);
    const next = process.argv[i + 1];
    if (next && !next.startsWith("--")) {
      args.set(key, next);
      i += 1;
    } else {
      args.set(key, "true");
    }
  }
}

const root = path.resolve(args.get("root") || process.cwd());
const format = args.get("format") || "markdown";
const strict = args.get("strict") === "true";

const allowedProjectSpecificRoots = [
  ".agents/project-profile",
  ".ai/runs",
  ".ai/logs",
  ".ai/dev-changelog",
  ".ai/archive",
];

const terms = [
  { id: "product-name", pattern: /\bBookmark Visualizer\b/g },
  { id: "surface-manager", pattern: /\bManager workspace\b|\bManager Workspace\b/g },
  { id: "surface-popup", pattern: /\bToolbar Popup\b|\btoolbar popup\b/g },
  { id: "surface-quick-save", pattern: /\bQuick Save\b/g },
  { id: "surface-new-tab", pattern: /\bNew Tab\b|\bnewtab\b/g },
  { id: "chrome-extension", pattern: /\bManifest V3\b|\bChrome \/ Edge\b|\bchrome\.(bookmarks|storage|runtime|tabs|scripting)\b|\bchrome:\/\//g },
  { id: "project-source-path", pattern: /`?(src\/(?:app|background|features|lib\/chrome|newtab|popup|styles)[^`\s)]*)`?/g },
  { id: "project-entrypoint", pattern: /`?(index|popup|newtab)\.html`?/g },
  { id: "project-manifest", pattern: /`?public\/manifest\.json`?/g },
  { id: "project-doc-surface", pattern: /`?docs\/frontend\/surfaces\/(?:manager|popup|quick-save|newtab)[^`\s)]*`?/g },
  { id: "project-verify-script", pattern: /`?npm run verify:(popup-entry|page-shortcut|quick-save-shortcut)`?/g },
  { id: "absolute-windows-path", pattern: /[A-Z]:\\[^`\s)]*/g },
];

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function isAllowed(relPath) {
  return allowedProjectSpecificRoots.some((prefix) => relPath === prefix || relPath.startsWith(`${prefix}/`));
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(abs));
    } else if (entry.isFile() && /\.(md|mjs|js|json|yaml|yml)$/i.test(entry.name)) {
      files.push(abs);
    }
  }
  return files;
}

const scanRoots = [".agents/skills"];
const findings = [];

for (const relRoot of scanRoots) {
  const absRoot = path.join(root, relRoot);
  for (const file of walk(absRoot)) {
    const relPath = toPosix(path.relative(root, file));
    if (isAllowed(relPath)) continue;
    if (relPath.endsWith("audit-skill-portability.mjs")) continue;
    const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
    lines.forEach((line, index) => {
      for (const term of terms) {
        term.pattern.lastIndex = 0;
        if (term.pattern.test(line)) {
          findings.push({
            file: relPath,
            line: index + 1,
            rule: term.id,
            text: line.trim(),
          });
        }
      }
    });
  }
}

const result = {
  root,
  scannedRoots: scanRoots,
  allowedProjectSpecificRoots,
  findingCount: findings.length,
  findings,
};

if (format === "json") {
  console.log(JSON.stringify(result, null, 2));
} else {
  const lines = ["# Skill Portability Audit", "", `Findings: ${findings.length}`, ""];
  if (findings.length === 0) {
    lines.push("No project-specific coupling found outside allowed profile/history roots.");
  } else {
    for (const finding of findings) {
      lines.push(`- ${finding.file}:${finding.line} [${finding.rule}] ${finding.text}`);
    }
  }
  console.log(lines.join("\n"));
}

if (strict && findings.length > 0) {
  process.exitCode = 1;
}
