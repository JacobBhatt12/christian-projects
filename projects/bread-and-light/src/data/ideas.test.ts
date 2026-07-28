import { describe, expect, it } from 'vitest'
import { ideasByTime, totalIdeaCount } from './ideas'
import { pickDifferentIndex } from '../App'

describe('service idea pools', () => {
  it('contains exactly 100 unique ideas for each time category', () => {
    for (const pool of Object.values(ideasByTime)) {
      expect(pool).toHaveLength(100)
      expect(new Set(pool.map((idea) => idea.id)).size).toBe(100)
    }
    expect(totalIdeaCount).toBe(300)
  })

  it('includes complete, correctly labeled ideas', () => {
    for (const pool of Object.values(ideasByTime)) {
      for (const idea of pool) {
        expect(idea.title.length).toBeGreaterThan(0)
        expect(idea.introduction.length).toBeGreaterThan(0)
        expect(idea.steps).toHaveLength(2)
        expect(idea.scripture.length).toBeGreaterThan(0)
        expect(idea.scriptureReference).toMatch(/\(KJV\)$/)
      }
    }
  })
})

describe('pickDifferentIndex', () => {
  it('never returns the previous index', () => {
    for (let previous = 0; previous < 100; previous += 1) {
      for (let sample = 0; sample < 99; sample += 1) {
        const result = pickDifferentIndex(100, previous, () => sample / 99)
        expect(result).not.toBe(previous)
        expect(result).toBeGreaterThanOrEqual(0)
        expect(result).toBeLessThan(100)
      }
    }
  })
})
