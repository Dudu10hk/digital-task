import { supabase } from "./supabase"
import type { Task, Notification, StickyNote, ArchivedTask } from "./types"

// ====== TASKS ======

export async function fetchTasks(): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        task_files (*)
task_comments (*),
        task_history (*)
      `)
      .order('task_order', { ascending: true })

    if (error) throw error
    
    // Transform from snake_case to camelCase
    return (data || []).map(transformTaskFromDB)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return []
  }
}

export async function createTask(task: Task): Promise<boolean> {
  try {
    const dbTask = transformTaskToDB(task)
    const { error } = await supabase.from('tasks').insert([dbTask])
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error creating task:', error)
    return false
  }
}

export async function updateTask(taskId: string, updates: Partial<Task>): Promise<boolean> {
  try {
    const dbUpdates = transformTaskToDB(updates as Task)
    const { error } = await supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', taskId)
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating task:', error)
    return false
  }
}

export async function deleteTask(taskId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting task:', error)
    return false
  }
}

// ====== NOTIFICATIONS ======

export async function fetchNotifications(userId: string): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('to_user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(transformNotificationFromDB)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

export async function createNotification(notification: Notification): Promise<boolean> {
  try {
    const dbNotification = transformNotificationToDB(notification)
    const { error } = await supabase.from('notifications').insert([dbNotification])
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error creating notification:', error)
    return false
  }
}

export async function markNotificationRead(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return false
  }
}

// ====== STICKY NOTES ======

export async function fetchStickyNotes(userId: string): Promise<StickyNote[]> {
  try {
    const { data, error } = await supabase
      .from('sticky_notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(transformStickyNoteFromDB)
  } catch (error) {
    console.error('Error fetching sticky notes:', error)
    return []
  }
}

export async function createStickyNote(note: StickyNote): Promise<boolean> {
  try {
    const dbNote = transformStickyNoteToDB(note)
    const { error } = await supabase.from('sticky_notes').insert([dbNote])
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error creating sticky note:', error)
    return false
  }
}

export async function updateStickyNote(noteId: string, content: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('sticky_notes')
      .update({ content })
      .eq('id', noteId)
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error updating sticky note:', error)
    return false
  }
}

export async function deleteStickyNote(noteId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('sticky_notes')
      .delete()
      .eq('id', noteId)
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting sticky note:', error)
    return false
  }
}

// ====== ARCHIVED TASKS ======

export async function fetchArchivedTasks(): Promise<ArchivedTask[]> {
  try {
    const { data, error } = await supabase
      .from('archived_tasks')
      .select('*')
      .order('archived_at', { ascending: false })

    if (error) throw error
    return (data || []).map(transformArchivedTaskFromDB)
  } catch (error) {
    console.error('Error fetching archived tasks:', error)
    return []
  }
}

export async function archiveTask(task: ArchivedTask): Promise<boolean> {
  try {
    const dbTask = transformArchivedTaskToDB(task)
    const { error } = await supabase.from('archived_tasks').insert([dbTask])
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error archiving task:', error)
    return false
  }
}

// ====== TRANSFORM FUNCTIONS ======

function transformTaskFromDB(dbTask: any): Task {
  // TODO: Implement full transformation
  return dbTask as Task
}

function transformTaskToDB(task: Partial<Task>): any {
  // TODO: Implement full transformation
  return {
    ...task,
    board_column: task.column,
    task_order: task.order,
    assignee_id: task.assigneeId,
    assignee_name: task.assigneeName,
    assignee_avatar: task.assigneeAvatar,
    handler_id: task.handlerId,
    handler_name: task.handlerName,
    handler_avatar: task.handlerAvatar,
    in_progress_station: task.inProgressStation,
    station_note: task.stationNote,
    tagged_user_ids: task.taggedUserIds,
    figma_link: task.figmaLink,
    process_spec_link: task.processSpecLink,
    created_by: task.createdBy,
    due_date: task.dueDate,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
  }
}

function transformNotificationFromDB(dbNotification: any): Notification {
  return {
    id: dbNotification.id,
    type: dbNotification.notification_type,
    taskId: dbNotification.task_id,
    taskTitle: dbNotification.task_title,
    fromUserId: dbNotification.from_user_id,
    fromUserName: dbNotification.from_user_name,
    toUserId: dbNotification.to_user_id,
    message: dbNotification.message,
    read: dbNotification.is_read,
    createdAt: new Date(dbNotification.created_at),
  }
}

function transformNotificationToDB(notification: Notification): any {
  return {
    id: notification.id,
    notification_type: notification.type,
    task_id: notification.taskId,
    task_title: notification.taskTitle,
    from_user_id: notification.fromUserId,
    from_user_name: notification.fromUserName,
    to_user_id: notification.toUserId,
    message: notification.message,
    is_read: notification.read,
    created_at: notification.createdAt,
  }
}

function transformStickyNoteFromDB(dbNote: any): StickyNote {
  return {
    id: dbNote.id,
    userId: dbNote.user_id,
    content: dbNote.content,
    color: dbNote.color,
    createdAt: new Date(dbNote.created_at),
    updatedAt: new Date(dbNote.updated_at),
  }
}

function transformStickyNoteToDB(note: StickyNote): any {
  return {
    id: note.id,
    user_id: note.userId,
    content: note.content,
    color: note.color,
    created_at: note.createdAt,
    updated_at: note.updatedAt,
  }
}

function transformArchivedTaskFromDB(dbTask: any): ArchivedTask {
  // TODO: Implement full transformation
  return dbTask as ArchivedTask
}

function transformArchivedTaskToDB(task: ArchivedTask): any {
  // TODO: Implement full transformation
  return task
}
