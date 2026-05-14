#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseArgs() {
  const args = new Map();
  for (let i = 2; i < process.argv.length; i += 1) {
    const arg = process.argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = process.argv[i + 1];
    if (next && !next.startsWith("--")) {
      args.set(key, next);
      i += 1;
    } else {
      args.set(key, "true");
    }
  }
  return args;
}

function posix(p) { return p.split(path.sep).join("/"); }
function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function today() { return new Date().toISOString().slice(0, 10); }
function read(p) { return fs.readFileSync(p, "utf8"); }
function write(p, s) { ensureDir(path.dirname(p)); fs.writeFileSync(p, s, "utf8"); }
function exists(p) { return fs.existsSync(p); }
function walk(dir, predicate = () => true) {
  if (!exists(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(abs, predicate));
    else if (entry.isFile() && predicate(abs)) out.push(abs);
  }
  return out;
}

const args = parseArgs();
const docsRoot = path.resolve(args.get("docs") || "docs");
const dryRun = args.get("dry-run") === "true";
const changed = [];
const markerStart = "<!-- DOC-SYSTEM-CONTENTS:START -->";
const markerEnd = "<!-- DOC-SYSTEM-CONTENTS:END -->";
for (const dir of [docsRoot, ...walk(docsRoot, () => false)]) {}
function dirs(root) {
  if (!exists(root)) return [];
  const out = [root];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (entry.isDirectory()) out.push(...dirs(path.join(root, entry.name)));
  }
  return out;
}
for (const dir of dirs(docsRoot)) {
  const readme = path.join(dir, "README.md");
  if (!exists(readme)) continue;
  const entries = fs.readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.name !== "README.md" && !e.name.startsWith("."))
    .map((e) => `- \`${e.name}${e.isDirectory() ? "/" : ""}\` - ${e.isDirectory() ? "Directory." : "Document or asset."}`)
    .sort();
  const block = `${markerStart}\n${entries.length ? entries.join("\n") : "- No child entries yet."}\n${markerEnd}`;
  let content = read(readme);
  if (content.includes(markerStart) && content.includes(markerEnd)) {
    content = content.replace(new RegExp(`${markerStart}[\\s\\S]*?${markerEnd}`), block);
  } else {
    content += `\n\n## Generated Contents\n\n${block}\n`;
  }
  changed.push(posix(path.relative(process.cwd(), readme)));
  if (!dryRun) write(readme, content);
}
console.log(JSON.stringify({ ok: true, changed, mode: dryRun ? "dry-run" : "write" }, null, 2));
