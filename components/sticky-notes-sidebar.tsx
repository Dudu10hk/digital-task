"use client"

import { useState } from "react"
import { useTaskContext } from "@/lib/task-context"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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
import { StickyNote, Trash2, Edit, Check, X, ChevronRight, ChevronLeft, Plus } from "lucide-react"
import type { StickyNote as StickyNoteType } from "@/lib/types"
import { format } from "date-fns"
import { he } from "date-fns/locale"

const colorOptions: Array<{ value: StickyNoteType["color"]; label: string; bg: string; text: string }> = [
  { value: "yellow", label: "צהוב", bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-900 dark:text-yellow-100" },
  { value: "blue", label: "כחול", bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-900 dark:text-blue-100" },
  { value: "green", label: "ירוק", bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-900 dark:text-green-100" },
  { value: "pink", label: "ורוד", bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-900 dark:text-pink-100" },
  { value: "purple", label: "סגול", bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-900 dark:text-purple-100" },
]

export function StickyNotesSidebar() {
  const { stickyNotes, currentUser, addStickyNote, updateStickyNote, deleteStickyNote } = useTaskContext()
  const [isOpen, setIsOpen] = useState(true)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [newNoteContent, setNewNoteContent] = useState("")
  const [newNoteColor, setNewNoteColor] = useState<StickyNoteType["color"]>("yellow")

  const userNotes = stickyNotes.filter((note) => note.userId === currentUser?.id)

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return
    addStickyNote(newNoteContent.trim(), newNoteColor)
    setNewNoteContent("")
    setNewNoteColor("yellow")
  }

  const handleStartEdit = (note: StickyNoteType) => {
    setEditingNoteId(note.id)
    setEditContent(note.content)
  }

  const handleSaveEdit = () => {
    if (!editingNoteId || !editContent.trim()) return
    updateStickyNote(editingNoteId, editContent.trim())
    setEditingNoteId(null)
    setEditContent("")
  }

  const handleCancelEdit = () => {
    setEditingNoteId(null)
    setEditContent("")
  }

  const getColorClasses = (color: StickyNoteType["color"]) => {
    const option = colorOptions.find((c) => c.value === color)
    return option || colorOptions[0]
  }

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed left-2 sm:left-4 top-16 sm:top-20 z-[60] w-9 h-9 sm:w-10 sm:h-10 rounded-full shadow-lg bg-card border transition-all ${
          isOpen ? "translate-x-[260px] sm:translate-x-[280px]" : ""
        }`}
      >
        {isOpen ? <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" /> : <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-16 sm:top-20 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] w-[260px] sm:w-[280px] bg-card border-r shadow-xl z-50 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b bg-gradient-to-br from-primary/5 to-primary/10">
            <div className="flex items-center gap-2 mb-3">
              <StickyNote className="w-5 h-5 text-primary shrink-0" />
              <h2 className="font-bold text-lg truncate">הפתקים שלי</h2>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {userNotes.length} פתקים אישיים
            </p>
          </div>

          {/* Add New Note */}
          <div className="p-4 border-b space-y-3">
            <Textarea
              placeholder="הוסף פתק חדש..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              className="min-h-20 resize-none text-sm"
            />
            <div className="flex gap-2">
              <Select value={newNoteColor} onValueChange={(v: StickyNoteType["color"]) => setNewNoteColor(v)}>
                <SelectTrigger className="flex-1 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded ${color.bg}`} />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddNote} size="sm" className="gap-1 h-9">
                <Plus className="w-4 h-4" />
                הוסף
              </Button>
            </div>
          </div>

          {/* Notes List */}
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-3">
              {userNotes.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <StickyNote className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>אין פתקים עדיין</p>
                  <p className="text-xs mt-1">הוסף פתק ראשון</p>
                </div>
              ) : (
                userNotes.map((note) => {
                  const colorClasses = getColorClasses(note.color)
                  return (
                    <div
                      key={note.id}
                      className={`p-3 rounded-lg shadow-md border-2 ${colorClasses.bg} ${colorClasses.text} border-transparent hover:border-primary/20 transition-all`}
                    >
                      {editingNoteId === note.id ? (
                        // Edit Mode
                        <div className="space-y-2">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-20 resize-none text-sm bg-background/50"
                            autoFocus
                          />
                          <div className="flex gap-1">
                            <Button
                              onClick={handleSaveEdit}
                              size="sm"
                              variant="ghost"
                              className="flex-1 h-8 gap-1"
                            >
                              <Check className="w-3 h-3" />
                              שמור
                            </Button>
                            <Button
                              onClick={handleCancelEdit}
                              size="sm"
                              variant="ghost"
                              className="flex-1 h-8 gap-1"
                            >
                              <X className="w-3 h-3" />
                              ביטול
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // View Mode
                        <div className="space-y-2">
                          <p className="text-sm whitespace-pre-wrap break-words">{note.content}</p>
                          <div className="flex items-center justify-between pt-2 border-t border-current/10">
                            <span className="text-xs opacity-60">
                              {format(note.updatedAt, "dd/MM HH:mm", { locale: he })}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                onClick={() => handleStartEdit(note)}
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 hover:bg-background/50"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0 hover:bg-destructive/20 hover:text-destructive"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent dir="rtl">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>למחוק פתק זה?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      פעולה זו תמחק את הפתק לצמיתות
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>ביטול</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteStickyNote(note.id)}
                                      className="bg-destructive text-destructive-foreground"
                                    >
                                      מחק
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  )
}
