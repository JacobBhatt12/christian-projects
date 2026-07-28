import type { Reflection } from './types'

export const REFLECTIONS_STORAGE_KEY = 'bread-and-light:reflections:v1'

const requiredReflectionFields: (keyof Reflection)[] = [
  'id',
  'ideaId',
  'ideaTitle',
  'timeLabel',
  'completedAt',
  'whatHappened',
  'whatLearned',
  'scriptureReference',
]

export function isReflection(value: unknown): value is Reflection {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  if (!requiredReflectionFields.every((field) => typeof record[field] === 'string')) return false
  return !Number.isNaN(Date.parse(record.completedAt as string))
}

export function loadReflections(): Reflection[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = window.localStorage.getItem(REFLECTIONS_STORAGE_KEY)
    if (!stored) return []
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(isReflection)
      .sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt))
  } catch {
    return []
  }
}

export function saveReflections(reflections: Reflection[]): boolean {
  if (typeof window === 'undefined') return false

  try {
    window.localStorage.setItem(REFLECTIONS_STORAGE_KEY, JSON.stringify(reflections))
    return true
  } catch {
    return false
  }
}

export function createReflectionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `reflection-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}
