import { useState, useRef, useEffect } from 'react'
import * as store from './store'
import type { KanbanData } from './types'
import { BoardPicker } from './BoardPicker'
import { Board } from './Board'
import { ConfirmProvider, showConfirm } from './ConfirmModal'

export function App() {
  return (
    <ConfirmProvider>
      <AppContent />
    </ConfirmProvider>
  )
}

function AppContent() {
  const [data, setData] = useState<KanbanData>(() => store.getState())
  const [activeBoardId, setActiveBoardId] = useState<string | null>(data.boards[0]?.id ?? null)
  const importInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => store.subscribe((s) => setData(s)), [])

  const activeBoard = data.boards.find((b) => b.id === activeBoardId) ?? null

  function handleImport(text: string) {
    try {
      const parsed = parseBoardFromMd(text)
      if (!parsed.boards?.length) {
        alert('No boards found in file.')
        return
      }
      setActiveBoardId(parsed.boards[0]?.id ?? null)
      store.importFromJSON(parsed)
    } catch (e) {
      console.error(e)
      alert('Invalid kanban .md file.')
    }
  }

  function handleSave() {
    saveAsFile(formatBoardAsMd(activeBoard!), activeBoard?.name)
  }

  async function handleDeleteActiveBoard() {
    if (!activeBoard) return
    handleDeleteBoardFromPicker(activeBoard.id, activeBoard.name)
  }

  async function handleDeleteBoardFromPicker(boardId: string, boardName: string) {
    if (!activeBoard) return
    const confirmed = await showConfirm({
      title: 'Delete Board',
      message: `Are you sure you want to delete "${boardName}" with all contained columns and items? This action can not be undone.`,
      confirmLabel: 'Delete',
    })
    const nextId = store.deleteBoard(boardId)
    if (nextId) setActiveBoardId(nextId)
  }

  function handleNewImportFile() {
    importInputRef.current?.click()
  }

  return (
    <div className='relative bg-bg main-content'>
      <BoardPicker boards={data.boards} activeBoardId={activeBoardId} onActivate={(id) => setActiveBoardId(id)} onImport={handleNewImportFile} onDelete={handleDeleteBoardFromPicker} />
      <input
        ref={importInputRef}
        type='file'
        accept='.md'
        className='hidden'
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (!file) return
          const reader = new FileReader()
          reader.onload = () => handleImport(reader.result as string)
          reader.readAsText(file)
          e.target.value = ''
        }}
      />
      {activeBoard ? (
        <Board board={activeBoard} onRename={(name: string) => store.renameBoard(activeBoard.id, name)} onDelete={handleDeleteActiveBoard} onSave={handleSave} />
      ) : (
        <EmptyState
          onImport={handleNewImportFile}
          onCreateBoard={() => {
            const newBoard = store.addBoard()
            setActiveBoardId(newBoard.id)
          }}
        />
      )}
    </div>
  )
}

function EmptyState({ onImport, onCreateBoard }: { onImport: () => void; onCreateBoard: () => void }) {
  return (
    <div className='flex flex-col items-center justify-center h-[60vh] gap-4'>
      <h2 className='text-text m-0 text-3 font-bold'>No boards yet</h2>
      <div className='flex gap-2'>
        <label className='border-2 border-dashed border-card bg-bg px-8 py-5 text-text rounded-lg text-lg cursor-pointer transition-all duration-200 hover:border-accent hover:text-accent'>
          Import .md file
          <input
            type='file'
            accept='.md'
            className='hidden'
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              const reader = new FileReader()
              reader.onload = () => onImport()
              reader.readAsText(file)
              e.target.value = ''
            }}
          />
        </label>
        <button className='px-6 py-5 bg-accent text-white border-none rounded-lg cursor-pointer text-lg' onClick={onCreateBoard}>
          + New Board
        </button>
      </div>
    </div>
  )
}

function formatBoardAsMd(board: { name: string; columns: Array<{ name: string; items: Array<any>; done?: number }> }): string {
  return [
    `# ${board.name}`,
    '',
    ...board.columns
      .map((col) => {
        const doneItems = typeof col.done === 'number' ? Math.min(col.done, col.items.length) : 0
        const lines: string[] = [`## ${col.name}`]
        if (doneItems > 0) {
          lines.push(`<!-- done:${doneItems} -->`)
          lines.push('')
        } else {
          lines.push('')
        }
        for (let i = 0; i < col.items.length; i++) {
          const item = col.items[i]
          const text = typeof item === 'string' ? item : item.text || ''
          if (typeof col.done === 'number' && i < col.done) {
            lines.push(`- [x] ${text}`)
          } else {
            lines.push(`- ${text}`)
          }
        }
        lines.push('')
        return lines
      })
      .flat(),
  ].join('\n')
}

function saveAsFile(content: string, filename?: string) {
  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || 'board.md'
  a.click()
  URL.revokeObjectURL(url)
}

export function parseBoardFromMd(text: string): KanbanData {
  const lines = text.split('\n')
  let currentBoard: { name: string; columns: Array<{ name: string; items: Array<string>; done?: number }> } | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (line.startsWith('# ') && !currentBoard) {
      currentBoard = { name: line.slice(2).trim(), columns: [] }
    } else if (currentBoard && /^##/.test(line)) {
      const headerContent = line.slice(2).trim()
      if (!headerContent) continue

      let colName: string
      const braceIdx = headerContent.indexOf('{')
      colName = braceIdx > 0 ? headerContent.slice(0, braceIdx).trim() : headerContent.trim()

      let done = 0
      let offset = 1
      const nextLine = lines[i + 1]?.trim() ?? ''
      if (nextLine.match(/^<!--\s*done:(\d+)-->$/)) {
        const match = nextLine.match(/<!--\s*done:(\d+)-->/)
        done = parseInt(match![1], 10)
        offset = 2
      }

      i += offset

      const items: Array<string> = []
      while (i < lines.length) {
        const next = lines[i].trim()

        if (!next || /^<!--/.test(next)) {
          i++
          continue
        }
        if (/^##/.test(next)) break
        if (!/^\- /.test(next) && !/^- /.test(next)) {
          i++
          continue
        }

        let itemText: string
        if (next.startsWith('- [x] ') || next.startsWith('- [X] ')) {
          itemText = next.slice(6).trim()
        } else if (next.startsWith('- [ ] ')) {
          itemText = next.slice(6).trim()
        } else {
          itemText = next.slice(2).trim()
        }
        items.push(itemText)
        i++
      }

      if (items.length > 0 && items[items.length - 1] === '') items.pop()
      currentBoard.columns.push({ name: colName, done, items })
    }
  }

  const boards = [] as Array<{ id: string; name: string; columns: Array<{ id: string; name: string; done: number; items: string[] }> }>

  if (currentBoard) {
    boards.push({
      id: 'board-' + Date.now(),
      name: currentBoard.name,
      columns: currentBoard.columns.map((col, idx) => ({
        id: 'col-' + Date.now() + '-' + idx,
        name: col.name,
        done: col.done || 0,
        items: col.items,
      })),
    })
  }

  return { boards }
}
