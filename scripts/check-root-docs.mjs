import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const rootDocs = ['README.md', 'README.zh-CN.md', 'AI_HANDOFF.md', 'CHANGELOG.md'];
const rootFileNames = new Set([
  ...rootDocs,
  'AGENTS.md',
  'package.json',
  'index.html',
  'popup.html',
  'newtab.html',
]);
const knownGenerated = new Set(['service-worker.js', 'page-shortcut-content.js']);
const allowedProjectPath = /^(\.agents|\.ai|docs|src|public|scripts)(\/|$)/;
const historicalContext = /(archiv|histor|legacy|removed|deleted|not current|no longer|superseded|example|placeholder|sample|for example|snapshot|future|planned|when that directory is added|未来|后续|已删除|归档|历史|旧|不再|不得|删除|移除|取代|示例|例如)/i;
const stalePatterns = [
  /Quick Save overlay/i,
  /Save Overlay/i,
  /Shadow DOM/i,
  /docs\/frontend\/surfaces\/quick-save\//,
  /docs\/guides\/testing-and-acceptance\.md/,
  /docs\/tmp\//,
  /src\/features\/save-overlay/,
  /src\/save-window/,
  /quick-save\/content\.tsx/,
  /verify:save-window-entry/,
];

function add(file, message) {
  failures.push(`${file}: ${message}`);
}

function existsProjectPath(raw) {
  const normalized = raw.replace(/^\.\//, '').replace(/\/$/, '');
  if (rootFileNames.has(normalized) || knownGenerated.has(normalized)) return true;
  if (!allowedProjectPath.test(normalized)) return true;
  return fs.existsSync(path.join(root, normalized));
}

const mdLinkRe = /\[[^\]]*\]\(([^)]+)\)/g;
const codeRe = /`([^`\n]+)`/g;

for (const file of rootDocs) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) {
    add(file, 'missing root documentation file');
    continue;
  }

  const text = fs.readFileSync(absolute, 'utf8');
  let link;
  while ((link = mdLinkRe.exec(text))) {
    let target = link[1].trim();
    if (!target || target.startsWith('http:') || target.startsWith('https:') || target.startsWith('mailto:') || target.startsWith('#')) continue;
    target = decodeURIComponent(target.split('#')[0]);
    if (!target) continue;
    const resolved = path.normalize(path.resolve(path.dirname(absolute), target));
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
      if (!existsProjectPath(raw) && !historicalContext.test(contextLine)) {
        add(file, `line ${idx + 1}: unresolved project path \`${raw}\``);
      }
    }

    if (!historicalContext.test(contextLine) && stalePatterns.some((re) => re.test(line))) {
      add(file, `line ${idx + 1}: stale archived project fact is presented without historical/archive context`);
    }
  });
}

if (failures.length) {
  console.error('docs:root-check failed with findings:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`docs:root-check passed (${rootDocs.length} root Markdown files checked).`);
