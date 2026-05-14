import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const docsRoot = path.join(root, 'docs');
const failures = [];

const exists = (p) => fs.existsSync(path.join(root, p));
const isDir = (p) => fs.existsSync(p) && fs.statSync(p).isDirectory();
const isFile = (p) => fs.existsSync(p) && fs.statSync(p).isFile();

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

function rel(p) {
  return path.relative(root, p).split(path.sep).join('/');
}

function isArchivedFile(p) {
  return rel(p).startsWith('docs/_archive/');
}

function add(file, message) {
  failures.push(`${rel(file)}: ${message}`);
}

const mdFiles = walk(docsRoot).filter((p) => p.endsWith('.md'));
const activeMdFiles = mdFiles.filter((p) => !isArchivedFile(p));

// 1. Active markdown frontmatter.
for (const file of activeMdFiles) {
  const text = fs.readFileSync(file, 'utf8');
  if (!text.startsWith('---\n')) add(file, 'missing YAML frontmatter');
}

// 2. Directory README coverage.
function walkDirs(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  acc.push(dir);
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walkDirs(p, acc);
  }
  return acc;
}
for (const dir of walkDirs(docsRoot)) {
  const relative = rel(dir);
  if (relative.includes('/.')) continue;
  if (!isFile(path.join(dir, 'README.md'))) add(path.join(dir, 'README.md'), 'directory missing README.md');
}

// 3. Semantic filenames in active docs.
for (const file of activeMdFiles) {
  const base = path.basename(file);
  if (/^\d{2}[-_]/.test(base)) add(file, 'numeric ordering prefix is not allowed in active docs');
}

// 4. Markdown local links.
const mdLinkRe = /\[[^\]]*\]\(([^)]+)\)/g;
for (const file of activeMdFiles) {
  const text = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = mdLinkRe.exec(text))) {
    let target = m[1].trim();
    if (!target || target.startsWith('http:') || target.startsWith('https:') || target.startsWith('mailto:') || target.startsWith('#')) continue;
    if (target.startsWith('<') && target.endsWith('>')) target = target.slice(1, -1);
    target = decodeURIComponent(target.split('#')[0]);
    if (!target) continue;
    const resolved = path.normalize(path.resolve(path.dirname(file), target));
    if (!resolved.startsWith(root)) {
      add(file, `local link escapes repository: ${m[1]}`);
      continue;
    }
    if (!fs.existsSync(resolved)) add(file, `broken local link: ${m[1]}`);
  }
}

// 5. Backticked project paths in active docs.
const codeRe = /`([^`\n]+)`/g;
const projectPathRe = /^(docs|src|public|scripts|dist)\//;
const rootHtml = new Set(['index.html', 'popup.html', 'newtab.html']);
const knownGenerated = new Set(['service-worker.js', 'page-shortcut-content.js']);
const historicalContext = /(archiv|histor|legacy|removed|deleted|not current|no longer|superseded|已删除|归档|历史|旧|不再|不得|删除|移除|取代|without a new ADR)/i;
for (const file of activeMdFiles) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, idx) => {
    let m;
    while ((m = codeRe.exec(line))) {
      const raw = m[1].trim();
      if (!raw || raw.includes(' ') || raw.includes('*') || raw.includes('{') || raw.includes('(') || raw.includes('<') || raw.includes('>')) continue;
      if (raw.startsWith('chrome://') || raw.startsWith('edge://') || raw.startsWith('http://') || raw.startsWith('https://')) continue;
      if (knownGenerated.has(raw)) continue;
      let candidate = raw.replace(/^\.\//, '');
      if (candidate.startsWith('../')) continue;
      if (!(projectPathRe.test(candidate) || rootHtml.has(candidate))) continue;
      if (candidate.startsWith('dist/')) continue;
      if (historicalContext.test(line)) continue;
      if (!exists(candidate)) add(file, `line ${idx + 1}: unresolved project path \`${raw}\``);
    }
  });
}

// 6. Stale current-implementation wording.
const staleCurrentPatterns = [
  /Save Overlay[^\n]*(当前主|current save|current implementation|主路径|主保存)/i,
  /(当前主|current save|current implementation|主路径|主保存)[^\n]*Save Overlay/i,
  /src\/features\/save-overlay/,
  /src\/save-window/,
  /quick-save\/content\.tsx/,
  /verify:save-window-entry/,
];
for (const file of activeMdFiles) {
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, idx) => {
    if (historicalContext.test(line)) return;
    if (staleCurrentPatterns.some((re) => re.test(line))) {
      add(file, `line ${idx + 1}: stale save-surface wording in active docs`);
    }
  });
}

if (failures.length) {
  console.error('docs:check failed with findings:\n');
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}

console.log(`docs:check passed (${activeMdFiles.length} active Markdown files, ${mdFiles.length} total Markdown files).`);
