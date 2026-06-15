import { tools, type JsonSchema } from './tools.js'

function validateArgs(schema: JsonSchema, args: Record<string, unknown>): void {
  const required = schema.required ?? []
  for (const key of required) {
    if (!(key in args)) {
      throw new Error(`Missing required argument: ${key}`)
    }
  }

  for (const [key, value] of Object.entries(args)) {
    const prop = schema.properties[key]
    if (!prop) {
      throw new Error(`Unexpected argument: ${key}`)
    }

    if (typeof value !== prop.type) {
      throw new Error(`Invalid type for ${key}; expected ${prop.type}`)
    }
  }
}

export async function runTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  const tool = tools[name]
  if (!tool) {
    throw new Error(`Tool not found or not whitelisted: ${name}`)
  }

  validateArgs(tool.schema, args)
  return tool.execute(args)
}
