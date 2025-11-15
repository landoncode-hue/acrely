#!/bin/bash
# Database Restore Script for Acrely v2
# Restores database from backup file with safety checks

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/backups"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}♻️  Acrely Database Restore Script${NC}"
echo "==================================="
echo ""

# Check if backups directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${RED}❌ No backups directory found${NC}"
    echo "Create backups first with: ./scripts/backup-database.sh"
    exit 1
fi

# List available backups
echo "Available backups:"
echo ""
cd "$BACKUP_DIR"
backups=($(ls -t acrely_backup_*.sql.gz 2>/dev/null))

if [ ${#backups[@]} -eq 0 ]; then
    echo -e "${RED}❌ No backups found${NC}"
    exit 1
fi

# Display backups with numbers
for i in "${!backups[@]}"; do
    backup="${backups[$i]}"
    size=$(du -h "$backup" | cut -f1)
    meta_file="${backup%.gz}.meta"
    
    if [ -f "$meta_file" ]; then
        created=$(grep "Created:" "$meta_file" | cut -d':' -f2-)
        echo "$((i+1))) $backup (${size}${created})"
    else
        echo "$((i+1))) $backup ($size)"
    fi
done

echo ""
read -p "Select backup to restore (1-${#backups[@]}): " selection

if ! [[ "$selection" =~ ^[0-9]+$ ]] || [ "$selection" -lt 1 ] || [ "$selection" -gt ${#backups[@]} ]; then
    echo -e "${RED}Invalid selection${NC}"
    exit 1
fi

SELECTED_BACKUP="${backups[$((selection-1))]}"

echo ""
echo -e "${YELLOW}⚠️  WARNING: This will REPLACE all data in the target database${NC}"
echo ""
echo "Selected backup: $SELECTED_BACKUP"
echo ""

# Select restore target
echo "Select restore target:"
echo "1) Local Supabase (development)"
echo "2) Test schema (recommended for verification)"
echo "3) Production (DANGEROUS - requires confirmation)"
read -p "Choice (1/2/3): " target_choice

if [ "$target_choice" = "1" ]; then
    DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
    TARGET_TYPE="local development"
    
elif [ "$target_choice" = "2" ]; then
    DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
    TARGET_TYPE="test schema"
    SCHEMA_OPTION="--schema=test"
    
elif [ "$target_choice" = "3" ]; then
    TARGET_TYPE="PRODUCTION"
    
    echo ""
    echo -e "${RED}⚠️⚠️⚠️  PRODUCTION RESTORE - EXTREME CAUTION ⚠️⚠️⚠️${NC}"
    echo ""
    read -p "Type 'RESTORE PRODUCTION' to confirm: " confirm
    
    if [ "$confirm" != "RESTORE PRODUCTION" ]; then
        echo "Cancelled"
        exit 0
    fi
    
    read -p "Enter production database URL: " DB_URL
    
else
    echo "Invalid choice"
    exit 1
fi

echo ""
echo -e "${YELLOW}Final confirmation:${NC}"
echo "Backup: $SELECTED_BACKUP"
echo "Target: $TARGET_TYPE"
echo ""
read -p "Proceed with restore? (type 'yes' to confirm): " final_confirm

if [ "$final_confirm" != "yes" ]; then
    echo "Cancelled"
    exit 0
fi

# Decompress if needed
if [[ "$SELECTED_BACKUP" == *.gz ]]; then
    echo ""
    echo "Decompressing backup..."
    gunzip -k "$SELECTED_BACKUP"
    RESTORE_FILE="${SELECTED_BACKUP%.gz}"
else
    RESTORE_FILE="$SELECTED_BACKUP"
fi

echo ""
echo -e "${BLUE}Starting restore...${NC}"
echo ""

# Perform restore
if [ "$target_choice" = "2" ]; then
    # Restore to test schema - reset first
    echo "Resetting test schema..."
    psql "$DB_URL" -c "SELECT test.reset_test_data();"
    
    # Restore to test schema
    if psql "$DB_URL" < "$RESTORE_FILE" 2>&1 | grep -v "already exists" | grep -v "WARNING"; then
        echo -e "${GREEN}✓ Restore completed${NC}"
    else
        echo -e "${RED}❌ Restore failed${NC}"
        exit 1
    fi
else
    # Full database restore
    if psql "$DB_URL" < "$RESTORE_FILE" 2>&1 | grep -v "already exists" | grep -v "WARNING"; then
        echo -e "${GREEN}✓ Restore completed${NC}"
    else
        echo -e "${RED}❌ Restore failed${NC}"
        exit 1
    fi
fi

# Clean up decompressed file
if [[ "$SELECTED_BACKUP" == *.gz ]]; then
    rm "$RESTORE_FILE"
fi

echo ""
echo -e "${GREEN}✅ Database Restored Successfully!${NC}"
echo ""
echo "Target: $TARGET_TYPE"
echo "From: $SELECTED_BACKUP"
echo ""

# Verify restore
echo "Verifying restore..."
if [ "$target_choice" = "2" ]; then
    psql "$DB_URL" -c "SELECT * FROM test.data_summary;"
else
    psql "$DB_URL" -c "SELECT COUNT(*) as customer_count FROM customers; SELECT COUNT(*) as plot_count FROM plots;"
fi

echo ""
echo -e "${BLUE}💡 Next Steps:${NC}"
echo "1. Verify data integrity"
echo "2. Test application functionality"
echo "3. Check edge functions"
echo ""
