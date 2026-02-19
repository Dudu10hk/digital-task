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
        className={`group cursor-pointer bg-card hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-500 border-border/40 overflow-hidden relative ${draggable ? "cursor-grab active:cursor-grabbing" : ""}`}
        onClick={handleCardClick}
        draggable={draggable}
        onDragStart={onDragStart}
      >
        {/* Priority Indicator Strip */}
        <div className={`absolute top-0 right-0 bottom-0 w-1 ${
          task.priority === 'high' ? 'bg-rose-500' : 
          task.priority === 'medium' ? 'bg-amber-500' : 'bg-sky-500'
        }`} />

        <CardContent className={compact ? "p-4" : "p-5"}>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="font-bold text-[15px] leading-snug line-clamp-2 flex-1 text-foreground/90 group-hover:text-primary transition-colors">
              {task.title}
            </h3>
            {canEdit && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all shrink-0 -mt-1 -ml-1 hover:bg-muted rounded-full"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <div dir="rtl">
                    <DropdownMenuItem onClick={onEdit} className="gap-2 cursor-pointer">
                      <Edit className="w-4 h-4" />
                      עריכה
                    </DropdownMenuItem>
                    {task.column === "done" && (
                      <DropdownMenuItem
                        onClick={() => archiveTask(task.id, "completed")}
                        className="gap-2 text-emerald-600 focus:text-emerald-600 cursor-pointer"
                      >
                        <Archive className="w-4 h-4" />
                        העבר לארכיון
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => deleteTask(task.id)}
                      className="gap-2 text-destructive focus:text-destructive cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      מחיקה
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Description */}
          {!compact && task.description && (
            <p className="text-muted-foreground text-[13px] leading-relaxed line-clamp-2 mb-4 font-normal">
              {task.description}
            </p>
          )}

          {/* Status & Priority Badges */}
          <div className="flex flex-wrap gap-2 mb-5">
            <Badge 
              variant="secondary"
              className={`${statusConfig[task.status]?.bgClass || "bg-gray-100"} text-[11px] font-bold px-2 py-0.5 rounded-md border-0 uppercase tracking-wider`}
            >
              {statusConfig[task.status]?.label || task.status}
            </Badge>
            
            {/* In Progress Station Badge */}
            {task.column === "in-progress" && task.inProgressStation && (
              <Badge 
                variant="outline"
                className={`${inProgressStationConfig[task.inProgressStation].bgClass} border-0 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1.5`}
              >
                {getStationIcon(inProgressStationConfig[task.inProgressStation].icon)}
                {inProgressStationConfig[task.inProgressStation].label}
              </Badge>
            )}
          </div>

          {/* Footer - Meta info & Avatar */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              {task.dueDate && (
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full font-bold text-[10px] ${
                  new Date(task.dueDate) < new Date() 
                    ? 'bg-rose-50 text-rose-600' 
                    : 'bg-muted/50 text-muted-foreground'
                }`}>
                  <Calendar className="w-3 h-3" />
                  <span>{format(task.dueDate, "d MMM", { locale: he })}</span>
                </div>
              )}

              {(task.files.length > 0 || task.comments.length > 0) && (
                <div className="flex items-center gap-2.5 px-1">
                  {task.files.length > 0 && (
                    <div className="flex items-center gap-1 hover:text-foreground transition-colors" title={`${task.files.length} קבצים`}>
                      <FileText className="w-3.5 h-3.5" />
                      <span className="font-bold text-[11px]">{task.files.length}</span>
                    </div>
                  )}
                  {task.comments.length > 0 && (
                    <div className="flex items-center gap-1 hover:text-foreground transition-colors" title={`${task.comments.length} תגובות`}>
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span className="font-bold text-[11px]">{task.comments.length}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center -space-x-2 rtl:space-x-reverse">
              {/* Handler Avatar */}
              {handler && (
                <div className="relative z-10 group/avatar" title={`גורם מטפל: ${handler.name}`}>
                  <Avatar className="w-8 h-8 ring-2 ring-background shadow-sm transition-transform group-hover/avatar:scale-110">
                    <AvatarImage src={handler.avatar} alt={handler.name} />
                    <AvatarFallback className="text-[10px] bg-amber-100 text-amber-700 font-bold uppercase">
                      {handler.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 bg-amber-500 rounded-full p-0.5 shadow-sm ring-1 ring-background">
                    <Wrench className="w-2 h-2 text-white" />
                  </div>
                </div>
              )}

              {/* Assignee Avatar */}
              {assignee && (
                <div className="relative group/avatar" title={`אחראי: ${assignee.name}`}>
                  <Avatar className="w-8 h-8 ring-2 ring-background shadow-sm transition-transform group-hover/avatar:scale-110">
                    <AvatarImage src={assignee.avatar} alt={assignee.name} />
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold uppercase">
                      {assignee.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </div>
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
