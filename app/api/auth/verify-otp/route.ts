import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      )
    }

    // בדיקת קוד
    const { data: otpRecord, error: otpError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (otpError) {
      console.error('OTP lookup error:', otpError)
      return NextResponse.json(
        { error: 'Failed to verify OTP' },
        { status: 500 }
      )
    }

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired code' },
        { status: 401 }
      )
    }

    // סימון כמשומש
    const { error: updateError } = await supabase
      .from('otp_codes')
      .update({ used: true })
      .eq('id', otpRecord.id)

    if (updateError) {
      console.error('Error marking OTP as used:', updateError)
    }

    // החזרת משתמש
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

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
