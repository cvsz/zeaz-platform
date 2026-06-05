#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const REPORT = {
  generatedAt: new Date().toISOString(),
  vendorAssets: [],
  riskyAssets: []
};

function walk(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);

    if (stat.isDirectory()) {
      walk(full);
      continue;
    }

    if (
      full.includes('vendor') ||
      full.includes('dist') ||
      full.includes('.min.js')
    ) {
      REPORT.vendorAssets.push(full);

      if (
        full.includes('jquery') ||
        full.includes('bootstrap') ||
        full.includes('owl')
      ) {
        REPORT.riskyAssets.push({
          asset: full,
          severity: 'HIGH',
          recommendation: 'Replace or isolate asset'
        });
      }
    }
  }
}

walk('.');

fs.mkdirSync('security/reports', { recursive: true });

fs.writeFileSync(
  'security/reports/vendor-isolation-report.json',
  JSON.stringify(REPORT, null, 2)
);

console.log(JSON.stringify(REPORT, null, 2));
