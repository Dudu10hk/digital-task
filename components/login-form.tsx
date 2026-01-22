"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTaskContext } from "@/lib/task-context"
import { AlertCircle, LayoutGrid, ArrowLeft, CheckCircle2, Users, Clock } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login } = useTaskContext()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const success = await login(email, password)
    if (!success) {
      setError("אימייל או סיסמה שגויים")
    }
  }

  const features = [
    { icon: CheckCircle2, text: "ניהול משימות חכם" },
    { icon: Users, text: "שיתוף פעולה קל" },
    { icon: Clock, text: "מעקב זמן אמת" },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-primary-foreground">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold">TaskFlow</span>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-bold text-primary-foreground leading-tight">
              נהלו את הפרויקטים
              <br />
              שלכם בקלות
            </h2>
            <p className="text-primary-foreground/80 mt-4 text-lg max-w-md">
              מערכת ניהול משימות מתקדמת שתעזור לכם לעקוב אחרי כל הפרויקטים במקום אחד
            </p>
          </div>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 text-primary-foreground/90">
                <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center">
                  <feature.icon className="w-5 h-5" />
                </div>
                <span className="font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-primary-foreground/60 text-sm">© 2025 TaskFlow. כל הזכויות שמורות.</div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center space-y-3">
            <div className="mx-auto w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25">
              <LayoutGrid className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">TaskFlow</h1>
          </div>

          {/* Header */}
          <div className="text-center lg:text-right">
            <h1 className="text-3xl font-bold tracking-tight">ברוכים הבאים</h1>
            <p className="text-muted-foreground mt-2">התחברו כדי להמשיך לניהול הפרויקטים</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                אימייל
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-right bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 text-base"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold">
                סיסמה
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 text-base"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full h-12 font-semibold text-base shadow-lg shadow-primary/25 gap-2">
              התחברות
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
