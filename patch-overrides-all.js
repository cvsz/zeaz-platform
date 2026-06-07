const fs = require('fs');

const apps = ["apps/web", "apps/ztrader/frontend", "apps/ABTPi18n", "apps/openwork"];
const packages = ["postcss", "follow-redirects", "qs", "uuid"];

for (const app of apps) {
  const pkgPath = app + '/package.json';
  if (!fs.existsSync(pkgPath)) continue;
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  pkg.resolutions = pkg.resolutions || {};
  pkg.overrides = pkg.overrides || {};
  for (const p of packages) {
    pkg.resolutions[p] = "latest";
    pkg.overrides[p] = "latest";
  }
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
}
