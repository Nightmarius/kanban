import { useRef, useState, useEffect } from 'react'
import type { Board as BoardType } from './types'
import { ColumnList } from './ColumnList'

interface BoardProps {
  board: BoardType
  onRename: (name: string) => void
  onDelete: () => void
  onSaveLocation?: () => Promise<void>
  autoSaveEnabled: boolean
}

export function Board({ board, onRename, onDelete, onSaveLocation, autoSaveEnabled }: BoardProps) {
  const [boardNameEdit, setBoardNameEdit] = useState(false)
  const [boardDraftName, setBoardDraftName] = useState(board.name)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (boardNameEdit && inputRef.current) inputRef.current.focus()
  }, [boardNameEdit])
  useEffect(() => {
    setBoardDraftName(board.name)
  }, [board.name])

  function commitRename() {
    setBoardNameEdit(false)
    onRename(boardDraftName)
  }

  return (
    <div className='board-area'>
      <div className='board-title-bar'>
        {boardNameEdit ? (
          <input
            ref={inputRef}
            className='board-title'
            value={boardDraftName}
            onChange={(e) => setBoardDraftName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename()
              if (e.key === 'Escape') {
                setBoardDraftName(board.name)
                setBoardNameEdit(false)
              }
            }}
          />
        ) : (
          <span className='board-title' onDoubleClick={() => setBoardNameEdit(true)}>
            {board.name}
          </span>
        )}

        <AutoSaveIndicator autoSaveEnabled={autoSaveEnabled} />
        {onSaveLocation && (
          <button className='btn-export' onClick={() => onSaveLocation()}>
            Set Save Location
          </button>
        )}
        <DeleteButton board={board} onDelete={onDelete} />
      </div>

      <ColumnList boardId={board.id} />
    </div>
  )
}

function DeleteButton({ board, onDelete }: { board: BoardType; onDelete: () => void }) {
  const itemTotal = board.columns.reduce((s, c) => s + c.items.length, 0)

  function handleDelete() {
    if (itemTotal > 0) {
      confirm(`Delete "${board.name}" (${board.columns.length} columns, ${itemTotal} items)?`) && onDelete()
    } else {
      onDelete()
    }
  }

  return (
    <button className='btn-icon' onClick={handleDelete} title='Delete board'>
      ✕
    </button>
  )
}

function AutoSaveIndicator({ autoSaveEnabled }: { autoSaveEnabled: boolean }) {
  return <span className='autosave-indicator'>{autoSaveEnabled ? 'Auto On' : null}</span>
}
