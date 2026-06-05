#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOTS = ['app', 'public', 'src'];

function processFile(file) {
  if (!file.endsWith('.html')) {
    return;
  }

  let content = fs.readFileSync(file, 'utf8');

  const original = content;

  content = content.replace(/<script>([\s\S]*?)<\/script>/g, (_match, code) => {
    return `<!-- inline-script-removed -->\n<script src=\"/secure-inline-placeholder.js\"></script>`;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`[inline-script-eradicated] ${file}`);
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

console.log('Inline script eradication completed');
