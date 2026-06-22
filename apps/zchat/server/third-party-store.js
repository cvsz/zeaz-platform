const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const DEFAULT_FILE_PATH = path.join(process.cwd(), 'data', 'third-party-applications.json');
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

function normalizeUrl(value, fieldName, { required = false } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) {
      throw badRequest(`${fieldName} is required`);
    }
    return '';
  }

  const text = normalizeText(value, fieldName, { maxLength: 256 });
  try {
    const url = new URL(text);
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw badRequest(`${fieldName} must use http or https`);
    }
    return url.toString();
  } catch (error) {
    if (error && error.statusCode) {
      throw error;
    }
    throw badRequest(`${fieldName} must be a valid URL`);
  }
}

function normalizeScopes(scopes) {
  const values = Array.isArray(scopes)
    ? scopes
    : typeof scopes === 'string'
      ? scopes.split(',')
      : [];

  const normalized = [];
  for (const rawValue of values) {
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
    normalized.push('api:access');
  }

  return normalized;
}

function redactApplication(record) {
  return {
    id: record.id,
    name: record.name,
    contactEmail: record.contactEmail,
    website: record.website,
    callbackUrl: record.callbackUrl,
    requestedScopes: record.requestedScopes,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    reviewedAt: record.reviewedAt,
    reviewedBy: record.reviewedBy,
    approvedKeyId: record.approvedKeyId,
  };
}

async function readState(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.applications)) {
      throw new Error('Invalid third-party application store format');
    }
    return { version: 1, applications: parsed.applications };
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return { version: 1, applications: [] };
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
    JSON.stringify({ version: 1, applications: state.applications }, null, 2),
    'utf8',
  );
  await fs.rename(tempPath, filePath);
}

function createThirdPartyStore(options = {}) {
  const filePath = options.filePath || DEFAULT_FILE_PATH;
  const now = options.now || (() => new Date());

  async function loadState() {
    return readState(filePath);
  }

  async function saveState(state) {
    await writeState(filePath, state);
  }

  async function applyApplication({ name, contactEmail, website = '', callbackUrl = '', requestedScopes = [] } = {}) {
    const normalizedName = normalizeText(name, 'name', { maxLength: 80 });
    const normalizedEmail = normalizeText(contactEmail, 'contactEmail', { maxLength: 120 });
    const normalizedWebsite = normalizeUrl(website, 'website', { required: false });
    const normalizedCallbackUrl = normalizeUrl(callbackUrl, 'callbackUrl', { required: false });
    const normalizedScopes = normalizeScopes(requestedScopes);

    const state = await loadState();
    const createdAt = nowIso(now());
    const record = {
      id: crypto.randomUUID(),
      name: normalizedName,
      contactEmail: normalizedEmail,
      website: normalizedWebsite,
      callbackUrl: normalizedCallbackUrl,
      requestedScopes: normalizedScopes,
      status: 'pending',
      createdAt,
      updatedAt: createdAt,
      reviewedAt: null,
      reviewedBy: null,
      approvedKeyId: null,
    };

    state.applications.push(record);
    await saveState(state);

    return redactApplication(record);
  }

  async function listApplications({ status = null } = {}) {
    const state = await loadState();
    return state.applications
      .filter((record) => !status || record.status === status)
      .map(redactApplication);
  }

  async function reviewApplication(id, { status, reviewedBy = 'system', approvedKeyId = null } = {}) {
    const normalizedId = normalizeText(id, 'id', { maxLength: 128 });
    const normalizedStatus = normalizeText(status, 'status', { maxLength: 32 });
    if (!['approved', 'rejected'].includes(normalizedStatus)) {
      throw badRequest('status must be approved or rejected');
    }

    const state = await loadState();
    const record = state.applications.find((entry) => entry.id === normalizedId);
    if (!record) {
      return null;
    }

    record.status = normalizedStatus;
    record.reviewedAt = nowIso(now());
    record.updatedAt = record.reviewedAt;
    record.reviewedBy = normalizeText(reviewedBy, 'reviewedBy', { maxLength: 80, required: false }) || 'system';
    record.approvedKeyId = approvedKeyId;
    await saveState(state);

    return redactApplication(record);
  }

  return {
    applyApplication,
    listApplications,
    reviewApplication,
    normalizeScopes,
    redactApplication,
  };
}

module.exports = {
  createThirdPartyStore,
  normalizeScopes,
  redactApplication,
};
