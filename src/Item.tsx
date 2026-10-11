import { useState, useEffect } from 'react'
import * as store from './store'
import type { BoardItem } from './types'
import { EditableText } from './EditableText'

interface ItemProps {
  card: BoardItem
  itemIdx: number
  boardId: string
  colId: string
  isDragging: boolean
  dropAbove?: boolean | null
  onStartDrag: () => void
}

export function Item({ card, itemIdx, boardId, colId, isDragging, dropAbove, onStartDrag }: ItemProps) {
  const [draft, setDraft] = useState(card.text)

  useEffect(() => setDraft(card.text), [card.text])

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
      className={`cursor-grab rounded-sm bg-item p-2.5 text-sm leading-relaxed flex items-start gap-2 select-none drop-target ${isDragging ? 'scale-95 rotate-2' : ''} ${dropAbove ? 'drop-above' : ''}`}
      draggable={!isDragging}
      onDragStart={handleDragStart}
    >
      <EditableText
        value={card.text}
        onSave={(text) => {
          if (text.trim()) store.updateItem(boardId, colId, itemIdx, text)
        }}
        className='flex-1 px-0.5 py-0 text-sm text-text bg-transparent outline-none resize-none word-break-break-word min-h-[1.5em]'
        inputType='textarea'
      />
      <div className='flex gap-x-0.5 card-actions'>
        <button className='text-text cursor-pointer size-6' onClick={() => store.deleteItem(boardId, colId, itemIdx)} title='Delete'>
          ✕
        </button>
      </div>
    </div>
  )
}
