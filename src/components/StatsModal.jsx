import Modal from './Modal'
import { MONTHS, daysInMonth } from '../lib/dates'

export default function StatsModal({
  habits,
  streaks,
  monthCounts,
  month,
  onClose,
}) {
  const sorted = [...habits].sort((a, b) =>
    a.archived === b.archived ? a.position - b.position : a.archived ? 1 : -1
  )
  const monthName = `${MONTHS[month.m]} ${month.y}`
  const totalDays = daysInMonth(month.y, month.m)

  return (
    <Modal title="Statistics" wide onClose={onClose}>
      {sorted.length === 0 ? (
        <p style={{ color: 'var(--text-soft)' }}>
          Add a habit first — stats will show up here.
        </p>
      ) : (
        <div className="stats-grid">
          {sorted.map((h) => {
            const s = streaks.get(h.id) || { current: 0, best: 0, total: 0 }
            const achieved = monthCounts.get(h.id) || 0
            const pct = Math.round((achieved / totalDays) * 100)
            const goalPct = Math.min(100, Math.round((achieved / h.goal) * 100))
            return (
              <div className="stat-card" key={h.id}>
                <div className="stat-card-head">
                  <span className="color-dot" style={{ background: h.color }} />
                  {h.name}
                  {h.archived && <span className="tag">archived</span>}
                </div>
                <div className="stat-nums">
                  <div className="stat-num">
                    <b>{s.current}</b>
                    <span>Current streak</span>
                  </div>
                  <div className="stat-num">
                    <b>{s.best}</b>
                    <span>Best streak</span>
                  </div>
                  <div className="stat-num">
                    <b>
                      {achieved}/{h.goal}
                    </b>
                    <span>{monthName}</span>
                  </div>
                  <div className="stat-num">
                    <b>{s.total}</b>
                    <span>All time</span>
                  </div>
                </div>
                <div
                  className="month-bar"
                  title={`${achieved} of ${h.goal} this month (${pct}% of the month)`}
                >
                  <div
                    style={{ width: `${goalPct}%`, background: h.color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Modal>
  )
}
