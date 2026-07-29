import { useEffect, useState } from 'react'
import type { Prayer } from './types'
import { hasStoredPrayers, loadPrayers, savePrayers } from './storage'
import { seedPrayers } from './data/seedPrayers'
import Sidebar from './components/Sidebar'
import type { View } from './components/Sidebar'
import Home from './components/Home'
import PrayerList from './components/PrayerList'
import PrayerForm from './components/PrayerForm'
import AnsweredHistory from './components/AnsweredHistory'

function App() {
  const [prayers, setPrayers] = useState<Prayer[]>(() =>
    hasStoredPrayers() ? loadPrayers() : seedPrayers,
  )
  const [view, setView] = useState<View>('prayers')
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    savePrayers(prayers)
  }, [prayers])

  const activePrayers = prayers.filter((p) => !p.answered)
  const answeredPrayers = prayers.filter((p) => p.answered)
  const editingPrayer = prayers.find((p) => p.id === editingId) ?? null

  const openAddForm = () => {
    setEditingId(null)
    setView('form')
  }

  const openEditForm = (id: string) => {
    setEditingId(id)
    setView('form')
  }

  const handleSave = (prayer: Prayer) => {
    setPrayers((prev) => {
      const exists = prev.some((p) => p.id === prayer.id)
      return exists ? prev.map((p) => (p.id === prayer.id ? prayer : p)) : [prayer, ...prev]
    })
    setView('prayers')
  }

  const handleDelete = (id: string) => {
    setPrayers((prev) => prev.filter((p) => p.id !== id))
    setView('prayers')
  }

  const handleMarkAnswered = (id: string, answerNote: string) => {
    setPrayers((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, answered: true, answeredAt: new Date().toISOString(), answerNote }
          : p,
      ),
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper sm:flex-row">
      <Sidebar view={view} onNavigate={setView} />

      <div className="min-w-0 flex-1">
        {view === 'home' && <Home />}

        {view === 'prayers' && (
          <PrayerList
            prayers={activePrayers}
            onAdd={openAddForm}
            onEdit={openEditForm}
            onMarkAnswered={handleMarkAnswered}
          />
        )}

        {view === 'form' && (
          <PrayerForm
            existing={editingPrayer}
            onSave={handleSave}
            onCancel={() => setView('prayers')}
            onDelete={handleDelete}
          />
        )}

        {view === 'answered' && <AnsweredHistory prayers={answeredPrayers} />}

        <footer className="mx-auto max-w-2xl border-t border-border px-5 py-8 text-xs text-ink-faint">
          PrayerPath &middot; your prayers stay on this device, in your browser's local
          storage. Scripture quotations are from the King James Version.
        </footer>
      </div>
    </div>
  )
}

export default App