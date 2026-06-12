import type { MCPProviderId, MCPTool, MCPProviderDef, MCPConfig, MCPInvocation } from './types'
import { randomUUID } from 'node:crypto'
import { GitHubProvider } from './providers/github'
import { CloudflareProvider } from './providers/cloudflare'
import { PostgresProvider } from './providers/postgres'
import { RedisProvider } from './providers/redis'
import { DockerProvider } from './providers/docker'
import { TerraformProvider } from './providers/terraform'
import { KubernetesProvider } from './providers/kubernetes'
import { GrafanaProvider } from './providers/grafana'
import { PrometheusProvider } from './providers/prometheus'
import { SupabaseProvider } from './providers/supabase'

export class MCPServer {
  private providers: Map<MCPProviderId, MCPProviderDef> = new Map()
  private config: MCPConfig
  private invocations: MCPInvocation[] = []
  private toolRegistry: Map<string, MCPTool> = new Map()

  constructor(config?: Partial<MCPConfig>) {
    this.config = {
      marketplaceUrl: 'https://mcp.zeaz.dev',
      autoSync: true,
      syncIntervalMs: 300000,
      allowedProviders: ['github', 'cloudflare', 'postgres', 'redis', 'docker', 'terraform', 'kubernetes', 'grafana', 'prometheus', 'supabase'],
      maxToolsPerProvider: 25,
      ...config,
    }
    this.registerBuiltins()
  }

  private registerBuiltins(): void {
    const builtins: Array<new () => MCPProviderDef> = [
      GitHubProvider,
      CloudflareProvider,
      PostgresProvider,
      RedisProvider,
      DockerProvider,
      TerraformProvider,
      KubernetesProvider,
      GrafanaProvider,
      PrometheusProvider,
      SupabaseProvider,
    ]

    for (const ProviderClass of builtins) {
      const provider = new ProviderClass()
      this.registerProvider(provider)
    }
  }

  registerProvider(provider: MCPProviderDef): void {
    this.providers.set(provider.id, provider)
    for (const tool of provider.tools) {
      this.toolRegistry.set(`${provider.id}:${tool.name}`, tool)
    }
  }

  getProvider(id: MCPProviderId): MCPProviderDef | undefined {
    return this.providers.get(id)
  }

  listProviders(): MCPProviderDef[] {
    return Array.from(this.providers.values())
  }

  listInstalledProviders(): MCPProviderDef[] {
    return this.listProviders().filter(p => p.isInstalled)
  }

  getTool(providerId: MCPProviderId, toolName: string): MCPTool | undefined {
    return this.toolRegistry.get(`${providerId}:${toolName}`)
  }

  async invokeTool(providerId: MCPProviderId, toolName: string, args: Record<string, unknown>): Promise<unknown> {
    const startTime = Date.now()
    const tool = this.getTool(providerId, toolName)

    if (!tool) {
      throw new Error(`Tool ${toolName} not found for provider ${providerId}`)
    }

    if (tool.rateLimit) {
      tool.rateLimit.current++
      if (tool.rateLimit.current > tool.rateLimit.maxPerMinute) {
        throw new Error(`Rate limit exceeded for tool ${toolName}`)
      }
    }

    try {
      const result = await tool.handler(args)
      this.recordInvocation(providerId, toolName, args, startTime, true)
      return result
    } catch (error) {
      this.recordInvocation(providerId, toolName, args, startTime, false, (error as Error).message)
      throw error
    }
  }

  private recordInvocation(
    providerId: MCPProviderId,
    toolName: string,
    args: Record<string, unknown>,
    startTime: number,
    success: boolean,
    error?: string
  ): void {
    this.invocations.push({
      providerId,
      toolName,
      args,
      timestamp: startTime,
      durationMs: Date.now() - startTime,
      success,
      error,
    })

    if (this.invocations.length > 1000) {
      this.invocations.shift()
    }
  }

  getInvocations(limit = 50): MCPInvocation[] {
    return this.invocations.slice(-limit)
  }

  searchTools(query: string): MCPTool[] {
    const lower = query.toLowerCase()
    return Array.from(this.toolRegistry.values()).filter(
      t => t.name.toLowerCase().includes(lower) || t.description.toLowerCase().includes(lower)
    )
  }

  async start(): Promise<void> {
    if (this.config.autoSync) {
      setInterval(async () => {
        await this.syncMarketplace()
      }, this.config.syncIntervalMs)
    }
  }

  async stop(): Promise<void> {

  }

  private async syncMarketplace(): Promise<void> {

  }
}
