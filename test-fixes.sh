#!/bin/bash

# סקריפט בדיקה אוטומטי - מערכת ניהול משימות
# בודק את כל התיקונים שבוצעו

echo "🔍 בודק תיקונים במערכת ניהול משימות..."
echo "============================================"
echo ""

# צבעים
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# בדיקה 1: המשתמש admin במאגר
echo "📋 בדיקה 1: בדיקת הרשאות המשתמש במאגר"
echo "----------------------------------------"

RESPONSE=$(curl -s -X POST http://localhost:3000/api/debug/check-user \
  -H "Content-Type: application/json" \
  -d '{"email":"dudu10h@gmail.com"}')

if [[ $RESPONSE == *"admin"* ]]; then
  echo -e "${GREEN}✓${NC} המשתמש dudu10h@gmail.com הוא admin במאגר"
  echo "   Response: $RESPONSE"
else
  echo -e "${RED}✗${NC} המשתמש לא נמצא או לא admin"
  echo "   Response: $RESPONSE"
fi

echo ""

# בדיקה 2: הקבצים המעודכנים קיימים
echo "📋 בדיקה 2: בדיקת קיום קבצים מעודכנים"
echo "----------------------------------------"

FILES=(
  "lib/task-context.tsx"
  "components/dashboard.tsx"
  "components/user-management.tsx"
  "components/views/board-view.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✓${NC} $file קיים"
  else
    echo -e "${RED}✗${NC} $file לא נמצא"
  fi
done

echo ""

# בדיקה 3: בדיקת תוכן task-context.tsx
echo "📋 בדיקה 3: בדיקת תוכן task-context.tsx"
echo "----------------------------------------"

CHECKS=(
  "initializeSession:פונקציית initializeSession"
  "refreshInterval:בדיקה מחזורית (polling)"
  "UserRole:import של UserRole type"
  "updateUserRole.*async:async updateUserRole"
)

for check in "${CHECKS[@]}"; do
  PATTERN="${check%%:*}"
  DESC="${check##*:}"
  
  if grep -q "$PATTERN" lib/task-context.tsx; then
    echo -e "${GREEN}✓${NC} נמצא: $DESC"
  else
    echo -e "${RED}✗${NC} לא נמצא: $DESC"
  fi
done

echo ""

# בדיקה 4: בדיקת board-view.tsx - מנעולים
echo "📋 בדיקה 4: בדיקת לוגיקת מנעולים ב-board-view"
echo "----------------------------------------"

LOCK_CHECKS=(
  "!isAdmin().*Lock:תנאי הצגת מנעול רק למי שלא admin"
  "if.*isViewer.*e.preventDefault:חסימת גרירה ל-viewers"
  "in-progress.*!isAdmin.*e.preventDefault:חסימת גרירה ב-in-progress למי שלא admin"
)

for check in "${LOCK_CHECKS[@]}"; do
  PATTERN="${check%%:*}"
  DESC="${check##*:}"
  
  if grep -Pzo "$PATTERN" components/views/board-view.tsx &>/dev/null || \
     grep -l "$PATTERN" components/views/board-view.tsx &>/dev/null; then
    echo -e "${GREEN}✓${NC} נמצא: $DESC"
  else
    # Try simpler grep
    SIMPLE_PATTERN=$(echo "$PATTERN" | cut -d'.' -f1)
    if grep -q "$SIMPLE_PATTERN" components/views/board-view.tsx; then
      echo -e "${YELLOW}~${NC} חלקי: $DESC"
    else
      echo -e "${RED}✗${NC} לא נמצא: $DESC"
    fi
  fi
done

echo ""

# בדיקה 5: Build המערכת
echo "📋 בדיקה 5: בדיקת build המערכת"
echo "----------------------------------------"

if npm run build &>/dev/null; then
  echo -e "${GREEN}✓${NC} Build עבר בהצלחה"
else
  echo -e "${RED}✗${NC} Build נכשל"
  echo "   הרץ 'npm run build' לפרטים נוספים"
fi

echo ""

# בדיקה 6: Git status
echo "📋 בדיקה 6: בדיקת Git status"
echo "----------------------------------------"

GIT_STATUS=$(git status --short)

if [ -z "$GIT_STATUS" ]; then
  echo -e "${GREEN}✓${NC} Working tree נקי (אין שינויים)"
else
  echo -e "${YELLOW}!${NC} יש שינויים שלא נשמרו:"
  echo "$GIT_STATUS"
fi

echo ""

# סיכום
echo "============================================"
echo "🏁 סיכום הבדיקות"
echo "============================================"
echo ""
echo "אם כל הבדיקות עברו בהצלחה, המערכת תקינה!"
echo ""
echo "💡 צעדים נוספים:"
echo "1. רענן את הדפדפן (F5)"
echo "2. נקה Cache וCookies אם צריך"
echo "3. התנתק והתחבר מחדש"
echo "4. המתן עד 30 שניות (polling interval)"
echo ""
echo "🔗 קישורים:"
echo "   דוח מפורט: ./FIXES_REPORT.md"
echo "   GitHub: https://github.com/Dudu10hk/digital-task"
echo ""
