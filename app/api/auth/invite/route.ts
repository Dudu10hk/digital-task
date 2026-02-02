import { Resend } from 'resend'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { invitationEmailTemplate } from '@/lib/email-templates'
import { NextRequest, NextResponse } from 'next/server'
import type { UserRole } from '@/lib/types'
import { apiRateLimiter, RATE_LIMITS, getIdentifier, applyRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { emailSchema, userNameSchema, passwordSchema, sanitizeString } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, role, adminId, password } = body

    // 1. Rate Limiting
    const identifier = getIdentifier(request, adminId)
    const rateLimit = applyRateLimit(identifier, apiRateLimiter, RATE_LIMITS.API)
    
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetAt)
    }

    // 2. Validation
    const emailValidation = emailSchema.safeParse(email)
    const nameValidation = userNameSchema.safeParse(name)
    
    if (!emailValidation.success) {
      return NextResponse.json(
        { error: 'אימייל לא תקין' },
        { status: 400 }
      )
    }
    
    if (!nameValidation.success) {
      return NextResponse.json(
        { error: 'שם לא תקין' },
        { status: 400 }
      )
    }

    if (!role || !['admin', 'user', 'viewer'].includes(role)) {
      return NextResponse.json(
        { error: 'תפקיד לא תקין' },
        { status: 400 }
      )
    }

    // Validate password if provided
    if (password) {
      const passwordValidation = passwordSchema.safeParse(password)
      if (!passwordValidation.success) {
        return NextResponse.json(
          { error: passwordValidation.error.errors[0].message },
          { status: 400 }
        )
      }
    }

    const sanitizedEmail = sanitizeString(emailValidation.data)
    const sanitizedName = sanitizeString(nameValidation.data)

    // 3. במצב Demo - לא ניתן להוסיף משתמשים (אין DB אמיתי)
    if (!isSupabaseConfigured) {
      return NextResponse.json(
        { 
          error: 'במצב Demo לא ניתן להוסיף משתמשים חדשים. אנא הגדר Supabase כדי להפעיל תכונה זו.',
          demo_mode: true
        },
        { status: 503 }
      )
    }

    // 3. בדיקה שהאימייל לא קיים כבר
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', sanitizedEmail)
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json(
        { error: 'משתמש עם אימייל זה כבר קיים' },
        { status: 409 }
      )
    }

    // 4. יצירת משתמש חדש
    const newUser = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: sanitizedName,
      email: sanitizedEmail,
      role: role as UserRole,
      password: password || '',
      avatar: undefined
    }

    const { error: userError } = await supabase
      .from('users')
      .insert([newUser])

    if (userError) {
      console.error('Error creating user:', userError)
      return NextResponse.json(
        { error: 'כשל ביצירת משתמש' },
        { status: 500 }
      )
    }

    // 5. יצירת קוד OTP להזמנה
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 שעות

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
      console.error('Error creating OTP:', otpError)
      await supabase.from('users').delete().eq('id', newUser.id)
      return NextResponse.json(
        { error: 'כשל ביצירת הזמנה' },
        { status: 500 }
      )
    }

    // 6. קבלת פרטי המנהל
    let inviterName = 'המנהל'
    if (adminId) {
      const { data: admin } = await supabase
        .from('users')
        .select('name')
        .eq('id', adminId)
        .single()
      
      if (admin) {
        inviterName = sanitizeString(admin.name)
      }
    }

    // 7. שליחת מייל
    try {
      const apiKey = process.env.RESEND_API_KEY
      
      if (!apiKey) {
        console.error('RESEND_API_KEY is not configured')
        return NextResponse.json(
          { 
            success: true, 
            warning: 'משתמש נוצר אך שירות המייל לא מוגדר',
            user: newUser 
          },
          { status: 201, headers: rateLimit.headers }
        )
      }

      const resend = new Resend(apiKey)
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
      
      await resend.emails.send({
        from: `TaskFlow <${fromEmail}>`,
        to: sanitizedEmail,
        subject: `${inviterName} הזמין אותך ל-TaskFlow! 🎉`,
        html: invitationEmailTemplate(sanitizedName, code, inviterName, appUrl)
      })

    } catch (emailError: any) {
      console.error('Error sending invitation email:', emailError.message)
      return NextResponse.json(
        { 
          success: true, 
          warning: `משתמש נוצר אך המייל נכשל`,
          user: newUser
        },
        { status: 201, headers: rateLimit.headers }
      )
    }

    return NextResponse.json({
      success: true,
      message: `הזמנה נשלחה ל-${sanitizedEmail}`,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    }, { status: 201, headers: rateLimit.headers })

  } catch (error) {
    console.error('Invite user error:', error)
    return NextResponse.json(
      { error: 'שגיאה פנימית בשרת' },
      { status: 500 }
    )
  }
}
