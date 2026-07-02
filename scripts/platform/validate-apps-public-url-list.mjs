import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "configs/platform/apps-public-url-list.json");
const workerPath = path.join(root, "workers/zeaz-loading/src/index.js");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));

const errors = [];
const apps = registry.apps ?? [];
const appDirs = fs
  .readdirSync(path.join(root, "apps"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => !name.startsWith("."))
  .sort();

const paths = new Set(apps.map((app) => app.path));
const hostnames = new Set();
const urls = new Set();

for (const appDir of appDirs) {
  const expectedPath = `apps/${appDir}`;
  if (!paths.has(expectedPath)) {
    errors.push(`missing apps/* entry: ${expectedPath}`);
  }
}

for (const app of apps) {
  if (app.status !== "active") {
    errors.push(`${app.path}: status must be active`);
  }

  if (!fs.existsSync(path.join(root, app.path))) {
    errors.push(`${app.path}: directory does not exist`);
  }

  if (!app.hostname.endsWith(".zeaz.dev")) {
    errors.push(`${app.path}: hostname must be under *.zeaz.dev`);
  }

  if (hostnames.has(app.hostname)) {
    errors.push(`${app.path}: duplicate hostname ${app.hostname}`);
  }
  hostnames.add(app.hostname);

  if (app.url !== `https://${app.hostname}`) {
    errors.push(`${app.path}: url must be https://${app.hostname}`);
  }

  if (urls.has(app.url)) {
    errors.push(`${app.path}: duplicate url ${app.url}`);
  }
  urls.add(app.url);

  if (!["worker", "tunnel"].includes(app.cloudflare)) {
    errors.push(`${app.path}: cloudflare must be worker or tunnel`);
  }
}

const workerSource = fs.readFileSync(workerPath, "utf8");
for (const app of apps) {
  if (!workerSource.includes(app.url)) {
    errors.push(`workers/zeaz-loading/src/index.js: missing ${app.url}`);
  }
}

if (errors.length > 0) {
  console.error("Apps public URL list validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Validated ${apps.length} active apps/* Cloudflare URLs.`);
