# מערכת לניהול משימות (Task Management System)

מערכת מתקדמת לניהול משימות עם תמיכה ב-RTL (עברית), בנויה עם Next.js 16, React 19, TypeScript ו-Supabase.

## תכונות

- 🎯 ניהול משימות עם לוח קנבן אינטראקטיבי
- 👥 ניהול משתמשים והרשאות (Admin/User)
- 💬 הערות ותגיות למשתמשים
- 📎 העלאת קבצים
- 🔔 מערכת התראות
- 📊 תצוגות מרובות: לוח, רשימה, לוח שנה
- 🎨 תמיכה ב-Dark Mode
- 🔐 אימות והרשאות מלא עם Supabase

## דרישות מקדימות

- Node.js 18+ או עדכן יותר
- pnpm (או npm/yarn)
- חשבון Supabase (חינמי)

## הוראות התקנה

### 1. התקנת התלויות

```bash
pnpm install
```

או עם npm:
```bash
npm install
```

### 2. הגדרת Supabase

#### א. יצירת פרויקט Supabase

1. היכנס ל-[Supabase Dashboard](https://supabase.com/dashboard)
2. צור פרויקט חדש
3. שמור את ה-URL וה-Anon Key

#### ב. הרצת סקריפטי SQL

בתוך Supabase SQL Editor, הרץ את הקבצים הבאים לפי הסדר:

1. `scripts/001_create_tables.sql` - יוצר את הטבלאות הבסיסיות
2. `scripts/002_create_task_tables.sql` - יוצר טבלאות משימות ומדיניות אבטחה
3. `scripts/003_seed_demo_data.sql` - (אופציונלי) נתוני דמו להתחלה

#### ג. הגדרת משתני סביבה

1. העתק את הקובץ `env.example`:
   ```bash
   cp env.example .env.local
   ```

2. ערוך את `.env.local` והוסף את פרטי ה-Supabase שלך:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

### 3. הרצת הפרויקט

```bash
pnpm dev
```

הפרויקט יעלה על: http://localhost:3000

### 4. יצירת משתמש ראשון

יש שתי אפשרויות:

**אפשרות א' - דרך Supabase Dashboard:**
1. היכנס ל-Authentication בדשבורד
2. לחץ על "Add User"
3. הוסף אימייל וסיסמה
4. בשדה "User Metadata" הוסף:
   ```json
   {
     "name": "שם המשתמש",
     "role": "admin"
   }
   ```

**אפשרות ב' - דרך הקוד:**
הפרויקט כולל דף הרשמה אוטומטי. פשוט צור משתמש חדש דרך הממשק.

## מבנה הפרויקט

```
task-management-system/
├── app/                    # Next.js App Router
│   ├── page.tsx           # דף הבית
│   ├── layout.tsx         # Layout כללי
│   └── globals.css        # סגנונות גלובליים
├── components/            # קומפוננטות React
│   ├── dashboard.tsx      # לוח הבקרה הראשי
│   ├── task-card.tsx      # כרטיס משימה
│   ├── task-dialog.tsx    # דיאלוג יצירת/עריכת משימה
│   ├── ui/                # קומפוננטות UI מבוססות shadcn
│   └── views/             # תצוגות שונות (Board, List, Calendar)
├── lib/                   # ספריות עזר
│   ├── supabase/          # Supabase clients
│   ├── types.ts           # TypeScript types
│   ├── task-context.tsx   # Context API למשימות
│   └── utils.ts           # פונקציות עזר
├── scripts/               # סקריפטי SQL
│   ├── 001_create_tables.sql
│   ├── 002_create_task_tables.sql
│   └── 003_seed_demo_data.sql
└── public/                # קבצים סטטיים

```

## סקריפטים

```bash
# הרצת Development Server
pnpm dev

# בניית הפרויקט ל-Production
pnpm build

# הרצת Production Server
pnpm start

# Linting
pnpm lint
```

## טכנולוגיות

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19
- **Language:** TypeScript
- **Database & Auth:** Supabase
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI (shadcn/ui)
- **Icons:** Lucide React
- **Date Handling:** date-fns
- **Forms:** React Hook Form + Zod

## מדיניות אבטחה (RLS)

הפרויקט משתמש ב-Row Level Security של Supabase:

- **Profiles:** כולם יכולים לראות, רק בעלים יכולים לערוך
- **Tasks:** כולם יכולים לראות, רק מי שקשור למשימה או אדמין יכולים לערוך
- **Comments:** כולם יכולים לראות, רק הכותב או אדמין יכולים למחוק
- **Notifications:** כל משתמש רואה רק את ההתראות שלו

## פריסה (Deployment)

### Vercel (מומלץ)

1. העלה את הפרויקט ל-GitHub
2. חבר את ה-Repository ל-Vercel
3. הוסף את משתני הסביבה בהגדרות Vercel
4. Deploy!

### Netlify / Railway / Render

הפרויקט תואם לכל פלטפורמת deployment שתומכת ב-Next.js.

## תרומה

נשמח לתרומות! אנא פתח Issue או Pull Request.

## רישיון

MIT

## תמיכה

לשאלות ותמיכה, פתח Issue בפרויקט.
