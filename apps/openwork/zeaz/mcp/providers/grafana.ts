import type { MCPProviderDef, MCPTool } from '../types'

export class GrafanaProvider implements MCPProviderDef {
  id = 'grafana' as const
  name = 'Grafana'
  description = 'Grafana dashboards, alerts, and data source management'
  version = '1.0.0'
  isInstalled = true
  authRequired = true
  configSchema = { type: 'object', properties: { apiKey: { type: 'string' }, url: { type: 'string' } } }
  icon = 'grafana'

  tools: MCPTool[] = [
    {
      name: 'list_dashboards', description: 'List Grafana dashboards',
      providerId: this.id, category: 'dashboards',
      inputSchema: { type: 'object', properties: {} },
      handler: async () => ({ dashboards: [] }),
    },
    {
      name: 'get_dashboard', description: 'Get dashboard by UID',
      providerId: this.id, category: 'dashboards',
      inputSchema: { type: 'object', properties: { uid: { type: 'string' } } },
      handler: async (args) => ({ dashboard: { uid: args.uid, title: 'Dashboard' } }),
    },
    {
      name: 'create_dashboard', description: 'Create a new dashboard',
      providerId: this.id, category: 'dashboards',
      inputSchema: { type: 'object', properties: { title: { type: 'string' }, panels: { type: 'array' } } },
      handler: async (args) => ({ created: true, uid: 'new-uid', title: args.title }),
    },
    {
      name: 'list_alerts', description: 'List alert rules',
      providerId: this.id, category: 'alerts',
      inputSchema: { type: 'object', properties: {} },
      handler: async () => ({ alerts: [] }),
    },
    {
      name: 'get_datasources', description: 'List data sources',
      providerId: this.id, category: 'datasources',
      inputSchema: { type: 'object', properties: {} },
      handler: async () => ({ datasources: [] }),
    },
  ]
}
