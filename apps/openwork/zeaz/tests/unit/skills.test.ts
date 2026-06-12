import { describe, it, expect, beforeEach } from 'vitest'
import { SkillRegistry } from '../../skills/registry'

describe('SkillRegistry', () => {
  let registry: SkillRegistry

  beforeEach(async () => {
    registry = new SkillRegistry()
    await registry.load()
  })

  it('should load built-in skills', () => {
    const skills = registry.list()
    expect(skills.length).toBeGreaterThanOrEqual(10)
  })

  it('should get skill by name', () => {
    const skill = registry.get('code-review')
    expect(skill).toBeDefined()
    expect(skill!.category).toBe('development')
  })

  it('should list skills by category', () => {
    const securitySkills = registry.list('security')
    expect(securitySkills.length).toBeGreaterThanOrEqual(2)
    for (const s of securitySkills) {
      expect(s.category).toBe('security')
    }
  })

  it('should search skills', () => {
    const results = registry.search('deploy')
    expect(results.length).toBeGreaterThan(0)
  })

  it('should return categories', () => {
    const cats = registry.categories()
    expect(cats).toContain('development')
    expect(cats).toContain('security')
    expect(cats).toContain('devops')
  })

  it('should register custom skill', () => {
    registry.register({
      name: 'custom-skill',
      description: 'A custom skill',
      version: '1.0.0',
      category: 'custom',
    })
    expect(registry.get('custom-skill')).toBeDefined()
  })
})
