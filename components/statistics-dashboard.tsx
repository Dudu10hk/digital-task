"use client"

import { useMemo } from "react"
import { useTaskContext } from "@/lib/task-context"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { statusConfig, inProgressStationConfig } from "@/lib/status-config"
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Target,
  Activity,
  Palette,
  Code,
  TestTube,
  Search,
  Layers,
  FileText,
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
    return <Icon className="w-4 h-4" />
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="w-20 justify-center bg-rose-50 text-rose-700 border-rose-200">דחוף</Badge>
                <span className="text-sm text-muted-foreground">משימות</span>
              </div>
              <div className="flex items-center gap-3 flex-1 justify-end">
                <div className="h-2 rounded-full bg-rose-500 transition-all duration-500" style={{ width: `${Math.min(stats.highPriority * 10, 100)}%`, maxWidth: '120px' }} />
                <span className="font-bold text-rose-700 min-w-[20px] text-right">{stats.highPriority}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="w-20 justify-center bg-amber-50 text-amber-700 border-amber-200">בינונית</Badge>
                <span className="text-sm text-muted-foreground">משימות</span>
              </div>
              <div className="flex items-center gap-3 flex-1 justify-end">
                <div className="h-2 rounded-full bg-amber-500 transition-all duration-500" style={{ width: `${Math.min(stats.mediumPriority * 10, 100)}%`, maxWidth: '120px' }} />
                <span className="font-bold text-amber-700 min-w-[20px] text-right">{stats.mediumPriority}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="w-20 justify-center bg-sky-50 text-sky-700 border-sky-200">נמוכה</Badge>
                <span className="text-sm text-muted-foreground">משימות</span>
              </div>
              <div className="flex items-center gap-3 flex-1 justify-end">
                <div className="h-2 rounded-full bg-sky-500 transition-all duration-500" style={{ width: `${Math.min(stats.lowPriority * 10, 100)}%`, maxWidth: '120px' }} />
                <span className="font-bold text-sky-700 min-w-[20px] text-right">{stats.lowPriority}</span>
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
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-400 shadow-sm" />
                <span className="text-sm font-medium">To Do</span>
              </div>
              <div className="flex items-center gap-3 flex-1 justify-end">
                <div className="h-2 rounded-full bg-slate-200 transition-all duration-500" style={{ width: `${Math.min(stats.todoTasks * 10, 100)}%`, maxWidth: '120px' }} />
                <span className="font-bold text-slate-700 min-w-[20px] text-right">{stats.todoTasks}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
                <span className="text-sm font-medium">In Progress</span>
              </div>
              <div className="flex items-center gap-3 flex-1 justify-end">
                <div className="h-2 rounded-full bg-blue-100 transition-all duration-500" style={{ width: `${Math.min(stats.inProgressTasks * 10, 100)}%`, maxWidth: '120px' }} />
                <span className="font-bold text-blue-700 min-w-[20px] text-right">{stats.inProgressTasks}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
                <span className="text-sm font-medium">Done</span>
              </div>
              <div className="flex items-center gap-3 flex-1 justify-end">
                <div className="h-2 rounded-full bg-emerald-100 transition-all duration-500" style={{ width: `${Math.min(stats.doneTasks * 10, 100)}%`, maxWidth: '120px' }} />
                <span className="font-bold text-emerald-700 min-w-[20px] text-right">{stats.doneTasks}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Stations Breakdown */}
      {stats.inProgressTasks > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">פילוח תחנות (In Progress)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.entries(stats.stationCounts) as [InProgressStation, number][]).map(([station, count]) => {
              const config = inProgressStationConfig[station]
              return (
                <div key={station} className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-md ${count > 0 ? config.bgClass : 'bg-slate-50/50 border-slate-100 opacity-60'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-white shadow-sm ${count > 0 ? 'text-primary' : 'text-slate-400'}`}>
                      {getStationIcon(config.icon)}
                    </div>
                    <span className="text-sm font-medium">{stationLabels[station]}</span>
                  </div>
                  <Badge variant={count > 0 ? "default" : "outline"} className={`font-bold min-w-[24px] h-6 flex items-center justify-center rounded-full ${count > 0 ? '' : 'text-slate-400 border-slate-200'}`}>
                    {count}
                  </Badge>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* User Workload */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-semibold text-lg">עומס משתמשים</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.userWorkload.map((user) => (
            <div key={user.name} className="flex items-center justify-between p-4 bg-slate-50/50 border border-slate-100 rounded-xl hover:bg-white hover:shadow-sm transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="font-semibold text-slate-700">{user.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">אחראי</span>
                  <Badge variant="secondary" className="bg-white border-slate-200 text-slate-700 font-bold shadow-sm">{user.assigned}</Badge>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">מטפל</span>
                  <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700 font-bold shadow-sm">{user.handling}</Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
