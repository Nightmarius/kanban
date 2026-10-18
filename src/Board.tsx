import { useState } from 'react'
import * as store from './store'
import type { BoardType as BoardType } from './types'
import { EditableText } from './EditableText'
import { Column } from './Column'
import { BoardPicker } from './BoardPicker'
import { Button, DeleteButton } from './Button'
import { showConfirm } from './ConfirmModal'

interface BoardProps {
  boardIndex: number
  boards: BoardType[]
  onSave: () => void
  onImport: () => void
  onActivate: (index: number) => void
  onDelete: (index: number) => void
}

export function Board({ boardIndex, boards, onDelete, onSave, onActivate, onImport }: BoardProps) {
  const [dropColIndex, setDropColIndex] = useState<number | null>(null)
  const [dropItemIndex, setDropItemIndex] = useState<number | null>(null)
  const board = boards[boardIndex]
  return (
    <div className='flex flex-col h-full'>
      <div className='flex items-center gap-2 p-3 border-b-2 border-card'>
        <BoardPicker boards={boards} activeBoardIndex={boardIndex} onActivate={onActivate} onImport={onImport} onDelete={onDelete} />
        <EditableText value={board.name} onSave={(name) => store.renameBoard(boardIndex, name)} className='text-2xl font-bold px-2 max-h-16' />
        {!board.savedPath && <Button text='Save' type='Outline' onClick={onSave} />}
        <DeleteButton onClick={() => onDelete(boardIndex)} />
      </div>

      <div className='flex flex-wrap gap-3 p-3 items-start'>
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
        <Button text='Add Column' type='Outline' onClick={() => store.addColumn(boardIndex)} />
      </div>
    </div>
  )
}
