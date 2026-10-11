import { useRef, useState } from 'react'
import * as store from './store'
import type { Column as ColumnType } from './types'
import { Card } from './Card'
import { NewItemForm } from './NewItemForm'

interface RenameTarget {
  colId: string
  name: string
}

interface ColumnProps {
  column: ColumnType
  colIdx: number
  boardId: string
  totalColumns: number
  renamingColumn: RenameTarget | null
  setRenamingColumn: (r: RenameTarget | null) => void
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
  renamingColumn,
  setRenamingColumn,
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
      <ColumnHeader
        column={column}
        boardId={boardId}
        totalColumns={totalColumns}
        renamingColumn={renamingColumn}
        setRenamingColumn={setRenamingColumn}
        onColDragStart={isDraggingCol ? undefined : handleColDragStart}
      />

      <div className='flex-1 overflow-y-auto p-2 min-h-10 flex flex-col gap-1.5' onDrop={handleCardDrop as any} onDragOver={handleCardDragOver}>
        {column.items.map((item, itemIdx) => (
          <Card
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

function ColumnHeader({
  column,
  boardId,
  totalColumns,
  renamingColumn,
  setRenamingColumn,
  onColDragStart,
}: {
  column: ColumnType
  boardId: string
  totalColumns: number
  renamingColumn: RenameTarget | null
  setRenamingColumn: (r: RenameTarget | null) => void
  onColDragStart?: (e: React.DragEvent<HTMLDivElement>) => void
}) {
  const [editing, setEditing] = useState(false)

  return (
    <div
      className={`flex items-center justify-between p-4 pb-2 rounded-t-lg bg-card border-b-2 border-item ${onColDragStart ? 'cursor-grab select-none' : ''}`}
      onDragStart={(e) => {
        if (onColDragStart) {
          e.stopPropagation()
          onColDragStart(e)
        }
      }}
    >
      {renamingColumn?.colId === column.id ? (
        <EditableName
          value={renamingColumn.name}
          onSave={(name) => {
            if (name.trim()) store.renameColumn(boardId, column.id, name.trim())
            setRenamingColumn(null)
          }}
          onCancel={() => setRenamingColumn(null)}
        />
      ) : (
        <span className='text-text font-semibold text-base' onClick={() => setRenamingColumn({ colId: column.id, name: column.name })}>
          {column.name}
        </span>
      )}

      <DeleteColumnButton columnName={column.name} colId={column.id} boardId={boardId} itemCount={column.items.length} />
    </div>
  )
}

function EditableName({ value, onSave, onCancel }: { value: string; onSave: (name: string) => void; onCancel: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState(value)

  return (
    <input
      ref={inputRef}
      className='column-name-input'
      defaultValue={value}
      autoFocus
      onBlur={() => onSave(draft)}
      onChange={(e) => setDraft(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onSave(draft)
        if (e.key === 'Escape') onCancel()
      }}
    />
  )
}

function DeleteColumnButton({ columnName, colId, boardId, itemCount }: { columnName: string; colId: string; boardId: string; itemCount: number }) {
  function handleDelete() {
    const shouldConfirm = itemCount > 0
    if (shouldConfirm) {
      const msg = `Delete "${columnName}" and all items inside (This can not be undone)?`
      confirm(msg) && store.deleteColumn(boardId, colId)
    } else {
      store.deleteColumn(boardId, colId)
    }
  }
  return (
    <button className='text-text cursor-pointer' onClick={handleDelete} title='Delete column'>
      ✕
    </button>
  )
}
