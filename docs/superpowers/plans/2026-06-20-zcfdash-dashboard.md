# zcfdash Health Cockpit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a full-featured Cloudflare health cockpit in `apps/zcfdash`, adding a FastAPI backend for realtime DNS/Tunnel/WAF checks and a modernized UI.

**Architecture:** A lightweight FastAPI backend (Python) will serve health metrics to a refreshed frontend (HTML/JS) dashboard. Infrastructure updates involve modifying `docker-compose.yml` to integrate the backend.

**Tech Stack:** FastAPI, httpx, nginx, vanilla JS/CSS.

## Global Constraints

- Backend must use async FastAPI.
- Frontend must use ZEAZ design system tokens (referencing `ui/design-system/tokens.css` style principles).
- No secrets in code; use environment variables exclusively.
- All tasks must be independently testable.
- Git commits per task.

---

### Task 1: Backend Scaffolding and FastAPI Setup

**Files:**
- Create: `apps/zcfdash/backend/main.py`
- Create: `apps/zcfdash/backend/requirements.txt`
- Modify: `apps/zcfdash/docker-compose.yml`

**Interfaces:**
- Produces: `/health` endpoint

- [ ] **Step 1: Create `requirements.txt`**

```text
fastapi
uvicorn
httpx
```

- [ ] **Step 2: Create `main.py` scaffold**

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
async def health():
    return {"status": "ok"}
```

- [ ] **Step 3: Update `docker-compose.yml`**

Add the backend service to the existing `zcfdash` docker-compose definition (need to create a new service definition).

- [ ] **Step 4: Commit**
`git add apps/zcfdash/backend/main.py apps/zcfdash/backend/requirements.txt apps/zcfdash/docker-compose.yml`
`git commit -m "feat(zcfdash): scaffold backend service"`

### Task 2: Connectivity & Cloudflare Integration

**Files:**
- Modify: `apps/zcfdash/backend/main.py`

**Interfaces:**
- Consumes: `CLOUDFLARE_API_TOKEN` (env)
- Produces: `/api/connectivity`, `/api/cloudflare/tunnels`, `/api/cloudflare/waf`

- [ ] **Step 1: Implement Connectivity Endpoints**

- [ ] **Step 2: Implement Cloudflare API Proxy**

- [ ] **Step 3: Commit**
`git add apps/zcfdash/backend/main.py`
`git commit -m "feat(zcfdash): implement health check APIs"`

### Task 3: Frontend Refresh

**Files:**
- Modify: `apps/zcfdash/html/index.html`

- [ ] **Step 1: Implement modern UI with polling JS**

- [ ] **Step 2: Commit**
`git add apps/zcfdash/html/index.html`
`git commit -m "feat(zcfdash): modernize frontend UI"`
