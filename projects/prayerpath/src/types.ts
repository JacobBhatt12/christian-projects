export type Category = 'family' | 'health' | 'church' | 'work' | 'gratitude' | 'other'

export interface Prayer {
  id: string
  title: string
  request: string
  category: Category
  note: string
  createdAt: string
  answered: boolean
  answeredAt?: string
  answerNote?: string
}

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'family', label: 'Family' },
  { value: 'health', label: 'Health' },
  { value: 'church', label: 'Church' },
  { value: 'work', label: 'Work' },
  { value: 'gratitude', label: 'Gratitude' },
  { value: 'other', label: 'Other' },
]
