#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const ROOTS = ['app', 'src', 'public'];

const patterns = [
  {
    name: 'jquery',
    regex: /jquery/i,
    severity: 'HIGH',
    recommendation: 'Replace with native DOM or Alpine.js'
  },
  {
    name: 'bootstrap3',
    regex: /bootstrap(\.min)?\.js/i,
    severity: 'HIGH',
    recommendation: 'Upgrade to Bootstrap 5+'
  },
  {
    name: 'owlcarousel',
    regex: /owlcarousel/i,
    severity: 'MEDIUM',
    recommendation: 'Replace with Swiper'
  },
  {
    name: 'innerHTML',
    regex: /innerHTML/g,
    severity: 'CRITICAL',
    recommendation: 'Use Trusted Types + textContent'
  },
  {
    name: 'eval',
    regex: /eval\s*\(/g,
    severity: 'CRITICAL',
    recommendation: 'Remove dynamic code execution'
  }
];

const findings = [];

function scanFile(file) {
  const ext = path.extname(file);

  if (!['.js', '.jsx', '.ts', '.tsx', '.html'].includes(ext)) {
    return;
  }

  const content = fs.readFileSync(file, 'utf8');

  for (const rule of patterns) {
    if (rule.regex.test(content)) {
      findings.push({
        file,
        rule: rule.name,
        severity: rule.severity,
        recommendation: rule.recommendation
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

    scanFile(full);
  }
}

for (const root of ROOTS) {
  walk(root);
}

fs.mkdirSync('security/reports', { recursive: true });

fs.writeFileSync(
  'security/reports/frontend-modernization-report.json',
  JSON.stringify(findings, null, 2)
);

console.log(JSON.stringify(findings, null, 2));
console.log(`Findings: ${findings.length}`);
