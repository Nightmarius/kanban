import { useRef, useState, useEffect } from 'react'
import * as store from './store'
import type { BoardItem } from './types'

interface CardProps {
  card: BoardItem
  itemIdx: number
  boardId: string
  colId: string
  isDragging: boolean
  dropAbove?: boolean | null
  onStartDrag: () => void
}

export function Card({ card, itemIdx, boardId, colId, isDragging, dropAbove, onStartDrag }: CardProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(card.text)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => setDraft(card.text), [card.text])
  useEffect(() => {
    if (editing && textareaRef.current) textareaRef.current.focus()
  }, [editing])

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

  function handleDragStart(e: React.DragEvent<HTMLDivElement>) {
    onStartDrag()
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({
        cardId: card.id,
        text: card.text,
        colId,
        itemIdx,
      }),
    )
  }

  return (
    <div
      className={`cursor-grab rounded-sm bg-item p-2.5 text-sm leading-relaxed flex items-start gap-2 select-none ${isDragging ? 'scale-95 rotate-2' : ''} ${dropAbove ? 'drop-above' : ''}`}
      onDragStart={handleDragStart}
    >
      {editing ? (
        <textarea
          ref={textareaRef}
          className='flex-1 px-0.5 py-0 text-sm text-text bg-transparent outline-none overflow-hidden resize-none word-break-break-word'
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setDraft(card.text)
              setEditing(false)
            }
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              commitEdit()
            }
          }}
          rows={1}
        />
      ) : (
        <span className='flex-1 px-0.5 py-0 text-sm text-text cursor-text' onClick={() => setEditing(true)}>
          {card.text}
        </span>
      )}
      <div className='flex gap-x-0.5 card-actions'>
        <button className='text-text cursor-pointer size-6' onClick={() => store.deleteItem(boardId, colId, itemIdx)} title='Delete'>
          ✕
        </button>
      </div>
    </div>
  )
}
