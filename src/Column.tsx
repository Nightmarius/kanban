import { useRef, useState } from 'react'
import * as store from './store'
import type { Column as ColumnType } from './types'
import { Item } from './Item'
import { NewItemForm } from './NewItemForm'
import { EditableText } from './EditableText'

interface ColumnProps {
  column: ColumnType
  colIdx: number
  boardId: string
  totalColumns: number
  isDraggingCard: boolean
  dragColId: string | null
  dragDataRef: React.MutableRefObject<{ colId: string; itemIdx: number; cardId: string; text: string } | null>
  dragTargetIdx: number | null
  isDraggingCol: boolean
  dropAboveItemIdx: number | null
  onDropTargetChange: (idx: number | null) => void
  onStartDrag: () => void
  onColumnDragStart: () => void
  onDragOver: (targetIdx: number) => void
  onDropColumn: (fromIdx: number, toIdx: number) => void
  onDragEnd: () => void
  onDropCard: (sourceColId: string, targetColIdx: number) => void
}

export function Column({
  column,
  colIdx,
  boardId,
  totalColumns,
  isDraggingCard,
  dragColId,
  dragDataRef,
  dragTargetIdx,
  isDraggingCol,
  dropAboveItemIdx,
  onDropTargetChange,
  onStartDrag,
  onColumnDragStart,
  onDragOver,
  onDropColumn,
  onDragEnd,
  onDropCard,
}: ColumnProps) {
  const [hovered, setHovered] = useState(false)
  const isDragTarget = dragTargetIdx === colIdx

  function handleCardDragOver(e: React.DragEvent<HTMLDivElement>) {
    if (!isDraggingCard) return
    e.preventDefault()

    const targetEl = e.currentTarget as HTMLElement
    const cards = [...targetEl.querySelectorAll('.card:not(.dragging)')] as HTMLElement[]
    let foundIndex: number | null = null

    for (let i = 0; i < cards.length; i++) {
      const rect = cards[i].getBoundingClientRect()
      const midY = rect.top + rect.height / 2
      if (e.clientY < midY) {
        foundIndex = i
        break
      }
    }

    onDropTargetChange(foundIndex)
  }

  function handleCardDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setHovered(false)
    onDragEnd()
    onDropTargetChange(null)

    const sourceColId = dragDataRef.current?.colId
    if (!sourceColId) return
    onDropCard(sourceColId, colIdx)
  }

  function handleColDragOver(e: React.DragEvent<HTMLDivElement>) {
    if (!isDraggingCol) return
    e.preventDefault()
    e.stopPropagation()
    onDragOver(colIdx)
  }

  function handleColDragStart(e: React.DragEvent<HTMLDivElement>) {
    e.stopPropagation()
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(colIdx))
    onColumnDragStart()
  }

  return (
    <div
      className={`bg-card rounded-lg flex-1 flex flex-col min-w-70 max-w-85  ${isDragTarget ? 'border border-accent' : ''} ${isDraggingCol || isDraggingCard ? 'scale-95' : ''}`}
      onDragOver={handleColDragOver}
    >
      <div
        className='flex items-center justify-between p-4 pb-2 rounded-t-lg bg-card border-b-2 border-item cursor-grab select-none'
        onDragStart={(e) => {
          e.stopPropagation()
          handleColDragStart(e as any)
        }}
      >
        <EditableText
          value={column.name}
          onSave={(name) => {
            if (name.trim()) store.renameColumn(boardId, column.id, name.trim())
          }}
          className="text-text font-semibold text-base w-full"
        />

        <button
          className='text-text cursor-pointer ml-2'
          onClick={() => {
            const shouldConfirm = column.items.length > 0
            if (shouldConfirm) {
              const msg = `Delete "${column.name}" and all items inside (This can not be undone)?`
              confirm(msg) && store.deleteColumn(boardId, column.id)
            } else {
              store.deleteColumn(boardId, column.id)
            }
          }}
          title='Delete column'
        >
          ✕
        </button>
      </div>

      <div className='flex-1 overflow-y-auto p-2 min-h-10 flex flex-col gap-1.5' onDrop={handleCardDrop as any} onDragOver={handleCardDragOver}>
        {column.items.map((item, itemIdx) => (
          <Item
            key={item.id}
            card={item}
            itemIdx={itemIdx}
            boardId={boardId}
            colId={column.id}
            isDragging={isDraggingCard && dragColId === column.id}
            dropAbove={dropAboveItemIdx === itemIdx}
            onStartDrag={onStartDrag}
          />
        ))}

        <NewItemForm boardId={boardId} colId={column.id} />
      </div>
    </div>
  )
}
