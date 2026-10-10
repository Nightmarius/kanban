import { useState } from 'react'
import * as store from './store'
import type { Column as ColumnType } from './types'
import { Column } from './Column'

interface ColumnListProps {
  boardId: string
}

interface RenameTarget {
  colId: string
  name: string
}

export function ColumnList({ boardId }: ColumnListProps) {
  const [draggingCard, setDraggingCard] = useState<{ boardId: string; colId: string; itemIdx: number } | null>(null)
  const [dragTargetColIdx, setDragTargetColIdx] = useState<number | null>(null)
  const [isDraggingCol, setIsDraggingCol] = useState(false)
  const [renamingColumn, setRenamingColumn] = useState<RenameTarget | null>(null)

  const data = store.getState()
  const board = data.boards.find((b) => b.id === boardId) ?? null
  if (!board) return null

  function handleColReorder(fromIdx: number, toIdx: number) {
    setIsDraggingCol(false)
    setDragTargetColIdx(null)
    if (toIdx > fromIdx && board) store.addColumnAfter(boardId, board.columns[fromIdx].id)
    else if (board && toIdx >= 0 && toIdx < board.columns.length) store.addColumnAfter(boardId, board.columns[toIdx]?.id ?? board.columns[fromIdx].id)
  }

  return (
    <div className='track'>
      {board.columns.map((col, colIdx) => (
        <Column
          key={col.id}
          column={col}
          colIdx={colIdx}
          boardId={boardId}
          totalColumns={board.columns.length}
          renamingColumn={renamingColumn}
          setRenamingColumn={setRenamingColumn}
          draggingCard={draggingCard}
          dragTargetIdx={dragTargetColIdx}
          isDraggingCol={isDraggingCol}
          onDragStart={() => setIsDraggingCol(true)}
          onDragOver={(targetIdx) => {
            if (dragTargetColIdx !== null && targetIdx !== dragTargetColIdx) setDragTargetColIdx(targetIdx)
          }}
          onDrop={(fromIdx, toIdx) => handleColReorder(fromIdx, toIdx)}
          onDragEnd={() => setIsDraggingCol(false)}
          onDropCard={(targetColIdx, info) => {
            const sourceCol = board.columns.find((c) => c.id === info.colId)
            if (!sourceCol || !sourceCol.items[info.itemIdx]) return
            setDraggingCard(null)
            setDragTargetColIdx(null)
            if (info.colId !== col.id) store.moveItem(boardId, info.colId, col.id, info.itemIdx)
          }}
        />
      ))}

      <button className='btn-add-col' onClick={() => store.addColumn(boardId)}>
        + Column
      </button>
    </div>
  )
}
