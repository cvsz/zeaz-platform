import { Pool } from 'pg'

const db = new Pool({ connectionString: process.env.DATABASE_URL })

export type UsageEventInput = {
  id: string
  tenantId: string
  type: string
  tokens: number
  cost: number
  reference: string
}

export async function recordUsageEvent(input: UsageEventInput): Promise<void> {
  await db.query(
    `INSERT INTO usage_events (id, tenant_id, type, tokens, cost)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (id) DO NOTHING`,
    [input.id, input.tenantId, input.type, input.tokens, input.cost]
  )

  await db.query(
    `INSERT INTO ledger (id, tenant_id, debit, credit, reference)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (id) DO NOTHING`,
    [input.id, input.tenantId, input.cost, 0, input.reference]
  )
}
