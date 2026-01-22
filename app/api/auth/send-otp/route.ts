import { Resend } from 'resend'
import { supabase } from '@/lib/supabase'
import { otpEmailTemplate } from '@/lib/email-templates'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // בדיקה שהמשתמש קיים ב-DB
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // יצירת קוד 6 ספרות
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 דקות

    // שמירה ב-DB
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
      console.error('Error saving OTP:', otpError)
      return NextResponse.json(
        { error: 'Failed to generate OTP' },
        { status: 500 }
      )
    }

    // שליחת מייל
    try {
      await resend.emails.send({
        from: 'TaskFlow <onboarding@resend.dev>', // Resend's test email for development
        to: email,
        subject: 'קוד האימות שלך - TaskFlow',
        html: otpEmailTemplate(user.name, code)
      })
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully'
    })

  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
