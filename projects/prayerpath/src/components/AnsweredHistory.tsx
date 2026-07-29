import type { Prayer } from '../types'
import { formatDate } from '../formatDate'
import CategoryBadge from './CategoryBadge'

interface AnsweredHistoryProps {
  prayers: Prayer[]
}

export default function AnsweredHistory({ prayers }: AnsweredHistoryProps) {
  const sorted = [...prayers].sort(
    (a, b) => new Date(b.answeredAt ?? 0).getTime() - new Date(a.answeredAt ?? 0).getTime(),
  )

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="font-serif text-2xl text-ink">Answered Prayers</h1>
      <p className="mt-2 text-sm text-ink-faint">
        A record of what's been answered so far, so it isn't forgotten.
      </p>

      <div className="mt-6">
        {sorted.length === 0 ? (
          <p className="border-t border-border py-10 text-ink-soft">
            Nothing here yet. When you mark a prayer answered, it will show up in this list.
          </p>
        ) : (
          sorted.map((prayer) => (
            <div key={prayer.id} className="border-b border-border py-6 first:pt-0">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-serif text-lg text-ink">{prayer.title}</h3>
                <CategoryBadge category={prayer.category} />
              </div>

              <p className="mt-2 text-sm text-ink-faint">
                Asked {formatDate(prayer.createdAt)}
                {prayer.answeredAt && <> &middot; answered {formatDate(prayer.answeredAt)}</>}
              </p>

              <p className="mt-3 text-sm italic leading-relaxed text-ink-soft">
                {prayer.request}
              </p>

              {prayer.answerNote && (
                <p className="mt-3 leading-relaxed text-ink">
                  <span className="text-sm not-italic text-ink-faint">
                    How it was answered —{' '}
                  </span>
                  {prayer.answerNote}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
