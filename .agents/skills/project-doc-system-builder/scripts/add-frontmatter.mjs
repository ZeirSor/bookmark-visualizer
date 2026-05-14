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
const files = walk(docsRoot, (p) => p.endsWith(".md"));
const changed = [];
function inferScope(file) {
  const rel = posix(path.relative(docsRoot, file));
  const first = rel.split("/")[0];
  return rel === "README.md" ? "project" : first.replace(/^_/, "");
}
function inferType(file) {
  const rel = posix(path.relative(docsRoot, file));
  if (rel.endsWith("README.md")) return "index";
  if (rel.startsWith("_archive/")) return "archive";
  if (rel.startsWith("_templates/")) return "template";
  if (rel.startsWith("adr/")) return "decision";
  if (rel.startsWith("standards/")) return "standard";
  if (rel.startsWith("strategy/")) return "strategy";
  if (rel.startsWith("guides/")) return "guide";
  if (rel.startsWith("quality/")) return "quality-check";
  if (rel.startsWith("operations/")) return "runbook";
  if (rel.startsWith("presentations/")) return "brief";
  if (rel.startsWith("collaboration/")) return "collaboration";
  return "reference";
}
for (const file of files) {
  const content = read(file);
  if (content.startsWith("---\n")) continue;
  const scope = inferScope(file);
  const type = inferType(file);
  const source = ["archive", "template", "brief"].includes(type) ? "false" : "true";
  const fm = `---\ntype: ${type}\nstatus: ${type === "archive" ? "archived" : "active"}\nscope: ${scope}\nowner: project\nlast_verified: ${today()}\nsource_of_truth: ${source}\n---\n\n`;
  changed.push(posix(path.relative(process.cwd(), file)));
  if (!dryRun) write(file, fm + content);
}
console.log(JSON.stringify({ ok: true, changed, mode: dryRun ? "dry-run" : "write" }, null, 2));
