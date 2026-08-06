import { useState } from 'react'
import { prettyDate } from '../lib/dates'
import { PencilIcon, TrashIcon } from './icons'

export default function NotesSection({ notes, onNew, onEdit, onDelete }) {
  const [confirmId, setConfirmId] = useState(null)

  return (
    <section className="notes-section">
      <div className="notes-head">
        <div className="notes-title">Notes</div>
        <button className="btn" onClick={onNew}>
          + New Note
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="notes-empty">
          Create your first note by clicking on + New Note
        </div>
      ) : (
        notes.map((note) => (
          <div className="note-card" key={note.id}>
            <div className="note-date">{prettyDate(note.day)}</div>
            <div className="note-content">{note.content}</div>
            <div className="note-actions">
              <button
                className="icon-btn"
                title="Edit"
                onClick={() => onEdit(note)}
              >
                <PencilIcon />
              </button>
              <button
                className="icon-btn"
                title={confirmId === note.id ? 'Click again to delete' : 'Delete'}
                style={confirmId === note.id ? { color: 'var(--danger)' } : undefined}
                onClick={() => {
                  if (confirmId === note.id) {
                    onDelete(note)
                    setConfirmId(null)
                  } else {
                    setConfirmId(note.id)
                    setTimeout(() => setConfirmId(null), 3000)
                  }
                }}
              >
                <TrashIcon />
              </button>
            </div>
          </div>
        ))
      )}
    </section>
  )
}
