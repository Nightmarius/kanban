import { useState } from 'react'
import * as store from './store'
import type { Board } from './types'

interface BoardPickerProps {
  boards: Board[]
  activeBoardId: string | null
  onActivate: (id: string) => void
}

export function BoardPicker({ boards, activeBoardId, onActivate }: BoardPickerProps) {
  const [open, setOpen] = useState(false)
  const [renamingBoard, setRenamingBoard] = useState<{ id: string; name: string } | null>(null)

  return (
    <>
      <button className='m-2 z-50 w-9 h-9 flex items-center justify-center rounded border-none bg-accent text-white cursor-pointer hover:bg-accent-hover' onClick={() => setOpen((v) => !v)} title={open ? 'Close menu' : 'Open board menu'}>
        <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round'>
          <line x1='3' y1='6' x2='21' y2='6' />
          <line x1='3' y1='12' x2='21' y2='12' />
          <line x1='3' y1='18' x2='21' y2='18' />
        </svg>
      </button>

      {open && (
        <div className='fixed top-12 left-2 z-100' onClick={() => setOpen(false)}>
          <nav className='w-56 bg-card text-text rounded shadow-lg p-2 flex flex-col gap-1' onClick={(e) => e.stopPropagation()}>
            <ul>
              {boards.map((board) => (
                <li key={board.id} data-active={board.id === activeBoardId}>
                  <BoardTab
                    board={board}
                    active={board.id === activeBoardId}
                    renaming={renamingBoard?.id === board.id ? renamingBoard : null}
                    onActivate={() => {
                      onActivate(board.id)
                      setOpen(false)
                    }}
                    onRename={(id, name) => {
                      store.renameBoard(id, name)
                      setRenamingBoard(null)
                    }}
                    onCancelRename={() => setRenamingBoard(null)}
                  />
                </li>
              ))}
            </ul>
            <button
              className='w-full px-2 py-2 rounded border border-dashed border-white/30 bg-transparent text-text cursor-pointer text-[13px] mt-2 hover:border-accent hover:text-accent transition-colors'
              onClick={() => {
                const newBoard = store.addBoard()
                setRenamingBoard({ id: newBoard.id, name: newBoard.name })
              }}
            >
              + New board
            </button>
          </nav>
        </div>
      )}
    </>
  )
}

function BoardTab({
  board,
  active,
  renaming,
  onActivate,
  onRename,
  onCancelRename,
}: {
  board: Board
  active: boolean
  renaming: { id: string; name: string } | null
  onActivate: () => void
  onRename: (id: string, name: string) => void
  onCancelRename: () => void
}) {
  if (renaming) {
    return (
        <input
        autoFocus
        defaultValue={renaming.name}
        className='w-full px-2 py-1 rounded border border-white/20 bg-card text-text text-sm focus:border-accent outline-none'
        onBlur={(e) => onRename(board.id, e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onRename(board.id, e.currentTarget.value)
          if (e.key === 'Escape') onCancelRename()
        }}
      />
    )
  }

  return (
    <button className={`w-full px-3 py-2 rounded border-none bg-transparent text-text cursor-pointer text-[13px] text-left whitespace-nowrap overflow-hidden hover:bg-white/10 transition-colors${active ? ' bg-accent text-white font-semibold' : ''}`} onClick={onActivate}>
      {board.name}
    </button>
  )
}
