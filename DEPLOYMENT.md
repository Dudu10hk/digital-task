# מדריך פריסה (Deployment)

## אפשרויות פריסה

### 1. Vercel (מומלץ ביותר)

Vercel היא הבחירה הטובה ביותר עבור Next.js.

#### הכנה:
```bash
# אם עדיין לא עשית, צור git repository
git init
git add .
git commit -m "Initial commit"

# העלה לGitHub
# צור repository ב-GitHub ואז:
git remote add origin https://github.com/username/task-management-system.git
git branch -M main
git push -u origin main
```

#### פריסה:
1. היכנס ל: https://vercel.com
2. לחץ "Add New..." > "Project"
3. בחר את ה-Repository מGitHub
4. הגדר משתני סביבה (Environment Variables):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. לחץ "Deploy"

זהו! הפרויקט יהיה אונליין תוך דקות.

---

### 2. Netlify

#### דרך א' - CLI:
```bash
# התקן Netlify CLI
npm install -g netlify-cli

# התחבר
netlify login

# אתחול
netlify init

# הוסף משתני סביבה
netlify env:set NEXT_PUBLIC_SUPABASE_URL "your-url"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your-key"

# פרוס
netlify deploy --prod
```

#### דרך ב' - Dashboard:
1. היכנס ל: https://app.netlify.com
2. "Add new site" > "Import an existing project"
3. בחר GitHub repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. הוסף Environment Variables
6. Deploy

---

### 3. Railway

1. היכנס ל: https://railway.app
2. "New Project" > "Deploy from GitHub repo"
3. בחר repository
4. הוסף משתני סביבה:
   - Settings > Variables
5. Railway יזהה אוטומטית את Next.js

---

### 4. Render

1. היכנס ל: https://render.com
2. "New +" > "Web Service"
3. חבר GitHub repository
4. הגדרות:
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Environment Variables:
   - הוסף משתני Supabase
6. "Create Web Service"

---

### 5. Cloudflare Pages

```bash
# התקן Wrangler
npm install -g wrangler

# התחבר
wrangler login

# פרוס
npx wrangler pages project create task-management
npx wrangler pages deploy .next
```

---

## הגדרות חשובות לפריסה

### Environment Variables (לכל הפלטפורמות)

חובה להגדיר:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Build Settings

**Build Command:**
```bash
npm run build
```

**Install Command:**
```bash
npm install
```

**Start Command (אם נדרש):**
```bash
npm start
```

**Output Directory:**
```
.next
```

**Node Version:**
```
18.x או עדכן יותר
```

---

## בדיקות לפני פריסה

### 1. בדוק מקומית:
```bash
# בנה את הפרויקט
npm run build

# הרץ את גרסת Production
npm start
```

### 2. בדוק משתני סביבה:
```bash
# ודא שהם מוגדרים נכון
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 3. בדוק Supabase:
- ודא שכל הטבלאות קיימות
- בדוק שה-RLS policies פעילות
- ודא שיש לך משתמש admin

---

## אופטימיזציות לProduction

### 1. הגדר Supabase Connection Pooling
בSupabase Dashboard:
- Settings > Database
- Connection pooling > Enable

### 2. הגדר CDN לתמונות
ב-`next.config.mjs`:
```javascript
images: {
  domains: ['your-supabase-project.supabase.co'],
  unoptimized: false, // שנה לfalse אם אתה רוצה אופטימיזציה
}
```

### 3. הוסף Analytics (אופציונלי)
הפרויקט כבר כולל Vercel Analytics:
```typescript
import { Analytics } from '@vercel/analytics/react'
```

---

## Custom Domain

### Vercel:
1. Settings > Domains
2. הוסף את הדומיין שלך
3. עדכן DNS records

### Netlify:
1. Domain settings
2. Add custom domain
3. Update DNS

### Railway:
1. Settings > Public Networking
2. Custom Domain
3. Update DNS

---

## CI/CD (אוטומטי)

כל הפלטפורמות תומכות ב-CI/CD אוטומטי:

**כשאתה עושה push לGitHub:**
```bash
git add .
git commit -m "Update feature"
git push
```

הפלטפורמה תזהה אוטומטית ותעדכן את האתר!

---

## Monitoring & Logs

### Vercel:
- Dashboard > Project > Analytics
- Logs זמינים בזמן אמת

### Netlify:
- Site > Deploys > Deploy log
- Functions > Logs

### Railway:
- Project > Observability
- Real-time logs

---

## פתרון בעיות בפריסה

### Build Fails
```bash
# בדוק מקומית:
npm run build

# אם עובד מקומית, בדוק:
# 1. Node version (18+)
# 2. משתני סביבה מוגדרים?
# 3. הרשאות גישה לGitHub?
```

### Runtime Errors
```bash
# בדוק logs בפלטפורמה
# בדוק שSupabase מוגדר נכון
# ודא שה-CORS מאושר בSupabase
```

### Database Connection Issues
1. Supabase > Settings > API
2. ודא שה-URL נכון
3. בדוק שה-anon key פעיל
4. אפשר את הדומיין החדש ב-CORS

---

## עדכון הפרויקט

```bash
# שנה קוד
git add .
git commit -m "Description of changes"
git push

# הפלטפורמה תעדכן אוטומטית!
```

---

## Rollback (חזרה לגרסה קודמת)

### Vercel:
1. Deployments
2. בחר deployment קודם
3. "Promote to Production"

### Netlify:
1. Deploys
2. בחר deploy ישן
3. "Publish deploy"

---

## סיכום

**השיטה המומלצת ביותר:**
1. ✅ העלה לGitHub
2. ✅ חבר לVercel
3. ✅ הוסף משתני סביבה
4. ✅ Deploy!

**זמן פריסה:** ~3-5 דקות

**עלות:** חינמי לפרויקטים אישיים/קטנים

🚀 **בהצלחה בפריסה!**
