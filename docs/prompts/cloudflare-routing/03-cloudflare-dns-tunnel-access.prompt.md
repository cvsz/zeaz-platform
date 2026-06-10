# AI Agent Prompt — Cloudflare DNS + Tunnel + Access Planning

Design a no-cost Cloudflare routing plan.

Inputs:
- Zone: `zeaz.dev`
- Tunnel DNS target: `${CLOUDFLARE_TUNNEL_ID}.cfargotunnel.com`
- Origin service from cloudflared: `http://traefik:80`
- Domain map: `configs/domain-map.zeaz-platform.json`

Deliver:
- DNS CNAME plan for each hostname.
- Apex `zeaz.dev` handling plan with Cloudflare-compatible flattening/redirect note.
- Tunnel ingress config.
- Access policy matrix.
- API hostname security policy.
- Rollback plan.

Constraints:
- DNS records and Tunnel are independent; verify both.
- Create one CNAME per hostname pointing to the same tunnel target.
- Do not enable Load Balancing.
- Do not enable paid WAF.
- Keep API operations behind explicit apply gates.
