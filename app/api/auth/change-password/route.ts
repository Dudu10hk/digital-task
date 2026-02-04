import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'
import { passwordSchema, sanitizeString } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, newPassword } = body

    // Validation
    if (!userId || !newPassword) {
      return NextResponse.json(
        { error: 'חסרים פרטים נדרשים' },
        { status: 400 }
      )
    }

    // Validate password
    const passwordValidation = passwordSchema.safeParse(newPassword)
    if (!passwordValidation.success) {
      return NextResponse.json(
        { error: passwordValidation.error.errors[0].message },
        { status: 400 }
      )
    }

    const sanitizedPassword = sanitizeString(passwordValidation.data)

    // Demo mode - return success but don't save
    if (!isSupabaseConfigured) {
      return NextResponse.json({
        success: true,
        message: 'הסיסמה עודכנה במצב Demo',
        demo_mode: true
      })
    }

    // Update password in database
    const { error } = await supabase
      .from('users')
      .update({ password: sanitizedPassword })
      .eq('id', userId)

    if (error) {
      console.error('Error updating password:', error)
      return NextResponse.json(
        { error: 'כשל בעדכון הסיסמה' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'הסיסמה עודכנה בהצלחה!'
    })

  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: 'שגיאה פנימית בשרת' },
      { status: 500 }
    )
  }
}
