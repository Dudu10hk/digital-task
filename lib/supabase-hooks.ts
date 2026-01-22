import { supabase } from './supabase'
import type { User, Task, Notification, StickyNote, ArchivedTask } from './types'

// Users
export async function fetchUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data || []
}

export async function createUser(user: Omit<User, 'id'>): Promise<User> {
  const newUser = {
    id: Date.now().toString(),
    ...user
  }
  
  const { data, error } = await supabase
    .from('users')
    .insert([newUser])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateUser(id: string, updates: Partial<Omit<User, 'id'>>): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteUser(id: string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Tasks
export async function fetchTasks(): Promise<Task[]> {
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*')
    .order('task_order', { ascending: true })
  
  if (tasksError) throw tasksError

  // Fetch related data for each task
  const tasksWithRelations = await Promise.all(
    (tasks || []).map(async (task) => {
      const [comments, files, history] = await Promise.all([
        fetchTaskComments(task.id),
        fetchTaskFiles(task.id),
        fetchTaskHistory(task.id)
      ])

      return {
        ...task,
        column: task.board_column as any,
        order: task.task_order,
        taggedUserIds: task.tagged_user_ids || [],
        inProgressStation: task.in_progress_station,
        stationNote: task.station_note,
        processSpecLink: task.process_spec_link,
        figmaLink: task.figma_link,
        dueDate: task.due_date ? new Date(task.due_date) : null,
        createdAt: new Date(task.created_at),
        updatedAt: new Date(task.updated_at),
        createdBy: task.created_by,
        assigneeId: task.assignee_id,
        assigneeName: task.assignee_name,
        assigneeAvatar: task.assignee_avatar,
        handlerId: task.handler_id,
        handlerName: task.handler_name,
        handlerAvatar: task.handler_avatar,
        comments,
        files,
        history
      } as Task
    })
  )

  return tasksWithRelations
}

async function fetchTaskComments(taskId: string) {
  const { data, error } = await supabase
    .from('task_comments')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return (data || []).map(c => ({
    ...c,
    authorId: c.author_id,
    authorName: c.author_name,
    taggedUserIds: c.tagged_user_ids || [],
    createdAt: new Date(c.created_at)
  }))
}

async function fetchTaskFiles(taskId: string) {
  const { data, error } = await supabase
    .from('task_files')
    .select('*')
    .eq('task_id', taskId)
    .order('uploaded_at', { ascending: true })
  
  if (error) throw error
  return (data || []).map(f => ({
    ...f,
    type: f.file_type as any,
    uploadedAt: new Date(f.uploaded_at),
    uploadedBy: f.uploaded_by
  }))
}

async function fetchTaskHistory(taskId: string) {
  const { data, error } = await supabase
    .from('task_history')
    .select('*')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return (data || []).map(h => ({
    ...h,
    userId: h.user_id,
    userName: h.user_name,
    oldValue: h.old_value,
    newValue: h.new_value,
    stationFrom: h.station_from,
    stationTo: h.station_to,
    timestamp: new Date(h.created_at)
  }))
}

export async function createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'history' | 'comments' | 'order'>) {
  const newTask = {
    id: Date.now().toString(),
    board_column: task.column,
    task_order: task.order || 0,
    tagged_user_ids: task.taggedUserIds || [],
    in_progress_station: task.inProgressStation,
    station_note: task.stationNote,
    process_spec_link: task.processSpecLink,
    figma_link: task.figmaLink,
    due_date: task.dueDate,
    created_by: task.createdBy,
    assignee_id: task.assigneeId,
    assignee_name: task.assigneeName,
    assignee_avatar: task.assigneeAvatar,
    handler_id: task.handlerId,
    handler_name: task.handlerName,
    handler_avatar: task.handlerAvatar,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert([newTask])
    .select()
    .single()
  
  if (error) throw error
  return data.id
}

// Notifications
export async function fetchNotifications(): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return (data || []).map(n => ({
    id: n.id,
    type: n.notification_type as any,
    taskId: n.task_id,
    taskTitle: n.task_title,
    fromUserId: n.from_user_id,
    fromUserName: n.from_user_name,
    toUserId: n.to_user_id,
    message: n.message,
    read: n.is_read,
    createdAt: new Date(n.created_at)
  }))
}

export async function createNotification(notification: Omit<Notification, 'id' | 'createdAt'>) {
  const newNotification = {
    id: Date.now().toString(),
    notification_type: notification.type,
    task_id: notification.taskId,
    task_title: notification.taskTitle,
    from_user_id: notification.fromUserId,
    from_user_name: notification.fromUserName,
    to_user_id: notification.toUserId,
    message: notification.message,
    is_read: notification.read
  }

  const { error } = await supabase
    .from('notifications')
    .insert([newNotification])
  
  if (error) throw error
}

// Sticky Notes
export async function fetchStickyNotes(): Promise<StickyNote[]> {
  const { data, error } = await supabase
    .from('sticky_notes')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return (data || []).map(n => ({
    ...n,
    userId: n.user_id,
    createdAt: new Date(n.created_at),
    updatedAt: new Date(n.updated_at)
  }))
}

export async function createStickyNote(note: Omit<StickyNote, 'id' | 'createdAt' | 'updatedAt'>) {
  const newNote = {
    id: Date.now().toString(),
    user_id: note.userId,
    content: note.content,
    color: note.color
  }

  const { error } = await supabase
    .from('sticky_notes')
    .insert([newNote])
  
  if (error) throw error
}

export async function updateStickyNote(id: string, content: string) {
  const { error } = await supabase
    .from('sticky_notes')
    .update({ content })
    .eq('id', id)
  
  if (error) throw error
}

export async function deleteStickyNote(id: string) {
  const { error } = await supabase
    .from('sticky_notes')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// Archived Tasks
export async function fetchArchivedTasks(): Promise<ArchivedTask[]> {
  const { data, error } = await supabase
    .from('archived_tasks')
    .select('*')
    .order('archived_at', { ascending: false })
  
  if (error) throw error
  return (data || []).map(a => ({
    ...a.task_data,
    archivedAt: new Date(a.archived_at),
    archivedBy: a.archived_by,
    archiveReason: a.archive_reason as any
  }))
}

export async function archiveTask(task: Task, archivedBy: string, reason: 'completed' | 'deleted') {
  const archived = {
    id: task.id,
    task_data: task,
    archived_by: archivedBy,
    archive_reason: reason
  }

  const { error } = await supabase
    .from('archived_tasks')
    .insert([archived])
  
  if (error) throw error
}
