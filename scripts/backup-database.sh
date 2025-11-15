#!/bin/bash
# Database Backup Script for Acrely v2
# Creates full database backup with automatic rotation

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="acrely_backup_$TIMESTAMP.sql"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}💾 Acrely Database Backup Script${NC}"
echo "================================="
echo ""

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if backing up local or production
echo "Select backup source:"
echo "1) Local Supabase (development)"
echo "2) Production Supabase (requires connection string)"
read -p "Choice (1/2): " choice

if [ "$choice" = "1" ]; then
    # Local backup
    DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"
    BACKUP_TYPE="local"
    
    # Check if local Supabase is running
    if ! curl -s http://127.0.0.1:54321 > /dev/null 2>&1; then
        echo -e "${RED}❌ Local Supabase not running${NC}"
        echo "Start with: supabase start"
        exit 1
    fi
    
elif [ "$choice" = "2" ]; then
    # Production backup
    BACKUP_TYPE="production"
    
    # Check for production connection string in env
    if [ -f "$PROJECT_ROOT/.env.production" ]; then
        source "$PROJECT_ROOT/.env.production"
        if [ -z "$DATABASE_URL" ]; then
            echo -e "${YELLOW}DATABASE_URL not found in .env.production${NC}"
            read -p "Enter production database URL: " DB_URL
        else
            DB_URL="$DATABASE_URL"
        fi
    else
        read -p "Enter production database URL: " DB_URL
    fi
    
else
    echo "Invalid choice"
    exit 1
fi

echo ""
echo -e "${BLUE}Backing up $BACKUP_TYPE database...${NC}"
echo ""

# Perform backup
echo "Creating backup: $BACKUP_FILE"

if pg_dump "$DB_URL" \
    --format=plain \
    --no-owner \
    --no-acl \
    --schema=public \
    --file="$BACKUP_DIR/$BACKUP_FILE"; then
    
    echo -e "${GREEN}✓ Backup created successfully${NC}"
    
    # Compress backup
    echo "Compressing backup..."
    gzip "$BACKUP_DIR/$BACKUP_FILE"
    BACKUP_FILE="$BACKUP_FILE.gz"
    
    echo -e "${GREEN}✓ Backup compressed${NC}"
    
    # Get file size
    BACKUP_SIZE=$(du -h "$BACKUP_DIR/$BACKUP_FILE" | cut -f1)
    
    echo ""
    echo -e "${GREEN}✅ Backup Complete!${NC}"
    echo ""
    echo "📁 Location: $BACKUP_DIR/$BACKUP_FILE"
    echo "📊 Size: $BACKUP_SIZE"
    echo ""
    
    # Backup rotation (keep last 10 backups)
    echo "Rotating old backups (keeping last 10)..."
    cd "$BACKUP_DIR"
    ls -t acrely_backup_*.sql.gz | tail -n +11 | xargs -r rm
    
    BACKUP_COUNT=$(ls -1 acrely_backup_*.sql.gz 2>/dev/null | wc -l)
    echo -e "${GREEN}✓ $BACKUP_COUNT backups retained${NC}"
    
    # Create metadata file
    cat > "$BACKUP_DIR/${BACKUP_FILE%.gz}.meta" <<META_EOF
Backup Metadata
===============
Type: $BACKUP_TYPE
Created: $(date)
File: $BACKUP_FILE
Size: $BACKUP_SIZE
Database: $(basename "$DB_URL" | cut -d'/' -f1)
META_EOF
    
    echo ""
    echo -e "${BLUE}💡 Restore Instructions:${NC}"
    echo "gunzip $BACKUP_DIR/$BACKUP_FILE"
    echo "psql <database_url> < $BACKUP_DIR/${BACKUP_FILE%.gz}"
    
else
    echo -e "${RED}❌ Backup failed${NC}"
    exit 1
fi

echo ""
