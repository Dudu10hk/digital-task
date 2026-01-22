#!/bin/bash

# Task Management System - Quick Setup Script
# This script helps you set up the project quickly

echo "🚀 Task Management System - התקנה מהירה"
echo "========================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  קובץ .env.local לא קיים!"
    echo ""
    echo "יוצר קובץ .env.local מתבנית..."
    cp env.example .env.local
    echo "✅ קובץ .env.local נוצר!"
    echo ""
    echo "⚠️  חשוב! ערוך את הקובץ .env.local והוסף את פרטי Supabase שלך:"
    echo "   1. NEXT_PUBLIC_SUPABASE_URL"
    echo "   2. NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo ""
    echo "📖 לפרטים נוספים, ראה: SETUP_GUIDE.md"
    echo ""
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 מתקין תלויות..."
    if command -v pnpm &> /dev/null; then
        pnpm install
    else
        npm install
    fi
    echo "✅ התלויות הותקנו!"
    echo ""
fi

echo "✨ ההתקנה הושלמה!"
echo ""
echo "📋 השלבים הבאים:"
echo "   1. ודא שהגדרת את Supabase (ראה SETUP_GUIDE.md)"
echo "   2. ערוך את .env.local עם פרטי Supabase שלך"
echo "   3. הרץ את סקריפטי ה-SQL ב-Supabase Dashboard"
echo "   4. הרץ: npm run dev"
echo "   5. פתח: http://localhost:3000"
echo ""
echo "📚 מדריכים:"
echo "   - README.md - מדריך כללי"
echo "   - SETUP_GUIDE.md - הנחיות מפורטות לSupabase"
echo "   - SUPABASE_SETUP.md - הערות נוספות"
echo ""
echo "🎉 בהצלחה!"
