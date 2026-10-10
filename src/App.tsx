import { useRef, useState, useEffect } from 'react'
import * as store from './store'
import type { Board, KanbanData, BoardItem, Column } from './types'

/* ── App ── */

export function App() {
  const [data, setData] = useState<KanbanData>(store.getState)
  const [activeBoardId, setActiveBoardId] = useState<string | null>(
    data.boards[0]?.id ?? null
  )
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Editor state
  const [showNewBoardModal, setShowNewBoardModal] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const [renamingBoard, setRenamingBoard] = useState<{ id: string; name: string } | null>(null)

  // Drag state
  const [draggingCard, setDraggingCard] = useState<{ boardId: string; colId: string; itemIdx: number } | null>(null)
  const [dragTargetIdx, setDragTargetIdx] = useState<number | null>(null)

  // Adding columns
  const [addingColumn, setAddingColumn] = useState<{ boardId: string; afterColId: string | null } | null>(null)

  // Column rename
  const [renamingColumn, setRenamingColumn] = useState<{ boardId: string; colId: string; name: string } | null>(null)

  useEffect(() => store.subscribe((s) => setData(s)), [])

  function ensureActiveBoard() {
    if (!activeBoardId || !data.boards.find((b) => b.id === activeBoardId)) {
      setActiveBoardId(data.boards[0]?.id ?? null)
    }
  }

  const activeBoard = data.boards.find((b) => b.id === activeBoardId) ?? null

  return (
    <div className="app-layout">
      {/* Collapsible sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>
        {sidebarOpen && (
          <div className="sidebar-content">
            <h1>Kanban</h1>
            <nav className="board-list">
              {data.boards.map((board) => (
                <button
                  key={board.id}
                  className={`board-tab ${board.id === activeBoardId ? 'active' : ''}`}
                  onClick={() => setActiveBoardId(board.id)}
                >
                  {renamingBoard?.id === board.id ? (
                    <input
                      value={renamingBoard.name}
                      autoFocus
                      onChange={(e) => setRenamingBoard({ ...renamingBoard, name: e.target.value })}
                      onBlur={() => handleRenameBoard(board.id, renamingBoard.name)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameBoard(board.id, e.currentTarget.value)
                        if (e.key === 'Escape') setRenamingBoard(null)
                      }}
                    />
                  ) : (
                    <span onDoubleClick={() => setRenamingBoard({ id: board.id, name: board.name })}>
                      {board.name}
                    </span>
                  )}
                </button>
              ))}
            </nav>
            <button className="btn-new-board" onClick={() => setShowNewBoardModal(true)}>+ New Board</button>
          </div>
        )}
      </aside>

      {/* Main area */}
      <main className="main-content">
        {activeBoard ? (
          <BoardView
            board={activeBoard}
            data={data}
            draggingCard={draggingCard}
            setDraggingCard={setDraggingCard}
            dragTargetIdx={dragTargetIdx}
            setDragTargetIdx={setDragTargetIdx}
            renamingColumn={renamingColumn}
            setRenamingColumn={setRenamingColumn}
            addingColumn={addingColumn}
            setAddingColumn={setAddingColumn}
          />
        ) : (
          <div className="empty-state">
            <p>No boards yet. Create one from the sidebar to get started!</p>
          </div>
        )}
      </main>

      {/* New Board Modal */}
      {showNewBoardModal && (
        <div className="modal-overlay" onClick={() => setShowNewBoardModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Board</h2>
            <input
              value={newBoardName}
              autoFocus
              placeholder="Board name..."
              onChange={(e) => setNewBoardName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleNewBoard() }}
            />
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={() => setShowNewBoardModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleNewBoard}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  function handleNewBoard() {
    if (newBoardName.trim()) {
      store.addBoard(newBoardName.trim())
      setNewBoardName('')
      setShowNewBoardModal(false)
    }
  }

  function handleRenameBoard(id: string, name: string) {
    setRenamingBoard(null)
    if (name.trim()) store.renameBoard(id, name.trim())
  }
}

/* ── Types ── */

interface RenamingColumn {
  boardId: string
  colId: string
  name: string
}

interface AddingColumn {
  boardId: string
  afterColId: string | null
}

interface DraggingCard {
  boardId: string
  colId: string
  itemIdx: number
}

/* ── BoardView ── */

interface BoardViewProps {
  board: Board
  data: KanbanData
  draggingCard: DraggingCard | null
  setDraggingCard: (c: DraggingCard | null) => void
  dragTargetIdx: number | null
  setDragTargetIdx: (idx: number | null) => void
  renamingColumn: RenamingColumn | null
  setRenamingColumn: (r: RenamingColumn | null) => void
  addingColumn: AddingColumn | null
  setAddingColumn: (a: AddingColumn | null) => void
}

function BoardView({ board, draggingCard, setDraggingCard, dragTargetIdx, setDragTargetIdx, renamingColumn, setRenamingColumn, addingColumn, setAddingColumn }: BoardViewProps) {
  const [boardNameEdit, setBoardNameEdit] = useState(false)
  const [boardDraftName, setBoardDraftName] = useState(board.name)
  const boardInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (boardNameEdit && boardInputRef.current) boardInputRef.current.focus() }, [boardNameEdit])

  function commitBoardRename(name: string) {
    setBoardNameEdit(false)
    store.renameBoard(board.id, name.trim() || board.name)
  }

  function handleExportBoard() {
    const text = board.columns.map((col) => `## ${col.name}\n${col.items.map((i) => `- ${i.text}`).join('\n') || '(empty)'}`).join('\n\n')
    downloadFile(`${board.name}.txt`, text, 'text/plain')
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result as string)
        store.importFromJSON(json)
      } catch {
        alert('Invalid kanban JSON file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleAddColumn() {
    setAddingColumn(null)
    if (addingColumn?.afterColId) store.addColumnAfter(board.id, addingColumn.afterColId)
    else store.addColumn(board.id, 'New Column')
  }

  return (
    <div className="board-area">
      {/* Board controls */}
      <div className="board-title-bar">
        {boardNameEdit ? (
          <input
            ref={boardInputRef}
            className="board-title"
            value={boardDraftName}
            onChange={(e) => setBoardDraftName(e.target.value)}
            onBlur={() => commitBoardRename(boardDraftName)}
            onKeyDown={(e) => { if (e.key === 'Enter') commitBoardRename(e.currentTarget.value); if (e.key === 'Escape') setBoardNameEdit(false) }}
          />
        ) : (
          <span className="board-title" onDoubleClick={() => { setBoardNameEdit(true); setBoardDraftName(board.name) }}>{board.name}</span>
        )}

        <button className="btn-export" onClick={handleExportBoard}>📤 Export Board</button>
        <label className="btn-export" style={{ cursor: 'pointer' }}>
          📥 Import JSON
          <input type="file" accept=".json" onChange={handleImportFile} style={{ display: 'none' }} />
        </label>
        <button className="btn-icon danger" onClick={() => { if (confirm('Delete this board and all its columns?')) { store.deleteBoard(board.id) } } } title="Delete board">🗑</button>
      </div>

      {/* Columns track */}
      <div className="track">
        {board.columns.map((col, colIdx) => (
          <Column
            key={col.id}
            column={col}
            colIdx={colIdx}
            boardId={board.id}
            totalColumns={board.columns.length}
            renamingColumn={renamingColumn}
            setRenamingColumn={setRenamingColumn}
            addingColumn={addingColumn}
            setAddingColumn={setAddingColumn}
            draggingCard={draggingCard}
            dragTargetIdx={dragTargetIdx}
            setDragTargetIdx={setDragTargetIdx}
            setDraggingCard={setDraggingCard}
          />
        ))}

        {addingColumn?.boardId === board.id ? (
          <div className="add-col-form">
            <button className="btn-primary" onClick={handleAddColumn}>+</button>
            <button className="btn-cancel" onClick={() => setAddingColumn(null)}>Cancel</button>
          </div>
        ) : (
          <button className="btn-add-col" onClick={() => setAddingColumn({ boardId: board.id, afterColId: null })}>+ Column</button>
        )}
      </div>
    </div>
  )
}

/* ── Column ── */

interface ColumnProps {
  column: Column
  colIdx: number
  boardId: string
  totalColumns: number
  renamingColumn: RenamingColumn | null
  setRenamingColumn: (r: RenamingColumn | null) => void
  addingColumn: AddingColumn | null
  setAddingColumn: (a: AddingColumn | null) => void
  draggingCard: DraggingCard | null
  dragTargetIdx: number | null
  setDragTargetIdx: (idx: number | null) => void
  setDraggingCard: (c: DraggingCard | null) => void
}

function Column({ column, colIdx, boardId, totalColumns, renamingColumn, setRenamingColumn, addingColumn, setAddingColumn, draggingCard, dragTargetIdx, setDragTargetIdx, setDraggingCard }: ColumnProps) {
  function handleDragEnter() {
    if (draggingCard) {
      setDragTargetIdx(colIdx)
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    let info: DraggingCard | null = null
    try { info = JSON.parse(e.dataTransfer.getData('text/plain')) } catch { return }
    if (!info || info.boardId !== boardId) return

    const targetIdx = dragTargetIdx ?? colIdx

    if (info.colId === column.id) {
      // reordering within same column — use the delta from drag position
      const delta = targetIdx - colIdx
      const newIdx = info.itemIdx + delta
      store.moveItem(boardId, column.id, column.id, info.itemIdx, Math.max(0, Math.min(newIdx, column.items.length)))
    } else {
      store.moveItem(boardId, info.colId, column.id, info.itemIdx)
    }
    setDraggingCard(null)
  }

  const isDragTarget = dragTargetIdx === colIdx

  return (
    <div
      className={`column ${isDragTarget ? 'drag-over' : ''}`}
      onDragEnter={handleDragEnter}
      onDragOver={(e) => { e.preventDefault(); handleDragEnter() }}
      onDrop={handleDrop}
    >
      {/* Column header */}
      <div className="column-header">
        <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{column.name}</span>

        {renamingColumn?.boardId === boardId && renamingColumn?.colId === column.id ? (
          <input
            className="column-name-input"
            value={renamingColumn.name}
            autoFocus
            onChange={(e) => setRenamingColumn({ ...renamingColumn, name: e.target.value })}
            onBlur={() => {
              if (renamingColumn.name.trim()) store.renameColumn(boardId, column.id, renamingColumn.name.trim())
              setRenamingColumn(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (renamingColumn.name.trim()) store.renameColumn(boardId, column.id, renamingColumn.name.trim())
                setRenamingColumn(null)
              }
              if (e.key === 'Escape') setRenamingColumn(null)
            }}
          />
        ) : (
          <span className="column-name" onDoubleClick={() => setRenamingColumn({ boardId, colId: column.id, name: column.name })}>
            {column.name}
          </span>
        )}

        <button
          className="btn-icon danger"
          onClick={() => {
            if (totalColumns > 1) store.deleteColumn(boardId, column.id)
            else setAddingColumn({ boardId, afterColId: null })
          }}
          title={totalColumns > 1 ? 'Delete column' : 'Insert before'}
        >
          {totalColumns > 1 ? '✕' : '+'}
        </button>
      </div>

      {/* Items */}
      <div className="items">
        {column.items.map((item, itemIdx) => (
          <Card
            key={item.id}
            card={item}
            itemIdx={itemIdx}
            boardId={boardId}
            colId={column.id}
            dragging={draggingCard?.boardId === boardId && draggingCard?.colId === column.id && draggingCard?.itemIdx === itemIdx}
            onDragStart={(e) => {
              const info = { boardId, colId: column.id, itemIdx }
              setDraggingCard(info)
              e.dataTransfer.effectAllowed = 'move'
              e.dataTransfer.setData('text/plain', JSON.stringify(info))
            }}
          />
        ))}

        <AddItemForm boardId={boardId} colId={column.id} />
      </div>
    </div>
  )
}

/* ── Card ── */

function Card({ card, itemIdx, boardId, colId, dragging, onDragStart }: {
  card: BoardItem
  itemIdx: number
  boardId: string
  colId: string
  dragging: boolean
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(card.text)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { setDraft(card.text) }, [card.text])
  useEffect(() => { if (editing && textareaRef.current) textareaRef.current.focus() }, [editing])

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }

  function commitEdit() {
    setEditing(false)
    if (draft !== card.text && draft.trim()) store.updateItem(boardId, colId, itemIdx, draft)
  }

  return (
    <div className={`card ${dragging ? 'dragging' : ''}`} draggable onDragStart={onDragStart}>
      {editing ? (
        <textarea
          ref={textareaRef}
          className="card-text"
          value={draft}
          onChange={(e) => { setDraft(e.target.value); autoResize() }}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === 'Escape') { setDraft(card.text); setEditing(false) }
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit() }
          }}
          rows={1}
        />
      ) : (
        <span className="card-text" onDoubleClick={() => setEditing(true)}>{card.text}</span>
      )}
      <div className="item-actions">
        <button className="btn-item-action" onClick={() => setEditing(true)} title="Edit">✎</button>
        <button className="btn-item-action danger" onClick={() => store.deleteItem(boardId, colId, itemIdx)} title="Delete">✕</button>
      </div>
    </div>
  )
}

/* ── Add Item Form ── */

function AddItemForm({ boardId, colId }: { boardId: string; colId: string }) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (open && inputRef.current) inputRef.current.focus() }, [open])

  function submit() {
    if (text.trim()) {
      store.addItem(boardId, colId, text.trim())
      setText('')
    }
    setOpen(false)
  }

  if (!open) return <button className="btn-add-item" onClick={() => setOpen(true)}>+ Add item</button>

  return (
    <div className="add-item-form">
      <input
        ref={inputRef}
        className="add-item-input"
        placeholder="Enter item..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setOpen(false) }}
      />
      <button className="btn-add-item" onClick={submit}>Add</button>
    </div>
  )
}

/* ── Utilities ── */

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename; document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
