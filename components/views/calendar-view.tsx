"use client"

import { useState, useMemo } from "react"
import { useTaskContext } from "@/lib/task-context"
import { TaskDetailSheet } from "@/components/task-detail-sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Task } from "@/lib/types"
import { ChevronRight, ChevronLeft } from "lucide-react"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from "date-fns"
import { he } from "date-fns/locale"

export function CalendarView() {
  const { tasks } = useTaskContext()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 })
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const getTasksForDay = (date: Date) => {
    return tasks.filter((task) => task.dueDate && isSameDay(task.dueDate, date))
  }

  const weekDays = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"]

  const statusColors = {
    todo: "bg-status-todo text-white",
    "in-progress": "bg-status-progress text-foreground",
    done: "bg-status-done text-white",
  }

  return (
    <div className="bg-card rounded-xl border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold">{format(currentMonth, "MMMM yyyy", { locale: he })}</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
            היום
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 border-b">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-medium text-muted-foreground border-l first:border-l-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const dayTasks = getTasksForDay(day)
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isCurrentDay = isToday(day)

          return (
            <div
              key={index}
              className={`min-h-[120px] p-2 border-l border-b first:border-l-0 ${
                !isCurrentMonth ? "bg-muted/30" : ""
              } ${isCurrentDay ? "bg-primary/5" : ""}`}
            >
              <div
                className={`text-sm font-medium mb-2 w-7 h-7 flex items-center justify-center rounded-full ${
                  isCurrentDay ? "bg-primary text-primary-foreground" : ""
                } ${!isCurrentMonth ? "text-muted-foreground" : ""}`}
              >
                {format(day, "d")}
              </div>

              <div className="space-y-1">
                {dayTasks.slice(0, 3).map((task) => (
                  <button
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className={`w-full text-right text-xs p-1.5 rounded truncate hover:opacity-80 transition-opacity ${statusColors[task.status]}`}
                  >
                    {task.title}
                  </button>
                ))}
                {dayTasks.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{dayTasks.length - 3} נוספים
                  </Badge>
                )}
              </div>
            </div>
          )
        })}
      </div>

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
