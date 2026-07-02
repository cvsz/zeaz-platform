const APP_DIRECTORY = [
  { name: "api", path: "apps/api", url: "https://api.zeaz.dev", category: "Shared API", cloudflare: "tunnel" },
  { name: "ShipGenAI", path: "apps/ShipGenAI", url: "https://shipgenai.zeaz.dev", category: "AI media", cloudflare: "tunnel" },
  { name: "zacademy", path: "apps/zacademy", url: "https://academy.zeaz.dev", category: "Education", cloudflare: "tunnel" },
  { name: "zai", path: "apps/zai", url: "https://zai.zeaz.dev", category: "AI runtime", cloudflare: "tunnel" },
  { name: "zai-coder", path: "apps/zai-coder", url: "https://zai-coder.zeaz.dev", category: "Developer AI", cloudflare: "tunnel" },
  { name: "zai-factory", path: "apps/zai-factory", url: "https://factory.zeaz.dev", category: "Agent factory", cloudflare: "tunnel" },
  { name: "zaiz", path: "apps/zaiz", url: "https://zaiz.zeaz.dev", category: "AI application", cloudflare: "tunnel" },
  { name: "zcfdash", path: "apps/zcfdash", url: "https://zcfdash.zeaz.dev", category: "Cloudflare ops", cloudflare: "tunnel" },
  { name: "zchat", path: "apps/zchat", url: "https://zchat.zeaz.dev", category: "Messaging", cloudflare: "tunnel" },
  { name: "zcino", path: "apps/zcino", url: "https://zcino.zeaz.dev", category: "Game services", cloudflare: "tunnel" },
  { name: "zcloud", path: "apps/zcloud", url: "https://zcloud.zeaz.dev", category: "Cloud ops", cloudflare: "tunnel" },
  { name: "zdash", path: "apps/zdash", url: "https://zdash.zeaz.dev", category: "Platform ops", cloudflare: "tunnel" },
  { name: "zdev", path: "apps/zdev", url: "https://zdev.zeaz.dev", category: "Developer tools", cloudflare: "tunnel" },
  { name: "zeaz-api", path: "apps/zeaz-api", url: "https://zeaz-api.zeaz.dev", category: "API gateway", cloudflare: "tunnel" },
  { name: "zeaz-web", path: "apps/zeaz-web", url: "https://www.zeaz.dev", category: "Public web", cloudflare: "worker" },
  { name: "zfbauto", path: "apps/zfbauto", url: "https://zfbauto.zeaz.dev", category: "Automation", cloudflare: "tunnel" },
  { name: "zlinebot", path: "apps/zlinebot", url: "https://linebot.zeaz.dev", category: "Messaging bot", cloudflare: "tunnel" },
  { name: "zlms", path: "apps/zlms", url: "https://zlms.zeaz.dev", category: "Learning", cloudflare: "tunnel" },
  { name: "zoffice", path: "apps/zoffice", url: "https://zoffice.zeaz.dev", category: "Workspace", cloudflare: "tunnel" },
  { name: "zorg", path: "apps/zorg", url: "https://zorg.zeaz.dev", category: "Organization", cloudflare: "tunnel" },
  { name: "zow", path: "apps/zow", url: "https://zow.zeaz.dev", category: "Open work", cloudflare: "tunnel" },
  { name: "zquest", path: "apps/zquest", url: "https://zquest.zeaz.dev", category: "Quest app", cloudflare: "tunnel" },
  { name: "zsp-aitool", path: "apps/zsp-aitool", url: "https://zsp-aitool.zeaz.dev", category: "SaaS automation", cloudflare: "tunnel" },
  { name: "zsticker", path: "apps/zsticker", url: "https://zsticker.zeaz.dev", category: "Creative tools", cloudflare: "tunnel" },
  { name: "ztrader", path: "apps/ztrader", url: "https://ztrader.zeaz.dev", category: "Trading", cloudflare: "tunnel" },
  { name: "zveo", path: "apps/zveo", url: "https://zveo.zeaz.dev", category: "AI video", cloudflare: "tunnel" },
  { name: "zwallet", path: "apps/zwallet", url: "https://zwallet.zeaz.dev", category: "Fintech", cloudflare: "tunnel" },
];

const HTML_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Content-Security-Policy": "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data:; style-src 'unsafe-inline'; connect-src 'self'",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
};

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/healthz") {
      return jsonResponse({
        ok: true,
        service: "zeaz-loading",
        host: url.hostname,
        cloudflare_runtime: "worker",
        app_count: APP_DIRECTORY.length,
        timestamp: new Date().toISOString(),
      });
    }

    if (url.pathname === "/apps.json") {
      return jsonResponse({
        ok: true,
        zone: "zeaz.dev",
        cloudflare_runtime: {
          www_owner: "workers/zeaz-loading",
          app_owner: "cloudflare-tunnel",
        },
        apps: APP_DIRECTORY,
      });
    }

    return new Response(renderDirectoryPage(env), {
      status: 200,
      headers: HTML_HEADERS,
    });
  },
};

