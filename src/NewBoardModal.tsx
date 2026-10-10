import { useRef, useState, useEffect } from 'react'

interface NewBoardModalProps {
  open: boolean
  onClose: () => void
  onCreate: (name: string) => void
}

export function NewBoardModal({ open, onClose, onCreate }: NewBoardModalProps) {
  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (open && inputRef.current) inputRef.current.focus() }, [open])

  function submit() {
    if (name.trim()) onCreate(name.trim())
  }

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Create New Board</h2>
        <input ref={inputRef} value={name} placeholder="Board name..." onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onClose() }} />
        <div className="modal-buttons">
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={submit}>Create</button>
        </div>
      </div>
    </div>
  )
}
