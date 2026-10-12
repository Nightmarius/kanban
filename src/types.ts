export interface Column {
  id: string
  name: string
  done: number
  items: string[]
}

export interface Board {
  id: string
  name: string
  columns: Column[]
}

export interface KanbanData {
  boards: Board[]
}
