#!/bin/bash
# Test Schema Reset Script
# Purpose: Reset test schema to clean state and optionally seed with test data

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🧪 Test Schema Reset Script${NC}"
echo "============================"
echo ""

# Check if Supabase is running locally
if ! curl -s http://127.0.0.1:54321 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Local Supabase not running${NC}"
    echo "Start with: supabase start"
    exit 1
fi

echo -e "${GREEN}✓ Local Supabase detected${NC}"
echo ""

# Ask for confirmation
read -p "This will DELETE all data in test schema. Continue? (y/N): " confirm
if [ "$confirm" != "y" ]; then
    echo "Cancelled"
    exit 0
fi

echo ""
echo "Resetting test schema..."

# Execute reset function
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres <<EOF
-- Reset test data
SELECT test.reset_test_data();

-- Verify reset
SELECT * FROM test.data_summary;
EOF

echo ""
echo -e "${GREEN}✅ Test schema reset complete${NC}"
echo ""

# Ask if user wants to seed test data
read -p "Seed test schema with sample data? (Y/n): " seed
if [ "$seed" != "n" ]; then
    echo ""
    echo "Seeding test data..."
    
    psql postgresql://postgres:postgres@127.0.0.1:54322/postgres <<EOF
-- Seed test data
SELECT test.seed_test_data();

-- Verify seeding
SELECT * FROM test.data_summary;
EOF
    
    echo ""
    echo -e "${GREEN}✅ Test data seeded${NC}"
fi

echo ""
echo -e "${BLUE}📊 Final Test Schema Summary:${NC}"
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "SELECT * FROM test.data_summary;"

echo ""
echo -e "${GREEN}✅ Done!${NC}"
echo ""
echo "You can now run E2E tests against the test schema"
echo ""
