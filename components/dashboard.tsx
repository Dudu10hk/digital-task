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
import { PlanningView } from "@/components/views/planning-view"
import { TaskDialog } from "@/components/task-dialog"
import { NotificationsPanel } from "@/components/notifications-panel"
import { UserManagement } from "@/components/user-management"
import { StickyNotesSidebar } from "@/components/sticky-notes-sidebar"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ProfileDialog } from "@/components/profile-dialog"
import { LayoutGrid, LogOut, Plus, List, Columns3, Calendar, User, Crown, Archive, BarChart3, Settings, ClipboardList } from "lucide-react"
import { AdvancedFilters, applyFilters, type FilterOptions } from "@/components/advanced-filters"
import { StatisticsDashboard } from "@/components/statistics-dashboard"

type ViewType = "list" | "board" | "calendar" | "archive" | "statistics" | "planning"

export function Dashboard() {
  const { currentUser, logout, tasks, isAdmin, isViewer, loading } = useTaskContext()
  const [currentView, setCurrentView] = useState<ViewType>("board")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: "",
    priority: "all",
    status: "all",
    column: "all",
    assigneeId: "all",
    handlerId: "all",
    hasOverdueDate: null,
  })

  // Debug function to force refresh user from DB
  const forceRefreshUser = async () => {
    if (!currentUser) return
    
    try {
      const response = await fetch('/api/debug/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.email })
      })
      
      const data = await response.json()
      
      if (data?.user) {
        console.log('🔄 Force refreshing user:', data.user)
        localStorage.setItem('currentUser', JSON.stringify(data.user))
        window.location.reload()
      }
    } catch (e) {
      console.error('Failed to refresh user:', e)
    }
  }

  const filteredTasks = applyFilters(tasks, filters)
  
  // For regular views (board, list, calendar), exclude planning tasks
  const nonPlanningTasks = filteredTasks.filter(task => !task.isPlanning)
  
  // Update task count to exclude planning tasks
  const activeTasksCount = tasks.filter(task => !task.isPlanning).length

  const views = [
    { id: "board" as ViewType, label: "בורד", icon: Columns3 },
    { id: "list" as ViewType, label: "רשימה", icon: List },
    { id: "calendar" as ViewType, label: "לוח שנה", icon: Calendar },
    { id: "statistics" as ViewType, label: "סטטיסטיקות", icon: BarChart3 },
    { id: "archive" as ViewType, label: "ארכיון", icon: Archive },
  ]

  // Add planning view only for admins
  if (isAdmin()) {
    views.push({ id: "planning" as ViewType, label: "תכנון", icon: ClipboardList })
  }

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
        <header className="bg-card/80 backdrop-blur-md border-b sticky top-0 z-[60] shadow-sm">
        <div className="flex items-center justify-between h-16 sm:h-20 px-4 sm:px-8">
          {/* Logo & Title */}
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 transform -rotate-3 hover:rotate-0 transition-transform">
              <LayoutGrid className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground/90">מערכת משימות</h1>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{activeTasksCount} משימות בביצוע</p>
              </div>
            </div>
          </div>

          {/* Center - Search & Filters */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-12">
            <AdvancedFilters onFilterChange={setFilters} />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <UserManagement />
            <NotificationsPanel />

            {/* Add Task Button */}
            {!isViewer() && (
              <Button 
                onClick={() => setIsCreateDialogOpen(true)} 
                className="gap-2 shadow-xl shadow-primary/20 h-11 px-6 font-bold rounded-xl bg-primary hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline text-sm">משימה חדשה</span>
              </Button>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-3 pr-2 h-11 rounded-xl hover:bg-muted/80 border border-transparent hover:border-border/50 transition-all">
                  <Avatar className="w-9 h-9 ring-2 ring-primary/10">
                    <AvatarImage src={currentUser?.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-sm font-black">
                      {currentUser?.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start text-right">
                    <span className="text-sm font-bold leading-none mb-1">{currentUser?.name}</span>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                      {currentUser?.role === "admin" ? "מנהל מערכת" : "חבר צוות"}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-3 py-2" dir="rtl">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{currentUser?.name}</p>
                    {isAdmin() && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {currentUser?.role === "admin" ? "מנהל מערכת" : "משתמש"}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsProfileDialogOpen(true)} className="gap-2">
                  <Settings className="w-4 h-4" />
                  עדכון פרופיל
                </DropdownMenuItem>
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
      <div className="bg-card/50 backdrop-blur-sm border-b px-4 sm:px-8 py-3 sm:py-4 overflow-x-auto">
        <div className="flex items-center justify-between gap-4 min-w-max">
          <div className="flex items-center gap-2">
            {views.map((view) => (
              <Button
                key={view.id}
                variant={currentView === view.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentView(view.id)}
                className={`gap-2 rounded-xl h-10 px-4 text-sm font-bold transition-all ${
                  currentView === view.id 
                    ? "shadow-lg shadow-primary/20 scale-105" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <view.icon className="w-4 h-4" />
                <span>{view.label}</span>
              </Button>
            ))}
          </div>
          
          <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground/60 uppercase tracking-widest bg-muted/30 px-4 py-2 rounded-full border border-border/20">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#676879]" />
              <span>To Do</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#0086c0]" />
              <span>In Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#00c875]" />
              <span>Done</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 sm:p-6">
        {currentView === "list" && <ListView filteredTasks={nonPlanningTasks} />}
        {currentView === "board" && <BoardView filteredTasks={nonPlanningTasks} />}
        {currentView === "calendar" && <CalendarView filteredTasks={nonPlanningTasks} />}
        {currentView === "statistics" && <StatisticsDashboard />}
        {currentView === "archive" && <ArchiveView />}
        {currentView === "planning" && <PlanningView filteredTasks={filteredTasks} />}
      </main>

      {/* Create Task Dialog */}
      <TaskDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} mode="create" />
      
      {/* Profile Dialog */}
      <ProfileDialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen} />
      </div>
    </div>
  )
}
