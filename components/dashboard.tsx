"use client"

import { useState } from "react"
import { useTaskContext } from "@/lib/task-context"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ListView } from "@/components/views/list-view"
import { BoardView } from "@/components/views/board-view"
import { CalendarView } from "@/components/views/calendar-view"
import { ArchiveView } from "@/components/views/archive-view"
import { TaskDialog } from "@/components/task-dialog"
import { NotificationsPanel } from "@/components/notifications-panel"
import { UserManagement } from "@/components/user-management"
import { StickyNotesSidebar } from "@/components/sticky-notes-sidebar"
import { LoadingSpinner } from "@/components/loading-spinner"
import { LayoutGrid, LogOut, Plus, List, Columns3, Calendar, User, Crown, Archive, BarChart3 } from "lucide-react"
import { AdvancedFilters, applyFilters, type FilterOptions } from "@/components/advanced-filters"
import { StatisticsDashboard } from "@/components/statistics-dashboard"

type ViewType = "list" | "board" | "calendar" | "archive" | "statistics"

export function Dashboard() {
  const { currentUser, logout, tasks, isAdmin, isViewer, loading } = useTaskContext()
  const [currentView, setCurrentView] = useState<ViewType>("board")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: "",
    priority: "all",
    status: "all",
    column: "all",
    assigneeId: "all",
    handlerId: "all",
    hasOverdueDate: null,
  })

  const filteredTasks = applyFilters(tasks, filters)

  const views = [
    { id: "board" as ViewType, label: "בורד", icon: Columns3 },
    { id: "list" as ViewType, label: "רשימה", icon: List },
    { id: "calendar" as ViewType, label: "לוח שנה", icon: Calendar },
    { id: "statistics" as ViewType, label: "סטטיסטיקות", icon: BarChart3 },
    { id: "archive" as ViewType, label: "ארכיון", icon: Archive },
  ]

  if (loading) {
    return <LoadingSpinner fullScreen text="טוען נתונים..." />
  }

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      {/* Sticky Notes Sidebar */}
      <StickyNotesSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-6">
          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
              <LayoutGrid className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">לוח משימות</h1>
              <p className="text-xs text-muted-foreground">{tasks.length} משימות פעילות</p>
            </div>
          </div>

          {/* Center - Search & Filters */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <AdvancedFilters onFilterChange={setFilters} />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <UserManagement />
            <NotificationsPanel />

            {/* Add Task Button */}
            {!isViewer() && (
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2 shadow-lg shadow-primary/25 h-10 px-5 font-medium rounded-lg">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">משימה חדשה</span>
              </Button>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-3 pr-2 h-10 rounded-lg hover:bg-muted/60">
                  <Avatar className="w-8 h-8 ring-2 ring-primary/20">
                    <AvatarImage src={currentUser?.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-sm font-semibold">
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline font-medium">{currentUser?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48" dir="rtl">
                <div className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{currentUser?.name}</p>
                    {isAdmin() && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {currentUser?.role === "admin" ? "מנהל מערכת" : "משתמש"}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="gap-2 text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4" />
                  התנתקות
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Sub Header - View Tabs */}
      <div className="bg-card border-b px-4 sm:px-6 py-2 sm:py-3 shadow-sm overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-2 min-w-max">
          {views.map((view) => (
            <Button
              key={view.id}
              variant={currentView === view.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentView(view.id)}
              className={`gap-1.5 sm:gap-2 rounded-lg h-8 sm:h-9 text-xs sm:text-sm font-medium ${currentView === view.id ? "shadow-md shadow-primary/20" : ""}`}
            >
              <view.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">{view.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 sm:p-6">
        {currentView === "list" && <ListView filteredTasks={filteredTasks} />}
        {currentView === "board" && <BoardView filteredTasks={filteredTasks} />}
        {currentView === "calendar" && <CalendarView filteredTasks={filteredTasks} />}
        {currentView === "statistics" && <StatisticsDashboard />}
        {currentView === "archive" && <ArchiveView />}
      </main>

      {/* Create Task Dialog */}
      <TaskDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} mode="create" />
      </div>
    </div>
  )
}
