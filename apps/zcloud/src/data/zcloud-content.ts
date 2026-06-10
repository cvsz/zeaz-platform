export const launchTargets = [
  "AWS",
  "DigitalOcean",
  "Hetzner Cloud",
  "Google Compute Engine",
  "Microsoft Azure",
  "Oracle Cloud",
  "Vultr",
  "Donweb Cloud",
  "Hostinger",
  "Other VPS",
];

export const godModeMenu = [
  "Command Center",
  "Launch Map",
  "Frontend Ops",
  "Admin Ops",
  "Runtime Matrix",
  "DPLOY",
  "CLI",
  "Guides",
  "Security",
  "Evidence",
];

export const docsSurface = [
  {
    id: "overview",
    title: "CloudPanel",
    badge: "core",
    summary: "Read the panel introduction, requirements, technology stack, changelog, and support surface.",
    note: "Top-level product framing for the release console.",
    href: "https://github.com/cloudpanel-io/docs/tree/master/v2/docs",
  },
  {
    id: "release",
    title: "Getting Started",
    badge: "launch",
    summary: "Install, log in, and get to a first working panel quickly.",
    note: "Fast launch support for the common cloud providers.",
    href: "https://github.com/cloudpanel-io/docs/tree/master/v2/docs/getting-started",
  },
  {
    id: "runtime",
    title: "Frontend Area",
    badge: "public app",
    summary: "Create and manage websites, reverse proxies, PHP apps, Node apps, Python apps, and static sites.",
    note: "The primary day-to-day application delivery surface.",
    href: "https://github.com/cloudpanel-io/docs/tree/master/v2/docs/frontend-area",
  },
  {
    id: "support",
    title: "Admin Area",
    badge: "ops",
    summary: "Handle users, services, system state, and global controls.",
    note: "Administrative actions stay separate from app delivery.",
    href: "https://github.com/cloudpanel-io/docs/tree/master/v2/docs/admin-area",
  },
  {
    id: "docs",
    title: "CloudPanel CLI",
    badge: "automation",
    summary: "Use the command line for scripted tasks and repeatable automation.",
    note: "Deterministic administration over hidden magic.",
    href: "https://github.com/cloudpanel-io/docs/tree/master/v2/docs/cloudpanel-cli",
  },
  {
    id: "security",
    title: "Node.js",
    badge: "runtime",
    summary: "Deploy and operate Node applications with process control and environment handling.",
    note: "An explicit deployment path for app services.",
    href: "https://github.com/cloudpanel-io/docs/tree/master/v2/docs/nodejs",
  },
  {
    id: "overview",
    title: "PHP",
    badge: "runtime",
    summary: "Support for PHP applications remains a first-class path in the panel.",
    note: "Matches the panel's core hosting identity.",
    href: "https://github.com/cloudpanel-io/docs/tree/master/v2/docs/php",
  },
  {
    id: "runtime",
    title: "Python",
    badge: "runtime",
    summary: "Deploy Python apps with the same operational discipline as the other runtimes.",
    note: "Simple and repeatable by design.",
    href: "https://github.com/cloudpanel-io/docs/tree/master/v2/docs/python",
  },
  {
    id: "release",
    title: "DPLOY",
    badge: "delivery",
    summary: "Use Dploy for repeatable source-to-server releases with a clean deploy flow.",
    note: "The release automation path for the final release rail.",
    href: "https://github.com/cloudpanel-io/docs/tree/master/v2/docs/dploy",
  },
  {
    id: "security",
    title: "Guides",
    badge: "hardening",
    summary: "Collect best practices, troubleshooting, and implementation advice in one place.",
    note: "Operating policy becomes visible here.",
    href: "https://github.com/cloudpanel-io/docs/tree/master/v2/docs/guides",
  },
  {
    id: "support",
    title: "Tools",
    badge: "support",
    summary: "Reference utilities and helper workflows for the CloudPanel ecosystem.",
    note: "Tooling docs round out the admin workflow.",
    href: "https://github.com/cloudpanel-io/docs/tree/master/v2/docs/tools",
  },
];

export const runtimeMatrix = [
  {
    id: "runtime",
    title: "PHP",
    tone: "gold",
    bullets: ["Classic hosting path", "Panel-driven application setup", "Aligned with shared hosting workflows"],
  },
  {
    id: "runtime",
    title: "Node.js",
    tone: "blue",
    bullets: ["Process-friendly deployment", "Explicit runtime configuration", "Good fit for APIs and dashboards"],
  },
  {
    id: "runtime",
    title: "Python",
    tone: "violet",
    bullets: ["Operationally simple deployment", "Works alongside the same panel patterns", "Useful for service apps and tooling"],
  },
  {
    id: "runtime",
    title: "Static / Proxy",
    tone: "mint",
    bullets: ["Static site delivery", "Reverse proxy routing", "Clean front-door architecture"],
  },
];

export const releaseGates = [
  { label: "Docs mapped to the major panel surfaces", status: "ready" },
  { label: "Launch providers summarized", status: "ready" },
  { label: "Runtime paths aligned", status: "ready" },
  { label: "Deployment path captured", status: "ready" },
  { label: "Guides and security surfaced", status: "ready" },
  { label: "No unrelated workspace state pulled in", status: "ready" },
];

export const evidence = [
  {
    id: "overview",
    title: "Tree",
    detail: "CloudPanel v2 docs live under a Docusaurus tree rooted at docs/v2.",
    href: "https://github.com/cloudpanel-io/docs/tree/master/v2",
  },
  {
    id: "docs",
    title: "Structure",
    detail: "The sidebar organizes launch, frontend, admin, CLI, runtimes, deployment, and guides.",
    href: "https://raw.githubusercontent.com/cloudpanel-io/docs/master/v2/sidebars.js",
  },
  {
    id: "overview",
    title: "Intro",
    detail: "The introduction frames the panel as a simple, modern control surface for server operations.",
    href: "https://raw.githubusercontent.com/cloudpanel-io/docs/master/v2/docs/introduction.md",
  },
  {
    id: "release",
    title: "Deployment",
    detail: "The Dploy docs anchor the release automation story.",
    href: "https://raw.githubusercontent.com/cloudpanel-io/docs/master/v2/docs/dploy/introduction.md",
  },
];

export const actions = [
  { label: "Copy release summary", value: "copy-summary" },
  { label: "Open docs tree", value: "open-docs" },
  { label: "Open AI center", value: "open-ai" },
  { label: "Jump to launch", value: "jump-launch" },
  { label: "Jump to runtime", value: "jump-runtime" },
  { label: "Jump to templates", value: "jump-templates" },
  { label: "Jump to ecosystem", value: "jump-ecosystem" },
  { label: "Jump to security", value: "jump-security" },
  { label: "Open evidence", value: "open-evidence" },
];
