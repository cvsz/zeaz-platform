import type { MemoryEntry, MemoryQuery, MemoryStats } from './types'

export class MemorySystem {
  private store: Map<string, MemoryEntry> = new Map()
  private tagIndex: Map<string, Set<string>> = new Map()

  async init(): Promise<void> {
    this.store.clear()
    this.tagIndex.clear()
  }

  async set(key: string, value: unknown, tags?: string[], ttl?: number): Promise<void> {
    const entry: MemoryEntry = {
      key,
      value,
      timestamp: Date.now(),
      ttl,
      tags,
      source: 'zeaz',
      priority: 'normal',
    }

    this.store.set(key, entry)

    if (tags) {
      for (const tag of tags) {
        const existing = this.tagIndex.get(tag) ?? new Set()
        existing.add(key)
        this.tagIndex.set(tag, existing)
      }
    }
  }

  async get(key: string): Promise<unknown | undefined> {
    const entry = this.store.get(key)
    if (!entry) return undefined

    if (entry.ttl && Date.now() - entry.timestamp > entry.ttl) {
      this.store.delete(key)
      return undefined
    }

    return entry.value
  }

  async delete(key: string): Promise<boolean> {
    return this.store.delete(key)
  }

  async query(query: MemoryQuery): Promise<MemoryEntry[]> {
    let results = Array.from(this.store.values())

    if (query.prefix) {
      results = results.filter(e => e.key.startsWith(query.prefix!))
    }

    if (query.tags && query.tags.length > 0) {
      results = results.filter(e =>
        e.tags && query.tags!.some(t => e.tags!.includes(t))
      )
    }

    if (!query.includeExpired) {
      results = results.filter(e => {
        if (!e.ttl) return true
        return Date.now() - e.timestamp <= e.ttl
      })
    }

    if (query.sortBy === 'timestamp') {
      results.sort((a, b) => query.ascending ? a.timestamp - b.timestamp : b.timestamp - a.timestamp)
    } else if (query.sortBy === 'priority') {
      const priority = { low: 0, normal: 1, high: 2, critical: 3 }
      results.sort((a, b) => priority[b.priority] - priority[a.priority])
    }

    if (query.limit && query.limit > 0) {
      results = results.slice(0, query.limit)
    }

    return results
  }

  size(): number {
    return this.store.size
  }

  async getStats(): Promise<MemoryStats> {
    const entries = Array.from(this.store.values())
    const tagCount = new Map<string, number>()

    for (const entry of entries) {
      if (entry.tags) {
        for (const tag of entry.tags) {
          tagCount.set(tag, (tagCount.get(tag) ?? 0) + 1)
        }
      }
    }

    const sortedTags = Array.from(tagCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }))

    return {
      totalEntries: this.store.size,
      totalSizeBytes: JSON.stringify(entries).length,
      oldestEntry: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : 0,
      newestEntry: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : 0,
      topTags: sortedTags,
    }
  }
}
