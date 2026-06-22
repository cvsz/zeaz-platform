const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createUserKeyStore } = require('./user-key-store');
const { createThirdPartyStore } = require('./third-party-store');
const { createUserKeyApi } = require('./user-key-api');

async function createApi() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'zchat-third-party-api-'));
  const keyStore = createUserKeyStore({
    filePath: path.join(dir, 'user-keys.json'),
    pepper: 'test-pepper',
    prefix: 'zchat',
    now: () => new Date('2026-01-01T00:00:00.000Z'),
  });
  const thirdPartyStore = createThirdPartyStore({
    filePath: path.join(dir, 'third-party.json'),
    now: () => new Date('2026-01-01T00:00:00.000Z'),
  });
  const api = createUserKeyApi({
    store: keyStore,
    thirdPartyStore,
    adminToken: 'admin-secret',
    allowUnprotected: false,
    corsOrigin: '*',
    logger: { error: jest.fn() },
  });

  return { api };
}

describe('third-party api', () => {
  it('accepts third-party applications publicly', async () => {
    const { api } = await createApi();
    const result = await api.route({
      method: 'POST',
      pathname: '/api/third-party/apply',
      headers: {},
      body: JSON.stringify({
        name: 'Acme Analytics',
        contactEmail: 'ops@example.com',
        requestedScopes: ['api:access', 'chat:read'],
      }),
    });

    expect(result.statusCode).toBe(201);
    expect(result.body.data.application.status).toBe('pending');
  });

  it('approves a third-party application into a usable key', async () => {
    const { api } = await createApi();
    const applyResult = await api.route({
      method: 'POST',
      pathname: '/api/third-party/apply',
      headers: {},
      body: JSON.stringify({
        name: 'Acme Analytics',
        contactEmail: 'ops@example.com',
        requestedScopes: ['api:access', 'chat:read'],
      }),
    });

    const approveResult = await api.route({
      method: 'POST',
      pathname: `/api/third-party/applications/${applyResult.body.data.application.id}/approve`,
      headers: {
        'x-zchat-admin-token': 'admin-secret',
      },
    });

    expect(approveResult.statusCode).toBe(200);
    expect(approveResult.body.data.oauth.clientId).toMatch(/^client_/);
    expect(approveResult.body.data.oauth.clientSecret).toBeDefined();
    expect(approveResult.body.data.application.status).toBe('approved');
  });
});
