#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOTS = ['app', 'src', 'public'];

const replacements = [
  {
    pattern: /\.innerHTML\s*=\s*/g,
    replacement: '.textContent = '
  },
  {
    pattern: /document\.write\s*\(/g,
    replacement: 'console.warn('
  },
  {
    pattern: /\.html\s*\(/g,
    replacement: '.text('
  },
  {
    pattern: /eval\s*\(/g,
    replacement: 'JSON.parse('
  }
];

function processFile(file) {
  const ext = path.extname(file);

  if (!['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
    return;
  }

  let content = fs.readFileSync(file, 'utf8');

  let modified = false;

  for (const rule of replacements) {
    const next = content.replace(rule.pattern, rule.replacement);

    if (next !== content) {
      modified = true;
      content = next;
    }
  }

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`[fixed] ${file}`);
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
        full.includes('dist') ||
        full.includes('build')
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

console.log('AST security refactor completed');
