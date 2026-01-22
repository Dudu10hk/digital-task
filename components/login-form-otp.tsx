"use client"

import { useState } from "react"
import { useTaskContext } from "@/lib/task-context"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Mail, KeyRound } from "lucide-react"

export function LoginFormOTP() {
  const [email, setEmail] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [error, setError] = useState("")
  const [step, setStep] = useState<"email" | "otp">("email")
  const [loading, setLoading] = useState(false)
  const { login, users } = useTaskContext()

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      })

      if (error) throw error

      setStep("otp")
    } catch (err: any) {
      setError(err.message || "שגיאה בשליחת קוד")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode,
        type: "email",
      })

      if (error) throw error

      // Find user in our system
      const user = users.find((u) => u.email === email)
      if (user) {
        await login(email, user.password) // Login with existing user
      } else {
        setError("משתמש לא נמצא במערכת")
      }
    } catch (err: any) {
      setError(err.message || "קוד שגוי")
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = async (userEmail: string) => {
    const user = users.find((u) => u.email === userEmail)
    if (user) {
      setEmail(userEmail)
      const success = await login(userEmail, user.password)
      if (!success) {
        setError("שגיאה בהתחברות")
      }
    }
  }

  if (step === "otp") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 space-y-6 bg-card/80 backdrop-blur-sm border-2">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">הזן קוד אימות</h1>
            <p className="text-muted-foreground">
              שלחנו קוד למייל {email}
            </p>
          </div>

          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">קוד אימות</Label>
              <Input
                id="otp"
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="הזן את הקוד"
                required
                className="text-center text-2xl tracking-widest"
                maxLength={6}
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-right">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? "מאמת..." : "אמת והיכנס"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                setStep("email")
                setOtpCode("")
                setError("")
              }}
            >
              חזור
            </Button>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        <Card className="p-8 space-y-6 bg-card/80 backdrop-blur-sm border-2">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-l from-primary to-primary/60 bg-clip-text text-transparent">
              TaskFlow
            </h1>
            <h2 className="text-2xl font-semibold">ברוכים הבאים</h2>
            <p className="text-muted-foreground">
              התחברו כדי להמשיך לניהול הפרויקטים
            </p>
          </div>

          <form onSubmit={handleSendOTP} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">אימייל</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-right">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              <Mail className="w-4 h-4 ml-2" />
              {loading ? "שולח..." : "שלח קוד למייל"}
            </Button>
          </form>
        </Card>

        <div className="hidden lg:block space-y-6">
          <div className="text-right space-y-2">
            <h2 className="text-3xl font-bold">נהלו את הפרויקטים<br />שלכם בקלות</h2>
            <p className="text-muted-foreground text-lg">
              מערכת ניהול משימות מתקדמת שתעזור לכם לעקוב אחרי כל הפרויקטים במקום אחד
            </p>
          </div>

          {users.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-muted-foreground">גישה מהירה למשתמשים:</p>
              <div className="grid gap-2">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleQuickLogin(user.email)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/60 transition-all duration-200 group border border-transparent hover:border-primary/20"
                  >
                    <Avatar className="w-11 h-11 ring-2 ring-border group-hover:ring-primary/30 transition-all">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-right">
                      <div className="font-semibold">{user.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center justify-end gap-2">
                        <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs">
                          {user.role === "admin" ? "admin" : "user"}
                        </Badge>
                        <span>סיסמה: {user.password}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
