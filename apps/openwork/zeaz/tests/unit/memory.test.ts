import { describe, it, expect, beforeEach } from 'vitest'
import { MemorySystem } from '../../memory/system'

describe('MemorySystem', () => {
  let memory: MemorySystem

  beforeEach(async () => {
    memory = new MemorySystem()
    await memory.init()
  })

  it('should store and retrieve values', async () => {
    await memory.set('test-key', { hello: 'world' })
    const value = await memory.get('test-key')
    expect(value).toEqual({ hello: 'world' })
  })

  it('should return undefined for missing keys', async () => {
    const value = await memory.get('nonexistent')
    expect(value).toBeUndefined()
  })

  it('should delete values', async () => {
    await memory.set('to-delete', 'value')
    expect(await memory.get('to-delete')).toBe('value')
    await memory.delete('to-delete')
    expect(await memory.get('to-delete')).toBeUndefined()
  })

  it('should query with prefix', async () => {
    await memory.set('agent:architect:task1', 'data1', ['architect'])
    await memory.set('agent:architect:task2', 'data2', ['architect'])
    await memory.set('agent:backend:task1', 'data3', ['backend'])

    const results = await memory.query({ prefix: 'agent:architect' })
    expect(results).toHaveLength(2)
  })

  it('should query with tags', async () => {
    await memory.set('key1', 'v1', ['tag-a'])
    await memory.set('key2', 'v2', ['tag-b'])
    await memory.set('key3', 'v3', ['tag-a', 'tag-b'])

    const results = await memory.query({ tags: ['tag-a'] })
    expect(results).toHaveLength(2)
  })

  it('should track size', async () => {
    expect(memory.size()).toBe(0)
    await memory.set('a', 1)
    expect(memory.size()).toBe(1)
    await memory.set('b', 2)
    expect(memory.size()).toBe(2)
  })

  it('should provide stats', async () => {
    await memory.set('key1', 'value1', ['tag1'])
    await memory.set('key2', 'value2', ['tag1', 'tag2'])

    const stats = await memory.getStats()
    expect(stats.totalEntries).toBe(2)
    expect(stats.topTags).toHaveLength(2)
  })
})
