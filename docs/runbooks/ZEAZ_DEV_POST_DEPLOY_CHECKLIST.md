# ZEAZ_DEV_POST_DEPLOY_CHECKLIST

## Preflight

- Confirm all apply confirmations were intentional.
- Confirm cost lock remained enabled.
- Confirm no secrets were printed.

## Validation

- Verify `zeaz.dev` redirects to `www.zeaz.dev`.
- Verify `zzdash.zeaz.dev` serves the frontend.
- Verify `api-zzdash.zeaz.dev` reaches the backend.
- Verify the fallback 404 ingress still blocks unmatched hosts.

## Evidence capture

- Save the live verification report.
- Archive the route plan and rollback plan.

## Monitoring

- Watch for 4xx/5xx spikes.
- Watch for tunnel connectivity loss.
- Watch for Access policy regressions.

