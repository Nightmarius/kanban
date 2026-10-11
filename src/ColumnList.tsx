import { useState, useRef } from 'react'
import * as store from './store'
import { Column } from './Column'

interface RenameTarget {
  colId: string
  name: string
}

export function ColumnList({ boardId }: { boardId: string }) {
  const [isDraggingCard, setIsDraggingCard] = useState(false)
  const [dragColId, setDragColId] = useState<string | null>(null)
  const dragDataRef = useRef<{ colId: string; itemIdx: number; cardId: string; text: string } | null>(null)
  const [dropAboveItemIdx, setDropAboveItemIdx] = useState<number | null>(null)
  const [dragTargetColIdx, setDragTargetColIdx] = useState<number | null>(null)
  const [isDraggingCol, setIsDraggingCol] = useState(false)
  const [renamingColumn, setRenamingColumn] = useState<RenameTarget | null>(null)

  const data = store.getState()
  const board = data.boards.find((b) => b.id === boardId) ?? null
  if (!board) return null

  function handleColReorder(fromIdx: number, toIdx: number) {
    setIsDraggingCol(false)
    setDragTargetColIdx(null)
    store.moveColumn(boardId, fromIdx, toIdx)
  }

  function onDropCard(sourceColId: string, targetColIdx: number) {
    if (!dragDataRef.current) return

    const sourceCol = board.columns.find((c) => c.id === dragDataRef.current!.colId)
    if (!sourceCol) return

    const freshState = store.getState()
    let freshBoard: typeof board | null = null
    for (const b of freshState.boards) {
      if (b.id === boardId) {
        freshBoard = b as any
        break
      }
    }
    if (!freshBoard) return

    const targetCol = freshBoard.columns[targetColIdx]
    if (!targetCol) return

    let freshSourceCol: typeof sourceCol | null = null
    for (const col of freshBoard.columns) {
      for (let i = 0; i < col.items.length; i++) {
        if (col.items[i].id === dragDataRef.current!.cardId) {
          freshSourceCol = col as any
          break
        }
      }
      if (freshSourceCol) break
    }
    if (!freshSourceCol) return

    let sourceItemIdx: number = -1
    for (let i = 0; i < freshSourceCol.items.length; i++) {
      if (freshSourceCol.items[i].id === dragDataRef.current!.cardId) {
        sourceItemIdx = i
        break
      }
    }
    if (sourceItemIdx === -1) return

    const cardText = freshSourceCol.items[sourceItemIdx].text

    store.deleteItem(boardId, freshSourceCol.id, sourceItemIdx)
    store.addItem(boardId, targetCol.id, cardText)

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
          renamingColumn={renamingColumn}
          setRenamingColumn={setRenamingColumn}
          isDraggingCard={isDraggingCard}
          dragColId={dragColId}
          dragDataRef={dragDataRef}
          dragTargetIdx={dragTargetColIdx}
          isDraggingCol={isDraggingCol}
          dropAboveItemIdx={dropAboveItemIdx}
          onDropTargetChange={(idx) => setDropAboveItemIdx(idx)}
          onStartDrag={() => {}}
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
