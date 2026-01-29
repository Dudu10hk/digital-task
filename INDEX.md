# 📚 מדריך ניווט למסמכים - Documentation Index

מדריך מלא לכל המסמכים והקבצים בפרויקט.

---

## 🚀 **התחלה מהירה - מתחילים כאן!**

אם זו ההתקנה הראשונה שלך, התחל מאחד מאלה:

| קובץ | תיאור | זמן קריאה | מתי להשתמש |
|------|--------|------------|-------------|
| **[START_HERE.txt](./START_HERE.txt)** | נקודת התחלה - סקירה כללית | 2 דק' | 👈 **התחל כאן!** |
| **[QUICKSTART.md](./QUICKSTART.md)** | מדריך מהיר ב-5 דקות | 5 דק' | מפתח מנוסה |
| **[INSTALL.md](./INSTALL.md)** | מדריך התקנה מלא ומפורט | 10 דק' | 🌟 **מומלץ למתחילים** |
| **[CHECKLIST.md](./CHECKLIST.md)** | רשימת משימות להתקנה | 5 דק' | מעקב אחר התקדמות |

---

## 📖 **מדריכי התקנה והגדרה**

### מדריכים ראשוניים

| קובץ | תוכן | מתאים ל |
|------|------|---------|
| **[INSTALL.md](./INSTALL.md)** | מדריך התקנה צעד-אחר-צעד מפורט | כולם - התקנה ראשונה |
| **[QUICKSTART.md](./QUICKSTART.md)** | התחלה מהירה ב-5 דקות | מפתחים מנוסים |
| **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** | הדרכה מפורטת לSupabase | הגדרת Supabase |
| **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** | הערות נוספות על Supabase | התקנה מתקדמת |
| **[CHECKLIST.md](./CHECKLIST.md)** | רשימת בדיקה שלב-אחר-שלב | מעקב התקדמות |

### סקריפטים להרצה

| קובץ | פעולה | איך להריץ |
|------|-------|-----------|
| **[install.sh](./install.sh)** | התקנה אוטומטית מודרכת | `bash install.sh` |
| **[setup.sh](./setup.sh)** | סקריפט התקנה בסיסי | `bash setup.sh` |
| **[init-git.sh](./init-git.sh)** | אתחול Git והעלאה לGitHub | `bash init-git.sh` |
| **[deploy.sh](./deploy.sh)** | פריסה אוטומטית | `bash deploy.sh` |

---

## 🗄️ **מבנה נתונים וSQL**

### סקריפטי SQL (תיקיית scripts/)

יש להריץ **לפי הסדר**:

| # | קובץ | תיאור | קריטיות |
|---|------|--------|---------|
| 1 | `001_create_tables.sql` | יצירת טבלאות משתמשים | 🔴 חובה |
| 2 | `002_create_task_tables.sql` | טבלאות משימות + RLS | 🔴 חובה |
| 3 | `004_create_otp_table.sql` | טבלת OTP להתחברות | 🔴 חובה |
| 4 | `004_setup_storage.sql` | Storage לתמונות פרופיל | 🔴 חובה |
| 5 | `005_convert_to_jsonb.sql` | המרה ל-JSONB (קריטי!) | 🔴🔴🔴 **קריטי ביותר!** |
| 6 | `003_seed_demo_data.sql` | נתוני דמו | 🟡 אופציונלי |

### מסמכי הסבר

| קובץ | תוכן |
|------|------|
| **[JSONB_MIGRATION.md](./JSONB_MIGRATION.md)** | הסבר על מבנה JSONB והמיגרציה |
| **[supabase-jsonb.sql](./supabase-jsonb.sql)** | סקריפט משולב (אם יש) |

⚠️ **חשוב:** אם לא תריץ `005_convert_to_jsonb.sql` - המערכת לא תעבוד!

---

## 🐛 **פתרון בעיות ותיקונים**

| קובץ | תיאור | מתי לקרוא |
|------|--------|-----------|
| **[FIX_GUIDE.md](./FIX_GUIDE.md)** | מדריך מפורט לתיקון שגיאות | יש שגיאה? 👈 **קרא ראשון** |
| **[FIX_REPORT.md](./FIX_REPORT.md)** | דוח תיקונים שבוצעו | לעיון היסטורי |
| **[FIXES_REPORT.md](./FIXES_REPORT.md)** | סיכום תיקונים נוספים | לעיון היסטורי |

