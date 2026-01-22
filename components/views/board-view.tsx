"use client"

import type React from "react"

import { useState } from "react"
import { useTaskContext } from "@/lib/task-context"
import { TaskCard } from "@/components/task-card"
import { TaskDialog } from "@/components/task-dialog"
import { Button } from "@/components/ui/button"
import type { Task, BoardColumn } from "@/lib/types"
import { boardColumns } from "@/lib/status-config"
import { Plus, Lock } from "lucide-react"

export function BoardView() {
  const { tasks, updateTaskColumn, reorderTaskInColumn, isAdmin } = useTaskContext()
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<BoardColumn | null>(null)
  const [draggedFromColumn, setDraggedFromColumn] = useState<BoardColumn | null>(null)
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null)

  const getTasksByColumn = (column: BoardColumn) => {
    return tasks
      .filter((task) => task.column === column)
      .sort((a, b) => a.order - b.order)
  }

  const canReorderInColumn = (column: BoardColumn): boolean => {
    if (column === "in-progress") {
      return isAdmin()
    }
    return true
  }

  const handleDragStart = (e: React.DragEvent, taskId: string, fromColumn: BoardColumn) => {
    setDraggedTaskId(taskId)
    setDraggedFromColumn(fromColumn)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, columnId: BoardColumn) => {
    e.preventDefault()
    setDragOverColumn(columnId)
  }

  const handleDragOverDropZone = (e: React.DragEvent, columnId: BoardColumn, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Only allow reorder within same column and if permitted
    if (canReorderInColumn(columnId)) {
      setDropTargetIndex(index)
    }
    setDragOverColumn(columnId)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving the column entirely
    const relatedTarget = e.relatedTarget as HTMLElement
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setDragOverColumn(null)
      setDropTargetIndex(null)
    }
  }

  const handleDropAtIndex = (e: React.DragEvent, columnId: BoardColumn, targetIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    if (!draggedTaskId) return

    const draggedTask = tasks.find(t => t.id === draggedTaskId)
    if (!draggedTask) return

    // If reordering within same column
    if (draggedFromColumn === columnId && canReorderInColumn(columnId)) {
      reorderTaskInColumn(draggedTaskId, targetIndex, columnId)
    } else if (draggedFromColumn !== columnId) {
      // Moving to different column - place at specific position
      updateTaskColumn(draggedTaskId, columnId)
      // After moving, reorder to the target position
      setTimeout(() => {
        reorderTaskInColumn(draggedTaskId, targetIndex, columnId)
      }, 0)
    }

    setDraggedTaskId(null)
    setDragOverColumn(null)
    setDraggedFromColumn(null)
    setDropTargetIndex(null)
  }

  const handleDrop = (e: React.DragEvent, columnId: BoardColumn) => {
    e.preventDefault()
    if (!draggedTaskId) return

    // If not dropping on a specific index, add to end
    if (draggedFromColumn !== columnId) {
      updateTaskColumn(draggedTaskId, columnId)
    }

    setDraggedTaskId(null)
    setDragOverColumn(null)
    setDraggedFromColumn(null)
    setDropTargetIndex(null)
  }

  return (
    <div className="flex gap-5 overflow-x-auto pb-6 -mx-2 px-2">
      {boardColumns.map((column) => {
        const columnTasks = getTasksByColumn(column.id)
        return (
          <div
            key={column.id}
            className={`flex-shrink-0 w-80 transition-all duration-200 ${
              dragOverColumn === column.id ? "scale-[1.02]" : ""
            }`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="flex items-center gap-3 mb-4 px-1">
              <div className={`w-3 h-3 rounded-full ${column.color} shadow-sm`} />
              <h3 className="font-bold text-sm">{column.label}</h3>
              <span className="text-muted-foreground text-xs bg-muted/80 px-2 py-0.5 rounded-full font-medium">
                {columnTasks.length}
              </span>
            </div>

            {/* Column Content */}
            <div
              className={`min-h-[200px] p-3 rounded-xl transition-colors duration-200 ${
                dragOverColumn === column.id ? "bg-primary/5 ring-2 ring-primary/20 ring-dashed" : "bg-muted/30"
              }`}
            >
              {/* Drop zone at the top - only for in-progress */}
              {draggedTaskId && column.id === "in-progress" && canReorderInColumn(column.id) && (
                <div
                  className={`h-0.5 mb-2 rounded-full transition-all duration-200 ${
                    dropTargetIndex === 0 ? "bg-primary/60 h-1" : "bg-transparent hover:bg-primary/20"
                  }`}
                  onDragOver={(e) => handleDragOverDropZone(e, column.id, 1)}
                  onDrop={(e) => handleDropAtIndex(e, column.id, 1)}
                />
              )}

              {columnTasks.map((task, index) => {
                const showPriorityNumber = column.id === "in-progress"
                const canReorder = canReorderInColumn(column.id)
                const isDropTargetBefore = dropTargetIndex === index + 1
                
                return (
                  <div key={task.id} className="mb-3">
                    <div className="relative">
                      {showPriorityNumber && (
                        <div className="absolute -right-2 -top-2 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-md">
                          {index + 1}
                        </div>
                      )}
                      {showPriorityNumber && !canReorder && (
                        <div className="absolute -left-2 -top-2 z-10" title="רק מנהלים יכולים לשנות סדר">
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <TaskCard
                        task={task}
                        compact
                        onEdit={() => setEditingTask(task)}
                        draggable={canReorder || column.id !== "in-progress"}
                        onDragStart={(e) => handleDragStart(e, task.id, column.id)}
                      />
                    </div>
                    
                    {/* Drop zone after each task - only for in-progress */}
                    {draggedTaskId && column.id === "in-progress" && canReorder && (
                      <div
                        className={`h-0.5 mt-2 rounded-full transition-all duration-200 ${
                          isDropTargetBefore ? "bg-primary/60 h-1" : "bg-transparent hover:bg-primary/20"
                        }`}
                        onDragOver={(e) => handleDragOverDropZone(e, column.id, index + 2)}
                        onDrop={(e) => handleDropAtIndex(e, column.id, index + 2)}
                      />
                    )}
                  </div>
                )
              })}

              {/* Quick Add Button - only in todo column */}
              {column.id === "todo" && (
                <Button
                  variant="ghost"
                  className="w-full h-12 border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 gap-2 text-muted-foreground hover:text-foreground transition-all"
                  onClick={() => setEditingTask({ column: "todo", status: "todo" } as Task)}
                >
                  <Plus className="w-4 h-4" />
                  הוסף משימה
                </Button>
              )}

              {/* Empty state for other columns */}
              {columnTasks.length === 0 && column.id !== "todo" && (
                <div className="flex items-center justify-center h-24 text-muted-foreground/50 text-sm">
                  גרור משימות לכאן
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Edit/Create Dialog */}
      <TaskDialog
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        mode={editingTask?.id ? "edit" : "create"}
        task={editingTask?.id ? editingTask : undefined}
        defaultColumn={editingTask?.column}
      />
    </div>
  )
}
