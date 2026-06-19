#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOTS = ['app', 'public', 'src'];

function injectNonce(content) {
  return content.replace(/<script(?![^>]*nonce=)/g, () => {
    const nonce = crypto.randomBytes(16).toString('base64');
    return `<script nonce="${nonce}"`;
  });
}

function processFile(file) {
  if (!file.endsWith('.html')) {
    return;
  }

  const original = fs.readFileSync(file, 'utf8');
  const updated = injectNonce(original);

  if (updated !== original) {
    fs.writeFileSync(file, updated, 'utf8');
    console.log(`[nonce-injected] ${file}`);
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

console.log('CSP nonce injection completed');
