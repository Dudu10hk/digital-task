# הוראות חיבור Supabase

## מה נעשה עד עכשיו:
1. ✅ יצרנו את מבנה הטבלאות ב-Supabase
2. ✅ הוספנו מדיניות RLS (Row Level Security)  
3. ✅ יצרנו clients ל-Supabase (browser וserver)

## מה צריך לעשות עכשיו:

### שלב 1: הוספת נתוני דמו (אופציונלי)
אם את רוצה משתמשים ומשימות לדוגמה, הריצי את:
`/scripts/003_seed_demo_data.sql` 
ב-Supabase SQL Editor

###שלב 2: יצירת משתמש ראשון
**אפשרות א' - דרך Supabase Dashboard:**
1. לכי ל-Authentication בדשבורד
2. צרי משתמש חדש
3. הוסיפי במטא-דאטה: `{"role": "admin"}`

**אפשרות ב' - צור עמוד הרשמה:**
אני יכול ליצור עמוד sign-up שמאפשר הרשמה ישירה

### שלב 3: עדכון הקוד
אני צריך לעדכן את:
- ✅ `/lib/supabase/client.ts` - קיים
- ✅ `/lib/supabase/server.ts` - קיים  
- ⏳ `/lib/task-context.tsx` - להמיר לעבוד עם Supabase
- ⏳ `/app/page.tsx` - לשנות מסיסמה לאימות Supabase
- ⏳ הוספת middleware לאימות

## שמות עמודות שהשתנו:
- `column` → `board_column`
- `order` → `task_order`
- `type` → `file_type` / `notification_type`

## המשך:
תגידי לי אם את רוצה שאמשיך עם העדכון האוטומטי של הקוד, או שאת מעדיפה לעשות צעד אחד בכל פעם?
