#!/bin/bash
# Sanitize all documentation files by removing leaked secrets
# This script replaces actual secrets with placeholders

set -e

echo "🧹 Sanitizing documentation files..."
echo "===================================="
echo ""

# Define patterns to replace
SERVICE_KEY_PATTERN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlbnFpbG91cnh0ZnhjaGthd2VrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjIzNDg1NSwiZXhwIjoyMDc3ODEwODU1fQ\.ey_97IO41llNoRNdETLrxSIzIiPa9JyCAoS_UMES7ss"
TERMII_KEY_PATTERN="TLlpIiGIKwzhwErZGPBjxciDtTHuTqSvzSgayCFpCmuJjJOEMLzftmDugTIVBW"
ANON_KEY_PATTERN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlbnFpbG91cnh0ZnhjaGthd2VrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzQ4NTUsImV4cCI6MjA3NzgxMDg1NX0\.OklgPA2Jwo6sE81VolFH5aVubc504oyazx0HQ3u6FTA"

SERVICE_KEY_REPLACEMENT="<your_supabase_service_role_key>"
TERMII_KEY_REPLACEMENT="<your_termii_api_key>"
ANON_KEY_REPLACEMENT="<your_supabase_anon_key>"

# Files to sanitize
FILES=(
    "PRODUCTION_LAUNCH_GUIDE.md"
    "ANALYTICS_QUICKSTART.md"
    "MAINTENANCE_QUEST_SUMMARY.md"
    "PRODUCTION_DEPLOYMENT.md"
    "ANALYTICS_SYSTEM_IMPLEMENTATION.md"
    "FIELD_REPORTS_SYSTEM_COMPLETE.md"
    "BILLING_VERIFICATION_CHECKLIST.md"
    "VERCEL_DEPLOYMENT_CHECKLIST.md"
    "VERCEL_DEPLOYMENT_PREP_SUMMARY.md"
    "TEST_ENVIRONMENT_DEPLOYMENT_CHECKLIST.md"
)

# Function to sanitize a file
sanitize_file() {
    local file=$1
    
    if [ ! -f "$file" ]; then
        echo "⏩ Skipping $file (not found)"
        return
    fi
    
    echo "🔧 Sanitizing $file..."
    
    # Create backup
    cp "$file" "$file.backup"
    
    # Replace secrets
    sed -i.tmp "s/$SERVICE_KEY_PATTERN/$SERVICE_KEY_REPLACEMENT/g" "$file"
    sed -i.tmp "s/$TERMII_KEY_PATTERN/$TERMII_KEY_REPLACEMENT/g" "$file"
    sed -i.tmp "s/$ANON_KEY_PATTERN/$ANON_KEY_REPLACEMENT/g" "$file"
    
    # Clean up temp files
    rm -f "$file.tmp"
    
    echo "✅ $file sanitized"
}

# Sanitize each file
for file in "${FILES[@]}"; do
    sanitize_file "$file"
done

# Also sanitize quest files
if [ -d ".qoder/quests" ]; then
    echo ""
    echo "🔧 Sanitizing quest files..."
    find .qoder/quests -name "*.md" -type f | while read -r file; do
        sanitize_file "$file"
    done
fi

# Sanitize test files
if [ -d "tests" ]; then
    echo ""
    echo "🔧 Sanitizing test files..."
    find tests -name "*.md" -type f | while read -r file; do
        sanitize_file "$file"
    done
fi

echo ""
echo "✅ Sanitization complete!"
echo ""
echo "📊 Summary:"
echo "- Service Role Key replaced in all files"
echo "- Termii API Key replaced in all files"
echo "- Anon Key replaced in all files"
echo ""
echo "⚠️  Backup files created with .backup extension"
echo "    Delete them after verification: find . -name '*.backup' -delete"
echo ""
