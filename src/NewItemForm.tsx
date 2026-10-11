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
      <div className="flex gap-1.5 py-1">
        <input
          ref={inputRef}
           className="flex-1 px-2 py-2 rounded border border-white/10 bg-card text-text text-sm focus:border-accent outline-none placeholder:text-text/40"
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

  return <button className="px-4 py-2 rounded border-none bg-accent text-white cursor-pointer text-[13px] font-medium hover:bg-hover transition-colors" onClick={() => setEditing(true)}>+ Add item</button>
}
