export interface MemoryEntry {
  key: string
  value: unknown
  timestamp: number
  ttl?: number
  tags?: string[]
  source?: string
  priority: 'low' | 'normal' | 'high' | 'critical'
}

export interface MemoryQuery {
  prefix?: string
  tags?: string[]
  limit?: number
  sortBy?: 'timestamp' | 'priority'
  ascending?: boolean
  includeExpired?: boolean
}

export interface MemoryStats {
  totalEntries: number
  totalSizeBytes: number
  oldestEntry: number
  newestEntry: number
  topTags: Array<{ tag: string; count: number }>
}
