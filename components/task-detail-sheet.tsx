"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { FigmaPreview } from "@/components/figma-preview"
import { MentionInput } from "@/components/mention-input"
import { useTaskContext } from "@/lib/task-context"
import { statusConfig, columnConfig, inProgressStationConfig } from "@/lib/status-config"
import type { Task, TaskStatus, TaskPriority, BoardColumn, InProgressStation } from "@/lib/types"
import {
  Calendar,
  User,
  Clock,
  FileText,
  MessageSquare,
  History,
  Figma,
  Upload,
  Send,
  Trash2,
  ExternalLink,
  Eye,
  Columns3,
  Wrench,
  Navigation,
  Palette,
  Code,
  TestTube,
  Search,
  Users as UsersIcon,
  Layers,
} from "lucide-react"
import { format } from "date-fns"
import { he } from "date-fns/locale"

interface TaskDetailSheetProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskDetailSheet({ task, open, onOpenChange }: TaskDetailSheetProps) {
  const { updateTask, addComment, deleteTask, users, currentUser, canEditTask, isViewer, updateInProgressStation, updateHandler } = useTaskContext()
  const [newComment, setNewComment] = useState("")
  const [taggedUserIds, setTaggedUserIds] = useState<string[]>([])
  const [showFigmaPreview, setShowFigmaPreview] = useState(false)
  const canEdit = canEditTask(task)

  const statusOptions = Object.entries(statusConfig).map(([value, config]) => ({
    value: value as TaskStatus,
    label: config.label,
    color: config.color,
  }))

  const columnOptions = Object.entries(columnConfig).map(([value, config]) => ({
    value: value as BoardColumn,
    label: config.label,
    color: config.color,
  }))

  const priorityOptions = [
    { value: "high", label: "גבוהה", color: "bg-red-500" },
    { value: "medium", label: "בינונית", color: "bg-amber-500" },
    { value: "low", label: "נמוכה", color: "bg-blue-500" },
  ]

  const stationOptions = Object.entries(inProgressStationConfig).map(([value, config]) => ({
    value: value as InProgressStation,
    label: config.label,
    color: config.color,
    icon: config.icon,
  }))

