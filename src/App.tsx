import { useState, useEffect } from 'react'
import * as store from './store'
import type { KanbanData, Board as BoardDef } from './types'
import { BoardPicker } from './BoardPicker'
import { NewBoardModal } from './NewBoardModal'
import { Board } from './Board'

export function App() {
  const [data, setData] = useState<KanbanData>(store.getState)
  const [activeBoardId, setActiveBoardId] = useState<string | null>(
    data.boards[0]?.id ?? null
  )
  const [menuOpen, setMenuOpen] = useState(false)
  const [showNewBoardModal, setShowNewBoardModal] = useState(false)

  useEffect(() => store.subscribe((s) => setData(s)), [])

  const activeBoard = data.boards.find((b) => b.id === activeBoardId) ?? null

  function handleDeleteBoard(board: BoardDef) {
    const totalItems = board.columns.reduce((s, c) => s + c.items.length, 0)
    let msg: string
    if (totalItems > 0) {
      msg = `Delete "${board.name}" (${board.columns.length} columns, ${totalItems} items)?`
    } else if (board.columns.length === 1) {
      msg = 'Delete this board and its only column?'
    } else {
      msg = `Delete "${board.name}" (${board.columns.length} columns)?`
    }
    confirm(msg) && store.deleteBoard(board.id)
  }

  return (
    <div className="app-layout">
      <BoardPicker
        boards={data.boards}
        activeBoardId={activeBoardId}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen(!menuOpen)}
        onSelect={(id) => setActiveBoardId(id)}
        onShowNewBoard={() => setShowNewBoardModal(true)}
      />

      <main className="main-content">
        {activeBoard ? (
          <Board board={activeBoard} onRename={(name) => store.renameBoard(activeBoard.id, name)} onDelete={() => handleDeleteBoard(activeBoard)} />
        ) : (
          <div className="empty-state">
            <p>No boards yet. Open the menu in the top-left to create one!</p>
          </div>
        )}
      </main>

      <NewBoardModal
        open={showNewBoardModal}
        onClose={() => setShowNewBoardModal(false)}
        onCreate={(name) => {
          if (name.trim()) {
            store.addBoard(name.trim())
            setShowNewBoardModal(false)
          }
        }}
      />
    </div>
  )
}
