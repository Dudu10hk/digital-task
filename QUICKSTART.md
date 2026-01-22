# 🚀 Quick Start - התחלה מהירה

מדריך מהיר ב-5 דקות להרצת המערכת.

## דקה 1️⃣ - התקנת תלויות

```bash
npm install
```

## דקה 2️⃣ - הגדרת Supabase

1. היכנס ל: **https://supabase.com**
2. צור פרויקט חדש (חינמי)
3. לך ל: **SQL Editor** והרץ:
   - `scripts/002_create_task_tables.sql`
   - `scripts/003_seed_demo_data.sql` (אופציונלי - נתוני דמו)

## דקה 3️⃣ - משתני סביבה

1. בSupabase: **Settings** > **API**
2. העתק:
   - Project URL
   - anon public key
3. ערוך את `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
   ```

## דקה 4️⃣ - יצירת משתמש Admin

בSupabase: **Authentication** > **Users** > **Add user**

```
Email: admin@example.com
Password: Admin123!
Auto Confirm: ✅

User Metadata:
{
  "name": "מנהל",
  "role": "admin"
}
```

## דקה 5️⃣ - הרצה!

```bash
npm run dev
```

פתח: **http://localhost:3000**

התחבר עם:
- Email: `admin@example.com`
- Password: `Admin123!`

---

## 🎉 זהו! המערכת פועלת!

### מה עכשיו?

- 📖 **מדריך מלא:** `README.md`
- 🔧 **פריסה:** `DEPLOYMENT.md`
- ❓ **בעיות:** `SETUP_GUIDE.md`

### פריסה מהירה לVercel:

```bash
./init-git.sh                    # אתחל Git
# העלה לGitHub
# חבר לVercel
# Deploy!
```

**זמן: 3 דקות נוספות** ⚡

---

## 📞 עזרה מהירה

**הפרויקט לא נבנה?**
```bash
npm run build
```

**שגיאת Supabase?**
- בדוק ש-`.env.local` קיים
- בדוק את הערכים בSupabase Dashboard
- הפעל מחדש: `npm run dev`

**לא מצליח להתחבר?**
- ודא שהמשתמש קיים ב-Authentication
- בדוק שה-email confirmed (✅)
- בדוק את ה-User Metadata (`role: admin`)

---

## 🛠️ פקודות שימושיות

```bash
npm run dev      # הרצת dev server
npm run build    # בניית production
npm start        # הרצת production
./setup.sh       # סקריפט התקנה
./init-git.sh    # אתחול Git
```

---

**זמן כולל: ~5-10 דקות** ⏱️

**עלות: חינמי** 💰

**תמיכה: 24/7** 📧 (דרך GitHub Issues)
