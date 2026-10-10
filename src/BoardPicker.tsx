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
    <div className="board-accordion">
      <button className="accordion-toggle" onClick={onToggleMenu}>
        <span className="accordion-icon">{menuOpen ? '▾' : '▸'}</span>
        <span className="accordion-label">
          {boards.find((b) => b.id === activeBoardId)?.name ?? 'Kanban'}
        </span>
      </button>

      {menuOpen && (
        <nav className="board-dropdown" onClick={(e) => e.stopPropagation()}>
          <ul>
            {boards.map((board) => (
              <li key={board.id}>
                <button
                  className={`dropdown-tab ${board.id === activeBoardId ? 'active' : ''}`}
                  onClick={() => { onSelect(board.id); onToggleMenu() }}
                >
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
                    <span onDoubleClick={() => setRenamingBoard({ id: board.id, name: board.name })}>
                      {board.name}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
          <button className="btn-new-board" onClick={onShowNewBoard}>+ New Board</button>
          <button className="btn-save" onClick={() => {
            const blob = new Blob([JSON.stringify(store.getState(), null, 2)], { type: 'application/json' })
            downloadFile('kanban.json', JSON.stringify(store.getState(), null, 2), 'application/json')
          }}>💾 Save JSON</button>
        </nav>
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
