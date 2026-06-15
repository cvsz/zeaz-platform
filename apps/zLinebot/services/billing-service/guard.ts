const DEFAULT_MONTHLY_QUOTA = Number(process.env.DEFAULT_MONTHLY_QUOTA_USD ?? '25')

function tenantQuotaKey(tenantId: string): string {
  return `TENANT_QUOTA_USD_${tenantId.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`
}

export function getTenantQuota(tenantId: string): number {
  return Number(process.env[tenantQuotaKey(tenantId)] ?? DEFAULT_MONTHLY_QUOTA)
}

export function enforceQuota(tenantId: string, estimatedCost: number): void {
  const quota = getTenantQuota(tenantId)
  if (estimatedCost > quota) {
    throw new Error('Quota exceeded')
  }
}
