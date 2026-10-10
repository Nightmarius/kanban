import { useRef, useState, useEffect } from 'react'
import * as store from './store'
import type { BoardItem } from './types'

interface CardProps {
  card: BoardItem
  itemIdx: number
  boardId: string
  colId: string
  dragging: boolean
}

export function Card({ card, itemIdx, boardId, colId, dragging }: CardProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(card.text)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { setDraft(card.text) }, [card.text])
  useEffect(() => { if (editing && textareaRef.current) textareaRef.current.focus() }, [editing])

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }

  function commitEdit() {
    setEditing(false)
    if (draft !== card.text && draft.trim()) store.updateItem(boardId, colId, itemIdx, draft)
  }

  return (
    <div className={`card ${dragging ? 'dragging' : ''}`} draggable onDragStart={(e) => {
      e.dataTransfer.effectAllowed = 'move'
      e.dataTransfer.setData('text/plain', JSON.stringify({ boardId, colId, itemIdx }))
    }}>
      {editing ? (
        <textarea ref={textareaRef} className="card-text" value={draft} onChange={(e) => { setDraft(e.target.value); autoResize() }} onBlur={commitEdit} onKeyDown={(e) => {
          if (e.key === 'Escape') { setDraft(card.text); setEditing(false) }
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit() }
        }} rows={1} />
      ) : (
        <span className="card-text" onDoubleClick={() => setEditing(true)}>{card.text}</span>
      )}
      <div className="item-actions">
        <button className="btn-item-action" onClick={() => setEditing(true)} title="Edit">✎</button>
        <button className="btn-item-action danger" onClick={() => store.deleteItem(boardId, colId, itemIdx)} title="Delete">✕</button>
      </div>
    </div>
  )
}
