"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { Task, User, TaskStatus, BoardColumn, TaskComment, TaskHistoryEntry, Notification, InProgressStation, StickyNote, ArchivedTask } from "./types"
import { mockTasks, mockUsers } from "./mock-data"

interface TaskContextType {
  tasks: Task[]
  users: User[]
  currentUser: User | null
  notifications: Notification[]
  unreadNotificationsCount: number
  archivedTasks: ArchivedTask[]
  stickyNotes: StickyNote[]
  login: (email: string, password: string) => boolean
  logout: () => void
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt" | "history" | "comments" | "order"> & { files?: Task["files"] }) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  addComment: (taskId: string, content: string, taggedUserIds?: string[]) => void
  updateTaskStatus: (taskId: string, status: TaskStatus) => void
  updateTaskColumn: (taskId: string, column: BoardColumn) => void
  updateInProgressStation: (taskId: string, station: InProgressStation, note?: string) => void
  updateHandler: (taskId: string, handlerId: string | null) => void
  getUserById: (id: string) => User | undefined
  markNotificationAsRead: (notificationId: string) => void
  markAllNotificationsAsRead: () => void
  canEditTask: (task: Task) => boolean
  isAdmin: () => boolean
  updateUserRole: (userId: string, role: "admin" | "user") => void
  reorderTaskInColumn: (taskId: string, newOrder: number, column: BoardColumn) => void
  addUser: (user: Omit<User, "id">) => void
  deleteUser: (userId: string) => boolean
  editUser: (userId: string, updates: Partial<Omit<User, "id">>) => boolean
  archiveTask: (taskId: string, reason: "completed" | "deleted") => void
  restoreTask: (taskId: string) => void
  addStickyNote: (content: string, color: StickyNote["color"]) => void
  updateStickyNote: (noteId: string, content: string) => void
  deleteStickyNote: (noteId: string) => void
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [archivedTasks, setArchivedTasks] = useState<ArchivedTask[]>([])
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([])

  const unreadNotificationsCount = notifications.filter((n) => !n.read && n.toUserId === currentUser?.id).length

  const login = (email: string, password: string): boolean => {
    const user = users.find((u) => u.email === email)
    if (user && user.password === password) {
      setCurrentUser(user)
      return true
    }
    return false
  }

  const logout = () => {
    setCurrentUser(null)
  }

  const getUserById = (id: string): User | undefined => {
    return users.find((u) => u.id === id)
  }

  const isAdmin = (): boolean => {
    return currentUser?.role === "admin"
  }

  const canEditTask = (task: Task): boolean => {
    if (!currentUser) return false
    if (currentUser.role === "admin") return true
    if (task.assigneeId === currentUser.id) return true
    if (task.handlerId === currentUser.id) return true
    if (task.taggedUserIds.includes(currentUser.id)) return true
    if (task.createdBy === currentUser.id) return true
    return false
  }

