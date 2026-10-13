import { useState } from 'react'
import * as store from './store'
import type { Board } from './types'
import { DeleteButton } from './DeleteButton'

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
      <button
        className='w-9 h-9 flex items-center justify-center rounded bg-accent text-text cursor-pointer hover:bg-card'
        onClick={() => setOpen((v) => !v)}
        title={open ? 'Close menu' : 'Open board menu'}
      >
        <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round'>
          <line x1='3' y1='6' x2='21' y2='6' />
          <line x1='3' y1='12' x2='21' y2='12' />
          <line x1='3' y1='18' x2='21' y2='18' />
        </svg>
      </button>

      {open && (
        <>
          <div className='fixed inset-0 z-99' onClick={() => setOpen(false)} />
          <nav className='fixed top-20 left-3 z-100 bg-card text-text rounded shadow-lg p-2 flex flex-col gap-3 w-56' onClick={(e) => e.stopPropagation()}>
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
                {boards.length > 1 && (
                  <DeleteButton
                    onClick={() => {
                      onDelete(index)
                    }}
                  />
                )}
              </div>
            ))}
            <button
              className='p-2 rounded border-2 border-accent cursor-pointer text-text hover:bg-accent'
              onClick={() => {
                onImport()
                setOpen(false)
              }}
            >
              Import .md
            </button>
            <button className='p-2 rounded border-2 border-accent cursor-pointer text-text hover:bg-accent' onClick={onNewBoard}>
              + New board
            </button>
          </nav>
        </>
      )}
    </>
  )
}
