import { useRef, useState } from 'react'
import * as store from './store'
import type { Column as ColumnType } from './types'
import { Item } from './Item'
import { EditableText } from './EditableText'

interface ColumnProps {
  column: ColumnType
  colIdx: number
  boardId: string
  totalColumns: number
  isDraggingItem: boolean
  dragColId: string | null
  dragDataRef: React.MutableRefObject<{ colId: string; itemIdx: number; itemId: string; text: string } | null>
  isDraggingCol: boolean
  dropAboveItemIdx: number | null
  dragTargetColIdx: number | null
  onDropTargetChange: (idx: number | null) => void
  onStartDrag: () => void
  onColumnDragStart: () => void
  onDragOver: (targetIdx: number) => void
  onDropColumn: (fromIdx: number, toIdx: number) => void
  onDragEnd: () => void
  onDropItem: (sourceColId: string, targetColIdx: number, dropAboveItemIdx: number | null) => void
  onDeleteColumn: (boardId: string, colId: string) => void
}

export function Column({
  column,
  colIdx,
  boardId,
  totalColumns,
  isDraggingItem,
  dragColId,
  dragDataRef,
  isDraggingCol,
  dropAboveItemIdx,
  dragTargetColIdx,
  onDropTargetChange,
  onStartDrag,
  onColumnDragStart,
  onDragOver,
  onDropColumn,
  onDragEnd,
  onDropItem,
  onDeleteColumn,
}: ColumnProps) {
  const isDragTarget = dragTargetColIdx === colIdx
  const [isAddMode, setIsAddMode] = useState(false)

  function handleItemDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()

    const targetEl = e.currentTarget as HTMLElement
    const items = [...targetEl.querySelectorAll('.drop-target')].filter((el) => !el.classList.contains('dragging')) as HTMLElement[]
    let foundIndex: number | null = null

    for (let i = 0; i < items.length; i++) {
      const rect = items[i].getBoundingClientRect()
      const midY = rect.top + rect.height / 2
      if (e.clientY < midY) {
        foundIndex = i
        break
      }
    }

    onDropTargetChange(foundIndex)
    console.log('' + dragColId + ' col' + colIdx)
  }

  function handleItemDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()

    const dragData = JSON.parse(e.dataTransfer.getData('text/plain'))
    if (dragData.itemId) {
      dragDataRef.current = { itemId: dragData.itemId, colId: dragData.colId, itemIdx: dragData.itemIdx, text: dragData.text }
      onDropItem(dragData.colId, colIdx, dropAboveItemIdx)
    }

    onDragEnd()
    onDropTargetChange(null)
    console.log('' + dragColId + ' col' + colIdx)
  }

  function handleColDragOver(e: React.DragEvent<HTMLDivElement>) {
    if (!isDraggingCol) return
    e.preventDefault()
    e.stopPropagation()
    onDragOver(colIdx)
  }

  function addItem() {
    store.addItem(boardId, column.id)
    //TODO column.items[column.items.length - 1].edit()
  }

  return (
    <div className={`bg-card rounded-lg flex flex-1 flex-col ${isDraggingCol ? 'cursor-grabbing' : ''}`} onDragOver={handleColDragOver}>
      <div
        className='flex p-4 pb-2 rounded-t-lg bg-card border-b-2 border-item cursor-grab'
        onDragStart={(e) => {
          e.stopPropagation()
          e.dataTransfer.effectAllowed = 'move'
          e.dataTransfer.setData('text/plain', String(colIdx))
          isDraggingCol || onColumnDragStart()
        }}
      >
        <EditableText
          value={column.name}
          onSave={(name) => {
            if (name.trim()) store.renameColumn(boardId, column.id, name.trim())
          }}
          className='font-semibold'
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

      <div className='flex-1 overflow-y-auto p-2 min-h-10 flex flex-col gap-1.5' onDrop={handleItemDrop} onDragOver={handleItemDragOver}>
        {column.items.map((item, itemIdx) => (
          <Item
            key={item.id}
            item={item}
            itemIdx={itemIdx}
            boardId={boardId}
            colId={column.id}
            isDragging={isDraggingItem && dragColId === column.id}
            dropAbove={dropAboveItemIdx === itemIdx && colIdx === itemIdx}
            onStartDrag={onStartDrag}
          />
        ))}
      </div>
      <button className='px-4 py-2 rounded-b-lg bg-accent text-text cursor-pointer' onClick={() => addItem()}>
        + Add item
      </button>
    </div>
  )
}
