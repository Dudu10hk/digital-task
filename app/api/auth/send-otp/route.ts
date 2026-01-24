import { Resend } from 'resend'
import { supabase } from '@/lib/supabase'
import { otpEmailTemplate } from '@/lib/email-templates'
import { NextResponse } from 'next/server'

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

    // שליחת מייל (רק ניסיון - אם נכשל, לא נפסיק את התהליך)
    let emailSent = false
    try {
      const apiKey = process.env.RESEND_API_KEY
      
      if (apiKey) {
        const resend = new Resend(apiKey)
        
        // בדיקה אם Resend במצב sandbox או production
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'
        
        const result = await resend.emails.send({
          from: `TaskFlow <${fromEmail}>`,
          to: email,
          subject: 'קוד האימות שלך - TaskFlow',
          html: otpEmailTemplate(user.name, code)
        })

        console.log('Email sent successfully:', result)
        emailSent = true
      }
    } catch (emailError: any) {
      console.error('Email sending failed (continuing anyway):', emailError.message)
    }

    // החזרת תגובה - ללא חשיפת הקוד!
    return NextResponse.json({
      success: true,
      message: emailSent ? 'OTP sent successfully' : 'OTP generated',
      // אף פעם לא מחזירים את הקוד! (בעיית אבטחה)
    })

  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
