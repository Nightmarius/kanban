export interface Column {
  name: string
  done: number
  items: string[]
}

export interface Board {
  name: string
  columns: Column[]
}

export interface KanbanData {
  boards: Board[]
}
