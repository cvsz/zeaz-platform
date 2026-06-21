# API Spec

This document describes the local Node API exposed by `server/index.js` and implemented in `server/user-key-api.js`.

## Overview

- Base URL: `http://127.0.0.1:8787` by default
- Content type: `application/json`
- CORS: controlled by `CHAT_API_CORS_ORIGIN`
- Admin access: controlled by `CHAT_API_ADMIN_TOKEN`
- Persistent storage:
  - `CHAT_API_STORAGE_PATH`
  - `CHAT_API_THIRD_PARTY_STORAGE_PATH`
  - `CHAT_API_OAUTH_STORAGE_PATH`

## Common Response Shape

Success:

```json
{
  "ok": true,
  "data": {}
}
```

Error:

```json
{
  "ok": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Safe public message"
  }
}
```

## Authentication

- Admin endpoints require `X-ZChat-Admin-Token` or `Authorization: Bearer <token>`
- User-key authorization accepts:
  - `X-ZChat-Api-Key`
  - `X-API-Key`
  - `Authorization: Bearer <key>`
  - JSON body field `key` or `apiKey`
- OAuth token exchange uses client credentials in the request body

## Endpoints

### `POST /api/user-keys`

Create a new user key.

Required admin auth unless `CHAT_API_ALLOW_UNPROTECTED=true` and no admin token is set.

Request body:

```json
{
  "userId": "user-123",
  "label": "CLI access",
  "expiresInDays": 30,
  "scopes": ["api:access", "chat:write"]
}
```

Response:

```json
{
  "ok": true,
  "data": {
    "id": "key_...",
    "userId": "user-123",
    "label": "CLI access",
    "scopes": ["api:access", "chat:write"],
    "key": "zchat_..."
  }
}
```

The raw key is returned once and is not stored on disk.

### `GET /api/user-keys`

List user keys.

Query params:

- `userId` optional filter

Response:

```json
{
  "ok": true,
  "data": {
    "keys": []
  }
}
```

### `DELETE /api/user-keys/:id`

Revoke a user key.

Admin auth required.

Response:

```json
{
  "ok": true,
  "data": {
    "key": {}
  }
}
```

### `POST /api/user-keys/verify`

Verify a raw user key.

Request body:

```json
{
  "key": "zchat_..."
}
```

Response:

```json
{
  "ok": true,
  "data": {
    "valid": true,
    "key": {}
  }
}
```

Invalid keys return `401`.

### `POST /api/auth/authorize`

Authorize a user key for one or more scopes.

Request body:

```json
{
  "requiredScopes": ["api:access", "chat:write"]
}
```

Behavior:

- If a bearer OAuth access token is present, it is validated first.
- Otherwise the request falls back to direct user-key authorization.

Success response includes:

- authenticated subject metadata
- granted scopes
- required scopes
- token details when OAuth access token was used

### `POST /api/oauth/token`

Exchange approved client credentials for a bearer token.

Request body:

```json
{
  "grant_type": "client_credentials",
  "client_id": "client_...",
  "client_secret": "..."
}
```

Response:

```json
{
  "ok": true,
  "data": {
    "access_token": "oauth_...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "scope": "api:access chat:read",
    "client": {}
  }
}
```

### `POST /api/third-party/apply`

Submit a third-party application for review.

Request body:

```json
{
  "name": "Acme Analytics",
  "contactEmail": "ops@example.com",
  "website": "https://example.com",
  "callbackUrl": "https://example.com/oauth/callback",
  "requestedScopes": ["api:access", "chat:read"]
}
```

Response includes the application record with `pending` status.

### `GET /api/third-party/applications`

List submitted applications.

Query params:

- `status` optional filter, for example `pending`, `approved`, or `rejected`

Admin auth required.

### `POST /api/third-party/applications/:id/approve`

Approve a pending application.

Admin auth required.

Response includes:

- updated application state
- OAuth `clientId`
- OAuth `clientSecret`
- granted scopes

### `POST /api/third-party/applications/:id/reject`

Reject an application.

Admin auth required.

## CORS and Preflight

- `OPTIONS` requests return a `204` response with CORS headers.
- Allowed methods: `GET,POST,DELETE,OPTIONS`
- Allowed headers include:
  - `Content-Type`
  - `Authorization`
  - `X-ZChat-Admin-Token`
  - `X-ZChat-Api-Key`
  - `X-API-Key`

## Notes

- All admin-only routes fail with `401` if an invalid admin token is provided.
- All application review flows are local and file-backed by default.
- The API is intended for local development and trusted internal use unless placed behind a separate auth layer.
