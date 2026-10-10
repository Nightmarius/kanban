import { useState } from 'react'
import * as store from './store'
import type { Board } from './types'

interface BoardPickerProps {
  boards: Board[]
  activeBoardId: string | null
}

export function BoardPicker({ boards, activeBoardId }: BoardPickerProps) {
  const [open, setOpen] = useState(false)
  const [renamingBoard, setRenamingBoard] = useState<{ id: string; name: string } | null>(null)

  return (
    <>
      <button className="hamburger-btn" onClick={() => setOpen((v) => !v)} title={open ? 'Close menu' : 'Open board menu'}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {open && (
        <div className="board-overlay" onClick={() => setOpen(false)}>
          <nav className="board-panel" onClick={(e) => e.stopPropagation()}>
            <ul>
              {boards.map((board) => (
                <li key={board.id} data-active={board.id === activeBoardId}>
                  <BoardTab
                    board={board}
                    active={board.id === activeBoardId}
                    renaming={renamingBoard?.id === board.id ? renamingBoard : null}
                    onActivate={() => setOpen(false)}
                    onRename={(id, name) => { store.renameBoard(id, name); setRenamingBoard(null) }}
                    onCancelRename={() => setRenamingBoard(null)}
                  />
                </li>
              ))}
            </ul>
            <button className="btn-new-board" onClick={() => {
              const newBoard = store.addBoard('Untitled')
              setRenamingBoard({ id: newBoard.id, name: newBoard.name })
            }}>
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
        className="board-tab-input"
        onBlur={(e) => onRename(board.id, e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onRename(board.id, e.currentTarget.value)
          if (e.key === 'Escape') onCancelRename()
        }}
      />
    )
  }

  return (
    <button className={`board-tab${active ? ' active' : ''}`} onClick={onActivate}>
      {board.name}
    </button>
  )
}
