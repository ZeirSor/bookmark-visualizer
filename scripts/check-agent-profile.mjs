import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];

const toPosix = (p) => p.split(path.sep).join('/');
const rel = (p) => toPosix(path.relative(root, p));
const rootFileNames = new Set([
  'AGENTS.md',
  'AI_HANDOFF.md',
  'README.md',
  'README.zh-CN.md',
  'package.json',
  'index.html',
  'popup.html',
  'newtab.html',
]);
const generated = new Set(['service-worker.js', 'page-shortcut-content.js']);
const allowedProjectPath = /^(\.agents|\.ai|docs|src|public|scripts)(\/|$)/;
const historicalContext = /(archiv|histor|legacy|removed|deleted|not current|no longer|superseded|example|placeholder|sample|for example|已删除|归档|历史|旧|不再|不得|删除|移除|取代|示例|例如)/i;

function add(file, message) {
  failures.push(`${rel(file)}: ${message}`);
}

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

function existsProjectPath(raw) {
  const normalized = raw.replace(/^\.\//, '').replace(/\/$/, '');
  if (rootFileNames.has(normalized) || generated.has(normalized)) return true;
  if (!allowedProjectPath.test(normalized)) return true;
  return fs.existsSync(path.join(root, normalized));
}

const requiredFiles = [
  '.agents/skills/README.md',
  '.agents/project-profile/README.md',
  '.agents/project-profile/docs-map.md',
  '.agents/project-profile/surfaces.md',
  '.agents/project-profile/validation.md',
  '.agents/project-profile/playbooks.md',
  '.agents/project-profile/ai-workflow.md',
  '.agents/project-profile/portability.md',
];
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`${file}: missing required agent profile file`);
}

const mdFiles = [
  path.join(root, 'AGENTS.md'),
  path.join(root, 'AI_HANDOFF.md'),
  ...walk(path.join(root, '.agents')).filter((p) => p.endsWith('.md')),
];

const codeRe = /`([^`\n]+)`/g;
const mdLinkRe = /\[[^\]]*\]\(([^)]+)\)/g;
const staleCurrentPatterns = [
  /Quick Save overlay/i,
  /Save Overlay/i,
  /Shadow DOM/i,
  /docs\/frontend\/surfaces\/quick-save\//,
  /src\/features\/save-overlay/,
  /src\/save-window/,
  /quick-save\/content\.tsx/,
  /verify:save-window-entry/,
  /docs\/tmp\//,
  /docs\/guides\/testing-and-acceptance\.md/,
  /docs\/frontend\/surfaces\/[^`\s)]+\/\d{2}[-_][^`\s)]*/,
];

for (const file of mdFiles) {
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, 'utf8');

  let link;
  while ((link = mdLinkRe.exec(text))) {
    let target = link[1].trim();
    if (!target || target.startsWith('http:') || target.startsWith('https:') || target.startsWith('mailto:') || target.startsWith('#')) continue;
    target = decodeURIComponent(target.split('#')[0]);
    if (!target) continue;
    const resolved = path.normalize(path.resolve(path.dirname(file), target));
    if (!resolved.startsWith(root)) add(file, `local link escapes repository: ${link[1]}`);
    else if (!fs.existsSync(resolved)) add(file, `broken local link: ${link[1]}`);
  }

  const lines = text.split(/\r?\n/);
  lines.forEach((line, idx) => {
    const contextLine = `${lines[idx - 1] || ''} ${line}`;
    let m;
    while ((m = codeRe.exec(line))) {
      const raw = m[1].trim();
      if (!raw || raw.includes(' ') || raw.includes('*') || raw.includes('{') || raw.includes('(') || raw.includes('<') || raw.includes('>')) continue;
      if (raw.startsWith('chrome://') || raw.startsWith('edge://') || raw.startsWith('http://') || raw.startsWith('https://')) continue;
      if (!existsProjectPath(raw) && !historicalContext.test(contextLine)) add(file, `line ${idx + 1}: unresolved project path \`${raw}\``);
    }
    if (!historicalContext.test(contextLine) && staleCurrentPatterns.some((re) => re.test(line))) {
      add(file, `line ${idx + 1}: stale or archived project fact is presented without historical/archive context`);
    }
  });
}

for (const skillFile of walk(path.join(root, '.agents/skills')).filter((p) => p.endsWith('/SKILL.md') || p.endsWith('SKILL.md'))) {
  const text = fs.readFileSync(skillFile, 'utf8');
  const fmEnd = text.startsWith('---\n') ? text.indexOf('\n---', 4) : -1;
  if (fmEnd === -1) {
    add(skillFile, 'missing YAML frontmatter');
    continue;
  }
  const fm = text.slice(0, fmEnd + 4);
  for (const field of ['name:', 'description:', 'stage:', 'follows:', 'precedes:']) {
    if (!fm.includes(field)) add(skillFile, `frontmatter missing ${field}`);
  }
}

if (failures.length) {
  console.error('agents:check failed with findings:\n');
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}

console.log(`agents:check passed (${mdFiles.length} markdown files checked).`);
