#!/bin/bash
# ============================================================================
# E2E TEST RUNNER WITH DATABASE RESET
# ============================================================================
# This script provides a complete E2E test workflow:
# 1. Resets test database to clean state
# 2. Seeds fresh test data
# 3. Runs Playwright E2E tests in test mode
# ============================================================================

set -e  # Exit on any error

echo "🚀 Starting E2E Test Suite..."
echo "========================================="

# Check if Supabase is running
echo "📡 Checking Supabase connection..."
if ! pnpm supabase status &> /dev/null; then
  echo "❌ Supabase is not running!"
  echo "💡 Start it with: pnpm supabase start"
  exit 1
fi
echo "✅ Supabase is running"

# Reset test database
echo ""
echo "🔄 Resetting test database..."
if pnpm supabase db execute --file scripts/reset-test-db.sql; then
  echo "✅ Test database reset complete"
else
  echo "❌ Failed to reset test database"
  exit 1
fi

# Optional: Wait a moment for DB to settle
sleep 1

# Run E2E tests with TEST_MODE enabled
echo ""
echo "🧪 Running Playwright E2E tests..."
echo "========================================="

if TEST_MODE=true pnpm playwright test "$@"; then
  echo ""
  echo "========================================="
  echo "✅ E2E Tests PASSED"
  echo "========================================="
  exit 0
else
  echo ""
  echo "========================================="
  echo "❌ E2E Tests FAILED"
  echo "========================================="
  echo "💡 View report: pnpm playwright show-report"
  exit 1
fi
