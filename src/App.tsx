import { useState, useEffect, useRef } from 'react'
import * as store from './store'
import type { KanbanData } from './types'
import { BoardPicker } from './BoardPicker'
import { Board } from './Board'

export function App() {
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false)
  const fileHandleRef = useRef<FileSystemFileHandle | null>(null)
  const [saveLocationSet, setSaveLocationSet] = useState(false)

  const [data, setData] = useState<KanbanData>(store.getState)
  const [activeBoardId, setActiveBoardId] = useState<string | null>(
    data.boards[0]?.id ?? null
  )

  useEffect(() => store.subscribe((s) => setData(s)), [])

  const activeBoard = data.boards.find((b) => b.id === activeBoardId) ?? null

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!autoSaveEnabled || !activeBoard || !fileHandleRef.current) return
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      writeBoardToDisk(fileHandleRef.current!, formatBoardAsMd(activeBoard))
    }, 2000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [activeBoard, autoSaveEnabled])

  async function setSaveLocation() {
    try {
      const picker = (window as unknown as Record<string, unknown>).showSaveFilePicker
      if (!picker) { console.error('File System Access API not supported'); return }
      const handle = await (picker as Function)({
        suggestedName: 'board.md',
        types: [{ accept: { 'text/markdown': ['.md'] } }],
      })
      fileHandleRef.current = handle as FileSystemFileHandle
      setSaveLocationSet(true)
      setAutoSaveEnabled(true)
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      console.error('Failed to pick save location:', err)
    }
  }

  function handleImport(text: string) {
    try {
      const parsed = parseBoardFromMd(text)
      store.importFromJSON(parsed)
    } catch {
      alert('Invalid kanban .md file.')
    }
  }

  return (
    <div className="main-content">
      {activeBoard ? (
          <Board board={activeBoard} onRename={(name: string) => store.renameBoard(activeBoard.id, name)} onDelete={() => store.deleteBoard(activeBoard.id)} onSaveLocation={saveLocationSet ? undefined : setSaveLocation} autoSaveEnabled={autoSaveEnabled && saveLocationSet} />
        ) : (
          <EmptyState onImport={handleImport} autoSaveEnabled={autoSaveEnabled && saveLocationSet} />
        )}
      </div>
  )
}

function EmptyState({ onImport, autoSaveEnabled }: { onImport: (text: string) => void; autoSaveEnabled?: boolean }) {
  return (
    <div className="empty-state">
      <p>No boards loaded.</p>
      <label className="action-btn" style={{ cursor: 'pointer' }}>
        Import .md
        <input type="file" accept=".md" onChange={(e) => {
          const file = e.target.files?.[0]
          if (!file) return
          const reader = new FileReader()
          reader.onload = () => onImport(reader.result as string)
          reader.readAsText(file)
          e.target.value = ''
        }} style={{ display: 'none' }} />
      </label>
      {autoSaveEnabled && (
        <span className="autosave-indicator" style={{ marginTop: 4, fontSize: 13 }}>Auto On</span>
      )}
    </div>
  )
}

function formatBoardAsMd(board: { name: string; columns: Array<{ name: string; items: Array<{ text: string }> }> }): string {
  return [
    `# ${board.name}`,
    '',
    ...board.columns.map((col) => [
      `## ${col.name}`,
      '',
      ...(col.items.length > 0 ? col.items.map((item) => `- ${item.text}`) : ['(empty)']),
      '',
    ]).flat(),
  ].join('\n')
}

function writeBoardToDisk(handle: FileSystemFileHandle, content: string) {
  handle.createWritable().then((writable) => writable.write(content).finally(() => writable.close())).catch(console.error)
}

export function parseBoardFromMd(text: string): KanbanData {
  const lines = text.split('\n')
  const boards: Array<{ id: string; name: string; columns: Array<{ id: string; name: string; items: Array<{ id: string; text: string }> }> }> = []
  let currentBoard: { name: string; columns: Array<{ name: string; items: Array<{ text: string }> }> } | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.startsWith('# ') && !currentBoard) {
      currentBoard = { name: line.slice(2).trim(), columns: [] }
    } else if (line.startsWith('## ')) {
      const colName = line.slice(3).trim()
      const items: Array<{ text: string }> = []
      i++
      while (i < lines.length) {
        const next = lines[i].trim()
        if (next.startsWith('# ') || (next.startsWith('## ') && currentBoard!.columns.some((c) => c.name === colName))) break
        if (next === '' || next === '(empty)' || !next.startsWith('- ')) { i++; continue }
        items.push({ text: next.slice(2).trim() })
        i++
      }
      currentBoard!.columns.push({ name: colName, items })
    }
  }

  if (currentBoard) {
    boards.push({
      id: 'board-' + Date.now(),
      name: currentBoard.name,
      columns: currentBoard.columns.map((col, idx) => ({
        id: 'col-' + Date.now() + '-' + idx,
        name: col.name,
        items: col.items.map((item, iIdx) => ({ id: 'item-' + Date.now() + '-' + iIdx, text: item.text })),
      })),
    })
  }

  return { boards }
}
