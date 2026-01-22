// Task management types

export type BoardColumn = "todo" | "in-progress" | "done"
export type TaskStatus = "todo" | "in-progress" | "done" | "on-hold" | "qa" | "canceled"
export type TaskPriority = "high" | "medium" | "low"
export type NotificationType = "mention" | "assignment" | "comment" | "handler"

export type InProgressStation = 
  | "design"          // בעיצוב
  | "development"     // בפיתוח
  | "testing"         // בבדיקות
  | "feasibility"     // בבחינת יישימות
  | "business-review" // בבחינה מול החטיבה העסקית
  | "ux-requirements" // בהגדרת דרישה ב-UX

export type UserRole = "admin" | "user" | "viewer"

export interface User {
  id: string
  name: string
  email: string
  password: string
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
  stationFrom?: InProgressStation
  stationTo?: InProgressStation
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
  handlerId: string | null
  handlerName: string | null
  handlerAvatar?: string | null
  inProgressStation?: InProgressStation
  stationNote?: string
  taggedUserIds: string[]
  figmaLink?: string
  processSpecLink?: string
  files: TaskFile[]
  comments: TaskComment[]
  history: TaskHistoryEntry[]
  createdAt: Date
  createdBy: string
  updatedAt: Date
  order: number
}

export interface StickyNote {
  id: string
  userId: string
  content: string
  color: "yellow" | "blue" | "green" | "pink" | "purple"
  createdAt: Date
  updatedAt: Date
}

export interface ArchivedTask extends Task {
  archivedAt: Date
  archivedBy: string
  archiveReason: "completed" | "deleted"
}
