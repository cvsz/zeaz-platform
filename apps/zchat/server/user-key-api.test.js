const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { createUserKeyStore } = require('./user-key-store');
const { createUserKeyApi } = require('./user-key-api');

async function createApi() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'zchat-key-api-'));
  const store = createUserKeyStore({
    filePath: path.join(dir, 'user-keys.json'),
    pepper: 'test-pepper',
    prefix: 'zchat',
    now: () => new Date('2026-01-01T00:00:00.000Z'),
  });

  const api = createUserKeyApi({
    store,
    adminToken: 'admin-secret',
    allowUnprotected: false,
    corsOrigin: '*',
    logger: { error: jest.fn() },
  });

  return { api };
}

describe('user key api', () => {
  it('rejects create requests without the admin token', async () => {
    const { api } = await createApi();
    const result = await api.route({
      method: 'POST',
      pathname: '/api/user-keys',
      headers: {},
      body: JSON.stringify({ userId: 'user-123' }),
    });

    expect(result.statusCode).toBe(401);
    expect(result.body.error.code).toBe('UNAUTHORIZED');
  });

  it('creates and lists keys with the admin token', async () => {
    const { api } = await createApi();
    const createResult = await api.route({
      method: 'POST',
      pathname: '/api/user-keys',
      headers: {
        'x-zchat-admin-token': 'admin-secret',
      },
      body: JSON.stringify({
        userId: 'user-123',
        label: 'CLI',
        scopes: ['api:access', 'chat:write'],
      }),
    });

    expect(createResult.statusCode).toBe(201);
    expect(createResult.body.data.key).toMatch(/^zchat_[A-Za-z0-9_-]+$/);
    expect(createResult.body.data.scopes).toEqual(['api:access', 'chat:write']);

    const listResult = await api.route({
      method: 'GET',
      pathname: '/api/user-keys',
      query: { userId: 'user-123' },
      headers: {
        'x-zchat-admin-token': 'admin-secret',
      },
    });

    expect(listResult.statusCode).toBe(200);
    expect(listResult.body.data.keys).toHaveLength(1);
    expect(listResult.body.data.keys[0]).not.toHaveProperty('keyHash');
    expect(listResult.body.data.keys[0].scopes).toEqual(['api:access', 'chat:write']);
  });

  it('verifies a presented key', async () => {
    const { api } = await createApi();
    const createResult = await api.route({
      method: 'POST',
      pathname: '/api/user-keys',
      headers: {
        'x-zchat-admin-token': 'admin-secret',
      },
      body: JSON.stringify({
        userId: 'user-123',
      }),
    });

    const verifyResult = await api.route({
      method: 'POST',
      pathname: '/api/user-keys/verify',
      headers: {},
      body: JSON.stringify({
        key: createResult.body.data.key,
      }),
    });

    expect(verifyResult.statusCode).toBe(200);
    expect(verifyResult.body.data.valid).toBe(true);
    expect(verifyResult.body.data.key.userId).toBe('user-123');
  });

  it('authorizes key usage with required scopes', async () => {
    const { api } = await createApi();
    const createResult = await api.route({
      method: 'POST',
      pathname: '/api/user-keys',
      headers: {
        'x-zchat-admin-token': 'admin-secret',
      },
      body: JSON.stringify({
        userId: 'user-123',
        scopes: ['api:access', 'chat:write'],
      }),
    });

    const authResult = await api.route({
      method: 'POST',
      pathname: '/api/auth/authorize',
      headers: {
        'x-api-key': createResult.body.data.key,
      },
      body: JSON.stringify({
        requiredScopes: ['api:access', 'chat:write'],
      }),
    });

    expect(authResult.statusCode).toBe(200);
    expect(authResult.body.data.subject.id).toBe('user-123');
    expect(authResult.body.data.permissions.grantedScopes).toEqual(['api:access', 'chat:write']);
    expect(authResult.body.data.permissions.canAccess).toBe(true);
  });

  it('issues oauth client credentials for approved third-party applications', async () => {
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

    const tokenResult = await api.route({
      method: 'POST',
      pathname: '/api/oauth/token',
      headers: {},
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: approveResult.body.data.oauth.clientId,
        client_secret: approveResult.body.data.oauth.clientSecret,
      }),
    });

    expect(tokenResult.statusCode).toBe(200);
    expect(tokenResult.body.data.access_token).toContain('.');

    const authResult = await api.route({
      method: 'POST',
      pathname: '/api/auth/authorize',
      headers: {
        authorization: `Bearer ${tokenResult.body.data.access_token}`,
      },
      body: JSON.stringify({
        requiredScopes: ['api:access', 'chat:read'],
      }),
    });

    expect(authResult.statusCode).toBe(200);
    expect(authResult.body.data.subject.keyId).toBe(approveResult.body.data.oauth.clientId);
  });

  it('rejects key authorization when scope is missing', async () => {
    const { api } = await createApi();
    const createResult = await api.route({
      method: 'POST',
      pathname: '/api/user-keys',
      headers: {
        'x-zchat-admin-token': 'admin-secret',
      },
      body: JSON.stringify({
        userId: 'user-123',
        scopes: ['api:access'],
      }),
    });

    const authResult = await api.route({
      method: 'POST',
      pathname: '/api/auth/authorize',
      headers: {
        'x-api-key': createResult.body.data.key,
      },
      body: JSON.stringify({
        requiredScopes: ['chat:write'],
      }),
    });

    expect(authResult.statusCode).toBe(403);
    expect(authResult.body.error.code).toBe('FORBIDDEN');
  });
});
