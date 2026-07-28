import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { ideasByTime } from './data/ideas'
import { createReflectionId, loadReflections, saveReflections } from './storage'
import type { Reflection, ServiceIdea, TimeCategory } from './types'

type View = 'today' | 'reflections' | 'about'
type TodayStage = 'choose' | 'idea' | 'reflect'

interface NavItem {
  id: View
  label: string
  icon: ReactNode
}

const timeChoices: { id: TimeCategory; label: string; description: string; number: string }[] = [
  { id: 'fifteen', label: '15 minutes', description: 'A small, attentive act', number: '15' },
  { id: 'hour', label: 'One hour', description: 'Room to help in a practical way', number: '1h' },
  { id: 'afternoon', label: 'One afternoon', description: 'Time to show up and stay awhile', number: '½d' },
]

const navItems: NavItem[] = [
  {
    id: 'today',
    label: 'Today',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 5.5h14v13H5zM8 3v4M16 3v4M5 9.5h14" />
      </svg>
    ),
  },
  {
    id: 'reflections',
    label: 'Past Reflections',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 4h12v16H6zM9 8h6M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    id: 'about',
    label: 'About',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 10v7M12 7h.01" />
      </svg>
    ),
  },
]

export function pickDifferentIndex(length: number, previousIndex: number, random = Math.random): number {
  if (length <= 1) return 0
  const candidate = Math.floor(random() * (length - 1))
  return candidate >= previousIndex && previousIndex >= 0 ? candidate + 1 : candidate
}

function formatReflectionDate(timestamp: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(timestamp))
}

function SafetyFooter() {
  return (
    <footer className="safety-footer">
      <p className="safety-kicker">A simple safety note</p>
      <p>Use good judgment. Do not enter unsafe situations, meet strangers alone, or attempt work that requires professional training.</p>
    </footer>
  )
}

interface PageIntroProps {
  id: string
  note: string
  title: string
  children?: ReactNode
}

function PageIntro({ id, note, title, children }: PageIntroProps) {
  return (
    <header className="page-intro">
      <p className="margin-note">{note}</p>
      <h1 id={id}>{title}</h1>
      {children}
    </header>
  )
}

