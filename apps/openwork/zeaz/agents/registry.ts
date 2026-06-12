import { BaseAgent } from './base'
import type { AgentConfig, AgentContext, AgentResult, AgentRole } from './types'
import type { MemorySystem } from '../memory/system'
import { ArchitectAgent } from './architect'
import { BackendAgent } from './backend'
import { FrontendAgent } from './frontend'
import { SecurityAgent } from './security'
import { DevOpsAgent } from './devops'
import { SREAgent } from './sre'
import { ResearchAgent } from './research'
import { ReviewerAgent } from './reviewer'
import { PMAgent } from './pm'

export class AgentRegistry {
  private agents: Map<AgentRole, BaseAgent> = new Map()
  private memory: MemorySystem

  constructor(memory: MemorySystem) {
    this.memory = memory
    this.registerDefaults()
  }

  private registerDefaults(): void {
    const configs: AgentConfig[] = [
      { role: 'architect', name: 'Architect Agent', description: 'System architecture design and technical planning', modelPreference: 'claude-sonnet', maxTokens: 8192, temperature: 0.2 },
      { role: 'backend', name: 'Backend Agent', description: 'Backend API and service development', modelPreference: 'claude-sonnet', maxTokens: 8192, temperature: 0.3 },
      { role: 'frontend', name: 'Frontend Agent', description: 'UI component and frontend development', modelPreference: 'claude-sonnet', maxTokens: 8192, temperature: 0.3 },
      { role: 'security', name: 'Security Agent', description: 'Security audit, threat modeling, and vulnerability assessment', modelPreference: 'claude-opus', maxTokens: 8192, temperature: 0.1 },
      { role: 'devops', name: 'DevOps Agent', description: 'CI/CD, infrastructure, and deployment automation', modelPreference: 'claude-sonnet', maxTokens: 8192, temperature: 0.2 },
      { role: 'sre', name: 'SRE Agent', description: 'Site reliability, monitoring, and incident response', modelPreference: 'claude-sonnet', maxTokens: 8192, temperature: 0.2 },
      { role: 'research', name: 'Research Agent', description: 'Deep research and information gathering', modelPreference: 'claude-sonnet', maxTokens: 16384, temperature: 0.4 },
      { role: 'reviewer', name: 'Reviewer Agent', description: 'Code review and quality assurance', modelPreference: 'claude-opus', maxTokens: 8192, temperature: 0.1 },
      { role: 'pm', name: 'PM Agent', description: 'Project management and task coordination', modelPreference: 'claude-sonnet', maxTokens: 4096, temperature: 0.3 },
    ]

    const constructors: Record<AgentRole, new (config: AgentConfig, memory: MemorySystem) => BaseAgent> = {
      architect: ArchitectAgent,
      backend: BackendAgent,
      frontend: FrontendAgent,
      security: SecurityAgent,
      devops: DevOpsAgent,
      sre: SREAgent,
      research: ResearchAgent,
      reviewer: ReviewerAgent,
      pm: PMAgent,
    }

    for (const config of configs) {
      const AgentClass = constructors[config.role]
      this.agents.set(config.role, new AgentClass(config, this.memory))
    }
  }

  register(agent: BaseAgent): void {
    this.agents.set(agent.role, agent)
  }

  get(role: AgentRole): BaseAgent {
    const agent = this.agents.get(role)
    if (!agent) throw new Error(`Agent not found for role: ${role}`)
    return agent
  }

  has(role: AgentRole): boolean {
    return this.agents.has(role)
  }

  list(): Array<{ role: AgentRole; name: string; description: string }> {
    return Array.from(this.agents.values()).map(a => ({
      role: a.role,
      name: a.config.name,
      description: a.config.description,
    }))
  }

  async execute(role: AgentRole, context: AgentContext): Promise<AgentResult> {
    const agent = this.get(role)
    return agent.execute(context)
  }
}
