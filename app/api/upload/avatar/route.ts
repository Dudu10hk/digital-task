import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string

    if (!file) {
      return NextResponse.json(
        { error: "לא נשלח קובץ" },
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: "חסר מזהה משתמש" },
        { status: 400 }
      )
    }

    // בדיקת סוג קובץ
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "הקובץ חייב להיות תמונה" },
        { status: 400 }
      )
    }

    // בדיקת גודל קובץ (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "הקובץ גדול מדי. גודל מקסימלי: 5MB" },
        { status: 400 }
      )
    }

    // המרת File ל-Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // יצירת שם קובץ ייחודי
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // העלאה ל-Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("profile-images")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error("Supabase upload error:", uploadError)
      return NextResponse.json(
        { error: "שגיאה בהעלאת התמונה ל-Supabase" },
        { status: 500 }
      )
    }

    // קבלת URL ציבורי של התמונה
    const { data: urlData } = supabase.storage
      .from("profile-images")
      .getPublicUrl(filePath)

    if (!urlData?.publicUrl) {
      return NextResponse.json(
        { error: "לא ניתן לקבל URL ציבורי של התמונה" },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      url: urlData.publicUrl,
      path: filePath 
    })
  } catch (error) {
    console.error("Error uploading avatar:", error)
    return NextResponse.json(
      { error: "שגיאה בהעלאת תמונת הפרופיל" },
      { status: 500 }
    )
  }
}

// הגדרת תצורה למולטיפארט
export const config = {
  api: {
    bodyParser: false,
  },
}
