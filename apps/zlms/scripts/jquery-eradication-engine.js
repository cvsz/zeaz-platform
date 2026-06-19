#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOTS = ['app', 'src', 'public'];

const transforms = [
  {
    from: /\$\(([^)]+)\)\.html\(([^)]+)\)/g,
    to: '$1.textContent = $2'
  },
  {
    from: /\$\(([^)]+)\)\.text\(([^)]+)\)/g,
    to: '$1.textContent = $2'
  },
  {
    from: /\$\(([^)]+)\)\.addClass\(([^)]+)\)/g,
    to: '$1.classList.add($2)'
  },
  {
    from: /\$\(([^)]+)\)\.removeClass\(([^)]+)\)/g,
    to: '$1.classList.remove($2)'
  },
  {
    from: /\$\(([^)]+)\)\.hide\(\)/g,
    to: '$1.style.display = "none"'
  },
  {
    from: /\$\(([^)]+)\)\.show\(\)/g,
    to: '$1.style.display = "block"'
  }
];

function processFile(file) {
  const ext = path.extname(file);

  if (!['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
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
    console.log(`[jquery-eradicated] ${file}`);
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

console.log('jQuery eradication completed');
