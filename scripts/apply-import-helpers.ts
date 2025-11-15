#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = 'https://qenqilourxtfxchkawek.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlbnFpbG91cnh0ZnhjaGthd2VrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjIzNDg1NSwiZXhwIjoyMDc3ODEwODU1fQ.ey_97IO41llNoRNdETLrxSIzIiPa9JyCAoS_UMES7ss';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  const sql = fs.readFileSync(
    path.join(process.cwd(), 'supabase/migrations/20250120000001_import_helpers.sql'),
    'utf-8'
  );
  
  console.log('Applying import helper functions...');
  
  const { data, error } = await supabase.rpc('exec_sql' as any, { sql_query: sql });
  
  if (error) {
    // Try executing through the low-level postgres API
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql })
    });
    
    if (!response.ok) {
      // Manual execution of each function
      console.log('Executing functions manually...');
      
      const functions = [
        {
          name: 'import_customer',
          sql: `
CREATE OR REPLACE FUNCTION import_customer(
  p_full_name TEXT,
  p_phone TEXT,
  p_address TEXT,
  p_created_at TIMESTAMPTZ
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
`
        },
        {
          name: 'import_plot',
          sql: `
CREATE OR REPLACE FUNCTION import_plot(
  p_plot_number TEXT,
  p_estate_name TEXT,
  p_estate_code TEXT,
  p_size_sqm NUMERIC,
  p_price NUMERIC,
  p_status TEXT
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
`
        },
        {
          name: 'import_allocation',
          sql: `
CREATE OR REPLACE FUNCTION import_allocation(
  p_customer_id UUID,
  p_plot_id UUID,
  p_allocation_date DATE,
  p_total_amount NUMERIC,
  p_amount_paid NUMERIC,
  p_payment_plan TEXT,
  p_status TEXT
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
`
        }
      ];
      
      for (const func of functions) {
        console.log(`Creating ${func.name}...`);
        const { error: funcError } = await (supabase as any).rpc('query', { query: func.sql });
        if (funcError) {
          console.error(`Error creating ${func.name}:`, funcError);
        } else {
          console.log(`✅ ${func.name} created`);
        }
      }
    } else {
      console.log('✅ Functions applied successfully');
    }
  } else {
    console.log('✅ Functions applied successfully');
  }
}

main().catch(console.error);
