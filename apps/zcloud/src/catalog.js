export const coverage = [
  { title: 'Platform baseline', area: 'Introduction, requirements, stack', detail: 'Captures supported operating systems (Ubuntu 24.04/22.04 LTS, Debian 12/11), CPU/memory requirements, VM-only deployment constraints, and technology stacks (Nginx, PHP-FPM, MySQL/MariaDB, Node.js, Python, Redis, Varnish Cache).', status: 'Complete' },
  { title: 'Launch paths', area: 'Getting started', detail: 'Models marketplace and installer workflows for hyperscalers, VPS providers, and generic virtual machines.', status: 'Complete' },
  { title: 'Frontend operations', area: 'Sites, TLS, databases, logs, cron, SSH/FTP', detail: 'Turns daily site administration into workload blueprints with input, validation, and handoff checkpoints.', status: 'Complete' },
  { title: 'Admin operations', area: 'Users, instance, settings, backups, cloud features', detail: 'Documents privileged operations, cloud backups automation, and separates them from site-user actions for least privilege.', status: 'Complete' },
  { title: 'Runtime guides', area: 'PHP, Node.js, Python, static, reverse proxy', detail: 'Summarizes application-specific deployment concerns including PM2 and uWSGI production patterns.', status: 'Complete' },
  { title: 'Security posture', area: 'Best practices and security pages', detail: 'Highlights firewall, Basic Auth, 2FA, updates, backups, TLS, and provider firewall alignment.', status: 'Complete' }
];

export const providers = [
  { name: 'Amazon Web Services', method: 'AMI or installer', os: 'Ubuntu 24.04/22.04 LTS, Debian 12/11', arch: 'x86 / ARM64', readiness: ['Use security groups before host firewall', 'Confirm least-privilege IAM for cloud features', 'Snapshot before upgrades'], docs: 'https://www.cloudpanel.io/docs/v2/getting-started/amazon-web-services/installation/ami/' },
  { name: 'DigitalOcean', method: 'Marketplace or installer', os: 'Ubuntu 24.04/22.04 LTS, Debian 12/11', arch: 'x86', readiness: ['Restrict SSH and panel ports', 'Enable backups or snapshots', 'Verify domain DNS before TLS issuance'], docs: 'https://www.cloudpanel.io/docs/v2/getting-started/digital-ocean/installation/marketplace/' },
  { name: 'Hetzner Cloud', method: 'Installer', os: 'Ubuntu 24.04/22.04 LTS, Debian 12/11', arch: 'x86 / ARM64', readiness: ['Use cloud firewall rules', 'Validate reverse DNS where mail is planned', 'Keep panel access behind trusted IPs'], docs: 'https://www.cloudpanel.io/docs/v2/getting-started/hetzner-cloud/installation/installer/' },
  { name: 'Google Compute Engine', method: 'Installer', os: 'Ubuntu 24.04/22.04 LTS, Debian 12/11', arch: 'x86', readiness: ['Use VPC firewall first', 'Document service account scope', 'Reserve static external IP when required'], docs: 'https://www.cloudpanel.io/docs/v2/getting-started/google-compute-engine/installation/installer/' },
  { name: 'Microsoft Azure', method: 'Installer', os: 'Ubuntu 24.04/22.04 LTS, Debian 12/11', arch: 'x86', readiness: ['Limit network security group ingress', 'Enable boot diagnostics', 'Document managed disk snapshot plan'], docs: 'https://www.cloudpanel.io/docs/v2/getting-started/microsoft-azure/installation/installer/' },
  { name: 'Oracle Cloud', method: 'Installer', os: 'Ubuntu 24.04/22.04 LTS, Debian 12/11', arch: 'x86 / ARM64', readiness: ['Review security list and network rules', 'Confirm shape memory meets baseline', 'Test panel access from trusted IP only'], docs: 'https://www.cloudpanel.io/docs/v2/getting-started/oracle-cloud/installation/installer/' },
  { name: 'Vultr', method: 'Marketplace or installer', os: 'Ubuntu 24.04/22.04 LTS, Debian 12/11', arch: 'x86', readiness: ['Enable provider firewall', 'Confirm backups policy', 'Validate DNS and TLS after provisioning'], docs: 'https://www.cloudpanel.io/docs/v2/getting-started/vultr/installation/marketplace/' },
  { name: 'Other VM', method: 'Installer', os: 'Ubuntu 24.04/22.04 or Debian 13/12/11', arch: 'x86 / ARM64', readiness: ['Avoid LXC/OpenVZ-style containers (CloudPanel must be deployed on VM or bare-metal)', 'Provide at least 1 CPU, 2 GB RAM, and 10 GB disk', 'Patch OS before install'], docs: 'https://www.cloudpanel.io/docs/v2/getting-started/other/' }
];

