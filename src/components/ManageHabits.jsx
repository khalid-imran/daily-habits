import { useEffect, useState } from 'react'
import Modal from './Modal'
import { ArchiveIcon, DragIcon, PencilIcon } from './icons'

export default function ManageHabits({
  habits,
  onReorder,
  onEdit,
  onArchive,
  onNew,
  onClose,
}) {
  const active = habits.filter((h) => !h.archived)
  const archived = habits.filter((h) => h.archived)

  const [order, setOrder] = useState(() => active.map((h) => h.id))
  const [dragIndex, setDragIndex] = useState(null)

  // keep local order in sync when habits change (add/archive/edit)
  useEffect(() => {
    setOrder(habits.filter((h) => !h.archived).map((h) => h.id))
  }, [habits])

  const byId = new Map(habits.map((h) => [h.id, h]))
  const orderedActive = order.map((id) => byId.get(id)).filter(Boolean)

  function handleDragEnter(index) {
    if (dragIndex === null || dragIndex === index) return
    setOrder((prev) => {
      const next = [...prev]
      const [moved] = next.splice(dragIndex, 1)
      next.splice(index, 0, moved)
      return next
    })
    setDragIndex(index)
  }

  function handleDragEnd() {
    if (dragIndex !== null) onReorder(order)
    setDragIndex(null)
  }

  return (
    <Modal title="Manage Habits" wide onClose={onClose}>
      {orderedActive.length === 0 && archived.length === 0 && (
        <p style={{ color: 'var(--text-soft)' }}>
          Nothing here yet. Add your first habit below.
        </p>
      )}

      <div className="manage-list">
        {orderedActive.map((h, i) => (
          <div
            key={h.id}
            className={`manage-row${dragIndex === i ? ' dragging' : ''}`}
            draggable
            onDragStart={(e) => {
              setDragIndex(i)
              e.dataTransfer.effectAllowed = 'move'
            }}
            onDragEnter={() => handleDragEnter(i)}
            onDragOver={(e) => e.preventDefault()}
            onDragEnd={handleDragEnd}
          >
            <span className="drag-handle" title="Drag to reorder">
              <DragIcon />
            </span>
            <span className="color-dot" style={{ background: h.color }} />
            <span className="manage-name">{h.name}</span>
            <span className="tag">goal {h.goal}</span>
            <button
              className="icon-btn"
              title="Edit"
              onClick={() => onEdit(h)}
            >
              <PencilIcon />
            </button>
            <button
              className="icon-btn"
              title="Archive (keeps history)"
              onClick={() => onArchive(h, true)}
            >
              <ArchiveIcon />
            </button>
          </div>
        ))}
      </div>

      {archived.length > 0 && (
        <>
          <div className="section-label">Archived</div>
          <div className="manage-list">
            {archived.map((h) => (
              <div key={h.id} className="manage-row archived-row">
                <span className="color-dot" style={{ background: h.color }} />
                <span className="manage-name">{h.name}</span>
                <span className="tag">archived</span>
                <button
                  className="icon-btn"
                  title="Edit"
                  onClick={() => onEdit(h)}
                >
                  <PencilIcon />
                </button>
                <button
                  className="btn"
                  style={{ padding: '4px 10px', fontSize: 12 }}
                  onClick={() => onArchive(h, false)}
                >
                  Restore
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="modal-foot">
        <button className="btn" onClick={onNew}>
          + New Habit
        </button>
        <div className="spacer" />
        <button className="btn btn-dark" onClick={onClose}>
          Done
        </button>
      </div>
    </Modal>
  )
}
