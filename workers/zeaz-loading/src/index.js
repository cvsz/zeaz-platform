const SECURITY_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/healthz") {
      return new Response(
        JSON.stringify({
          ok: true,
          service: "zeaz-loading",
          host: url.hostname,
          language: "th-en",
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
          },
        },
      );
    }

    return new Response(renderLoadingPage(env), {
      status: 200,
      headers: SECURITY_HEADERS,
    });
  },
};

function renderLoadingPage(env) {
  const brandName = escapeHtml(env.BRAND_NAME || "ZeaZ");
  const appUrl = escapeAttribute(env.APP_URL || "https://www.zeaz.dev");
  const statusTh = escapeHtml(env.STATUS_TEXT_TH || "กำลังเริ่มต้นระบบ Cloud");
  const statusEn = escapeHtml(env.STATUS_TEXT_EN || "Initializing Cloud Stack");

  return `<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="theme-color" content="#050816" />
  <title>${brandName} — กำลังโหลด / Loading</title>
  <style>
    :root { --bg1:#050816; --bg2:#07111f; --text:#f8fafc; --muted:#a7b3c7; --line:rgba(255,255,255,.16); --accent1:#7c3aed; --accent2:#06b6d4; --accent3:#22c55e; font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans Thai",sans-serif; }
    * { box-sizing:border-box; }
    html,body { margin:0; width:100%; min-height:100%; }
    body { min-height:100vh; color:var(--text); background:radial-gradient(circle at 18% 20%,rgba(124,58,237,.34),transparent 32%),radial-gradient(circle at 82% 18%,rgba(6,182,212,.28),transparent 30%),radial-gradient(circle at 50% 90%,rgba(34,197,94,.16),transparent 34%),linear-gradient(135deg,var(--bg1),var(--bg2) 62%,#020617); overflow:hidden; }
    main { position:relative; display:grid; min-height:100vh; place-items:center; padding:28px; isolation:isolate; }
    .grid { position:fixed; inset:0; z-index:-3; background-image:linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px); background-size:48px 48px; mask-image:radial-gradient(circle at center,black,transparent 76%); animation:drift 12s linear infinite; }
    .orb { position:fixed; z-index:-2; width:360px; height:360px; border-radius:999px; filter:blur(18px); opacity:.72; animation:float 7s ease-in-out infinite; }
    .orb.one { left:-110px; top:14%; background:rgba(124,58,237,.36); }
    .orb.two { right:-120px; bottom:10%; background:rgba(6,182,212,.3); animation-delay:-2.3s; }
    .card { width:min(100%,680px); padding:clamp(28px,5vw,52px); border:1px solid var(--line); border-radius:28px; background:linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.055)),rgba(5,8,22,.72); box-shadow:0 30px 90px rgba(0,0,0,.55); backdrop-filter:blur(24px); text-align:center; }
    .mark { position:relative; display:grid; width:104px; height:104px; margin:0 auto 26px; place-items:center; border-radius:28px; background:linear-gradient(135deg,rgba(124,58,237,.95),rgba(6,182,212,.88)); box-shadow:0 18px 52px rgba(6,182,212,.22),0 16px 45px rgba(124,58,237,.28); }
    .mark::before,.mark::after { content:""; position:absolute; inset:-10px; border-radius:36px; border:1px solid rgba(255,255,255,.2); animation:pulse 2.4s ease-out infinite; }
    .mark::after { inset:-22px; opacity:.36; animation-delay:.6s; }
    .letter { position:relative; z-index:1; font-size:46px; font-weight:900; letter-spacing:-.09em; text-shadow:0 8px 24px rgba(0,0,0,.28); }
    .eyebrow { display:inline-flex; align-items:center; gap:8px; padding:8px 12px; margin-bottom:18px; border:1px solid var(--line); border-radius:999px; color:#dbeafe; background:rgba(255,255,255,.07); font-size:12px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; }
    .dot { width:8px; height:8px; border-radius:999px; background:var(--accent3); box-shadow:0 0 0 7px rgba(34,197,94,.14); animation:blink 1.6s ease-in-out infinite; }
    h1 { margin:0; font-size:clamp(36px,7vw,68px); line-height:1.05; letter-spacing:-.04em; }
    .gradient { background:linear-gradient(90deg,#fff,#c4b5fd 38%,#67e8f9 72%,#bbf7d0); -webkit-background-clip:text; background-clip:text; color:transparent; }
    .subtitle { max-width:560px; margin:20px auto 32px; color:var(--muted); font-size:clamp(15px,2.5vw,18px); line-height:1.75; }
    .subtitle strong { color:#e5edff; font-weight:750; }
    .progress { position:relative; height:12px; overflow:hidden; border:1px solid var(--line); border-radius:999px; background:rgba(255,255,255,.08); }
    .bar { position:absolute; inset:0 auto 0 0; width:42%; border-radius:inherit; background:linear-gradient(90deg,var(--accent1),var(--accent2),var(--accent3)); box-shadow:0 0 28px rgba(6,182,212,.55); animation:load 2.25s ease-in-out infinite; }
    .chips { display:flex; flex-wrap:wrap; justify-content:center; gap:10px; margin-top:24px; }
    .chip { padding:9px 12px; border:1px solid var(--line); border-radius:999px; color:#d8e2f6; background:rgba(255,255,255,.06); font-size:13px; font-weight:650; }
    .actions { margin-top:26px; }
    .button { display:inline-flex; align-items:center; justify-content:center; min-height:44px; padding:0 18px; border:1px solid rgba(255,255,255,.18); border-radius:999px; color:white; background:rgba(255,255,255,.08); text-decoration:none; font-size:14px; font-weight:750; }
    @keyframes load { 0%{left:-44%;width:38%;} 45%{width:58%;} 100%{left:104%;width:38%;} }
    @keyframes pulse { 0%{transform:scale(.92);opacity:.8;} 100%{transform:scale(1.12);opacity:0;} }
    @keyframes blink { 0%,100%{opacity:.55;} 50%{opacity:1;} }
    @keyframes drift { to{background-position:48px 48px;} }
    @keyframes float { 0%,100%{transform:translate3d(0,0,0) scale(1);} 50%{transform:translate3d(22px,-18px,0) scale(1.06);} }
    @media (max-width:520px){ main{padding:18px;} .card{border-radius:24px;} .mark{width:88px;height:88px;border-radius:24px;} .letter{font-size:40px;} }
    @media (prefers-reduced-motion:reduce){ *,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;} }
  </style>
</head>
<body>
  <main aria-busy="true" aria-live="polite">
    <div class="grid" aria-hidden="true"></div><div class="orb one" aria-hidden="true"></div><div class="orb two" aria-hidden="true"></div>
    <section class="card" role="status" aria-label="${brandName} loading">
      <div class="mark" aria-hidden="true"><div class="letter">Z</div></div>
      <div class="eyebrow"><span class="dot" aria-hidden="true"></span>${statusTh} / ${statusEn}</div>
      <h1><span class="gradient">${brandName}</span><br />กำลังโหลดระบบ<br /><span style="font-size:.58em;letter-spacing:-.03em;color:#cbd5e1;">System Loading</span></h1>
      <p class="subtitle"><strong>ไทย:</strong> กำลังเตรียมระบบ AI Automation, Cloudflare Edge Routing, Zero Trust Access และ Workspace Security สำหรับเซสชันของคุณ<br /><br /><strong>English:</strong> Preparing AI automation, Cloudflare Edge routing, Zero Trust access, and secure workspace services for your session.</p>
      <div class="progress" aria-hidden="true"><div class="bar"></div></div>
      <div class="chips" aria-hidden="true"><span class="chip">Cloudflare Edge</span><span class="chip">Zero Trust</span><span class="chip">AI Control Plane</span><span class="chip">Secure Workspace</span></div>
      <div class="actions"><a class="button" href="${appUrl}">เปิดหน้าแดชบอร์ด / Open Dashboard</a></div>
    </section>
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
