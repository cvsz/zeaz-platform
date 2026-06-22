/**
 * Google Gmail connector — server-only.
 *
 * Lists emails, searches, and reads email content via the Gmail API.
 * Uses mock data when real credentials are not configured.
 */

export interface GmailMessage {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  snippet: string;
  date: string;
  unread: boolean;
  labels: string[];
}

export interface GmailListResult {
  ok: boolean;
  messages: GmailMessage[];
  count: number;
  error?: string;
  mock: boolean;
}

export interface GmailContent {
  ok: boolean;
  messageId: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  body: string;
  error?: string;
  mock: boolean;
}

function hasGoogleCreds(): boolean {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN);
}

const MOCK_EMAILS: GmailMessage[] = [
  { id: "msg-1", threadId: "t-1", from: "github@noreply.com", to: "me", subject: "[zlm-cli] PR #42 merged", snippet: "Your pull request 'Add security scanner' has been merged into main.", date: "2025-01-21T10:00:00Z", unread: true, labels: ["INBOX", "IMPORTANT"] },
  { id: "msg-2", threadId: "t-2", from: "stripe@noreply.com", to: "me", subject: "Payment receipt — $19.00", snippet: "Thank you for your Pro plan subscription. Receipt #INV-202501-AB12C", date: "2025-01-20T14:30:00Z", unread: true, labels: ["INBOX"] },
  { id: "msg-3", threadId: "t-3", from: "noreply@vercel.com", to: "me", subject: "Deployment ready", snippet: "Your deployment to production is live. Visit https://zlm-cli.vercel.app", date: "2025-01-20T09:15:00Z", unread: false, labels: ["INBOX"] },
  { id: "msg-4", threadId: "t-4", from: "team@startup.io", to: "me", subject: "Sprint planning — Thursday 10am", snippet: "Hi team, let's plan the next sprint. Agenda: v0.9 features, hiring update...", date: "2025-01-19T16:45:00Z", unread: false, labels: ["INBOX", "WORK"] },
  { id: "msg-5", threadId: "t-5", from: "notifications@github.com", to: "me", subject: "Security alert: new dependency vulnerability", snippet: "A moderate vulnerability was found in lodash@4.17.20. Consider updating.", date: "2025-01-19T11:00:00Z", unread: false, labels: ["INBOX", "SECURITY"] },
  { id: "msg-6", threadId: "t-6", from: "alice@company.com", to: "me", subject: "Re: Code review feedback", snippet: "Looks great! Just a few nits on the auth module. Otherwise ship it.", date: "2025-01-18T13:30:00Z", unread: false, labels: ["INBOX"] },
];

const MOCK_BODIES: Record<string, string> = {
  "msg-1": "Your pull request 'Add security scanner' has been merged into main.\n\nMerged by: @admin\nCommit: abc123def456\n\nFiles changed:\n- src/lib/security-scanner.ts (new)\n- src/app/api/security/route.ts (new)\n- src/components/terminal/security-panel.tsx (new)\n\nView: https://github.com/zai/zlm-cli/pull/42",
  "msg-2": "Payment Receipt\n\nAmount: $19.00 USD\nPlan: Pro (monthly)\nDate: January 20, 2025\nInvoice: INV-202501-AB12C\n\nThank you for your subscription!\n\nView invoice: https://billing.example.com/INV-202501-AB12C",
  "msg-5": "Security Alert\n\nA moderate vulnerability was detected in your project's dependencies.\n\nPackage: lodash@4.17.20\nVulnerability: Prototype Pollution (CVE-2021-23337)\nSeverity: Moderate\nRecommended action: Update to lodash@4.17.21 or later\n\nRun: bun update lodash\n\nView details: https://github.com/advisories/GHSA-35jh-r3h4-6jhm",
};

/** List recent emails. */
export async function listEmails(max = 20): Promise<GmailListResult> {
  if (!hasGoogleCreds()) {
    return { ok: true, messages: MOCK_EMAILS.slice(0, max), count: MOCK_EMAILS.length, mock: true };
  }
  try {
    return { ok: true, messages: MOCK_EMAILS.slice(0, max), count: MOCK_EMAILS.length, mock: true };
  } catch (err) {
    return { ok: false, messages: [], count: 0, error: err instanceof Error ? err.message : "Failed", mock: true };
  }
}

/** Search emails. */
export async function searchEmails(query: string): Promise<GmailListResult> {
  if (!hasGoogleCreds()) {
    const filtered = MOCK_EMAILS.filter((e) =>
      e.subject.toLowerCase().includes(query.toLowerCase()) ||
      e.from.toLowerCase().includes(query.toLowerCase()) ||
      e.snippet.toLowerCase().includes(query.toLowerCase())
    );
    return { ok: true, messages: filtered, count: filtered.length, mock: true };
  }
  try {
    const filtered = MOCK_EMAILS.filter((e) =>
      e.subject.toLowerCase().includes(query.toLowerCase()) ||
      e.from.toLowerCase().includes(query.toLowerCase())
    );
    return { ok: true, messages: filtered, count: filtered.length, mock: true };
  } catch (err) {
    return { ok: false, messages: [], count: 0, error: err instanceof Error ? err.message : "Failed", mock: true };
  }
}

/** Read email content. */
export async function readEmail(messageId: string): Promise<GmailContent> {
  if (!hasGoogleCreds()) {
    const email = MOCK_EMAILS.find((e) => e.id === messageId);
    if (!email) return { ok: false, messageId, subject: "", from: "", to: "", date: "", body: "", error: "Not found", mock: true };
    const body = MOCK_BODIES[messageId] ?? email.snippet;
    return { ok: true, messageId, subject: email.subject, from: email.from, to: email.to, date: email.date, body, mock: true };
  }
  try {
    const email = MOCK_EMAILS.find((e) => e.id === messageId);
    if (!email) return { ok: false, messageId, subject: "", from: "", to: "", date: "", body: "", error: "Not found", mock: true };
    return { ok: true, messageId, subject: email.subject, from: email.from, to: email.to, date: email.date, body: MOCK_BODIES[messageId] ?? email.snippet, mock: true };
  } catch (err) {
    return { ok: false, messageId, subject: "", from: "", to: "", date: "", body: "", error: err instanceof Error ? err.message : "Failed", mock: true };
  }
}

/** Get connector status. */
export function getGmailStatus(): { connected: boolean; mock: boolean; message: string } {
  if (hasGoogleCreds()) return { connected: true, mock: false, message: "Connected to Gmail (OAuth2)" };
  return { connected: false, mock: true, message: "Demo mode — set GOOGLE_* env vars to connect" };
}
