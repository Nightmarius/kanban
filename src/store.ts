import defaultData from './appData.json' with { type: 'json' }
import type { KanbanData, BoardType, ColumnType } from './types'

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

export function getActiveState(): KanbanData {
  return state
}

export function exportAsJSON(): string {
  return JSON.stringify(state, null, 2)
}

export function addBoard(board?: BoardType) {
  state.boards.push(
    board ?? {
      name: 'Untitled',
      columns: [],
    },
  )
  notify()
}

export function updateColumns(columns: ColumnType[], boardIndex: number) {
  state.boards[boardIndex].columns = columns
  notify()
}

export function deleteBoard(boardIndex: number): number | null {
  state.boards.splice(boardIndex, 1)
  let nextBoardIndex: number | null = null
  if (boardIndex > 0) {
    nextBoardIndex = boardIndex - 1
  } else if (state.boards.length > 0) {
    nextBoardIndex = 0
  }
  notify()
  return nextBoardIndex
}

export function renameBoard(boardIndex: number, name: string) {
  const board = state.boards[boardIndex]
  if (!board) return
  board.name = name
  notify()
}

export function addColumn(boardIndex: number) {
  const board = state.boards[boardIndex]
  if (!board) return
  board.columns.push({
    name: '',
    done: 0,
    items: [],
  })
  notify()
}

export function renameColumn(boardIndex: number, colIndex: number, name: string) {
  const board = state.boards[boardIndex]
  if (!board) return
  const col = board.columns[colIndex]
  if (col) col.name = name
  notify()
}

export function deleteColumn(boardIndex: number, colIndex: number) {
  const board = state.boards[boardIndex]
  if (!board) return
  board.columns.splice(colIndex, 1)
  notify()
}

export function moveItem(boardIndex: number, fromColIndex: number, toColIndex: number, fromItemIndex: number, toItemIndex: number) {
  const board = state.boards[boardIndex]
  const src = board.columns[fromColIndex]
  const dst = board.columns[toColIndex]
  if (!src || !dst || dst.done > toItemIndex) return
  if (fromColIndex === toColIndex && fromItemIndex < toItemIndex) toItemIndex--
  const item = src.items[fromItemIndex]
  src.items.splice(fromItemIndex, 1)
  dst.items.splice(toItemIndex, 0, item)
  notify()
}

export function addItem(boardIndex: number, colIndex: number) {
  const board = state.boards[boardIndex]
  if (!board || !board.columns[colIndex]) return
  board.columns[colIndex].items.push('')
  notify()
}

export function updateItem(boardIndex: number, colIndex: number, itemIndex: number, text: string) {
  const board = state.boards[boardIndex]
  if (!board || !board.columns[colIndex]) return
  board.columns[colIndex].items[itemIndex] = text
  notify()
}

export function finishItem(boardIndex: number, colIndex: number, itemIndex: number) {
  const board = state.boards[boardIndex]
  if (!board || !board.columns[colIndex]) return
  const col = board.columns[colIndex]
  if (col.done < itemIndex) {
    moveItem(boardIndex, colIndex, colIndex, itemIndex, col.done)
  }
  col.done++
  notify()
}

export function deleteItem(boardIndex: number, colIndex: number, itemIndex: number) {
  const board = state.boards[boardIndex]
  if (!board || !board.columns[colIndex]) return
  const col = board.columns[colIndex]
  if (col.done > itemIndex) col.done--
  col.items.splice(itemIndex, 1)
  notify()
}
