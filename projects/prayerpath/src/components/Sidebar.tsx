export type View = 'home' | 'prayers' | 'answered' | 'form'

interface SidebarProps {
  view: View
  onNavigate: (view: View) => void
}

const links: { view: View; label: string }[] = [
  { view: 'prayers', label: 'My Prayers' },
  { view: 'answered', label: 'Answered' },
]

export default function Sidebar({ view, onNavigate }: SidebarProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 sm:h-screen sm:w-52 sm:flex-none sm:flex-col sm:items-stretch sm:justify-start sm:border-b-0 sm:border-r sm:px-4 sm:py-6">
      <button
        onClick={() => onNavigate('home')}
        className="text-left font-serif text-lg text-ink sm:mb-6 sm:px-2"
      >
        PrayerPath
      </button>

      <nav className="flex gap-1 sm:flex-col">
        {links.map((link) => {
          const active = view === link.view || (view === 'form' && link.view === 'prayers')
          return (
            <button
              key={link.view}
              onClick={() => onNavigate(link.view)}
              className={
                active
                  ? 'px-3 py-1.5 text-left text-sm text-ink sm:bg-ink sm:text-paper'
                  : 'px-3 py-1.5 text-left text-sm text-ink-soft hover:text-ink sm:hover:bg-paper-dim'
              }
            >
              {link.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