### בעיות נפוצות - תקציר

| שגיאה | פתרון מהיר | מדריך מלא |
|-------|------------|-----------|
| "Invalid API key" | בדוק `.env.local` | [FIX_GUIDE.md](./FIX_GUIDE.md) |
| "relation does not exist" | הרץ SQL scripts | [INSTALL.md](./INSTALL.md) |
| "Error saving tasks" | הרץ `005_convert_to_jsonb.sql` | [JSONB_MIGRATION.md](./JSONB_MIGRATION.md) |
| לא מצליח להתחבר | בדוק משתמש Admin | [INSTALL.md](./INSTALL.md) |
| תמונות לא עובדות | הרץ `004_setup_storage.sql` | [FIX_GUIDE.md](./FIX_GUIDE.md) |

---

## 🚢 **פריסה (Deployment)**

| קובץ | תוכן |
|------|------|
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | מדריך פריסה לVercel, Docker, Railway |
| **[deploy.sh](./deploy.sh)** | סקריפט פריסה אוטומטי |
| **[vercel.json](./vercel.json)** | קונפיגורציה לVercel |

---

## 📋 **מסמכים כלליים**

| קובץ | תיאור | מתי לקרוא |
|------|--------|-----------|
| **[README.md](./README.md)** | תיעוד ראשי של הפרויקט | סקירה כללית |
| **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** | סטטוס הפרויקט ותכונות | מצב עדכני |
| **[INSTALLATION_SUMMARY.md](./INSTALLATION_SUMMARY.md)** | סיכום התקנה | לאחר התקנה |

---

## ⚙️ **קבצי הגדרה**

### משתני סביבה

| קובץ | תיאור |
|------|--------|
| **[env.example](./env.example)** | תבנית למשתני סביבה |
| **`.env.local`** | קובץ האמיתי (צור אותו!) |

### הגדרות פרויקט

| קובץ | תיאור |
|------|--------|
| **[package.json](./package.json)** | תלויות וסקריפטים |
| **[tsconfig.json](./tsconfig.json)** | הגדרות TypeScript |
| **[next.config.mjs](./next.config.mjs)** | הגדרות Next.js |
| **[tailwind.config.ts](./tailwind.config.ts)** | הגדרות Tailwind CSS |
| **[components.json](./components.json)** | הגדרות shadcn/ui |

---

## 🧪 **סקריפטים ובדיקות**

| קובץ | פעולה | הרצה |
|------|-------|------|
| **[test-admin-user.sh](./test-admin-user.sh)** | בדיקת משתמש Admin | `bash test-admin-user.sh` |
| **[test-fixes.sh](./test-fixes.sh)** | בדיקת תיקונים | `bash test-fixes.sh` |

---

## 📁 **מבנה תיקיות**

```
task-management-system/
├── 📄 מסמכים (אתה כאן!)
│   ├── START_HERE.txt          ← נקודת כניסה
│   ├── INSTALL.md              ← מדריך מלא
│   ├── QUICKSTART.md           ← מדריך מהיר
│   ├── CHECKLIST.md            ← רשימת בדיקה
│   ├── README.md               ← תיעוד ראשי
│   └── INDEX.md                ← אתה כאן!
│
├── 🗄️ scripts/                 ← סקריפטי SQL
│   ├── 001_create_tables.sql
│   ├── 002_create_task_tables.sql
│   ├── 004_create_otp_table.sql
│   ├── 004_setup_storage.sql
│   └── 005_convert_to_jsonb.sql  ← קריטי!
│
├── ⚙️ app/                      ← Next.js App Router
│   ├── page.tsx                ← דף הבית
│   ├── layout.tsx              ← Layout ראשי
│   └── api/                    ← API routes
│       ├── auth/               ← אימות
│       └── upload/             ← העלאת קבצים
│
├── 🎨 components/               ← קומפוננטות React
│   ├── dashboard.tsx           ← לוח בקרה
│   ├── task-card.tsx           ← כרטיס משימה
│   ├── task-dialog.tsx         ← דיאלוג משימה
│   ├── user-management.tsx     ← ניהול משתמשים
│   ├── profile-dialog.tsx      ← דיאלוג פרופיל
│   ├── ui/                     ← UI components (shadcn)
│   └── views/                  ← תצוגות שונות
│       ├── board-view.tsx      ← תצוגת בורד
│       ├── list-view.tsx       ← תצוגת רשימה
│       └── calendar-view.tsx   ← תצוגת לוח שנה
│
├── 📚 lib/                      ← ספריות עזר
│   ├── supabase.ts             ← Supabase client
│   ├── supabase-simple.ts      ← פונקציות עזר
│   ├── task-context.tsx        ← Context למשימות
│   ├── types.ts                ← TypeScript types
│   └── utils.ts                ← פונקציות כלליות
│
└── 📦 public/                   ← קבצים סטטיים
    ├── images/
    └── icons/
```