  const getStationIcon = (iconName: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      Palette,
      Code,
      TestTube,
      Search,
      Users: UsersIcon,
      Layers,
    }
    const Icon = icons[iconName] || FileText
    return <Icon className="w-4 h-4" />
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-4 h-4 text-red-500" />
      case "excel":
        return <FileText className="w-4 h-4 text-green-600" />
      case "word":
        return <FileText className="w-4 h-4 text-blue-600" />
      default:
        return <FileText className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getFileType = (fileName: string): "pdf" | "excel" | "word" | "other" => {
    const ext = fileName.split(".").pop()?.toLowerCase()
    if (ext === "pdf") return "pdf"
    if (["xlsx", "xls", "csv"].includes(ext || "")) return "excel"
    if (["doc", "docx"].includes(ext || "")) return "word"
    return "other"
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files
    if (!uploadedFiles || !currentUser) return

    const newFiles = Array.from(uploadedFiles).map((file) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: getFileType(file.name),
      url: URL.createObjectURL(file),
      uploadedAt: new Date(),
      uploadedBy: currentUser.id,
    }))

    // Add files to task
    updateTask(task.id, { 
      files: [...task.files, ...newFiles] 
    })
    
    // Reset input
    e.target.value = ""
  }

  const handleStatusChange = (status: TaskStatus) => {
    updateTask(task.id, { status })
  }

  const handleColumnChange = (column: BoardColumn) => {
    updateTask(task.id, { column })
  }

  const handlePriorityChange = (priority: TaskPriority) => {
    updateTask(task.id, { priority })
  }

  const handleAssigneeChange = (assigneeId: string) => {
    const assignee = users.find((u) => u.id === assigneeId)
    updateTask(task.id, {
      assigneeId,
      assigneeName: assignee?.name || null,
      assigneeAvatar: assignee?.avatar || null,
    })
  }

  const handleHandlerChange = (handlerId: string) => {
    updateHandler(task.id, handlerId)
  }

  const handleStationChange = (station: InProgressStation) => {
    updateInProgressStation(task.id, station, task.stationNote)
  }

  const handleCommentChange = (value: string, tagged: string[]) => {
    setNewComment(value)
    setTaggedUserIds(tagged)
  }

  const handleAddComment = () => {
    if (!newComment.trim() || isViewer()) return
    addComment(task.id, newComment, taggedUserIds)
    setNewComment("")
    setTaggedUserIds([])
  }

  const handleDelete = () => {
    deleteTask(task.id)
    onOpenChange(false)
  }

  const renderCommentWithMentions = (content: string) => {
    let result = content
    users.forEach((user) => {
      const mention = `@${user.name}`
      result = result.replace(new RegExp(mention, "g"), `<span class="text-primary font-semibold">${mention}</span>`)
    })
    return <span dangerouslySetInnerHTML={{ __html: result }} />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden" dir="rtl">
        <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-b from-primary/5 to-transparent">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-right text-2xl font-bold leading-tight bg-gradient-to-l from-primary to-primary/60 bg-clip-text text-transparent">
                {task.title}
              </DialogTitle>
              {!canEdit && (
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  צפייה בלבד
                </p>
              )}
            </div>
            {canEdit && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent dir="rtl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>מחיקת משימה</AlertDialogTitle>
                    <AlertDialogDescription>
                      האם את/ה בטוח/ה שברצונך למחוק את המשימה? פעולה זו לא ניתנת לביטול.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel>ביטול</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      מחק
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Column & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <Label className="text-muted-foreground text-xs font-semibold flex items-center gap-2 uppercase tracking-wide">
                  <Columns3 className="w-4 h-4" />
                  עמודה בבורד
                </Label>
                <Select value={task.column} onValueChange={(v) => handleColumnChange(v as BoardColumn)} disabled={!canEdit}>
                  <SelectTrigger className="bg-muted/40 border border-border/40 hover:bg-muted/60 rounded-lg h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {columnOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2.5">
                          <div className={`w-3 h-3 rounded-full ${opt.color}`} />
                          <span className="font-medium">{opt.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">סטטוס</Label>
                <Select value={task.status} onValueChange={(v) => handleStatusChange(v as TaskStatus)} disabled={!canEdit}>
                  <SelectTrigger className="bg-muted/40 border border-border/40 hover:bg-muted/60 rounded-lg h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2.5">
                          <div className={`w-3 h-3 rounded-full ${opt.color}`} />
                          <span className="font-medium">{opt.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-2.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">רמת דחיפות</Label>
              <Select value={task.priority} onValueChange={(v) => handlePriorityChange(v as TaskPriority)} disabled={!canEdit}>
                <SelectTrigger className="bg-muted/40 border border-border/40 hover:bg-muted/60 rounded-lg h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-3 h-3 rounded-full ${opt.color}`} />
                        <span className="font-medium">{opt.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* In Progress Station */}
            {task.column === "in-progress" && (
              <div className="space-y-3 p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
                <Label className="flex items-center gap-2 text-sm font-semibold">
                  <Navigation className="w-4 h-4" />
                  תחנה נוכחית
                </Label>
                {task.inProgressStation && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`px-3 py-1.5 rounded-lg ${inProgressStationConfig[task.inProgressStation].color} text-white flex items-center gap-2 font-medium`}>
                      {getStationIcon(inProgressStationConfig[task.inProgressStation].icon)}
                      {inProgressStationConfig[task.inProgressStation].label}
                    </div>
                  </div>
                )}

                {task.stationNote && (
                  <div className="text-sm text-muted-foreground bg-background/50 p-3 rounded-lg">
                    {task.stationNote}
                  </div>
                )}

                {canEdit && (
                  <div className="space-y-2">
                    <Select value={task.inProgressStation} onValueChange={(v) => handleStationChange(v as InProgressStation)}>
                      <SelectTrigger className="bg-background border border-border/40 hover:bg-muted/60 rounded-lg h-11">
                        <SelectValue placeholder="בחר תחנה" />
                      </SelectTrigger>
                      <SelectContent>
                        {stationOptions.map((station) => (
                          <SelectItem key={station.value} value={station.value}>
                            <div className="flex items-center gap-2.5">
                              {getStationIcon(station.icon)}
                              <span className="font-medium">{station.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Textarea
                      value={task.stationNote || ""}
                      onChange={(e) => updateTask(task.id, { stationNote: e.target.value })}
                      placeholder="הערה מתאימה לתחנה הנוכחית..."
                      rows={2}
                      className="bg-background border border-border/40 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 rounded-lg resize-none"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Assignee & Handler */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <Label className="text-muted-foreground text-xs font-semibold flex items-center gap-2 uppercase tracking-wide">
                  <User className="w-4 h-4" />
                  אחראי כללי
                </Label>
                <Select value={task.assigneeId || ""} onValueChange={handleAssigneeChange} disabled={!canEdit}>
                  <SelectTrigger className="bg-muted/40 border border-border/40 hover:bg-muted/60 rounded-lg h-11">
                    <SelectValue placeholder="בחר אחראי" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-6 h-6 ring-2 ring-background">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-[9px] bg-primary/10 text-primary">{user.name.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <Label className="text-muted-foreground text-xs font-semibold flex items-center gap-2 uppercase tracking-wide">
                  <Wrench className="w-4 h-4" />
                  גורם מטפל
                </Label>
                <Select value={task.handlerId || ""} onValueChange={handleHandlerChange} disabled={!canEdit}>
                  <SelectTrigger className="bg-muted/40 border border-border/40 hover:bg-muted/60 rounded-lg h-11">
                    <SelectValue placeholder="בחר גורם מטפל" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="w-6 h-6 ring-2 ring-amber-400">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-[9px] bg-amber-100 text-amber-700">{user.name.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-2.5">
              <Label className="text-muted-foreground text-xs font-semibold flex items-center gap-2 uppercase tracking-wide">
                <Calendar className="w-4 h-4" />
                תאריך יעד
              </Label>
              <Input
                type="date"
                value={task.dueDate ? task.dueDate.toISOString().split("T")[0] : ""}
                onChange={(e) =>
                  updateTask(task.id, {
                    dueDate: e.target.value ? new Date(e.target.value) : null,
                  })
                }
                className="bg-muted/40 border border-border/40 focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/10 rounded-lg h-11"
                disabled={!canEdit}
              />
            </div>

            {/* Description */}
            <div className="space-y-2.5">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">תיאור</Label>
              <Textarea
                value={task.description}
                onChange={(e) => updateTask(task.id, { description: e.target.value })}
                placeholder="הוסף תיאור למשימה..."
                rows={4}
                className="bg-muted/40 border border-border/40 focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/10 rounded-lg resize-none"
                disabled={!canEdit}
              />
            </div>

            {/* Figma Link */}
            {task.figmaLink && (
              <div className="space-y-3">
                <Label className="text-muted-foreground text-xs font-semibold flex items-center gap-2 uppercase tracking-wide">
                  <Figma className="w-4 h-4" />
                  קישור Figma
                </Label>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-purple-200 hover:border-purple-300 rounded-lg h-11 font-medium"
                    onClick={() => setShowFigmaPreview(true)}
                  >
                    <Eye className="w-4 h-4" />
                    תצוגה מקדימה
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 bg-transparent hover:bg-muted/60 border-border/40 rounded-lg h-11 font-medium"
                    onClick={() => window.open(task.figmaLink, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4" />
                    פתח בחלון חדש
                  </Button>
                </div>
              </div>
            )}

            {/* Process Spec Link */}
            {task.processSpecLink && (
              <div className="space-y-3">
                <Label className="text-muted-foreground text-xs font-semibold flex items-center gap-2 uppercase tracking-wide">
                  <FileText className="w-4 h-4" />
                  קישור לאפיון תהליך
                </Label>
                <Button
                  variant="outline"
                  className="w-full gap-2 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 rounded-lg h-11 font-medium"
                  onClick={() => window.open(task.processSpecLink, "_blank")}
                >
                  <ExternalLink className="w-4 h-4" />
                  פתח אפיון תהליך
                </Button>
              </div>
            )}

            <Separator className="my-6" />

            {/* Tabs for Files, Comments, History */}
            <Tabs defaultValue="comments" className="w-full">
              <TabsList className="w-full grid grid-cols-3 bg-muted/40 p-1 rounded-lg h-12">
                <TabsTrigger value="comments" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md rounded-md font-medium">
                  <MessageSquare className="w-4 h-4" />
                  הערות ({task.comments.length})
                </TabsTrigger>
                <TabsTrigger value="files" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md rounded-md font-medium">
                  <FileText className="w-4 h-4" />
                  קבצים ({task.files.length})
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md rounded-md font-medium">
                  <History className="w-4 h-4" />
                  היסטוריה
                </TabsTrigger>
              </TabsList>

              <TabsContent value="comments" className="mt-5 space-y-4">
                {!isViewer() && (
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <MentionInput
                        value={newComment}
                        onChange={handleCommentChange}
                        placeholder="הקלד @ כדי לתייג משתמש"
                        rows={2}
                      />
                    </div>
                    <Button
                      size="icon"
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="self-start shadow-lg shadow-primary/25 h-11 w-11 rounded-lg"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-3 pt-2">
                  {task.comments.map((comment) => (
                    <div key={comment.id} className="bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl p-4 border border-border/30">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="w-8 h-8 ring-2 ring-background">
                          <AvatarFallback className="text-[11px] bg-primary/10 text-primary font-semibold">
                            {comment.authorName.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-sm">{comment.authorName}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(comment.createdAt, "d MMM, HH:mm", { locale: he })}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed pr-11">{renderCommentWithMentions(comment.content)}</p>
                      {comment.taggedUserIds && comment.taggedUserIds.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground pr-11">
                          <span>תויגו:</span>
                          {comment.taggedUserIds.map((userId) => {
                            const user = users.find((u) => u.id === userId)
                            return user ? (
                              <span key={userId} className="text-primary font-medium">
                                @{user.name}
                              </span>
                            ) : null
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                  {task.comments.length === 0 && (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
                      <p className="text-muted-foreground text-sm">אין הערות עדיין</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="files" className="mt-5 space-y-4">
                {/* Upload Button */}
                {canEdit && !isViewer() && (
                  <label className="flex items-center justify-center gap-2 w-full h-12 bg-transparent border-dashed border-2 border-border/40 rounded-lg font-medium cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all group">
                    <Upload className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm">העלאת קובץ</span>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {/* Files List */}
                <div className="space-y-3 pt-2">
                  {task.files.map((file) => (
                    <div key={file.id} className="flex items-center gap-3 p-4 bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl border border-border/30 hover:border-border/60 transition-colors group">
                      <div className="p-2 bg-background rounded-lg">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(file.uploadedAt, "d MMM yyyy", { locale: he })}
                        </p>
                      </div>
                      
                      {/* File Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* View/Download */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                          onClick={() => {
                            // Open file in new tab or download
                            if (file.url.startsWith('blob:')) {
                              // For blob URLs, trigger download
                              const a = document.createElement('a')
                              a.href = file.url
                              a.download = file.name
                              document.body.appendChild(a)
                              a.click()
                              document.body.removeChild(a)
                            } else {
                              // For regular URLs, open in new tab
                              window.open(file.url, '_blank')
                            }
                          }}
                          title="צפה/הורד"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {/* Download */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-blue-500/10 hover:text-blue-600"
                          onClick={() => {
                            const a = document.createElement('a')
                            a.href = file.url
                            a.download = file.name
                            document.body.appendChild(a)
                            a.click()
                            document.body.removeChild(a)
                          }}
                          title="הורד"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>

                        {/* Delete (only if can edit) */}
                        {canEdit && !isViewer() && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                title="מחק קובץ"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent dir="rtl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>האם למחוק את הקובץ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  הקובץ "{file.name}" יימחק לצמיתות מהמשימה.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>ביטול</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => {
                                    // Remove file from task
                                    const updatedFiles = task.files.filter(f => f.id !== file.id)
                                    updateTask(task.id, { files: updatedFiles })
                                  }}
                                >
                                  מחק קובץ
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </div>
                  ))}
                  {task.files.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
                      <p className="text-muted-foreground text-sm">אין קבצים עדיין</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-5">
                <div className="space-y-4 pt-2">
                  {task.history.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3 pb-4 border-b border-border/40 last:border-0">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-primary/60 mt-1.5 shrink-0 shadow-md shadow-primary/30" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-semibold">{entry.userName}</span>{" "}
                          {entry.action === "created" && "יצר/ה את המשימה"}
                          {entry.action === "station_changed" && entry.stationFrom && entry.stationTo && (
                            <>
                              שינה/תה את התחנה מ-
                              <span className="font-medium text-blue-600">
                                {inProgressStationConfig[entry.stationFrom].label}
                              </span>
                              {" "}ל-
                              <span className="font-medium text-blue-600">
                                {inProgressStationConfig[entry.stationTo].label}
                              </span>
                            </>
                          )}
                          {entry.action === "handler_changed" && (
                            <>
                              {entry.oldValue && entry.newValue ? (
                                <>
                                  החליף/ה את{" "}
                                  <span className="font-medium text-amber-600">{entry.oldValue}</span>
                                  {" "}ב-
                                  <span className="font-medium text-amber-600">{entry.newValue}</span>
                                  {" "}כגורם מטפל
                                </>
                              ) : entry.newValue ? (
                                <>
                                  הקצה את{" "}
                                  <span className="font-medium text-amber-600">{entry.newValue}</span>
                                  {" "}כגורם מטפל
                                </>
                              ) : (
                                "הסיר/ה את הגורם המטפל"
                              )}
                            </>
                          )}
                          {entry.action === "updated" && (
                            <>
                              עדכן/ה את{" "}
                              {entry.field === "status" ? "הסטטוס" : 
                               entry.field === "column" ? "העמודה" : 
                               entry.field === "assigneeId" ? "האחראי" :
                               entry.field === "priority" ? "רמת הדחיפות" :
                               entry.field === "description" ? "התיאור" :
                               entry.field}
                              {entry.oldValue && entry.newValue && (
                                <span className="text-muted-foreground">
                                  {" "}
                                  מ-{entry.oldValue} ל-{entry.newValue}
                                </span>
                              )}
                            </>
                          )}
                          {entry.action === "comment_added" && "הוסיף/ה הערה"}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                          <Clock className="w-3 h-3" />
                          {format(entry.timestamp, "d MMM yyyy, HH:mm", { locale: he })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        {/* Figma Preview Modal */}
        {task.figmaLink && (
          <FigmaPreview url={task.figmaLink} open={showFigmaPreview} onOpenChange={setShowFigmaPreview} />
        )}
      </DialogContent>
    </Dialog>
  )
}
