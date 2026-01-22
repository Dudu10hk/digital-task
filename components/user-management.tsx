"use client"

import { useState } from "react"
import { useTaskContext } from "@/lib/task-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Users, Shield, User, Crown, Trash2, UserPlus, Edit, Eye } from "lucide-react"
import type { UserRole } from "@/lib/types"
import { toast } from "sonner"

export function UserManagement() {
  const { users, currentUser, updateUserRole, isAdmin, addUser, deleteUser, editUser, tasks } = useTaskContext()
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newAvatar, setNewAvatar] = useState("")
  const [newRole, setNewRole] = useState<UserRole>("user")
  
  // Edit user state
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editPassword, setEditPassword] = useState("")
  const [editAvatar, setEditAvatar] = useState("")

  if (!isAdmin()) return null

  const handleAddUser = async () => {
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      toast.error("שם, אימייל וסיסמה הם שדות חובה")
      return
    }

    // Check if email already exists
    if (users.some((u) => u.email === newEmail)) {
      toast.error("משתמש עם אימייל זה כבר קיים")
      return
    }

    try {
      await addUser({
        name: newName.trim(),
        email: newEmail.trim(),
        password: newPassword.trim(),
        avatar: newAvatar.trim() || undefined,
        role: newRole,
      })

      toast.success(`המשתמש ${newName} נוסף בהצלחה`)
      
      // Reset form
      setNewName("")
      setNewEmail("")
      setNewPassword("")
      setNewAvatar("")
      setNewRole("user")
    } catch (error) {
      toast.error("שגיאה בהוספת משתמש")
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    try {
      const success = await deleteUser(userId)
      
      if (!success) {
        toast.error("לא ניתן למחוק משתמש שמוקצה למשימות פעילות")
      } else {
        toast.success(`המשתמש ${userName} הוסר מהמערכת`)
      }
    } catch (error) {
      toast.error("שגיאה במחיקת משתמש")
    }
  }

  const hasActiveTasks = (userId: string) => {
    return tasks.some(
      (task) =>
        (task.assigneeId === userId || task.handlerId === userId) &&
        task.column !== "done"
    )
  }

  const handleStartEdit = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    if (user) {
      setEditingUserId(userId)
      setEditName(user.name)
      setEditEmail(user.email)
      setEditPassword(user.password)
      setEditAvatar(user.avatar || "")
    }
  }

  const handleCancelEdit = () => {
    setEditingUserId(null)
    setEditName("")
    setEditEmail("")
    setEditPassword("")
    setEditAvatar("")
  }

  const handleSaveEdit = async () => {
    if (!editingUserId) return

    if (!editName.trim() || !editEmail.trim() || !editPassword.trim()) {
      toast.error("שם, אימייל וסיסמה הם שדות חובה")
      return
    }

    try {
      const success = await editUser(editingUserId, {
        name: editName.trim(),
        email: editEmail.trim(),
        password: editPassword.trim(),
        avatar: editAvatar.trim() || undefined,
      })

      if (!success) {
        toast.error("אימייל זה כבר בשימוש")
        return
      }

      toast.success("המשתמש עודכן בהצלחה")
      handleCancelEdit()
    } catch (error) {
      toast.error("שגיאה בעדכון משתמש")
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">ניהול משתמשים</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            ניהול משתמשים והרשאות
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-4">
          {/* Add New User Form */}
          <div className="space-y-3 p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
            <Label className="text-base font-semibold flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              הוספת משתמש חדש
            </Label>
            <div className="grid gap-3">
              <div className="space-y-2">
                <Label htmlFor="newName" className="text-sm">שם מלא *</Label>
                <Input
                  id="newName"
                  placeholder="הזן שם מלא"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-background h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newEmail" className="text-sm">אימייל *</Label>
                <Input
                  id="newEmail"
                  type="email"
                  placeholder="user@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="bg-background h-11"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm">סיסמה *</Label>
                <Input
                  id="newPassword"
                  type="text"
                  placeholder="הזן סיסמה"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-background h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newAvatar" className="text-sm">URL תמונה (אופציונלי)</Label>
                <Input
                  id="newAvatar"
                  placeholder="https://..."
                  value={newAvatar}
                  onChange={(e) => setNewAvatar(e.target.value)}
                  className="bg-background h-11"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">הרשאות</Label>
                <Select value={newRole} onValueChange={(v: UserRole) => setNewRole(v)}>
                  <SelectTrigger className="bg-background h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        משתמש רגיל
                      </div>
                    </SelectItem>
                    <SelectItem value="viewer">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-sky-500" />
                        צופה (נעול)
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-500" />
                        מנהל מערכת
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddUser} className="w-full gap-2 h-11 font-semibold">
                <UserPlus className="w-4 h-4" />
                הוסף משתמש
              </Button>
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">משתמשים קיימים</Label>
            <div className="text-sm text-muted-foreground mb-4 space-y-1">
              <p>• <strong>מנהל מערכת:</strong> שליטה מלאה, כולל ניהול משתמשים ועריכת כל המשימות.</p>
              <p>• <strong>משתמש רגיל:</strong> יכול לערוך משימות שהוא אחראי עליהן, מטפל בהן או מתויג בהן.</p>
              <p>• <strong>צופה:</strong> גישה לקריאה בלבד (נעול). לא יכול לבצע שינויים או להזיז משימות.</p>
            </div>
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="rounded-lg border bg-card p-3 space-y-3"
                >
                  {editingUserId === user.id ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="font-semibold">עריכת משתמש</Label>
                        <Badge variant="outline" className="text-xs">במצב עריכה</Badge>
                      </div>
                      <div className="grid gap-3">
                        <div className="space-y-2">
                          <Label className="text-sm">שם מלא *</Label>
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">אימייל *</Label>
                          <Input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="h-10"
                            dir="ltr"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">סיסמה *</Label>
                          <Input
                            type="text"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">URL תמונה (אופציונלי)</Label>
                          <Input
                            value={editAvatar}
                            onChange={(e) => setEditAvatar(e.target.value)}
                            className="h-10"
                            dir="ltr"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleSaveEdit} size="sm" className="flex-1">
                            שמור שינויים
                          </Button>
                          <Button onClick={handleCancelEdit} size="sm" variant="outline" className="flex-1">
                            ביטול
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 ring-2 ring-border">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              <User className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{user.name}</span>
                              {user.id === currentUser?.id && (
                                <Badge variant="outline" className="text-xs">את/ה</Badge>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">{user.email}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={user.role}
                            onValueChange={(value: UserRole) => updateUserRole(user.id, value)}
                            disabled={user.id === currentUser?.id}
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-muted-foreground" />
                                  משתמש רגיל
                                </div>
                              </SelectItem>
                              <SelectItem value="viewer">
                                <div className="flex items-center gap-2">
                                  <Eye className="w-4 h-4 text-sky-500" />
                                  צופה (נעול)
                                </div>
                              </SelectItem>
                              <SelectItem value="admin">
                                <div className="flex items-center gap-2">
                                  <Crown className="w-4 h-4 text-amber-500" />
                                  מנהל מערכת
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          
                          {/* Edit User Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleStartEdit(user.id)}
                            className="h-9 w-9 hover:bg-primary/10 hover:text-primary"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          {/* Delete User Button */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={user.id === currentUser?.id}
                                className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent dir="rtl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>למחוק את {user.name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {hasActiveTasks(user.id) ? (
                                    <span className="text-destructive font-medium">
                                      לא ניתן למחוק משתמש שמוקצה למשימות פעילות. יש להעביר את המשימות למשתמש אחר תחילה.
                                    </span>
                                  ) : user.id === currentUser?.id ? (
                                    <span className="text-destructive font-medium">
                                      לא ניתן למחוק את עצמך מהמערכת.
                                    </span>
                                  ) : (
                                    "פעולה זו תסיר את המשתמש מהמערכת לצמיתות. פעולה זו אינה ניתנת לביטול."
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>ביטול</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user.id, user.name)}
                                  disabled={hasActiveTasks(user.id) || user.id === currentUser?.id}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  מחק משתמש
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 mt-0.5 text-primary" />
              <p>לא ניתן לשנות את ההרשאות של עצמך או למחוק את עצמך. פנה למנהל מערכת אחר לצורך שינויים.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
