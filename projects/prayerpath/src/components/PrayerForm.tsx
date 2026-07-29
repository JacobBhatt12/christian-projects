import { useState } from 'react'
import type { Category, Prayer } from '../types'
import { CATEGORIES } from '../types'
import { createPrayerId } from '../storage'

interface PrayerFormProps {
  existing: Prayer | null
  onSave: (prayer: Prayer) => void
  onCancel: () => void
  onDelete: (id: string) => void
}

export default function PrayerForm({ existing, onSave, onCancel, onDelete }: PrayerFormProps) {
  const [title, setTitle] = useState(existing?.title ?? '')
  const [category, setCategory] = useState<Category>(existing?.category ?? 'family')
  const [request, setRequest] = useState(existing?.request ?? '')
  const [note, setNote] = useState(existing?.note ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !request.trim()) return

    onSave({
      id: existing?.id ?? createPrayerId(),
      title: title.trim(),
      request: request.trim(),
      category,
      note: note.trim(),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      answered: existing?.answered ?? false,
      answeredAt: existing?.answeredAt,
      answerNote: existing?.answerNote,
    })
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <h1 className="font-serif text-2xl text-ink">
        {existing ? 'Edit prayer' : 'Add a prayer'}
      </h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm text-ink-soft">
            A short title, so you can find it later
          </label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Mom's knee surgery"
            className="mt-1.5 w-full border border-border bg-paper px-3 py-2 text-ink outline-none focus:border-ink"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm text-ink-soft">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="mt-1.5 w-full border border-border bg-paper px-3 py-2 text-ink outline-none focus:border-ink"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="request" className="block text-sm text-ink-soft">
            What are you praying for?
          </label>
          <textarea
            id="request"
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            required
            rows={4}
            placeholder="Write it the way you'd actually say it."
            className="mt-1.5 w-full border border-border bg-paper px-3 py-2 text-ink outline-none focus:border-ink"
          />
        </div>

 <div>
          <label htmlFor="note" className="block text-sm text-ink-soft">
            A private note (optional) — your own thoughts, a verse, anything you want to
            remember
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Only you see this."
            className="mt-1.5 w-full border border-border bg-paper px-3 py-2 text-ink outline-none focus:border-ink"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            type="submit"
            className="border border-ink bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-ink-soft"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-ink-soft hover:text-ink"
          >
            Cancel
          </button>

          {existing && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Delete this prayer? This can\'t be undone.')) {
                  onDelete(existing.id)
                }
              }}
              className="ml-auto text-sm text-ink-faint hover:text-ink"
            >
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  )
}