import registry from "../integrations.registry.json";
import "./integration-status.css";

const STATUS_ENDPOINT = "/api/integrations/status";
const P0_MODULES = new Set(["trading", "risk", "cloudflare-ops"]);

function createNode(tagName, className, text) {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function statusFromRegistry() {
  return {
    source: "registry-fallback",
    generated_at: new Date().toISOString(),
    modules: registry.integration_targets.map((target) => ({
      module: target.module,
      priority: target.priority,
      status: P0_MODULES.has(target.module) ? "adapter-required" : "planned",
      mode: target.mode,
      health: "unknown",
      latency_ms: null,
      last_event: "No backend adapter connected yet",
    })),
  };
}

async function loadStatus() {
  try {
    const response = await fetch(STATUS_ENDPOINT, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`status ${response.status}`);
    const payload = await response.json();
    if (!payload || !Array.isArray(payload.modules)) throw new Error("invalid status payload");
    return {
      source: "api",
      generated_at: payload.generated_at || new Date().toISOString(),
      modules: payload.modules,
    };
  } catch (error) {
    return {
      ...statusFromRegistry(),
      error: error instanceof Error ? error.message : "unknown error",
    };
  }
}

function scoreStatus(status) {
  if (status === "online") return 100;
  if (status === "degraded") return 60;
  if (status === "planned") return 35;
  if (status === "adapter-required") return 20;
  if (status === "offline") return 0;
  return 10;
}

function statusTone(status) {
  if (status === "online") return "green";
  if (status === "degraded") return "gold";
  if (status === "planned") return "cyan";
  if (status === "adapter-required") return "purple";
  if (status === "offline") return "red";
  return "orange";
}

function metric(label, value, tone) {
  const node = createNode("article", `status-summary tone-${tone}`);
  node.append(createNode("span", "", label));
  node.append(createNode("strong", "", value));
  return node;
}

function statusRow(item) {
  const tone = statusTone(item.status);
  const row = createNode("article", `status-row tone-${tone}`);
  const title = createNode("div", "status-title");
  title.append(createNode("h3", "", item.module));
  title.append(createNode("p", "", item.mode || "adapter"));

  const badge = createNode("span", "status-badge", `${item.priority || "P?"} · ${item.status}`);
  const progress = createNode("div", "status-progress");
  const fill = createNode("i");
  fill.style.width = `${scoreStatus(item.status)}%`;
  progress.append(fill);

  const meta = createNode("div", "status-meta");
  meta.append(createNode("span", "", `health: ${item.health || "unknown"}`));
  meta.append(createNode("span", "", item.latency_ms == null ? "latency: n/a" : `latency: ${item.latency_ms}ms`));
  meta.append(createNode("span", "", item.last_event || "No events"));

  row.append(title, badge, progress, meta);
  return row;
}

function renderStatus(payload) {
  const section = createNode("section", "section zdash-integration-status");
  section.id = "integration-status";
  const online = payload.modules.filter((item) => item.status === "online").length;
  const planned = payload.modules.filter((item) => item.status === "planned").length;
  const required = payload.modules.filter((item) => item.status === "adapter-required").length;

  section.append(createNode("div", "section-title", "12 — INTEGRATION STATUS"));
  section.append(createNode("h2", "section-heading", "Adapter Health & Readiness"));
  section.append(createNode("p", "section-sub", "Reads /api/integrations/status when available. Until backend adapters exist, zDash safely falls back to the registry and marks P0 systems as adapter-required."));

  const summary = createNode("div", "status-summary-grid");
  summary.append(
    metric("Status source", payload.source, payload.source === "api" ? "green" : "gold"),
    metric("Online", String(online), "green"),
    metric("Planned", String(planned), "cyan"),
    metric("Adapters needed", String(required), "purple"),
  );
  section.append(summary);

  if (payload.error) section.append(createNode("div", "status-notice", `API fallback active: ${payload.error}`));

  const grid = createNode("div", "status-grid");
  payload.modules.forEach((item) => grid.append(statusRow(item)));
  section.append(grid);

  const footer = createNode("div", "status-footer");
  footer.append(createNode("span", "", `generated: ${payload.generated_at}`));
  footer.append(createNode("span", "", `endpoint: ${STATUS_ENDPOINT}`));
  section.append(footer);
  return section;
}

async function mountIntegrationStatus() {
  const main = document.querySelector("main.container") || document.querySelector("main.shell");
  if (!main) {
    window.setTimeout(mountIntegrationStatus, 50);
    return;
  }
  if (document.getElementById("integration-status")) return;

  const section = renderStatus(await loadStatus());
  const footer = main.querySelector("footer");
  if (footer) main.insertBefore(section, footer);
  else main.append(section);
}

mountIntegrationStatus();
