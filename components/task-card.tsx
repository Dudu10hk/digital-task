"use client"

import type React from "react"

import { useState, memo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TaskDetailSheet } from "@/components/task-detail-sheet"
import { useTaskContext } from "@/lib/task-context"
import { statusConfig, inProgressStationConfig } from "@/lib/status-config"
import type { Task } from "@/lib/types"
import { MoreHorizontal, Calendar, Trash2, Edit, Figma, FileText, MessageSquare, Wrench, Palette, Code, TestTube, Search, Users, Layers, Archive } from "lucide-react"
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
  const { deleteTask, getUserById, canEditTask, archiveTask } = useTaskContext()
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

  const getStationIcon = (iconName: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      Palette,
      Code,
      TestTube,
      Search,
      Users,
      Layers,
    }
    const Icon = icons[iconName] || FileText
    return <Icon className="w-3 h-3" />
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return
    setIsDetailOpen(true)
  }

  const assignee = task.assigneeId ? getUserById(task.assigneeId) : null
  const handler = task.handlerId ? getUserById(task.handlerId) : null

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
                <DropdownMenuContent align="end" dir="rtl">
                  <DropdownMenuItem onClick={onEdit} className="gap-2">
                    <Edit className="w-4 h-4" />
                    עריכה
                  </DropdownMenuItem>
                  {task.column === "done" && (
                    <DropdownMenuItem
                      onClick={() => archiveTask(task.id, "completed")}
                      className="gap-2 text-emerald-600 focus:text-emerald-600"
                    >
                      <Archive className="w-4 h-4" />
                      העבר לארכיון
                    </DropdownMenuItem>
                  )}
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
            {/* In Progress Station Badge */}
            {task.column === "in-progress" && task.inProgressStation && (
              <Badge className={`${inProgressStationConfig[task.inProgressStation].color} text-white border-0 text-xs font-medium flex items-center gap-1.5`}>
                {getStationIcon(inProgressStationConfig[task.inProgressStation].icon)}
                {inProgressStationConfig[task.inProgressStation].label}
              </Badge>
            )}
          </div>

          {/* Footer - Meta info & Avatar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              {task.dueDate && (
                <div className="flex items-center gap-1.5 bg-gray-100 text-foreground px-2 py-1 rounded-md">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{format(task.dueDate, "d MMM", { locale: he })}</span>
                </div>
              )}

              {task.figmaLink && (
                <div className="bg-gray-100 p-1.5 rounded-md" title="Figma Design">
                  <Figma className="w-3.5 h-3.5 text-foreground" />
                </div>
              )}

              {task.processSpecLink && (
                <div className="bg-gray-100 p-1.5 rounded-md" title="אפיון תהליך">
                  <FileText className="w-3.5 h-3.5 text-foreground" />
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

            <div className="flex items-center gap-2">
              {/* Handler Avatar */}
              {handler && (
                <div className="flex items-center gap-1" title={`גורם מטפל: ${handler.name}`}>
                  <Wrench className="w-3 h-3 text-muted-foreground" />
                  <Avatar className="w-7 h-7 ring-2 ring-amber-400 shadow-sm">
                    <AvatarImage src={handler.avatar || "/placeholder.svg"} alt={handler.name} />
                    <AvatarFallback className="text-[9px] bg-amber-100 text-amber-700 font-semibold">
                      {handler.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}

              {/* Assignee Avatar */}
              {assignee && (
                <Avatar className="w-8 h-8 ring-2 ring-background shadow-sm" title={`אחראי: ${assignee.name}`}>
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
          </div>
        </CardContent>
      </Card>

      <TaskDetailSheet task={task} open={isDetailOpen} onOpenChange={setIsDetailOpen} />
    </>
  )
}

// Memoize to prevent unnecessary re-renders
export default memo(TaskCard)
