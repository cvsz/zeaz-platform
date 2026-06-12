import { describe, it, expect } from 'vitest'
import { MCPServer } from '../../mcp/server'

describe('MCPServer', () => {
  it('should register built-in providers', () => {
    const mcp = new MCPServer()
    const providers = mcp.listProviders()
    expect(providers.length).toBeGreaterThanOrEqual(10)
  })

  it('should return all provider IDs', () => {
    const mcp = new MCPServer()
    const ids = mcp.listProviders().map(p => p.id)
    expect(ids).toContain('github')
    expect(ids).toContain('cloudflare')
    expect(ids).toContain('postgres')
    expect(ids).toContain('redis')
    expect(ids).toContain('docker')
    expect(ids).toContain('terraform')
    expect(ids).toContain('kubernetes')
    expect(ids).toContain('grafana')
    expect(ids).toContain('prometheus')
    expect(ids).toContain('supabase')
  })

  it('should get provider by ID', () => {
    const mcp = new MCPServer()
    const provider = mcp.getProvider('github')
    expect(provider).toBeDefined()
    expect(provider!.name).toBe('GitHub')
  })

  it('should get tool by provider and name', () => {
    const mcp = new MCPServer()
    const tool = mcp.getTool('github', 'list_repos')
    expect(tool).toBeDefined()
    expect(tool!.name).toBe('list_repos')
    expect(tool!.providerId).toBe('github')
  })

  it('should invoke tool and return result', async () => {
    const mcp = new MCPServer()
    const result = await mcp.invokeTool('github', 'list_repos', { org: 'zeaz' })
    expect(result).toBeDefined()
  })

  it('should throw for unknown tool', async () => {
    const mcp = new MCPServer()
    await expect(mcp.invokeTool('github', 'nonexistent', {}))
      .rejects.toThrow('not found')
  })

  it('should search tools', () => {
    const mcp = new MCPServer()
    const results = mcp.searchTools('deploy')
    expect(results.length).toBeGreaterThan(0)
  })

  it('should track invocations', async () => {
    const mcp = new MCPServer()
    await mcp.invokeTool('github', 'list_repos', { org: 'test' })
    const invocations = mcp.getInvocations()
    expect(invocations.length).toBeGreaterThanOrEqual(1)
    expect(invocations[0].providerId).toBe('github')
  })
})
