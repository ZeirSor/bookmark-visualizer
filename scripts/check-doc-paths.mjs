import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const explicitFiles = [
  "AGENTS.md",
  "AI_HANDOFF.md",
  "README.md",
  "README.zh-CN.md",
  "CHANGELOG.md",
  "package.json",
  ".ai/README.md",
];

const markdownRoots = [
  "docs",
  ".agents/skills",
  ".ai/runs/_TEMPLATE",
];

const ignoredPathPrefixes = [
  ".ai/logs/",
  ".ai/dev-changelog/",
  ".ai/archive/",
  "docs/tmp/",
  "node_modules/",
  "dist/",
];

const pathPattern = /(?:^|[\s`"'([])((?:src|docs|scripts|\.ai|\.agents)\/[^\s`"')\],;]+|(?:AGENTS|AI_HANDOFF|README|README\.zh-CN|CHANGELOG)\.md|package\.json)(?=$|[\s`"')\],;:。。，、])/g;
const futurePattern = /future|proposed|planned|proposal|example|not current|not current repository path|not current implementation|未来|后续|建议|规划|计划|提案|示例|例如|不代表当前|不是当前|非当前/i;

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, ...relativePath.split("/")));
}

function shouldIgnoreScanPath(relativePath) {
  const normalized = relativePath.endsWith("/") ? relativePath : `${relativePath}/`;
  if (ignoredPathPrefixes.some((prefix) => normalized.startsWith(prefix))) {
    return true;
  }
  if (normalized.startsWith(".ai/runs/") && !normalized.startsWith(".ai/runs/_TEMPLATE/")) {
    return true;
  }
  return false;
}

function walk(dir) {
  const absolute = path.join(root, ...dir.split("/"));
  if (!fs.existsSync(absolute)) {
    return [];
  }

  const results = [];
  for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
    const relative = toPosix(path.relative(root, path.join(absolute, entry.name)));
    if (shouldIgnoreScanPath(relative)) {
      continue;
    }
    if (entry.isDirectory()) {
      results.push(...walk(relative));
    } else if (entry.isFile() && relative.endsWith(".md")) {
      results.push(relative);
    }
  }
  return results;
}

function scanFiles() {
  const files = new Set();
  for (const file of explicitFiles) {
    if (exists(file) && !shouldIgnoreScanPath(file)) {
      files.add(file);
    }
  }
  for (const dir of markdownRoots) {
    for (const file of walk(dir)) {
      files.add(file);
    }
  }
  return [...files].sort();
}

function cleanReference(raw) {
  return raw
    .replace(/\\\|/g, "|")
    .replace(/[.,;:!?。，、]+$/u, "")
    .replace(/#+.*$/, "")
    .replace(/:\d+(?::\d+)?$/, "")
    .replace(/\/+$/, (match, offset, value) => (offset === value.length - match.length && value.length > match.length ? "/" : ""));
}

function isPlaceholderOrPattern(reference) {
  return /[<>]/.test(reference);
}

function isIgnoredReference(reference) {
  const withSlash = reference.endsWith("/") ? reference : `${reference}/`;
  return ignoredPathPrefixes.some((prefix) => withSlash.startsWith(prefix));
}

function referenceBase(reference) {
  let base = reference;
  const wildcardIndex = base.search(/[*?]/);
  const ellipsisIndex = base.indexOf("...");
  const cut = [wildcardIndex, ellipsisIndex].filter((index) => index >= 0).sort((a, b) => a - b)[0];
  if (cut !== undefined) {
    base = base.slice(0, cut);
    base = base.slice(0, base.lastIndexOf("/") + 1);
  }
  return base.replace(/\/$/, "");
}

function isFutureContext(lines, index, headingStack) {
  const start = Math.max(0, index - 4);
  const nearby = [...headingStack, ...lines.slice(start, index + 1)].join("\n");
  return futurePattern.test(nearby);
}

function findMissingReferences(file) {
  const text = fs.readFileSync(path.join(root, ...file.split("/")), "utf8");
  const lines = text.split(/\r?\n/);
  const headingStack = [];
  const missing = [];
  let inFutureFence = false;

  lines.forEach((line, index) => {
    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      headingStack.length = heading[1].length - 1;
      headingStack.push(heading[2]);
    }

    const isFence = /^```/.test(line.trim());
    if (isFence) {
      inFutureFence = !inFutureFence && isFutureContext(lines, index, headingStack);
      return;
    }

    for (const match of line.matchAll(pathPattern)) {
      const reference = cleanReference(match[1]);
      if (!reference || isPlaceholderOrPattern(reference) || isIgnoredReference(reference)) {
        continue;
      }
      const base = referenceBase(reference);
      if (!base || inFutureFence || isFutureContext(lines, index, headingStack)) {
        continue;
      }
      if (!exists(base)) {
        missing.push({
          file,
          line: index + 1,
          reference,
        });
      }
    }
  });

  return missing;
}

const files = scanFiles();
const missing = files.flatMap(findMissingReferences);

if (missing.length > 0) {
  console.error("Documentation path check failed. Missing active references:");
  for (const item of missing) {
    console.error(`- ${item.file}:${item.line} -> ${item.reference}`);
  }
  console.error("\nMark future/proposed paths clearly, fix stale active paths, or exclude generated/historical records.");
  process.exit(1);
}

console.log(`Documentation path check passed (${files.length} active files scanned).`);
