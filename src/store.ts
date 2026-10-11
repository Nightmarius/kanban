import defaultData from './appData.json' with { type: 'json' }
import type { Board, BoardItem, Column, KanbanData } from './types'

const STORAGE_KEY = 'kanban-data'

let state: KanbanData = load()
const listeners = new Set<(s: KanbanData) => void>()

function load(): KanbanData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
    return structuredClone(defaultData)
  } catch {
    return structuredClone(defaultData)
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function subscribe(fn: (s: KanbanData) => void) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

function notify() {
  save()
  listeners.forEach((fn) => fn(structuredClone(state)))
}

export function getState(): KanbanData {
  return structuredClone(state)
}

export function importFromJSON(json: KanbanData) {
  state = json
  notify()
}

export function exportAsJSON(): string {
  return JSON.stringify(state, null, 2)
}

export function addBoard(): Board {
  const board: Board = {
    id: 'board-' + Date.now(),
    name: '',
    columns: [
      { id: 'col-' + Date.now() + '-1', name: 'To Do', items: [] },
      { id: 'col-' + Date.now() + '-2', name: 'In Progress', items: [] },
      { id: 'col-' + Date.now() + '-3', name: 'Done', items: [] },
    ],
  }
  state.boards.push(board)
  notify()
  return board
}

export function deleteBoard(id: string) {
  state.boards = state.boards.filter((b) => b.id !== id)
  notify()
}

export function renameBoard(id: string, name: string) {
  const board = state.boards.find((b) => b.id === id)
  if (board) board.name = name
  notify()
}

function findBoard(id: string): Board | undefined {
  return state.boards.find((b) => b.id === id)
}

export function addColumn(boardId: string) {
  const board = findBoard(boardId)
  if (!board) return
  board.columns.push({
    id: 'col-' + Date.now(),
    name: '',
    items: [],
  })
  notify()
}

export function renameColumn(boardId: string, colId: string, name: string) {
  const board = findBoard(boardId)
  if (!board) return
  const col = board.columns.find((c) => c.id === colId)
  if (col) col.name = name
  notify()
}

export function deleteColumn(boardId: string, colId: string) {
  const board = findBoard(boardId)
  if (!board) return
  board.columns = board.columns.filter((c) => c.id !== colId)
  notify()
}

export function moveColumn(boardId: string, fromIdx: number, toIdx: number) {
  const board = findBoard(boardId)
  if (!board || toIdx < 0 || toIdx >= board.columns.length) return
  const column = board.columns[fromIdx]
  board.columns.splice(fromIdx, 1)
  board.columns.splice(toIdx, 0, column)
  notify()
}

function findColumn(boardId: string, colId: string): Column | null {
  const board = findBoard(boardId)
  if (!board) return null
  return board.columns.find((c) => c.id === colId) || null
}

export function moveItem(boardId: string, fromColId: string, toColId: string, itemIdx: number, reorderTargetIndex?: number) {
  const src = findColumn(boardId, fromColId)
  const dst = findColumn(boardId, toColId)
  if (!src || !dst) return

  const item = src.items[itemIdx]
  if (!item) return
  
  if (src === dst && reorderTargetIndex != null) {
    // Within same column - remove from old position and re-insert at new
    src.items.splice(itemIdx, 1)
    const insertAt = Math.min(reorderTargetIndex, src.items.length)
    src.items.splice(insertAt, 0, item)
    notify()
    return
  }

  // Cross-column move
  src.items.splice(itemIdx, 1)
  
  if (reorderTargetIndex != null && reorderTargetIndex > 0) {
    const insertAt = Math.min(reorderTargetIndex - 1, dst.items.length)
    dst.items.splice(insertAt, 0, item)
  } else {
    dst.items.push(item)
  }
  notify()
}

export function addItem(boardId: string, colId: string, text: string) {
  const col = findColumn(boardId, colId)
  if (!col) return
  col.items.push({ id: 'item-' + Date.now(), text })
  notify()
}

export function updateItem(boardId: string, colId: string, itemIdx: number, text: string) {
  const col = findColumn(boardId, colId)
  if (!col) return
  const item = col.items[itemIdx]
  if (!item) return
  item.text = text
  notify()
}

export function deleteItem(boardId: string, colId: string, itemIdx: number) {
  const col = findColumn(boardId, colId)
  if (!col) return
  col.items.splice(itemIdx, 1)
  notify()
}
