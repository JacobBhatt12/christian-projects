import type { Category, Prayer } from './types'

export const PRAYERS_STORAGE_KEY = 'prayerpath:prayers:v1'

const validCategories: Category[] = ['family', 'health', 'church', 'work', 'gratitude', 'other']

export function isPrayer(value: unknown): value is Prayer {
  if (!value || typeof value !== 'object') return false
  const record = value as Record<string, unknown>
  if (typeof record.id !== 'string') return false
  if (typeof record.title !== 'string') return false
  if (typeof record.request !== 'string') return false
  if (typeof record.note !== 'string') return false
  if (typeof record.createdAt !== 'string') return false
  if (typeof record.answered !== 'boolean') return false
  if (!validCategories.includes(record.category as Category)) return false
  return true
}

export function hasStoredPrayers(): boolean {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(PRAYERS_STORAGE_KEY) !== null
}

export function loadPrayers(): Prayer[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = window.localStorage.getItem(PRAYERS_STORAGE_KEY)
    if (!stored) return []
    const parsed: unknown = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isPrayer)
  } catch {
    return []
  }
}

export function savePrayers(prayers: Prayer[]): boolean {
  if (typeof window === 'undefined') return false

  try {
    window.localStorage.setItem(PRAYERS_STORAGE_KEY, JSON.stringify(prayers))
    return true
  } catch {
    return false
  }
}

export function createPrayerId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `prayer-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}
