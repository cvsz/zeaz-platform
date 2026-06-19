#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOTS = ['app', 'public', 'src'];

const handlers = [
  'onclick',
  'onmouseover',
  'onload',
  'onerror',
  'onsubmit',
  'onchange'
];

function sanitize(content) {
  for (const handler of handlers) {
    const regex = new RegExp(`${handler}="[^"]*"`, 'gi');
    content = content.replace(regex, `data-removed-${handler}="true"`);
  }

  return content;
}

function processFile(file) {
  if (!file.endsWith('.html')) {
    return;
  }

  const original = fs.readFileSync(file, 'utf8');
  const updated = sanitize(original);

  if (updated !== original) {
    fs.writeFileSync(file, updated, 'utf8');
    console.log(`[inline-handler-eradicated] ${file}`);
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
        full.includes('vendor') ||
        full.includes('node_modules') ||
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

console.log('Inline event handler eradication completed');
