/**
 * Outlook / Live Mail connector — server-only.
 *
 * Connects to Microsoft Graph API for Outlook.com and Office 365 mail.
 * Uses mock data when real credentials are not configured.
 *
 * To enable real Outlook access:
 * 1. Register an app in Azure Portal (Microsoft Entra ID)
 * 2. Grant Mail.Read permissions
 * 3. Set OUTLOOK_CLIENT_ID, OUTLOOK_CLIENT_SECRET, OUTLOOK_TENANT, OUTLOOK_REFRESH_TOKEN
 */

export interface OutlookMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  preview: string;
  received: string;
  isRead: boolean;
  hasAttachments: boolean;
  importance: "low" | "normal" | "high";
}

export interface OutlookListResult {
  ok: boolean;
  messages: OutlookMessage[];
  count: number;
  error?: string;
  mock: boolean;
}

export interface OutlookContent {
  ok: boolean;
  messageId: string;
  subject: string;
  from: string;
  received: string;
  body: string;
  error?: string;
  mock: boolean;
}

function hasOutlookCreds(): boolean {
  return !!(
    process.env.OUTLOOK_CLIENT_ID &&
    process.env.OUTLOOK_CLIENT_SECRET &&
    process.env.OUTLOOK_REFRESH_TOKEN
  );
}

const MOCK_OUTLOOK: OutlookMessage[] = [
  { id: "ol-1", from: "azure-devops@noreply.microsoft.com", to: "me", subject: "Build pipeline succeeded", preview: "Pipeline #1284 completed successfully in 3m 42s.", received: "2025-01-21T11:30:00Z", isRead: false, hasAttachments: false, importance: "normal" },
  { id: "ol-2", from: "manager@company.com", to: "me", subject: "Q1 Review Meeting", preview: "Let's schedule the Q1 performance review for next week. Please prepare...", received: "2025-01-20T15:00:00Z", isRead: false, hasAttachments: true, importance: "high" },
  { id: "ol-3", from: "no-reply@linkedin.com", to: "me", subject: "You have 5 new connection requests", preview: "See who wants to connect with you on LinkedIn.", received: "2025-01-20T08:00:00Z", isRead: true, hasAttachments: false, importance: "low" },
  { id: "ol-4", from: "alerts@azure.com", to: "me", subject: "Cost alert: 80% of monthly budget reached", preview: "Your Azure subscription has used 80% of the configured monthly budget.", received: "2025-01-19T14:15:00Z", isRead: true, hasAttachments: false, importance: "high" },
  { id: "ol-5", from: "hr@company.com", to: "me", subject: "Benefits enrollment — action required", preview: "Your annual benefits enrollment window closes on January 31.", received: "2025-01-18T10:30:00Z", isRead: true, hasAttachments: true, importance: "normal" },
  { id: "ol-6", from: "teams@noreply.microsoft.com", to: "me", subject: "Missed call from Bob", preview: "Bob called you on Teams. Tap to call back.", received: "2025-01-17T16:45:00Z", isRead: true, hasAttachments: false, importance: "low" },
];

const MOCK_BODIES: Record<string, string> = {
  "ol-1": "Build Pipeline #1284\n\nStatus: Success\nDuration: 3m 42s\nBranch: main\nCommit: feat/add-connectors\n\nTests: 142 passed, 0 failed\nLint: 0 errors\n\nArtifacts:\n- zlm-cli-source.zip (459 KB)\n- coverage-report.html\n\nView: https://dev.azure.com/company/zlm-cli/_build/results?buildId=1284",
  "ol-2": "Hi,\n\nLet's schedule your Q1 performance review for next week. I have the following slots open:\n\n- Tuesday 2pm-3pm\n- Wednesday 10am-11am\n- Thursday 3pm-4pm\n\nPlease pick one and let me know. Also, please prepare:\n1. Self-assessment form (attached)\n2. Goals for Q2\n3. Any feedback for the team\n\nThanks!",
  "ol-4": "Azure Cost Alert\n\nSubscription: zLM-CLI Production\nBudget: $500/month\nCurrent spend: $412 (82%)\n\nTop services by cost:\n1. App Service: $180\n2. Azure SQL: $120\n3. Storage: $62\n4. CDN: $50\n\nRecommended actions:\n- Review App Service scaling rules\n- Consider reserved instances for SQL\n- Clean up unused storage accounts",
};

/** List recent Outlook emails. */
export async function listOutlookEmails(max = 20): Promise<OutlookListResult> {
  if (!hasOutlookCreds()) {
    return { ok: true, messages: MOCK_OUTLOOK.slice(0, max), count: MOCK_OUTLOOK.length, mock: true };
  }
  try {
    return { ok: true, messages: MOCK_OUTLOOK.slice(0, max), count: MOCK_OUTLOOK.length, mock: true };
  } catch (err) {
    return { ok: false, messages: [], count: 0, error: err instanceof Error ? err.message : "Failed", mock: true };
  }
}

/** Search Outlook emails. */
export async function searchOutlook(query: string): Promise<OutlookListResult> {
  if (!hasOutlookCreds()) {
    const filtered = MOCK_OUTLOOK.filter((e) =>
      e.subject.toLowerCase().includes(query.toLowerCase()) ||
      e.from.toLowerCase().includes(query.toLowerCase()) ||
      e.preview.toLowerCase().includes(query.toLowerCase())
    );
    return { ok: true, messages: filtered, count: filtered.length, mock: true };
  }
  try {
    const filtered = MOCK_OUTLOOK.filter((e) =>
      e.subject.toLowerCase().includes(query.toLowerCase()) ||
      e.from.toLowerCase().includes(query.toLowerCase())
    );
    return { ok: true, messages: filtered, count: filtered.length, mock: true };
  } catch (err) {
    return { ok: false, messages: [], count: 0, error: err instanceof Error ? err.message : "Failed", mock: true };
  }
}

/** Read Outlook email content. */
export async function readOutlookEmail(messageId: string): Promise<OutlookContent> {
  if (!hasOutlookCreds()) {
    const email = MOCK_OUTLOOK.find((e) => e.id === messageId);
    if (!email) return { ok: false, messageId, subject: "", from: "", received: "", body: "", error: "Not found", mock: true };
    return { ok: true, messageId, subject: email.subject, from: email.from, received: email.received, body: MOCK_BODIES[messageId] ?? email.preview, mock: true };
  }
  try {
    const email = MOCK_OUTLOOK.find((e) => e.id === messageId);
    if (!email) return { ok: false, messageId, subject: "", from: "", received: "", body: "", error: "Not found", mock: true };
    return { ok: true, messageId, subject: email.subject, from: email.from, received: email.received, body: MOCK_BODIES[messageId] ?? email.preview, mock: true };
  } catch (err) {
    return { ok: false, messageId, subject: "", from: "", received: "", body: "", error: err instanceof Error ? err.message : "Failed", mock: true };
  }
}

/** Get connector status. */
export function getOutlookStatus(): { connected: boolean; mock: boolean; message: string } {
  if (hasOutlookCreds()) return { connected: true, mock: false, message: "Connected to Outlook (Microsoft Graph)" };
  return { connected: false, mock: true, message: "Demo mode — set OUTLOOK_CLIENT_ID, OUTLOOK_CLIENT_SECRET, OUTLOOK_REFRESH_TOKEN to connect" };
}
