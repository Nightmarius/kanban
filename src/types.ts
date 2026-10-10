export interface BoardItem {
  id: string
  text: string
}

export interface Column {
  id: string
  name: string
  items: BoardItem[]
}

export interface Board {
  id: string
  name: string
  columns: Column[]
}

export interface KanbanData {
  boards: Board[]
}
