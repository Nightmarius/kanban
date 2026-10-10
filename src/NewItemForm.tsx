import { useRef, useState } from 'react'
import * as store from './store'

interface NewItemFormProps {
  boardId: string
  colId: string
}

export function NewItemForm({ boardId, colId }: NewItemFormProps) {
  const [editing, setEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  if (editing) {
    return (
      <div className="add-item-form">
        <input
          ref={inputRef}
          className="add-item-input"
          placeholder="Item name..."
          autoFocus
          onBlur={(e) => {
            if (e.currentTarget.value.trim()) store.addItem(boardId, colId, e.currentTarget.value.trim())
            setEditing(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') store.addItem(boardId, colId, (e.target as HTMLInputElement).value.trim())
            if (e.key === 'Escape') setEditing(false)
          }}
        />
      </div>
    )
  }

  return <button className="btn-add-item" onClick={() => setEditing(true)}>+ Add item</button>
}
