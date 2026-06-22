#!/usr/bin/env node

const http = require('node:http');
const { URL } = require('node:url');
const { createUserKeyStore } = require('./user-key-store');
const { createUserKeyApi } = require('./user-key-api');
const { createThirdPartyStore } = require('./third-party-store');
const { createOAuthClientStore } = require('./oauth-client-store');

function getEnv(name, defaultValue = '') {
  const value = process.env[name];
  return value === undefined || value === null || value === '' ? defaultValue : value;
}

async function readRequestBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return '';
  }

  return Buffer.concat(chunks).toString('utf8');
}

function normalizeHeaders(headers) {
  const normalized = {};
  for (const [key, value] of Object.entries(headers || {})) {
    normalized[key.toLowerCase()] = Array.isArray(value) ? value.join(', ') : value;
  }
  return normalized;
}

async function main() {
  const port = Number.parseInt(getEnv('CHAT_API_PORT', '8787'), 10);
  const host = getEnv('CHAT_API_HOST', '127.0.0.1');
  const adminToken = getEnv('CHAT_API_ADMIN_TOKEN', '');
  const pepper = getEnv('CHAT_API_KEY_PEPPER', 'example-pepper');
  const prefix = getEnv('CHAT_API_KEY_PREFIX', 'zchat');
  const storagePath = getEnv('CHAT_API_STORAGE_PATH', '');
  const thirdPartyStoragePath = getEnv('CHAT_API_THIRD_PARTY_STORAGE_PATH', '');
  const oauthStoragePath = getEnv('CHAT_API_OAUTH_STORAGE_PATH', '');
  const allowUnprotected = getEnv(
    'CHAT_API_ALLOW_UNPROTECTED',
    adminToken ? 'false' : 'true',
  ) === 'true';
  const corsOrigin = getEnv('CHAT_API_CORS_ORIGIN', '*');

  const store = createUserKeyStore({
    filePath: storagePath || undefined,
    pepper,
    prefix,
  });
  const thirdPartyStore = createThirdPartyStore({
    filePath: thirdPartyStoragePath || undefined,
  });
  const oauthClientStore = createOAuthClientStore({
    filePath: oauthStoragePath || undefined,
    allowedScopes: ['api:access', 'chat:read', 'chat:write', 'settings:read', 'settings:write'],
    secretPepper: pepper,
    tokenSecret: pepper,
  });

  const api = createUserKeyApi({
    store,
    thirdPartyStore,
    oauthClientStore,
    adminToken,
    allowUnprotected,
    corsOrigin,
  });

  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url || '/', `http://${request.headers.host || host}`);
      const body = request.method === 'GET' || request.method === 'HEAD' ? '' : await readRequestBody(request);
      const result = await api.route({
        method: request.method,
        pathname: url.pathname,
        query: Object.fromEntries(url.searchParams.entries()),
        headers: normalizeHeaders(request.headers),
        body,
      });

      response.statusCode = result.statusCode;
      for (const [key, value] of Object.entries(result.headers || {})) {
        response.setHeader(key, value);
      }

      if (result.statusCode === 204) {
        response.end();
        return;
      }

      response.end(JSON.stringify(result.body));
    } catch (error) {
      response.statusCode = 500;
      response.setHeader('Content-Type', 'application/json; charset=utf-8');
      response.end(
        JSON.stringify({
          ok: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Unexpected server error',
          },
        }),
      );
      console.error('[USER_KEY_API] fatal error', error);
    }
  });

  server.listen(port, host, () => {
    console.log(`[USER_KEY_API] listening on http://${host}:${port}`);
    console.log(`[USER_KEY_API] storage=${storagePath || './data/user-keys.json'}`);
    console.log(`[USER_KEY_API] thirdPartyStorage=${thirdPartyStoragePath || './data/third-party-applications.json'}`);
    console.log(`[USER_KEY_API] oauthStorage=${oauthStoragePath || './data/oauth-clients.json'}`);
  });
}

if (require.main === module) {
  main().catch((error) => {
    console.error('[USER_KEY_API] failed to start', error);
    process.exit(1);
  });
}

module.exports = {
  main,
};
