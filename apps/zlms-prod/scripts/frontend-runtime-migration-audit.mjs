#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOTS = ['app', 'frontend', 'trusted-types.ts', 'csp-middleware.ts', 'hydration-integrity.ts'];
const REPORT_DIR = 'architecture/reports';
const TEXT_EXTENSIONS = new Set(['.aspx', '.ascx', '.cshtml', '.htm', '.html', '.js', '.jsx', '.ts', '.tsx', '.master']);
const SKIP_PARTS = new Set(['.git', 'node_modules', 'bin', 'obj', 'dist', 'build']);

const rules = [
  { id: 'jquery-usage', severity: 'high', regex: /(?:jquery(?:-|\.)|\$\s*\()/i, category: 'legacy-runtime' },
  { id: 'inline-dom-mutation', severity: 'critical', regex: /\.(?:innerHTML|outerHTML)\s*=|insertAdjacentHTML\s*\(|document\.write\s*\(/, category: 'trusted-types' },
  { id: 'dangerously-set-inner-html', severity: 'critical', regex: /dangerouslySetInnerHTML/, category: 'react' },
  { id: 'inline-event-handler', severity: 'high', regex: /\son[a-z]+\s*=\s*["']/i, category: 'legacy-runtime' },
  { id: 'legacy-bootstrap-plugin', severity: 'high', regex: /bootstrap(?:\.min)?\.js|\.(?:modal|dropdown|tooltip|popover|collapse|carousel)\s*\(/i, category: 'ui' },
  { id: 'client-rendering-bottleneck', severity: 'medium', regex: /ReactDOM\.render|createRoot\s*\(|ko\.applyBindings|new\s+Vue\s*\(/, category: 'ssr' },
  { id: 'dynamic-code-execution', severity: 'critical', regex: /\beval\s*\(|new\s+Function\s*\(|set(?:Timeout|Interval)\s*\(\s*["'`]/, category: 'zero-trust' },
  { id: 'inline-script', severity: 'high', regex: /<script(?![^>]+\bsrc=)[^>]*>/i, category: 'csp' }
];

const findings = [];
const migrationInventory = {
  generatedAt: new Date().toISOString(),
  scannedRoots: ROOTS,
  totals: { filesScanned: 0, findings: 0 },
  jsToTsCandidates: [],
  ssrCandidates: [],
  rscCandidates: [],
  bootstrapCandidates: []
};

function shouldSkip(filePath) {
  return filePath.split(path.sep).some((part) => SKIP_PARTS.has(part));
}

function readIfText(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (!TEXT_EXTENSIONS.has(extension)) return undefined;
  return fs.readFileSync(filePath, 'utf8');
}

function lineFor(content, index) {
  return content.slice(0, index).split(/\r?\n/).length;
}

function recordMigrationCandidates(filePath, content) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === '.js' || extension === '.jsx') {
    migrationInventory.jsToTsCandidates.push({
      file: filePath,
      target: filePath.replace(/\.jsx?$/, extension === '.jsx' ? '.tsx' : '.ts')
    });
  }

  if (/ReactDOM\.render|createRoot\s*\(|ko\.applyBindings|\$\s*\(\s*document\s*\)\.ready/.test(content)) {
    migrationInventory.ssrCandidates.push({ file: filePath, strategy: 'Move data fetching to server boundary and hydrate only islands.' });
  }

  if (/\.aspx$|\.master$/i.test(filePath)) {
    migrationInventory.rscCandidates.push({ file: filePath, strategy: 'Extract route shell into app router server component.' });
  }

  if (/bootstrap(?:\.min)?\.js|bootstrap(?:\.min)?\.css|data-toggle=|data-bs-toggle=/.test(content)) {
    migrationInventory.bootstrapCandidates.push({ file: filePath, strategy: 'Replace plugin behavior with isolated typed component.' });
  }
}

function scanFile(filePath) {
  const content = readIfText(filePath);
  if (content === undefined) return;
  migrationInventory.totals.filesScanned += 1;
  recordMigrationCandidates(filePath, content);

  for (const rule of rules) {
    rule.regex.lastIndex = 0;
    const match = rule.regex.exec(content);
    if (match) {
      findings.push({
        file: filePath,
        line: lineFor(content, match.index),
        rule: rule.id,
        severity: rule.severity,
        category: rule.category,
        evidence: match[0].slice(0, 120)
      });
    }
  }
}

function walk(entryPath) {
  if (!fs.existsSync(entryPath) || shouldSkip(entryPath)) return;
  const stat = fs.statSync(entryPath);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(entryPath)) walk(path.join(entryPath, entry));
    return;
  }
  scanFile(entryPath);
}

for (const root of ROOTS) walk(root);
migrationInventory.totals.findings = findings.length;

const riskReport = {
  generatedAt: migrationInventory.generatedAt,
  summary: findings.reduce((acc, finding) => {
    acc[finding.severity] = (acc[finding.severity] ?? 0) + 1;
    return acc;
  }, {}),
  findings
};

const tsReport = {
  generatedAt: migrationInventory.generatedAt,
  strictConfig: 'tsconfig.strict.json',
  candidates: migrationInventory.jsToTsCandidates,
  codemods: ['codemods/ts/js-to-ts-conversion.js', 'codemods/babel/remove-unsafe-dom-sinks.mjs']
};

const ssrReport = {
  generatedAt: migrationInventory.generatedAt,
  nextConfig: 'next.config.ts',
  cspMiddleware: 'csp-middleware.ts',
  hydrationIntegrity: 'hydration-integrity.ts',
  ssrCandidates: migrationInventory.ssrCandidates,
  rscCandidates: migrationInventory.rscCandidates,
  bootstrapCandidates: migrationInventory.bootstrapCandidates
};

fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(path.join(REPORT_DIR, 'legacy-runtime-risk-report.json'), `${JSON.stringify(riskReport, null, 2)}\n`);
fs.writeFileSync(path.join(REPORT_DIR, 'ts-migration-report.json'), `${JSON.stringify(tsReport, null, 2)}\n`);
fs.writeFileSync(path.join(REPORT_DIR, 'ssr-migration-report.json'), `${JSON.stringify(ssrReport, null, 2)}\n`);
console.log(JSON.stringify({ reports: [
  path.join(REPORT_DIR, 'legacy-runtime-risk-report.json'),
  path.join(REPORT_DIR, 'ts-migration-report.json'),
  path.join(REPORT_DIR, 'ssr-migration-report.json')
], totals: migrationInventory.totals }, null, 2));
