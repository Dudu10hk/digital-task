import { supabase } from "./supabase"
import type { Task, Notification, StickyNote, ArchivedTask } from "./types"

// Simple JSONB approach - store entire objects

export async function saveTasks(tasks: Task[]): Promise<boolean> {
  try {
    // Delete all existing
    await supabase.from('tasks').delete().neq('id', '')
    
    // Insert all
    const rows = tasks.map(task => ({ id: task.id, data: task }))
    const { error } = await supabase.from('tasks').insert(rows)
    
    if (error) throw error
    return true
  } catch (error) {
    console.error('Error saving tasks:', error)
    return false
  }
}

export async function loadTasks(): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('data')
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return (data || []).map(row => row.data as Task)
  } catch (error) {
    console.error('Error loading tasks:', error)
    return []
  }
}

export async function saveNotifications(notifications: Notification[], userId: string): Promise<boolean> {
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
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('data')
      .eq('data->>toUserId', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return (data || []).map(row => row.data as Notification)
  } catch (error) {
    console.error('Error loading notifications:', error)
    return []
  }
}

export async function saveStickyNotes(notes: StickyNote[], userId: string): Promise<boolean> {
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
  try {
    const { data, error } = await supabase
      .from('sticky_notes')
      .select('data')
      .eq('data->>userId', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return (data || []).map(row => row.data as StickyNote)
  } catch (error) {
    console.error('Error loading sticky notes:', error)
    return []
  }
}

export async function saveArchivedTasks(tasks: ArchivedTask[]): Promise<boolean> {
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
  try {
    const { data, error } = await supabase
      .from('archived_tasks')
      .select('data')
      .order('archived_at', { ascending: false })
    
    if (error) throw error
    return (data || []).map(row => row.data as ArchivedTask)
  } catch (error) {
    console.error('Error loading archived tasks:', error)
    return []
  }
}
