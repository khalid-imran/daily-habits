import { useState } from 'react'
import Modal from './Modal'
import { PALETTE } from '../lib/palette'

export default function HabitModal({
  habit,
  onSave,
  onArchive,
  onDelete,
  onClose,
}) {
  const isEdit = Boolean(habit)
  const [name, setName] = useState(habit?.name || '')
  const [goal, setGoal] = useState(habit?.goal ?? 30)
  const [color, setColor] = useState(habit?.color || PALETTE[0])
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!name.trim()) return
    setBusy(true)
    const g = Math.min(31, Math.max(1, Number(goal) || 30))
    await onSave({ name: name.trim(), goal: g, color }, habit?.id)
    setBusy(false)
  }

  return (
    <Modal title={isEdit ? 'Edit Habit' : 'New Habit'} onClose={onClose}>
      <form onSubmit={submit}>
        <div className="field">
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Read 20 minutes"
            maxLength={80}
            autoFocus
            required
          />
        </div>

        <div className="field">
          <label>Monthly goal (days per month)</label>
          <input
            type="number"
            min={1}
            max={31}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Color</label>
          <div className="color-row">
            {PALETTE.map((c) => (
              <button
                type="button"
                key={c}
                className={`swatch${c === color ? ' selected' : ''}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>

        <div className="modal-foot">
          {isEdit && (
            <>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  onArchive(habit, !habit.archived)
                  onClose()
                }}
              >
                {habit.archived ? 'Unarchive' : 'Archive'}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() =>
                  confirmDelete ? onDelete(habit) : setConfirmDelete(true)
                }
              >
                {confirmDelete ? 'Really delete? All history is lost' : 'Delete'}
              </button>
            </>
          )}
          <div className="spacer" />
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-dark" disabled={busy || !name.trim()}>
            Save
          </button>
        </div>
      </form>
    </Modal>
  )
}
