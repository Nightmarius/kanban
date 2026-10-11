import { useState, useRef } from 'react'
import * as store from './store'
import { Column } from './Column'

export function ColumnList({ boardId }: { boardId: string }) {
  const [isDraggingCard, setIsDraggingCard] = useState(false)
  const [dragColId, setDragColId] = useState<string | null>(null)
  const dragDataRef = useRef<{ colId: string; itemIdx: number; cardId: string; text: string } | null>(null)
  const [dropAboveItemIdx, setDropAboveItemIdx] = useState<number | null>(null)
  const [dragTargetColIdx, setDragTargetColIdx] = useState<number | null>(null)
  const [isDraggingCol, setIsDraggingCol] = useState(false)

  const board = store.getState().boards.find((b) => b.id === boardId)!

  function handleColReorder(fromIdx: number, toIdx: number) {
    setIsDraggingCol(false)
    setDragTargetColIdx(null)
    store.moveColumn(boardId, fromIdx, toIdx)
  }

  function onDropCard(sourceColId: string, targetColIdx: number, dropAboveItemIdx: number | null) {
    if (!dragDataRef.current) return

    const dragData = dragDataRef.current
    const sourceColIdActual = dragData.colId
    const itemIdx = dragData.itemIdx

    store.moveItem(boardId, sourceColIdActual, board.columns[targetColIdx].id, itemIdx, dropAboveItemIdx ?? undefined)

    setIsDraggingCard(false)
    setDropAboveItemIdx(null)
    setDragTargetColIdx(null)
  }

  return (
    <div className='flex-1 flex gap-3 overflow-x-auto px-2 pb-4 items-start'>
      {board.columns.map((col, colIdx) => (
        <Column
          key={col.id}
          column={col}
          colIdx={colIdx}
          boardId={boardId}
          totalColumns={board.columns.length}
          isDraggingCard={isDraggingCard}
          dragColId={dragColId}
          dragDataRef={dragDataRef}
          dragTargetColIdx={dragTargetColIdx}
          isDraggingCol={isDraggingCol}
          dropAboveItemIdx={dropAboveItemIdx}
          onDropTargetChange={(idx) => setDropAboveItemIdx(idx)}
          onStartDrag={() => setIsDraggingCard(true)}
          onColumnDragStart={() => setIsDraggingCol(true)}
          onDragOver={(targetIdx) => {
            if (dragTargetColIdx !== null && targetIdx !== dragTargetColIdx) setDragTargetColIdx(targetIdx)
          }}
          onDropColumn={handleColReorder}
          onDragEnd={() => {
            setIsDraggingCol(false)
            setIsDraggingCard(false)
            setDropAboveItemIdx(null)
            setDragTargetColIdx(null)
            dragDataRef.current = null
          }}
          onDropCard={onDropCard}
        />
      ))}

      <button
        className='px-6 py-2 rounded-lg border-2 border-dashed border-card text-text bg-transparent cursor-pointer text-sm shrink-0 hover:border-accent hover:text-accent transition-colors'
        onClick={() => store.addColumn(boardId)}
      >
        + Column
      </button>
    </div>
  )
}
