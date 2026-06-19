export type EcosystemRepo = {
  name: string;
  slug: string;
  category: "docs" | "templates" | "runtime" | "deploy" | "platform" | "tooling" | "archive";
  summary: string;
  repo: string;
  updated: string;
};

export const cloudpanelEcosystemSource = "cloudpanel-io org repo list provided by the user";

export const cloudpanelEcosystemRepos: EcosystemRepo[] = [
  {
    name: "docs",
    slug: "docs",
    category: "docs",
    summary: "CloudPanel documentation tree and release guidance.",
    repo: "cloudpanel-io/docs",
    updated: "Updated on Apr 20",
  },
  {
    name: "vhost-templates",
    slug: "vhost-templates",
    category: "templates",
    summary: "Application vhost template catalog for CloudPanel.",
    repo: "cloudpanel-io/vhost-templates",
    updated: "Updated on Mar 30",
  },
  {
    name: "clp-wp-varnish-cache",
    slug: "clp-wp-varnish-cache",
    category: "templates",
    summary: "WordPress + Varnish cache integration asset.",
    repo: "cloudpanel-io/clp-wp-varnish-cache",
    updated: "Updated on Mar 17",
  },
  {
    name: "marketplace-scripts",
    slug: "marketplace-scripts",
    category: "tooling",
    summary: "Shell scripts used for marketplace and deployment workflows.",
    repo: "cloudpanel-io/marketplace-scripts",
    updated: "Updated on Dec 5, 2025",
  },
  {
    name: "cloudpanel-ce",
    slug: "cloudpanel-ce",
    category: "platform",
    summary: "CloudPanel community edition codebase.",
    repo: "cloudpanel-io/cloudpanel-ce",
    updated: "Updated on Dec 4, 2025",
  },
  {
    name: "cloudpanel-translations",
    slug: "cloudpanel-translations",
    category: "docs",
    summary: "Localized v2 translation assets and validation files.",
    repo: "cloudpanel-io/cloudpanel-translations",
    updated: "Updated on Jul 30, 2025",
  },
  {
    name: "varnish-controllers",
    slug: "varnish-controllers",
    category: "runtime",
    summary: "PHP controllers for Varnish-aware behavior.",
    repo: "cloudpanel-io/varnish-controllers",
    updated: "Updated on May 24, 2024",
  },
  {
    name: "dploy",
    slug: "dploy",
    category: "deploy",
    summary: "Deployment framework for CloudPanel release flows.",
    repo: "cloudpanel-io/dploy",
    updated: "Updated on May 30, 2023",
  },
  {
    name: "dploy-application-templates",
    slug: "dploy-application-templates",
    category: "deploy",
    summary: "Application templates for Dploy-based release paths.",
    repo: "cloudpanel-io/dploy-application-templates",
    updated: "Updated on May 30, 2023",
  },
  {
    name: "scripts",
    slug: "scripts",
    category: "tooling",
    summary: "CloudPanel helper scripts and automation glue.",
    repo: "cloudpanel-io/scripts",
    updated: "Updated on Sep 29, 2022",
  },
  {
    name: "dms-filter-bundle",
    slug: "dms-filter-bundle",
    category: "platform",
    summary: "Symfony filter service bundle for input filtering support.",
    repo: "cloudpanel-io/dms-filter-bundle",
    updated: "Updated on Dec 24, 2021",
  },
  {
    name: "clp-opcache-preloader",
    slug: "clp-opcache-preloader",
    category: "runtime",
    summary: "OPcache preloader helper for CloudPanel PHP paths.",
    repo: "cloudpanel-io/clp-opcache-preloader",
    updated: "Updated on Jan 25, 2021",
  },
  {
    name: "clp-email-sender-from",
    slug: "clp-email-sender-from",
    category: "tooling",
    summary: "WordPress plugin for e-mail sender name/address control.",
    repo: "cloudpanel-io/clp-email-sender-from",
    updated: "Updated on Jan 6, 2021",
  },
  {
    name: "applications",
    slug: "applications",
    category: "archive",
    summary: "Archived CloudPanel applications repository.",
    repo: "cloudpanel-io/applications",
    updated: "Public archive",
  },
];
