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
const moves = [
  ["products", "product"],
  ["deployment", "operations"],
  ["testing", "quality"],
  ["test_resource", "quality"],
  ["tmp", "_archive/tmp"],
  ["temp", "_archive/tmp"],
  ["misc", "_archive/misc"],
];
const actions = [];
for (const [from, to] of moves) {
  const src = path.join(docsRoot, from);
  const dst = path.join(docsRoot, to);
  if (!exists(src)) continue;
  actions.push({ action: "move", from: posix(path.relative(process.cwd(), src)), to: posix(path.relative(process.cwd(), dst)) });
  if (!dryRun) {
    ensureDir(path.dirname(dst));
    if (exists(dst)) {
      for (const entry of fs.readdirSync(src)) fs.renameSync(path.join(src, entry), path.join(dst, entry));
      fs.rmSync(src, { recursive: true, force: true });
    } else {
      fs.renameSync(src, dst);
    }
  }
}
console.log(JSON.stringify({ ok: true, actions, mode: dryRun ? "dry-run" : "write" }, null, 2));
