-- Import Legacy Data from CSV Files
-- This migration normalizes and imports data from 7 estate CSV files

-- ============================================================================
-- STEP 1: Helper Functions for Normalization
-- ============================================================================

-- Normalize Nigerian phone numbers
CREATE OR REPLACE FUNCTION normalize_phone(raw TEXT) RETURNS TEXT AS $$
DECLARE t TEXT; d TEXT;
BEGIN
  IF raw IS NULL OR TRIM(raw) = '' THEN RETURN NULL; END IF;
  -- Keep only first segment before slash/comma
  t := SPLIT_PART(TRIM(raw), '/', 1);
  t := SPLIT_PART(t, ',', 1);
  t := REGEXP_REPLACE(t, '\s+', '', 'g');
  d := REGEXP_REPLACE(t, '[^0-9]', '', 'g');
  IF d IS NULL OR d = '' THEN RETURN NULL; END IF;
  -- Common patterns: 0803... → +234803..., 234803... → +234803..., 803... → +234803...
  IF d LIKE '0__________' THEN RETURN '+234' || SUBSTRING(d FROM 2);
  ELSIF d LIKE '234__________' THEN RETURN '+' || d;
  ELSIF LENGTH(d) = 10 THEN RETURN '+234' || d;
  ELSIF LENGTH(d) >= 10 THEN RETURN '+234' || RIGHT(d, 10);
  ELSE RETURN '+234' || d;
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Parse multiple date formats safely
CREATE OR REPLACE FUNCTION parse_date(raw TEXT) RETURNS DATE AS $$
DECLARE t TEXT;
BEGIN
  IF raw IS NULL THEN RETURN NULL; END IF;
  t := TRIM(raw);
  IF t = '' THEN RETURN NULL; END IF;
  BEGIN RETURN TO_DATE(t, 'YYYY-MM-DD'); EXCEPTION WHEN others THEN
  BEGIN RETURN TO_DATE(t, 'MM/DD/YYYY'); EXCEPTION WHEN others THEN
  BEGIN RETURN TO_DATE(t, 'DD/MM/YYYY'); EXCEPTION WHEN others THEN
  BEGIN RETURN TO_DATE(t, 'DD-Mon-YY'); EXCEPTION WHEN others THEN
  BEGIN RETURN TO_DATE(t, 'DD-MON-YY'); EXCEPTION WHEN others THEN
  BEGIN RETURN TO_DATE(t, 'DD-Mon-YYYY'); EXCEPTION WHEN others THEN
  BEGIN RETURN TO_DATE(t, 'MM-DD-YYYY'); EXCEPTION WHEN others THEN
  BEGIN RETURN TO_DATE(t, 'YYYY/MM/DD'); EXCEPTION WHEN others THEN
  RETURN NULL; END; END; END; END; END; END; END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Parse amounts with commas, plus signs (1100000+220K), K suffix, and percentages
CREATE OR REPLACE FUNCTION parse_amount_advanced(raw TEXT) RETURNS NUMERIC AS $$
DECLARE t TEXT; base NUMERIC := 0; part TEXT; extra NUMERIC := 0;
BEGIN
  IF raw IS NULL THEN RETURN NULL; END IF;
  t := TRIM(raw);
  IF t = '' THEN RETURN NULL; END IF;
  -- If contains %, return NULL (unknown)
  IF POSITION('%' IN t) > 0 THEN RETURN NULL; END IF;
  -- Split by '+' and sum parts
  FOR part IN SELECT UNNEST(STRING_TO_ARRAY(t, '+')) LOOP
    part := TRIM(part);
    IF RIGHT(UPPER(part), 1) = 'K' THEN
      extra := NULLIF(REGEXP_REPLACE(LEFT(part, LENGTH(part)-1), '[^0-9\.-]', '', 'g'), '')::NUMERIC * 1000;
      base := base + COALESCE(extra, 0);
    ELSE
      extra := NULLIF(REGEXP_REPLACE(part, '[^0-9\.-]', '', 'g'), '')::NUMERIC;
      base := base + COALESCE(extra, 0);
    END IF;
  END LOOP;
  RETURN NULLIF(base, 0);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Parse plot size (50/100 → 465 sqm, 100/100 → 930 sqm, etc)
