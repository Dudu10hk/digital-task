# מדריך מהיר להגדרת Supabase

## שלב 1: יצירת פרויקט Supabase

1. היכנס ל: https://supabase.com
2. לחץ על "Start your project"
3. צור פרויקט חדש:
   - שם הפרויקט: `task-management-system`
   - Database Password: שמור אותו במקום בטוח!
   - Region: בחר את האזור הקרוב ביותר (Europe West - Ireland)

## שלב 2: קבלת פרטי ה-API

1. בדשבורד של הפרויקט, לך ל: **Settings** > **API**
2. העתק את:
   - **Project URL** (למשל: `https://xxxxx.supabase.co`)
   - **anon public** key (מפתח ארוך)

## שלב 3: יצירת קובץ .env.local

במחשב שלך, בתיקיית הפרויקט, צור קובץ בשם `.env.local` ושים בו:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=המפתח_הארוך_שהעתקת
```

## שלב 4: הרצת סקריפטי SQL

1. בדשבורד של Supabase, לך ל: **SQL Editor**
2. לחץ על **+ New Query**
3. העתק והדבק את התוכן של `scripts/002_create_task_tables.sql`
4. לחץ **Run** (F5)
5. אם הכל עבר בהצלחה, תראה "Success"

## שלב 5: (אופציונלי) נתוני דמו

אם אתה רוצה נתוני דמו להתחלה:

1. שוב ב-SQL Editor, צור query חדש
2. העתק והדבק את `scripts/003_seed_demo_data.sql`
3. הרץ אותו

**שים לב:** נתוני הדמו כוללים 4 משתמשים עם ID-ים קבועים. כדי להתחבר תצטרך ליצור משתמשים אמיתיים.

## שלב 6: יצירת משתמש Admin

### דרך א' - דרך Dashboard:
1. לך ל: **Authentication** > **Users**
2. לחץ **Add user** > **Create new user**
3. מלא:
   - Email: `admin@example.com`
   - Password: `Admin123!` (או סיסמה אחרת)
   - Auto Confirm User: ✅ (סמן)
4. לחץ **Create user**
5. אחרי שהמשתמש נוצר, לחץ עליו
6. לך ל-**Raw User Meta Data** והוסף:
```json
{
  "name": "מנהל מערכת",
  "role": "admin"
}
```
7. שמור

### דרך ב' - דרך SQL:
```sql
-- צור משתמש (יצר באופן אוטומטי profile בזכות הטריגר)
-- הרץ זאת רק אם לא השתמשת בדרך א'
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@example.com',
  crypt('Admin123!', gen_salt('bf')),
  now(),
  '{"name": "מנהל מערכת", "role": "admin"}'::jsonb,
  now(),
  now()
);
```

## שלב 7: בדיקה

עכשיו הרץ את הפרויקט:
```bash
npm run dev
```

ופתח: http://localhost:3000

התחבר עם:
- Email: `admin@example.com`
- Password: `Admin123!`

---

## פתרון בעיות נפוצות

### שגיאה: "relation does not exist"
- בדוק שהרצת את כל סקריפטי ה-SQL
- בדוק שאתה ב-schema הנכון (`public`)

### שגיאה: "Invalid API key"
- בדוק שהעתקת נכון את המפתחות
- בדוק שהקובץ `.env.local` נמצא בתיקייה הראשית של הפרויקט
- הפעל מחדש את שרת הפיתוח (`npm run dev`)

### לא מצליח להתחבר
- בדוק ב-Supabase Dashboard > Authentication > Users שהמשתמש קיים
- בדוק שה-email confirmed (צריך להיות ✅)
- נסה לאפס סיסמה דרך הדשבורד

### Tables לא נוצרו
- ודא שהרצת את `002_create_task_tables.sql` (לא את 001)
- בדוק שאין שגיאות ב-SQL Editor
- אם יש שגיאה, תקן ונסה שוב
