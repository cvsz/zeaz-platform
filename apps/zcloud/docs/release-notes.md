# zcloud Final Release Notes

## Release scope

This release establishes the first complete zcloud operator cockpit under `apps/zcloud`.

## CloudPanel v2 coverage map

| Area | zcloud implementation |
| --- | --- |
| Introduction, requirements, technology stack | Hero metrics, stack compatibility cards, VM-only warning, requirements ribbon |
| Getting started | Provider launch matrix and install decision workflow |
| Frontend area | Site factory catalog, workload templates, DNS/TLS/database reminders |
| Admin area | Instance, users, security, events, settings, backups, and cloud feature tiles |
| CLI | Root and site-user command references with safe parameter syntax |
| Guides | Security, migration, Node.js PM2, Python uWSGI, and application patterns |
| Support and changelog | Upstream links and operator verification guidance |

## Known limitations

- zcloud is a static cockpit and does not authenticate to CloudPanel.
- Commands are intentionally references, not executable automation.
- Operators must validate the current upstream CloudPanel docs before installation or upgrades.
