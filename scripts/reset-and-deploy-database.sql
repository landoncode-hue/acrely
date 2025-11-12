-- Complete Database Reset and Deployment Script
-- This script will wipe the entire public schema and redeploy all migrations

-- Step 1: Drop all existing objects in public schema
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Step 2: Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Now we'll apply all migrations in order by reading them from files
-- This is a placeholder - the actual migration content will be concatenated
