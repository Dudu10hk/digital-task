"use client"

import { useState, useEffect } from "react"
import { useTaskContext } from "@/lib/task-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Filter, X, Search } from "lucide-react"
import type { Task, TaskPriority, TaskStatus, BoardColumn } from "@/lib/types"

export interface FilterOptions {
  searchQuery: string
  priority: TaskPriority | "all"
  status: TaskStatus | "all"
  column: BoardColumn | "all"
  assigneeId: string | "all"
  handlerId: string | "all"
  hasOverdueDate: boolean | null
}

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterOptions) => void
}

export function AdvancedFilters({ onFilterChange }: AdvancedFiltersProps) {
  const { users } = useTaskContext()
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: "",
    priority: "all",
    status: "all",
    column: "all",
    assigneeId: "all",
    handlerId: "all",
    hasOverdueDate: null,
  })

  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    onFilterChange(filters)
  }, [filters, onFilterChange])

  const updateFilter = <K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      searchQuery: "",
      priority: "all",
      status: "all",
      column: "all",
      assigneeId: "all",
      handlerId: "all",
      hasOverdueDate: null,
    })
  }

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "searchQuery") return value !== ""
    if (key === "hasOverdueDate") return value !== null
    return value !== "all"
  }).length

  return (
    <div className="flex items-center gap-2 w-full">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="חיפוש לפי כותרת, תיאור, הערות..."
          value={filters.searchQuery}
          onChange={(e) => updateFilter("searchQuery", e.target.value)}
          className="pr-10 bg-muted/40 border border-border/40 focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/10 rounded-lg h-10"
        />
      </div>

      {/* Advanced Filters Popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2 relative h-10 rounded-lg">
            <Filter className="w-4 h-4" />
            <span>פילטרים</span>
            {activeFiltersCount > 0 && (
              <Badge className="absolute -top-2 -left-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-4 space-y-4" dir="rtl">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">פילטרים מתקדמים</h3>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-7 text-xs gap-1"
              >
                <X className="w-3 h-3" />
                נקה הכל
              </Button>
            )}
          </div>

          {/* Priority Filter */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">רמת דחיפות</Label>
            <Select
              value={filters.priority}
              onValueChange={(value) => updateFilter("priority", value as TaskPriority | "all")}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">הכל</SelectItem>
                <SelectItem value="high">דחוף</SelectItem>
                <SelectItem value="medium">בינונית</SelectItem>
                <SelectItem value="low">נמוכה</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">סטטוס</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => updateFilter("status", value as TaskStatus | "all")}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">הכל</SelectItem>
                <SelectItem value="todo">לביצוע</SelectItem>
                <SelectItem value="in-progress">בתהליך</SelectItem>
                <SelectItem value="done">הושלם</SelectItem>
                <SelectItem value="on-hold">בהמתנה</SelectItem>
                <SelectItem value="qa">בבדיקה</SelectItem>
                <SelectItem value="canceled">בוטל</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Column Filter */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">עמודה</Label>
            <Select
              value={filters.column}
              onValueChange={(value) => updateFilter("column", value as BoardColumn | "all")}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">הכל</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assignee Filter */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">אחראי</Label>
            <Select
              value={filters.assigneeId}
              onValueChange={(value) => updateFilter("assigneeId", value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">הכל</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Handler Filter */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">גורם מטפל</Label>
            <Select
              value={filters.handlerId}
              onValueChange={(value) => updateFilter("handlerId", value)}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">הכל</SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Overdue Filter */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">תאריך יעד</Label>
            <Select
              value={filters.hasOverdueDate === null ? "all" : filters.hasOverdueDate ? "overdue" : "not-overdue"}
              onValueChange={(value) => {
                if (value === "all") updateFilter("hasOverdueDate", null)
                else if (value === "overdue") updateFilter("hasOverdueDate", true)
                else updateFilter("hasOverdueDate", false)
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">הכל</SelectItem>
                <SelectItem value="overdue">באיחור</SelectItem>
                <SelectItem value="not-overdue">לא באיחור</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">{activeFiltersCount} פילטרים פעילים</span>
        </div>
      )}
    </div>
  )
}

// Helper function to apply filters to tasks
export function applyFilters(tasks: Task[], filters: FilterOptions): Task[] {
  return tasks.filter((task) => {
    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      const matchesTitle = task.title.toLowerCase().includes(query)
      const matchesDescription = task.description.toLowerCase().includes(query)
      const matchesComments = task.comments.some((comment) =>
        comment.content.toLowerCase().includes(query)
      )
      if (!matchesTitle && !matchesDescription && !matchesComments) return false
    }

    // Priority
    if (filters.priority !== "all" && task.priority !== filters.priority) return false

    // Status
    if (filters.status !== "all" && task.status !== filters.status) return false

    // Column
    if (filters.column !== "all" && task.column !== filters.column) return false

    // Assignee
    if (filters.assigneeId !== "all" && task.assigneeId !== filters.assigneeId) return false

    // Handler
    if (filters.handlerId !== "all" && task.handlerId !== filters.handlerId) return false

    // Overdue
    if (filters.hasOverdueDate !== null) {
      const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() : false
      if (filters.hasOverdueDate !== isOverdue) return false
    }

    return true
  })
}
