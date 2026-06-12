import type { MCPProviderDef, MCPTool } from '../types'

export class DockerProvider implements MCPProviderDef {
  id = 'docker' as const
  name = 'Docker'
  description = 'Docker container and image management'
  version = '1.0.0'
  isInstalled = true
  authRequired = false
  configSchema = { type: 'object', properties: { socketPath: { type: 'string' } } }
  icon = 'docker'

  tools: MCPTool[] = [
    {
      name: 'list_containers', description: 'List Docker containers',
      providerId: this.id, category: 'containers',
      inputSchema: { type: 'object', properties: { all: { type: 'boolean' } } },
      handler: async () => ({ containers: [] }),
    },
    {
      name: 'start_container', description: 'Start a Docker container',
      providerId: this.id, category: 'containers',
      inputSchema: { type: 'object', properties: { containerId: { type: 'string' } } },
      handler: async (args) => ({ status: 'started', containerId: args.containerId }),
    },
    {
      name: 'stop_container', description: 'Stop a Docker container',
      providerId: this.id, category: 'containers',
      inputSchema: { type: 'object', properties: { containerId: { type: 'string' } } },
      handler: async (args) => ({ status: 'stopped', containerId: args.containerId }),
    },
    {
      name: 'list_images', description: 'List Docker images',
      providerId: this.id, category: 'images',
      inputSchema: { type: 'object', properties: {} },
      handler: async () => ({ images: [] }),
    },
    {
      name: 'compose_up', description: 'Start Docker Compose services',
      providerId: this.id, category: 'compose',
      inputSchema: { type: 'object', properties: { composeFile: { type: 'string' }, services: { type: 'array' } } },
      handler: async (args) => ({ status: 'started', composeFile: args.composeFile }),
    },
  ]
}
