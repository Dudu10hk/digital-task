"use client"

import { useState } from "react"
import { useTaskContext } from "@/lib/task-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Archive, Search, Undo2, CheckCircle2, Trash2, Calendar, User, Clock, History } from "lucide-react"
import { format } from "date-fns"
import { he } from "date-fns/locale"
import { statusConfig } from "@/lib/status-config"

export function ArchiveView() {
  const { archivedTasks, currentUser, restoreTask, getUserById } = useTaskContext()
  const [filter, setFilter] = useState<"all" | "completed" | "deleted">("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTasks = archivedTasks
    .filter((task) => {
      if (filter === "all") return true
      return task.archiveReason === filter
    })
    .filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const handleRestore = (taskId: string) => {
    restoreTask(taskId)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center shadow-lg">
            <Archive className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">ארכיון משימות</h1>
            <p className="text-sm text-muted-foreground">
              {filteredTasks.length} משימות בארכיון
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש במשימות מאורכבות..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 h-11"
          />
        </div>
        <Select value={filter} onValueChange={(v: typeof filter) => setFilter(v)}>
          <SelectTrigger className="w-full sm:w-48 h-11">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל המשימות</SelectItem>
            <SelectItem value="completed">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                הושלמו
              </div>
            </SelectItem>
            <SelectItem value="deleted">
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-destructive" />
                נמחקו
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tasks List */}
      <ScrollArea className="h-[calc(100vh-280px)]">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Archive className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">אין משימות בארכיון</h3>
            <p className="text-sm text-muted-foreground/70 mt-2">
              משימות שהושלמו או נמחקו יופיעו כאן
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTasks.map((task) => {
              const archivedByUser = getUserById(task.archivedBy)
              return (
                <div
                  key={task.id}
                  className="p-5 rounded-xl border bg-card hover:shadow-md transition-all space-y-4"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-semibold">{task.title}</h3>
                        <Badge
                          variant={task.archiveReason === "completed" ? "default" : "destructive"}
                          className="gap-1"
                        >
                          {task.archiveReason === "completed" ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              הושלמה
                            </>
                          ) : (
                            <>
                              <Trash2 className="w-3 h-3" />
                              נמחקה
                            </>
                          )}
                        </Badge>
                        <Badge variant="outline" className={statusConfig[task.priority].color}>
                          {statusConfig[task.priority].label}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 shrink-0">
                          <Undo2 className="w-4 h-4" />
                          שחזר
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent dir="rtl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>לשחזר את המשימה?</AlertDialogTitle>
                          <AlertDialogDescription>
                            המשימה "{task.title}" תחזור ללוח המשימות הפעילות
                            {task.archiveReason === "deleted" ? " (תועבר ל-To Do)" : ""}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ביטול</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRestore(task.id)}>
                            שחזר משימה
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-4 text-sm">
                    {task.assigneeId && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">אחראי:</span>
                        <span className="font-medium">{getUserById(task.assigneeId)?.name || "לא ידוע"}</span>
                      </div>
                    )}
                    {task.dueDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">תאריך יעד:</span>
                        <span>{format(new Date(task.dueDate), "dd/MM/yyyy", { locale: he })}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">אורכב:</span>
                      <span>{format(new Date(task.archivedAt), "dd/MM/yyyy HH:mm", { locale: he })}</span>
                    </div>
                    {archivedByUser && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">על ידי:</span>
                        <span>{archivedByUser.name}</span>
                      </div>
                    )}
                  </div>

                  {/* History */}
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <History className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-sm">היסטוריה</span>
                      <Badge variant="outline" className="text-xs">
                        {task.history.length} פעולות
                      </Badge>
                    </div>
                    <ScrollArea className="max-h-48">
                      <div className="space-y-2">
                        {task.history.slice(0, 5).map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-start gap-3 p-2 rounded-lg bg-muted/40 text-sm"
                          >
                            <Avatar className="w-6 h-6 shrink-0">
                              <AvatarImage
                                src={getUserById(entry.userId)?.avatar || "/placeholder.svg"}
                              />
                              <AvatarFallback className="text-xs">
                                {entry.userName?.split(" ").map((n) => n[0]).join("") || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-muted-foreground">
                                <span className="font-medium text-foreground">{entry.userName || "משתמש"}</span>
                                {" "}
                                {entry.action === "created" && "יצר/ה את המשימה"}
                                {entry.action === "updated" && `עדכן/ה ${entry.field || ""}`}
                                {entry.action === "status_changed" && "שינה/תה סטטוס"}
                                {entry.action === "column_changed" && "העביר/ה עמודה"}
                                {entry.action === "comment_added" && "הוסיף/ה הערה"}
                                {entry.action === "handler_changed" && "שינה/תה גורם מטפל"}
                                {entry.action === "station_changed" && "שינה/תה תחנה"}
                              </p>
                              <p className="text-xs text-muted-foreground/70">
                                {format(new Date(entry.timestamp), "dd/MM/yyyy HH:mm", { locale: he })}
                              </p>
                            </div>
                          </div>
                        ))}
                        {task.history.length > 5 && (
                          <p className="text-xs text-muted-foreground text-center py-2">
                            ועוד {task.history.length - 5} פעולות...
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
