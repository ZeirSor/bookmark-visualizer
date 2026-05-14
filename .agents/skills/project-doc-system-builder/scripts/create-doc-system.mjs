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
const targetRoot = path.resolve(args.get("target") || process.cwd());
const docsName = args.get("docs") || "docs";
const dryRun = args.get("dry-run") === "true";
const force = args.get("force") === "true";
const sourceDocs = path.resolve(__dirname, "../resources/base-docs/docs");
const targetDocs = path.join(targetRoot, docsName);

const actions = [];
function copyTree(src, dst) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    if (entry.isDirectory()) {
      if (!dryRun) ensureDir(d);
      actions.push({ action: "ensure-dir", path: posix(path.relative(targetRoot, d)) });
      copyTree(s, d);
    } else if (entry.isFile()) {
      const shouldWrite = force || !exists(d);
      actions.push({ action: shouldWrite ? "copy" : "skip-existing", path: posix(path.relative(targetRoot, d)) });
      if (!dryRun && shouldWrite) {
        let content = read(s).replaceAll("YYYY-MM-DD", today());
        write(d, content);
      }
    }
  }
}

if (!exists(sourceDocs)) {
  console.error(`Missing source base docs: ${sourceDocs}`);
  process.exit(1);
}
if (!dryRun) ensureDir(targetDocs);
actions.push({ action: "ensure-dir", path: posix(path.relative(targetRoot, targetDocs)) });
copyTree(sourceDocs, targetDocs);
console.log(JSON.stringify({ ok: true, mode: dryRun ? "dry-run" : "write", target: targetDocs, actions }, null, 2));
