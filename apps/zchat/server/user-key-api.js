const { timingSafeEqual } = require('node:crypto');
const { createApiKeyAuthorizer, DEFAULT_API_KEY_SCOPES } = require('./api-key-auth');
const { createThirdPartyStore } = require('./third-party-store');
const { createOAuthClientStore } = require('./oauth-client-store');

function createError(code, message, statusCode = 400) {
  return { code, message, statusCode };
}

function jsonResponse(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...extraHeaders,
    },
    body,
  };
}

function compareSecrets(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return timingSafeEqual(left, right);
}

function parseJsonBody(body) {
  if (body === undefined || body === null || body === '') {
    return {};
  }

  if (typeof body === 'object') {
    return body;
  }

  try {
    return JSON.parse(body);
  } catch (error) {
    throw createError('BAD_REQUEST', 'Body must be valid JSON', 400);
  }
}

function getHeader(headers, name) {
  if (!headers) {
    return undefined;
  }

  const lower = name.toLowerCase();
  return headers[lower] ?? headers[name] ?? headers[name.toUpperCase()];
}

function getBearerToken(headers) {
  const authorization = getHeader(headers, 'authorization');
  if (typeof authorization !== 'string') {
    return null;
  }

  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

function getApiKeyFromRequest(request) {
  const headers = request.headers || {};
  return (
    getHeader(headers, 'x-api-key') ||
    getBearerToken(headers) ||
    getHeader(headers, 'x-zchat-api-key') ||
    request.body?.key ||
    request.body?.apiKey ||
    null
  );
}

function createUserKeyApi(options) {
  const {
    store,
    thirdPartyStore = createThirdPartyStore(),
    oauthClientStore = createOAuthClientStore({ allowedScopes: DEFAULT_API_KEY_SCOPES }),
    adminToken = '',
    allowUnprotected = false,
    corsOrigin = '*',
    logger = console,
  } = options || {};

  if (!store) {
    throw new Error('store is required');
  }

  const auth = createApiKeyAuthorizer({ store });

  function withCors(headers = {}) {
    return {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-ZChat-Admin-Token, X-ZChat-Api-Key, X-API-Key',
      'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
      ...headers,
    };
  }

  function requireAdmin(headers) {
    if (!adminToken) {
      if (allowUnprotected) {
        return;
      }
      throw createError('CONFIG_ERROR', 'Admin token is not configured', 503);
    }

    const provided =
      getHeader(headers, 'x-zchat-admin-token') || getBearerToken(headers) || '';

    if (!compareSecrets(adminToken, provided)) {
      throw createError('UNAUTHORIZED', 'Invalid admin token', 401);
    }
  }

  async function handleCreate(body, headers) {
    requireAdmin(headers);
    const payload = parseJsonBody(body);
    const userId = payload.userId;
    const label = payload.label ?? '';
    const expiresInDays = payload.expiresInDays ?? null;
    const scopes = payload.scopes ?? [];

    const created = await store.createKey({ userId, label, expiresInDays, scopes });
    return jsonResponse(
      201,
      {
        ok: true,
        data: {
          ...created.record,
          key: created.rawKey,
        },
      },
      withCors(),
    );
  }

  async function handleList(query, headers) {
    requireAdmin(headers);
    const userId = query.userId;
    const keys = await store.listKeys(userId);
    return jsonResponse(
      200,
      {
        ok: true,
        data: { keys },
      },
      withCors(),
    );
  }

  async function handleVerify(request) {
    const payload = parseJsonBody(request.body);
    const rawKey = payload.key || payload.apiKey || getApiKeyFromRequest(request);
    if (!rawKey) {
      throw createError('BAD_REQUEST', 'Key is required', 400);
    }
    const verified = await store.verifyKey(rawKey);

    if (!verified) {
      return jsonResponse(
        401,
        {
          ok: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Invalid or expired key',
          },
        },
        withCors(),
      );
    }

    return jsonResponse(
      200,
      {
        ok: true,
        data: {
          valid: true,
          key: verified,
        },
      },
      withCors(),
    );
  }

  async function handleAuthorize(request) {
    const payload = parseJsonBody(request.body);
    const accessToken = getBearerToken(request.headers || {});
    if (accessToken) {
      const tokenPayload = oauthClientStore.verifyAccessToken(accessToken);
      if (!tokenPayload) {
        throw createError('UNAUTHORIZED', 'Invalid or expired access token', 401);
      }

      const requiredScopes = payload.requiredScopes || [];
      const tokenScopes = tokenPayload?.scopes || [];
      const hasScopes = requiredScopes.every((scope) => tokenScopes.includes(scope));
      if (hasScopes) {
        return jsonResponse(
          200,
          {
            ok: true,
            data: {
              subject: {
                id: tokenPayload.applicationId,
                keyId: tokenPayload.clientId,
                label: tokenPayload.typ,
                scopes: tokenPayload.scopes || [],
                prefix: 'oauth',
              },
              permissions: {
                grantedScopes: tokenPayload.scopes || [],
                requiredScopes,
                canAccess: true,
              },
              token: tokenPayload,
            },
          },
          withCors(),
        );
      }

      throw createError('FORBIDDEN', 'OAuth access token is missing required scope', 403);
    }

    const result = await auth.handleAuthorize({
      ...request,
      body: payload,
    }, {
      requiredScopes: payload.requiredScopes || [],
      allowedScopes: DEFAULT_API_KEY_SCOPES,
    });
    return jsonResponse(result.statusCode, result.body, withCors(result.headers));
  }

  async function handleThirdPartyApply(body) {
    const payload = parseJsonBody(body);
    const application = await thirdPartyStore.applyApplication({
      name: payload.name,
      contactEmail: payload.contactEmail,
      website: payload.website,
      callbackUrl: payload.callbackUrl,
      requestedScopes: payload.requestedScopes,
    });

    return jsonResponse(
      201,
      {
        ok: true,
        data: {
          application,
        },
      },
      withCors(),
    );
  }

  async function handleThirdPartyList(headers, query = {}) {
    requireAdmin(headers);
    const applications = await thirdPartyStore.listApplications({
      status: query.status || null,
    });

    return jsonResponse(
      200,
      {
        ok: true,
        data: { applications },
      },
      withCors(),
    );
  }

  async function handleThirdPartyApprove(headers, id) {
    requireAdmin(headers);
    const application = await thirdPartyStore.listApplications();
    const target = application.find((item) => item.id === id);
    if (!target) {
      throw createError('NOT_FOUND', 'Application not found', 404);
    }
    if (target.status !== 'pending') {
      throw createError('CONFLICT', 'Application is not pending', 409);
    }

    const created = await oauthClientStore.createClientFromApplication(target, {
      issuedBy: 'admin',
    });

    await thirdPartyStore.reviewApplication(id, {
      status: 'approved',
      reviewedBy: 'admin',
      approvedKeyId: created.client.clientId,
    });

    return jsonResponse(
      200,
      {
        ok: true,
        data: {
          applicationId: id,
          application: {
            ...target,
            status: 'approved',
            approvedKeyId: created.client.clientId,
          },
          oauth: {
            clientId: created.client.clientId,
            clientSecret: created.clientSecret,
            scopes: created.client.scopes,
          },
        },
      },
      withCors(),
    );
  }

  async function handleThirdPartyReject(headers, id) {
    requireAdmin(headers);
    const updated = await thirdPartyStore.reviewApplication(id, {
      status: 'rejected',
      reviewedBy: 'admin',
    });
    if (!updated) {
      throw createError('NOT_FOUND', 'Application not found', 404);
    }
    return jsonResponse(
      200,
      {
        ok: true,
        data: { application: updated },
      },
      withCors(),
    );
  }

  async function handleOAuthToken(body) {
    const payload = parseJsonBody(body);
    const grantType = payload.grant_type || payload.grantType || '';
    if (grantType !== 'client_credentials') {
      throw createError('BAD_REQUEST', 'Unsupported grant_type', 400);
    }

    const exchange = await oauthClientStore.exchangeClientCredentials({
      clientId: payload.client_id || payload.clientId,
      clientSecret: payload.client_secret || payload.clientSecret,
    });

    if (!exchange) {
      throw createError('UNAUTHORIZED', 'Invalid client credentials', 401);
    }

    return jsonResponse(
      200,
      {
        ok: true,
        data: {
          access_token: exchange.accessToken,
          token_type: exchange.tokenType,
          expires_in: exchange.expiresIn,
          scope: exchange.scope,
          client: exchange.client,
        },
      },
      withCors(),
    );
  }

  async function route(request) {
    const method = String(request.method || 'GET').toUpperCase();
    const pathname = request.pathname || '/';
    const headers = request.headers || {};

    try {
      if (method === 'OPTIONS') {
        return jsonResponse(204, null, withCors());
      }

      if (method === 'POST' && pathname === '/api/user-keys') {
        return await handleCreate(request.body, headers);
      }

      if (method === 'GET' && pathname === '/api/user-keys') {
        const userId = request.query?.userId;
        return await handleList({ userId }, headers);
      }

      if (method === 'DELETE' && pathname.startsWith('/api/user-keys/')) {
        requireAdmin(headers);
        const id = pathname.split('/').pop();
        const revoked = await store.revokeKey(id);

        if (!revoked) {
          throw createError('NOT_FOUND', 'Key not found', 404);
        }

        return jsonResponse(
          200,
          {
            ok: true,
            data: { key: revoked },
          },
          withCors(),
        );
      }

      if (method === 'POST' && pathname === '/api/user-keys/verify') {
        return await handleVerify(request);
      }

      if (method === 'POST' && pathname === '/api/auth/authorize') {
        return await handleAuthorize(request);
      }

      if (method === 'POST' && pathname === '/api/oauth/token') {
        return await handleOAuthToken(request.body);
      }

      if (method === 'POST' && pathname === '/api/third-party/apply') {
        return await handleThirdPartyApply(request.body);
      }

      if (method === 'GET' && pathname === '/api/third-party/applications') {
        return await handleThirdPartyList(headers, request.query || {});
      }

      if (method === 'POST' && pathname.startsWith('/api/third-party/applications/') && pathname.endsWith('/approve')) {
        const id = pathname.split('/').slice(-2, -1)[0];
        return await handleThirdPartyApprove(headers, id);
      }

      if (method === 'POST' && pathname.startsWith('/api/third-party/applications/') && pathname.endsWith('/reject')) {
        const id = pathname.split('/').slice(-2, -1)[0];
        return await handleThirdPartyReject(headers, id);
      }

      throw createError('NOT_FOUND', 'Route not found', 404);
    } catch (error) {
      if (error && error.statusCode) {
        return jsonResponse(
          error.statusCode,
          {
            ok: false,
            error: {
              code: error.code || 'BAD_REQUEST',
              message: error.message || 'Request failed',
            },
          },
          withCors(),
        );
      }

      logger.error?.('USER_KEY_API', error);
      return jsonResponse(
        500,
        {
          ok: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Unexpected server error',
          },
        },
        withCors(),
      );
    }
  }

  return {
    route,
    jsonResponse,
    createError,
  };
}

module.exports = {
  createUserKeyApi,
  createError,
  jsonResponse,
};
