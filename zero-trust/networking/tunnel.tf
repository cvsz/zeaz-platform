# zeaz-tunnel — active tunnel ID: eebf6c99-b37e-450b-851b-0bc8e427280d
# Credentials: /home/zeazdev/.cloudflared/eebf6c99-b37e-450b-851b-0bc8e427280d.json
# Config: /home/zeazdev/.cloudflared/config.yml
# Service: systemd cloudflared (protocol: http2)
#
# Tunnel routes all zeaz.dev subdomains including zagents.zeaz.dev -> :3009

resource "cloudflare_tunnel" "zeaz_tunnel" {
  account_id = var.account_id
  name       = "zeaz-tunnel"
  secret     = var.tunnel_secret # stored in tfvars / env secret
}

resource "cloudflare_tunnel_config" "zeaz_tunnel_config" {
  account_id = var.account_id
  tunnel_id  = cloudflare_tunnel.zeaz_tunnel.id

  config {
    ingress_rule {
      hostname = "zagents.zeaz.dev"
      service  = "http://127.0.0.1:3009"
    }
    ingress_rule {
      hostname = "zdash.zeaz.dev"
      service  = "http://127.0.0.1:5173"
    }
    ingress_rule {
      hostname = "api-zdash.zeaz.dev"
      service  = "http://127.0.0.1:8005"
    }
    ingress_rule {
      hostname = "zveo.zeaz.dev"
      service  = "http://127.0.0.1:3002"
    }
    ingress_rule {
      hostname = "www.zeaz.dev"
      service  = "http://127.0.0.1:3003"
    }
    ingress_rule {
      hostname = "zeaz.dev"
      service  = "http://127.0.0.1:3003"
    }
    ingress_rule {
      service = "http_status:404"
    }
  }
}
