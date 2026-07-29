import type { Category } from '../types'
import { CATEGORIES } from '../types'

export default function CategoryBadge({ category }: { category: Category }) {
  const label = CATEGORIES.find((c) => c.value === category)?.label ?? category

  return (
    <span className="inline-block border border-border px-2 py-0.5 text-xs text-ink-soft">
      {label}
    </span>
  )
}
