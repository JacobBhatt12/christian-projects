import { useState } from 'react'
import type { Category, Prayer } from '../types'
import { CATEGORIES } from '../types'
import PrayerCard from './PrayerCard'

interface PrayerListProps {
  prayers: Prayer[]
  onAdd: () => void
  onEdit: (id: string) => void
  onMarkAnswered: (id: string, answerNote: string) => void
}

export default function PrayerList({ prayers, onAdd, onEdit, onMarkAnswered }: PrayerListProps) {
  const [filter, setFilter] = useState<Category | 'all'>('all')

  const visible = filter === 'all' ? prayers : prayers.filter((p) => p.category === filter)

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-2xl text-ink">My Prayers</h1>
        <button
          onClick={onAdd}
          className="border border-ink bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink-soft"
        >
          + Add a prayer
        </button>
      </div>

      <p className="mt-2 text-sm text-ink-faint">
        {prayers.length === 0
          ? "Nothing here yet."
          : `${prayers.length} ${prayers.length === 1 ? 'prayer' : 'prayers'} you're holding onto right now.`}
      </p>

      {prayers.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <button
            onClick={() => setFilter('all')}
            className={
              filter === 'all'
                ? 'border-b-2 border-ink text-ink'
                : 'border-b-2 border-transparent text-ink-soft hover:text-ink'
            }
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setFilter(c.value)}
              className={
                filter === c.value
                  ? 'border-b-2 border-ink text-ink'
                  : 'border-b-2 border-transparent text-ink-soft hover:text-ink'
              }
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

 <div className="mt-6">
        {visible.length === 0 ? (
          <p className="border-t border-border py-10 text-ink-soft">
            {prayers.length === 0
              ? "You haven't added any prayers yet. When something's on your heart, write it down here."
              : 'Nothing in this category yet.'}
          </p>
        ) : (
          visible.map((prayer) => (
            <PrayerCard
              key={prayer.id}
              prayer={prayer}
              onEdit={onEdit}
              onMarkAnswered={onMarkAnswered}
            />
          ))
        )}
      </div>
    </div>
  )
}