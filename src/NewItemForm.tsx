import { useRef, useState, useEffect } from 'react'
import * as store from './store'

interface NewItemFormProps {
  boardId: string
  colId: string
}

export function NewItemForm({ boardId, colId }: NewItemFormProps) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (open && inputRef.current) inputRef.current.focus() }, [open])

  function submit() {
    if (text.trim()) {
      store.addItem(boardId, colId, text.trim())
      setText('')
    }
    setOpen(false)
  }

  if (!open) return <button className="btn-add-item" onClick={() => setOpen(true)}>+ Add item</button>

  return (
    <div className="add-item-form">
      <input ref={inputRef} className="add-item-input" placeholder="Enter item..." value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setOpen(false) }} />
      <button className="btn-add-item" onClick={submit}>Add</button>
    </div>
  )
}
