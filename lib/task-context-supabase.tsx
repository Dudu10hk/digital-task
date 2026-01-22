"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "./supabase"
import type { Task, User, TaskStatus, BoardColumn, TaskComment, TaskHistoryEntry, Notification, InProgressStation, StickyNote, ArchivedTask } from "./types"
import { mockTasks } from "./mock-data"

interface TaskContextType {
  tasks: Task[]
  users: User[]
  currentUser: User | null
  notifications: Notification[]
  unreadNotificationsCount: number
  archivedTasks: ArchivedTask[]
  stickyNotes: StickyNote[]
  loading: boolean
  login: (email: string, password: string) => Promise<boolean>
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
  addUser: (user: Omit<User, "id">) => Promise<void>
  deleteUser: (userId: string) => Promise<boolean>
  editUser: (userId: string, updates: Partial<Omit<User, "id">>) => Promise<boolean>
  archiveTask: (taskId: string, reason: "completed" | "deleted") => void
  restoreTask: (taskId: string) => void
  addStickyNote: (content: string, color: StickyNote["color"]) => void
  updateStickyNote: (noteId: string, content: string) => void
  deleteStickyNote: (noteId: string) => void
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(mockTasks)
  const [users, setUsers] = useState<User[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [archivedTasks, setArchivedTasks] = useState<ArchivedTask[]>([])
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([])
  const [loading, setLoading] = useState(true)

  // Load users from Supabase on mount
  useEffect(() => {
    loadUsers()
  }, [])

  async function loadUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: true })
      
      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const unreadNotificationsCount = notifications.filter(
    (n) => !n.read && n.toUserId === currentUser?.id
  ).length

  const login = async (email: string, password: string): Promise<boolean> => {
    const user = users.find((u) => u.email === email && u.password === password)
    if (user) {
      setCurrentUser(user)
      return true
    }
    return false
  }

  const logout = () => {
    setCurrentUser(null)
  }

  const addUser = async (userData: Omit<User, "id">) => {
    try {
      const newUser = {
        id: Date.now().toString(),
        ...userData
      }

      const { error } = await supabase
        .from('users')
        .insert([newUser])

      if (error) throw error

      setUsers((prev) => [...prev, newUser])
    } catch (error) {
      console.error('Error adding user:', error)
      throw error
    }
  }

  const deleteUser = async (userId: string): Promise<boolean> => {
    if (userId === currentUser?.id) {
      return false
    }

    const hasActiveTasks = tasks.some(
      (task) => task.assigneeId === userId || task.handlerId === userId
    )
    if (hasActiveTasks) {
      return false
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) throw error

      setUsers((prev) => prev.filter((user) => user.id !== userId))
      return true
    } catch (error) {
      console.error('Error deleting user:', error)
      return false
    }
  }

  const editUser = async (userId: string, updates: Partial<Omit<User, "id">>): Promise<boolean> => {
    if (updates.email) {
      const emailExists = users.some((u) => u.id !== userId && u.email === updates.email)
      if (emailExists) {
        return false
      }
    }

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)

      if (error) throw error

      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, ...updates } : user))
      )
      
      if (currentUser?.id === userId) {
        setCurrentUser((prev) => prev ? { ...prev, ...updates } : null)
      }

      return true
    } catch (error) {
      console.error('Error editing user:', error)
      return false
    }
  }

  const getUserById = (id: string) => users.find((user) => user.id === id)

  const canEditTask = (task: Task) => {
    if (!currentUser) return false
    if (currentUser.role === "admin") return true
    return task.assigneeId === currentUser.id || task.taggedUserIds.includes(currentUser.id)
  }

  const isAdmin = () => currentUser?.role === "admin"

  const updateUserRole = (userId: string, role: "admin" | "user") => {
    setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role } : user)))
  }

  // Placeholder functions - להמשך
  const addTask = () => {}
  const updateTask = () => {}
  const deleteTask = () => {}
  const addComment = () => {}
  const updateTaskStatus = () => {}
  const updateTaskColumn = () => {}
  const updateInProgressStation = () => {}
  const updateHandler = () => {}
  const markNotificationAsRead = () => {}
  const markAllNotificationsAsRead = () => {}
  const reorderTaskInColumn = () => {}
  const archiveTask = () => {}
  const restoreTask = () => {}
  const addStickyNote = () => {}
  const updateStickyNote = () => {}
  const deleteStickyNote = () => {}

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
        loading,
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
