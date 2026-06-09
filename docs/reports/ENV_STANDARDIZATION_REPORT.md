# Environment Standardization Report

Generated: 2026-06-09 15:57:26Z

## Implemented

- Root `.env.example` includes canonical app, PostgreSQL, Redis, Cloudflare, identity, Terraform/OpenTofu, and secret-rotation variables.
- Added local env generator that preserves existing files and creates `.env.local` with generated secret values.

## Safety

Tracked examples use empty values or `example-*` values only. Generated secrets are written to gitignored files.
