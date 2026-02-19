import { supabase, isSupabaseConfigured } from "./supabase"
import { mockTasks } from "./mock-data"
import type { Task, Notification, StickyNote, ArchivedTask } from "./types"

// Simple JSONB approach - store entire objects

export async function saveTasks(tasks: Task[]): Promise<boolean> {
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase not configured - running in demo mode. Data will not be saved.')
    return true // Return success in demo mode
  }
  
  try {
    // Upsert all current tasks first (safer than delete-all then insert).
    const rows = tasks.map(task => ({ id: task.id, data: task }))
    if (rows.length > 0) {
      const { error: upsertError } = await supabase
        .from('tasks')
        .upsert(rows, { onConflict: 'id' })
      if (upsertError) throw upsertError
    }

    // Then delete rows that no longer exist in local state.
    // This avoids data loss windows during concurrent saves.
    const { data: existingRows, error: existingError } = await supabase
      .from('tasks')
      .select('id')
    if (existingError) throw existingError

    const currentIds = new Set(tasks.map(task => task.id))
    const idsToDelete = (existingRows || [])
      .map(row => row.id as string)
      .filter(id => !currentIds.has(id))

    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .in('id', idsToDelete)
      if (deleteError) throw deleteError
    }

    return true
  } catch (error) {
    console.error('Error saving tasks:', error)
    return false
  }
}

export async function loadTasks(): Promise<Task[]> {
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase not configured - loading demo data')
    return mockTasks
  }
  
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('data')
      .order('created_at', { ascending: true })
    
    if (error) throw error
    
    // המר תאריכים מ-string ל-Date objects
    return (data || []).map(row => {
      const task = row.data as Task
      return {
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        planningReceivedAt: task.planningReceivedAt 
          ? new Date(task.planningReceivedAt) 
          : (task.isPlanning ? new Date(task.createdAt) : undefined),
        comments: task.comments.map(c => ({
          ...c,
          createdAt: new Date(c.createdAt)
        })),
        history: task.history.map(h => ({
          ...h,
          timestamp: new Date(h.timestamp)
        })),
        files: task.files.map(f => ({
          ...f,
          uploadedAt: new Date(f.uploadedAt)
        }))
      }
    })
  } catch (error) {
    console.error('Error loading tasks:', error)
    return []
  }
}

export async function saveNotifications(notifications: Notification[], userId: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase not configured - running in demo mode')
    return true
  }
  
  try {
    // Delete user's existing notifications
    await supabase.from('notifications').delete().eq('data->>toUserId', userId)
    
    // Insert user's notifications
    const rows = notifications
      .filter(n => n.toUserId === userId)
      .map(n => ({ id: n.id, data: n }))
    
    if (rows.length > 0) {
      const { error } = await supabase.from('notifications').insert(rows)
      if (error) throw error
    }
    
    return true
  } catch (error) {
    console.error('Error saving notifications:', error)
    return false
  }
}

export async function loadNotifications(userId: string): Promise<Notification[]> {
  if (!isSupabaseConfigured) {
    return [] // Empty notifications in demo mode
  }
  
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('data')
      .eq('data->>toUserId', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    // המר תאריכים מ-string ל-Date objects
    return (data || []).map(row => {
      const notification = row.data as Notification
      return {
        ...notification,
        createdAt: new Date(notification.createdAt)
      }
    })
  } catch (error) {
    console.error('Error loading notifications:', error)
    return []
  }
}

export async function saveStickyNotes(notes: StickyNote[], userId: string): Promise<boolean> {
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase not configured - running in demo mode')
    return true
  }
  
  try {
    // Delete user's existing notes
    await supabase.from('sticky_notes').delete().eq('data->>userId', userId)
    
    // Insert user's notes
    const rows = notes
      .filter(n => n.userId === userId)
      .map(n => ({ id: n.id, data: n }))
    
    if (rows.length > 0) {
      const { error } = await supabase.from('sticky_notes').insert(rows)
      if (error) throw error
    }
    
    return true
  } catch (error) {
    console.error('Error saving sticky notes:', error)
    return false
  }
}

export async function loadStickyNotes(userId: string): Promise<StickyNote[]> {
  if (!isSupabaseConfigured) {
    return [] // Empty sticky notes in demo mode
  }
  
  try {
    const { data, error } = await supabase
      .from('sticky_notes')
      .select('data')
      .eq('data->>userId', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    // המר תאריכים מ-string ל-Date objects
    return (data || []).map(row => {
      const note = row.data as StickyNote
      return {
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt)
      }
    })
  } catch (error) {
    console.error('Error loading sticky notes:', error)
    return []
  }
}

export async function saveArchivedTasks(tasks: ArchivedTask[]): Promise<boolean> {
  if (!isSupabaseConfigured) {
    console.warn('⚠️ Supabase not configured - running in demo mode')
    return true
  }
  
  try {
    // Delete all existing
    await supabase.from('archived_tasks').delete().neq('id', '')
    
    // Insert all
    const rows = tasks.map(task => ({ id: task.id, data: task }))
    if (rows.length > 0) {
      const { error } = await supabase.from('archived_tasks').insert(rows)
      if (error) throw error
    }
    
    return true
  } catch (error) {
    console.error('Error saving archived tasks:', error)
    return false
  }
}

export async function loadArchivedTasks(): Promise<ArchivedTask[]> {
  if (!isSupabaseConfigured) {
    return [] // Empty archived tasks in demo mode
  }
  
  try {
    const { data, error } = await supabase
      .from('archived_tasks')
      .select('data')
      .order('archived_at', { ascending: false })
    
    if (error) throw error
    
    // המר תאריכים מ-string ל-Date objects
    return (data || []).map(row => {
      const task = row.data as ArchivedTask
      return {
        ...task,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        archivedAt: new Date(task.archivedAt),
        comments: task.comments.map(c => ({
          ...c,
          createdAt: new Date(c.createdAt)
        })),
        history: task.history.map(h => ({
          ...h,
          timestamp: new Date(h.timestamp)
        })),
        files: task.files.map(f => ({
          ...f,
          uploadedAt: new Date(f.uploadedAt)
        }))
      }
    })
  } catch (error) {
    console.error('Error loading archived tasks:', error)
    return []
  }
}
