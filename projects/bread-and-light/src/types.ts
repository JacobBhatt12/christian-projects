export type TimeCategory = 'fifteen' | 'hour' | 'afternoon'

export interface ServiceIdea {
  id: string
  timeCategory: TimeCategory
  timeLabel: string
  title: string
  introduction: string
  steps: [string, string]
  scripture: string
  scriptureReference: string
  safetyNote?: string
}

export interface Reflection {
  id: string
  ideaId: string
  ideaTitle: string
  timeLabel: string
  completedAt: string
  whatHappened: string
  whatLearned: string
  scriptureReference: string
}
