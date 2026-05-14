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
const root = path.resolve(args.get("root") || process.cwd());
const errors = [];
const requiredFiles = [
  ".agents/skills/project-doc-system-builder/SKILL.md",
  ".agents/skills/project-doc-system-builder/references/documentation-system-architecture.md",
  ".agents/skills/project-doc-system-builder/references/doc-layer-taxonomy.md",
  ".agents/skills/project-doc-system-builder/references/doc-folder-work-modes.md",
  ".agents/skills/project-doc-system-builder/references/base-docs-structure.md",
  ".agents/skills/project-doc-system-builder/templates/README.md",
  ".agents/skills/project-doc-system-builder/scripts/create-doc-system.mjs",
  ".agents/skills/project-doc-system-builder/scripts/check-doc-system.mjs",
  ".agents/skills/project-doc-system-builder/resources/base-docs/docs/README.md",
  ".agents/project-profile/docs-system.md",
];
for (const rel of requiredFiles) {
  if (!exists(path.join(root, rel))) errors.push(`Missing required file: ${rel}`);
}
for (const skillName of ["project-doc-routing", "project-doc-maintenance", "project-validation-gate"]) {
  const dir = path.join(root, ".agents/skills", skillName);
  if (!exists(dir)) errors.push(`Missing enhanced skill: ${skillName}`);
}
const baseDocs = path.join(root, ".agents/skills/project-doc-system-builder/resources/base-docs/docs");
if (exists(baseDocs)) {
  const dirs = [];
  function walkDirs(dir) {
    dirs.push(dir);
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) if (entry.isDirectory()) walkDirs(path.join(dir, entry.name));
  }
  walkDirs(baseDocs);
  for (const dir of dirs) {
    if (!exists(path.join(dir, "README.md"))) errors.push(`Base docs folder missing README: ${posix(path.relative(root, dir))}`);
  }
}
const skillMdFiles = walk(path.join(root, ".agents/skills"), (p) => p.endsWith("SKILL.md"));
for (const file of skillMdFiles) {
  const content = read(file);
  if (!content.startsWith("---\n")) errors.push(`Skill missing frontmatter: ${posix(path.relative(root, file))}`);
  for (const key of ["name:", "description:", "stage:", "follows:", "precedes:"]) {
    if (!content.includes(key)) errors.push(`Skill missing ${key} ${posix(path.relative(root, file))}`);
  }
}
const result = { ok: errors.length === 0, errorCount: errors.length, errors };
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exit(1);
