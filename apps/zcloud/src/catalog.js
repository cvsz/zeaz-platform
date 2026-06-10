export const coverage = [
  { title: 'Platform baseline', area: 'Introduction, requirements, stack', detail: 'Captures supported operating systems, CPU and memory minimums, VM-only deployment guidance, and supported application runtimes.', status: 'Complete' },
  { title: 'Launch paths', area: 'Getting started', detail: 'Models marketplace and installer workflows for hyperscalers, VPS providers, and generic virtual machines.', status: 'Complete' },
  { title: 'Frontend operations', area: 'Sites, TLS, databases, logs, cron, SSH/FTP', detail: 'Turns daily site administration into workload blueprints with input, validation, and handoff checkpoints.', status: 'Complete' },
  { title: 'Admin operations', area: 'Users, instance, settings, backups, cloud features', detail: 'Documents privileged operations and separates them from site-user actions for least privilege.', status: 'Complete' },
  { title: 'Runtime guides', area: 'PHP, Node.js, Python, static, reverse proxy', detail: 'Summarizes application-specific deployment concerns including PM2 and uWSGI production patterns.', status: 'Complete' },
  { title: 'Security posture', area: 'Best practices and security pages', detail: 'Highlights firewall, Basic Auth, 2FA, updates, backups, TLS, and provider firewall alignment.', status: 'Complete' }
];

export const providers = [
  { name: 'Amazon Web Services', method: 'AMI or installer', os: 'Ubuntu and Debian families', arch: 'x86 / ARM64', readiness: ['Use security groups before host firewall', 'Confirm least-privilege IAM for cloud features', 'Snapshot before upgrades'], docs: 'https://www.cloudpanel.io/docs/v2/getting-started/amazon-web-services/installation/ami/' },
  { name: 'DigitalOcean', method: 'Marketplace or installer', os: 'Ubuntu and Debian families', arch: 'x86', readiness: ['Restrict SSH and panel ports', 'Enable backups or snapshots', 'Verify domain DNS before TLS issuance'], docs: 'https://www.cloudpanel.io/docs/v2/getting-started/digital-ocean/installation/marketplace/' },
  { name: 'Hetzner Cloud', method: 'Installer', os: 'Ubuntu and Debian families', arch: 'x86 / ARM64', readiness: ['Use cloud firewall rules', 'Validate reverse DNS where mail is planned', 'Keep panel access behind trusted IPs'], docs: 'https://www.cloudpanel.io/docs/v2/getting-started/hetzner-cloud/installation/installer/' },
  { name: 'Google Compute Engine', method: 'Installer', os: 'Ubuntu and Debian families', arch: 'x86', readiness: ['Use VPC firewall first', 'Document service account scope', 'Reserve static external IP when required'], docs: 'https://www.cloudpanel.io/docs/v2/getting-started/google-compute-engine/installation/installer/' },
  { name: 'Microsoft Azure', method: 'Installer', os: 'Ubuntu and Debian families', arch: 'x86', readiness: ['Limit network security group ingress', 'Enable boot diagnostics', 'Document managed disk snapshot plan'], docs: 'https://www.cloudpanel.io/docs/v2/getting-started/microsoft-azure/installation/installer/' },
  { name: 'Oracle Cloud', method: 'Installer', os: 'Ubuntu and Debian families', arch: 'x86 / ARM64', readiness: ['Review security list and network rules', 'Confirm shape memory meets baseline', 'Test panel access from trusted IP only'], docs: 'https://www.cloudpanel.io/docs/v2/getting-started/oracle-cloud/installation/installer/' },
  { name: 'Vultr', method: 'Marketplace or installer', os: 'Ubuntu and Debian families', arch: 'x86', readiness: ['Enable provider firewall', 'Confirm backups policy', 'Validate DNS and TLS after provisioning'], docs: 'https://www.cloudpanel.io/docs/v2/getting-started/vultr/installation/marketplace/' },
  { name: 'Other VM', method: 'Installer', os: 'Ubuntu 24.04/22.04 or Debian 13/12/11', arch: 'x86 / ARM64', readiness: ['Avoid LXC/OpenVZ-style containers', 'Provide at least 1 CPU, 2 GB RAM, and 10 GB disk', 'Patch OS before install'], docs: 'https://www.cloudpanel.io/docs/v2/getting-started/other/' }
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
  { phase: 'Network edge', title: 'Provider firewall first', detail: 'Restrict SSH and CloudPanel panel access to trusted operator IPs or VPN ranges before traffic reaches the host firewall.' },
  { phase: 'Panel access', title: 'Basic Auth plus 2FA', detail: 'Place an additional authentication layer in front of the panel where IP allowlisting is not enough, and require two-factor authentication for users.' },
  { phase: 'Host posture', title: 'Patch and update cadence', detail: 'Keep the operating system and CloudPanel current, with snapshot and rollback evidence before risky maintenance.' },
  { phase: 'Site isolation', title: 'Least-privilege site users', detail: 'Use dedicated SSH/site users so application files and runtime permissions are scoped to the relevant site.' },
  { phase: 'Data safety', title: 'Backups before changes', detail: 'Define backup targets, retention, restore testing, and migration checkpoints before production data is onboarded.' },
  { phase: 'Transport', title: 'TLS and DNS validation', detail: 'Validate DNS, issue certificates, and verify HTTPS behavior before public go-live.' }
];

export const commands = [
  { title: 'List users', role: 'Root user', command: 'clpctl user:list', note: 'Inventory panel users before access reviews.' },
  { title: 'Add database', role: 'Site or root workflow', command: 'clpctl db:add --domainName=www.example.invalid --databaseName=appdb --databaseUserName=appuser --databaseUserPassword=$DATABASE_PASSWORD', note: 'Supply the password at runtime from a secure operator vault.' },
  { title: 'PM2 start', role: 'Site user', command: 'pm2 start npm --name zcloud-app -- start', note: 'Run inside the project directory and persist after validation.' },
  { title: 'Save PM2 state', role: 'Site user', command: 'pm2 save', note: 'Use after confirming the process is healthy.' },
  { title: 'Edit cron', role: 'Site user', command: 'crontab -e', note: 'Use for reboot recovery or scheduled jobs after review.' },
  { title: 'uWSGI config path', role: 'Root user', command: 'cd /etc/uwsgi/apps-enabled/', note: 'Create reviewed app configs manually; do not paste secrets into config files.' }
];

export const checklist = [
  'Supported VM operating system and architecture confirmed',
  'Provider firewall restricts SSH and panel ports',
  'Panel users require two-factor authentication',
  'Backups and restore test plan documented',
  'DNS records and TLS issuance path validated',
  'Site users mapped to least privilege',
  'Runtime process manager documented for Node.js or Python apps',
  'No secrets or production credentials stored in zcloud notes'
];
