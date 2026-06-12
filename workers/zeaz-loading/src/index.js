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
          redirect: env.APP_URL || "https://app.zeaz.dev",
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

    const appUrl = env.APP_URL || "https://app.zeaz.dev";
    const dest = new URL(appUrl);
    dest.pathname = url.pathname;
    dest.search = url.search;

    return Response.redirect(dest.toString(), 301);
  },
};
