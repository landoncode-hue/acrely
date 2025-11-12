#!/usr/bin/env python3
import os
import glob

# Paths
migrations_dir = "/Users/lordkay/Development/Acrely/supabase/migrations"
output_file = "/Users/lordkay/Development/Acrely/reset-supabase.sql"

# Header
header = """-- ============================================================================
-- SUPABASE DATABASE RESET SCRIPT
-- WARNING: This will DELETE ALL DATA in the public schema
-- ============================================================================
-- Project: Acrely
-- Target: qenqilourxtfxchkawek.supabase.co
-- Date: 2025-11-12
-- ============================================================================

-- Step 1: Drop ALL objects in public schema to ensure clean slate
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all tables
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
    
    -- Drop all functions
    FOR r IN (SELECT routine_name FROM information_schema.routines WHERE routine_schema = 'public') LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS public.' || quote_ident(r.routine_name) || ' CASCADE';
    END LOOP;
    
    -- Drop all custom types
    FOR r IN (SELECT typname FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typtype = 'e') LOOP
        EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
    END LOOP;
END $$;

-- Step 2: Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- MIGRATIONS START HERE
-- ============================================================================

"""

# Get all migration files sorted
migration_files = sorted(glob.glob(os.path.join(migrations_dir, "*.sql")))

# Write output
with open(output_file, 'w') as out:
    out.write(header)
    
    for migration_file in migration_files:
        filename = os.path.basename(migration_file)
        out.write(f"\n-- ============================================================================\n")
        out.write(f"-- Migration: {filename}\n")
        out.write(f"-- ============================================================================\n\n")
        
        with open(migration_file, 'r') as f:
            out.write(f.read())
        out.write("\n")

print(f"✅ Generated reset SQL with {len(migration_files)} migrations")
print(f"📄 Output: {output_file}")
