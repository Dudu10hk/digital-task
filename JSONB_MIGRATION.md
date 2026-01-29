# מדריך תיקון שגיאת saveTasks

## הבעיה
המערכת משתמשת במבנה JSONB בקוד, אבל הטבלה ב-Supabase מוגדרת עם עמודות רגילות.
זה גורם לשגיאה: `Error saving tasks: {}`

## הפתרון - המרה ל-JSONB

### שלב 1: הרץ את הסקריפט SQL
1. פתח את Supabase Dashboard
2. עבור ל-SQL Editor
3. העתק והרץ את: `scripts/005_convert_to_jsonb.sql`

⚠️ **אזהרה**: הסקריפט מוחק את הטבלה הישנה ויוצר חדשה!
- אם יש לך נתונים חשובים, הם יישמרו ב-`tasks_backup`
- אם אתה ב-development, זה בסדר למחוק הכל

### שלב 2: רענן את האפליקציה
```bash
# המערכת תיטען מחדש אוטומטית
# או רענן את הדפדפן
```

### שלב 3: בדוק שהכל עובד
1. נסה לגרור משימה
2. לחץ על מספר משימה ושנה את הסדר
3. רענן את הדף - הסדר צריך להישמר!

## מה השתנה?

### לפני (עמודות רגילות):
```sql
CREATE TABLE tasks (
  id uuid,
  title text,
  description text,
  column text,
  ...
)
```

### אחרי (JSONB):
```sql
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,  -- כל הנתונים כאן!
  created_at TIMESTAMP
)
```

## יתרונות של JSONB:
✅ גמישות - אפשר להוסיף שדות בלי לשנות את הטבלה
✅ פשטות - קוד אחיד לכל הטבלאות
✅ ביצועים - פחות queries ל-DB
✅ תחזוקה - קל יותר לנהל

## אם משהו השתבש:
1. הנתונים הישנים נמצאים ב-`tasks_backup`
2. אפשר לשחזר אותם בקלות
3. פנה למפתח אם צריך עזרה

## טבלאות שהומרו:
- ✅ tasks
- ✅ notifications  
- ✅ sticky_notes
- ✅ archived_tasks
