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
import { statusConfig, columnConfig } from "@/lib/status-config"
import type { Task, TaskStatus, TaskPriority, BoardColumn } from "@/lib/types"
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
} from "lucide-react"
import { format } from "date-fns"
import { he } from "date-fns/locale"

interface TaskDetailSheetProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskDetailSheet({ task, open, onOpenChange }: TaskDetailSheetProps) {
  const { updateTask, addComment, deleteTask, users, currentUser, canEditTask } = useTaskContext()
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
    })
  }

  const handleCommentChange = (value: string, tagged: string[]) => {
    setNewComment(value)
    setTaggedUserIds(tagged)
  }

  const handleAddComment = () => {
    if (!newComment.trim()) return
    addComment(task.id, newComment, taggedUserIds)
    setNewComment("")
    setTaggedUserIds([])
  }

  const handleDelete = () => {
    deleteTask(task.id)
    onOpenChange(false)
  }

  const getFileIcon = (type: string) => {
    return <FileText className="w-4 h-4" />
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
        <DialogHeader className="p-6 pb-4 border-b bg-muted/30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-right text-xl font-bold leading-tight">{task.title}</DialogTitle>
              {!canEdit && (
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
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
                    className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
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
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs font-semibold flex items-center gap-2 uppercase tracking-wide">
                  <Columns3 className="w-4 h-4" />
                  עמודה בבורד
                </Label>
                <Select value={task.column} onValueChange={(v) => handleColumnChange(v as BoardColumn)} disabled={!canEdit}>
                  <SelectTrigger className="bg-muted/50 border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {columnOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${opt.color}`} />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">סטטוס</Label>
                <Select value={task.status} onValueChange={(v) => handleStatusChange(v as TaskStatus)} disabled={!canEdit}>
                  <SelectTrigger className="bg-muted/50 border-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full ${opt.color}`} />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">רמת דחיפות</Label>
              <Select value={task.priority} onValueChange={(v) => handlePriorityChange(v as TaskPriority)} disabled={!canEdit}>
                <SelectTrigger className="bg-muted/50 border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${opt.color}`} />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assignee & Due Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground text-xs font-semibold flex items-center gap-2 uppercase tracking-wide">
                  <User className="w-4 h-4" />
                  אחראי
                </Label>
                <Select value={task.assigneeId || ""} onValueChange={handleAssigneeChange} disabled={!canEdit}>
                  <SelectTrigger className="bg-muted/50 border-0">
                    <SelectValue placeholder="בחר אחראי" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-5 h-5">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-[8px]">{user.name.slice(0, 2)}</AvatarFallback>
                          </Avatar>
                          {user.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
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
                  className="bg-muted/50 border-0"
                  disabled={!canEdit}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-muted-foreground text-xs font-semibold uppercase tracking-wide">תיאור</Label>
              <Textarea
                value={task.description}
                onChange={(e) => updateTask(task.id, { description: e.target.value })}
                placeholder="הוסף תיאור למשימה..."
                rows={3}
                className="bg-muted/50 border-0 resize-none"
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
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                    onClick={() => setShowFigmaPreview(true)}
                  >
                    <Eye className="w-4 h-4" />
                    תצוגה מקדימה
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 bg-transparent"
                    onClick={() => window.open(task.figmaLink, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4" />
                    פתח בחלון חדש
                  </Button>
                </div>
              </div>
            )}

            <Separator />

            {/* Tabs for Files, Comments, History */}
            <Tabs defaultValue="comments" className="w-full">
              <TabsList className="w-full grid grid-cols-3 bg-muted/50">
                <TabsTrigger value="comments" className="gap-2 data-[state=active]:bg-background">
                  <MessageSquare className="w-4 h-4" />
                  הערות ({task.comments.length})
                </TabsTrigger>
                <TabsTrigger value="files" className="gap-2 data-[state=active]:bg-background">
                  <FileText className="w-4 h-4" />
                  קבצים ({task.files.length})
                </TabsTrigger>
                <TabsTrigger value="history" className="gap-2 data-[state=active]:bg-background">
                  <History className="w-4 h-4" />
                  היסטוריה
                </TabsTrigger>
              </TabsList>

              <TabsContent value="comments" className="mt-4 space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <MentionInput
                      value={newComment}
                      onChange={handleCommentChange}
                      placeholder="הוסף הערה... (הקלד @ לתיוג)"
                      rows={2}
                    />
                  </div>
                  <Button
                    size="icon"
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="self-start shadow-md shadow-primary/20"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                {/* Comments List */}
                <div className="space-y-3">
                  {task.comments.map((comment) => (
                    <div key={comment.id} className="bg-muted/50 rounded-xl p-4">
                      <div className="flex items-center gap-2.5 mb-2">
                        <Avatar className="w-7 h-7 ring-2 ring-background">
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                            {comment.authorName.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-sm">{comment.authorName}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(comment.createdAt, "d MMM, HH:mm", { locale: he })}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{renderCommentWithMentions(comment.content)}</p>
                      {comment.taggedUserIds && comment.taggedUserIds.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
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
                    <p className="text-center text-muted-foreground text-sm py-8">אין הערות עדיין</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="files" className="mt-4 space-y-4">
                {/* Upload Button (Demo) */}
                <Button variant="outline" className="w-full gap-2 bg-transparent border-dashed" disabled>
                  <Upload className="w-4 h-4" />
                  העלאת קובץ (דורש חיבור Blob)
                </Button>

                {/* Files List */}
                <div className="space-y-2">
                  {task.files.map((file) => (
                    <div key={file.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                      {getFileIcon(file.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(file.uploadedAt, "d MMM yyyy", { locale: he })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {task.files.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-8">אין קבצים מצורפים</p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <div className="space-y-3">
                  {task.history.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-semibold">{entry.userName}</span>{" "}
                          {entry.action === "created" && "יצר/ה את המשימה"}
                          {entry.action === "updated" && (
                            <>
                              עדכן/ה את{" "}
                              {entry.field === "status" ? "הסטטוס" : entry.field === "column" ? "העמודה" : entry.field}
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
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
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
