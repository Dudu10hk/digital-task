"use client"

import { useTaskContext } from "@/lib/task-context"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Users, Shield, User, Crown } from "lucide-react"
import type { UserRole } from "@/lib/types"

export function UserManagement() {
  const { users, currentUser, updateUserRole, isAdmin } = useTaskContext()

  if (!isAdmin()) return null

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">ניהול משתמשים</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            ניהול משתמשים והרשאות
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="text-sm text-muted-foreground mb-4">
            <p>מנהל מערכת יכול לערוך כל משימה במערכת.</p>
            <p>משתמש רגיל יכול לערוך רק משימות שהוא אחראי עליהן או מתויג בהן.</p>
          </div>
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
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
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-amber-500" />
                          מנהל מערכת
                        </div>
                      </SelectItem>
                      <SelectItem value="user">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          משתמש רגיל
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 mt-0.5 text-primary" />
              <p>לא ניתן לשנות את ההרשאות של עצמך. פנה למנהל מערכת אחר לצורך שינויים.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
