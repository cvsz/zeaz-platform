import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export interface RollbackPlan { id: string; createdAt: string; trigger: string; steps: Array<{ name: string; command: string; timeoutSeconds: number }>; }
export interface RollbackRecord { planId: string; startedAt: string; completedAt: string; durationMs: number; status: 'planned' | 'not_required'; }

export class RollbackEngine {
  private readonly recordsFile: string;

  constructor(recordsFile = 'security/state/rollback-records.json') {
    this.recordsFile = recordsFile;
  }

  createPlan(trigger: string, branch: string, baseRef: string): RollbackPlan {
    const safeBranch = branch.replace(/[^a-zA-Z0-9._/-]/g, '_');
    const safeBase = baseRef.replace(/[^a-zA-Z0-9._/-]/g, '_');
    return {
      id: `rollback-${Date.now()}`,
      createdAt: new Date().toISOString(),
      trigger,
      steps: [
        { name: 'freeze-remediation-queue', command: 'node --experimental-strip-types security/control-plane/orchestrator.ts freeze-remediation', timeoutSeconds: 120 },
        { name: 'restore-base-ref', command: `git checkout ${safeBase} -- .`, timeoutSeconds: 300 },
        { name: 'delete-canary-branch', command: `git branch -D ${safeBranch} || true`, timeoutSeconds: 120 },
        { name: 'emit-rollback-event', command: 'node --experimental-strip-types security/control-plane/orchestrator.ts emit rollback', timeoutSeconds: 120 },
      ],
    };
  }

  async record(plan: RollbackPlan | null, startedAt: Date, status: RollbackRecord['status']): Promise<RollbackRecord> {
    const completed = new Date();
    const record: RollbackRecord = { planId: plan?.id ?? 'none', startedAt: startedAt.toISOString(), completedAt: completed.toISOString(), durationMs: completed.getTime() - startedAt.getTime(), status };
    const existing = await this.records();
    await mkdir(dirname(this.recordsFile), { recursive: true });
    await writeFile(this.recordsFile, JSON.stringify([...existing, record].slice(-200), null, 2));
    return record;
  }

  async records(): Promise<RollbackRecord[]> {
    try {
      const parsed = JSON.parse(await readFile(this.recordsFile, 'utf8')) as RollbackRecord[];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }

  async meanRollbackTimeMs(): Promise<number> {
    const records = (await this.records()).filter((record) => record.status === 'planned');
    if (records.length === 0) return 0;
    return Math.round(records.reduce((sum, record) => sum + record.durationMs, 0) / records.length);
  }
}
