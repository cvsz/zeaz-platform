# ZEAZ Omega Architecture

## Overview

ZEAZ Omega extends OpenWork into a central AI Operating System. It is designed as a **pluggable extension layer** that composes with OpenWork's existing architecture rather than replacing it.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    ZEAZ Omega (AI OS Layer)                      │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  Agents   │  │  LLM     │  │  MCP     │  │  Workflows    │  │
│  │  (9 roles)│  │  Router  │  │Marketpl. │  │  (5 auto)     │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬────────┘  │
│       │              │              │                │          │
│  ┌────┴──────────────┴──────────────┴────────────────┴──────┐  │
│  │                  ZeazOrchestrator                         │  │
│  └───────────────────────────┬──────────────────────────────┘  │
│                              │                                   │
│  ┌───────────────────────────┴──────────────────────────────┐  │
│  │                    Runtime Adapter                        │  │
│  └───────────────────────────┬──────────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────┐
│  OpenWork Core (Unchanged)   │                                   │
│  ┌─────────────┐ ┌─────────┐│┌──────────┐ ┌─────────────────┐  │
│  │ Den API     │ │ Den Web │││Inference  │ │ Worker Proxy    │  │
│  └─────────────┘ └─────────┘│└──────────┘ └─────────────────┘  │
└──────────────────────────────┼──────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────┐
│  ZEAZ Platform Runtime       │                                   │
│  ┌──────────────┐ ┌─────────┐│┌──────────┐ ┌─────────────────┐  │
│  │Self-Healing  │ │Policy   │││Event Bus │ │ Swarm           │  │
│  │Runtime       │ │Engine   │││          │ │ Orchestrator    │  │
│  └──────────────┘ └─────────┘│└──────────┘ └─────────────────┘  │
└──────────────────────────────┴──────────────────────────────────┘
```

## Core Components

### 1. Agent Framework (`agents/`)
- **9 specialized agents**: architect, backend, frontend, security, devops, sre, research, reviewer, pm
- Each agent inherits from `BaseAgent` with typed `AgentConfig` and `AgentContext`
- Agent registry supports registration, lookup, and execution

### 2. Multi-LLM Router (`providers/`)
- Routes requests across **6 providers**: Claude, GPT-5, Gemini, DeepSeek, Qwen, Ollama
- Features: fallback, cost optimization, token budgeting, latency routing, provider health checks

### 3. MCP Marketplace (`mcp/`)
- **10 providers**: GitHub, Cloudflare, PostgreSQL, Redis, Docker, Terraform, K8s, Grafana, Prometheus, Supabase
- Each provider exposes typed tools with schemas
- Tool registry for search and discovery

### 4. Memory System (`memory/`)
- Tag-indexed key-value store with TTL support
- Prefix and tag-based queries
- Stats and priority tracking

### 5. Skill Registry (`skills/`)
- 10 built-in skills across development, security, devops, data, finops, testing
- Category-based listing and search

### 6. Workflow Engine (`workflows/`)
- DAG-based execution with step dependencies
- Supports agent, LLM, MCP, condition, parallel step types
- 5 autonomous workflows included

### 7. Runtime Adapter (`runtime/`)
- Bridges to Python runtime (`self_healing_runtime.py`, `policy_engine.py`, `event_bus.py`)
- Provides unified status across all layers

## Design Principles

| Principle | Implementation |
|-----------|---------------|
| **No upstream breakage** | All extensions are additive; OpenWork core is untouched |
| **Prefer adapters** | RuntimeAdapter decouples TS from Python runtimes |
| **Prefer composition** | Orchestrator composes agents, router, MCP, memory, workflows |
| **Typed throughout** | Full TypeScript strict mode with Zod-compatible schemas |
| **Testable** | Unit, integration, and E2E test suites |
