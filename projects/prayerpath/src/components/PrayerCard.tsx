import { useState } from 'react'
import type { Prayer } from '../types'
import { formatDate } from '../formatDate'
import CategoryBadge from './CategoryBadge'

interface PrayerCardProps {
  prayer: Prayer
  onEdit: (id: string) => void
  onMarkAnswered: (id: string, answerNote: string) => void
}

export default function PrayerCard({ prayer, onEdit, onMarkAnswered }: PrayerCardProps) {
  const [answering, setAnswering] = useState(false)
  const [answerNote, setAnswerNote] = useState('')

  const submitAnswer = (e: React.FormEvent) => {
    e.preventDefault()
    onMarkAnswered(prayer.id, answerNote.trim())
    setAnswering(false)
    setAnswerNote('')
  }

  return (
    <div className="border-b border-border py-6 first:pt-0">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-lg text-ink">{prayer.title}</h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-ink-faint">
            <CategoryBadge category={prayer.category} />
            <span>added {formatDate(prayer.createdAt)}</span>
          </div>
        </div>
        <button
          onClick={() => onEdit(prayer.id)}
          className="shrink-0 text-sm text-ink-soft underline decoration-border underline-offset-2 hover:text-ink"
        >
          Edit
        </button>
      </div>

      <p className="mt-3 leading-relaxed text-ink">{prayer.request}</p>

      {prayer.note && (
        <p className="mt-2 text-sm italic leading-relaxed text-ink-soft">
          <span className="not-italic text-ink-faint">Your note — </span>
          {prayer.note}
        </p>
      )}

      {!answering ? (
        <button
          onClick={() => setAnswering(true)}
          className="mt-4 border border-ink px-3 py-1.5 text-sm text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          Mark as answered
        </button>
      ) : (
        <form onSubmit={submitAnswer} className="mt-4">
          <label className="block text-sm text-ink-soft" htmlFor={`answer-${prayer.id}`}>
            How did God answer this? (optional)
          </label>
          <textarea
            id={`answer-${prayer.id}`}
            value={answerNote}
            onChange={(e) => setAnswerNote(e.target.value)}
            rows={2}
            className="mt-1.5 w-full border border-border bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-ink"
            placeholder="e.g. Surgery went well, recovery has been quicker than expected."
          />
          <div className="mt-2 flex gap-3">
            <button
              type="submit"
              className="border border-ink bg-ink px-3 py-1.5 text-sm font-medium text-paper hover:bg-ink-soft"
            >
              Save as answered
            </button>
            <button
              type="button"
              onClick={() => setAnswering(false)}
              className="text-sm text-ink-soft hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
