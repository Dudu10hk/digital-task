import { Resend } from 'resend'
import { supabase } from '@/lib/supabase'
import { invitationEmailTemplate } from '@/lib/email-templates'
import { NextResponse } from 'next/server'
import type { UserRole } from '@/lib/types'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { name, email, role, adminId } = await request.json()

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: 'Name, email, and role are required' },
        { status: 400 }
      )
    }

    // בדיקה שהאימייל לא קיים כבר
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // יצירת משתמש חדש (ללא סיסמה!)
    const newUser = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      role: role as UserRole,
      password: '', // ריק - לא נדרש יותר
      avatar: undefined
    }

    const { error: userError } = await supabase
      .from('users')
      .insert([newUser])

    if (userError) {
      console.error('Error creating user:', userError)
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // יצירת קוד OTP להזמנה
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 שעות להזמנה

    const { error: otpError } = await supabase
      .from('otp_codes')
      .insert({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email,
        code,
        expires_at: expiresAt.toISOString(),
        used: false
      })

    if (otpError) {
      console.error('Error creating OTP:', otpError)
      // ניקוי - מחיקת המשתמש שנוצר
      await supabase.from('users').delete().eq('id', newUser.id)
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      )
    }

    // קבלת פרטי המנהל ששלח את ההזמנה
    let inviterName = 'המנהל'
    if (adminId) {
      const { data: admin } = await supabase
        .from('users')
        .select('name')
        .eq('id', adminId)
        .single()
      
      if (admin) {
        inviterName = admin.name
      }
    }

    // שליחת מייל הזמנה
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      
      await resend.emails.send({
        from: 'TaskFlow <onboarding@resend.dev>', // Resend's test email for development
        to: email,
        subject: `${inviterName} הזמין אותך ל-TaskFlow! 🎉`,
        html: invitationEmailTemplate(name, code, inviterName, appUrl)
      })
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError)
      // לא נמחק את המשתמש - המנהל יכול לשלוח הזמנה שוב
      return NextResponse.json(
        { 
          success: true, 
          warning: 'User created but email failed to send',
          user: newUser 
        },
        { status: 201 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Invitation sent to ${email}`,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Invite user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
