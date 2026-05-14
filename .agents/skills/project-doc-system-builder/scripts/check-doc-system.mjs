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
const allowMissingBaseline = args.get("allow-missing-baseline") === "true";
const errors = [];
const warnings = [];
const requiredLayers = ["_archive", "_templates", "product", "strategy", "architecture", "adr", "standards", "guides", "quality", "operations"];
const requiredTemplates = ["archive.md", "concept.md", "decision-adr.md", "directory-readme.md", "guide.md", "operations-runbook.md", "quality-check.md", "reference.md", "strategy.md"];
function err(msg) { errors.push(msg); }
function warn(msg) { warnings.push(msg); }
if (!exists(docsRoot)) err(`Missing docs root: ${docsRoot}`);
if (exists(docsRoot)) {
  if (!exists(path.join(docsRoot, "README.md"))) err("Missing docs/README.md");
  if (!allowMissingBaseline) {
    for (const layer of requiredLayers) if (!exists(path.join(docsRoot, layer))) err(`Missing required layer: ${layer}`);
    for (const tmpl of requiredTemplates) if (!exists(path.join(docsRoot, "_templates", tmpl))) err(`Missing required template: _templates/${tmpl}`);
  }
  const dirs = [];
  function walkDirs(dir) {
    dirs.push(dir);
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) if (entry.isDirectory()) walkDirs(path.join(dir, entry.name));
  }
  walkDirs(docsRoot);
  for (const dir of dirs) {
    if (!exists(path.join(dir, "README.md"))) err(`Missing README: ${posix(path.relative(process.cwd(), dir))}`);
    const base = path.basename(dir);
    if (base !== "docs" && !base.startsWith("_") && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(base)) warn(`Non-kebab directory: ${posix(path.relative(process.cwd(), dir))}`);
  }
  const mdFiles = walk(docsRoot, (p) => p.endsWith(".md"));
  for (const file of mdFiles) {
    const rel = posix(path.relative(docsRoot, file));
    const content = read(file);
    if (!content.startsWith("---\n")) err(`Missing frontmatter: ${rel}`);
    const name = path.basename(file);
    if (name !== "README.md" && !/^(\d{4}-)?[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(name)) warn(`Non-standard markdown filename: ${rel}`);
    if (rel.startsWith("adr/") && name !== "README.md" && name !== "decision-log.md" && !/^\d{4}-[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(name)) warn(`ADR filename should be 0001-kebab-title.md: ${rel}`);
    if (rel.startsWith("_archive/") && name !== "README.md" && !/type:\s*archive|status:\s*archived/.test(content)) err(`Archive doc missing archive frontmatter: ${rel}`);
    if (rel.startsWith("presentations/") && !/source_of_truth:\s*false/.test(content)) warn(`Presentation doc should usually be source_of_truth: false: ${rel}`);
    if (!rel.startsWith("_archive/") && /_project_docs_archive|docs\/products|\.\.\/products|\.\/products|guides\/operations/.test(content)) err(`Active doc references old path: ${rel}`);
    const linkRe = /\[[^\]]+\]\(([^)]+)\)/g;
    let match;
    while ((match = linkRe.exec(content))) {
      const raw = match[1].split("#")[0];
      if (!raw || /^(https?:|mailto:|#)/.test(raw)) continue;
      const decoded = decodeURIComponent(raw);
      const target = path.resolve(path.dirname(file), decoded);
      if (decoded.endsWith("/")) {
        if (!exists(target) && !exists(path.join(target, "README.md"))) err(`Broken local link in ${rel}: ${raw}`);
      } else if (!exists(target)) {
        err(`Broken local link in ${rel}: ${raw}`);
      }
    }
  }
}
const result = { ok: errors.length === 0, errorCount: errors.length, warningCount: warnings.length, errors, warnings };
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exit(1);
