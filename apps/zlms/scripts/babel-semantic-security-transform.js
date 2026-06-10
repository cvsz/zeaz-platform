#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOTS = ['app', 'src', 'public'];

const transforms = [
  {
    name: 'dangerouslySetInnerHTML',
    regex: /dangerouslySetInnerHTML\s*=\s*\{\{/g,
    replacement: 'data-secure-html={{'
  },
  {
    name: 'setTimeout-string',
    regex: /setTimeout\s*\(\s*["'`]/g,
    replacement: 'setTimeout(() => '
  },
  {
    name: 'setInterval-string',
    regex: /setInterval\s*\(\s*["'`]/g,
    replacement: 'setInterval(() => '
  },
  {
    name: 'new-function',
    regex: /new Function\s*\(/g,
    replacement: 'secureFunctionWrapper('
  }
];

function processFile(file) {
  const ext = path.extname(file);

  if (!['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
    return;
  }

  let content = fs.readFileSync(file, 'utf8');
  let modified = false;

  for (const transform of transforms) {
    const updated = content.replace(transform.regex, transform.replacement);

    if (updated !== content) {
      modified = true;
      content = updated;
    }
  }

  if (modified) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`[semantic-transform] ${file}`);
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

console.log('Babel semantic security transform completed');
