import React, { useRef } from 'react'
import * as store from './store'
import type { Column as ColumnType } from './types'
import { EditableText } from './EditableText'
import { Item } from './Item'

interface ColumnProps {
  column: ColumnType
  boardId: string
  targetColId: string | null
  dropAboveIdx: number | null
  onDragOver: (idx: number | null) => void
  onSetTarget: () => void
  onClearTarget: () => void
}

export function Column({ column, boardId, targetColId, dropAboveIdx, onDragOver, onSetTarget, onClearTarget }: ColumnProps) {
  const dropIdxRef = useRef<number | null>(null)

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    if (!colIsTarget) onSetTarget()

    const idx = computeDropIndex(e)
    dropIdxRef.current = idx
    onDragOver(idx)
  }

  function computeDropIndex(e: React.DragEvent<HTMLDivElement>): number | null {
    const items = [...e.currentTarget.querySelectorAll('.drop-target')] as HTMLElement[]
    let idx: number | null = null
    for (let i = 0; i < items.length; i++) {
      const rect = items[i].getBoundingClientRect()
      if (e.clientY < rect.top + rect.height / 2) {
        idx = i
        break
      } else {
        idx = i + 1
      }
    }
    return column.items.length > 0 ? idx : null
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const dragData = e.dataTransfer.getData('text/plain')
    let sourceItemIdx = -1
    let sourceColId: string | null = null
    if (dragData) {
      try {
        const { colId, index } = JSON.parse(dragData)
        sourceColId = colId
        sourceItemIdx = index
      } catch {
        // ignore parse errors
      }
    }

    const dropIdx = dropIdxRef.current ?? column.items.length

    if (sourceColId && sourceItemIdx >= 0) {
      store.moveItem(boardId, sourceColId, column.id, sourceItemIdx, dropIdx)
    }
    onClearTarget()
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    const related = e.relatedTarget as HTMLElement | null
    if (related && e.currentTarget.contains(related)) return
    onClearTarget()
  }

  const colIsTarget = targetColId === column.id
  const showIndicator = colIsTarget && dropAboveIdx !== null

  return (
    <div className='bg-card rounded-lg flex flex-1 flex-col'>
      <div className='flex p-4 pb-2 rounded-t-lg bg-card border-b-2 border-item cursor-grab'>
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

      <div className='flex-1 overflow-y-auto p-2 flex flex-col gap-1.5' onDragOver={handleDragOver} onDrop={handleDrop} onDragLeave={handleDragLeave}>
        {showIndicator && dropAboveIdx === 0 && <div className='h-0.75 rounded bg-accent shadow-lg z-20 pointer-events-none' />}

        {column.items.map((item, idx) => (
          <>
            <Item key={'item-' + idx} item={item} index={idx} colId={column.id} boardId={boardId} done={column.done > idx} />
            {showIndicator && dropAboveIdx === idx + 1 && <div className='h-0.75 rounded bg-accent shadow-lg z-20 pointer-events-none' />}
          </>
        ))}
      </div>

      <button className='px-4 py-2 rounded-b-lg bg-accent text-text cursor-pointer' onClick={() => store.addItem(boardId, column.id)}>
        + Add item
      </button>
    </div>
  )
}
