import React, { useRef } from 'react'
import * as store from './store'
import type { Column as ColumnType } from './types'
import { EditableText } from './EditableText'
import { Item } from './Item'
import { showConfirm } from './ConfirmModal'
import { DeleteButton } from './Button'

interface ColumnProps {
  column: ColumnType
  boardIndex: number
  colIndex: number
  dropColIndex: number | null
  dropItemIndex: number | null
  onDragOver: (index: number | null) => void
  onClearTarget: () => void
}

export function Column({ column, boardIndex, colIndex, dropColIndex, dropItemIndex, onDragOver, onClearTarget }: ColumnProps) {
  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const index = computeDropItemIndex(e)
    onDragOver(index)
  }

  function computeDropItemIndex(e: React.DragEvent<HTMLDivElement>): number | null {
    const items = [...e.currentTarget.querySelectorAll('.drop-target')] as HTMLElement[]
    let index = 0
    for (let i = 0; i < items.length; i++) {
      const rect = items[i].getBoundingClientRect()
      if (e.clientY < rect.top + rect.height / 2) {
        index = i
        break
      } else {
        index = i + 1
      }
    }
    return index
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const dragData = e.dataTransfer.getData('text/plain')
    let sourceColIndex = -1
    let sourceItemIndex = -1
    if (dragData) {
      try {
        const { colIndex, itemIndex } = JSON.parse(dragData)
        sourceColIndex = colIndex
        sourceItemIndex = itemIndex
      } catch {
        // ignore parse errors
      }
    }

    const targetIndex = dropItemIndex ?? column.items.length

    if (sourceColIndex >= 0 && sourceItemIndex >= 0) {
      store.moveItem(boardIndex, sourceColIndex, colIndex, sourceItemIndex, targetIndex)
    }
    onClearTarget()
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    const related = e.relatedTarget as HTMLElement | null
    if (related && e.currentTarget.contains(related)) return
    onClearTarget()
  }
  async function onDelete() {
    const confirmed = await showConfirm({
      title: `Delete ${column.name}`,
      message: `Are you sure you want to delete column "${column.name}" and all contained items? This action can not be undone.`,
      confirmLabel: 'Delete',
    })
    if (confirmed) store.deleteColumn(boardIndex, colIndex)
  }

  const isTarget = dropColIndex === colIndex
  const showIndicator = isTarget && dropItemIndex !== null && dropItemIndex >= column.done

  return (
    <div className='bg-card rounded-lg flex flex-col w-64 shrink-0'>
      <div className='flex p-4 pb-2 rounded-t-lg bg-card border-b-2 border-item cursor-grab'>
        <EditableText
          value={column.name}
          onSave={(name) => {
            if (name.trim()) store.renameColumn(boardIndex, colIndex, name.trim())
          }}
          className='font-semibold'
        />
        <DeleteButton onClick={onDelete} />
      </div>

      <div className='flex-1 min-h-7 overflow-y-auto p-2 flex flex-col gap-1.5' onDragOver={handleDragOver} onDrop={handleDrop} onDragLeave={handleDragLeave}>
        {showIndicator && dropItemIndex === 0 && <div className='h-1 rounded bg-accent z-20 pointer-events-none' />}

        {column.items.map((item, index) => (
          <div key={'item-' + index}>
            <Item item={item} boardIndex={boardIndex} colIndex={colIndex} itemIndex={index} done={column.done > index} />
            {showIndicator && dropItemIndex === index + 1 && <div className='mt-2 h-1 rounded bg-accent z-20 pointer-events-none' />}
          </div>
        ))}
      </div>

      <button className='px-4 py-2 rounded-b-lg bg-accent text-text cursor-pointer' onClick={() => store.addItem(boardIndex, colIndex)}>
        Add item
      </button>
    </div>
  )
}