function App() {
  const [view, setView] = useState<View>('today')
  const [todayStage, setTodayStage] = useState<TodayStage>('choose')
  const [selectedIdea, setSelectedIdea] = useState<ServiceIdea | null>(null)
  const [reflections, setReflections] = useState<Reflection[]>(loadReflections)
  const [whatHappened, setWhatHappened] = useState('')
  const [whatLearned, setWhatLearned] = useState('')
  const [saveError, setSaveError] = useState(false)
  const mainRef = useRef<HTMLElement>(null)
  const didRender = useRef(false)
  const lastIndices = useRef<Record<TimeCategory, number>>({ fifteen: -1, hour: -1, afternoon: -1 })

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      didRender.current = true
    })
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (!didRender.current) return
    mainRef.current?.focus({ preventScroll: true })
  }, [view, todayStage, selectedIdea?.id])

  const chooseIdea = (category: TimeCategory) => {
    const pool = ideasByTime[category]
    const nextIndex = pickDifferentIndex(pool.length, lastIndices.current[category])
    lastIndices.current[category] = nextIndex
    setSelectedIdea(pool[nextIndex])
    setTodayStage('idea')
    setSaveError(false)
  }

  const showAnotherIdea = () => {
    if (!selectedIdea) return
    chooseIdea(selectedIdea.timeCategory)
  }

  const returnToTimeChoice = () => {
    setSelectedIdea(null)
    setTodayStage('choose')
    setSaveError(false)
  }

  const beginReflection = () => {
    setTodayStage('reflect')
    setSaveError(false)
  }

  const handleSaveReflection = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedIdea || !whatHappened.trim() || !whatLearned.trim()) return

    const reflection: Reflection = {
      id: createReflectionId(),
      ideaId: selectedIdea.id,
      ideaTitle: selectedIdea.title,
      timeLabel: selectedIdea.timeLabel,
      completedAt: new Date().toISOString(),
      whatHappened: whatHappened.trim(),
      whatLearned: whatLearned.trim(),
      scriptureReference: selectedIdea.scriptureReference,
    }
    const nextReflections = [reflection, ...reflections]

    if (!saveReflections(nextReflections)) {
      setSaveError(true)
      return
    }

    setReflections(nextReflections)
    setWhatHappened('')
    setWhatLearned('')
    setSaveError(false)
    setSelectedIdea(null)
    setTodayStage('choose')
    setView('reflections')
  }

  const navigate = (nextView: View) => {
    setView(nextView)
  }

  let page: ReactNode

  if (view === 'reflections') {
    page = (
      <section className="content-column reflections-page" aria-labelledby="reflections-heading">
        <PageIntro id="reflections-heading" note="kept privately here" title="Past Reflections">
          <p>A quiet record of the times you chose to show up.</p>
        </PageIntro>

        {reflections.length === 0 ? (
          <div className="empty-state">
            <p className="empty-mark" aria-hidden="true">01</p>
            <div>
              <h2>There is nothing to review yet.</h2>
              <p>After you complete an idea and save a reflection, it will be kept here on this device for you to revisit.</p>
              <button className="text-button" type="button" onClick={() => navigate('today')}>
                Find a way to help
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        ) : (
          <ol className="reflection-list">
            {reflections.map((reflection, index) => (
              <li key={reflection.id} className="reflection-entry">
                <div className="reflection-meta">
                  <span className="entry-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <p>{formatReflectionDate(reflection.completedAt)}</p>
                    <p>{reflection.timeLabel}</p>
                  </div>
                </div>
                <div className="reflection-body">
                  <h2>{reflection.ideaTitle}</h2>
                  <div className="reflection-answer">
                    <h3>What happened?</h3>
                    <p>{reflection.whatHappened}</p>
                  </div>
                  <div className="reflection-answer">
                    <h3>What did you learn?</h3>
                    <p>{reflection.whatLearned}</p>
                  </div>
                  <p className="scripture-reference">{reflection.scriptureReference}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    )
  } else if (view === 'about') {
    page = (
      <section className="content-column about-page" aria-labelledby="about-heading">
        <PageIntro id="about-heading" note="the heart of it" title="About Bread & Light">
          <p>Service can begin with the time you actually have.</p>
        </PageIntro>

        <div className="about-lead">
          <p>Bread & Light offers one manageable prompt and then gets out of the way. An idea is a starting point, not an obligation.</p>
        </div>

        <div className="about-sections">
          <section>
            <p className="section-number" aria-hidden="true">01</p>
            <div>
              <h2>Private by design</h2>
              <p>There are no accounts, posts, scores, or streaks. Your reflections remain in this app’s local storage on this computer. Removing the app’s saved data also removes those reflections.</p>
            </div>
          </section>
          <section>
            <p className="section-number" aria-hidden="true">02</p>
            <div>
              <h2>Freedom and good judgment</h2>
              <p>Every suggestion should be weighed with care. Respect your relationships, abilities, circumstances, and boundaries. Ask permission, and honor another person’s answer.</p>
            </div>
          </section>
        </div>

        <aside className="ordinary-note">
          <p className="margin-note">in the margin</p>
          <p>Love is often ordinary: attention, a kept promise, a shared burden, or time freely given.</p>
        </aside>
      </section>
    )
  } else if (todayStage === 'idea' && selectedIdea) {
    page = (
      <section className="content-column idea-page" aria-labelledby="idea-heading">
        <button className="back-button" type="button" onClick={returnToTimeChoice}>
          <span aria-hidden="true">←</span>
          Choose a different amount of time
        </button>

        <div className="idea-heading-block">
          <div>
            <p className="margin-note">a way to help</p>
            <h1 id="idea-heading">{selectedIdea.title}</h1>
          </div>
          <p className="time-stamp">{selectedIdea.timeLabel}</p>
        </div>

        <p className="idea-introduction">{selectedIdea.introduction}</p>

        <ol className="idea-steps">
          {selectedIdea.steps.map((step, index) => (
            <li key={step}>
              <span aria-hidden="true">{index + 1}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>

        <blockquote className="scripture-block">
          <p>{selectedIdea.scripture}</p>
          <cite>{selectedIdea.scriptureReference}</cite>
        </blockquote>

        {selectedIdea.safetyNote ? (
          <aside className="idea-safety" aria-labelledby="idea-safety-heading">
            <p id="idea-safety-heading">A thoughtful boundary</p>
            <p>{selectedIdea.safetyNote}</p>
          </aside>
        ) : null}

        <div className="actions">
          <button className="button button-primary" type="button" onClick={beginReflection}>I’ll do this</button>
          <button className="button button-secondary" type="button" onClick={showAnotherIdea}>Show me another idea</button>
        </div>
      </section>
    )
  } else if (todayStage === 'reflect' && selectedIdea) {
    page = (
      <section className="content-column reflection-form-page" aria-labelledby="reflection-form-heading">
        <PageIntro id="reflection-form-heading" note="for your eyes only" title="When you’re back, take a moment.">
          <p>You chose “{selectedIdea.title}.” What you write stays here in the app on this computer.</p>
        </PageIntro>

        <form onSubmit={handleSaveReflection}>
          <div className="field-group">
            <label htmlFor="what-happened">What happened?</label>
            <textarea
              id="what-happened"
              value={whatHappened}
              onChange={(event) => setWhatHappened(event.target.value)}
              aria-describedby="what-happened-hint"
              required
            />
            <p id="what-happened-hint" className="field-hint">A few honest sentences are enough.</p>
          </div>

          <div className="field-group">
            <label htmlFor="what-learned">What did you learn?</label>
            <textarea
              id="what-learned"
              value={whatLearned}
              onChange={(event) => setWhatLearned(event.target.value)}
              aria-describedby="what-learned-hint"
              required
            />
            <p id="what-learned-hint" className="field-hint">About the person, about service, or about yourself.</p>
          </div>

          {saveError ? (
            <p className="save-error" role="alert">Your reflection could not be saved. Please copy your words somewhere safe, check that local storage is available, and try again.</p>
          ) : null}

          <div className="actions">
            <button className="button button-primary" type="submit">Save reflection</button>
            <button className="button button-secondary" type="button" onClick={() => setTodayStage('idea')}>I’m not finished yet</button>
          </div>
        </form>
      </section>
    )
  } else {
    page = (
      <section className="content-column choose-page" aria-labelledby="choose-heading">
        <PageIntro id="choose-heading" note="one small beginning" title="How much time do you have today?">
          <p>Choose what is honestly available. A small act of love is still an act of love.</p>
        </PageIntro>

        <div className="time-options" aria-label="Available time">
          {timeChoices.map((choice) => (
            <button key={choice.id} className="time-option" type="button" onClick={() => chooseIdea(choice.id)}>
              <span className="time-number" aria-hidden="true">{choice.number}</span>
              <span className="time-copy">
                <strong>{choice.label}</strong>
                <span>{choice.description}</span>
              </span>
              <span className="time-arrow" aria-hidden="true">→</span>
            </button>
          ))}
        </div>

        <p className="choice-footnote">No score to keep. Just one honest choice for the time in front of you.</p>
      </section>
    )
  }

  return (
    <div className="app-frame">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="app-shell">
        <aside className="sidebar">
          <div className="brand-block">
            <p className="wordmark">Bread <span>&amp;</span> Light</p>
            <p>small ways to serve</p>
          </div>

          <nav className="primary-nav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={view === item.id ? 'nav-item active' : 'nav-item'}
                aria-current={view === item.id ? 'page' : undefined}
                onClick={(event) => {
                  event.preventDefault()
                  navigate(item.id)
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            ))}
          </nav>

          <div className="privacy-note">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 10V7a5 5 0 0 1 10 0v3M5 10h14v10H5z" />
            </svg>
            <p>Your reflections stay on this computer.</p>
          </div>
        </aside>

        <div className="workspace">
          <main id="main-content" ref={mainRef} tabIndex={-1}>
            {page}
            <SafetyFooter />
          </main>
        </div>
      </div>

      <nav className="mobile-dock" aria-label="Primary navigation">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={view === item.id ? 'dock-item active' : 'dock-item'}
            aria-current={view === item.id ? 'page' : undefined}
            onClick={(event) => {
              event.preventDefault()
              navigate(item.id)
            }}
          >
            {item.icon}
            <span>{item.id === 'reflections' ? 'Reflections' : item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  )
}

export default App
