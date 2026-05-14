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
const type = args.get("type") || "reference";
const scope = args.get("scope") || "project";
const name = args.get("name");
const dryRun = args.get("dry-run") === "true";
if (!name) {
  console.error("Usage: add-doc.mjs --docs docs --type reference --scope api --name order");
  process.exit(1);
}
const safeName = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
if (!safeName) {
  console.error(`Invalid document name: ${name}`);
  process.exit(1);
}
const templateMap = {
  concept: "concept.md",
  guide: "guide.md",
  reference: "reference.md",
  decision: "decision-adr.md",
  standard: "reference.md",
  strategy: "strategy.md",
  runbook: "operations-runbook.md",
  "quality-check": "quality-check.md",
  brief: "presentation-brief.md",
  archive: "archive.md",
};
const templateFile = templateMap[type] || "reference.md";
const templatePath = path.resolve(__dirname, "../templates", templateFile);
if (!exists(templatePath)) {
  console.error(`Missing template: ${templatePath}`);
  process.exit(1);
}
const outDir = path.join(docsRoot, scope);
const outFile = path.join(outDir, `${safeName}.md`);
let content = read(templatePath)
  .replaceAll("YYYY-MM-DD", today())
  .replace(/^scope: .+$/m, `scope: ${scope}`);
if (!dryRun) {
  ensureDir(outDir);
  if (exists(outFile)) {
    console.error(`Refusing to overwrite existing file: ${outFile}`);
    process.exit(1);
  }
  write(outFile, content);
}
console.log(JSON.stringify({ ok: true, path: posix(path.relative(process.cwd(), outFile)), template: templateFile, mode: dryRun ? "dry-run" : "write" }, null, 2));
