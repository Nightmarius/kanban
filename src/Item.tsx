import { useState, useEffect } from 'react'
import * as store from './store'
import type { BoardItem } from './types'
import { EditableText } from './EditableText'

interface ItemProps {
  item: BoardItem
  itemIdx: number
  boardId: string
  colId: string
  isDragging: boolean
  onStartDrag: () => void
}

export function Item({ item, itemIdx, boardId, colId, isDragging, onStartDrag }: ItemProps) {
  const [draft, setDraft] = useState(item.text)

  useEffect(() => setDraft(item.text), [item.text])

  function handleDragStart(e: React.DragEvent<HTMLDivElement>) {
    onStartDrag()
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({
        itemId: item.id,
        text: item.text,
        colId,
        itemIdx,
      }),
    )
  }

  return (
    <div
      className={`cursor-grab rounded-sm bg-item p-3 text-sm leading-relaxed flex items-start 
        gap-2 select-none drop-target ${isDragging ? 'scale-95 rotate-2 bg-green-500' : ''}`}
      draggable
      onDragStart={handleDragStart}
    >
      <EditableText
        value={item.text}
        onSave={(text) => {
          if (text.trim()) store.updateItem(boardId, colId, itemIdx, text)
        }}
        className='text-sm word-break-break-word'
      />
      <div className='flex gap-x-0.5'>
        <button className='text-text cursor-pointer size-6' onClick={() => store.deleteItem(boardId, colId, itemIdx)} title='Delete'>
          ✕
        </button>
      </div>
    </div>
  )
}