  const updateUserRole = (userId: string, role: "admin" | "user") => {
    setUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, role } : user))
    )
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, role } : null))
    }
  }

  const addUser = (userData: Omit<User, "id">) => {
    if (!currentUser || currentUser.role !== "admin") return

    const newUser: User = {
      ...userData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }

    setUsers((prev) => [...prev, newUser])
  }

  const deleteUser = (userId: string): boolean => {
    if (!currentUser || currentUser.role !== "admin") return false
    
    // Prevent deleting yourself
    if (userId === currentUser.id) return false

    // Check if user is assigned to any active tasks
    const hasActiveTasks = tasks.some(
      (task) => 
        (task.assigneeId === userId || task.handlerId === userId) &&
        task.column !== "done"
    )

    if (hasActiveTasks) {
      return false
    }

    // Remove user from users array
    setUsers((prev) => prev.filter((user) => user.id !== userId))
    
    return true
  }

  const editUser = (userId: string, updates: Partial<Omit<User, "id">>): boolean => {
    if (!currentUser || currentUser.role !== "admin") return false

    // Check if email is being changed and if it already exists
    if (updates.email) {
      const emailExists = users.some((u) => u.email === updates.email && u.id !== userId)
      if (emailExists) {
        return false
      }
    }

    setUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, ...updates } : user))
    )

    // Update current user if editing self
    if (currentUser.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, ...updates } : null))
    }

    return true
  }

  const createNotification = (
    type: "mention" | "assignment" | "comment" | "handler",
    taskId: string,
    taskTitle: string,
    toUserId: string,
    message: string,
  ) => {
    if (!currentUser || toUserId === currentUser.id) return

    const newNotification: Notification = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      taskId,
      taskTitle,
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      toUserId,
      message,
      createdAt: new Date(),
      read: false,
    }
    setNotifications((prev) => [newNotification, ...prev])
  }

  const addTask = (taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "history" | "comments" | "order"> & { files?: Task["files"] }) => {
    if (!currentUser) return

    // Calculate order for the new task in its column
    const tasksInColumn = tasks.filter(t => t.column === taskData.column)
    const maxOrder = tasksInColumn.length > 0 ? Math.max(...tasksInColumn.map(t => t.order)) : 0

    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      taggedUserIds: taskData.taggedUserIds || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      files: taskData.files || [],
      comments: [],
      order: maxOrder + 1,
      history: [
        {
          id: Date.now().toString(),
          action: "created",
          userId: currentUser.id,
          userName: currentUser.name,
          timestamp: new Date(),
        },
      ],
    }
    setTasks((prev) => [...prev, newTask])

    if (taskData.assigneeId && taskData.assigneeId !== currentUser.id) {
      createNotification(
        "assignment",
        newTask.id,
        newTask.title,
        taskData.assigneeId,
        `${currentUser.name} שייך/ה אליך את המשימה "${newTask.title}"`,
      )
    }

    if (taskData.handlerId && taskData.handlerId !== currentUser.id && taskData.handlerId !== taskData.assigneeId) {
      createNotification(
        "handler",
        newTask.id,
        newTask.title,
        taskData.handlerId,
        `${currentUser.name} הקצה אותך כגורם מטפל למשימה "${newTask.title}"`,
      )
    }
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    if (!currentUser) return

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task

        const historyEntries: TaskHistoryEntry[] = []

        Object.keys(updates).forEach((key) => {
          if (key !== "history" && key !== "updatedAt") {
            const oldValue = String((task as Record<string, unknown>)[key] || "")
            const newValue = String((updates as Record<string, unknown>)[key] || "")
            if (oldValue !== newValue) {
              historyEntries.push({
                id: Date.now().toString() + key,
                action: "updated",
                field: key,
                oldValue,
                newValue,
                userId: currentUser.id,
                userName: currentUser.name,
                timestamp: new Date(),
              })
            }
          }
        })

        if (updates.assigneeId && updates.assigneeId !== task.assigneeId && updates.assigneeId !== currentUser.id) {
          createNotification(
            "assignment",
            task.id,
            task.title,
            updates.assigneeId,
            `${currentUser.name} שייך/ה אליך את המשימה "${task.title}"`,
          )
        }

        if (updates.handlerId && updates.handlerId !== task.handlerId && updates.handlerId !== currentUser.id) {
          createNotification(
            "handler",
            task.id,
            task.title,
            updates.handlerId,
            `${currentUser.name} הקצה אותך כגורם מטפל למשימה "${task.title}"`,
          )
        }

        return {
          ...task,
          ...updates,
          updatedAt: new Date(),
          history: [...task.history, ...historyEntries],
        }
      }),
    )
  }

  const archiveTask = (taskId: string, reason: "completed" | "deleted") => {
    if (!currentUser) return

    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const archivedTask: ArchivedTask = {
      ...task,
      archivedAt: new Date(),
      archivedBy: currentUser.id,
      archiveReason: reason,
    }

    setArchivedTasks((prev) => [archivedTask, ...prev])
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
  }

  const restoreTask = (taskId: string) => {
    const archivedTask = archivedTasks.find((t) => t.id === taskId)
    if (!archivedTask) return

    const { archivedAt, archivedBy, archiveReason, ...taskData } = archivedTask
    
    // Restore to original column or todo
    const restoredTask: Task = {
      ...taskData,
      column: archiveReason === "deleted" ? "todo" : taskData.column,
      updatedAt: new Date(),
    }

    setTasks((prev) => [...prev, restoredTask])
    setArchivedTasks((prev) => prev.filter((t) => t.id !== taskId))
  }

  const deleteTask = (id: string) => {
    archiveTask(id, "deleted")
  }

  const addStickyNote = (content: string, color: StickyNote["color"]) => {
    if (!currentUser) return

    const newNote: StickyNote = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      content,
      color,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setStickyNotes((prev) => [newNote, ...prev])
  }

  const updateStickyNote = (noteId: string, content: string) => {
    setStickyNotes((prev) =>
      prev.map((note) =>
        note.id === noteId
          ? { ...note, content, updatedAt: new Date() }
          : note
      )
    )
  }

  const deleteStickyNote = (noteId: string) => {
    setStickyNotes((prev) => prev.filter((note) => note.id !== noteId))
  }

  const addComment = (taskId: string, content: string, taggedUserIds?: string[]) => {
    if (!currentUser) return

    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const newComment: TaskComment = {
      id: Date.now().toString(),
      content,
      authorId: currentUser.id,
      authorName: currentUser.name,
      createdAt: new Date(),
      taggedUserIds,
    }

    if (taggedUserIds && taggedUserIds.length > 0) {
      taggedUserIds.forEach((userId) => {
        if (userId !== currentUser.id) {
          createNotification(
            "mention",
            taskId,
            task.title,
            userId,
            `${currentUser.name} תייג/ה אותך בהערה במשימה "${task.title}"`,
          )
        }
      })
    }

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t
        return {
          ...t,
          comments: [...t.comments, newComment],
          history: [
            ...t.history,
            {
              id: Date.now().toString(),
              action: "comment_added",
              userId: currentUser.id,
              userName: currentUser.name,
              timestamp: new Date(),
            },
          ],
        }
      }),
    )
  }

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    updateTask(taskId, { status })
  }

  const updateTaskColumn = (taskId: string, column: BoardColumn) => {
    // Get max order in target column and set new task to end
    const tasksInColumn = tasks.filter(t => t.column === column)
    const maxOrder = tasksInColumn.length > 0 ? Math.max(...tasksInColumn.map(t => t.order)) : 0
    updateTask(taskId, { column, order: maxOrder + 1 })
    
    // Auto-archive when moved to done
    if (column === "done") {
      // Use setTimeout to allow updateTask to complete first
      setTimeout(() => archiveTask(taskId, "completed"), 100)
    }
  }

  const reorderTaskInColumn = (taskId: string, newOrder: number, column: BoardColumn) => {
    if (!currentUser) return
    
    // Only admins can reorder in "in-progress" column
    if (column === "in-progress" && currentUser.role !== "admin") return

    const task = tasks.find(t => t.id === taskId)
    if (!task || task.column !== column) return

    const oldOrder = task.order
    if (oldOrder === newOrder) return

    setTasks(prev => {
      return prev.map(t => {
        if (t.column !== column) return t
        
        if (t.id === taskId) {
          return { ...t, order: newOrder, updatedAt: new Date() }
        }
        
        // Shift other tasks
        if (oldOrder < newOrder) {
          // Moving down: shift tasks between old and new position up
          if (t.order > oldOrder && t.order <= newOrder) {
            return { ...t, order: t.order - 1 }
          }
        } else {
          // Moving up: shift tasks between new and old position down
          if (t.order >= newOrder && t.order < oldOrder) {
            return { ...t, order: t.order + 1 }
          }
        }
        
        return t
      })
    })
  }

  const updateInProgressStation = (taskId: string, station: InProgressStation, note?: string) => {
    if (!currentUser) return
    
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const oldStation = task.inProgressStation

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t

        const historyEntry: TaskHistoryEntry = {
          id: Date.now().toString() + "station",
          action: "station_changed",
          field: "inProgressStation",
          stationFrom: oldStation,
          stationTo: station,
          userId: currentUser.id,
          userName: currentUser.name,
          timestamp: new Date(),
        }

        return {
          ...t,
          inProgressStation: station,
          stationNote: note || t.stationNote,
          updatedAt: new Date(),
          history: [...t.history, historyEntry],
        }
      })
    )
  }

  const updateHandler = (taskId: string, handlerId: string | null) => {
    if (!currentUser) return
    
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const handler = handlerId ? users.find((u) => u.id === handlerId) : null
    const oldHandlerName = task.handlerName

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t

        const historyEntry: TaskHistoryEntry = {
          id: Date.now().toString() + "handler",
          action: "handler_changed",
          field: "handlerId",
          oldValue: oldHandlerName || "",
          newValue: handler?.name || "",
          userId: currentUser.id,
          userName: currentUser.name,
          timestamp: new Date(),
        }

        return {
          ...t,
          handlerId,
          handlerName: handler?.name || null,
          handlerAvatar: handler?.avatar || null,
          updatedAt: new Date(),
          history: [...t.history, historyEntry],
        }
      })
    )

    // Send notification to new handler
    if (handlerId && handlerId !== currentUser.id) {
      createNotification(
        "handler",
        task.id,
        task.title,
        handlerId,
        `${currentUser.name} הקצה אותך כגורם מטפל למשימה "${task.title}"`,
      )
    }
  }

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
  }

  const markAllNotificationsAsRead = () => {
    if (!currentUser) return
    setNotifications((prev) => prev.map((n) => (n.toUserId === currentUser.id ? { ...n, read: true } : n)))
  }

  return (
    <TaskContext.Provider
      value={{
        tasks,
        users,
        currentUser,
        notifications,
        unreadNotificationsCount,
        archivedTasks,
        stickyNotes,
        login,
        logout,
        addTask,
        updateTask,
        deleteTask,
        addComment,
        updateTaskStatus,
        updateTaskColumn,
        updateInProgressStation,
        updateHandler,
        getUserById,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        canEditTask,
        isAdmin,
        updateUserRole,
        reorderTaskInColumn,
        addUser,
        deleteUser,
        editUser,
        archiveTask,
        restoreTask,
        addStickyNote,
        updateStickyNote,
        deleteStickyNote,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTaskContext() {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error("useTaskContext must be used within TaskProvider")
  }
  return context
}
