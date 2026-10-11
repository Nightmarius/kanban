import { useState, useRef } from 'react'
import type { Board as BoardType } from './types'
import * as store from './store'
import { EditableText } from './EditableText'
import { Column } from './Column'

interface BoardProps {
  board: BoardType
  onRename: (name: string) => void
  onDelete: () => void
  onSaveLocation?: () => Promise<void>
  autoSaveEnabled: boolean
}

export function Board({ board, onRename, onDelete, onSaveLocation, autoSaveEnabled }: BoardProps) {
  const [isDraggingItem, setIsDraggingItem] = useState(false)
  const [dragColId, setDragColId] = useState<string | null>(null)
  const dragDataRef = useRef<{ colId: string; itemIdx: number; cardId: string; text: string } | null>(null)
  const [dropAboveItemIdx, setDropAboveItemIdx] = useState<number | null>(null)
  const [dragTargetColIdx, setDragTargetColIdx] = useState<number | null>(null)
  const [isDraggingCol, setIsDraggingCol] = useState(false)

  const handleColReorder = (fromIdx: number, toIdx: number) => {
    setIsDraggingCol(false)
    setDragTargetColIdx(null)
    store.moveColumn(board.id, fromIdx, toIdx)
  }

  const onDropItem = (sourceColId: string, targetColIdx: number, dropAboveItemIdx: number | null) => {
    if (!dragDataRef.current) return
    const dragData = dragDataRef.current
    const sourceColIdActual = dragData.colId
    const itemIdx = dragData.itemIdx

    store.moveItem(board.id, sourceColIdActual, board.columns[targetColIdx].id, itemIdx, dropAboveItemIdx ?? undefined)

    setIsDraggingItem(false)
    setDropAboveItemIdx(null)
    setDragTargetColIdx(null)
  }

  const onDragEnd = () => {
    setIsDraggingCol(false)
    setIsDraggingItem(false)
    setDropAboveItemIdx(null)
    setDragTargetColIdx(null)
    dragDataRef.current = null
  }

  return (
    <div className='flex flex-col h-full'>
      <div className='flex items-center gap-2 p-3 mb-4 border-b-2 border-card'>
        <EditableText value={board.name} onSave={(name) => onRename(name)} className='text-2xl font-bold px-2 py-1 focus:bg-card' />

        <AutoSaveIndicator autoSaveEnabled={autoSaveEnabled} />
        {onSaveLocation && (
          <button className='px-3.5 py-1.5 rounded-md border border-white/20 bg-card text-text cursor-pointer text-sm hover:border-accent hover:text-accent' onClick={() => onSaveLocation()}>
            Save File Location
          </button>
        )}

        <button
          className='px-6 py-1.5 rounded-lg border-2 border-dashed border-card text-text bg-transparent cursor-pointer text-sm hover:border-accent hover:text-accent transition-colors'
          onClick={() => store.addColumn(board.id)}
        >
          + Column
        </button>

        <DeleteButton board={board} onDelete={onDelete} />
      </div>

      <div className='flex-1 flex gap-3 overflow-x-auto px-2 pb-4 items-start'>
        {board.columns.map((col, colIdx) => (
          <Column
            key={col.id}
            column={col}
            colIdx={colIdx}
            boardId={board.id}
            totalColumns={board.columns.length}
            isDraggingItem={isDraggingItem}
            dragColId={dragColId}
            dragDataRef={dragDataRef}
            dragTargetColIdx={dragTargetColIdx}
            isDraggingCol={isDraggingCol}
            dropAboveItemIdx={dropAboveItemIdx}
            onDropTargetChange={(idx) => setDropAboveItemIdx(idx)}
            onStartDrag={() => setIsDraggingItem(true)}
            onColumnDragStart={() => setIsDraggingCol(true)}
            onDragOver={(targetIdx) => {
              if (dragTargetColIdx !== null && targetIdx !== dragTargetColIdx) setDragTargetColIdx(targetIdx)
            }}
            onDropColumn={handleColReorder}
            onDragEnd={onDragEnd}
            onDropItem={onDropItem}
          />
        ))}
      </div>
    </div>
  )
}

function DeleteButton({ board, onDelete }: { board: BoardType; onDelete: () => void }) {
  const itemTotal = board.columns.reduce((s, c) => s + c.items.length, 0)

  function handleDelete() {
    if (itemTotal > 0) {
      confirm(`Delete "${board.name}" (${board.columns.length} columns, ${itemTotal} items)?`) && onDelete()
    } else {
      onDelete()
    }
  }

  return (
    <button
      className='w-7 h-7 flex items-center justify-center border-none bg-transparent text-text cursor-pointer rounded text-base hover:bg-card hover:text-accent'
      onClick={handleDelete}
      title='Delete board'
    >
      ✕
    </button>
  )
}

function AutoSaveIndicator({ autoSaveEnabled }: { autoSaveEnabled: boolean }) {
  return <span className='text-sm px-2 text-accent'>{autoSaveEnabled ? 'Auto On' : null}</span>
}
