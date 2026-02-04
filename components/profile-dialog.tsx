"use client"

import { useState, useRef, useEffect } from "react"
import { useTaskContext } from "@/lib/task-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { User, Upload, Link as LinkIcon, Loader2, Crown, Eye } from "lucide-react"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { currentUser, updateUserAvatar, isAdmin } = useTaskContext()
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar || "")
  const [uploadMethod, setUploadMethod] = useState<"upload" | "url">("upload")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // עדכן את avatarUrl כש-currentUser משתנה או כשהדיאלוג נפתח
  useEffect(() => {
    if (open && currentUser) {
      setAvatarUrl(currentUser.avatar || "")
    }
  }, [open, currentUser])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // בדיקת גודל קובץ (מקסימום 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("הקובץ גדול מדי. גודל מקסימלי: 5MB")
      return
    }

    // בדיקת סוג קובץ
    if (!file.type.startsWith("image/")) {
      toast.error("יש להעלות קובץ תמונה בלבד")
      return
    }

    setUploading(true)

    try {
      // Convert image to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string
        
        // עדכן את ה-avatar של המשתמש
        await updateUserAvatar(base64String)
        setAvatarUrl(base64String)
        toast.success("תמונת הפרופיל עודכנה בהצלחה!")
        
        // רענן את הדף כדי לראות את התמונה החדשה בכל מקום
        setTimeout(() => {
          window.location.reload()
        }, 1000)
        
        setUploading(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      }
      reader.onerror = () => {
        toast.error("שגיאה בקריאת הקובץ")
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast.error("שגיאה בהעלאת התמונה")
      setUploading(false)
    }
  }

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!avatarUrl.trim()) {
      toast.error("יש להזין URL של תמונה")
      return
    }

    // בדיקה בסיסית של URL
    try {
      new URL(avatarUrl)
    } catch {
      toast.error("URL לא תקין")
      return
    }

    setUploading(true)

    try {
      await updateUserAvatar(avatarUrl)
      toast.success("תמונת הפרופיל עודכנה בהצלחה!")
      
      // רענן את הדף כדי לראות את התמונה החדשה בכל מקום
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("Error updating avatar:", error)
      toast.error("שגיאה בעדכון תמונת הפרופיל")
    } finally {
      setUploading(false)
    }
  }

  const getRoleBadge = () => {
    if (!currentUser) return null
    
    if (currentUser.role === "admin") {
      return (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-md text-xs font-medium">
          <Crown className="w-3.5 h-3.5" />
          מנהל מערכת
        </div>
      )
    }
    
    if (currentUser.role === "viewer") {
      return (
        <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md text-xs font-medium">
          <Eye className="w-3.5 h-3.5" />
          צופה
        </div>
      )
    }
    
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs font-medium">
        <User className="w-3.5 h-3.5" />
        משתמש רגיל
      </div>
    )
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newPassword || !confirmPassword) {
      toast.error("יש למלא את כל השדות")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("הסיסמאות לא תואמות")
      return
    }

    if (newPassword.length < 6) {
      toast.error("הסיסמה חייבת להיות לפחות 6 תווים")
      return
    }

    setIsChangingPassword(true)

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser?.id,
          newPassword: newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "שגיאה בשינוי הסיסמה")
        return
      }

      toast.success("הסיסמה שונתה בהצלחה!")
      setNewPassword("")
      setConfirmPassword("")
      
      // Close dialog after success
      setTimeout(() => {
        onOpenChange(false)
      }, 1500)
    } catch (error) {
      console.error("Error changing password:", error)
      toast.error("שגיאה בשינוי הסיסמה")
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>עדכון פרופיל</DialogTitle>
          <DialogDescription>
            עדכן את תמונת הפרופיל שלך
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current User Info */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <Avatar className="w-16 h-16 ring-2 ring-primary/20">
              <AvatarImage src={currentUser?.avatar || avatarUrl || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-lg font-semibold">
                <User className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-sm">{currentUser?.name}</p>
              <p className="text-xs text-muted-foreground mb-2">{currentUser?.email}</p>
              {getRoleBadge()}
            </div>
          </div>

          {/* Upload Tabs */}
          <Tabs value={uploadMethod} onValueChange={(v) => setUploadMethod(v as "upload" | "url")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="gap-2">
                <Upload className="w-4 h-4" />
                העלאת קובץ
              </TabsTrigger>
              <TabsTrigger value="url" className="gap-2">
                <LinkIcon className="w-4 h-4" />
                קישור
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <div className="space-y-2">
                <Label>העלה תמונה חדשה</Label>
                <div className="flex flex-col gap-3">
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    גודל מקסימלי: 5MB • פורמטים נתמכים: JPG, PNG, GIF, WebP
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="url" className="space-y-4">
              <form onSubmit={handleUrlSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="avatar-url">URL תמונה</Label>
                  <Input
                    id="avatar-url"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    disabled={uploading}
                  />
                  <p className="text-xs text-muted-foreground">
                    הזן קישור ישיר לתמונה
                  </p>
                </div>

                <Button type="submit" disabled={uploading || !avatarUrl.trim()} className="w-full">
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      שומר...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-4 h-4 ml-2" />
                      שמור URL
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {uploading && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              מעלה תמונה...
            </div>
          )}

          {/* Change Password Section */}
          <div className="pt-4 border-t">
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <h3 className="font-semibold text-sm">שינוי סיסמה</h3>
              
              <div className="space-y-2">
                <Label htmlFor="new-password">סיסמה חדשה</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="הזן סיסמה חדשה"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isChangingPassword}
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">אימות סיסמה</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="הזן את הסיסמה שוב"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isChangingPassword}
                  minLength={6}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                הסיסמה חייבת להיות לפחות 6 תווים
              </p>

              <Button 
                type="submit" 
                disabled={isChangingPassword || !newPassword || !confirmPassword}
                className="w-full"
                variant="outline"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    משנה סיסמה...
                  </>
                ) : (
                  "שנה סיסמה"
                )}
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
