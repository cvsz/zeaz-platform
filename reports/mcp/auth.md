# MCP Auth Report

**Generated:** Fri Jun 12 11:51:51 PM +07 2026

---

## Auth Files

/home/zeazdev/.mcp-auth/cloudflare.env
/home/zeazdev/.mcp-auth/github.env
/home/zeazdev/.mcp-auth/postgres.env
/home/zeazdev/.mcp-auth/supabase.env

**Files found:** 4

---

## Quick Start

To set environment variables:

1. Create a file in ~/.mcp-auth/ (e.g., stripe.env)
2. Add lines like: STRIPE_SECRET_KEY=sk_live_...
3. Source it: set -a; source ~/.mcp-auth/stripe.env; set +a

Or run this script interactively:
  bash scripts/mcp/mcp-auth-manager.sh
