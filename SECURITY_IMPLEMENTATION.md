# 🔒 מדריך יישום שיפורי אבטחה

## ⚠️ חובה לקרוא לפני יישום

דוח האבטחה המלא נמצא ב-`SECURITY_AUDIT.md`

---

## 🚨 פעולות קריטיות מיידיות (עכשיו!)

### 1. הסרת Secrets מ-Git

```bash
# הסר את .env.local מהמאגר
git rm --cached .env.local
echo ".env.local" >> .gitignore
git add .gitignore
git commit -m "🔒 Remove exposed secrets from git"
git push origin main

# אזהרה: ההיסטוריה עדיין מכילה secrets!
# להסרה מלאה - צור issue ב-GitHub או השתמש ב-BFG Repo-Cleaner
```

### 2. סיבוב API Keys (מיידי!)

#### Supabase:
1. התחבר ל-https://supabase.com
2. **צור פרויקט חדש לגמרי** (הישן נחשף)
3. העתק ה-URL וה-API key החדשים
4. עדכן ב-`.env.local` (מקומי)
5. עדכן ב-Vercel → Settings → Environment Variables

#### Resend:
1. התחבר ל-https://resend.com
2. API Keys → Delete את המפתח הישן
3. צור מפתח חדש
4. עדכן ב-`.env.local` ו-Vercel

### 3. הרצת תיקוני RLS

```bash
# התחבר ל-Supabase Dashboard
# SQL Editor → New Query → העתק והרץ:
cat scripts/006_security_rls_fixes.sql

# לחץ RUN בממשק
```

### 4. התקנת תלויות חדשות

```bash
# zod כבר מותקן, אבל אם חסר:
npm install zod

# אופציונלי - rate limiting with Redis
npm install @upstash/ratelimit @upstash/redis
```

---

## 📋 רשימת קבצים שנוצרו

| קובץ | מטרה | חובה/אופציונלי |
|------|------|----------------|
| `SECURITY_AUDIT.md` | דוח אבטחה מלא | 📖 קריאה |
| `middleware.ts` | הגנה על routes + headers | ✅ חובה |
| `lib/validation.ts` | ולידציה וסניטציה | ✅ חובה |
| `lib/rate-limit.ts` | הגבלת קצב בקשות | ✅ חובה |
| `scripts/006_security_rls_fixes.sql` | תיקוני RLS | ✅ חובה |
| `SECURITY_IMPLEMENTATION.md` | מדריך זה | 📖 קריאה |

---

## 🛠️ יישום שלב אחר שלב

### שלב 1: Middleware (חובה)

הקובץ `middleware.ts` כבר נוצר. הוא יוסיף:
- ✅ Security headers
- ✅ בדיקת authentication (בסיסית)
- ✅ HSTS
- ✅ X-Frame-Options

**לא נדרשת פעולה נוספת** - הוא יעבוד אוטומטית.

---

### שלב 2: Rate Limiting (חובה)

עדכן את ה-API routes שלך:

#### דוגמה: `/api/auth/send-otp/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server"
import { otpRateLimiter, RATE_LIMITS, getIdentifier, applyRateLimit, rateLimitResponse } from "@/lib/rate-limit"
import { emailSchema } from "@/lib/validation"

export async function POST(request: NextRequest) {
  try {
    // 1. קבל body
    const body = await request.json()
    
    // 2. ולידציה
    const result = emailSchema.safeParse(body.email)
    if (!result.success) {
      return NextResponse.json(
        { error: "אימייל לא תקין" },
        { status: 400 }
      )
    }
    
    // 3. Rate limiting
    const identifier = getIdentifier(request, body.email)
    const rateLimit = applyRateLimit(identifier, otpRateLimiter, RATE_LIMITS.OTP)
    
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit.resetAt)
    }
    
    // 4. המשך לוגיקה רגילה...
    // שלח OTP
    
    return NextResponse.json(
      { success: true },
      { headers: rateLimit.headers }
    )
  } catch (error) {
    return NextResponse.json(
      { error: "שגיאה בשרת" },
      { status: 500 }
    )
  }
}
```

---

### שלב 3: Input Validation (חובה)

עדכן את הקומפוננטות:

#### דוגמה: `components/task-dialog.tsx`

```typescript
import { taskSchema, sanitizeObject } from "@/lib/validation"

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault()
  
  // 1. בנה את האובייקט
  const taskData = {
    title,
    description,
    priority,
    // ...
  }
  
  // 2. ולידציה
  const result = taskSchema.safeParse(taskData)
  if (!result.success) {
    toast.error(result.error.errors[0].message)
    return
  }
  
  // 3. סניטציה
  const sanitized = sanitizeObject(result.data)
  
  // 4. שמירה
  if (mode === "create") {
    addTask(sanitized)
  }
}
```

---

### שלב 4: File Upload Security (חובה)

עדכן את העלאת הקבצים:

```typescript
import { validateFile } from "@/lib/validation"

const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const uploadedFiles = e.target.files
  if (!uploadedFiles) return
  
  for (const file of Array.from(uploadedFiles)) {
    // ולידציה
    const validation = validateFile(file)
    if (!validation.valid) {
      toast.error(validation.error)
      continue
    }
    
    // המשך...
  }
}
```

---

## 🔧 הגדרות Supabase נוספות

### Enable Email Confirmations

```
Dashboard → Authentication → Providers → Email
✅ Enable "Confirm email"
```

### Set JWT Expiry

```
Dashboard → Settings → API
JWT expiry: 3600 (1 hour)
```

### Configure CORS

```
Dashboard → Settings → API
Allow origins: https://your-domain.vercel.app
```

---

## 🧪 בדיקות

### 1. בדוק Rate Limiting

```bash
# שלח 10 בקשות מהר
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/auth/send-otp \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}'
done

# הבקשה ה-4 צריכה להחזיר 429
```

### 2. בדוק Input Validation

```javascript
// נסה להזין XSS
const malicious = "<script>alert('xss')</script>"
// צריך להיות מסונן
```

### 3. בדוק RLS

```sql
-- התחבר כמשתמש רגיל
-- נסה למחוק משימה של אחר
DELETE FROM tasks WHERE id = 'other-user-task-id';
-- צריך להיכשל
```

---

## 📊 Monitoring (מומלץ)

### Vercel Analytics

```bash
# כבר מותקן
@vercel/analytics
```

### Sentry (אופציונלי)

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## ✅ Checklist יישום

- [ ] **הסרתי .env.local מ-Git**
- [ ] **סובבתי את כל ה-API keys**
- [ ] **הרצתי את 006_security_rls_fixes.sql**
- [ ] **בדקתי ש-middleware.ts עובד**
- [ ] **הוספתי rate limiting ל-API routes**
- [ ] **הוספתי input validation לטפסים**
- [ ] **הוספתי validateFile להעלאות**
- [ ] **הגדרתי Email Confirmation ב-Supabase**
- [ ] **הגדרתי JWT expiry**
- [ ] **הגדרתי CORS**
- [ ] **בדקתי rate limiting**
- [ ] **בדקתי input validation**
- [ ] **בדקתי RLS policies**
- [ ] **הגדרתי monitoring**

---

## 🆘 תמיכה

אם נתקלת בבעיה:

1. בדוק את `SECURITY_AUDIT.md` לפרטים
2. חפש ב-Issues של הפרויקט
3. פתח Issue חדש עם תיאור הבעיה

---

## 📚 קריאה נוספת

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/security)
- [Zod Documentation](https://zod.dev/)

---

**⚠️ זכור:** אבטחה היא תהליך מתמשך, לא חד-פעמי!
