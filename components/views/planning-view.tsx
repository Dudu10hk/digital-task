"use client"

import { useState, useMemo } from "react"
import { useTaskContext } from "@/lib/task-context"
import { TaskDetailSheet } from "@/components/task-detail-sheet"
import { PlanningTaskDialog } from "@/components/planning-task-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Task } from "@/lib/types"
import { Search, Calendar, User, X, ClipboardList, Clock, Plus, ChevronUp, ChevronDown, ArrowRight } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { he } from "date-fns/locale"

type SortField = "title" | "waitingTime"
type SortDirection = "asc" | "desc"

export function PlanningView({ filteredTasks }: { filteredTasks: Task[] }) {
  const { updateTask, users, canEditTask, isViewer } = useTaskContext()
  const [search, setSearch] = useState("")
  const [sortField, setSortField] = useState<SortField>("waitingTime")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Filter only planning tasks
  const planningTasks = useMemo(() => {
    return filteredTasks.filter(task => task.isPlanning === true)
  }, [filteredTasks])

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...planningTasks]

    // Search filter
    if (search) {
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(search.toLowerCase()) ||
          task.description.toLowerCase().includes(search.toLowerCase()),
      )
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case "title":
          comparison = a.title.localeCompare(b.title, "he")
          break
        case "waitingTime":
          const dateA = (a.planningReceivedAt || a.createdAt).getTime()
          const dateB = (b.planningReceivedAt || b.createdAt).getTime()
          comparison = dateA - dateB
          break
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

    return result
  }, [planningTasks, search, sortField, sortDirection])

  const handleAssignOwner = (taskId: string, userId: string | null) => {
    if (isViewer()) return
    
    const task = planningTasks.find(t => t.id === taskId)
    if (!task || !canEditTask(task)) return

    if (userId === null) {
      // Clear assignment
      updateTask(taskId, {
        assigneeId: null,
        assigneeName: null,
        assigneeAvatar: null,
      })
    } else {
      const user = users.find(u => u.id === userId)
      if (user) {
        updateTask(taskId, {
          assigneeId: user.id,
          assigneeName: user.name,
          assigneeAvatar: user.avatar || null,
        })
      }
    }
  }

  const handleRemoveFromPlanning = (taskId: string) => {
    if (isViewer()) return
    
    const task = planningTasks.find(t => t.id === taskId)
    if (!task || !canEditTask(task)) return

    updateTask(taskId, {
      isPlanning: false,
      planningReceivedAt: undefined,
    })
  }

  const pushToTodo = (taskId: string) => {
    if (isViewer()) return
    
    const task = planningTasks.find(t => t.id === taskId)
    if (!task || !canEditTask(task)) return

    // Move task to To Do board and remove from planning
    updateTask(taskId, {
      isPlanning: false,
      planningReceivedAt: undefined,
      column: "todo",
      status: "todo",
    })
  }

  const movePriorityUp = (taskId: string) => {
    if (isViewer()) return
    
    const currentIndex = filteredAndSortedTasks.findIndex(t => t.id === taskId)
    if (currentIndex <= 0) return // Already at top
    
    const currentTask = filteredAndSortedTasks[currentIndex]
    const taskAbove = filteredAndSortedTasks[currentIndex - 1]
    
    if (!canEditTask(currentTask)) return

    // Swap planningReceivedAt to change order
    const tempDate = currentTask.planningReceivedAt || currentTask.createdAt
    updateTask(currentTask.id, {
      planningReceivedAt: taskAbove.planningReceivedAt || taskAbove.createdAt
    })
    updateTask(taskAbove.id, {
      planningReceivedAt: tempDate
    })
  }

  const movePriorityDown = (taskId: string) => {
    if (isViewer()) return
    
    const currentIndex = filteredAndSortedTasks.findIndex(t => t.id === taskId)
    if (currentIndex === -1 || currentIndex >= filteredAndSortedTasks.length - 1) return // Already at bottom
    
    const currentTask = filteredAndSortedTasks[currentIndex]
    const taskBelow = filteredAndSortedTasks[currentIndex + 1]
    
    if (!canEditTask(currentTask)) return

    // Swap planningReceivedAt to change order
    const tempDate = currentTask.planningReceivedAt || currentTask.createdAt
    updateTask(currentTask.id, {
      planningReceivedAt: taskBelow.planningReceivedAt || taskBelow.createdAt
    })
    updateTask(taskBelow.id, {
      planningReceivedAt: tempDate
    })
  }

  const getWaitingTime = (task: Task) => {
    const date = task.planningReceivedAt || task.createdAt
    return formatDistanceToNow(date, { locale: he, addSuffix: true })
  }

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("desc") // Default to newest first for waiting time
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <ClipboardList className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">תכנון</h2>
            <p className="text-sm text-muted-foreground">
              {filteredAndSortedTasks.length} משימות ממתינות
            </p>
          </div>
        </div>
        
        {/* Add Planning Task Button */}
        {!isViewer() && (
          <Button 
            onClick={() => setIsCreateDialogOpen(true)} 
            className="gap-2 shadow-lg shadow-primary/25 h-11 px-6 font-medium rounded-lg"
          >
            <Plus className="w-4 h-4" />
            משימת תכנון חדשה
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="חיפוש משימות..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10 h-11 bg-muted/40 border-border/40 focus:bg-background"
          />
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-card rounded-xl border border-border/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/40 border-b border-border/40">
              <tr>
                <th 
                  className="text-right px-6 py-4 text-sm font-semibold cursor-pointer hover:bg-muted/60 transition-colors"
                  onClick={() => toggleSort("title")}
                >
                  <div className="flex items-center gap-2">
                    כותרת
                    {sortField === "title" && (
                      <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th 
                  className="text-right px-6 py-4 text-sm font-semibold cursor-pointer hover:bg-muted/60 transition-colors"
                  onClick={() => toggleSort("waitingTime")}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    זמן המתנה
                    {sortField === "waitingTime" && (
                      <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    אחראי
                  </div>
                </th>
                <th className="text-right px-6 py-4 text-sm font-semibold">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedTasks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-16">
                    <ClipboardList className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground text-lg font-medium">
                      {search ? "לא נמצאו משימות תואמות" : "אין משימות בתכנון"}
                    </p>
                    <p className="text-muted-foreground/60 text-sm mt-2">
                      משימות שמסומנות כ"בתכנון" יופיעו כאן
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAndSortedTasks.map((task) => {
                  const canEdit = canEditTask(task) && !isViewer()
                  return (
                    <tr
                      key={task.id}
                      className="border-b border-border/30 hover:bg-muted/20 transition-colors group"
                    >
                      {/* Title */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="text-right hover:text-primary transition-colors font-medium"
                        >
                          {task.title}
                        </button>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {task.description}
                          </p>
                        )}
                      </td>

                      {/* Waiting Time */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-normal">
                            {getWaitingTime(task)}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          התקבל: {format(task.planningReceivedAt || task.createdAt, "d MMM yyyy", { locale: he })}
                        </p>
                      </td>

                      {/* Assignee */}
                      <td className="px-6 py-4">
                        <Select
                          value={task.assigneeId || "unassigned"}
                          onValueChange={(value) => 
                            handleAssignOwner(task.id, value === "unassigned" ? null : value)
                          }
                          disabled={!canEdit}
                        >
                          <SelectTrigger className="w-[200px] h-9">
                            <SelectValue>
                              {task.assigneeId ? (
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarImage src={task.assigneeAvatar || undefined} />
                                    <AvatarFallback className="text-xs">
                                      {task.assigneeName?.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{task.assigneeName}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">לא משויך</span>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">
                              <span className="text-muted-foreground">ללא אחראי</span>
                            </SelectItem>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="w-6 h-6">
                                    <AvatarImage src={user.avatar || undefined} />
                                    <AvatarFallback className="text-xs">
                                      {user.name.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{user.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {/* Priority arrows */}
                          {canEdit && (
                            <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => movePriorityUp(task.id)}
                                className="h-6 w-6 hover:bg-primary/10 hover:text-primary"
                                disabled={filteredAndSortedTasks.findIndex(t => t.id === task.id) === 0}
                                title="העלה עדיפות"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => movePriorityDown(task.id)}
                                className="h-6 w-6 hover:bg-primary/10 hover:text-primary"
                                disabled={filteredAndSortedTasks.findIndex(t => t.id === task.id) === filteredAndSortedTasks.length - 1}
                                title="הורד עדיפות"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                          
                          {/* Push to To Do */}
                          {canEdit && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => pushToTodo(task.id)}
                              className="h-8 gap-1.5 bg-primary hover:bg-primary/90 shadow-sm"
                              title="דחוף ל-To Do"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                              <span className="text-xs">ל-To Do</span>
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTask(task)}
                            className="h-8"
                          >
                            פתח
                          </Button>
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFromPlanning(task.id)}
                              className="h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              title="הסר מתכנון"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Detail Sheet */}
      {selectedTask && (
        <TaskDetailSheet
          task={selectedTask}
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
        />
      )}

      {/* Create Planning Task Dialog */}
      <PlanningTaskDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />
    </div>
  )
}
