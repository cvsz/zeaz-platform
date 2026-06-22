const { timingSafeEqual } = require('node:crypto');

const DEFAULT_API_KEY_SCOPES = Object.freeze([
  'api:access',
  'chat:read',
  'chat:write',
  'settings:read',
  'settings:write',
]);

function createError(code, message, statusCode = 400) {
  return { code, message, statusCode };
}

function parseScopeList(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeScopes(scopes, allowedScopes = DEFAULT_API_KEY_SCOPES) {
  const allowed = new Set(allowedScopes);
  const normalized = [];

  for (const scope of parseScopeList(scopes)) {
    if (!allowed.has(scope)) {
      throw createError('BAD_REQUEST', `Unsupported scope: ${scope}`, 400);
    }

    if (!normalized.includes(scope)) {
      normalized.push(scope);
    }
  }

  if (normalized.length === 0) {
    normalized.push('api:access');
  }

  return normalized;
}

function hasRequiredScopes(grantedScopes, requiredScopes) {
  const granted = new Set(grantedScopes || []);
  return requiredScopes.every((scope) => granted.has(scope));
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

function extractKeyFromRequest(request = {}) {
  const headers = request.headers || {};
  return (
    getHeader(headers, 'x-api-key') ||
    getHeader(headers, 'x-zchat-api-key') ||
    getBearerToken(headers) ||
    request.body?.key ||
    request.body?.apiKey ||
    null
  );
}

function createApiKeyAuthorizer({ store }) {
  if (!store) {
    throw new Error('store is required');
  }

  async function authorizeRequest(request, options = {}) {
    const rawKey = extractKeyFromRequest(request);
    if (!rawKey) {
      throw createError('UNAUTHORIZED', 'API key is required', 401);
    }

    const record = await store.verifyKey(rawKey);
    if (!record) {
      throw createError('UNAUTHORIZED', 'Invalid or expired API key', 401);
    }

    const requiredScopes = normalizeScopes(options.requiredScopes || [], options.allowedScopes);
    if (!hasRequiredScopes(record.scopes || [], requiredScopes)) {
      throw createError('FORBIDDEN', 'API key is missing required scope', 403);
    }

    return {
      subject: {
        id: record.userId,
        keyId: record.id,
        label: record.label,
        scopes: record.scopes || [],
        prefix: record.prefix,
      },
      permissions: {
        grantedScopes: record.scopes || [],
        requiredScopes,
        canAccess: true,
      },
      key: record,
    };
  }

  async function handleAuthorize(request, options = {}) {
    let payload = {};
    try {
      payload = request.body
        ? (typeof request.body === 'string' ? JSON.parse(request.body) : request.body)
        : {};
    } catch (error) {
      throw createError('BAD_REQUEST', 'Body must be valid JSON', 400);
    }

    const requestWithBodyKey = {
      ...request,
      body: payload,
    };
    const requiredScopes = payload.requiredScopes || options.requiredScopes || [];
    const allowedScopes = options.allowedScopes || DEFAULT_API_KEY_SCOPES;
    const result = await authorizeRequest(requestWithBodyKey, {
      requiredScopes,
      allowedScopes,
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: {
        ok: true,
        data: {
          subject: result.subject,
          permissions: result.permissions,
        },
      },
    };
  }

  return {
    authorizeRequest,
    handleAuthorize,
    compareSecrets,
    createError,
    normalizeScopes,
    hasRequiredScopes,
    DEFAULT_API_KEY_SCOPES,
  };
}

module.exports = {
  createApiKeyAuthorizer,
  DEFAULT_API_KEY_SCOPES,
  normalizeScopes,
  hasRequiredScopes,
  extractKeyFromRequest,
};
