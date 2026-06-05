#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOTS = ['app', 'src', 'public'];

const transforms = [
  {
    from: /data-toggle=/g,
    to: 'data-bs-toggle='
  },
  {
    from: /data-target=/g,
    to: 'data-bs-target='
  },
  {
    from: /btn-default/g,
    to: 'btn-secondary'
  },
  {
    from: /input-group-addon/g,
    to: 'input-group-text'
  }
];

function processFile(file) {
  const ext = path.extname(file);

  if (!['.html', '.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
    return;
  }

  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  for (const rule of transforms) {
    const next = content.replace(rule.from, rule.to);

    if (next !== content) {
      modified = true;
      content = next;
    }
  }

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`[bootstrap-modernized] ${file}`);
  }
}

function walk(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);

    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      if (
        full.includes('node_modules') ||
        full.includes('vendor') ||
        full.includes('dist')
      ) {
        continue;
      }

      walk(full);
      continue;
    }

    processFile(full);
  }
}

for (const root of ROOTS) {
  walk(root);
}

console.log('Bootstrap modernization completed');
