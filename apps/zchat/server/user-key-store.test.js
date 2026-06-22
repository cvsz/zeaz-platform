const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createUserKeyStore } = require('./user-key-store');

async function createTempStore() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'zchat-key-store-'));
  const filePath = path.join(dir, 'user-keys.json');
  const store = createUserKeyStore({
    filePath,
    pepper: 'test-pepper',
    prefix: 'zchat',
    now: () => new Date('2026-01-01T00:00:00.000Z'),
  });

  return { dir, filePath, store };
}

describe('user key store', () => {
  it('creates a key without persisting the raw secret', async () => {
    const { filePath, store } = await createTempStore();
    const created = await store.createKey({
      userId: 'user-123',
      label: 'CLI access',
      expiresInDays: 30,
    });

    expect(created.rawKey).toMatch(/^zchat_[A-Za-z0-9_-]+$/);
    expect(created.record.userId).toBe('user-123');
    expect(created.record.label).toBe('CLI access');
    expect(created.record.status).toBe('active');
    expect(created.record.fingerprint).toHaveLength(12);
    expect(created.record.scopes).toEqual(['api:access']);

    const persisted = await fs.readFile(filePath, 'utf8');
    expect(persisted).toContain('"userId": "user-123"');
    expect(persisted).not.toContain(created.rawKey);
  });

  it('lists redacted keys and verifies a raw key once', async () => {
    const { store } = await createTempStore();
    const created = await store.createKey({
      userId: 'user-123',
      label: 'Browser',
      expiresInDays: 1,
      scopes: ['api:access', 'chat:write'],
    });

    const keys = await store.listKeys('user-123');
    expect(keys).toHaveLength(1);
    expect(keys[0]).not.toHaveProperty('keyHash');
    expect(keys[0].label).toBe('Browser');
    expect(keys[0].scopes).toEqual(['api:access', 'chat:write']);

    const verified = await store.verifyKey(created.rawKey);
    expect(verified).toMatchObject({
      userId: 'user-123',
      status: 'active',
    });

    const invalid = await store.verifyKey('zchat_invalid_key');
    expect(invalid).toBeNull();
  });

  it('revokes a key', async () => {
    const { store } = await createTempStore();
    const created = await store.createKey({
      userId: 'user-123',
      label: 'Temporary',
    });

    const revoked = await store.revokeKey(created.record.id);
    expect(revoked.status).toBe('revoked');

    const verified = await store.verifyKey(created.rawKey);
    expect(verified).toBeNull();
  });
});
