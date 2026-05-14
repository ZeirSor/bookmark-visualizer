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
const fileArg = args.get("file");
const reason = args.get("reason") || "superseded";
const currentSource = args.get("current-source") || "unknown";
const dryRun = args.get("dry-run") === "true";
if (!fileArg) {
  console.error("Usage: archive-doc.mjs --docs docs --file docs/path/file.md --reason 'superseded'");
  process.exit(1);
}
const file = path.resolve(fileArg);
if (!exists(file)) {
  console.error(`File not found: ${file}`);
  process.exit(1);
}
if (!file.startsWith(docsRoot)) {
  console.error(`File must be under docs root: ${docsRoot}`);
  process.exit(1);
}
const rel = posix(path.relative(docsRoot, file));
const dst = path.join(docsRoot, "_archive", rel);
let body = read(file);
if (body.startsWith("---\n")) {
  body = body.replace(/^---\n[\s\S]*?\n---\n?/, "");
}
const fm = `---\ntype: archive\nstatus: archived\nscope: archive\nowner: project\nlast_verified: ${today()}\nsource_of_truth: false\narchived_reason: "${reason.replaceAll('"', "'")}"\ncurrent_source: "${currentSource.replaceAll('"', "'")}"\n---\n\n`;
function ensureArchiveReadmes(startDir) {
  const archiveRoot = path.join(docsRoot, "_archive");
  let current = startDir;
  const dirs = [];
  while (current.startsWith(archiveRoot)) {
    dirs.push(current);
    if (current === archiveRoot) break;
    current = path.dirname(current);
  }
  for (const dir of dirs.reverse()) {
    const readme = path.join(dir, "README.md");
    if (!exists(readme)) {
      const rel = posix(path.relative(docsRoot, dir));
      const title = rel.split("/").filter(Boolean).map((part) => part.replace(/^_/, "").split("-").map((s) => s[0]?.toUpperCase() + s.slice(1)).join(" ")).join(" / ") || "Archive";
      write(readme, `---\ntype: index\nstatus: active\nscope: archive\nowner: project\nlast_verified: ${today()}\nsource_of_truth: false\n---\n\n# ${title}\n\n## Purpose\n\nThis folder stores archived documents. These files are historical references, not current sources of truth.\n\n## Maintenance\n\n- Keep archived files here when they match this category.\n- Link to current sources when known.\n`);
    }
  }
}

if (!dryRun) {
  ensureArchiveReadmes(path.dirname(dst));
  write(dst, fm + body.replace(/^\n+/, ""));
  fs.rmSync(file);
}
console.log(JSON.stringify({ ok: true, from: posix(path.relative(process.cwd(), file)), to: posix(path.relative(process.cwd(), dst)), mode: dryRun ? "dry-run" : "write" }, null, 2));
