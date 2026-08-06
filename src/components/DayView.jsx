import { useState } from 'react'
import { addDays, prettyDate, todayYmd, weekdayName } from '../lib/dates'
import { CheckIcon, ChevronLeft, ChevronRight } from './icons'

export default function DayView({
  habits,
  checkins,
  keyOf,
  onToggle,
  streaks,
  notes,
  onOpenNote,
}) {
  const today = todayYmd()
  const [day, setDay] = useState(today)
  const isToday = day === today

  const done = habits.filter((h) => checkins.has(keyOf(h.id, day))).length
  const pct = habits.length ? Math.round((done / habits.length) * 100) : 0
  const note = notes.find((n) => n.day === day)

  return (
    <div className="dayview">
      <div className="dayview-nav">
        <button
          className="icon-btn"
          onClick={() => setDay(addDays(day, -1))}
          aria-label="Previous day"
        >
          <ChevronLeft />
        </button>
        <div className="dayview-label">
          <b>{isToday ? 'Today' : weekdayName(day)}</b>
          <span>{prettyDate(day)}</span>
        </div>
        <button
          className="icon-btn"
          onClick={() => setDay(addDays(day, 1))}
          disabled={isToday}
          style={isToday ? { opacity: 0.25, cursor: 'default' } : undefined}
          aria-label="Next day"
        >
          <ChevronRight />
        </button>
      </div>

      {!isToday && (
        <button className="link dayview-today-link" onClick={() => setDay(today)}>
          Back to today
        </button>
      )}

      {habits.length === 0 ? (
        <div className="empty-grid">
          No habits yet — click <b>+ New Habit</b> below to add your first one.
        </div>
      ) : (
        <>
          <div className="dayview-progress">
            <span>
              {done} of {habits.length} done
            </span>
            <div className="month-bar">
              <div
                style={{
                  width: `${pct}%`,
                  background: 'var(--success-soft)',
                }}
              />
            </div>
          </div>

          <div className="dayview-list">
            {habits.map((habit) => {
              const checked = checkins.has(keyOf(habit.id, day))
              const streak = streaks.get(habit.id)
              return (
                <button
                  key={habit.id}
                  className={`dayrow${checked ? ' checked' : ''}`}
                  onClick={() => onToggle(habit, day)}
                >
                  <span className="color-dot" style={{ background: habit.color }} />
                  <span className="dayrow-name">
                    {habit.name}
                    {streak && streak.current > 1 && (
                      <span className="streak-chip">🔥{streak.current}</span>
                    )}
                  </span>
                  <span
                    className="check-circle"
                    style={checked ? { background: habit.color, borderColor: habit.color } : undefined}
                  >
                    {checked && <CheckIcon width={16} height={16} strokeWidth={3} />}
                  </span>
                </button>
              )
            })}
          </div>

          <button className="dayview-note" onClick={() => onOpenNote(day)}>
            {note ? (
              <>
                <span className="note-date">Note — {prettyDate(day)}</span>
                <span className="note-content">{note.content}</span>
              </>
            ) : (
              <span className="dayview-note-empty">+ Add a note for this day</span>
            )}
          </button>
        </>
      )}
    </div>
  )
}
