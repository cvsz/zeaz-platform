# Architecture

## Overview

`zeaz-platform` is the infrastructure foundation for the ZeaZDev ecosystem. It coordinates Cloudflare Zero Trust, edge networking, infrastructure-as-code, observability, and operational governance.

## Core Layers

| Layer | Responsibility |
|---|---|
| Identity | Access control and identity-aware routing |
| Network | Secure ingress, tunnels, and DNS routing |
| Edge Compute | Workers and edge runtime integration |
| Storage | Edge and object storage services |
| Security | WAF, access policy, review gates, and auditability |
| Observability | Metrics, logs, and operational insight |

## Repository Context

This repository uses `.faf` as persistent AI project context. AI agents and automation tools should read `.faf` before proposing architectural or operational changes.

## Engineering Principles

- Prefer declarative infrastructure.
- Keep changes reviewable and reversible.
- Keep documentation synchronized with implementation.
- Treat operational safety as a first-class architectural concern.
