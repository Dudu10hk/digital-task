"use client"

import { useState, useMemo } from "react"
import { useTaskContext } from "@/lib/task-context"
import { TaskDialog } from "@/components/task-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { TaskDetailSheet } from "@/components/task-detail-sheet"
import { statusConfig, statusOptions } from "@/lib/status-config"
import type { Task, TaskStatus, TaskPriority } from "@/lib/types"
import { Search, MoreHorizontal, Edit, Trash2, Calendar, Figma, ChevronDown, ChevronUp } from "lucide-react"
import { format } from "date-fns"
import { he } from "date-fns/locale"

type SortField = "title" | "status" | "priority" | "dueDate" | "assigneeName"
type SortDirection = "asc" | "desc"

export function ListView({ filteredTasks }: { filteredTasks: Task[] }) {
  const { deleteTask, getUserById } = useTaskContext()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all")
  const [sortField, setSortField] = useState<SortField>("dueDate")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

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

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...filteredTasks]

    if (search) {
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(search.toLowerCase()) ||
          task.description.toLowerCase().includes(search.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      result = result.filter((task) => task.status === statusFilter)
    }

    if (priorityFilter !== "all") {
      result = result.filter((task) => task.priority === priorityFilter)
    }

    result.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title, "he")
          break
        case "status":
          const statusOrder = { todo: 0, "in-progress": 1, review: 2, blocked: 3, "on-hold": 4, done: 5, canceled: 6 }
          comparison = statusOrder[a.status] - statusOrder[b.status]
          break
        case "priority":
          const priorityOrder = { high: 0, medium: 1, low: 2 }
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
          break
        case "dueDate":
          const dateA = a.dueDate?.getTime() || Number.POSITIVE_INFINITY
          const dateB = b.dueDate?.getTime() || Number.POSITIVE_INFINITY
          comparison = dateA - dateB
          break
        case "assigneeName":
          comparison = (a.assigneeName || "").localeCompare(b.assigneeName || "", "he")
          break
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

    return result
  }, [filteredTasks, search, statusFilter, priorityFilter, sortField, sortDirection])

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש משימות..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10 bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as TaskStatus | "all")}>
          <SelectTrigger className="w-[160px] bg-muted/50 border-0">
            <SelectValue placeholder="סטטוס" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הסטטוסים</SelectItem>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${statusConfig[opt.value].color}`} />
                  {opt.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as TaskPriority | "all")}>
          <SelectTrigger className="w-[140px] bg-muted/50 border-0">
            <SelectValue placeholder="רמת דחיפות" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל רמות הדחיפות</SelectItem>
            <SelectItem value="high">גבוהה</SelectItem>
            <SelectItem value="medium">בינונית</SelectItem>
            <SelectItem value="low">נמוכה</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-right px-5 py-4 font-semibold text-sm">
                  <button
                    onClick={() => toggleSort("title")}
                    className="flex items-center gap-1.5 hover:text-primary transition-colors"
                  >
                    כותרת
                    <SortIcon field="title" />
                  </button>
                </th>
                <th className="text-right px-5 py-4 font-semibold text-sm">
                  <button
                    onClick={() => toggleSort("status")}
                    className="flex items-center gap-1.5 hover:text-primary transition-colors"
                  >
                    סטטוס
                    <SortIcon field="status" />
                  </button>
                </th>
                <th className="text-right px-5 py-4 font-semibold text-sm">
                  <button
                    onClick={() => toggleSort("priority")}
                    className="flex items-center gap-1.5 hover:text-primary transition-colors"
                  >
                    רמת דחיפות
                    <SortIcon field="priority" />
                  </button>
                </th>
                <th className="text-right px-5 py-4 font-semibold text-sm">
                  <button
                    onClick={() => toggleSort("dueDate")}
                    className="flex items-center gap-1.5 hover:text-primary transition-colors"
                  >
                    תאריך יעד
                    <SortIcon field="dueDate" />
                  </button>
                </th>
                <th className="text-right px-5 py-4 font-semibold text-sm">
                  <button
                    onClick={() => toggleSort("assigneeName")}
                    className="flex items-center gap-1.5 hover:text-primary transition-colors"
                  >
                    אחראי
                    <SortIcon field="assigneeName" />
                  </button>
                </th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedTasks.map((task, index) => {
                const assignee = task.assigneeId ? getUserById(task.assigneeId) : null
                return (
                  <tr
                    key={task.id}
                    className={`border-t border-border/50 hover:bg-muted/30 transition-colors cursor-pointer ${
                      index % 2 === 0 ? "" : "bg-muted/20"
                    }`}
                    onClick={() => setSelectedTask(task)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{task.title}</span>
                        {task.figmaLink && (
                          <div className="bg-purple-100 text-purple-600 p-1 rounded">
                            <Figma className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge className={`${statusConfig[task.status].bgClass} text-xs font-medium`}>
                        {statusConfig[task.status].label}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Badge className={`${priorityStyles[task.priority]} text-xs font-medium`}>
                        {priorityLabels[task.priority]}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      {task.dueDate ? (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {format(task.dueDate, "d MMM yyyy", { locale: he })}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {assignee ? (
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-8 h-8 ring-2 ring-background">
                            <AvatarImage src={assignee.avatar || "/placeholder.svg"} alt={assignee.name} />
                            <AvatarFallback className="text-[10px] bg-primary text-primary-foreground font-medium">
                              {assignee.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingTask(task)
                            }}
                            className="gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            עריכה
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteTask(task.id)
                            }}
                            className="gap-2 text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                            מחיקה
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredAndSortedTasks.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg font-medium">לא נמצאו משימות</p>
              <p className="text-sm mt-1">נסו לשנות את הפילטרים או ליצור משימה חדשה</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <TaskDialog
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        mode="edit"
        task={editingTask || undefined}
      />

      {/* Detail Sheet */}
      {selectedTask && (
        <TaskDetailSheet
          task={selectedTask}
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
        />
      )}
    </div>
  )
}
