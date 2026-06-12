import type { MCPProviderDef, MCPTool } from '../types'

export class GitHubProvider implements MCPProviderDef {
  id = 'github' as const
  name = 'GitHub'
  description = 'GitHub API integration for repositories, issues, PRs, and workflows'
  version = '1.0.0'
  isInstalled = true
  authRequired = true
  configSchema = { type: 'object', properties: { token: { type: 'string' }, owner: { type: 'string' } } }
  icon = 'github'

  tools: MCPTool[] = [
    {
      name: 'list_repos', description: 'List repositories for an organization or user',
      providerId: this.id, category: 'repos',
      inputSchema: { type: 'object', properties: { org: { type: 'string' } } },
      handler: async (args) => ({ repos: [`${args.org}/repo1`, `${args.org}/repo2`] }),
    },
    {
      name: 'create_issue', description: 'Create a GitHub issue',
      providerId: this.id, category: 'issues',
      inputSchema: { type: 'object', properties: { repo: { type: 'string' }, title: { type: 'string' }, body: { type: 'string' } } },
      handler: async (args) => ({ issue: { number: 1, title: args.title, state: 'open' } }),
    },
    {
      name: 'list_issues', description: 'List issues for a repository',
      providerId: this.id, category: 'issues',
      inputSchema: { type: 'object', properties: { repo: { type: 'string' }, state: { type: 'string' } } },
      handler: async () => ({ issues: [] }),
    },
    {
      name: 'create_pr', description: 'Create a pull request',
      providerId: this.id, category: 'prs',
      inputSchema: { type: 'object', properties: { repo: { type: 'string' }, title: { type: 'string' }, head: { type: 'string' }, base: { type: 'string' } } },
      handler: async (args) => ({ pr: { number: 1, title: args.title, state: 'open' } }),
    },
    {
      name: 'list_workflows', description: 'List GitHub Actions workflows',
      providerId: this.id, category: 'ci',
      inputSchema: { type: 'object', properties: { repo: { type: 'string' } } },
      handler: async () => ({ workflows: [] }),
    },
  ]
}
