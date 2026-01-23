#!/bin/bash

# Script to test admin user configuration

echo "🔍 Testing Admin User Configuration"
echo "===================================="
echo ""

# Test 1: Check user in database
echo "📊 Test 1: Checking user in database..."
curl -X POST http://localhost:3000/api/debug/check-user \
  -H "Content-Type: application/json" \
  -d '{"email":"dudu10h@gmail.com"}' \
  -s | jq '.'

echo ""
echo ""

# Test 2: Verify OTP login flow
echo "🔐 Test 2: Sending OTP to user..."
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"dudu10h@gmail.com"}' \
  -s | jq '.'

echo ""
echo ""
echo "✅ Tests completed!"
echo ""
echo "📋 Summary of what was fixed:"
echo "  1. loginWithOTP now fetches fresh user data from DB"
echo "  2. User data is saved to localStorage for persistence"
echo "  3. Session is restored automatically on page load"
echo "  4. updateUserRole and editUser update localStorage"
echo "  5. Admin users can drag tasks in in-progress column"
echo "  6. Lock icons only show for non-admin users"
echo "  7. UserManagement component will be visible to admins"
echo ""
