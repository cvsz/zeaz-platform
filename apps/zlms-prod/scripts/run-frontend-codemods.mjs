#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const transforms = [
  { name: 'jquery-to-dom', path: 'codemods/jscodeshift/jquery-to-dom.js' },
  { name: 'js-to-ts-conversion', path: 'codemods/ts/js-to-ts-conversion.js' }
];
const targets = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
const dry = process.argv.includes('--dry') || process.argv.includes('--dry-run');
const targetArgs = targets.length > 0 ? targets : ['app'];

if (!fs.existsSync('node_modules/.bin/jscodeshift')) {
  console.error('jscodeshift is not installed. Run npm install before applying codemods.');
  process.exit(1);
}

for (const transform of transforms) {
  const args = ['--transform', transform.path, '--extensions', 'js,jsx', '--ignore-pattern', '**/{bin,obj,node_modules,dist,build}/**'];
  if (dry) args.push('--dry', '--print');
  args.push(...targetArgs);
  console.log(`[codemod] ${transform.name}: jscodeshift ${args.join(' ')}`);
  const result = spawnSync('node_modules/.bin/jscodeshift', args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
