#!/bin/bash

# 🚀 Task Management System - סקריפט התקנה מהיר
# ================================================

echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║   🚀 מערכת ניהול משימות - התקנה מהירה        ║"
echo "║   Task Management System - Quick Install    ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

# צבעים
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# פונקציות עזר
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# בדיקה אם Node.js מותקן
if ! command -v node &> /dev/null; then
    print_error "Node.js לא מותקן!"
    echo ""
    echo "הורד והתקן Node.js מ: https://nodejs.org/"
    echo "נדרש: Node.js 18 ומעלה"
    exit 1
fi

NODE_VERSION=$(node -v)
print_success "Node.js מותקן: $NODE_VERSION"
echo ""

# שלב 1: בדיקת קובץ .env.local
echo "📋 שלב 1 מתוך 4: בדיקת משתני סביבה"
echo "─────────────────────────────────────────"

if [ ! -f .env.local ]; then
    print_warning "קובץ .env.local לא קיים!"
    echo ""
    
    if [ -f env.example ]; then
        print_info "יוצר קובץ .env.local מתבנית..."
        cp env.example .env.local
        print_success "קובץ .env.local נוצר!"
        echo ""
        print_warning "חשוב! עכשיו ערוך את .env.local והוסף:"
        echo "   1. NEXT_PUBLIC_SUPABASE_URL (מ-Supabase Dashboard)"
        echo "   2. NEXT_PUBLIC_SUPABASE_ANON_KEY (מ-Supabase Dashboard)"
        echo ""
        echo "📖 לעזרה: ראה INSTALL.md או SETUP_GUIDE.md"
        echo ""
        read -p "לחץ Enter אחרי שסיימת לערוך את .env.local..."
    else
        print_error "קובץ env.example לא קיים!"
        echo ""
        echo "צור ידנית קובץ .env.local עם:"
        echo "NEXT_PUBLIC_SUPABASE_URL=your-url"
        echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key"
        exit 1
    fi
else
    print_success "קובץ .env.local קיים!"
    
    # בדיקה אם הקובץ מכיל ערכים אמיתיים
    if grep -q "your-project-url" .env.local || grep -q "your-anon-key" .env.local; then
        print_warning "נראה שלא ערכת את .env.local עם הפרטים האמיתיים"
        echo ""
        echo "ערוך את .env.local עם הפרטים מ-Supabase:"
        echo "   Settings > API > Project URL & anon key"
        echo ""
        read -p "לחץ Enter אחרי שסיימת..."
    fi
fi

echo ""

# שלב 2: התקנת תלויות
echo "📦 שלב 2 מתוך 4: התקנת תלויות"
echo "─────────────────────────────────────────"

if [ -d node_modules ]; then
    print_success "node_modules כבר קיים, דילוג..."
else
    print_info "מתקין תלויות... (זה יכול לקחת 2-3 דקות)"
    
    # בדיקה איזה package manager להשתמש
    if command -v pnpm &> /dev/null; then
        print_info "משתמש ב-pnpm..."
        pnpm install
    elif command -v yarn &> /dev/null; then
        print_info "משתמש ב-yarn..."
        yarn install
    else
        print_info "משתמש ב-npm..."
        npm install
    fi
    
    if [ $? -eq 0 ]; then
        print_success "התלויות הותקנו בהצלחה!"
    else
        print_error "שגיאה בהתקנת התלויות"
        exit 1
    fi
fi

echo ""

# שלב 3: בדיקת סקריפטי SQL
echo "🗄️  שלב 3 מתוך 4: סקריפטי SQL"
echo "─────────────────────────────────────────"

if [ -d scripts ]; then
    print_success "תיקיית scripts קיימת"
    
    SQL_FILES=(
        "001_create_tables.sql"
        "002_create_task_tables.sql"
        "004_create_otp_table.sql"
        "004_setup_storage.sql"
        "005_convert_to_jsonb.sql"
    )
    
    echo ""
    print_warning "עכשיו צריך להריץ את סקריפטי ה-SQL ב-Supabase:"
    echo ""
    echo "1. היכנס ל-Supabase Dashboard > SQL Editor"
    echo "2. הרץ את הקבצים הבאים לפי הסדר:"
    echo ""
    
    for file in "${SQL_FILES[@]}"; do
        if [ -f "scripts/$file" ]; then
            echo "   ✓ scripts/$file"
        else
            print_warning "   ✗ scripts/$file - לא נמצא!"
        fi
    done
    
    echo ""
    echo "3. (אופציונלי) scripts/003_seed_demo_data.sql - נתוני דמו"
    echo ""
    print_info "חשוב במיוחד: 005_convert_to_jsonb.sql"
    echo ""
    read -p "לחץ Enter אחרי שהרצת את כל הסקריפטים..."
else
    print_error "תיקיית scripts לא קיימת!"
fi

echo ""

# שלב 4: בדיקת בנייה
echo "🔨 שלב 4 מתוך 4: בדיקת בנייה"
echo "─────────────────────────────────────────"

print_info "מריץ type-check..."
if npm run type-check &> /dev/null; then
    print_success "בדיקת TypeScript עברה בהצלחה!"
else
    print_warning "יש שגיאות TypeScript, אבל אפשר להמשיך"
fi

echo ""

# סיכום
echo ""
echo "╔═══════════════════════════════════════════════╗"
echo "║            ✨ ההתקנה הושלמה! ✨              ║"
echo "╚═══════════════════════════════════════════════╝"
echo ""

print_success "כל השלבים הושלמו!"
echo ""

echo "📋 השלבים הבאים:"
echo "─────────────────────────────────────────"
echo ""
echo "1️⃣  צור משתמש Admin ב-Supabase:"
echo "   Authentication > Users > Add user"
echo "   Email: admin@example.com"
echo "   Password: Admin123!"
echo "   User Metadata: {\"name\": \"מנהל\", \"role\": \"admin\"}"
echo ""
echo "2️⃣  הרץ את השרת:"
echo "   npm run dev"
echo ""
echo "3️⃣  פתח בדפדפן:"
echo "   http://localhost:3000"
echo ""
echo "4️⃣  התחבר עם המשתמש שיצרת!"
echo ""

print_info "למדריך מפורט: ראה INSTALL.md"
echo ""

echo "📚 מדריכים נוספים:"
echo "   • INSTALL.md - מדריך מלא"
echo "   • QUICKSTART.md - התחלה מהירה"
echo "   • SETUP_GUIDE.md - הגדרת Supabase"
echo "   • JSONB_MIGRATION.md - מבנה נתונים"
echo ""

echo "💡 טיפים:"
echo "   • השתמש ב-npm run dev למצב פיתוח"
echo "   • השתמש ב-npm run build לבנייה לייצור"
echo "   • F12 בדפדפן לראות שגיאות בקונסול"
echo ""

print_success "בהצלחה! 🚀"
echo ""

# שאלה אם להריץ את השרת
read -p "האם להריץ את שרת הפיתוח עכשיו? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    print_info "מריץ שרת פיתוח..."
    echo ""
    npm run dev
fi
