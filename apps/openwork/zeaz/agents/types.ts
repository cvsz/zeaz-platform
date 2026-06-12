export type AgentRole =
  | 'architect'
  | 'backend'
  | 'frontend'
  | 'security'
  | 'devops'
  | 'sre'
  | 'research'
  | 'reviewer'
  | 'pm'

export interface AgentConfig {
  role: AgentRole
  name: string
  description: string
  modelPreference?: string
  maxTokens?: number
  temperature?: number
  tools?: string[]
  systemPrompt?: string
}

export interface AgentContext {
  sessionId: string
  taskId?: string
  parentTaskId?: string
  input: string
  parameters?: Record<string, unknown>
  memory?: Record<string, unknown>
  deadline?: number
}

export interface AgentResult {
  taskId: string
  agentRole: AgentRole
  status: 'success' | 'failure' | 'partial' | 'blocked'
  output: string
  artifacts?: Record<string, unknown>
  metrics: {
    tokensUsed: number
    durationMs: number
    modelUsed: string
    cost: number
  }
  errors?: string[]
  nextSteps?: string[]
}

export interface AgentMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  toolCalls?: Array<{
    id: string
    name: string
    arguments: Record<string, unknown>
  }>
  toolResults?: Array<{
    id: string
    result: unknown
  }>
}

export interface SwarmConfig {
  maxConcurrentAgents: number
  coordinationStrategy: 'sequential' | 'parallel' | 'consensus' | 'hierarchical'
  timeoutMs: number
  rerouteOnFailure: boolean
}
