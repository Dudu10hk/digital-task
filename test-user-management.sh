#!/bin/bash

# Test script for user management system
# This script helps verify that the user management is working correctly

echo "🧪 בודק את מערכת ניהול המשתמשים..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env file exists
echo "1️⃣  בודק קובץ .env..."
if [ -f .env ]; then
    echo -e "${GREEN}✓${NC} קובץ .env קיים"
    
    # Check for Supabase configuration
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env && grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env; then
        echo -e "${GREEN}✓${NC} משתני Supabase מוגדרים"
    else
        echo -e "${RED}✗${NC} משתני Supabase חסרים"
        echo -e "${YELLOW}ℹ${NC}  המערכת תעבוד במצב דמו"
    fi
else
    echo -e "${YELLOW}⚠${NC}  קובץ .env לא קיים - המערכת תעבוד במצב דמו"
fi

echo ""
echo "2️⃣  בודק קבצי סקריפט SQL..."

if [ -f "scripts/001_create_tables.sql" ]; then
    echo -e "${GREEN}✓${NC} scripts/001_create_tables.sql קיים"
else
    echo -e "${RED}✗${NC} scripts/001_create_tables.sql חסר"
fi

if [ -f "scripts/007_add_password_column.sql" ]; then
    echo -e "${GREEN}✓${NC} scripts/007_add_password_column.sql קיים"
else
    echo -e "${RED}✗${NC} scripts/007_add_password_column.sql חסר"
fi

if [ -f "scripts/008_users_rls_policies.sql" ]; then
    echo -e "${GREEN}✓${NC} scripts/008_users_rls_policies.sql קיים"
else
    echo -e "${RED}✗${NC} scripts/008_users_rls_policies.sql חסר"
fi

echo ""
echo "3️⃣  בודק קבצי קוד..."

if [ -f "components/user-management.tsx" ]; then
    echo -e "${GREEN}✓${NC} components/user-management.tsx קיים"
else
    echo -e "${RED}✗${NC} components/user-management.tsx חסר"
fi

if [ -f "app/api/auth/invite/route.ts" ]; then
    echo -e "${GREEN}✓${NC} app/api/auth/invite/route.ts קיים"
else
    echo -e "${RED}✗${NC} app/api/auth/invite/route.ts חסר"
fi

echo ""
echo "4️⃣  בודק מדריכים..."

if [ -f "USER_MANAGEMENT_SETUP.md" ]; then
    echo -e "${GREEN}✓${NC} מדריך הגדרה מפורט קיים"
else
    echo -e "${YELLOW}⚠${NC}  מדריך הגדרה מפורט חסר"
fi

if [ -f "QUICK_USER_GUIDE.md" ]; then
    echo -e "${GREEN}✓${NC} מדריך מהיר קיים"
else
    echo -e "${YELLOW}⚠${NC}  מדריך מהיר חסר"
fi

echo ""
echo "5️⃣  בודק תלויות..."

if [ -f "package.json" ]; then
    if grep -q "next" package.json; then
        echo -e "${GREEN}✓${NC} Next.js מותקן"
    fi
    if grep -q "supabase" package.json; then
        echo -e "${GREEN}✓${NC} Supabase client מותקן"
    fi
else
    echo -e "${RED}✗${NC} package.json לא נמצא"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 סיכום בדיקה:"
echo ""
echo "✅ אם כל הבדיקות עברו בהצלחה - המערכת מוכנה לשימוש"
echo "⚠️  אם יש אזהרות - המערכת תעבוד אבל ייתכנו בעיות"
echo "❌ אם יש שגיאות - יש לתקן אותן לפני השימוש"
echo ""
echo "📚 למידע נוסף:"
echo "   • קרא את USER_MANAGEMENT_SETUP.md להוראות הגדרה"
echo "   • קרא את QUICK_USER_GUIDE.md למדריך מהיר"
echo "   • קרא את USER_MANAGEMENT_CHANGES.md לסיכום השינויים"
echo ""
echo "🚀 להפעלת המערכת:"
echo "   npm install"
echo "   npm run dev"
echo ""
