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

## 🚀 התקנה מהירה

### אפשרות 1: התקנה אוטומטית (מומלץ)

```bash
# 1. התקנת תלויות
npm install

# 2. הגדרת משתני סביבה
cp env.example .env.local
# ערוך את .env.local עם פרטי Supabase שלך

# 3. הרצת הפרויקט
npm run dev
```

### אפשרות 2: מדריך מפורט צעד-אחר-צעד

📖 **למדריך התקנה מלא ומפורט**, ראה: **[INSTALL.md](./INSTALL.md)**

המדריך כולל:
- ✅ הוראות מפורטות לכל שלב
- ✅ הגדרת Supabase מאפס
- ✅ הרצת כל סקריפטי SQL
- ✅ יצירת משתמש Admin
- ✅ פתרון בעיות נפוצות
- ✅ פריסה לייצור

⏱️ **זמן התקנה:** 15-30 דקות

---

## 📚 מדריכים נוספים

### 🌟 התחלה
- 📄 **[START_HERE.txt](./START_HERE.txt)** - נקודת כניסה - התחל כאן!
- 📖 **[INSTALL.md](./INSTALL.md)** - מדריך התקנה מלא ומפורט ⭐
- 🚀 **[QUICKSTART.md](./QUICKSTART.md)** - התחלה מהירה ב-5 דקות
- ✅ **[CHECKLIST.md](./CHECKLIST.md)** - רשימת בדיקה להתקנה
- 📚 **[INDEX.md](./INDEX.md)** - מדריך ניווט לכל המסמכים
- 📦 **[SUMMARY.md](./SUMMARY.md)** - סיכום מלא של הפרויקט

### 🔧 הגדרה וטכני
- 🔧 **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - הנחיות Supabase מפורטות
- 🗄️ **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - הערות נוספות
- 📊 **[JSONB_MIGRATION.md](./JSONB_MIGRATION.md)** - מבנה נתונים והמיגרציה

### 🐛 פתרון בעיות
- 🐛 **[FIX_GUIDE.md](./FIX_GUIDE.md)** - פתרון בעיות מפורט
- 📋 **[FIX_REPORT.md](./FIX_REPORT.md)** - דוח תיקונים
- 🔄 **[FIXES_REPORT.md](./FIXES_REPORT.md)** - סיכום תיקונים

### 🚢 פריסה
- 🚢 **[DEPLOYMENT.md](./DEPLOYMENT.md)** - פריסה לייצור
- 📋 **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - סטטוס הפרויקט

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
