#!/bin/bash

# Git Initialization Script for Task Management System

echo "🔧 Git Initialization Script"
echo "============================"
echo ""

# Check if git is already initialized
if [ -d .git ]; then
    echo "⚠️  Git repository כבר קיים!"
    echo ""
    read -p "האם תרצה לאתחל מחדש? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "ביטול..."
        exit 0
    fi
    rm -rf .git
fi

# Initialize git
echo "📦 מאתחל Git repository..."
git init
echo "✅ Git repository הותחל!"
echo ""

# Create .gitignore if not exists
if [ ! -f .gitignore ]; then
    echo "⚠️  .gitignore לא נמצא, יוצר..."
    cat > .gitignore << 'EOF'
# dependencies
/node_modules

# next.js
/.next/
/out/

# production
/build

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files
.env*
!env.example

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
EOF
    echo "✅ .gitignore נוצר!"
fi

# Initial commit
echo ""
echo "📝 יוצר initial commit..."
git add .
git commit -m "Initial commit: Task Management System

- Next.js 16 with App Router
- Supabase integration ready
- Full RTL support
- Dark mode support
- Complete UI components

Ready for deployment!"

echo "✅ Initial commit נוצר!"
echo ""

# Show status
echo "📊 סטטוס Git:"
git log --oneline -1
echo ""

# Instructions for GitHub
echo "🌐 השלבים הבאים - העלאה לGitHub:"
echo ""
echo "1. צור repository חדש בGitHub (ללא README/LICENSE/.gitignore)"
echo "2. הרץ את הפקודות הבאות:"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/task-management-system.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. אחר כך תוכל לפרוס לVercel/Netlify!"
echo ""
echo "✨ Git מוכן!"
