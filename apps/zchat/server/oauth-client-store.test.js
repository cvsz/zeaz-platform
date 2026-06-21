const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createOAuthClientStore } = require('./oauth-client-store');

async function createTempStore() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'zchat-oauth-store-'));
  const store = createOAuthClientStore({
    filePath: path.join(dir, 'oauth-clients.json'),
    secretPepper: 'test-pepper',
    tokenSecret: 'test-token-secret',
    allowedScopes: ['api:access', 'chat:read', 'chat:write'],
    now: () => new Date('2026-01-01T00:00:00.000Z'),
  });
  return { store };
}

describe('oauth client store', () => {
  it('creates client credentials from an application and exchanges them for a token', async () => {
    const { store } = await createTempStore();
    const issued = await store.createClientFromApplication({
      id: 'app-1',
      name: 'Acme Analytics',
      requestedScopes: ['api:access', 'chat:read'],
    });

    expect(issued.client.clientId).toMatch(/^client_/);
    expect(issued.clientSecret).toBeDefined();

    const token = await store.exchangeClientCredentials({
      clientId: issued.client.clientId,
      clientSecret: issued.clientSecret,
    });

    expect(token.accessToken).toContain('.');
    expect(token.scope).toBe('api:access chat:read');
    expect(store.verifyAccessToken(token.accessToken)).toMatchObject({
      clientId: issued.client.clientId,
      applicationId: 'app-1',
    });
  });
});
