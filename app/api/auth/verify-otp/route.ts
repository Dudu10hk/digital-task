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

    // בדיקת קוד - קודם בלי בדיקת זמן
    const { data: allOtps, error: searchError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .order('created_at', { ascending: false })

    console.log('🔍 OTP Search Results:', {
      email,
      code,
      found: allOtps?.length || 0,
      records: allOtps?.map(otp => ({
        expires_at: otp.expires_at,
        used: otp.used,
        created_at: otp.created_at,
        now: new Date().toISOString()
      }))
    })

    if (searchError) {
      console.error('OTP lookup error:', searchError)
      return NextResponse.json(
        { error: 'Failed to verify OTP' },
        { status: 500 }
      )
    }

    // מציאת הקוד הראשון שתקף
    const otpRecord = allOtps?.find(otp => {
      const expiresAt = new Date(otp.expires_at)
      const now = new Date()
      const isValid = !otp.used && expiresAt > now
      
      console.log('⏰ OTP Time Check:', {
        code: otp.code,
        expiresAt: expiresAt.toISOString(),
        now: now.toISOString(),
        diff_minutes: (expiresAt.getTime() - now.getTime()) / 60000,
        used: otp.used,
        isValid
      })
      
      return isValid
    })

    if (!otpRecord) {
      console.log('❌ No valid OTP found')
      return NextResponse.json(
        { error: 'Invalid or expired code' },
        { status: 401 }
      )
    }

    console.log('✅ Valid OTP found:', otpRecord.id)

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