CREATE OR REPLACE FUNCTION parse_plot_size(raw TEXT) RETURNS NUMERIC AS $$
DECLARE t TEXT; numerator NUMERIC; denominator NUMERIC;
BEGIN
  IF raw IS NULL THEN RETURN NULL; END IF;
  t := UPPER(TRIM(raw));
  -- If already in SQM format (e.g., "900SQM")
  IF POSITION('SQM' IN t) > 0 THEN
    RETURN NULLIF(REGEXP_REPLACE(t, '[^0-9\.]', '', 'g'), '')::NUMERIC;
  END IF;
  -- If fraction format (e.g., "50/100")
  IF POSITION('/' IN t) > 0 THEN
    numerator := NULLIF(SPLIT_PART(t, '/', 1), '')::NUMERIC;
    denominator := NULLIF(SPLIT_PART(t, '/', 2), '')::NUMERIC;
    -- Assume 100/100 = 930 sqm standard plot
    RETURN (numerator / 100.0) * 930;
  END IF;
  -- Fallback: try to parse as number
  RETURN NULLIF(REGEXP_REPLACE(t, '[^0-9\.]', '', 'g'), '')::NUMERIC;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- STEP 2: Create Staging Tables (one per CSV file)
-- ============================================================================

-- City of David Estate (CODE)
CREATE TABLE IF NOT EXISTS staging_cod (
  date TEXT, customer_name TEXT, plot_size TEXT, plot_no TEXT,
  payment TEXT, balance TEXT, location TEXT, phone_no TEXT,
  referred_by TEXT, estate_code TEXT
);

-- Ehi Green Park Estate (EGPE)
CREATE TABLE IF NOT EXISTS staging_egpe (
  date TEXT, customer_name TEXT, plot_size TEXT, plot_no TEXT,
  beacon_no TEXT, payment TEXT, balance TEXT, phone_number TEXT,
  refered_by TEXT, amount_paid TEXT, addresss TEXT, code TEXT
);

-- New Era Estate (NEWE)
CREATE TABLE IF NOT EXISTS staging_newe (
  date TEXT, customer_name TEXT, col3 TEXT, plot_no TEXT,
  beacon_no TEXT, payment TEXT, balance TEXT, phone_number TEXT,
  referral TEXT, addresss TEXT, code TEXT
);

-- Oduwa Housing Estate (OHE)
CREATE TABLE IF NOT EXISTS staging_ohe (
  date TEXT, customer_name TEXT, plot_size TEXT, plot_no TEXT,
  beacon_no TEXT, payment TEXT, balance TEXT, phone_number TEXT,
  refered_by TEXT, amount_paid TEXT, col11 TEXT, code TEXT, col13 TEXT
);

-- Ose Perfection Garden Estate (OPGE)
CREATE TABLE IF NOT EXISTS staging_opge (
  date TEXT, customer_name TEXT, plot_size TEXT, plot_no TEXT,
  payment TEXT, balance TEXT, reffered_by TEXT, phone_number TEXT,
  address TEXT, estate_code TEXT, c1 TEXT, c2 TEXT, c3 TEXT, c4 TEXT
);

-- Soar High Estate (SHE)
CREATE TABLE IF NOT EXISTS staging_she (
  date TEXT, customer_name TEXT, plot_size TEXT, plot_no TEXT,
  beacon_no TEXT, payment TEXT, balance TEXT, referral TEXT,
  phone_number TEXT, address TEXT, estate_code TEXT, c1 TEXT
);

-- Success Palace Estate (SUPE)
CREATE TABLE IF NOT EXISTS staging_supe (
  date TEXT, customer_name TEXT, plot_size TEXT, plot_no TEXT,
  payment TEXT, balance TEXT, phone_number TEXT, addresss TEXT, code TEXT
);

-- ============================================================================
-- STEP 3: Create Unified Normalized View
-- ============================================================================

CREATE OR REPLACE VIEW normalized_raw_union AS
SELECT
  'CODE'::TEXT AS estate_code,
  parse_date(date) AS allocation_date,
  INITCAP(TRIM(customer_name)) AS customer_name,
  TRIM(plot_size) AS plot_size,
  parse_plot_size(plot_size) AS size_sqm,
  TRIM(plot_no) AS plot_no,
  parse_amount_advanced(payment) AS payment_amount,
  parse_amount_advanced(balance) AS balance_amount,
  normalize_phone(phone_no) AS phone,
  NULLIF(TRIM(referred_by), '') AS referred_by,
  NULLIF(TRIM(location), '') AS address
FROM staging_cod
WHERE TRIM(COALESCE(customer_name, '')) != '' AND plot_no IS NOT NULL
UNION ALL
SELECT
  COALESCE(code, 'EGPE')::TEXT,
  parse_date(date),
  INITCAP(TRIM(customer_name)),
  TRIM(plot_size),
  parse_plot_size(plot_size),
  TRIM(plot_no),
  parse_amount_advanced(payment),
  parse_amount_advanced(balance),
  normalize_phone(phone_number),
  NULLIF(TRIM(refered_by), ''),
  NULLIF(TRIM(addresss), '')
