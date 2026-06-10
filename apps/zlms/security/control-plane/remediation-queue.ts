import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';

export type RemediationStage = 'queued' | 'canary' | 'validated' | 'blocked' | 'rolled_back';
export interface RemediationItem { id: string; ruleId: string; severity: string; path: string; line: number; title: string; stage: RemediationStage; attempts: number; createdAt: string; updatedAt: string; dedupeKey: string; }
export interface QueueMetrics { queued: number; canary: number; validated: number; blocked: number; rolledBack: number; successRate: number; }

function itemId(ruleId: string, path: string, line: number, title: string): string {
  return createHash('sha256').update(`${ruleId}|${path}|${line}|${title}`).digest('hex').slice(0, 32);
}

export class RemediationQueue {
  private readonly queueFile: string;

  constructor(queueFile = 'security/state/remediation-queue.json') {
    this.queueFile = queueFile;
  }

  async load(): Promise<RemediationItem[]> {
    try {
      const parsed = JSON.parse(await readFile(this.queueFile, 'utf8')) as RemediationItem[];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }

  async enqueueFromSarif(sarifFile: string, maxItems = 50): Promise<RemediationItem[]> {
    const queue = await this.load();
    const existing = new Set(queue.map((item) => item.dedupeKey));
    const sarif = JSON.parse(await readFile(sarifFile, 'utf8')) as { runs?: Array<{ results?: unknown[] }> };
    const now = new Date().toISOString();

    for (const run of sarif.runs ?? []) {
      for (const raw of run.results ?? []) {
        const result = raw as { ruleId?: string; level?: string; message?: { text?: string }; locations?: Array<{ physicalLocation?: { artifactLocation?: { uri?: string }; region?: { startLine?: number } } }> };
        const location = result.locations?.[0]?.physicalLocation;
        const path = location?.artifactLocation?.uri ?? 'unknown';
        const line = location?.region?.startLine ?? 0;
        const title = (result.message?.text ?? result.ruleId ?? 'security finding').slice(0, 240);
        const ruleId = result.ruleId ?? 'unknown-rule';
        const dedupeKey = itemId(ruleId, path, line, title);
        if (existing.has(dedupeKey)) continue;
        existing.add(dedupeKey);
        queue.push({ id: dedupeKey, ruleId, severity: result.level ?? 'warning', path, line, title, stage: 'queued', attempts: 0, createdAt: now, updatedAt: now, dedupeKey });
        if (queue.filter((item) => item.stage === 'queued').length >= maxItems) break;
      }
    }

    await this.save(queue);
    return queue;
  }

  async promoteCanary(limit = 5): Promise<RemediationItem[]> {
    const queue = await this.load();
    const selected: RemediationItem[] = [];
    for (const item of queue) {
      if (selected.length >= limit) break;
      if (item.stage !== 'queued') continue;
      item.stage = 'canary';
      item.attempts += 1;
      item.updatedAt = new Date().toISOString();
      selected.push(item);
    }
    await this.save(queue);
    return selected;
  }

  async mark(ids: string[], stage: RemediationStage): Promise<void> {
    const allowed: RemediationStage[] = ['queued', 'canary', 'validated', 'blocked', 'rolled_back'];
    if (!allowed.includes(stage)) throw new Error(`invalid remediation stage ${stage}`);
    const wanted = new Set(ids);
    const queue = await this.load();
    for (const item of queue) if (wanted.has(item.id)) { item.stage = stage; item.updatedAt = new Date().toISOString(); }
    await this.save(queue);
  }

  metrics(items: RemediationItem[]): QueueMetrics {
    const count = (stage: RemediationStage) => items.filter((item) => item.stage === stage).length;
    const validated = count('validated');
    const rolledBack = count('rolled_back');
    const blocked = count('blocked');
    return { queued: count('queued'), canary: count('canary'), validated, blocked, rolledBack, successRate: validated + rolledBack + blocked === 0 ? 0 : validated / (validated + rolledBack + blocked) };
  }

  private async save(items: RemediationItem[]): Promise<void> {
    await mkdir(dirname(this.queueFile), { recursive: true });
    const tmp = `${this.queueFile}.${process.pid}.tmp`;
    await writeFile(tmp, JSON.stringify(items.sort((a, b) => a.id.localeCompare(b.id)), null, 2), { mode: 0o600 });
    await rename(tmp, this.queueFile);
  }
}
