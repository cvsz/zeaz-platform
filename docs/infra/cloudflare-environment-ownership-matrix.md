# Cloudflare Environment Ownership Matrix

| Environment | Resource Type | Owner | Approval Required | Evidence Required |
|-------------|---------------|-------|-------------------|-------------------|
| **dev** | DNS Records | Dev Team | None | None |
| **dev** | Workers | Dev Team | None | None |
| **dev** | Tunnels | Dev Team | None | None |
| **staging** | DNS Records | Dev Team | DevOps Lead | Summary |
| **staging** | Workers | Dev Team | DevOps Lead | Summary |
| **staging** | Tunnels | Dev Team | DevOps Lead | Summary |
| **prod** | Apex DNS | DevOps Team | Review Board | Full Archive |
| **prod** | Wildcard DNS | DevOps Team | Review Board | Full Archive |
| **prod** | Hostname Routing | DevOps Team | Review Board | Full Archive |
| **prod** | Workers | Dev/DevOps | Review Board | Full Archive |
| **prod** | Tunnels | Security Team | Review Board | Full Archive |
| **prod** | SSL/TLS | Security Team | Review Board | Full Archive |

## Approval Roles

- **Dev Team**: Primary developers responsible for feature implementation.
- **DevOps Lead**: Senior engineer overseeing staging stability.
- **Review Board**: Multi-stakeholder group defined in Phase 15.
- **Security Team**: Responsible for root certificate and tunnel security.
