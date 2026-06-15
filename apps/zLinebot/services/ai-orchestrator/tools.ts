export type JsonSchema = {
  type: 'object'
  required?: string[]
  properties: Record<string, { type: 'string' | 'number' | 'boolean' }>
}

export type Tool = {
  name: string
  description: string
  schema: JsonSchema
  execute: (args: Record<string, unknown>) => Promise<unknown>
}

async function getBalance(args: Record<string, unknown>): Promise<unknown> {
  const tenantId = String(args.tenant_id ?? '')
  return { tenant_id: tenantId, balance: 100, currency: 'USD' }
}

export const tools: Record<string, Tool> = {
  get_balance: {
    name: 'get_balance',
    description: 'Get tenant wallet balance',
    schema: {
      type: 'object',
      required: ['tenant_id'],
      properties: {
        tenant_id: { type: 'string' }
      }
    },
    execute: getBalance
  }
}
