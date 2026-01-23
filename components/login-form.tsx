"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTaskContext } from "@/lib/task-context"
import { AlertCircle, LayoutGrid, ArrowLeft, ArrowRight, CheckCircle2, Users, Clock, Mail, ShieldCheck, Key, Smartphone } from "lucide-react"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type LoginStep = "email" | "otp"
type LoginMethod = "otp" | "password"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [step, setStep] = useState<LoginStep>("email")
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("otp")
  const [loading, setLoading] = useState(false)
  const { loginWithOTP, login } = useTaskContext()

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'שגיאה בשליחת הקוד')
        setLoading(false)
        return
      }

      // אם הקוד הוחזר (מצב Test), נציג אותו
      if (data.code) {
        toast.success(`קוד האימות שלך: ${data.code}`, {
          duration: 30000, // 30 שניות
          description: 'העתק את הקוד והזן אותו למטה'
        })
      } else {
        toast.success('קוד האימות נשלח למייל שלך!')
      }
      
      setStep("otp")
    } catch (err) {
      setError('שגיאה בשליחת הקוד. נסה שוב.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const success = await login(email, password)
      
      if (!success) {
        setError('אימייל או סיסמה שגויים')
      }
    } catch (err) {
      setError('שגיאה בהתחברות. נסה שוב.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (otp.length !== 6) {
      setError('יש להזין קוד בן 6 ספרות')
      setLoading(false)
      return
    }

    console.log('🔐 Verifying OTP:', { email, otp, length: otp.length })

    try {
      const success = await loginWithOTP(email, otp)
      
      if (!success) {
        setError('קוד שגוי או פג תוקף')
        setOtp("")
      }
    } catch (err) {
      setError('שגיאה באימות הקוד. נסה שוב.')
      setOtp("")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setOtp("")
    setError("")
    setLoading(true)

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        // אם הקוד הוחזר (מצב Test), נציג אותו
        if (data.code) {
          toast.success(`קוד האימות שלך: ${data.code}`, {
            duration: 30000, // 30 שניות
            description: 'העתק את הקוד והזן אותו למטה'
          })
        } else {
          toast.success('קוד חדש נשלח למייל שלך!')
        }
      } else {
        toast.error('שגיאה בשליחת קוד חדש')
      }
    } catch (err) {
      toast.error('שגיאה בשליחת קוד חדש')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToEmail = () => {
    setStep("email")
    setOtp("")
    setError("")
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
            <h1 className="text-3xl font-bold tracking-tight">
              {step === "email" ? "ברוכים הבאים" : "אימות זהות"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {step === "email" 
                ? "בחרו את שיטת ההתחברות המועדפת עליכם" 
                : "הזן את הקוד ששלחנו למייל שלך"}
            </p>
          </div>

          {/* Step 1: Login Methods */}
          {step === "email" && (
            <Tabs value={loginMethod} onValueChange={(v) => setLoginMethod(v as LoginMethod)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="otp" className="gap-2">
                  <Smartphone className="w-4 h-4" />
                  קוד חד-פעמי
                </TabsTrigger>
                <TabsTrigger value="password" className="gap-2">
                  <Key className="w-4 h-4" />
                  סיסמה
                </TabsTrigger>
              </TabsList>

              {/* OTP Tab */}
              <TabsContent value="otp" className="space-y-5">
                <form onSubmit={handleSendOTP} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email-otp" className="text-sm font-semibold flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      אימייל
                    </Label>
                    <Input
                      id="email-otp"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="h-12 text-right bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 text-base"
                      dir="ltr"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-xl">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-12 font-semibold text-base shadow-lg shadow-primary/25 gap-2"
                  >
                    {loading ? "שולח קוד..." : "שלח קוד אימות"}
                    <ArrowLeft className="w-4 h-4" />
                  </Button>

                  <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-xl text-sm text-muted-foreground">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>נשלח קוד בן 6 ספרות למייל שלך</span>
                  </div>
                </form>
              </TabsContent>

              {/* Password Tab */}
              <TabsContent value="password" className="space-y-5">
                <form onSubmit={handlePasswordLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email-password" className="text-sm font-semibold flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      אימייל
                    </Label>
                    <Input
                      id="email-password"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="h-12 text-right bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 text-base"
                      dir="ltr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-semibold flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      סיסמה
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="h-12 text-right bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20 text-base"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-xl">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-12 font-semibold text-base shadow-lg shadow-primary/25 gap-2"
                  >
                    {loading ? "מתחבר..." : "התחבר"}
                    <ArrowLeft className="w-4 h-4" />
                  </Button>

                  <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-xl text-sm text-muted-foreground">
                    <Key className="w-4 h-4 shrink-0" />
                    <span>השתמש בסיסמה הקבועה שהוגדרה לך</span>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          )}

          {/* Step 2: OTP */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">קוד אימות</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToEmail}
                    className="gap-1 text-xs"
                  >
                    <ArrowRight className="w-3 h-3" />
                    שנה אימייל
                  </Button>
                </div>

                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-xl">
                    <Mail className="w-4 h-4" />
                    <span dir="ltr">{email}</span>
                  </div>

                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                    disabled={loading}
                  >
                    <InputOTPGroup className="gap-2 mx-auto" dir="ltr">
                      <InputOTPSlot index={0} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={1} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={2} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={3} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={4} className="w-12 h-14 text-xl" />
                      <InputOTPSlot index={5} className="w-12 h-14 text-xl" />
                    </InputOTPGroup>
                  </InputOTP>

                  {otp.length > 0 && (
                    <div className="text-xs text-muted-foreground font-mono" dir="ltr">
                      הקוד שהזנת: {otp}
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading || otp.length !== 6}
                className="w-full h-12 font-semibold text-base shadow-lg shadow-primary/25 gap-2"
              >
                {loading ? "מאמת..." : "אמת והתחבר"}
                <ArrowLeft className="w-4 h-4" />
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-xs"
                >
                  לא קיבלת קוד? שלח שוב
                </Button>
              </div>

              <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl text-sm text-amber-700 dark:text-amber-400">
                <Clock className="w-4 h-4 shrink-0" />
                <span>הקוד תקף ל-10 דקות</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