FROM staging_egpe
WHERE TRIM(COALESCE(customer_name, '')) != '' AND plot_no IS NOT NULL
UNION ALL
SELECT
  COALESCE(code, 'NEWE')::TEXT,
  parse_date(date),
  INITCAP(TRIM(customer_name)),
  TRIM(col3),
  parse_plot_size(col3),
  TRIM(plot_no),
  parse_amount_advanced(payment),
  parse_amount_advanced(balance),
  normalize_phone(phone_number),
  NULLIF(TRIM(referral), ''),
  NULLIF(TRIM(addresss), '')
FROM staging_newe
WHERE TRIM(COALESCE(customer_name, '')) != '' AND plot_no IS NOT NULL
UNION ALL
SELECT
  COALESCE(code, 'OHE')::TEXT,
  parse_date(date),
  INITCAP(TRIM(customer_name)),
  TRIM(plot_size),
  parse_plot_size(plot_size),
  TRIM(plot_no),
  parse_amount_advanced(payment),
  parse_amount_advanced(balance),
  normalize_phone(phone_number),
  NULLIF(TRIM(refered_by), ''),
  NULLIF(TRIM(col11), '')
FROM staging_ohe
WHERE TRIM(COALESCE(customer_name, '')) != '' AND plot_no IS NOT NULL
UNION ALL
SELECT
  COALESCE(estate_code, 'OPGE')::TEXT,
  parse_date(date),
  INITCAP(TRIM(customer_name)),
  TRIM(plot_size),
  parse_plot_size(plot_size),
  TRIM(plot_no),
  parse_amount_advanced(payment),
  parse_amount_advanced(balance),
  normalize_phone(phone_number),
  NULLIF(TRIM(reffered_by), ''),
  NULLIF(TRIM(address), '')
FROM staging_opge
WHERE TRIM(COALESCE(customer_name, '')) != '' AND plot_no IS NOT NULL
UNION ALL
SELECT
  COALESCE(estate_code, 'SHE')::TEXT,
  parse_date(date),
  INITCAP(TRIM(customer_name)),
  TRIM(plot_size),
  parse_plot_size(plot_size),
  TRIM(plot_no),
  parse_amount_advanced(payment),
  parse_amount_advanced(balance),
  normalize_phone(phone_number),
  NULLIF(TRIM(referral), ''),
  NULLIF(TRIM(address), '')
FROM staging_she
WHERE TRIM(COALESCE(customer_name, '')) != '' AND plot_no IS NOT NULL
UNION ALL
SELECT
  COALESCE(code, 'SUPE')::TEXT,
  parse_date(date),
  INITCAP(TRIM(customer_name)),
  TRIM(plot_size),
  parse_plot_size(plot_size),
  TRIM(plot_no),
  parse_amount_advanced(payment),
  parse_amount_advanced(balance),
  normalize_phone(phone_number),
  NULL::TEXT,
  NULLIF(TRIM(addresss), '')
FROM staging_supe
WHERE TRIM(COALESCE(customer_name, '')) != '' AND plot_no IS NOT NULL;

-- ============================================================================
-- STEP 4: Import into Final Tables
-- ============================================================================

-- NOTE: You must first import the CSVs into staging tables via Supabase Table Editor
-- Then run these INSERT statements

-- 4A) Import Customers (deduplicate by phone)
-- Uncomment and run after staging tables are populated:
/*
INSERT INTO public.customers (
  id, full_name, email, phone, address, city, state, created_at, updated_at
)
SELECT DISTINCT ON (n.phone)
  gen_random_uuid(),
  n.customer_name,
  NULL,
  n.phone,
  n.address,
  NULL,
  NULL,
  COALESCE(n.allocation_date, NOW()),
  NOW()
FROM normalized_raw_union n
WHERE n.phone IS NOT NULL
  AND n.customer_name IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM public.customers c WHERE c.phone = n.phone)
ORDER BY n.phone, n.allocation_date DESC NULLS LAST;
*/

