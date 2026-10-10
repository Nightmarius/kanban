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
  draggingCard: { boardId: string; colId: string; itemIdx: number } | null
  dragTargetIdx: number | null
  isDraggingCol: boolean
  onDragStart: () => void
  onDragOver: (targetIdx: number) => void
  onDrop: (fromIdx: number, toIdx: number) => void
  onDragEnd: () => void
  onDropCard: (targetColIdx: number, info: { colId: string; itemIdx: number }) => void
}

export function Column({ column, colIdx, boardId, totalColumns, renamingColumn, setRenamingColumn, draggingCard, dragTargetIdx, isDraggingCol, onDragStart, onDragOver, onDrop, onDragEnd, onDropCard }: ColumnProps) {
  const [hovered, setHovered] = useState(false)
  const isDragTarget = dragTargetIdx === colIdx

  function handleCardDrop(e: React.DragEvent<HTMLDivElement>) {
    e.stopPropagation()
    setHovered(false)
    onDragEnd()
    let info: { colId: string; itemIdx: number } | undefined
    try { info = JSON.parse(e.dataTransfer.getData('text/plain')) } catch { return }
    if (!info || !info.colId) return
    onDropCard(colIdx, info)
  }

  function handleColDragStart(e: React.DragEvent<HTMLDivElement>) {
    e.stopPropagation()
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(colIdx))
    onDragStart()
  }

  return (
    <div className={`column ${isDragTarget ? 'drag-over' : ''} ${isDraggingCol ? 'dragging-col' : ''}`} draggable={!!onDragStart} onDragOver={(e) => {
      if (!isDraggingCol) return
      e.preventDefault()
      e.stopPropagation()
      onDragOver(colIdx)
    }} onDrop={(e) => {
      e.stopPropagation()
      e.preventDefault()
      setHovered(false)
      const fromIdx = parseInt(e.dataTransfer.getData('text/plain'))
      onDrop(fromIdx, colIdx)
      onDragEnd()
    }}>
      <ColumnHeader column={column} boardId={boardId} totalColumns={totalColumns} renamingColumn={renamingColumn} setRenamingColumn={setRenamingColumn} onColDragStart={isDraggingCol ? undefined : handleColDragStart} />

      <div className='items' onDrop={(e) => {
        e.stopPropagation()
        let info: { colId: string; itemIdx: number } | undefined
        try { info = JSON.parse(e.dataTransfer.getData('text/plain')) } catch {}
        if (!info || !info.colId) return
        setHovered(false)
        onDropCard(colIdx, info)
      }}>
        {column.items.map((item, itemIdx) => (
          <Card
            key={item.id}
            card={item}
            itemIdx={itemIdx}
            boardId={boardId}
            colId={column.id}
            dragging={draggingCard !== null && draggingCard.colId === column.id && draggingCard.itemIdx === itemIdx}
          />
        ))}

        <NewItemForm boardId={boardId} colId={column.id} />
      </div>
    </div>
  )
}

function ColumnHeader({ column, boardId, totalColumns, renamingColumn, setRenamingColumn, onColDragStart }: {
  column: ColumnType
  boardId: string
  totalColumns: number
  renamingColumn: RenameTarget | null
  setRenamingColumn: (r: RenameTarget | null) => void
  onColDragStart?: (e: React.DragEvent<HTMLDivElement>) => void
}) {
  const [editing, setEditing] = useState(false)

  return (
    <div className='column-header' onDragStart={(e) => { if (onColDragStart) { e.stopPropagation(); onColDragStart(e) } }} style={onColDragStart ? { cursor: 'grab', userSelect: 'none' } : undefined}>
      {renamingColumn?.colId === column.id ? (
        <EditableName value={renamingColumn.name} onSave={(name) => { if (name.trim()) store.renameColumn(boardId, column.id, name.trim()); setRenamingColumn(null) }} onCancel={() => setRenamingColumn(null)} />
      ) : (
        <span className='column-name' onClick={() => setRenamingColumn({ colId: column.id, name: column.name })}>{column.name}</span>
      )}

      <DeleteColumnButton columnName={column.name} colId={column.id} boardId={boardId} totalColumns={totalColumns} itemCount={column.items.length} />
    </div>
  )
}

function EditableName({ value, onSave, onCancel }: { value: string; onSave: (name: string) => void; onCancel: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [draft, setDraft] = useState(value)

  return (
    <input ref={inputRef} className='column-name-input' defaultValue={value} autoFocus onBlur={() => onSave(draft)} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') onSave(draft); if (e.key === 'Escape') onCancel() }} />
  )
}

function DeleteColumnButton({ columnName, colId, boardId, totalColumns, itemCount }: { columnName: string; colId: string; boardId: string; totalColumns: number; itemCount: number }) {
  function handleDelete() {
    if (totalColumns > 1) {
      const shouldConfirm = itemCount > 0
      let msg = `Delete "${columnName}"?`
      if (shouldConfirm) msg = `Delete "${columnName}" (${itemCount} item${itemCount === 1 ? '' : 's'})?`
      confirm(msg) && store.deleteColumn(boardId, colId)
    } else {
      store.addColumnAfter(boardId, colId)
    }
  }
  return (
    <button className='btn-icon danger' onClick={handleDelete} title={totalColumns > 1 ? 'Delete column' : 'Insert before'}>
      {totalColumns > 1 ? '✕' : '+'}
    </button>
  )
}
