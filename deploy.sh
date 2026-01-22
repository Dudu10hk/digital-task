#!/bin/bash

# Deploy Hook Script
# הפעל deployment חדש ל-Vercel

echo "🚀 מפעיל deployment ל-Vercel..."

response=$(curl -s -X POST "https://api.vercel.com/v1/integrations/deploy/prj_5mnmuMEaJZr8uRs4HBvpgkSUy9Jq/0l15Zaj4v6")

echo "✅ Deployment התחיל!"
echo "📊 Response: $response"

# חלץ את ה-job ID
job_id=$(echo $response | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ ! -z "$job_id" ]; then
    echo "🆔 Job ID: $job_id"
    echo ""
    echo "👀 בדוק את ההתקדמות ב:"
    echo "   https://vercel.com/dudu10hks-projects/digital-task"
else
    echo "❌ שגיאה בהפעלת ה-deployment"
fi
