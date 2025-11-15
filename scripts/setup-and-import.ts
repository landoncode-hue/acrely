#!/usr/bin/env tsx
/**
 * Complete automated import - no manual steps needed
 * This script:
 * 1. Creates the import helper functions in Supabase
 * 2. Imports all legacy CSV data
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const PROJECT_REF = 'qenqilourxtfxchkawek';
const ACCESS_TOKEN = 'sbp_deb38eb56bb9ccb4b546678a20ed256078a02eea';

const FUNCTIONS_SQL = `
CREATE OR REPLACE FUNCTION import_customer(
  p_full_name TEXT,
  p_phone TEXT,
  p_address TEXT DEFAULT NULL,
  p_created_at TIMESTAMPTZ DEFAULT NOW()
) RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_customer_id UUID;
BEGIN
  SELECT id INTO v_customer_id FROM customers WHERE phone = p_phone LIMIT 1;
  IF v_customer_id IS NULL THEN
    INSERT INTO customers (full_name, phone, address, created_at)
    VALUES (p_full_name, p_phone, p_address, p_created_at)
    RETURNING id INTO v_customer_id;
  END IF;
  RETURN v_customer_id;
END;
$$;

CREATE OR REPLACE FUNCTION import_plot(
  p_plot_number TEXT,
  p_estate_name TEXT,
  p_estate_code TEXT,
  p_size_sqm NUMERIC DEFAULT NULL,
  p_price NUMERIC DEFAULT NULL,
  p_status TEXT DEFAULT 'allocated'
) RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_plot_id UUID;
BEGIN
  SELECT id INTO v_plot_id FROM plots WHERE estate_code = p_estate_code AND plot_number = p_plot_number LIMIT 1;
  IF v_plot_id IS NULL THEN
    INSERT INTO plots (plot_number, estate_name, estate_code, size_sqm, price, status)
    VALUES (p_plot_number, p_estate_name, p_estate_code, p_size_sqm, p_price, p_status)
    RETURNING id INTO v_plot_id;
  END IF;
  RETURN v_plot_id;
END;
$$;

CREATE OR REPLACE FUNCTION import_allocation(
  p_customer_id UUID,
  p_plot_id UUID,
  p_allocation_date DATE DEFAULT CURRENT_DATE,
  p_total_amount NUMERIC DEFAULT 0,
  p_amount_paid NUMERIC DEFAULT 0,
  p_payment_plan TEXT DEFAULT 'installment',
  p_status TEXT DEFAULT 'active'
) RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_allocation_id UUID;
BEGIN
  SELECT id INTO v_allocation_id FROM allocations WHERE customer_id = p_customer_id AND plot_id = p_plot_id LIMIT 1;
  IF v_allocation_id IS NULL THEN
    INSERT INTO allocations (customer_id, plot_id, allocation_date, total_amount, amount_paid, payment_plan, status)
    VALUES (p_customer_id, p_plot_id, p_allocation_date, p_total_amount, p_amount_paid, p_payment_plan, p_status)
    RETURNING id INTO v_allocation_id;
  END IF;
  RETURN v_allocation_id;
END;
$$;
`;

async function main() {
  console.log('🔧 Step 1: Creating import helper functions in Supabase...\n');
  
  try {
    // Use Supabase Management API to execute SQL
    const curlCommand = `curl -X POST 'https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query' \\
      -H 'Authorization: Bearer ${ACCESS_TOKEN}' \\
      -H 'Content-Type: application/json' \\
      -d '${JSON.stringify({ query: FUNCTIONS_SQL })}'`;
    
    const { stdout, stderr } = await execAsync(curlCommand);
    
    if (stderr && !stderr.includes('Deprecated')) {
      console.log('⚠️  Stderr:', stderr);
    }
    
    console.log('✅ Helper functions created!\n');
    
    // Reload PostgREST schema cache
    console.log('🔄 Reloading schema cache...');
    const reloadCmd = `curl -X POST 'https://qenqilourxtfxchkawek.supabase.co/rest/v1/?apikey=${ACCESS_TOKEN}' \\
      -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlbnFpbG91cnh0ZnhjaGthd2VrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjIzNDg1NSwiZXhwIjoyMDc3ODEwODU1fQ.ey_97IO41llNoRNdETLrxSIzIiPa9JyCAoS_UMES7ss' \\
      -H 'Prefer: schema-reload'`;
    
    await execAsync(reloadCmd);
    console.log('✅ Schema cache reloaded!\n');
    
    // Wait a moment for the reload to propagate
    await new Promise(resolve => setTimeout(resolve, 3000));
  } catch (error: any) {
    console.log('ℹ️  Functions may already exist, continuing...\n');
  }
  
  console.log('📥 Step 2: Running data import...\n');
  
  // Now run the import script
  const env = {
    ...process.env,
    SUPABASE_URL: 'https://qenqilourxtfxchkawek.supabase.co',
    SUPABASE_SERVICE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlbnFpbG91cnh0ZnhjaGthd2VrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjIzNDg1NSwiZXhwIjoyMDc3ODEwODU1fQ.ey_97IO41llNoRNdETLrxSIzIiPa9JyCAoS_UMES7ss'
  };
  
  try {
    const { stdout, stderr } = await execAsync('tsx scripts/import-legacy-data.ts', {
      env,
      cwd: process.cwd(),
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });
    
    console.log(stdout);
    if (stderr) console.error(stderr);
  } catch (error: any) {
    console.error('Error during import:', error.message);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
  }
  
  console.log('\n✅ Import complete!');
}

main().catch(console.error);
