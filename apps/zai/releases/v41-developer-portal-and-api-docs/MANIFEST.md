# v41 Developer Portal and API Docs Manifest

Package: `zai-coder-control-plane-v41-developer-portal-and-api-docs.zip`

## Purpose

Add developer-facing documentation, local API reference, examples, and SDK-oriented guidance.

## Planned systems

- developer portal dashboard
- API reference registry
- local OpenAPI export
- endpoint example catalog
- SDK snippet library
- auth and rate-limit documentation
- integration quickstarts
- developer changelog
- docs export bundle
- tests and docs

## Planned commands

```bash
make developer-portal-api-docs
make dev-portal-status
make api-reference
make openapi-export
make sdk-snippets
make integration-quickstarts
make developer-docs-export APPLY=1
make developer-docs-audit
make developer-portal-dashboard-export
```

## Planned routes

```text
/api/developer/status
/developer
/developer/api
/developer/openapi
/developer/snippets
/developer/quickstarts
```

## Safety posture

- docs-first
- no secret examples
- examples use clearly non-production values
- no external API calls by default
- export requires review
