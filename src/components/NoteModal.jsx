import { useEffect, useState } from 'react'
import Modal from './Modal'
import { todayYmd } from '../lib/dates'

export default function NoteModal({ initialDay, notes, onSave, onClose }) {
  const [day, setDay] = useState(initialDay || todayYmd())
  const [content, setContent] = useState('')
  const [busy, setBusy] = useState(false)

  const existing = notes.find((n) => n.day === day)

  // when the chosen day changes, load that day's note (if any)
  useEffect(() => {
    const match = notes.find((n) => n.day === day)
    setContent(match ? match.content : '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day])

  async function submit(e) {
    e.preventDefault()
    if (!content.trim()) return
    setBusy(true)
    await onSave(day, content.trim())
    setBusy(false)
  }

  return (
    <Modal
      title={existing ? 'Edit Note' : 'Create New Note'}
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <div className="field">
          <label>Date</label>
          <input
            type="date"
            value={day}
            max={todayYmd()}
            onChange={(e) => e.target.value && setDay(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Note</label>
          <textarea
            rows={5}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="How did today go?"
            autoFocus
          />
        </div>
        <div className="modal-foot">
          <div className="spacer" />
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-dark" disabled={busy || !content.trim()}>
            Save
          </button>
        </div>
      </form>
    </Modal>
  )
}
