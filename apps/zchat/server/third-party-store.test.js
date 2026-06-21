const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createThirdPartyStore } = require('./third-party-store');

async function createTempStore() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'zchat-third-party-store-'));
  const filePath = path.join(dir, 'applications.json');
  const store = createThirdPartyStore({
    filePath,
    now: () => new Date('2026-01-01T00:00:00.000Z'),
  });

  return { filePath, store };
}

describe('third-party store', () => {
  it('creates a pending application', async () => {
    const { filePath, store } = await createTempStore();
    const application = await store.applyApplication({
      name: 'Acme Analytics',
      contactEmail: 'ops@example.com',
      website: 'https://example.com',
      callbackUrl: 'https://example.com/oauth/callback',
      requestedScopes: ['api:access', 'chat:read'],
    });

    expect(application.status).toBe('pending');
    expect(application.requestedScopes).toEqual(['api:access', 'chat:read']);

    const persisted = await fs.readFile(filePath, 'utf8');
    expect(persisted).toContain('Acme Analytics');
  });

  it('lists and reviews applications', async () => {
    const { store } = await createTempStore();
    const application = await store.applyApplication({
      name: 'Acme Analytics',
      contactEmail: 'ops@example.com',
    });

    const all = await store.listApplications();
    expect(all).toHaveLength(1);

    const reviewed = await store.reviewApplication(application.id, {
      status: 'approved',
      reviewedBy: 'admin',
      approvedKeyId: 'key-123',
    });

    expect(reviewed.status).toBe('approved');
    expect(reviewed.approvedKeyId).toBe('key-123');
  });
});
