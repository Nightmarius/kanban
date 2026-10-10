import { useState } from 'react'
import * as store from './store'
import type { Board } from './types'

interface BoardPickerProps {
  boards: Board[]
  activeBoardId: string | null
  menuOpen: boolean
  onToggleMenu: () => void
  onSelect: (id: string) => void
  onShowNewBoard: () => void
}

export function BoardPicker({ boards, activeBoardId, menuOpen, onToggleMenu, onSelect, onShowNewBoard }: BoardPickerProps) {
  const [renamingBoard, setRenamingBoard] = useState<{ id: string; name: string } | null>(null)

  return (
    <div className="board-picker">
      <button
        className="board-accordion-btn"
        onClick={onToggleMenu}
        title={menuOpen ? 'Close menu' : 'Open board menu'}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {menuOpen && (
        <div className="board-dropdown">
          {/* Arrow */}
          <div className="dropdown-arrow" />

          {/* Board list */}
          <nav className="dropdown-content">
            <h3>Boards</h3>
            {boards.length === 0 && <p className="empty-hint">No boards yet</p>}
            <ul>
              {boards.map((board) => (
                <li key={board.id} data-active={board.id === activeBoardId}>
                  <button onClick={() => { onSelect(board.id); onToggleMenu() }}>
                    {renamingBoard?.id === board.id ? (
                      <input
                        value={renamingBoard.name}
                        autoFocus
                        onChange={(e) => setRenamingBoard({ ...renamingBoard, name: e.target.value })}
                        onBlur={() => handleRename(board.id, renamingBoard.name)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRename(board.id, e.currentTarget.value)
                          if (e.key === 'Escape') setRenamingBoard(null)
                        }}
                      />
                    ) : (
                      <>
                        <span className="board-dot" />
                        <span>{board.name}</span>
                      </>
                    )}
                  </button>
                </li>
              ))}
            </ul>

            {/* Actions */}
            <div className="dropdown-actions">
              <button className="action-btn new-board" onClick={onShowNewBoard}>+ New board</button>
              <button className="action-btn save-json" onClick={() => {
                downloadFile('kanban.json', JSON.stringify(store.getState(), null, 2), 'application/json')
              }}>💾 Save</button>
            </div>
          </nav>
        </div>
      )}
    </div>
  )

  function handleRename(id: string, name: string) {
    setRenamingBoard(null)
    if (name.trim()) store.renameBoard(id, name.trim())
  }
}

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
