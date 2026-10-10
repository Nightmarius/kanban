import { useRef, useState, useEffect } from 'react'
import * as store from './store'
import type { Board as BoardType, KanbanData } from './types'
import { ColumnList } from './ColumnList'

interface BoardProps {
  board: BoardType
  onRename: (name: string) => void
  onDelete: () => void
}

export function Board({ board, onRename, onDelete }: BoardProps) {
  const [boardNameEdit, setBoardNameEdit] = useState(false)
  const [boardDraftName, setBoardDraftName] = useState(board.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (boardNameEdit && inputRef.current) inputRef.current.focus() }, [boardNameEdit])
  useEffect(() => { setBoardDraftName(board.name) }, [board.name])

  function commitRename() {
    setBoardNameEdit(false)
    onRename(boardDraftName)
  }

  return (
    <div className="board-area">
      <div className="board-title-bar">
        {boardNameEdit ? (
          <input
            ref={inputRef}
            className="board-title"
            value={boardDraftName}
            onChange={(e) => setBoardDraftName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename()
              if (e.key === 'Escape') { setBoardDraftName(board.name); setBoardNameEdit(false) }
            }}
          />
        ) : (
          <span className="board-title" onDoubleClick={() => setBoardNameEdit(true)}>
            {board.name}
          </span>
        )}

        <ExportButton board={board} />
        <ImportButton />
        <button className="btn-icon danger" onClick={onDelete} title="Delete board">🗑</button>
      </div>

      <ColumnList boardId={board.id} totalColumns={board.columns.length} />
    </div>
  )
}

/* ── Export Board (text) ── */

function ExportButton({ board }: { board: BoardType }) {
  return (
    <button className="btn-export" onClick={() => {
      const text = board.columns.map((col) => `## ${col.name}\n${col.items.map((i) => `- ${i.text}`).join('\n') || '(empty)'}`).join('\n\n')
      downloadFile(`${board.name}.txt`, text, 'text/plain')
    }}>📤 Export Board</button>
  )
}

/* ── Import JSON file ── */

function ImportButton() {
  return (
    <label className="btn-export" style={{ cursor: 'pointer' }}>
      📥 Import JSON
      <input type="file" accept=".json" onChange={(e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => {
          try { store.importFromJSON(JSON.parse(reader.result as string)) }
          catch { alert('Invalid kanban JSON file.') }
        }
        reader.readAsText(file)
        e.target.value = ''
      }} style={{ display: 'none' }} />
    </label>
  )
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
