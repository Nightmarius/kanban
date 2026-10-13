import { useState } from 'react'
import * as store from './store'
import type { Board as BoardType } from './types'
import { EditableText } from './EditableText'
import { Column } from './Column'
import { DeleteButton } from './DeleteButton'

interface BoardProps {
  board: BoardType
  boardIndex: number
  onRename: (name: string) => void
  onDelete: () => void
  onSave: () => void
}

export function Board({ board, boardIndex, onRename, onDelete, onSave }: BoardProps) {
  const [dropColIndex, setDropColIndex] = useState<number | null>(null)
  const [dropItemIndex, setDropItemIndex] = useState<number | null>(null)

  return (
    <div className='flex flex-col h-full'>
      <div className='flex items-center gap-2 p-3 mb-4 border-b-2 border-card'>
        <EditableText value={board.name} onSave={(name) => onRename(name)} className='text-2xl font-bold px-2 py-1 focus:bg-card' />
        <button
          className='px-6 py-1.5 rounded-lg border-2 border-dashed border-card text-text bg-transparent cursor-pointer text-sm hover:border-accent hover:text-accent transition-colors'
          onClick={() => store.addColumn(-1)}
        >
          + Column
        </button>
        <button className='px-3.5 py-1.5 rounded-md border border-white/20 bg-card text-text cursor-pointer text-sm hover:border-accent hover:text-accent' onClick={onSave}>
          Save
        </button>
        <DeleteButton onClick={onDelete} />
      </div>

      <div className='flex-1 flex gap-3 overflow-x-auto px-2 pb-4 items-start'>
        {board.columns.map((col, index) => (
          <Column
            key={index}
            column={col}
            boardIndex={boardIndex}
            colIndex={index}
            dropColIndex={dropColIndex}
            dropItemIndex={dropItemIndex}
            onDragOver={(itemIndex) => {
              setDropColIndex(index)
              setDropItemIndex(itemIndex)
            }}
            onClearTarget={() => {
              setDropColIndex(null)
              setDropItemIndex(null)
            }}
          />
        ))}
      </div>
    </div>
  )
}
