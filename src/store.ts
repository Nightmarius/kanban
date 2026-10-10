import defaultData from './appData.json' with { type: 'json' }
import type { Board, BoardItem, Column, KanbanData } from './types'

const STORAGE_KEY = 'kanban-data'

let state: KanbanData = load()
const listeners = new Set<(s: KanbanData) => void>()

function load(): KanbanData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return structuredClone(defaultData)
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function subscribe(fn: (s: KanbanData) => void) {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}

function notify() {
  save()
  listeners.forEach((fn) => fn(structuredClone(state)))
}

// ── board actions ──

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

export function addBoard(name: string) {
  const board: Board = {
    id: 'board-' + Date.now(),
    name,
    columns: [
      { id: 'col-' + Date.now() + '-1', name: 'To Do', items: [] },
      { id: 'col-' + Date.now() + '-2', name: 'In Progress', items: [] },
      { id: 'col-' + Date.now() + '-3', name: 'Done', items: [] },
    ],
  }
  state.boards.push(board)
  notify()
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

// ── column actions ──

function findBoard(id: string): Board | undefined {
  return state.boards.find((b) => b.id === id)
}

export function addColumn(boardId: string, name: string) {
  const board = findBoard(boardId)
  if (!board) return
  board.columns.push({
    id: 'col-' + Date.now(),
    name,
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
  if (board.columns.length <= 1) return // at least one column
  board.columns = board.columns.filter((c) => c.id !== colId)
  notify()
}

export function addColumnAfter(boardId: string, fromColId: string) {
  const board = findBoard(boardId)
  if (!board) return
  const idx = board.columns.findIndex((c) => c.id === fromColId)
  board.columns.splice(idx + 1, 0, {
    id: 'col-' + Date.now(),
    name: 'New Column',
    items: [],
  })
  notify()
}

// ── item actions ──

function findColumn(boardId: string, colId: string): Column | null {
  const board = findBoard(boardId)
  if (!board) return null
  return board.columns.find((c) => c.id === colId) || null
}

export function moveItem(
  boardId: string,
  fromColId: string,
  toColId: string,
  itemIdx: number,
  reorderTarget?: number,
) {
  const src = findColumn(boardId, fromColId)
  const dst = findColumn(boardId, toColId)
  if (!src || !dst) return

  if (src === dst && reorderTarget != null) {
    // reordering within same column
    const item = src.items[itemIdx]
    if (!item) return
    src.items.splice(itemIdx, 1)
    dst.items.splice(reorderTarget, 0, item)
    notify()
    return
  }

  const item = src.items[itemIdx]
  if (!item) return
  src.items.splice(itemIdx, 1)
  dst.items.push(item)
  notify()
}

export function addItem(boardId: string, colId: string, text: string) {
  const col = findColumn(boardId, colId)
  if (!col) return
  col.items.push({ id: 'item-' + Date.now(), text })
  notify()
}

export function updateItem(
  boardId: string,
  colId: string,
  itemIdx: number,
  text: string,
) {
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
