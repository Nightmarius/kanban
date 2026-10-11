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
  dropAbove?: boolean | null
  onStartDrag: () => void
}

export function Item({ item, itemIdx, boardId, colId, isDragging, dropAbove, onStartDrag }: ItemProps) {
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
      className={`cursor-grab rounded-sm bg-item p-2 text-sm leading-relaxed flex items-start 
        gap-2 select-none drop-target ${isDragging ? 'scale-95 rotate-2 bg-green-500' : ''} ${dropAbove ? 'border-t-2 border-accent' : ''}`}
      draggable
      onDragStart={handleDragStart}
    >
      <EditableText
        value={item.text}
        onSave={(text) => {
          if (text.trim()) store.updateItem(boardId, colId, itemIdx, text)
        }}
        className='flex-1 px-0.5 py-0 text-sm text-text bg-transparent outline-none resize-none word-break-break-word min-h-[1.5em]'
        inputType='textarea'
      />
      <div className='flex gap-x-0.5 item-actions'>
        <button className='text-text cursor-pointer size-6' onClick={() => store.deleteItem(boardId, colId, itemIdx)} title='Delete'>
          ✕
        </button>
      </div>
    </div>
  )
}
