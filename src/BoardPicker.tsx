import { useState } from 'react'
import * as store from './store'
import type { Board } from './types'
import { showConfirm } from './ConfirmModal'

interface BoardPickerProps {
  boards: Board[]
  activeBoardId: string | null
  onActivate: (id: string) => void
  onImport?: () => void
  onCreateNew?: () => void
  onClose?: () => void
}

export function BoardPicker({ boards, activeBoardId, onActivate, onImport, onCreateNew, onClose }: BoardPickerProps) {
  const [open, setOpen] = useState(false)
  const [renamingBoard, setRenamingBoard] = useState<{ id: string; name: string } | null>(null)

  function handleCreateNew() {
    const newBoard = store.addBoard()
    onActivate(newBoard.id)
    onCreateNew?.()
    onClose?.()
    setOpen(false)
  }

  function handleImportAndClose() {
    onImport?.()
    onClose?.()
    setOpen(false)
  }

  async function handleDeleteBoard(boardId: string, boardName: string) {
    const confirmed = await showConfirm({
      title: 'Delete Board',
      message: `Are you sure you want to delete "${boardName}"?`,
      confirmLabel: 'Delete',
    })
    if (confirmed) {
      const nextId = store.deleteBoard(boardId)
      if (nextId) onActivate(nextId)
    }
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
          <nav className='w-56 bg-card text-text rounded shadow-lg p-2 flex flex-col gap-1' onClick={(e) => e.stopPropagation()}>
            <ul>
              {boards.map((board, idx) => (
                <li key={board.id} data-active={board.id === activeBoardId}>
                  <div className='flex items-center'>
                    <div className='flex-1' />
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
                    />
                    {boards.length > 1 && (
                      <button
                        className={`ml-1 w-5 h-5 flex items-center justify-center rounded text-xs transition-opacity bg-transparent text-text/50 cursor-pointer hover:text-red-600 ${board.id === activeBoardId ? 'opacity-70' : 'opacity-0'} hover:opacity-100`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteBoard(board.id, board.name)
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <button className='w-full px-2 py-2 mt-1 rounded border border-dashed border-white/20 bg-accent text-white text-[13px] hover:bg-hover transition-colors' onClick={handleCreateNew}>
              + New board
            </button>
            {onImport && (
              <button
                className='w-full px-2 py-2 rounded border border-dashed border-white/30 bg-transparent text-text cursor-pointer text-[13px] hover:border-accent hover:text-accent transition-colors'
                onClick={handleImportAndClose}
              >
                Import .md
              </button>
            )}
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
}: {
  board: Board
  active: boolean
  renaming: { id: string; name: string } | null
  onActivate: () => void
  onRename: (id: string, name: string) => void
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
        }}
      />
    )
  }

  return (
    <button
      className={`w-full px-3 py-2 rounded border-none bg-transparent text-text cursor-pointer text-[13px] text-left whitespace-nowrap overflow-hidden hover:bg-white/10 transition-colors${active ? ' bg-accent text-white font-semibold' : ''}`}
      onClick={onActivate}
    >
      {board.name}
    </button>
  )
}
