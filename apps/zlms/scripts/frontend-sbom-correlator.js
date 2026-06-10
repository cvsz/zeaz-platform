#!/usr/bin/env node

import fs from 'node:fs';

const report = {
  generatedAt: new Date().toISOString(),
  correlatedPackages: [],
  supplyChainRisks: []
};

if (fs.existsSync('package.json')) {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  const deps = {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {})
  };

  for (const [name, version] of Object.entries(deps)) {
    report.correlatedPackages.push({
      package: name,
      version
    });

    if (
      name.includes('jquery') ||
      name.includes('bootstrap') ||
      name.includes('moment') ||
      name.includes('lodash')
    ) {
      report.supplyChainRisks.push({
        package: name,
        version,
        risk: 'HIGH',
        recommendation: 'Replace or isolate dependency'
      });
    }
  }
}

fs.mkdirSync('security/reports', { recursive: true });

fs.writeFileSync(
  'security/reports/frontend-sbom-correlation.json',
  JSON.stringify(report, null, 2)
);

console.log(JSON.stringify(report, null, 2));
