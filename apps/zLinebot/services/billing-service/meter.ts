import crypto from 'node:crypto'
import { recordUsageEvent } from './ledger.js'

export type UsageRecord = {
  id?: string
  tenant_id: string
  type: string
  tokens: number
  cost: number
  reference?: string
}

export async function recordUsage(data: UsageRecord): Promise<void> {
  const id = data.id ?? `${Date.now()}-${crypto.randomUUID()}`

  await recordUsageEvent({
    id,
    tenantId: data.tenant_id,
    type: data.type,
    tokens: data.tokens,
    cost: data.cost,
    reference: data.reference ?? `usage:${data.type}:${id}`
  })
}
