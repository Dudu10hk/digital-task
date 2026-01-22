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
import { TaskDialog } from "@/components/task-dialog"
import { NotificationsPanel } from "@/components/notifications-panel"
import { UserManagement } from "@/components/user-management"
import { LayoutGrid, LogOut, Plus, List, Columns3, Calendar, User, Search, Crown } from "lucide-react"
import { Input } from "@/components/ui/input"

type ViewType = "list" | "board" | "calendar"

export function Dashboard() {
  const { currentUser, logout, tasks, isAdmin } = useTaskContext()
  const [currentView, setCurrentView] = useState<ViewType>("board")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const views = [
    { id: "board" as ViewType, label: "בורד", icon: Columns3 },
    { id: "list" as ViewType, label: "רשימה", icon: List },
    { id: "calendar" as ViewType, label: "לוח שנה", icon: Calendar },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between h-16 px-6">
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

          {/* Center - Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש משימות..."
                className="pr-10 bg-muted/40 border border-border/40 focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/10 rounded-lg h-10"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <UserManagement />
            <NotificationsPanel />

            {/* Add Task Button */}
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2 shadow-lg shadow-primary/25 h-10 px-5 font-medium rounded-lg">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">משימה חדשה</span>
            </Button>

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
              <DropdownMenuContent align="start" className="w-48">
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
      <div className="bg-card border-b px-6 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          {views.map((view) => (
            <Button
              key={view.id}
              variant={currentView === view.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setCurrentView(view.id)}
              className={`gap-2 rounded-lg h-9 font-medium ${currentView === view.id ? "shadow-md shadow-primary/20" : ""}`}
            >
              <view.icon className="w-4 h-4" />
              {view.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6">
        {currentView === "list" && <ListView />}
        {currentView === "board" && <BoardView />}
        {currentView === "calendar" && <CalendarView />}
      </main>

      {/* Create Task Dialog */}
      <TaskDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} mode="create" />
    </div>
  )
}
