import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const mustExist = [
  'popup.html',
  'index.html',
  'newtab.html',
  'public/manifest.json',
  'src/popup/PopupApp.tsx',
  'src/popup/tabs/SaveTab.tsx',
  'src/features/popup/popupClient.ts',
  'src/background/messageRouter.ts',
  'src/background/quickSaveHandlers.ts',
  'src/features/quick-save/types.ts',
  'src/features/page-shortcut/content.ts',
  'src/background/pageShortcutHandlers.ts',
];
const mustNotExist = [
  'save.html',
  'src/save-window',
  'src/features/save-overlay',
  'src/features/quick-save/content.tsx',
  'src/features/quick-save/QuickSaveDialog.tsx',
  'src/background/saveExperienceHandlers.ts',
  'src/background/saveWindow.ts',
];

for (const p of mustExist) {
  if (!fs.existsSync(path.join(root, p))) failures.push(`missing required current path: ${p}`);
}
for (const p of mustNotExist) {
  if (fs.existsSync(path.join(root, p))) failures.push(`legacy path should not exist: ${p}`);
}

const manifestPath = path.join(root, 'public/manifest.json');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (manifest?.action?.default_popup !== 'popup.html') {
    failures.push('manifest action.default_popup must be popup.html');
  }
  if (!manifest?.commands?._execute_action) {
    failures.push('manifest must use _execute_action for toolbar popup shortcut');
  }
}

if (failures.length) {
  console.error('verify:popup-entry failed:\n');
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}

console.log('verify:popup-entry passed.');
