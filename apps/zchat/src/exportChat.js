/**
 * @file exportChat.js
 * @description Export chat messages as Markdown or JSON files.
 *
 * Usage:
 *   import { exportAsMarkdown, exportAsJSON, triggerDownload } from './exportChat';
 *   const md = exportAsMarkdown(messages);
 *   triggerDownload(md, 'chat.md', 'text/markdown');
 */

/**
 * Format messages as a Markdown document.
 * @param {Array<{role: string, content: string, source?: string, timestamp?: Date}>} messages
 * @returns {string}
 */
export function exportAsMarkdown(messages) {
  const header = [
    '# ZeaZ Omega Chat Export',
    '',
    `> Exported: ${new Date().toLocaleString()}`,
    `> Total messages: ${messages.length}`,
    '',
    '---',
    '',
  ].join('\n');

  const body = messages
    .map((m) => {
      const roleLabel = m.role === 'user' ? '👤 **User**' : '🤖 **Assistant**';
      const sourceInfo = m.source ? ` *(via ${m.source})*` : '';
      const latencyInfo = m.latencyMs ? ` · ${m.latencyMs}ms` : '';
      const timeStr = m.timestamp
        ? new Date(m.timestamp).toLocaleString()
        : '';
      const header = `### ${roleLabel}${sourceInfo}${latencyInfo}`;
      const meta = timeStr ? `*${timeStr}*` : '';

      return [header, meta, '', m.content, ''].join('\n');
    })
    .join('\n---\n\n');

  return header + body;
}

/**
 * Format messages as a JSON document.
 * @param {Array<object>} messages
 * @returns {string}
 */
export function exportAsJSON(messages) {
  const payload = {
    exportedAt: new Date().toISOString(),
    messageCount: messages.length,
    messages: messages.map((m) => ({
      ...m,
      timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
    })),
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Trigger a browser file download.
 * @param {string} content - File content string
 * @param {string} filename - Download filename
 * @param {string} mimeType - MIME type (e.g. 'text/markdown', 'application/json')
 */
export function triggerDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  // Release the object URL after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Generate a timestamped filename for export.
 * @param {'md'|'json'} ext
 * @returns {string}
 */
export function generateExportFilename(ext) {
  const ts = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .slice(0, 19);
  return `omega-chat-${ts}.${ext}`;
}
