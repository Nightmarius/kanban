import type { Board as BoardType } from './types'
import { ColumnList } from './ColumnList'
import { EditableText } from './EditableText'

interface BoardProps {
  board: BoardType
  onRename: (name: string) => void
  onDelete: () => void
  onSaveLocation?: () => Promise<void>
  autoSaveEnabled: boolean
}

export function Board({ board, onRename, onDelete, onSaveLocation, autoSaveEnabled }: BoardProps) {
  return (
    <div className='flex flex-col h-full'>
      <div className='flex items-center gap-2 p-3 mb-4 border-b-2 border-card'>
        <EditableText
          value={board.name}
          onSave={(name) => onRename(name)}
          className='text-2xl font-bold px-2 py-1 rounded bg-transparent text-text flex-1 cursor-text focus:border-accent focus:bg-card outline-none'
        />

        <AutoSaveIndicator autoSaveEnabled={autoSaveEnabled} />
        {onSaveLocation && (
          <button className='px-3.5 py-1.5 rounded-md border border-white/20 bg-card text-text cursor-pointer text-sm hover:border-accent hover:text-accent' onClick={() => onSaveLocation()}>
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
    <button
      className='w-7 h-7 flex items-center justify-center border-none bg-transparent text-text cursor-pointer rounded text-base hover:bg-card hover:text-accent'
      onClick={handleDelete}
      title='Delete board'
    >
      ✕
    </button>
  )
}

function AutoSaveIndicator({ autoSaveEnabled }: { autoSaveEnabled: boolean }) {
  return <span className='text-sm px-2 text-accent'>{autoSaveEnabled ? 'Auto On' : null}</span>
}
