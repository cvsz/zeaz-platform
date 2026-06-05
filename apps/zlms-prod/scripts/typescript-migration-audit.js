#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOTS = ['app', 'src', 'public'];

const report = {
  jsFiles: [],
  unsafePatterns: [],
  migrationCandidates: []
};

const unsafeRules = [
  {
    name: 'any-type-risk',
    regex: /:\s*any/g,
    severity: 'HIGH'
  },
  {
    name: 'dynamic-eval',
    regex: /eval\s*\(/g,
    severity: 'CRITICAL'
  },
  {
    name: 'innerHTML',
    regex: /innerHTML/g,
    severity: 'CRITICAL'
  },
  {
    name: 'jquery-usage',
    regex: /\$\(/g,
    severity: 'HIGH'
  }
];

function analyzeFile(file) {
  const ext = path.extname(file);

  if (!['.js', '.jsx'].includes(ext)) {
    return;
  }

  const content = fs.readFileSync(file, 'utf8');

  report.jsFiles.push(file);

  report.migrationCandidates.push({
    file,
    suggestedTarget: file.replace(/\.jsx?$/, ext === '.jsx' ? '.tsx' : '.ts')
  });

  for (const rule of unsafeRules) {
    if (rule.regex.test(content)) {
      report.unsafePatterns.push({
        file,
        rule: rule.name,
        severity: rule.severity
      });
    }
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

    analyzeFile(full);
  }
}

for (const root of ROOTS) {
  walk(root);
}

fs.mkdirSync('security/reports', { recursive: true });

fs.writeFileSync(
  'security/reports/typescript-migration-report.json',
  JSON.stringify(report, null, 2)
);

console.log(JSON.stringify(report, null, 2));
