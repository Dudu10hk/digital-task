// Task management types

export type BoardColumn = "todo" | "in-progress" | "done" | "pm-review" | "qa-review" | "done-done"
export type TaskStatus = "todo" | "in-progress" | "done" | "on-hold" | "qa" | "canceled"
export type TaskPriority = "high" | "medium" | "low"
export type NotificationType = "mention" | "assignment" | "comment"

export type UserRole = "admin" | "user"

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: UserRole
}

export interface Notification {
  id: string
  type: NotificationType
  taskId: string
  taskTitle: string
  fromUserId: string
  fromUserName: string
  toUserId: string
  message: string
  createdAt: Date
  read: boolean
}

export interface TaskFile {
  id: string
  name: string
  type: "pdf" | "excel" | "word" | "other"
  url: string
  uploadedAt: Date
  uploadedBy: string
}

export interface TaskComment {
  id: string
  content: string
  authorId: string
  authorName: string
  createdAt: Date
  taggedUserIds?: string[]
}

export interface TaskHistoryEntry {
  id: string
  action: string
  field?: string
  oldValue?: string
  newValue?: string
  userId: string
  userName: string
  timestamp: Date
}

export interface Task {
  id: string
  title: string
  description: string
  column: BoardColumn
  status: TaskStatus
  priority: TaskPriority
  dueDate: Date | null
  assigneeId: string | null
  assigneeName: string | null
  assigneeAvatar?: string | null
  taggedUserIds: string[]
  figmaLink?: string
  files: TaskFile[]
  comments: TaskComment[]
  history: TaskHistoryEntry[]
  createdAt: Date
  createdBy: string
  updatedAt: Date
  order: number
}
