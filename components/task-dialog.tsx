"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTaskContext } from "@/lib/task-context"
import { statusConfig, statusOptions, boardColumns } from "@/lib/status-config"
import type { Task, TaskStatus, TaskPriority, BoardColumn } from "@/lib/types"
import { Link2, Upload, X, FileText, FileSpreadsheet, File } from "lucide-react"
import type { TaskFile } from "@/lib/types"

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  task?: Task
  defaultColumn?: BoardColumn
}

export function TaskDialog({ open, onOpenChange, mode, task, defaultColumn }: TaskDialogProps) {
  const { addTask, updateTask, users, currentUser } = useTaskContext()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [column, setColumn] = useState<BoardColumn>("todo")
  const [status, setStatus] = useState<TaskStatus>("todo")
  const [priority, setPriority] = useState<TaskPriority>("medium")
  const [dueDate, setDueDate] = useState("")
  const [assigneeId, setAssigneeId] = useState<string>("")
  const [figmaLink, setFigmaLink] = useState("")
  const [files, setFiles] = useState<TaskFile[]>([])

  useEffect(() => {
    if (mode === "edit" && task) {
      setTitle(task.title)
      setDescription(task.description)
      setColumn(task.column)
      setStatus(task.status)
      setPriority(task.priority)
      setDueDate(task.dueDate ? task.dueDate.toISOString().split("T")[0] : "")
      setAssigneeId(task.assigneeId || "")
      setFigmaLink(task.figmaLink || "")
      setFiles(task.files || [])
    } else {
      setTitle("")
      setDescription("")
      setColumn(defaultColumn || "todo")
      setStatus("todo")
      setPriority("medium")
      setDueDate("")
      setAssigneeId("")
      setFigmaLink("")
      setFiles([])
    }
  }, [mode, task, open, defaultColumn])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const assignee = users.find((u) => u.id === assigneeId)

    const taskData = {
      title,
      description,
      column,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      assigneeId: assigneeId || null,
      assigneeName: assignee?.name || null,
      assigneeAvatar: assignee?.avatar || null,
      taggedUserIds: mode === "edit" && task ? task.taggedUserIds : [],
      figmaLink: figmaLink || undefined,
      createdBy: currentUser?.id || "",
      files,
    }

    if (mode === "create") {
      addTask(taskData)
    } else if (task) {
      updateTask(task.id, taskData)
    }

    onOpenChange(false)
  }

  const priorityOptions = [
    { value: "high", label: "גבוהה", color: "bg-red-500" },
    { value: "medium", label: "בינונית", color: "bg-amber-500" },
    { value: "low", label: "נמוכה", color: "bg-blue-500" },
  ]

  const getFileType = (fileName: string): "pdf" | "excel" | "word" | "other" => {
    const ext = fileName.split(".").pop()?.toLowerCase()
    if (ext === "pdf") return "pdf"
    if (["xlsx", "xls", "csv"].includes(ext || "")) return "excel"
    if (["doc", "docx"].includes(ext || "")) return "word"
    return "other"
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-4 h-4 text-red-500" />
      case "excel":
        return <FileSpreadsheet className="w-4 h-4 text-green-600" />
      case "word":
        return <FileText className="w-4 h-4 text-blue-600" />
      default:
        return <File className="w-4 h-4 text-muted-foreground" />
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files
    if (!uploadedFiles) return

    const newFiles: TaskFile[] = Array.from(uploadedFiles).map((file) => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: getFileType(file.name),
      url: URL.createObjectURL(file),
      uploadedAt: new Date(),
      uploadedBy: currentUser?.id || "",
    }))

    setFiles((prev) => [...prev, ...newFiles])
    e.target.value = ""
  }

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0" dir="rtl">
        <DialogHeader className="p-6 pb-4 border-b bg-gradient-to-b from-primary/5 to-transparent">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-l from-primary to-primary/60 bg-clip-text text-transparent">
            {mode === "create" ? "משימה חדשה" : "עריכת משימה"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2.5">
            <Label htmlFor="title" className="text-sm font-semibold text-foreground/90">
              כותרת
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="הזן כותרת למשימה"
              required
              className="h-12 bg-muted/40 border border-border/40 focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/10 rounded-lg"
            />
          </div>

          {/* Description */}
          <div className="space-y-2.5">
            <Label htmlFor="description" className="text-sm font-semibold text-foreground/90">
              תיאור
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="תאר את המשימה..."
              rows={4}
              className="bg-muted/40 border border-border/40 focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/10 rounded-lg resize-none"
            />
          </div>

          {/* Column & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <Label className="text-sm font-semibold text-foreground/90">עמודה בבורד</Label>
              <Select value={column} onValueChange={(v) => setColumn(v as BoardColumn)}>
                <SelectTrigger className="h-12 bg-muted/40 border border-border/40 hover:bg-muted/60 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {boardColumns.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-3 h-3 rounded-full ${col.color}`} />
                        <span className="font-medium">{col.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2.5">
              <Label className="text-sm font-semibold text-foreground/90">סטטוס</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger className="h-12 bg-muted/40 border border-border/40 hover:bg-muted/60 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2.5">
                        <div className={`w-3 h-3 rounded-full ${statusConfig[opt.value].color}`} />
                        <span className="font-medium">{opt.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2.5">
              <Label className="text-sm font-semibold text-foreground/90">רמת דחיפות</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger className="h-12 bg-muted/40 border border-border/40 hover:bg-muted/60 rounded-lg">
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

            <div className="space-y-2.5">
              <Label htmlFor="dueDate" className="text-sm font-semibold text-foreground/90">
                תאריך יעד
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-12 bg-muted/40 border border-border/40 focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/10 rounded-lg"
              />
            </div>
          </div>

          {/* Assignee */}
          <div className="space-y-2.5">
            <Label className="text-sm font-semibold text-foreground/90">אחראי</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger className="h-12 bg-muted/40 border border-border/40 hover:bg-muted/60 rounded-lg">
                <SelectValue placeholder="בחר אחראי" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-7 h-7 ring-2 ring-background">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Files Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
              <Upload className="w-4 h-4" />
              קבצים מצורפים
            </Label>
            <div className="space-y-3">
              <label className="flex items-center justify-center gap-2.5 h-20 bg-gradient-to-br from-muted/40 to-muted/20 rounded-xl cursor-pointer hover:from-muted/60 hover:to-muted/40 transition-all border-2 border-dashed border-border/40 hover:border-primary/40 group">
                <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <div className="text-center">
                  <span className="text-sm font-medium text-foreground/80 block">לחץ להעלאת קבצים</span>
                  <span className="text-xs text-muted-foreground">PDF, Excel, Word</span>
                </div>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              
              {files.length > 0 && (
                <div className="space-y-2 pt-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl group hover:bg-muted/50 transition-all border border-border/30"
                    >
                      <div className="p-2 bg-background rounded-lg">
                        {getFileIcon(file.type)}
                      </div>
                      <span className="text-sm font-medium flex-1 truncate">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Figma Link */}
          <div className="space-y-2.5">
            <Label htmlFor="figmaLink" className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              קישור Figma
            </Label>
            <Input
              id="figmaLink"
              type="url"
              value={figmaLink}
              onChange={(e) => setFigmaLink(e.target.value)}
              placeholder="https://www.figma.com/..."
              dir="ltr"
              className="h-12 bg-muted/40 border border-border/40 focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/10 rounded-lg"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t">
            <Button type="submit" className="flex-1 h-12 font-semibold text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30">
              {mode === "create" ? "צור משימה" : "שמור שינויים"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="h-12 px-8 font-semibold border-border/40 hover:bg-muted/60"
            >
              ביטול
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
