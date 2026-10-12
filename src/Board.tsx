import { useState } from 'react'
import * as store from './store'
import type { Board as BoardType } from './types'
import { EditableText } from './EditableText'
import { Column } from './Column'
import { showConfirm } from './ConfirmModal'

interface BoardProps {
  board: BoardType
  onRename: (name: string) => void
  onDelete: () => void
  onSave: () => void
}

export function Board({ board, onRename, onDelete, onSave }: BoardProps) {
  const [targetColId, setTargetColId] = useState<string | null>(null)
  const [dropAboveIdx, setDropAboveIdx] = useState<number | null>(null)

  async function handleDelete() {
    const confirmed = await showConfirm({
      title: 'Delete Board',
      message: `Are you sure you want to delete "${board.name}" with all contained columns and items? This action can not be undone.`,
      confirmLabel: 'Delete',
    })
    if (confirmed) onDelete()
  }

  return (
    <div className='flex flex-col h-full'>
      <div className='flex items-center gap-2 p-3 mb-4 border-b-2 border-card'>
        <EditableText value={board.name} onSave={(name) => onRename(name)} className='text-2xl font-bold px-2 py-1 focus:bg-card' />
        <button
          className='px-6 py-1.5 rounded-lg border-2 border-dashed border-card text-text bg-transparent cursor-pointer text-sm hover:border-accent hover:text-accent transition-colors'
          onClick={() => store.addColumn(board.id)}
        >
          + Column
        </button>
        <button className='px-3.5 py-1.5 rounded-md border border-white/20 bg-card text-text cursor-pointer text-sm hover:border-accent hover:text-accent' onClick={onSave}>
          Save
        </button>
        <button
          className='w-7 h-7 flex items-center justify-center border-none bg-transparent text-text cursor-pointer rounded text-base hover:bg-card hover:text-accent'
          onClick={handleDelete}
          title='Delete board'
        >
          ✕
        </button>
      </div>

      <div className='flex-1 flex gap-3 overflow-x-auto px-2 pb-4 items-start'>
        {board.columns.map((col) => (
          <Column
            key={col.id}
            column={col}
            boardId={board.id}
            targetColId={targetColId}
            dropAboveIdx={dropAboveIdx}
            onDragOver={(idx) => setDropAboveIdx(idx)}
            onSetTarget={() => setTargetColId(col.id)}
            onClearTarget={() => {
              setTargetColId(null)
              setDropAboveIdx(null)
            }}
          />
        ))}
      </div>
    </div>
  )
}
