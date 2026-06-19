# MCP Zero Trust Policy

## Core Rules
- Deny by default
- Least privilege mandatory
- Sandbox all MCP tools
- No unrestricted filesystem access
- No unrestricted shell access
- No secret exposure in prompts
- No automatic execution of untrusted content

## AI Agent Constraints
- Validate all generated patches
- Never trust PR metadata
- Never trust issue content
- Never trust uploaded files
- Require human approval for privileged operations

## Prompt Injection Defense
- Sanitize all external content
- Isolate tool execution
- Restrict outbound network access
- Enforce command allowlists

## GitHub Policies
- SHA-pinned workflows only
- Mandatory CodeQL
- Mandatory SBOM
- Mandatory provenance signing
- Mandatory SARIF uploads

## Kubernetes Policies
- Non-root containers only
- PodSecurity enforced
- NetworkPolicy mandatory
- Resource limits mandatory
- Read-only root filesystem preferred
