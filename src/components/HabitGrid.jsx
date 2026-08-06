import { daysInMonth, dayStr, dowLetter, todayYmd } from '../lib/dates'
import { CheckIcon } from './icons'

export default function HabitGrid({
  habits,
  y,
  m,
  checkins,
  streaks,
  monthCounts,
  onToggle,
  onEditHabit,
  keyOf,
}) {
  const today = todayYmd()
  const numDays = daysInMonth(y, m)
  const days = Array.from({ length: numDays }, (_, i) => i + 1)

  if (!habits.length) {
    return (
      <div className="empty-grid">
        No habits yet — click <b>+ New Habit</b> below to add your first one.
        <br />
        Add as many as you like. No premium, no limits.
      </div>
    )
  }

  return (
    <div className="grid-wrap">
      <table className="habit-table">
        <thead>
          <tr>
            <th className="corner" rowSpan={2}>
              Habits
            </th>
            {days.map((d) => {
              const ds = dayStr(y, m, d)
              return (
                <th key={d} className={`dow${ds === today ? ' today' : ''}`}>
                  {dowLetter(y, m, d)}
                </th>
              )
            })}
            <th className="stat-head" rowSpan={2}>
              Goal
            </th>
            <th className="stat-head" rowSpan={2}>
              Achieved
            </th>
          </tr>
          <tr>
            {days.map((d) => {
              const ds = dayStr(y, m, d)
              return (
                <th key={d} className={`dnum${ds === today ? ' today' : ''}`}>
                  {d}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {habits.map((habit) => {
            const streak = streaks.get(habit.id)
            const achieved = monthCounts.get(habit.id) || 0
            const badgeClass =
              achieved >= habit.goal ? 'met' : achieved > 0 ? 'partial' : 'none'
            return (
              <tr key={habit.id} className="habit-row">
                <td
                  className="habit-name"
                  onClick={() => onEditHabit(habit)}
                  title="Edit habit"
                >
                  {habit.name}
                  {streak && streak.current > 1 && (
                    <span className="streak-chip">🔥{streak.current}</span>
                  )}
                </td>
                {days.map((d) => {
                  const ds = dayStr(y, m, d)
                  const checked = checkins.has(keyOf(habit.id, ds))
                  const future = ds > today
                  const cls = [
                    'cell',
                    checked ? 'checked' : '',
                    future ? 'future' : '',
                    ds === today ? 'today' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')
                  return (
                    <td
                      key={d}
                      className={cls}
                      style={checked ? { background: habit.color } : undefined}
                      onClick={() => !future && onToggle(habit, ds)}
                    >
                      {checked && (
                        <span className="mark">
                          <CheckIcon width={13} height={13} strokeWidth={2.6} />
                        </span>
                      )}
                    </td>
                  )
                })}
                <td className="goal-cell">{habit.goal}</td>
                <td className="achieved-cell">
                  <span className={`achieved-badge ${badgeClass}`}>
                    {achieved}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
