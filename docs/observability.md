# Observability

Phase F6 observability is built with Prometheus, Grafana, Loki, OpenTelemetry Collector, and Alertmanager for Cloudflare-native monitoring and incident response.

## Components

- **Prometheus** scrapes cloudflared, otel collector, and self-metrics.
- **Grafana** dashboards track auth failures, WAF blocks, tunnel health, and Workers failures.
- **Loki** stores structured logs with ingestion limits.
- **OpenTelemetry Collector** receives OTLP logs/metrics and exports to Prometheus and Loki.
- **Alertmanager** routes operational and security alerts from Prometheus rules.

## Dashboards delivered

- `monitoring/grafana/dashboards/auth-failures.json`
- `monitoring/grafana/dashboards/waf-blocks.json`
- `monitoring/grafana/dashboards/tunnel-health.json`
- `monitoring/grafana/dashboards/workers-failures.json`

## Secrets and hardening

- Alert webhooks are loaded from mounted files:
  - `/etc/alertmanager/secrets/default_webhook_url`
  - `/etc/alertmanager/secrets/security_webhook_url`
- No static credentials are stored in Git.
- Log retention and ingestion limits are enforced in Loki.
- OTel collector memory limiter protects against telemetry surge failures.

## Validation

Run from repository root:

```bash
make validate
make security-scan
python3 -m pytest tests/test_runbooks.py
```
