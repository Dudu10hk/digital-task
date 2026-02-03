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
    const { name, email, role, adminId, password, avatar } = body

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

    // 3. במצב Demo - שמור משתמש מקומית בלי Supabase
    if (!isSupabaseConfigured) {
      const defaultPassword = `${sanitizedName.split(' ')[0].toLowerCase()}123`
      const newUser = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: sanitizedName,
        email: sanitizedEmail,
        role: role as UserRole,
        password: password || defaultPassword,
        avatar: avatar || undefined
      }
      
      return NextResponse.json({
        success: true,
        message: `משתמש ${sanitizedName} נוצר בהצלחה במצב Demo`,
        user: newUser,
        demo_mode: true,
        note: 'במצב Demo, המשתמשים נשמרים מקומית בלבד'
      }, { status: 201 })
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
    const defaultPassword = `${sanitizedName.split(' ')[0].toLowerCase()}123`
    const newUser = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: sanitizedName,
      email: sanitizedEmail,
      role: role as UserRole,
      password: password || defaultPassword,
      avatar: avatar || undefined
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

    // 5. החזר הצלחה (ללא שליחת מייל)
    return NextResponse.json({
      success: true,
      message: `משתמש ${sanitizedName} נוצר בהצלחה!`,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        password: newUser.password
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
