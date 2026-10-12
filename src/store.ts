import defaultData from './appData.json' with { type: 'json' }
import type { Board, Column, KanbanData } from './types'

const STORAGE_KEY = 'data'

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
  state.boards.push(...json.boards)
  notify()
}

export function exportAsJSON(): string {
  return JSON.stringify(state, null, 2)
}

export function addBoard(): Board {
  const board = structuredClone(defaultData).boards[0]
  state.boards.push(board)
  notify()
  return board
}

export function deleteBoard(id: string): string | null {
  const idx = state.boards.findIndex((b) => b.id === id)
  state.boards = state.boards.filter((b) => b.id !== id)
  let nextBoardId: string | null = null
  if (idx > 0) {
    nextBoardId = state.boards[idx - 1]?.id ?? null
  } else if (state.boards.length > 0) {
    nextBoardId = state.boards[0].id
  }
  notify()
  return nextBoardId
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
    done: 0,
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

export function moveItem(boardId: string, fromColId: string, toColId: string, fromItemIndex: number, toItemIndex?: number) {
  const src = findColumn(boardId, fromColId)
  const dst = findColumn(boardId, toColId)
  if (!src || !dst || toItemIndex == null || dst.done > toItemIndex) return
  const item = src.items[fromItemIndex]
  src.items.splice(fromItemIndex, 1)
  dst.items.splice(toItemIndex, 0, item)
  notify()
}

export function addItem(boardId: string, colId: string) {
  const col = findColumn(boardId, colId)
  if (!col) return
  col.items.push('')
  notify()
}

export function updateItem(boardId: string, colId: string, itemIndex: number, text: string) {
  const col = findColumn(boardId, colId)
  if (!col) return
  col.items[itemIndex] = text
  notify()
}

export function finishItem(boardId: string, colId: string, itemIndex: number) {
  const col = findColumn(boardId, colId)
  if (!col) return
  if (col.done < itemIndex) {
    moveItem(boardId, colId, colId, itemIndex, col.done - 1)
    col.done++
  } else {
    notify()
  }
}

export function deleteItem(boardId: string, colId: string, itemIndex: number) {
  const col = findColumn(boardId, colId)
  if (!col) return
  if (col.done > itemIndex) col.done--
  col.items.splice(itemIndex, 1)
  notify()
}
