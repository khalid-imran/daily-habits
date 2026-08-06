import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase, fetchAllPages } from '../lib/supabase'
import { computeStreaks } from '../lib/streaks'
import Header from './Header'
import MonthNav from './MonthNav'
import HabitGrid from './HabitGrid'
import HabitModal from './HabitModal'
import ManageHabits from './ManageHabits'
import StatsModal from './StatsModal'
import NotesSection from './NotesSection'
import NoteModal from './NoteModal'

const keyOf = (habitId, day) => `${habitId}|${day}`

export default function Dashboard({ session, theme, onToggleTheme }) {
  const uid = session.user.id

  const [habits, setHabits] = useState([])
  const [checkins, setCheckins] = useState(() => new Set())
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  const [month, setMonth] = useState(() => {
    const n = new Date()
    return { y: n.getFullYear(), m: n.getMonth() }
  })

  const [habitModal, setHabitModal] = useState(null) // null | { habit: object|null }
  const [manageOpen, setManageOpen] = useState(false)
  const [statsOpen, setStatsOpen] = useState(false)
  const [noteModal, setNoteModal] = useState(null) // null | { day }
  const [toast, setToast] = useState('')
  const toastTimer = useRef(null)

  function showToast(msg) {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2600)
  }

  /* ---------------- initial load ---------------- */
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [habitRows, checkinRows, noteRows] = await Promise.all([
          fetchAllPages((a, b) =>
            supabase
              .from('habits')
              .select('*')
              .order('position')
              .order('created_at')
              .range(a, b)
          ),
          fetchAllPages((a, b) =>
            supabase
              .from('checkins')
              .select('habit_id, day')
              .order('day')
              .range(a, b)
          ),
          fetchAllPages((a, b) =>
            supabase
              .from('notes')
              .select('id, day, content')
              .order('day', { ascending: false })
              .range(a, b)
          ),
        ])
        if (cancelled) return
        setHabits(habitRows)
        setCheckins(new Set(checkinRows.map((c) => keyOf(c.habit_id, c.day))))
        setNotes(noteRows)
      } catch (err) {
        if (!cancelled) showToast(`Could not load data: ${err.message}`)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [uid])

  /* ---------------- derived data ---------------- */
  const activeHabits = useMemo(
    () => habits.filter((h) => !h.archived),
    [habits]
  )

  // habitId -> sorted array of checked days (full history)
  const habitDays = useMemo(() => {
    const map = new Map()
    for (const key of checkins) {
      const [habitId, day] = key.split('|')
      if (!map.has(habitId)) map.set(habitId, [])
      map.get(habitId).push(day)
    }
    for (const arr of map.values()) arr.sort()
    return map
  }, [checkins])

  const streaks = useMemo(() => {
    const map = new Map()
    for (const h of habits) {
      map.set(h.id, computeStreaks(habitDays.get(h.id) || []))
    }
    return map
  }, [habits, habitDays])

  // habitId -> checkin count within the visible month
  const monthCounts = useMemo(() => {
    const prefix = `${month.y}-${String(month.m + 1).padStart(2, '0')}-`
    const map = new Map()
    for (const [habitId, days] of habitDays) {
      map.set(habitId, days.filter((d) => d.startsWith(prefix)).length)
    }
    return map
  }, [habitDays, month])

  /* ---------------- checkins ---------------- */
  async function toggleCheckin(habit, day) {
    const key = keyOf(habit.id, day)
    const wasChecked = checkins.has(key)

    setCheckins((prev) => {
      const next = new Set(prev)
      wasChecked ? next.delete(key) : next.add(key)
      return next
    })

    const revert = () => {
      setCheckins((prev) => {
        const next = new Set(prev)
        wasChecked ? next.add(key) : next.delete(key)
        return next
      })
      showToast('Could not save. Check your connection.')
    }

    try {
      if (wasChecked) {
        const { error } = await supabase
          .from('checkins')
          .delete()
          .match({ habit_id: habit.id, day })
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('checkins')
          .upsert(
            { user_id: uid, habit_id: habit.id, day },
            { onConflict: 'habit_id,day', ignoreDuplicates: true }
          )
        if (error) throw error
      }
    } catch {
      revert()
    }
  }

  /* ---------------- habits ---------------- */
  async function saveHabit(fields, habitId) {
    try {
      if (habitId) {
        const { data, error } = await supabase
          .from('habits')
          .update(fields)
          .eq('id', habitId)
          .select()
          .single()
        if (error) throw error
        setHabits((prev) => prev.map((h) => (h.id === habitId ? data : h)))
      } else {
        const position = habits.length
          ? Math.max(...habits.map((h) => h.position)) + 1
          : 0
        const { data, error } = await supabase
          .from('habits')
          .insert({ ...fields, user_id: uid, position })
          .select()
          .single()
        if (error) throw error
        setHabits((prev) => [...prev, data])
      }
      setHabitModal(null)
    } catch (err) {
      showToast(`Could not save habit: ${err.message}`)
    }
  }

  async function setArchived(habit, archived) {
    try {
      const { error } = await supabase
        .from('habits')
        .update({ archived })
        .eq('id', habit.id)
      if (error) throw error
      setHabits((prev) =>
        prev.map((h) => (h.id === habit.id ? { ...h, archived } : h))
      )
      showToast(archived ? 'Habit archived (history kept).' : 'Habit restored.')
    } catch (err) {
      showToast(`Could not update: ${err.message}`)
    }
  }

  async function deleteHabit(habit) {
    try {
      const { error } = await supabase.from('habits').delete().eq('id', habit.id)
      if (error) throw error
      setHabits((prev) => prev.filter((h) => h.id !== habit.id))
      setCheckins((prev) => {
        const next = new Set()
        for (const key of prev) {
          if (!key.startsWith(`${habit.id}|`)) next.add(key)
        }
        return next
      })
      setHabitModal(null)
      showToast('Habit deleted.')
    } catch (err) {
      showToast(`Could not delete: ${err.message}`)
    }
  }

  async function reorderHabits(orderedActiveIds) {
    const archived = habits.filter((h) => h.archived)
    const byId = new Map(habits.map((h) => [h.id, h]))
    const reordered = [
      ...orderedActiveIds.map((id) => byId.get(id)),
      ...archived,
    ].filter(Boolean)

    const updates = []
    const next = reordered.map((h, i) => {
      if (h.position !== i) updates.push({ id: h.id, position: i })
      return { ...h, position: i }
    })
    setHabits(next)

    try {
      await Promise.all(
        updates.map((u) =>
          supabase.from('habits').update({ position: u.position }).eq('id', u.id)
        )
      )
    } catch {
      showToast('Could not save the new order.')
    }
  }

  /* ---------------- notes ---------------- */
  async function saveNote(day, content) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .upsert(
          { user_id: uid, day, content, updated_at: new Date().toISOString() },
          { onConflict: 'user_id,day' }
        )
        .select()
        .single()
      if (error) throw error
      setNotes((prev) => {
        const rest = prev.filter((n) => n.day !== day)
        return [...rest, data].sort((a, b) => (a.day < b.day ? 1 : -1))
      })
      setNoteModal(null)
    } catch (err) {
      showToast(`Could not save note: ${err.message}`)
    }
  }

  async function deleteNote(note) {
    try {
      const { error } = await supabase.from('notes').delete().eq('id', note.id)
      if (error) throw error
      setNotes((prev) => prev.filter((n) => n.id !== note.id))
    } catch (err) {
      showToast(`Could not delete note: ${err.message}`)
    }
  }

  /* ---------------- month nav ---------------- */
  const now = new Date()
  const isCurrentMonth = month.y === now.getFullYear() && month.m === now.getMonth()

  const prevMonth = () =>
    setMonth(({ y, m }) => (m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 }))
  const nextMonth = () =>
    setMonth(({ y, m }) => (m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 }))
  const goToday = () =>
    setMonth({ y: now.getFullYear(), m: now.getMonth() })

  /* ---------------- render ---------------- */
  return (
    <>
      <Header
        email={session.user.email}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onManage={() => setManageOpen(true)}
        onStats={() => setStatsOpen(true)}
        onSignOut={() => supabase.auth.signOut()}
      />

      <div className="month-nav-wrap">
        <MonthNav
          y={month.y}
          m={month.m}
          onPrev={prevMonth}
          onNext={nextMonth}
          onToday={goToday}
          isCurrent={isCurrentMonth}
        />
      </div>

      {loading ? (
        <div className="page-loading">Loading your habits…</div>
      ) : (
        <>
          <HabitGrid
            habits={activeHabits}
            y={month.y}
            m={month.m}
            checkins={checkins}
            streaks={streaks}
            monthCounts={monthCounts}
            onToggle={toggleCheckin}
            onEditHabit={(habit) => setHabitModal({ habit })}
            keyOf={keyOf}
          />

          <div className="new-habit-row">
            <button className="btn" onClick={() => setHabitModal({ habit: null })}>
              + New Habit
            </button>
          </div>

          <NotesSection
            notes={notes}
            onNew={() => setNoteModal({ day: null })}
            onEdit={(note) => setNoteModal({ day: note.day })}
            onDelete={deleteNote}
          />
        </>
      )}

      {habitModal && (
        <HabitModal
          habit={habitModal.habit}
          onSave={saveHabit}
          onArchive={setArchived}
          onDelete={deleteHabit}
          onClose={() => setHabitModal(null)}
        />
      )}

      {manageOpen && (
        <ManageHabits
          habits={habits}
          onReorder={reorderHabits}
          onEdit={(habit) => setHabitModal({ habit })}
          onArchive={setArchived}
          onNew={() => setHabitModal({ habit: null })}
          onClose={() => setManageOpen(false)}
        />
      )}

      {statsOpen && (
        <StatsModal
          habits={habits}
          streaks={streaks}
          monthCounts={monthCounts}
          month={month}
          onClose={() => setStatsOpen(false)}
        />
      )}

      {noteModal && (
        <NoteModal
          initialDay={noteModal.day}
          notes={notes}
          onSave={saveNote}
          onClose={() => setNoteModal(null)}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </>
  )
}