---

## 🎯 **תרחישי שימוש - מה לקרוא?**

### אני מתחיל מאפס

1. 📄 [START_HERE.txt](./START_HERE.txt)
2. 📖 [INSTALL.md](./INSTALL.md)
3. ✅ [CHECKLIST.md](./CHECKLIST.md)

### אני מפתח מנוסה

1. 🚀 [QUICKSTART.md](./QUICKSTART.md)
2. ⚙️ הרץ `bash install.sh`
3. 🚀 `npm run dev`

### יש לי שגיאה

1. 🐛 [FIX_GUIDE.md](./FIX_GUIDE.md)
2. 📊 [JSONB_MIGRATION.md](./JSONB_MIGRATION.md) (אם שגיאת tasks)
3. 💬 פתח Issue ב-GitHub

### אני רוצה לפרוס לייצור

1. 🚢 [DEPLOYMENT.md](./DEPLOYMENT.md)
2. ⚙️ הרץ `bash deploy.sh`
3. 🎉 הפרויקט live!

### אני רוצה להבין את המבנה

1. 📖 [README.md](./README.md)
2. 📊 [JSONB_MIGRATION.md](./JSONB_MIGRATION.md)
3. 📋 [PROJECT_STATUS.md](./PROJECT_STATUS.md)

---

## 📊 **סיכום מסמכים לפי קטגוריה**

### 🟢 למתחילים (התחל כאן!)

- [START_HERE.txt](./START_HERE.txt)
- [INSTALL.md](./INSTALL.md)
- [CHECKLIST.md](./CHECKLIST.md)

### 🔵 למפתחים מנוסים

- [QUICKSTART.md](./QUICKSTART.md)
- [README.md](./README.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)

### 🟡 מדריכים טכניים

- [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- [JSONB_MIGRATION.md](./JSONB_MIGRATION.md)
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

### 🔴 פתרון בעיות

- [FIX_GUIDE.md](./FIX_GUIDE.md)
- [FIX_REPORT.md](./FIX_REPORT.md)
- [FIXES_REPORT.md](./FIXES_REPORT.md)

---

## 💡 **טיפים לניווט**

1. **מתחיל?** → קרא [START_HERE.txt](./START_HERE.txt) תחילה
2. **יש שגיאה?** → לך ישר ל-[FIX_GUIDE.md](./FIX_GUIDE.md)
3. **רוצה להבין?** → [README.md](./README.md) + [JSONB_MIGRATION.md](./JSONB_MIGRATION.md)
4. **מוכן לפריסה?** → [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 📞 **עזרה נוספת**

- 🐛 **באגים:** פתח Issue ב-GitHub
- 💬 **שאלות:** GitHub Discussions
- 📧 **תמיכה:** דרך GitHub Issues
- 📚 **תיעוד:** אתה כבר כאן! 😊

---

## ✅ **Status המסמכים**

| מסמך | סטטוס | עדכון אחרון |
|------|-------|-------------|
| START_HERE.txt | ✅ עדכני | 2024 |
| INSTALL.md | ✅ עדכני | 2024 |
| CHECKLIST.md | ✅ עדכני | 2024 |
| README.md | ✅ עדכני | 2024 |
| QUICKSTART.md | ✅ עדכני | 2024 |
| FIX_GUIDE.md | ✅ עדכני | 2024 |
| DEPLOYMENT.md | ✅ עדכני | 2024 |
| JSONB_MIGRATION.md | ✅ עדכני | 2024 |

---

## 🎉 **סיכום**

יש לך **12+ מסמכים** מפורטים שמכסים כל היבט של ההתקנה, השימוש והפריסה.

**התחל כאן:** [START_HERE.txt](./START_HERE.txt) 👈

**בהצלחה!** 🚀

---

*מדריך זה עודכן לאחרונה: 2024*
*נבנה באהבה עם Next.js 16 ו-Supabase ❤️*
