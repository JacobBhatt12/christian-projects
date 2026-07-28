import { describe, expect, it } from 'vitest'
import { isReflection, loadReflections } from './storage'

const validReflection = {
  id: 'reflection-1',
  ideaId: 'idea-1',
  ideaTitle: 'Help with a task',
  timeLabel: '15 minutes',
  completedAt: '2026-07-28T12:00:00.000Z',
  whatHappened: 'We finished the task.',
  whatLearned: 'Asking first mattered.',
  scriptureReference: '1 John 3:18 (KJV)',
}

describe('reflection validation', () => {
  it('accepts a complete reflection', () => {
    expect(isReflection(validReflection)).toBe(true)
  })

  it('rejects invalid timestamps and missing string fields', () => {
    expect(isReflection({ ...validReflection, completedAt: 'not-a-date' })).toBe(false)
    expect(isReflection({ ...validReflection, whatLearned: undefined })).toBe(false)
  })

  it('returns an empty array during non-browser evaluation', () => {
    expect(loadReflections()).toEqual([])
  })
})
