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
  const [activeBoardIndex, setActiveBoardIndex] = useState<number>(0)
  const importInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => store.subscribe((s) => setData(s)), [])

  const activeBoard = data.boards[activeBoardIndex] ?? null

  function handleImport(text: string) {
    try {
      const parsed = parseBoardFromMd(text)
      if (!parsed.boards?.length) {
        alert('No boards found in file.')
        return
      }
      setActiveBoardIndex(data.boards.length)
      store.importFromJSON(parsed)
    } catch (e) {
      console.error(e)
      alert('Invalid kanban .md file.')
    }
  }

  function handleSave() {
    saveAsFile(formatBoardAsMd(activeBoard!), activeBoard?.name)
  }

  async function deleteBoard(index: number) {
    const confirmed = await showConfirm({
      title: 'Delete Board',
      message: `Are you sure you want to delete "${data.boards[index].name}" with all contained columns and items? This action can not be undone.`,
      confirmLabel: 'Delete',
    })
    if (!confirmed) return
    const nextIndex = store.deleteBoard(index)
    if (nextIndex !== null) setActiveBoardIndex(nextIndex)
  }

  function handleNewImportFile() {
    importInputRef.current?.click()
  }

  return (
    <div className='relative bg-bg main-content'>
      {activeBoard ? (
        <Board boards={data.boards} boardIndex={activeBoardIndex} onSave={handleSave} onImport={handleNewImportFile} onActivate={setActiveBoardIndex} onDelete={deleteBoard} />
      ) : (
        <EmptyState onImport={handleNewImportFile} onCreateBoard={() => { const boardIndex = store.addBoard(); setActiveBoardIndex(boardIndex) }} />
      )}
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
      const braceIndex = headerContent.indexOf('{')
      colName = braceIndex > 0 ? headerContent.slice(0, braceIndex).trim() : headerContent.trim()

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

  const boards = [] as Array<{ name: string; columns: Array<{ name: string; done: number; items: string[] }> }>

  if (currentBoard) {
    boards.push({
      name: currentBoard.name,
      columns: currentBoard.columns.map((col) => ({
        name: col.name,
        done: col.done || 0,
        items: col.items,
      })),
    })
  }

  return { boards }
}
