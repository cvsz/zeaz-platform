const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const DEFAULT_FILE_PATH = path.join(process.cwd(), 'data', 'oauth-clients.json');
const DEFAULT_TOKEN_TTL_SECONDS = 3600;

function badRequest(message) {
  const error = new Error(message);
  error.code = 'BAD_REQUEST';
  error.statusCode = 400;
  return error;
}

function nowIso(now = new Date()) {
  return now.toISOString();
}

function normalizeText(value, fieldName, { required = true, maxLength = 128 } = {}) {
  if (value === undefined || value === null) {
    if (required) {
      throw badRequest(`${fieldName} is required`);
    }
    return '';
  }

  if (typeof value !== 'string') {
    throw badRequest(`${fieldName} must be a string`);
  }

  const trimmed = value.trim();
  if (!trimmed && required) {
    throw badRequest(`${fieldName} is required`);
  }

  if (trimmed.length > maxLength) {
    throw badRequest(`${fieldName} must be at most ${maxLength} characters`);
  }

  return trimmed;
}

function normalizeScopes(scopes, allowedScopes = []) {
  const values = Array.isArray(scopes)
    ? scopes
    : typeof scopes === 'string'
      ? scopes.split(',')
      : [];

  const allowed = allowedScopes.length > 0 ? new Set(allowedScopes) : null;
  const normalized = [];

  for (const rawValue of values) {
    const value = String(rawValue).trim();
    if (!value) {
      continue;
    }

    if (allowed && !allowed.has(value)) {
      throw badRequest(`Unsupported scope: ${value}`);
    }

    if (!normalized.includes(value)) {
      normalized.push(value);
    }
  }

  if (normalized.length === 0) {
    normalized.push('api:access');
  }

  return normalized;
}

function hashSecret(secret, pepper) {
  return crypto.createHash('sha256').update(`${pepper}:${secret}`).digest('hex');
}

function constantTimeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) {
    return false;
  }
  return crypto.timingSafeEqual(left, right);
}

function redactClient(record) {
  return {
    clientId: record.clientId,
    applicationId: record.applicationId,
    name: record.name,
    scopes: record.scopes || [],
    status: record.status,
    createdAt: record.createdAt,
    approvedAt: record.approvedAt,
    revokedAt: record.revokedAt,
  };
}

function signPayload(payload, secret) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(encodedPayload).digest('base64url');
  return `${encodedPayload}.${signature}`;
}

function verifySignedToken(token, secret) {
  if (typeof token !== 'string' || !token.includes('.')) {
    return null;
  }

  const [encodedPayload, signature] = token.split('.');
  const expectedSignature = crypto.createHmac('sha256', secret).update(encodedPayload).digest('base64url');
  if (!constantTimeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
  } catch (error) {
    return null;
  }
}

async function readState(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.clients)) {
      throw new Error('Invalid OAuth client store format');
    }
    return { version: 1, clients: parsed.clients };
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return { version: 1, clients: [] };
    }
    throw error;
  }
}

async function writeState(filePath, state) {
  const directory = path.dirname(filePath);
  await fs.mkdir(directory, { recursive: true });
  const tempPath = `${filePath}.tmp`;
  await fs.writeFile(
    tempPath,
    JSON.stringify({ version: 1, clients: state.clients }, null, 2),
    'utf8',
  );
  await fs.rename(tempPath, filePath);
}

function createOAuthClientStore(options = {}) {
  const filePath = options.filePath || DEFAULT_FILE_PATH;
  const secretPepper = options.secretPepper || 'example-oauth-pepper';
  const tokenSecret = options.tokenSecret || secretPepper;
  const tokenTtlSeconds = Number.parseInt(options.tokenTtlSeconds, 10) || DEFAULT_TOKEN_TTL_SECONDS;
  const allowedScopes = options.allowedScopes || [];
  const now = options.now || (() => new Date());

  async function loadState() {
    return readState(filePath);
  }

  async function saveState(state) {
    await writeState(filePath, state);
  }

  async function createClientFromApplication(application, { issuedBy = 'system' } = {}) {
    const state = await loadState();
    const createdAt = nowIso(now());
    const clientId = `client_${crypto.randomUUID()}`;
    const clientSecret = crypto.randomBytes(32).toString('base64url');
    const record = {
      clientId,
      applicationId: application.id,
      name: application.name,
      scopes: normalizeScopes(application.requestedScopes || [], allowedScopes),
      status: 'approved',
      clientSecretHash: hashSecret(clientSecret, secretPepper),
      createdAt,
      approvedAt: createdAt,
      approvedBy: issuedBy,
      revokedAt: null,
      lastIssuedTokenAt: null,
    };

    state.clients.push(record);
    await saveState(state);

    return {
      client: redactClient(record),
      clientSecret,
    };
  }

  async function findClient(clientId) {
    const normalizedClientId = normalizeText(clientId, 'clientId', { maxLength: 128 });
    const state = await loadState();
    return state.clients.find((record) => record.clientId === normalizedClientId) || null;
  }

  async function revokeClient(clientId, { revokedBy = 'system' } = {}) {
    const state = await loadState();
    const record = state.clients.find((entry) => entry.clientId === normalizeText(clientId, 'clientId', { maxLength: 128 }));
    if (!record) {
      return null;
    }

    record.status = 'revoked';
    record.revokedAt = nowIso(now());
    record.revokedBy = revokedBy;
    await saveState(state);
    return redactClient(record);
  }

  async function exchangeClientCredentials({ clientId, clientSecret }) {
    const client = await findClient(clientId);
    if (!client || client.status !== 'approved') {
      return null;
    }

    if (!constantTimeEqual(client.clientSecretHash, hashSecret(clientSecret, secretPepper))) {
      return null;
    }

    const issuedAt = Math.floor(now().getTime() / 1000);
    const expiresAt = issuedAt + tokenTtlSeconds;
    const payload = {
      typ: 'oauth_access_token',
      clientId: client.clientId,
      applicationId: client.applicationId,
      scopes: client.scopes || [],
      iat: issuedAt,
      exp: expiresAt,
      sub: client.applicationId,
    };
    const accessToken = signPayload(payload, tokenSecret);

    const state = await loadState();
    const record = state.clients.find((entry) => entry.clientId === client.clientId);
    if (record) {
      record.lastIssuedTokenAt = nowIso(now());
      await saveState(state);
    }

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: tokenTtlSeconds,
      scope: (client.scopes || []).join(' '),
      client: redactClient(client),
    };
  }

  function verifyAccessToken(token) {
    const payload = verifySignedToken(token, tokenSecret);
    if (!payload || payload.typ !== 'oauth_access_token') {
      return null;
    }

    const nowSeconds = Math.floor(now().getTime() / 1000);
    if (!payload.exp || payload.exp < nowSeconds) {
      return null;
    }

    return payload;
  }

  return {
    createClientFromApplication,
    exchangeClientCredentials,
    verifyAccessToken,
    revokeClient,
    findClient,
    redactClient,
  };
}

module.exports = {
  createOAuthClientStore,
  verifySignedToken,
  signPayload,
};
