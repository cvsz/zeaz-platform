export type MCPProviderId =
  | 'github'
  | 'cloudflare'
  | 'postgres'
  | 'redis'
  | 'docker'
  | 'terraform'
  | 'kubernetes'
  | 'grafana'
  | 'prometheus'
  | 'supabase'

export interface MCPTool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
  handler: (args: Record<string, unknown>) => Promise<unknown>
  providerId: MCPProviderId
  category: string
  rateLimit?: {
    maxPerMinute: number
    current: number
  }
}

export interface MCPProviderDef {
  id: MCPProviderId
  name: string
  description: string
  version: string
  tools: MCPTool[]
  configSchema: Record<string, unknown>
  isInstalled: boolean
  authRequired: boolean
  icon?: string
}

export interface MCPConfig {
  marketplaceUrl: string
  autoSync: boolean
  syncIntervalMs: number
  allowedProviders: MCPProviderId[]
  maxToolsPerProvider: number
}

export interface MCPInvocation {
  providerId: MCPProviderId
  toolName: string
  args: Record<string, unknown>
  timestamp: number
  durationMs: number
  success: boolean
  error?: string
}