function jsonResponse(payload) {
  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: JSON_HEADERS,
  });
}

function renderDirectoryPage(env) {
  const brandName = escapeHtml(env.BRAND_NAME || "ZEAZDEV");
  const appCards = APP_DIRECTORY.map(
    (app) => `
      <article class="card">
        <div>
          <p class="path">${escapeHtml(app.path)}</p>
          <h2>${escapeHtml(app.name)}</h2>
          <p class="category">${escapeHtml(app.category)} · Cloudflare ${escapeHtml(app.cloudflare)}</p>
        </div>
        <a href="${escapeAttribute(app.url)}" rel="noopener">Open ${escapeHtml(app.name)}</a>
      </article>`,
  ).join("");

  return `<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="theme-color" content="#050816" />
  <title>${brandName} — Apps Directory</title>
  <style>
    :root { color-scheme: dark; --bg:#030712; --panel:rgba(15,23,42,.78); --line:rgba(255,255,255,.12); --text:#f8fafc; --muted:#94a3b8; --cyan:#67e8f9; --emerald:#86efac; font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans Thai",sans-serif; }
    * { box-sizing:border-box; }
    html,body { margin:0; min-height:100%; background:var(--bg); color:var(--text); }
    body { background:radial-gradient(circle at 12% 8%,rgba(34,211,238,.18),transparent 34%),radial-gradient(circle at 88% 18%,rgba(16,185,129,.12),transparent 28%),linear-gradient(180deg,rgba(2,6,23,.2),#020617); }
    main { width:min(1180px,100%); margin:0 auto; padding:28px 20px 56px; }
    header { display:flex; flex-wrap:wrap; align-items:flex-end; justify-content:space-between; gap:18px; padding:18px 0 28px; border-bottom:1px solid var(--line); }
    .brand { display:inline-flex; align-items:center; gap:12px; color:white; text-decoration:none; }
    .mark { display:grid; width:46px; height:46px; place-items:center; border-radius:16px; border:1px solid rgba(103,232,249,.32); background:rgba(103,232,249,.12); color:#cffafe; font-weight:900; }
    h1 { max-width:820px; margin:34px 0 12px; font-size:clamp(36px,7vw,72px); line-height:.96; letter-spacing:-.055em; }
    .lead { max-width:760px; margin:0; color:#cbd5e1; font-size:clamp(16px,2vw,20px); line-height:1.7; }
    .metrics { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; margin:28px 0; }
    .metric,.card { border:1px solid var(--line); background:var(--panel); box-shadow:0 24px 70px rgba(0,0,0,.28); backdrop-filter:blur(18px); }
    .metric { border-radius:22px; padding:18px; }
    .metric strong { display:block; font-size:30px; }
    .metric span { color:var(--muted); font-size:12px; font-weight:800; letter-spacing:.18em; text-transform:uppercase; }
    .grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; }
    .card { display:flex; min-height:190px; flex-direction:column; justify-content:space-between; border-radius:26px; padding:20px; }
    .path { margin:0; color:var(--cyan); font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace; font-size:12px; font-weight:800; letter-spacing:.12em; text-transform:uppercase; }
    h2 { margin:14px 0 8px; font-size:22px; }
    .category { margin:0; color:var(--muted); line-height:1.5; }
    a { color:var(--cyan); font-weight:800; text-decoration:none; }
    .card a { display:inline-flex; width:max-content; margin-top:18px; border-bottom:1px solid rgba(103,232,249,.44); }
    .note { margin-top:28px; color:var(--muted); line-height:1.7; }
    .note strong { color:var(--emerald); }
    @media (max-width:860px) { .grid,.metrics { grid-template-columns:1fr; } }
  </style>
</head>
<body>
  <main>
    <header>
      <a class="brand" href="https://zeaz.dev" aria-label="ZEAZDEV home"><span class="mark">Z</span><span><strong>${brandName}</strong><br /><small>Cloudflare Apps Directory</small></span></a>
      <a href="/apps.json">JSON URL list</a>
    </header>
    <section>
      <h1>Active apps/* URLs under zeaz.dev.</h1>
      <p class="lead">ไทย: รายการ URL ของแอปทั้งหมดใน workspace <strong>apps/*</strong> สำหรับให้บริการผ่าน Cloudflare Worker และ Cloudflare Tunnel ภายใต้โดเมน zeaz.dev</p>
      <div class="metrics">
        <div class="metric"><strong>${APP_DIRECTORY.length}</strong><span>Active apps</span></div>
        <div class="metric"><strong>Cloudflare</strong><span>Runtime edge</span></div>
        <div class="metric"><strong>*.zeaz.dev</strong><span>Public URLs</span></div>
      </div>
    </section>
    <section class="grid" aria-label="Active app URL list">${appCards}</section>
    <p class="note"><strong>Runtime:</strong> this page is served by the <code>workers/zeaz-loading</code> Cloudflare Worker on <code>www.zeaz.dev/*</code>. App links are intended Cloudflare Tunnel hostnames. Deploying changes still requires explicit operator approval.</p>
  </main>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}