export const workloads = [
  { name: 'WordPress', kind: 'PHP application', inputs: ['Domain name', 'Site user', 'PHP version', 'Database engine'], guardrails: ['Store generated credentials outside git', 'Enable automatic HTTPS', 'Add backup schedule before launch'], outcome: 'Content site ready for plugin and theme hardening.' },
  { name: 'PHP Frameworks', kind: 'Laravel, Symfony, Slim, Magento, Drupal, Shopware, and more', inputs: ['Document root', 'PHP version', 'Composer workflow', 'Database mapping'], guardrails: ['Use per-site SSH user', 'Keep migration plan reversible', 'Validate writable directories only where needed'], outcome: 'Framework site aligned to CloudPanel vhost conventions.' },
  { name: 'Node.js with PM2', kind: 'Node.js runtime', inputs: ['App port', 'Start command', 'PM2 process name', 'Site user'], guardrails: ['Run as site user, not root', 'Persist PM2 process list', 'Add reboot recovery check'], outcome: 'Node.js process supervised behind NGINX.' },
  { name: 'Python with uWSGI', kind: 'Python runtime', inputs: ['App port or socket', 'uWSGI file', 'UID/GID', 'Virtualenv path'], guardrails: ['Keep config under operator review', 'Set buffer for auth flows when needed', 'Restart service after config validation'], outcome: 'Python app served through uWSGI and NGINX.' },
  { name: 'Static HTML', kind: 'Static site', inputs: ['Domain name', 'Site user', 'Public files'], guardrails: ['No server-side secrets in public assets', 'Validate security headers at edge', 'Enable TLS before production'], outcome: 'Low-risk static site with clear deploy path.' },
  { name: 'Reverse Proxy', kind: 'Proxy site', inputs: ['Upstream URL', 'Domain name', 'TLS mode', 'Health check'], guardrails: ['Do not proxy to unrestricted internal ranges', 'Validate origin auth separately', 'Log upstream failures'], outcome: 'Controlled NGINX proxy endpoint.' },
  { name: 'Database-backed App', kind: 'MySQL/MariaDB', inputs: ['Database name', 'Database user', 'Password supplied at runtime'], guardrails: ['Never commit database passwords', 'Use least-privilege grants', 'Back up before migrations'], outcome: 'Application data plane documented and recoverable.' }
];

export const securityControls = [
  { phase: 'Network edge', title: 'Provider firewall first', detail: 'Restrict SSH (port 22) and CloudPanel access (port 8443) to trusted operator IPs or VPN ranges before traffic reaches the host firewall.' },
  { phase: 'Panel access', title: 'Basic Auth plus 2FA', detail: 'Place an additional authentication layer (Basic Auth) in front of the panel and enforce Two-Factor Authentication (2FA) for all administrative accounts.' },
  { phase: 'Host posture', title: 'Patch and update cadence', detail: 'Keep the operating system and CloudPanel current using clp-update. Capture VM snapshots before applying major system upgrades.' },
  { phase: 'Site isolation', title: 'Least-privilege site users', detail: 'Use dedicated system/SSH users per site so application files and runtime permissions are strictly isolated.' },
  { phase: 'Data safety', title: 'Cloud backups automation', detail: 'Integrate automated Cloud Backups using Dropbox, Google Drive, AWS S3, Wasabi, Backblaze B2, or SFTP targets before data is onboarded.' },
  { phase: 'Transport', title: 'SSL/TLS and DNS validation', detail: 'Ensure domain DNS records are propagated, issue Let\'s Encrypt certificates, and verify HTTP/3 TLS requirements before public deployment.' }
];

