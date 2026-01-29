"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTaskContext } from "@/lib/task-context"
import type { TaskPriority } from "@/lib/types"
import { ClipboardList, User, Users as UsersIcon, AlertCircle, Link2, FileText } from "lucide-react"

interface PlanningTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PlanningTaskDialog({ open, onOpenChange }: PlanningTaskDialogProps) {
  const { addTask, users, currentUser } = useTaskContext()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState<TaskPriority>("medium")
  const [assigneeId, setAssigneeId] = useState<string>("")
  const [businessUnit, setBusinessUnit] = useState("")
  const [figmaLink, setFigmaLink] = useState("")
  const [processSpecLink, setProcessSpecLink] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) return

    const assignee = users.find((u) => u.id === assigneeId)

    // Create planning task with isPlanning flag
    addTask({
      title: title.trim(),
      description: description.trim(),
      column: "todo",
      status: "todo",
      priority,
      dueDate: null,
      assigneeId: assigneeId || null,
      assigneeName: assignee?.name || null,
      assigneeAvatar: assignee?.avatar || null,
      handlerId: null,
      handlerName: null,
      handlerAvatar: null,
      taggedUserIds: [],
      figmaLink: figmaLink || undefined,
      processSpecLink: processSpecLink || undefined,
      createdBy: currentUser?.id || "",
      files: [],
      isPlanning: true,
      planningReceivedAt: new Date(),
      // Store business unit in station note for now (can be moved to dedicated field later)
      stationNote: businessUnit ? `גורם בחטיבה העסקית: ${businessUnit}` : undefined,
    })

    // Reset form
    setTitle("")
    setDescription("")
    setPriority("medium")
    setAssigneeId("")
    setBusinessUnit("")
    setFigmaLink("")
    setProcessSpecLink("")
    onOpenChange(false)
  }

  const priorityOptions = [
    { value: "high", label: "גבוהה", color: "bg-red-500" },
    { value: "medium", label: "בינונית", color: "bg-amber-500" },
    { value: "low", label: "נמוכה", color: "bg-blue-500" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-right text-2xl font-bold flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            משימת תכנון חדשה
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          {/* Title */}
          <div className="space-y-2.5">
            <Label htmlFor="title" className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              כותרת המשימה
              <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="תיאור קצר של המשימה"
              required
              className="h-12 bg-muted/40 border-border/40 focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/10 rounded-lg"
            />
          </div>

          {/* Description */}
          <div className="space-y-2.5">
            <Label htmlFor="description" className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              תת כותרת / פירוט משימה
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="פרטים נוספים על המשימה..."
              rows={4}
              className="resize-none bg-muted/40 border-border/40 focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/10 rounded-lg"
            />
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
              className="h-12 bg-muted/40 border-border/40 focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/10 rounded-lg"
            />
          </div>

          {/* Process Spec Link */}
          <div className="space-y-2.5">
            <Label htmlFor="processSpecLink" className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              קישור לאפיון תהליך
            </Label>
            <Input
              id="processSpecLink"
              type="url"
              value={processSpecLink}
              onChange={(e) => setProcessSpecLink(e.target.value)}
              placeholder="https://..."
              dir="ltr"
              className="h-12 bg-muted/40 border-border/40 focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/10 rounded-lg"
            />
          </div>

          {/* Priority */}
          <div className="space-y-2.5">
            <Label className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              עדיפות
            </Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
              <SelectTrigger className="h-12 bg-muted/40 border-border/40 focus:bg-background rounded-lg">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${priorityOptions.find(p => p.value === priority)?.color}`} />
                    <span>{priorityOptions.find(p => p.value === priority)?.label}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${option.color}`} />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assignee */}
          <div className="space-y-2.5">
            <Label className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
              <User className="w-4 h-4" />
              גורם אחראי
            </Label>
            <Select value={assigneeId || "unassigned"} onValueChange={(value) => setAssigneeId(value === "unassigned" ? "" : value)}>
              <SelectTrigger className="h-12 bg-muted/40 border-border/40 focus:bg-background rounded-lg">
                <SelectValue placeholder="בחר אחראי">
                  {assigneeId ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={users.find(u => u.id === assigneeId)?.avatar || undefined} />
                        <AvatarFallback className="text-xs">
                          {users.find(u => u.id === assigneeId)?.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{users.find(u => u.id === assigneeId)?.name}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">ללא אחראי</span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">
                  <span className="text-muted-foreground">ללא אחראי</span>
                </SelectItem>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={user.avatar || undefined} />
                        <AvatarFallback className="text-xs">
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Business Unit Contact */}
          <div className="space-y-2.5">
            <Label htmlFor="businessUnit" className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
              <UsersIcon className="w-4 h-4" />
              גורם בחטיבה העסקית
            </Label>
            <Input
              id="businessUnit"
              value={businessUnit}
              onChange={(e) => setBusinessUnit(e.target.value)}
              placeholder="שם איש קשר / גורם בחטיבה העסקית"
              className="h-12 bg-muted/40 border-border/40 focus:bg-background focus:border-primary/50 focus:ring-2 focus:ring-primary/10 rounded-lg"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t">
            <Button 
              type="submit" 
              className="flex-1 h-12 font-semibold text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30"
              disabled={!title.trim()}
            >
              צור משימת תכנון
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
