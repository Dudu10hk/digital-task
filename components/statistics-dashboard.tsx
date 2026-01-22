"use client"

import { useMemo } from "react"
import { useTaskContext } from "@/lib/task-context"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Target,
  Activity,
} from "lucide-react"
import type { Task, InProgressStation } from "@/lib/types"

export function StatisticsDashboard() {
  const { tasks, users, archivedTasks } = useTaskContext()

  const stats = useMemo(() => {
    // Basic counts
    const totalTasks = tasks.length
    const completedTasks = archivedTasks.filter((t) => t.archiveReason === "completed").length
    const todoTasks = tasks.filter((t) => t.column === "todo").length
    const inProgressTasks = tasks.filter((t) => t.column === "in-progress").length
    const doneTasks = tasks.filter((t) => t.column === "done").length

    // Priority breakdown
    const highPriority = tasks.filter((t) => t.priority === "high").length
    const mediumPriority = tasks.filter((t) => t.priority === "medium").length
    const lowPriority = tasks.filter((t) => t.priority === "low").length

    // Overdue tasks
    const overdueTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date()).length

    // Station breakdown (in-progress only)
    const stationCounts: Record<InProgressStation, number> = {
      design: 0,
      development: 0,
      testing: 0,
      feasibility: 0,
      "business-review": 0,
      "ux-requirements": 0,
    }
    
    tasks
      .filter((t) => t.column === "in-progress" && t.inProgressStation)
      .forEach((t) => {
        if (t.inProgressStation) {
          stationCounts[t.inProgressStation]++
        }
      })

    // User workload
    const userWorkload = users.map((user) => ({
      name: user.name,
      assigned: tasks.filter((t) => t.assigneeId === user.id).length,
      handling: tasks.filter((t) => t.handlerId === user.id).length,
    }))

    // Completion rate
    const totalIncludingArchived = totalTasks + completedTasks
    const completionRate = totalIncludingArchived > 0 
      ? Math.round((completedTasks / totalIncludingArchived) * 100) 
      : 0

    return {
      totalTasks,
      completedTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      highPriority,
      mediumPriority,
      lowPriority,
      overdueTasks,
      stationCounts,
      userWorkload,
      completionRate,
    }
  }, [tasks, users, archivedTasks])

  const stationLabels: Record<InProgressStation, string> = {
    design: "בעיצוב",
    development: "בפיתוח",
    testing: "בבדיקות",
    feasibility: "בבחינת יישימות",
    "business-review": "בבחינה עסקית",
    "ux-requirements": "בהגדרת UX",
  }

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">סה"כ משימות פעילות</p>
              <p className="text-3xl font-bold mt-1">{stats.totalTasks}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </Card>

        {/* Completed Tasks */}
        <Card className="p-4 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">הושלמו</p>
              <p className="text-3xl font-bold mt-1">{stats.completedTasks}</p>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {stats.completionRate}% שיעור השלמה
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </Card>

        {/* In Progress */}
        <Card className="p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">בתהליך</p>
              <p className="text-3xl font-bold mt-1">{stats.inProgressTasks}</p>
            </div>
            <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </Card>

        {/* Overdue */}
        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">באיחור</p>
              <p className="text-3xl font-bold mt-1">{stats.overdueTasks}</p>
            </div>
            <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Breakdown */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">פילוח לפי דחיפות</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="w-16 justify-center">דחוף</Badge>
                <span className="text-sm text-muted-foreground">משימות</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 rounded-full bg-red-500" style={{ width: `${Math.max(stats.highPriority * 20, 20)}px` }} />
                <span className="font-semibold">{stats.highPriority}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="w-16 justify-center bg-amber-500">בינונית</Badge>
                <span className="text-sm text-muted-foreground">משימות</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 rounded-full bg-amber-500" style={{ width: `${Math.max(stats.mediumPriority * 20, 20)}px` }} />
                <span className="font-semibold">{stats.mediumPriority}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="w-16 justify-center">נמוכה</Badge>
                <span className="text-sm text-muted-foreground">משימות</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 rounded-full bg-gray-400" style={{ width: `${Math.max(stats.lowPriority * 20, 20)}px` }} />
                <span className="font-semibold">{stats.lowPriority}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Column Distribution */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">פילוח לפי עמודות</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm">To Do</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 rounded-full bg-blue-500" style={{ width: `${Math.max(stats.todoTasks * 20, 20)}px` }} />
                <span className="font-semibold">{stats.todoTasks}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-sm">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 rounded-full bg-amber-500" style={{ width: `${Math.max(stats.inProgressTasks * 20, 20)}px` }} />
                <span className="font-semibold">{stats.inProgressTasks}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm">Done</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 rounded-full bg-green-500" style={{ width: `${Math.max(stats.doneTasks * 20, 20)}px` }} />
                <span className="font-semibold">{stats.doneTasks}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Stations Breakdown */}
      {stats.inProgressTasks > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">פילוח תחנות (In Progress)</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(Object.entries(stats.stationCounts) as [InProgressStation, number][]).map(([station, count]) => (
              <div key={station} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm">{stationLabels[station]}</span>
                <Badge variant="secondary" className="font-semibold">
                  {count}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* User Workload */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">עומס משתמשים</h3>
        </div>
        <div className="space-y-3">
          {stats.userWorkload.map((user) => (
            <div key={user.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="font-medium">{user.name}</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">אחראי:</span>
                  <Badge variant="secondary" className="font-semibold">{user.assigned}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">מטפל:</span>
                  <Badge variant="outline" className="font-semibold">{user.handling}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
