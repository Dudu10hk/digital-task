# 🚀 מדריך Deployment ל-Vercel

## 📋 דרישות מוקדמות

- [x] חשבון Vercel (https://vercel.com)
- [x] Supabase project חדש (https://supabase.com)
- [x] Resend API key (https://resend.com)
- [x] Git repository (GitHub/GitLab/Bitbucket)

---

## 🔧 הכנה לפני Deployment

### 1. Supabase Setup

```bash
# 1. צור project חדש ב-Supabase Dashboard
# 2. העתק את:
#    - Project URL
#    - Anon (public) key
# 3. הרץ את כל ה-SQL scripts:
scripts/001_create_tables.sql
scripts/002_create_task_tables.sql
scripts/003_create_otp_table.sql
scripts/004_setup_storage.sql
scripts/005_convert_to_jsonb.sql
scripts/006_security_rls_fixes.sql  # ← חשוב!
```

### 2. Resend Setup

```bash
# 1. צור חשבון ב-https://resend.com
# 2. API Keys → Create API Key
# 3. העתק את המפתח
```

---

## 🌐 Deployment Steps

### שלב 1: חבר ל-Vercel

```bash
# 1. התחבר ל-Vercel Dashboard
# 2. New Project → Import Git Repository
# 3. בחר את ה-repository שלך
# 4. Framework Preset: Next.js (אוטומטי)
```

### שלב 2: הגדר Environment Variables

ב-Vercel Dashboard → Settings → Environment Variables:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
RESEND_API_KEY=re_your-api-key-here

# Optional (auto-set by Vercel)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
RESEND_FROM_EMAIL=onboarding@resend.dev
NODE_ENV=production
```

**חשוב:** סמן את כל הסודות כ-"Secret" ב-Vercel!

### שלב 3: Deploy

```bash
# 1. לחץ "Deploy" ב-Vercel
# 2. המתן לבניה (2-3 דקות)
# 3. בדוק שהכל עובד
```

---

## ✅ בדיקות Post-Deployment

### 1. בדוק Security Headers

```bash
curl -I https://your-app.vercel.app

# חפש:
# ✓ X-Frame-Options: DENY
# ✓ X-Content-Type-Options: nosniff
# ✓ Strict-Transport-Security
```

### 2. בדוק Authentication

```bash
# נסה להתחבר עם OTP
# בדוק ש-rate limiting עובד (3 ניסיונות ב-5 דקות)
```

### 3. בדוק RLS

```sql
-- התחבר ל-Supabase SQL Editor
-- נסה למחוק משימה של משתמש אחר
DELETE FROM tasks WHERE id = 'some-id';
-- צריך להיכשל!
```

---

## 🔐 הגדרות אבטחה נוספות

### Supabase Dashboard

1. **Authentication Settings**
   ```
   Dashboard → Authentication → Providers
   ✓ Email: Enabled
   ✓ Confirm email: Enabled (optional)
   ✓ Secure email change: Enabled
   ```

2. **API Settings**
   ```
   Dashboard → Settings → API
   ✓ JWT expiry: 3600 (1 hour)
   ```

3. **Database Settings**
   ```
   Dashboard → Database → Tables
   ✓ Verify RLS is enabled on all tables
   ```

### Vercel Dashboard

1. **Security Headers**
   ```
   Settings → Headers
   ✓ Already configured in vercel.json
   ```

2. **Custom Domain** (optional)
   ```
   Settings → Domains → Add Domain
   ✓ Add your custom domain
   ✓ Update NEXT_PUBLIC_APP_URL
   ```

3. **Analytics** (recommended)
   ```
   Analytics → Enable
   ✓ Monitor traffic
   ✓ Track errors
   ```

---

## 📊 Monitoring

### Vercel Analytics

```bash
# כבר מותקן:
@vercel/analytics

# נוסף אוטומטית ל-layout.tsx
```

### Error Tracking (optional)

```bash
# התקן Sentry
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs

# עקוב אחר שגיאות בייצור
```

---

## 🔄 CI/CD

### Auto-Deployment

```bash
# Vercel מזהה commits ב-main branch אוטומטית
git push origin main
# → Vercel builds and deploys automatically

# Preview deployments for PRs
git checkout -b feature/new-feature
git push origin feature/new-feature
# → Vercel creates preview URL
```

### Build Commands

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

---

## 🆘 Troubleshooting

### Build Fails

```bash
# בדוק logs ב-Vercel Dashboard
# נפוצים:
1. Missing environment variables
2. TypeScript errors
3. Missing dependencies
```

### Runtime Errors

```bash
# בדוק:
1. Vercel → Deployments → Logs
2. Browser Console (F12)
3. Supabase → Logs
```

### Database Connection

```bash
# בדוק:
1. Supabase URL נכון
2. Anon key נכון
3. RLS policies מוגדרים
```

### Email Not Sending

```bash
# בדוק:
1. Resend API key valid
2. From email verified (domain)
3. Rate limits not exceeded
```

---

## 📚 Resources

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Docs](https://supabase.com/docs)
- [Resend Docs](https://resend.com/docs)

---

## 🎯 Post-Deployment Checklist

- [ ] ✅ Deploy הצליח
- [ ] ✅ URL פועל
- [ ] ✅ Login עובד
- [ ] ✅ OTP נשלח למייל
- [ ] ✅ משימות נשמרות
- [ ] ✅ RLS מגן על נתונים
- [ ] ✅ Rate limiting עובד
- [ ] ✅ Security headers מוגדרים
- [ ] ✅ Analytics מופעל
- [ ] ✅ Custom domain (אופציונלי)
- [ ] ✅ SSL certificate פעיל
- [ ] ✅ Monitoring מוגדר

---

**🎉 מזל טוב! האפליקציה שלך בייצור!**
