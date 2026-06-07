const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.resolutions = pkg.resolutions || {};
pkg.overrides = pkg.overrides || {};
const packages = [
  "protobufjs", "seroval", "react-router", "next", "fast-uri", "fast-xml-parser",
  "@opentelemetry/sdk-node", "@opentelemetry/exporter-prometheus", "defu", "axios", "tar", "xlsx", "samlify", "tmp", "rollup", "diff", "yaml", "ws"
];

for (const p of packages) {
  pkg.resolutions[p] = "latest";
  pkg.overrides[p] = "latest";
}

if (pkg.pnpm && pkg.pnpm.overrides) {
  delete pkg.pnpm.overrides;
}

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log("Added overrides correctly");
