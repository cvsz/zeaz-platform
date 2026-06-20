# 2026-06-20-zcfdash-dashboard-design

## 1. Backend Integration Plan (FastAPI)
*   **Service:** `apps/zcfdash/backend/main.py`
*   **Endpoints:**
    *   `GET /health`: Basic service liveness check.
    *   `GET /api/connectivity`: Polls defined subdomains (DNS/HTTP status).
    *   `GET /api/cloudflare/tunnels`: Fetches tunnel status via Cloudflare API.
    *   `GET /api/cloudflare/waf`: Fetches recent WAF alert logs.
*   **Implementation:** Use `httpx` for async API calls and `fastapi` for the framework.

## 2. Frontend UI/UX Update
*   **UI Refresh:** Replace the static HTML with a responsive, modern interface (ZEAZ System tokens).
*   **Realtime Polling:** Use JavaScript (`fetch`/`setInterval`) to poll the backend endpoints (e.g., every 30 seconds for tunnel status, 60 seconds for DNS).
*   **Visuals:**
    *   **Dashboard Grid:** Cards for "Connectivity", "Tunnels", and "WAF Alerts".
    *   **Status Indicators:** Color-coded badges (Green: Healthy, Yellow: Warning, Red: Error).

## 3. Security & Infrastructure
*   **Secrets:** API tokens will be managed exclusively via environment variables (e.g., `CLOUDFLARE_READ_ONLY_TOKEN`) injected at runtime; **no secrets in code**.
*   **Deployment:** Update `docker-compose.yml` to include the new Python service, linked to the `proxy` network, with appropriate Traefik labels for routing.
*   **Token Scoping:** Ensure the `CLOUDFLARE_API_TOKEN` has the absolute minimum permissions (e.g., `Zone.Read`, `Tunnel.Read`).