export const commands = [
  { title: 'List users', role: 'Root user', command: 'clpctl user:list', note: 'Inventory all CloudPanel admin users.' },
  { title: 'Add admin user', role: 'Root user', command: 'clpctl user:add --userName=operator --email=ops@example.invalid --password=$PASSWORD --role=admin', note: 'Create a new admin user with credentials.' },
  { title: 'Delete admin user', role: 'Root user', command: 'clpctl user:delete --userName=operator', note: 'Permanently remove an admin user.' },
  { title: 'Reset user password', role: 'Root user', command: 'clpctl user:reset:password --userName=operator --password=$NEW_PASSWORD', note: 'Reset password for a specific user.' },
  { title: 'Disable MFA/2FA', role: 'Root user', command: 'clpctl user:disable:mfa --userName=operator', note: 'Disable multi-factor auth for a locked-out operator.' },
  { title: 'Install Let\'s Encrypt TLS', role: 'Root user', command: 'clpctl lets-encrypt:install:certificate --domainName=www.example.invalid', note: 'Issue and configure a TLS certificate for a domain.' },
  { title: 'Add database', role: 'Site or root workflow', command: 'clpctl db:add --domainName=www.example.invalid --databaseName=appdb --databaseUserName=appuser --databaseUserPassword=$DATABASE_PASSWORD', note: 'Supply the database password securely at runtime.' },
  { title: 'Export database', role: 'Site user', command: 'clpctl db:export --databaseName=appdb --file=/home/user/backups/appdb.sql', note: 'Export database to a local file.' },
  { title: 'Import database', role: 'Site user', command: 'clpctl db:import --databaseName=appdb --file=/home/user/backups/appdb.sql', note: 'Import database from a local file.' },
  { title: 'Reset permissions', role: 'Root user', command: 'clpctl system:permissions:reset --directories=770 --files=660 --path=.', note: 'Reset folder/file permissions to CloudPanel standards.' },
  { title: 'Enable Basic Auth', role: 'Root user', command: 'clpctl cloudpanel:enable:basic-auth --userName=admin --password=$AUTH_PASSWORD', note: 'Enable Basic Auth layer in front of the panel.' },
  { title: 'Disable Basic Auth', role: 'Root user', command: 'clpctl cloudpanel:disable:basic-auth', note: 'Disable the Basic Auth layer.' },
  { title: 'Update Cloudflare IPs', role: 'Root user', command: 'clpctl cloudflare:update:ips', note: 'Manually fetch and update active Cloudflare IP ranges.' },
  { title: 'Purge Varnish cache', role: 'Site user', command: 'clpctl varnish-cache:purge --purge=all', note: 'Clear Varnish cache completely.' },
  { title: 'PM2 start', role: 'Site user', command: 'pm2 start npm --name zcloud-app -- start', note: 'Run inside the Node.js project directory.' },
  { title: 'Save PM2 state', role: 'Site user', command: 'pm2 save', note: 'Persist the Node.js PM2 process list.' },
  { title: 'Edit cron', role: 'Site user', command: 'crontab -e', note: 'Configure reboot recovery or scheduled jobs.' }
];

export const checklist = [
  'Supported VM operating system (Ubuntu 24.04/22.04, Debian 12/11) and architecture confirmed',
  'Provider firewall restricts SSH (22) and panel (8443) ports',
  'Panel users require two-factor authentication',
  'Cloud backups (S3, Dropbox, GDrive, SFTP) and restore test plan documented',
  'DNS records and Let\'s Encrypt TLS issuance path validated',
  'Site users mapped to least privilege',
  'Runtime process manager documented for Node.js (PM2) or Python (uWSGI) apps',
  'No secrets or production credentials stored in zcloud notes'
];
