import { useState } from 'react'
import * as store from './store'
import type { Column as ColumnType } from './types'
import { Column } from './Column'

interface ColumnListProps {
  boardId: string
  totalColumns: number
}

export function ColumnList({ boardId, totalColumns }: ColumnListProps) {
  const [draggingCard, setDraggingCard] = useState<{ boardId: string; colId: string; itemIdx: number } | null>(null)
  const [dragTargetIdx, setDragTargetIdx] = useState<number | null>(null)
  const [addingColumn, setAddingColumn] = useState<{ afterColId: string | null } | null>(null)
  const [renamingColumn, setRenamingColumn] = useState<{ colId: string; name: string } | null>(null)

  const data = store.getState()
  const board = data.boards.find((b) => b.id === boardId) ?? null
  if (!board) return null

  return (
    <div className="track">
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
          dragTargetIdx={dragTargetIdx}
          onDrop={(targetColIdx, info) => {
            const sourceCol = board.columns.find((c) => c.id === info.colId)
            if (!sourceCol || !sourceCol.items[info.itemIdx]) return
            setDraggingCard(null)
            setDragTargetIdx(null)
            if (info.colId !== col.id) store.moveItem(boardId, info.colId, col.id, info.itemIdx)
          }}
          onDragOver={(idx) => setDragTargetIdx(idx)}
        />
      ))}

      {addingColumn ? (
        <div className="add-col-form">
          <button className="btn-primary" onClick={() => handleAdd(addingColumn.afterColId)}>+</button>
          <button className="btn-cancel" onClick={() => setAddingColumn(null)}>Cancel</button>
        </div>
      ) : (
        <button className="btn-add-col" onClick={() => setAddingColumn({ afterColId: null })}>+ Column</button>
      )}
    </div>
  )

  function handleAdd(afterColId: string | null) {
    setAddingColumn(null)
    if (afterColId) store.addColumnAfter(boardId, afterColId)
    else store.addColumn(boardId, 'New Column')
  }
}
