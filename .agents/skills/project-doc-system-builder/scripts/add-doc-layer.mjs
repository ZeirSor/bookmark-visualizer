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
const layer = args.get("layer");
const dryRun = args.get("dry-run") === "true";
if (!layer) {
  console.error("Usage: add-doc-layer.mjs --docs docs --layer <kebab-layer>");
  process.exit(1);
}
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(layer)) {
  console.error(`Layer must be kebab-case: ${layer}`);
  process.exit(1);
}
const dir = path.join(docsRoot, layer);
const readme = path.join(dir, "README.md");
const existedBefore = exists(readme);
const title = layer.split("-").map((s) => s[0].toUpperCase() + s.slice(1)).join(" ");
const content = `---\ntype: index\nstatus: active\nscope: ${layer}\nowner: project\nlast_verified: ${today()}\nsource_of_truth: true\n---\n\n# ${title}\n\n## Purpose\n\nDescribe what belongs in this documentation layer.\n\n## Contents\n\n- Add documents here when this layer becomes active.\n\n## Maintenance\n\n- Keep this README current when files are added, moved, or archived.\n`;
if (!dryRun) {
  ensureDir(dir);
  if (!exists(readme)) write(readme, content);
}
console.log(JSON.stringify({ ok: true, layer, created: !existedBefore, path: posix(path.relative(process.cwd(), readme)), mode: dryRun ? "dry-run" : "write" }, null, 2));
