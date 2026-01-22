"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TaskDetailSheet } from "@/components/task-detail-sheet"
import { useTaskContext } from "@/lib/task-context"
import { statusConfig } from "@/lib/status-config"
import type { Task } from "@/lib/types"
import { MoreHorizontal, Calendar, Trash2, Edit, Figma, FileText, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import { he } from "date-fns/locale"

interface TaskCardProps {
  task: Task
  compact?: boolean
  onEdit?: () => void
  draggable?: boolean
  onDragStart?: (e: React.DragEvent) => void
}

export function TaskCard({ task, compact, onEdit, draggable, onDragStart }: TaskCardProps) {
  const { deleteTask, getUserById, canEditTask } = useTaskContext()
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const canEdit = canEditTask(task)

  const priorityLabels = {
    high: "גבוהה",
    medium: "בינונית",
    low: "נמוכה",
  }

  const priorityStyles = {
    high: "bg-red-500 text-white border-0",
    medium: "bg-amber-500 text-white border-0",
    low: "bg-blue-500 text-white border-0",
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return
    setIsDetailOpen(true)
  }

  const assignee = task.assigneeId ? getUserById(task.assigneeId) : null

  return (
    <>
      <Card
        className={`group cursor-pointer bg-card hover:shadow-lg hover:shadow-foreground/5 transition-all duration-200 border-border/50 ${draggable ? "cursor-grab active:cursor-grabbing active:shadow-xl" : ""}`}
        onClick={handleCardClick}
        draggable={draggable}
        onDragStart={onDragStart}
      >
        <CardContent className={compact ? "p-4" : "p-5"}>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="font-semibold text-sm leading-relaxed line-clamp-2 flex-1">{task.title}</h3>
            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 -mt-1 -ml-1"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={onEdit} className="gap-2">
                    <Edit className="w-4 h-4" />
                    עריכה
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => deleteTask(task.id)}
                    className="gap-2 text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                    מחיקה
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Description */}
          {!compact && task.description && (
            <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2 mb-4">{task.description}</p>
          )}

          {/* Status & Priority Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className={`${statusConfig[task.status].bgClass} text-xs font-medium`}>
              {statusConfig[task.status].label}
            </Badge>
            <Badge className={`${priorityStyles[task.priority]} text-xs font-medium`}>
              {priorityLabels[task.priority]}
            </Badge>
          </div>

          {/* Footer - Meta info & Avatar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {task.dueDate && (
                <div className="flex items-center gap-1.5 bg-gray-100 text-foreground px-2 py-1 rounded-md">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{format(task.dueDate, "d MMM", { locale: he })}</span>
                </div>
              )}

              {task.figmaLink && (
                <div className="bg-gray-100 p-1.5 rounded-md">
                  <Figma className="w-3.5 h-3.5 text-foreground" />
                </div>
              )}

              {task.files.length > 0 && (
                <div className="flex items-center gap-1 bg-gray-100 text-foreground px-2 py-1 rounded-md">
                  <FileText className="w-3.5 h-3.5" />
                  <span>{task.files.length}</span>
                </div>
              )}

              {task.comments.length > 0 && (
                <div className="flex items-center gap-1 bg-gray-100 text-foreground px-2 py-1 rounded-md">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{task.comments.length}</span>
                </div>
              )}
            </div>

            {assignee && (
              <Avatar className="w-8 h-8 ring-2 ring-background shadow-sm">
                <AvatarImage src={assignee.avatar || "/placeholder.svg"} alt={assignee.name} />
                <AvatarFallback className="text-[10px] bg-primary text-primary-foreground font-medium">
                  {assignee.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </CardContent>
      </Card>

      <TaskDetailSheet task={task} open={isDetailOpen} onOpenChange={setIsDetailOpen} />
    </>
  )
}
