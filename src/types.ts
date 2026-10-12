export interface Column {
  id: string
  name: string
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
