#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const arg = process.argv[i];
  if (arg.startsWith("--")) {
    const key = arg.slice(2);
    const next = process.argv[i + 1];
    if (next && !next.startsWith("--")) {
      args.set(key, next);
      i += 1;
    } else {
      args.set(key, "true");
    }
  }
}

const root = path.resolve(args.get("root") || process.cwd());
const format = args.get("format") || "json";

function exists(relPath) {
  return fs.existsSync(path.join(root, relPath));
}

function listDirs(relPath) {
  const abs = path.join(root, relPath);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.posix.join(relPath.replaceAll("\\", "/"), entry.name));
}

function listFiles(relPath, extensions = null) {
  const abs = path.join(root, relPath);
  if (!fs.existsSync(abs)) return [];
  return fs
    .readdirSync(abs, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => !extensions || extensions.some((ext) => name.endsWith(ext)))
    .map((name) => path.posix.join(relPath.replaceAll("\\", "/"), name));
}

function readJson(relPath) {
  const abs = path.join(root, relPath);
  if (!fs.existsSync(abs)) return null;
  try {
    return JSON.parse(fs.readFileSync(abs, "utf8"));
  } catch {
    return null;
  }
}

const packageJson = readJson("package.json");
const docsDirs = listDirs("docs");
const sourceRoots = ["src", "app", "lib", "packages", "public", "scripts"].filter(exists);
const rootReadmes = listFiles(".", [".md"]).filter((file) => /^\.\/?README/i.test(file) || /README/i.test(path.basename(file)));
const entries = listFiles(".", [".html", ".js", ".ts", ".tsx", ".jsx", ".mjs"]).filter((file) =>
  path.extname(file) === ".html" || /^(index|main|app|background|content|service-worker)\./i.test(path.basename(file)),
);

const inventory = {
  root,
  packageName: packageJson?.name || null,
  packageScripts: packageJson?.scripts ? Object.keys(packageJson.scripts).sort() : [],
  readmeFiles: rootReadmes,
  docsDirectories: docsDirs,
  sourceRoots,
  entryCandidates: entries,
  aiWorkflow: {
    hasAiReadme: exists(".ai/README.md"),
    hasRunTemplate: exists(".ai/runs/_TEMPLATE"),
    runTemplateFiles: listFiles(".ai/runs/_TEMPLATE", [".md"]).map((file) => path.basename(file)),
  },
  localSkills: listDirs(".agents/skills").map((dir) => path.basename(dir)),
  projectProfile: {
    exists: exists(".agents/project-profile"),
    files: listFiles(".agents/project-profile", [".md"]).map((file) => path.basename(file)),
  },
};

if (format === "markdown" || format === "md") {
  const lines = [
    "# Project Profile Inventory",
    "",
    `Root: \`${inventory.root}\``,
    `Package: \`${inventory.packageName || "unknown"}\``,
    "",
    "## Package Scripts",
    ...inventory.packageScripts.map((script) => `- \`${script}\``),
    "",
    "## Documentation",
    ...inventory.docsDirectories.map((dir) => `- \`${dir}\``),
    "",
    "## Source Roots",
    ...inventory.sourceRoots.map((dir) => `- \`${dir}\``),
    "",
    "## Entry Candidates",
    ...(inventory.entryCandidates.length ? inventory.entryCandidates.map((file) => `- \`${file}\``) : ["- none found"]),
    "",
    "## Local Skills",
    ...inventory.localSkills.map((skill) => `- \`${skill}\``),
    "",
    "## Project Profile",
    `- exists: ${inventory.projectProfile.exists}`,
    ...inventory.projectProfile.files.map((file) => `- \`${file}\``),
  ];
  console.log(lines.join("\n"));
} else {
  console.log(JSON.stringify(inventory, null, 2));
}