-- 4B) Import Plots (deduplicate by estate_code + plot_number)
-- Uncomment and run after customers are imported:
/*
INSERT INTO public.plots (
  id, plot_number, estate_name, estate_code, size_sqm, price, status, created_at, updated_at
)
SELECT DISTINCT ON (n.estate_code, n.plot_no)
  gen_random_uuid(),
  n.plot_no,
  CASE n.estate_code
    WHEN 'CODE' THEN 'City of David Estate'
    WHEN 'EGPE' THEN 'Ehi Green Park Estate'
    WHEN 'NEWE' THEN 'New Era of Wealth Estate'
    WHEN 'OHE'  THEN 'Oduwa Housing Estate'
    WHEN 'OPGE' THEN 'Ose Perfection Garden Estate'
    WHEN 'SHE'  THEN 'Soar High Estate'
    WHEN 'SUPE' THEN 'Success Palace Estate'
    ELSE 'Unknown Estate'
  END,
  n.estate_code,
  n.size_sqm,
  n.payment_amount,
  'allocated',
  NOW(),
  NOW()
FROM normalized_raw_union n
WHERE n.plot_no IS NOT NULL
  AND n.plot_no !~ '^[,\s]+$'
  AND NOT EXISTS (
    SELECT 1 FROM public.plots p 
    WHERE p.estate_code = n.estate_code 
    AND p.plot_number = n.plot_no
  )
ORDER BY n.estate_code, n.plot_no, n.allocation_date DESC NULLS LAST;
*/

-- 4C) Import Allocations (link customers + plots)
-- Uncomment and run after plots are imported:
/*
INSERT INTO public.allocations (
  id, customer_id, plot_id, allocation_date,
  total_amount, amount_paid, payment_plan, next_payment_date,
  status, agent_id, created_at, updated_at
)
SELECT DISTINCT ON (c.id, p.id)
  gen_random_uuid(),
  c.id,
  p.id,
  COALESCE(n.allocation_date, NOW()::DATE),
  COALESCE(n.payment_amount + n.balance_amount, n.payment_amount, 0),
  COALESCE(n.payment_amount, 0),
  CASE WHEN n.balance_amount > 0 THEN 'installment' ELSE 'outright' END,
  CASE WHEN n.balance_amount > 0 THEN (COALESCE(n.allocation_date, CURRENT_DATE) + INTERVAL '30 days')::DATE ELSE NULL END,
  CASE 
    WHEN n.balance_amount > 0 THEN 'active'
    ELSE 'completed'
  END,
  NULL,
  NOW(),
  NOW()
FROM normalized_raw_union n
JOIN public.customers c ON c.phone = n.phone
JOIN public.plots p ON p.estate_code = n.estate_code AND p.plot_number = n.plot_no
WHERE NOT EXISTS (
  SELECT 1 FROM public.allocations a 
  WHERE a.customer_id = c.id AND a.plot_id = p.id
)
ORDER BY c.id, p.id, n.allocation_date DESC NULLS LAST;
*/

-- ============================================================================
-- STEP 5: Verification Queries
-- ============================================================================

-- Count records in staging tables
-- SELECT 'staging_cod' AS tbl, COUNT(*) FROM staging_cod
-- UNION ALL SELECT 'staging_egpe', COUNT(*) FROM staging_egpe
-- UNION ALL SELECT 'staging_newe', COUNT(*) FROM staging_newe
-- UNION ALL SELECT 'staging_ohe', COUNT(*) FROM staging_ohe
-- UNION ALL SELECT 'staging_opge', COUNT(*) FROM staging_opge
-- UNION ALL SELECT 'staging_she', COUNT(*) FROM staging_she
-- UNION ALL SELECT 'staging_supe', COUNT(*) FROM staging_supe;

-- Preview normalized data
-- SELECT * FROM normalized_raw_union LIMIT 20;

-- Check for duplicates
-- SELECT phone, COUNT(*) FROM normalized_raw_union WHERE phone IS NOT NULL GROUP BY phone HAVING COUNT(*) > 1;
-- SELECT estate_code, plot_no, COUNT(*) FROM normalized_raw_union GROUP BY estate_code, plot_no HAVING COUNT(*) > 1;

-- ============================================================================
-- CLEANUP (Run after successful import)
-- ============================================================================

-- DROP TABLE IF EXISTS staging_cod;
-- DROP TABLE IF EXISTS staging_egpe;
-- DROP TABLE IF EXISTS staging_newe;
-- DROP TABLE IF EXISTS staging_ohe;
-- DROP TABLE IF EXISTS staging_opge;
-- DROP TABLE IF EXISTS staging_she;
-- DROP TABLE IF EXISTS staging_supe;
-- DROP VIEW IF EXISTS normalized_raw_union;
-- DROP FUNCTION IF EXISTS normalize_phone(TEXT);
-- DROP FUNCTION IF EXISTS parse_date(TEXT);
-- DROP FUNCTION IF EXISTS parse_amount_advanced(TEXT);
-- DROP FUNCTION IF EXISTS parse_plot_size(TEXT);
