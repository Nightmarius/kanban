import { useState } from 'react'
import * as store from './store'
import type { Board } from './types'
import { DeleteButton } from './DeleteButton'

interface BoardPickerProps {
  boards: Board[]
  activeBoardIndex: number | null
  onActivate: (index: number) => void
  onImport?: () => void
  onCreateNew?: () => void
  onClose?: () => void
  onDelete?: (index: number, name: string) => void
}

export function BoardPicker({ boards, activeBoardIndex, onActivate, onImport, onCreateNew, onClose, onDelete }: BoardPickerProps) {
  const [open, setOpen] = useState(false)

  function handleCreateNew() {
    const boardIndex = store.addBoard()
    onActivate(boardIndex)
    onCreateNew?.()
    onClose?.()
    setOpen(false)
  }

  function handleImportAndClose() {
    onImport?.()
    onClose?.()
    setOpen(false)
  }

  return (
    <>
      <button
        className='m-2 z-50 w-9 h-9 flex items-center justify-center rounded border-none bg-accent text-white cursor-pointer hover:bg-accent-hover'
        onClick={() => setOpen((v) => !v)}
        title={open ? 'Close menu' : 'Open board menu'}
      >
        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round'>
          <line x1='3' y1='6' x2='21' y2='6' />
          <line x1='3' y1='12' x2='21' y2='12' />
          <line x1='3' y1='18' x2='21' y2='18' />
        </svg>
      </button>

      {open && (
        <div className='fixed top-12 left-2 z-100' onClick={() => setOpen(false)}>
          <nav className='w-56 bg-card text-text rounded shadow-lg p-2 flex flex-col gap-3' onClick={(e) => e.stopPropagation()}>
            {boards.map((board, index) => (
              <div
                key={index}
                data-active={index === activeBoardIndex}
                className={`flex justify-between px-2 py-2 gap-3 rounded ${index === activeBoardIndex ? 'bg-accent' : 'hover:bg-item cursor-pointer'}`}
              >
                <button
                  className={`rounded text-text text-[13px] text-left whitespace-nowrap overflow-hidden ${index === activeBoardIndex ? 'font-semibold' : 'cursor-pointer'}`}
                  onClick={() => {
                    onActivate(index)
                    setOpen(false)
                  }}
                >
                  {board.name}
                </button>
                {boards.length > 1 && (
                  <DeleteButton
                    onClick={() => {
                      onDelete?.(index, board.name)
                    }}
                  />
                )}
              </div>
            ))}
            {onImport && (
              <button className='px-2 py-2 rounded border border-accent cursor-pointer text-text text-[13px] hover:bg-accent' onClick={handleImportAndClose}>
                Import .md
              </button>
            )}
            <button className='px-2 py-2 rounded border border-accent cursor-pointer text-text text-[13px] hover:bg-accent ' onClick={handleCreateNew}>
              + New board
            </button>
          </nav>
        </div>
      )}
    </>
  )
}
