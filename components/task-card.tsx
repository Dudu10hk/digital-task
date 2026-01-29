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
    high: "bg-rose-50 text-rose-700 border-rose-200 shadow-sm",
    medium: "bg-amber-50 text-amber-700 border-amber-200 shadow-sm",
    low: "bg-sky-50 text-sky-700 border-sky-200 shadow-sm",
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
        className={`group cursor-pointer bg-card hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border/60 ${draggable ? "cursor-grab active:cursor-grabbing active:shadow-2xl" : ""}`}
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
            <Badge className={`${statusConfig[task.status]?.bgClass || "bg-gray-500"} text-xs font-medium`}>
              {statusConfig[task.status]?.label || task.status}
            </Badge>
            <Badge className={`${priorityStyles[task.priority] || priorityStyles.medium} text-xs font-medium`}>
              {priorityLabels[task.priority] || task.priority}
            </Badge>
            {/* In Progress Station Badge */}
            {task.column === "in-progress" && task.inProgressStation && (
              <Badge className={`${inProgressStationConfig[task.inProgressStation].bgClass} border text-xs font-medium flex items-center gap-1.5`}>
                {getStationIcon(inProgressStationConfig[task.inProgressStation].icon)}
                {inProgressStationConfig[task.inProgressStation].label}
              </Badge>
            )}
          </div>

          {/* Footer - Meta info & Avatar */}
          <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-50">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
              {task.dueDate && (
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md font-medium ${new Date(task.dueDate) < new Date() ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{format(task.dueDate, "d MMM", { locale: he })}</span>
                </div>
              )}

              {task.figmaLink && (
                <div className="bg-slate-50 p-1.5 rounded-md border border-slate-100 hover:bg-purple-50 hover:text-purple-600 transition-colors" title="Figma Design">
                  <Figma className="w-3.5 h-3.5" />
                </div>
              )}

              {task.processSpecLink && (
                <div className="bg-slate-50 p-1.5 rounded-md border border-slate-100 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="אפיון תהליך">
                  <FileText className="w-3.5 h-3.5" />
                </div>
              )}

              {(task.files.length > 0 || task.comments.length > 0) && (
                <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                  {task.files.length > 0 && (
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span className="font-bold">{task.files.length}</span>
                    </div>
                  )}
                  {task.comments.length > 0 && (
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      <span className="font-bold">{task.comments.length}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center -space-x-2 rtl:space-x-reverse">
              {/* Handler Avatar */}
              {handler && (
                <div className="relative z-10" title={`גורם מטפל: ${handler.name}`}>
                  <Avatar className="w-7 h-7 ring-2 ring-white shadow-sm">
                    <AvatarImage src={handler.avatar || "/placeholder.svg"} alt={handler.name} />
                    <AvatarFallback className="text-[9px] bg-amber-100 text-amber-700 font-bold">
                      {handler.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm ring-1 ring-slate-100">
                    <Wrench className="w-2 h-2 text-amber-600" />
                  </div>
                </div>
              )}

              {/* Assignee Avatar */}
              {assignee && (
                <Avatar className="w-8 h-8 ring-2 ring-white shadow-md z-0" title={`אחראי: ${assignee.name}`}>
                  <AvatarImage src={assignee.avatar || "/placeholder.svg"} alt={assignee.name} />
                  <AvatarFallback className="text-[10px] bg-primary text-primary-foreground font-bold">
                    {assignee.name.split(" ").map((n) => n[0]).join("")}
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
