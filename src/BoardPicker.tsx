import { useState } from 'react'
import * as store from './store'
import type { Board } from './types'
import { DeleteButton } from './Button'
import { Button } from './Button'

interface BoardPickerProps {
  boards: Board[]
  activeBoardIndex: number | null
  onActivate: (index: number) => void
  onImport: () => void
  onDelete: (index: number) => void
}

export function BoardPicker({ boards, activeBoardIndex, onActivate, onImport, onDelete }: BoardPickerProps) {
  const [open, setOpen] = useState(false)
  function onNewBoard() {
    const boardIndex = store.addBoard()
    onActivate(boardIndex)
    setOpen(false)
  }

  return (
    <>
      <Button text='☰' onClick={() => setOpen((v) => !v)} />
      {open && (
        <>
          <div className='fixed inset-0 z-99' onClick={() => setOpen(false)} />
          <nav className='fixed top-18 left-3 z-100 bg-card text-text rounded shadow-lg p-2 flex flex-col gap-3 w-56' onClick={(e) => e.stopPropagation()}>
            {boards.map((board, index) => (
              <div
                key={index}
                data-active={index === activeBoardIndex}
                className={`flex justify-between px-2 py-2 gap-3 rounded ${index === activeBoardIndex ? 'bg-accent' : 'hover:bg-item cursor-pointer'}`}
                onClick={() => {
                  onActivate(index)
                  setOpen(false)
                }}
              >
                <button className={`rounded text-text text-left whitespace-nowrap overflow-hidden ${index === activeBoardIndex ? 'font-semibold' : 'cursor-pointer'}`}>{board.name}</button>
                {boards.length > 1 && <DeleteButton onClick={() => onDelete(index)} />}
              </div>
            ))}
            <Button
              text='Import .md'
              type='Outline'
              onClick={() => {
                onImport()
                setOpen(false)
              }}
            />
            <Button text='Add New Board' type='Outline' onClick={onNewBoard} />
          </nav>
        </>
      )}
    </>
  )
}
