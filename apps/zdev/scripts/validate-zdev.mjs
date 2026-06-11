import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const requiredFiles = [
  'README.md',
  'docs/release-notes.md',
  'index.html',
  'src/app.js',
  'src/styles.css',
];
const forbiddenSources = [
  ['replace', 'me'],
  ['change', 'me'],
  ['dummy', 'secret'],
  ['fake', 'token'],
];
const forbiddenPatterns = [
  ...forbiddenSources.map((parts) => new RegExp(parts.join('-'), 'i')),
  /BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY/,
  /api[_-]?token\s*[:=]/i,
  /cloudflare[_-]?(account|zone)[_-]?id\s*[:=]/i,
];
const requiredContent = [
  'Welcome to VDev',
  'all-in-one development environment',
  'code-server',
  'Web-based development',
  'Versatile tooling',
  'Seamless collaboration',
  'localStorage',
  'No secrets',
];

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const failures = [];
for (const file of requiredFiles) {
  try {
    readFileSync(join(root, file), 'utf8');
  } catch {
    failures.push(`missing ${file}`);
  }
}

const textExtensions = /\.(html|css|js|mjs|json|md)$/;
const corpus = walk(root)
  .filter((file) => !file.includes('/node_modules/') && textExtensions.test(file))
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n');

for (const pattern of forbiddenPatterns) {
  if (pattern.test(corpus)) failures.push(`forbidden pattern detected: ${pattern}`);
}
for (const needle of requiredContent) {
  if (!corpus.includes(needle)) failures.push(`missing required content: ${needle}`);
}

const html = readFileSync(join(root, 'index.html'), 'utf8');
if (html.includes(' style=')) failures.push('inline styles are not allowed');
if (!html.includes('Content-Security-Policy')) failures.push('missing CSP meta tag');
if (!html.includes('connect-src \'none\'')) failures.push('CSP must keep network connections disabled');

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, checked: requiredFiles.length, message: 'zdev validation passed' }));
