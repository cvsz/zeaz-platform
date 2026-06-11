import { mkdir, open, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';

export interface LockMetadata {
  owner: string;
  runId: string;
  ref: string;
  createdAt: string;
  expiresAt: string;
  key: string;
}

export class WorkflowLock {
  private readonly lockDirectory: string;

  constructor(lockDirectory = 'security/state/locks') {
    this.lockDirectory = lockDirectory;
  }

  static stableKey(parts: string[]): string {
    const normalized = parts.map((part) => part.replace(/[^a-zA-Z0-9_.:/-]/g, '_')).join('|');
    return createHash('sha256').update(normalized).digest('hex').slice(0, 24);
  }

  async acquire(key: string, metadata: Omit<LockMetadata, 'key' | 'createdAt' | 'expiresAt'>, ttlMinutes = 180): Promise<LockMetadata> {
    if (!/^[a-f0-9]{16,64}$/.test(key)) throw new Error('lock key must be a stable hex digest');
    await mkdir(this.lockDirectory, { recursive: true });
    const now = new Date();
    const record: LockMetadata = {
      ...metadata,
      key,
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + ttlMinutes * 60_000).toISOString(),
    };
    const file = join(this.lockDirectory, `${key}.json`);

    try {
      const handle = await open(file, 'wx', 0o600);
      await handle.writeFile(JSON.stringify(record, null, 2));
      await handle.close();
      return record;
    } catch (error) {
      const current = await this.read(key);
      if (current && Date.parse(current.expiresAt) < Date.now()) {
        await rm(file, { force: true });
        return this.acquire(key, metadata, ttlMinutes);
      }
      throw new Error(`workflow lock is already held for key ${key}`);
    }
  }

  async read(key: string): Promise<LockMetadata | null> {
    try {
      const value = JSON.parse(await readFile(join(this.lockDirectory, `${key}.json`), 'utf8')) as LockMetadata;
      return value;
    } catch {
      return null;
    }
  }

  async release(key: string, runId: string): Promise<boolean> {
    const file = join(this.lockDirectory, `${key}.json`);
    const current = await this.read(key);
    if (!current) return false;
    if (current.runId !== runId) throw new Error('refusing to release a lock owned by another run');
    await rm(file, { force: true });
    await writeFile(join(dirname(file), `${key}.released`), JSON.stringify({ runId, releasedAt: new Date().toISOString() }));
    return true;
  }
}
