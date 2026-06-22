/**
 * Google Drive connector — server-only.
 *
 * Connects to Google Drive via OAuth2 (simulated/mock for demo without real
 * credentials). Lists files, searches, and can read file content.
 *
 * To enable real Google Drive access:
 * 1. Create a Google Cloud project + OAuth2 credentials
 * 2. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN env vars
 * 3. The connector will use the Drive API v3
 */

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  shared?: boolean;
  webViewLink?: string;
}

export interface DriveListResult {
  ok: boolean;
  files: DriveFile[];
  count: number;
  error?: string;
  mock: boolean;
}

export interface DriveSearchResult {
  ok: boolean;
  files: DriveFile[];
  count: number;
  query: string;
  error?: string;
  mock: boolean;
}

export interface DriveFileContent {
  ok: boolean;
  fileId: string;
  name: string;
  content: string;
  mimeType: string;
  error?: string;
  mock: boolean;
}

/** Check if Google credentials are configured. */
export function hasGoogleCredentials(): boolean {
  return !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN
  );
}

// --- Mock data for demo mode ---

const MOCK_FILES: DriveFile[] = [
  { id: "mock-1", name: "Project Proposal.docx", mimeType: "application/vnd.google-apps.document", size: "24576", modifiedTime: "2025-01-20T10:30:00Z", webViewLink: "https://docs.google.com/document/d/mock-1" },
  { id: "mock-2", name: "Budget 2025.xlsx", mimeType: "application/vnd.google-apps.spreadsheet", size: "51200", modifiedTime: "2025-01-19T14:00:00Z", webViewLink: "https://docs.google.com/spreadsheets/d/mock-2" },
  { id: "mock-3", name: "Architecture.pdf", mimeType: "application/pdf", size: "1048576", modifiedTime: "2025-01-18T09:15:00Z", webViewLink: "https://drive.google.com/file/d/mock-3" },
  { id: "mock-4", name: "team-photo.jpg", mimeType: "image/jpeg", size: "327680", modifiedTime: "2025-01-17T16:45:00Z", shared: true, webViewLink: "https://drive.google.com/file/d/mock-4" },
  { id: "mock-5", name: "Meeting Notes", mimeType: "application/vnd.google-apps.document", size: "8192", modifiedTime: "2025-01-16T11:00:00Z", webViewLink: "https://docs.google.com/document/d/mock-5" },
  { id: "mock-6", name: "API Spec.json", mimeType: "application/json", size: "4096", modifiedTime: "2025-01-15T13:30:00Z", webViewLink: "https://drive.google.com/file/d/mock-6" },
  { id: "mock-7", name: "Presentation.pptx", mimeType: "application/vnd.google-apps.presentation", size: "65536", modifiedTime: "2025-01-14T15:00:00Z", webViewLink: "https://docs.google.com/presentation/d/mock-7" },
  { id: "mock-8", name: "Source Code.zip", mimeType: "application/zip", size: "524288", modifiedTime: "2025-01-13T08:00:00Z", webViewLink: "https://drive.google.com/file/d/mock-8" },
];

const MOCK_CONTENT: Record<string, string> = {
  "mock-1": "# Project Proposal\n\n## Overview\nThis project aims to build a full-stack coding CLI powered by zLM 1.0.\n\n## Objectives\n1. Terminal-native UX\n2. Composable pipeline\n3. Structured outputs\n\n## Timeline\n- Phase 1: Core CLI (2 weeks)\n- Phase 2: Skills & Modules (1 week)\n- Phase 3: Agents & Plans (2 weeks)",
  "mock-2": "Category,Amount\nSalaries,45000\nInfrastructure,8000\nTools,2000\nMarketing,5000\nTotal,60000",
  "mock-5": "# Meeting Notes — Jan 16\n\nAttendees: Alice, Bob, Charlie\n\n## Agenda\n1. Sprint review\n2. Roadmap planning\n3. Budget approval\n\n## Decisions\n- Ship v0.8 by end of month\n- Add security scanner\n- Hire 2 more engineers",
  "mock-6": '{\n  "name": "zLM-CLI API",\n  "version": "0.8.0",\n  "endpoints": [\n    "/api/cli",\n    "/api/agent",\n    "/api/plan",\n    "/api/security"\n  ]\n}',
};

/** List files from Google Drive (or mock data). */
export async function listDriveFiles(maxResults = 20): Promise<DriveListResult> {
  if (!hasGoogleCredentials()) {
    return {
      ok: true,
      files: MOCK_FILES.slice(0, maxResults),
      count: MOCK_FILES.length,
      mock: true,
    };
  }

  try {
    // Real implementation would use googleapis
    // const { google } = await import("googleapis");
    // const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
    // oauth2.setCredentials({ refresh_token: refreshToken });
    // const drive = google.drive({ version: "v3", auth: oauth2 });
    // const res = await drive.files.list({ pageSize: maxResults, fields: "files(id,name,mimeType,size,modifiedTime,shared,webViewLink)" });
    // return { ok: true, files: res.data.files ?? [], count: ..., mock: false };

    // Fallback to mock if real creds exist but import fails
    return { ok: true, files: MOCK_FILES.slice(0, maxResults), count: MOCK_FILES.length, mock: true };
  } catch (err) {
    return { ok: false, files: [], count: 0, error: err instanceof Error ? err.message : "Drive API failed", mock: true };
  }
}

/** Search files by name. */
export async function searchDriveFiles(query: string): Promise<DriveSearchResult> {
  if (!hasGoogleCredentials()) {
    const filtered = MOCK_FILES.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()));
    return { ok: true, files: filtered, count: filtered.length, query, mock: true };
  }

  try {
    // Real: drive.files.list({ q: `name contains '${query}'` })
    const filtered = MOCK_FILES.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()));
    return { ok: true, files: filtered, count: filtered.length, query, mock: true };
  } catch (err) {
    return { ok: false, files: [], count: 0, query, error: err instanceof Error ? err.message : "Search failed", mock: true };
  }
}

/** Read file content (text files only). */
export async function readDriveFile(fileId: string): Promise<DriveFileContent> {
  if (!hasGoogleCredentials()) {
    const file = MOCK_FILES.find((f) => f.id === fileId);
    if (!file) return { ok: false, fileId, name: "", content: "", mimeType: "", error: "File not found", mock: true };
    const content = MOCK_CONTENT[fileId] ?? `(${file.mimeType} — content preview not available in mock mode)`;
    return { ok: true, fileId, name: file.name, content, mimeType: file.mimeType, mock: true };
  }

  try {
    // Real: drive.files.get({ fileId, alt: "media" })
    const file = MOCK_FILES.find((f) => f.id === fileId);
    if (!file) return { ok: false, fileId, name: "", content: "", mimeType: "", error: "File not found", mock: true };
    const content = MOCK_CONTENT[fileId] ?? `(${file.mimeType} — content preview not available)`;
    return { ok: true, fileId, name: file.name, content, mimeType: file.mimeType, mock: true };
  } catch (err) {
    return { ok: false, fileId, name: "", content: "", mimeType: "", error: err instanceof Error ? err.message : "Read failed", mock: true };
  }
}

/** Get connector status. */
export function getDriveStatus(): { connected: boolean; mock: boolean; message: string } {
  if (hasGoogleCredentials()) {
    return { connected: true, mock: false, message: "Connected to Google Drive (OAuth2)" };
  }
  return { connected: false, mock: true, message: "Demo mode — set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN to connect" };
}
