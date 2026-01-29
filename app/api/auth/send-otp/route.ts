import { Resend } from 'resend'
import { supabase } from '@/lib/supabase'
import { otpEmailTemplate } from '@/lib/email-templates'
import { NextRequest, NextResponse } from 'next/server'
import { otpRateLimiter, RATE_LIMITS, getIdentifier, applyRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { emailSchema, sanitizeString } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // 1. Validation
    const emailValidation = emailSchema.safeParse(email)
    if (!emailValidation.success) {
      return NextResponse.json(
        { error: 'אימייל לא תקין' },
        { status: 400 }
      )
    }

    const sanitizedEmail = sanitizeString(emailValidation.data)

    // 2. Rate Limiting
    const identifier = getIdentifier(request, sanitizedEmail)
    const rateLimit = applyRateLimit(identifier, otpRateLimiter, RATE_LIMITS.OTP)
    
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetAt)
    }

    // 3. בדיקה שהמשתמש קיים ב-DB
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', sanitizedEmail)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'משתמש לא נמצא במערכת' },
        { status: 404 }
      )
    }

    // 4. יצירת קוד 6 ספרות
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 דקות

    // 5. שמירה ב-DB
    const { error: otpError } = await supabase
      .from('otp_codes')
      .insert({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email: sanitizedEmail,
        code,
        expires_at: expiresAt.toISOString(),
        used: false
      })

    if (otpError) {
      console.error('Error saving OTP:', otpError)
      return NextResponse.json(
        { error: 'כשל ביצירת קוד אימות' },
        { status: 500 }
      )
    }

    // 6. שליחת מייל
    let emailSent = false
    try {
      const apiKey = process.env.RESEND_API_KEY
      
      if (apiKey) {
        const resend = new Resend(apiKey)
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
        
        const result = await resend.emails.send({
          from: `TaskFlow <${fromEmail}>`,
          to: sanitizedEmail,
          subject: 'קוד האימות שלך - TaskFlow',
          html: otpEmailTemplate(user.name, code)
        })

        console.log('Email sent successfully:', result)
        emailSent = true
      }
    } catch (emailError: any) {
      console.error('Email sending failed:', emailError.message)
    }

    // 7. החזרת תגובה עם rate limit headers
    return NextResponse.json({
      success: true,
      message: emailSent ? 'קוד האימות נשלח למייל' : 'קוד אימות נוצר',
    }, {
      headers: rateLimit.headers
    })

  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: 'שגיאה פנימית בשרת' },
      { status: 500 }
    )
  }
}
