const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const DEFAULT_PREFIX = 'zchat';
const DEFAULT_FILE_PATH = path.join(process.cwd(), 'data', 'user-keys.json');
const DEFAULT_PEPPER = 'example-pepper';
const DEFAULT_SCOPES = ['api:access'];
const ALLOWED_SCOPES = new Set([
  'api:access',
  'chat:read',
  'chat:write',
  'settings:read',
  'settings:write',
]);

function badRequest(message) {
  const error = new Error(message);
  error.code = 'BAD_REQUEST';
  error.statusCode = 400;
  return error;
}

function nowIso(now = new Date()) {
  return now.toISOString();
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
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

  if (/[\u0000-\u001f\u007f]/.test(trimmed)) {
    throw badRequest(`${fieldName} must not contain control characters`);
  }

  return trimmed;
}

function normalizePositiveInteger(value, fieldName, { min = 1, max = 3650, defaultValue = null } = {}) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed)) {
    throw badRequest(`${fieldName} must be an integer`);
  }

  if (parsed < min || parsed > max) {
    throw badRequest(`${fieldName} must be between ${min} and ${max}`);
  }

  return parsed;
}

function normalizeScopes(scopes) {
  if (scopes === undefined || scopes === null || scopes === '') {
    return [...DEFAULT_SCOPES];
  }

  const rawValues = Array.isArray(scopes)
    ? scopes
    : typeof scopes === 'string'
      ? scopes.split(',')
      : [];

  const normalized = [];
  for (const rawValue of rawValues) {
    const value = String(rawValue).trim();
    if (!value) {
      continue;
    }

    if (!ALLOWED_SCOPES.has(value)) {
      throw badRequest(`Unsupported scope: ${value}`);
    }

    if (!normalized.includes(value)) {
      normalized.push(value);
    }
  }

  if (normalized.length === 0) {
    normalized.push(...DEFAULT_SCOPES);
  }

  return normalized;
}

function hashKey(rawKey, pepper) {
  return crypto.createHash('sha256').update(`${pepper}:${rawKey}`).digest('hex');
}

function generateRawKey(prefix) {
  return `${prefix}_${crypto.randomBytes(32).toString('base64url')}`;
}

function fingerprintFor(hash) {
  return hash.slice(0, 12);
}

function redactKeyRecord(record) {
  return {
    id: record.id,
    userId: record.userId,
    label: record.label,
    prefix: record.prefix,
    scopes: Array.isArray(record.scopes) ? record.scopes : [...DEFAULT_SCOPES],
    fingerprint: record.fingerprint,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    lastUsedAt: record.lastUsedAt,
    expiresAt: record.expiresAt,
    revokedAt: record.revokedAt,
  };
}

async function readState(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);

    if (!isPlainObject(parsed) || !Array.isArray(parsed.keys)) {
      throw new Error('Invalid key store format');
    }

    return {
      version: 1,
      keys: parsed.keys,
    };
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return { version: 1, keys: [] };
    }

    throw error;
  }
}

async function writeState(filePath, state) {
  const directory = path.dirname(filePath);
  await fs.mkdir(directory, { recursive: true });

  const tempPath = `${filePath}.tmp`;
  const payload = JSON.stringify(
    {
      version: 1,
      keys: state.keys,
    },
    null,
    2,
  );

  await fs.writeFile(tempPath, payload, 'utf8');
  await fs.rename(tempPath, filePath);
}

function createUserKeyStore(options = {}) {
  const filePath = options.filePath || DEFAULT_FILE_PATH;
  const pepper = options.pepper || DEFAULT_PEPPER;
  const prefix = normalizeText(options.prefix || DEFAULT_PREFIX, 'prefix', { maxLength: 32 });
  const now = options.now || (() => new Date());

  async function loadState() {
    return readState(filePath);
  }

  async function saveState(state) {
    await writeState(filePath, state);
  }

  async function createKey({ userId, label = '', expiresInDays = null, scopes = DEFAULT_SCOPES } = {}) {
    const normalizedUserId = normalizeText(userId, 'userId', { maxLength: 128 });
    const normalizedLabel = normalizeText(label, 'label', { required: false, maxLength: 80 });
    const normalizedExpiresInDays = normalizePositiveInteger(expiresInDays, 'expiresInDays', {
      min: 1,
      max: 3650,
      defaultValue: null,
    });
    const normalizedScopes = normalizeScopes(scopes);

    const state = await loadState();
    const currentTime = now();
    const createdAt = nowIso(currentTime);
    const rawKey = generateRawKey(prefix);
    const keyHash = hashKey(rawKey, pepper);
    const expiresAt =
      normalizedExpiresInDays === null
        ? null
        : new Date(currentTime.getTime() + normalizedExpiresInDays * 24 * 60 * 60 * 1000).toISOString();

    const record = {
      id: crypto.randomUUID(),
      userId: normalizedUserId,
      label: normalizedLabel || 'default',
      prefix,
      keyHash,
      fingerprint: fingerprintFor(keyHash),
      scopes: normalizedScopes,
      status: 'active',
      createdAt,
      updatedAt: createdAt,
      lastUsedAt: null,
      expiresAt,
      revokedAt: null,
    };

    state.keys.push(record);
    await saveState(state);

    return {
      rawKey,
      record: redactKeyRecord(record),
    };
  }

  async function listKeys(userId) {
    const normalizedUserId = normalizeText(userId, 'userId', { maxLength: 128 });
    const state = await loadState();
    return state.keys
      .filter((record) => record.userId === normalizedUserId)
      .map(redactKeyRecord);
  }

  async function verifyKey(rawKey) {
    const normalizedRawKey = normalizeText(rawKey, 'key', { maxLength: 256 });
    const state = await loadState();
    const hash = hashKey(normalizedRawKey, pepper);
    const record = state.keys.find((entry) => entry.keyHash === hash);

    if (!record) {
      return null;
    }

    const currentTime = now();
    if (record.status !== 'active') {
      return null;
    }

    if (record.expiresAt && new Date(record.expiresAt).getTime() <= currentTime.getTime()) {
      record.status = 'expired';
      record.updatedAt = nowIso(currentTime);
      await saveState(state);
      return null;
    }

    record.lastUsedAt = nowIso(currentTime);
    record.updatedAt = record.lastUsedAt;
    await saveState(state);

    return redactKeyRecord(record);
  }

  async function revokeKey(id) {
    const normalizedId = normalizeText(id, 'id', { maxLength: 128 });
    const state = await loadState();
    const record = state.keys.find((entry) => entry.id === normalizedId);

    if (!record) {
      return null;
    }

    record.status = 'revoked';
    record.revokedAt = nowIso(now());
    record.updatedAt = record.revokedAt;
    await saveState(state);
    return redactKeyRecord(record);
  }

  return {
    createKey,
    listKeys,
    verifyKey,
    revokeKey,
    hashKey,
    redactKeyRecord,
    normalizeScopes,
    _internal: {
      loadState,
      saveState,
      normalizeText,
    },
  };
}

module.exports = {
  createUserKeyStore,
  hashKey,
  redactKeyRecord,
  normalizeText,
  normalizePositiveInteger,
  normalizeScopes,
};
