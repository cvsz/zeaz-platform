import fs from "node:fs";
import https from "node:https";
import path from "node:path";

const root = process.cwd();
const registryPath = path.join(root, "configs/platform/apps-public-url-list.json");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const args = new Map();

for (let index = 2; index < process.argv.length; index += 1) {
  const arg = process.argv[index];
  if (arg === "--output") {
    args.set("output", process.argv[index + 1]);
    index += 1;
  } else if (arg === "--help" || arg === "-h") {
    console.log(`Usage: node scripts/platform/probe-apps-cloudflare-runtime.mjs [--output PATH]

Read-only probe for active apps/* URLs. It resolves hostnames through Cloudflare
DNS-over-HTTPS, sends HTTPS HEAD requests with SNI, and checks for Cloudflare
edge headers without mutating Cloudflare resources.`);
    process.exit(0);
  } else {
    throw new Error(`Unknown argument: ${arg}`);
  }
}

async function resolveViaCloudflare(hostname) {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=A`;
  const response = await fetch(url, { headers: { accept: "application/dns-json" } });
  if (!response.ok) {
    throw new Error(`DNS query failed with HTTP ${response.status}`);
  }

  const payload = await response.json();
  const answers = (payload.Answer ?? [])
    .filter((answer) => answer.type === 1)
    .map((answer) => answer.data);

  if (answers.length === 0) {
    throw new Error(`No public A record from Cloudflare DNS`);
  }

  return answers[0];
}

function headWithIp(app, address) {
  return new Promise((resolve) => {
    const request = https.request(
      app.url,
      {
        method: "HEAD",
        timeout: 8000,
        servername: app.hostname,
        headers: {
          Host: app.hostname,
          "User-Agent": "zeaz-platform-cloudflare-runtime-probe/1.0",
        },
        lookup: (_hostname, options, callback) => {
          if (options?.all) {
            callback(null, [{ address, family: 4 }]);
            return;
          }
          callback(null, address, 4);
        },
      },
      (response) => {
        response.resume();
        const server = response.headers.server || "";
        const cfRay = response.headers["cf-ray"] || "";
        resolve({
          name: app.name,
          path: app.path,
          url: app.url,
          cloudflare_runtime: app.cloudflare,
          dns_address: address,
          status_code: response.statusCode,
          server,
          cf_ray: cfRay,
          cf_cache_status: response.headers["cf-cache-status"] || "",
          cloudflare_edge: /cloudflare/i.test(server) || Boolean(cfRay),
        });
      },
    );

    request.on("timeout", () => request.destroy(new Error("timeout")));
    request.on("error", (error) => {
      resolve({
        name: app.name,
        path: app.path,
        url: app.url,
        cloudflare_runtime: app.cloudflare,
        dns_address: address,
        error: error.message,
        cloudflare_edge: false,
      });
    });
    request.end();
  });
}

async function probe(app) {
  try {
    const address = await resolveViaCloudflare(app.hostname);
    return headWithIp(app, address);
  } catch (error) {
    return {
      name: app.name,
      path: app.path,
      url: app.url,
      cloudflare_runtime: app.cloudflare,
      error: error.message,
      cloudflare_edge: false,
    };
  }
}

function renderMarkdown(report) {
  const rows = report.results
    .map((result) => {
      const status = result.cloudflare_edge ? "PASS" : "FAIL";
      const code = result.status_code ?? "ERR";
      const evidence = result.cf_ray ? `cf-ray ${result.cf_ray}` : result.error ?? "no edge header";
      return `| ${result.name} | \`${result.path}\` | ${result.url} | ${result.cloudflare_runtime} | ${code} | ${status} | ${evidence} |`;
    })
    .join("\n");

  return `# Apps Cloudflare Runtime Probe

Generated: ${report.checked_at}

Source registry: \`configs/platform/apps-public-url-list.json\`

Summary:

- Total apps: ${report.total}
- Cloudflare edge confirmed: ${report.cloudflare_edge_count}
- Not confirmed: ${report.total - report.cloudflare_edge_count}

| App | Path | URL | Runtime | HTTP | Edge | Evidence |
|---|---|---|---|---:|---|---|
${rows}

Notes:

- This is a read-only probe.
- DNS resolution uses Cloudflare DNS-over-HTTPS to avoid local host overrides.
- HTTP 4xx/5xx can still confirm Cloudflare edge presence when \`server: cloudflare\` or \`cf-ray\` is present.
- A passing edge probe does not prove the origin app is healthy; it proves the hostname is routed through Cloudflare.
`;
}

const results = [];
for (const app of registry.apps) {
  results.push(await probe(app));
}

const report = {
  checked_at: new Date().toISOString(),
  source: "configs/platform/apps-public-url-list.json",
  total: results.length,
  cloudflare_edge_count: results.filter((result) => result.cloudflare_edge).length,
  results,
};

const outputPath = args.get("output");
if (outputPath) {
  const absoluteOutput = path.resolve(root, outputPath);
  fs.mkdirSync(path.dirname(absoluteOutput), { recursive: true });
  fs.writeFileSync(absoluteOutput, renderMarkdown(report));
}

console.log(JSON.stringify(report, null, 2));

if (report.cloudflare_edge_count !== report.total) {
  process.exit(1);
}
