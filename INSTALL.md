# 🚀 מדריך התקנה מלא - Task Management System

מדריך מפורט ושלב-אחר-שלב להתקנה מקומית של מערכת ניהול המשימות.

---

## 📋 **תוכן עניינים**

1. [דרישות מקדימות](#דרישות-מקדימות)
2. [שלב 1: הורדה והתקנה](#שלב-1-הורדה-והתקנה)
3. [שלב 2: הגדרת Supabase](#שלב-2-הגדרת-supabase)
4. [שלב 3: הרצת הפרויקט](#שלב-3-הרצת-הפרויקט)
5. [שלב 4: יצירת משתמש Admin](#שלב-4-יצירת-משתמש-admin)
6. [פתרון בעיות](#פתרון-בעיות)
7. [פריסה לייצור (Production)](#פריסה-לייצור)

---

## 🔧 **דרישות מקדימות**

לפני שמתחילים, ודא שיש לך:

- ✅ **Node.js 18+** - [הורד כאן](https://nodejs.org/)
- ✅ **npm** (מותקן עם Node.js) או **pnpm**
- ✅ **חשבון Supabase חינמי** - [הירשם כאן](https://supabase.com)
- ✅ **Git** (אופציונלי) - לניהול קוד

### בדיקה מהירה:

```bash
node --version   # צריך להיות 18 ומעלה
npm --version    # צריך להיות 8 ומעלה
```

---

## 📥 **שלב 1: הורדה והתקנה**

### 1.1 הורדת הפרויקט

אם הורדת את הפרויקט כקובץ ZIP:

```bash
# פתח טרמינל/CMD בתיקיית הפרויקט
cd /path/to/task-management-system
```

או אם משתמש ב-Git:

```bash
git clone <repository-url>
cd task-management-system
```

### 1.2 התקנת תלויות

בחר אחת מהאפשרויות:

**אפשרות א' - עם npm:**
```bash
npm install
```

**אפשרות ב' - עם pnpm (מהיר יותר):**
```bash
# אם אין לך pnpm, התקן אותו:
npm install -g pnpm

# התקן תלויות:
pnpm install
```

**אפשרות ג' - סקריפט אוטומטי:**
```bash
bash setup.sh
```

⏱️ **זמן: 2-3 דקות**

---

## 🗄️ **שלב 2: הגדרת Supabase**

### 2.1 יצירת פרויקט Supabase

1. **היכנס ל:** [https://supabase.com](https://supabase.com)
2. **לחץ על:** "Start your project" (או "New project")
3. **מלא פרטים:**
   - **שם הפרויקט:** `task-management-system` (או שם אחר)
   - **Database Password:** שמור סיסמה חזקה! ⚠️
   - **Region:** בחר אזור קרוב (למשל: Europe West - Ireland)
4. **לחץ:** "Create new project"

⏱️ **זמן המתנה:** 1-2 דקות להקמת הפרויקט

---

### 2.2 העתקת פרטי API

1. **בדשבורד Supabase**, לך ל: **Settings** ⚙️ > **API**

2. **העתק את הערכים הבאים:**
   - **Project URL** - למשל: `https://abcdefg.supabase.co`
   - **anon public key** - מפתח ארוך (לחץ על העין 👁️ לחשיפה)

3. **שמור אותם בצד** - נצטרך אותם בשלב הבא!

---

### 2.3 יצירת קובץ משתני סביבה

**בתיקיית הפרויקט**, צור קובץ בשם `.env.local`:

```bash
# אם יש לך קובץ env.example:
cp env.example .env.local

# או ידנית, צור קובץ .env.local
```

**ערוך את הקובץ `.env.local`** והוסף את הפרטים שהעתקת:

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...המפתח_הארוך_שלך
```

⚠️ **חשוב:** החלף את הערכים עם הפרטים האמיתיים מSupabase שלך!

---

### 2.4 הרצת סקריפטי SQL - יצירת מבנה הנתונים

עכשיו נייצר את כל הטבלאות ומדיניות האבטחה:

#### 📝 **סקריפט 1: טבלאות בסיסיות**

1. בדשבורד Supabase, לך ל: **SQL Editor** 
2. לחץ: **+ New Query**
3. פתח את הקובץ: `scripts/001_create_tables.sql`
4. העתק את כל התוכן והדבק ב-SQL Editor
5. לחץ: **Run** (או F5)
6. ✅ ודא שמופיע: **"Success"**

#### 📝 **סקריפט 2: טבלאות משימות**

1. שוב: **+ New Query**
2. פתח: `scripts/002_create_task_tables.sql`
3. העתק והדבק
4. לחץ: **Run**
5. ✅ ודא: **"Success"**

#### 📝 **סקריפט 3: טבלת OTP**

1. **+ New Query**
2. פתח: `scripts/004_create_otp_table.sql`
3. העתק והדבק
4. לחץ: **Run**
5. ✅ ודא: **"Success"**

#### 📝 **סקריפט 4: Storage (תמונות פרופיל)**

1. **+ New Query**
2. פתח: `scripts/004_setup_storage.sql`
3. העתק והדבק
4. לחץ: **Run**
5. ✅ ודא: **"Success"**

#### ⚡ **סקריפט 5: המרה ל-JSONB (קריטי!)**

זהו הסקריפט החשוב ביותר - הוא ממיר את המבנה למבנה JSONB שהאפליקציה משתמשת בו.

1. **+ New Query**
2. פתח: `scripts/005_convert_to_jsonb.sql`
3. העתק והדבק
4. לחץ: **Run**
5. ✅ ודא: **"Success"**

⚠️ **הערה חשובה:** הסקריפט הזה:
- גיבוי טבלאות קיימות
- יוצר מחדש את הטבלאות עם מבנה JSONB
- מגדיר מדיניות אבטחה (RLS)

#### 🎯 **סקריפט 6: נתוני דמו (אופציונלי)**

אם אתה רוצה נתוני דמו להתחלה:

1. **+ New Query**
2. פתח: `scripts/003_seed_demo_data.sql`
3. העתק והדבק
4. לחץ: **Run**
5. ✅ ודא: **"Success"**

⏱️ **זמן כולל:** 5-10 דקות

---

## 🚀 **שלב 3: הרצת הפרויקט**

עכשיו הכל מוכן! בוא נריץ:

```bash
npm run dev
```

או עם pnpm:

```bash
pnpm dev
```

📱 **פתח בדפדפן:** [http://localhost:3000](http://localhost:3000)

אתה אמור לראות את דף ההתחברות! 🎉

⏱️ **זמן טעינה:** 10-30 שניות

---

## 👤 **שלב 4: יצירת משתמש Admin**

כדי להתחבר, צריך ליצור משתמש Admin:

### **דרך א': דרך Supabase Dashboard (מומלץ)**

1. בדשבורד Supabase, לך ל: **Authentication** 🔐 > **Users**

2. לחץ: **Add user** > **Create new user**

3. **מלא פרטים:**
   ```
   Email: admin@example.com
   Password: Admin123!
   ```
   
4. ✅ **סמן:** "Auto Confirm User" (כדי שהמייל יהיה מאומת מיד)

5. לחץ: **Create user**

6. **אחרי שנוצר**, לחץ על המשתמש ברשימה

7. גלול ל: **User Metadata** (או **Raw User Meta Data**)

8. **הוסף את ה-JSON הבא:**
   ```json
   {
     "name": "מנהל מערכת",
     "role": "admin",
     "avatar": ""
   }
   ```

9. לחץ: **Save** / **Update**

---

### **דרך ב': דרך SQL (מתקדמים)**

הרץ ב-SQL Editor:

```sql
-- יצירת משתמש Admin
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@example.com',
  crypt('Admin123!', gen_salt('bf')),
  now(),
  '{"name": "מנהל מערכת", "role": "admin", "avatar": ""}'::jsonb,
  now(),
  now(),
  ''
);

-- יצירת פרופיל (אם לא נוצר אוטומטית)
INSERT INTO public.users (id, name, email, role, avatar)
SELECT 
  id, 
  'מנהל מערכת', 
  'admin@example.com', 
  'admin',
  ''
FROM auth.users 
WHERE email = 'admin@example.com'
ON CONFLICT (id) DO NOTHING;
```

---

### ✅ **כניסה למערכת**

1. חזור ל: [http://localhost:3000](http://localhost:3000)

2. לחץ על טאב: **"סיסמה"**

3. **התחבר עם:**
   ```
   Email: admin@example.com
   Password: Admin123!
   ```

4. לחץ: **"התחבר"**

🎉 **ברוך הבא למערכת!** 

---

## 🎯 **בדיקה מהירה שהכל עובד**

אחרי ההתחברות, בדוק:

- ✅ **תצוגת הבורד** - אתה אמור לראות 3 עמודות: To Do, In Progress, Done
- ✅ **כפתור "משימה חדשה"** - פועל
- ✅ **תפריט משתמש** (למעלה מימין) - מציג "מנהל מערכת"
- ✅ **ניהול משתמשים** - נגיש (למנהלים בלבד)

### נסה ליצור משימה:

1. לחץ: **"משימה חדשה"**
2. מלא: כותרת ותיאור
3. לחץ: **"צור משימה"**
4. ✅ המשימה צריכה להופיע בעמודת To Do!

---

## 🔧 **פתרון בעיות**

### ❌ שגיאה: "Invalid API key" או "Failed to fetch"

**פתרון:**
1. בדוק שהקובץ `.env.local` קיים בתיקייה הראשית
2. ודא שהערכים נכונים (העתק שוב מSupabase Dashboard)
3. **הפעל מחדש** את השרת:
   ```bash
   # עצור את השרת (Ctrl+C)
   npm run dev
   ```

---

### ❌ שגיאה: "relation does not exist" או "table not found"

**פתרון:**
- לא הרצת את סקריפטי ה-SQL
- חזור לשלב 2.4 והרץ את **כל** הסקריפטים לפי הסדר

---

### ❌ שגיאה: "Error saving tasks" בקונסול

**פתרון:**
- לא הרצת את `005_convert_to_jsonb.sql`
- זהו הסקריפט הקריטי ביותר!
- הרץ אותו ב-SQL Editor
- קרא את: `JSONB_MIGRATION.md` למידע נוסף

---

### ❌ לא מצליח להתחבר

**פתרון:**
1. בדוק ב-Supabase > Authentication > Users שהמשתמש קיים
2. ודא שיש ✅ ליד ה-email (confirmed)
3. בדוק ש-User Metadata כולל `"role": "admin"`
4. נסה ליצור משתמש חדש
5. בדוק בקונסול (F12) אם יש שגיאות

---

### ❌ תמונות פרופיל לא עובדות

**פתרון:**
- הרץ את `scripts/004_setup_storage.sql`
- בדוק ב-Supabase > Storage שיש bucket בשם `profile-images`
- ודא שה-bucket מוגדר כ-Public

---

### ❌ "Module not found" או שגיאות TypeScript

**פתרון:**
```bash
# נקה והתקן מחדש:
rm -rf node_modules
rm package-lock.json
npm install

# או:
npm run build
```

---

## 📦 **פריסה לייצור (Production)**

### אפשרות 1: Vercel (מומלץ - חינמי)

1. **העלה לGitHub:**
   ```bash
   bash init-git.sh
   # עקוב אחרי ההוראות להעלאה לGitHub
   ```

2. **חבר לVercel:**
   - היכנס ל: [vercel.com](https://vercel.com)
   - Import Repository
   - בחר את הפרויקט שלך

3. **הוסף משתני סביבה:**
   - בהגדרות הפרויקט בVercel
   - הוסף:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. **Deploy!** 🚀

⏱️ **זמן:** 5-10 דקות

---

### אפשרות 2: Docker (לשרת פרטי)

```bash
# בניית Image:
docker build -t task-management-system .

# הרצה:
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="your-url" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="your-key" \
  task-management-system
```

---

### אפשרון 3: Build ידני

```bash
# בניית הפרויקט:
npm run build

# הרצה:
npm start
```

הפרויקט יעלה על: [http://localhost:3000](http://localhost:3000)

---

## 📚 **מדריכים נוספים**

- 📖 **README.md** - מידע כללי על הפרויקט
- 🚀 **QUICKSTART.md** - מדריך מהיר ב-5 דקות
- 🔧 **SETUP_GUIDE.md** - הנחיות מפורטות לSupabase
- 📊 **JSONB_MIGRATION.md** - הסבר על מבנה הנתונים
- 🐛 **FIX_GUIDE.md** - פתרונות לבעיות נפוצות

---

## 🎉 **סיימת!**

המערכת שלך אמורה להיות פעילה ועובדת!

### תכונות מרכזיות שכדאי לנסות:

- ✅ **יצירת משימות** והזזה בין עמודות (Drag & Drop)
- ✅ **הוספת תגובות** למשימות
- ✅ **העלאת קבצים** (PDF, Excel, Word)
- ✅ **ניהול משתמשים** (Admin בלבד)
- ✅ **הזמנת משתמשים חדשים** (OTP או סיסמה)
- ✅ **פתקים דביקים** (Sticky Notes)
- ✅ **תצוגות מרובות**: Board, List, Calendar
- ✅ **סטטיסטיקות** ודוחות
- ✅ **ארכיון משימות**
- ✅ **Dark Mode** 🌙

---

## 💬 **צריך עזרה?**

- 🐛 **באגים/שגיאות:** פתח Issue ב-GitHub
- 💡 **שאלות:** צור Discussion
- 📧 **תמיכה:** דרך GitHub Issues

---

## ⏱️ **זמן התקנה כולל**

- ⚡ **מהיר (עם סקריפט):** 10-15 דקות
- 🏃 **רגיל (צעד אחר צעד):** 20-30 דקות
- 🐌 **כולל פריסה:** 30-45 דקות

---

## 💰 **עלות**

- **Development (מקומי):** חינמי 100%
- **Supabase Free Tier:** חינמי (עד 500MB DB, 1GB Storage)
- **Vercel Free Tier:** חינמי (לפרויקטים אישיים)

**סך הכל: 0 ש"ח!** 🎉

---

**בהצלחה עם המערכת!** 🚀

נבנה באהבה עם Next.js 16, React 19, TypeScript ו-Supabase ❤️
