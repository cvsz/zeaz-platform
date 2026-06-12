export interface SkillDef {
  name: string
  description: string
  version: string
  category: string
  author?: string
  dependencies?: string[]
  entryPoint?: string
  config?: Record<string, unknown>
}

export class SkillRegistry {
  private skills: Map<string, SkillDef> = new Map()

  async load(): Promise<void> {
    const builtins: SkillDef[] = [
      { name: 'code-review', description: 'Automated code review with best practice checks', version: '1.0.0', category: 'development' },
      { name: 'security-scan', description: 'Security vulnerability scanning and assessment', version: '1.0.0', category: 'security' },
      { name: 'dependency-audit', description: 'Dependency tree analysis and vulnerability check', version: '1.0.0', category: 'security' },
      { name: 'deploy-pipeline', description: 'Automated deployment pipeline orchestration', version: '1.0.0', category: 'devops' },
      { name: 'incident-response', description: 'Automated incident detection and response', version: '1.0.0', category: 'sre' },
      { name: 'api-design', description: 'REST/GraphQL API design review and validation', version: '1.0.0', category: 'development' },
      { name: 'db-migration', description: 'Database migration planning and execution', version: '1.0.0', category: 'data' },
      { name: 'cost-optimizer', description: 'Cloud cost analysis and optimization', version: '1.0.0', category: 'finops' },
      { name: 'docs-generator', description: 'Automated documentation generation', version: '1.0.0', category: 'documentation' },
      { name: 'test-generator', description: 'Automated test case generation', version: '1.0.0', category: 'testing' },
    ]

    for (const skill of builtins) {
      this.skills.set(skill.name, skill)
    }
  }

  register(skill: SkillDef): void {
    this.skills.set(skill.name, skill)
  }

  get(name: string): SkillDef | undefined {
    return this.skills.get(name)
  }

  list(category?: string): SkillDef[] {
    const all = Array.from(this.skills.values())
    return category ? all.filter(s => s.category === category) : all
  }

  search(query: string): SkillDef[] {
    const lower = query.toLowerCase()
    return Array.from(this.skills.values()).filter(
      s => s.name.toLowerCase().includes(lower) || s.description.toLowerCase().includes(lower)
    )
  }

  categories(): string[] {
    return [...new Set(Array.from(this.skills.values()).map(s => s.category))]
  }
}
