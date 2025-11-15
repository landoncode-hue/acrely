#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables: SUPABASE_URL and SUPABASE_SERVICE_KEY required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { 
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  db: { schema: 'public' }
});

// CSV parsing helper
function parseCSV(content: string): any[] {
  const lines = content.split('\n').filter(l => l.trim());
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const rows: any[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length !== headers.length) continue;
    
    const row: any = {};
    headers.forEach((header, index) => {
      row[header.toLowerCase().replace(/\s+/g, '_')] = values[index]?.trim() || null;
    });
    rows.push(row);
  }
  
  return rows;
}

// Phone normalization
function normalizePhone(raw: string | null): string | null {
  if (!raw) return null;
  const t = raw.split('/')[0].split(',')[0].trim();
  const d = t.replace(/[^0-9]/g, '');
  if (!d) return null;
  
  if (d.startsWith('0') && d.length === 11) return '+234' + d.substring(1);
  if (d.startsWith('234') && d.length === 13) return '+' + d;
  if (d.length === 10) return '+234' + d;
  if (d.length >= 10) return '+234' + d.slice(-10);
  return '+234' + d;
}

// Date parsing
function parseDate(raw: string | null): string | null {
  if (!raw) return null;
  const t = raw.trim();
  if (!t) return null;
  
  // Try parsing common formats
  const formats = [
    /^(\d{4})-(\d{2})-(\d{2})$/,  // YYYY-MM-DD
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,  // MM/DD/YYYY or DD/MM/YYYY
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/,  // MM-DD-YYYY or DD-MM-YYYY
  ];
  
  for (const fmt of formats) {
    const match = t.match(fmt);
    if (match) {
      try {
        const date = new Date(t);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      } catch {}
    }
  }
  
  return null;
}

// Amount parsing
function parseAmount(raw: string | null): number | null {
  if (!raw) return null;
  let t = raw.trim();
  if (!t || t.includes('%')) return null;
  
  let total = 0;
  const parts = t.split('+');
  
  for (const part of parts) {
    const p = part.trim();
    if (p.toUpperCase().endsWith('K')) {
      const num = parseFloat(p.slice(0, -1).replace(/[^0-9.-]/g, ''));
      if (!isNaN(num)) total += num * 1000;
    } else {
      const num = parseFloat(p.replace(/[^0-9.-]/g, ''));
      if (!isNaN(num)) total += num;
    }
  }
  
  return total > 0 ? total : null;
}

// Plot size parsing
function parsePlotSize(raw: string | null): number | null {
  if (!raw) return null;
  const t = raw.toUpperCase().trim();
  
  if (t.includes('SQM')) {
    const num = parseFloat(t.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? null : num;
  }
  
  if (t.includes('/')) {
    const [num, denom] = t.split('/').map(s => parseFloat(s.trim()));
    if (!isNaN(num) && !isNaN(denom) && denom > 0) {
      return (num / 100) * 930; // Assume 100/100 = 930 sqm
    }
  }
  
  const num = parseFloat(t.replace(/[^0-9.]/g, ''));
  return isNaN(num) ? null : num;
}

async function main() {
  console.log('🚀 Starting legacy data import...\n');
  
  const rawDir = path.join(process.cwd(), 'supabase', 'seed', 'raw');
  
  const estateFiles = [
    { file: 'CITY OF DAVID ESTATE.csv', code: 'CODE', name: 'City of David Estate' },
    { file: 'EHI GREEN PARK ESTATE.csv', code: 'EGPE', name: 'Ehi Green Park Estate' },
    { file: 'NEW ERA ESTATE.csv', code: 'NEWE', name: 'New Era of Wealth Estate' },
    { file: 'ODUWA HOUSING ESTATE.csv', code: 'OHE', name: 'Oduwa Housing Estate' },
    { file: 'OSE PERFECTION GARDEN-1.csv', code: 'OPGE', name: 'Ose Perfection Garden Estate' },
    { file: 'SOAR HIGH ESTATE.csv', code: 'SHE', name: 'Soar High Estate' },
    { file: 'SUCCESS PALACE ESTATE.csv', code: 'SUPE', name: 'Success Palace Estate' },
  ];
  
  const allRecords: any[] = [];
  
  // Step 1: Read and normalize all CSV files
  console.log('📖 Reading CSV files...');
  for (const estate of estateFiles) {
    const filePath = path.join(rawDir, estate.file);
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping ${estate.file} (not found)`);
      continue;
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    const rows = parseCSV(content);
    
    for (const row of rows) {
      const customerName = row.customer_name;
      const plotNo = row.plot_no || row.plot_number;
      
      if (!customerName || !plotNo || customerName.trim() === '' || plotNo.trim() === '') {
        continue;
      }
      
      allRecords.push({
        estate_code: estate.code,
        estate_name: estate.name,
        allocation_date: parseDate(row.date),
        customer_name: customerName.trim(),
        plot_size_raw: row.plot_size || row.col3,
        plot_no: plotNo.trim(),
        payment_amount: parseAmount(row.payment),
        balance_amount: parseAmount(row.balance),
        phone: normalizePhone(row.phone_no || row.phone_number),
        referred_by: row.referred_by || row.refered_by || row.referral || row.reffered_by,
        address: row.location || row.address || row.addresss || row.col11,
      });
    }
    
    console.log(`✅ Loaded ${rows.length} rows from ${estate.file}`);
  }
  
  console.log(`\n📊 Total records parsed: ${allRecords.length}\n`);
  
  // Step 2: Import customers (dedupe by phone)
  console.log('👥 Importing customers...');
  const uniqueCustomers = new Map<string, any>();
  
  for (const rec of allRecords) {
    if (!rec.phone || !rec.customer_name) continue;
    if (!uniqueCustomers.has(rec.phone)) {
      uniqueCustomers.set(rec.phone, {
        full_name: rec.customer_name,
        phone: rec.phone,
        address: rec.address,
        created_at: rec.allocation_date || new Date().toISOString(),
      });
    }
  }
  
  const customersToInsert = Array.from(uniqueCustomers.values());
  console.log(`   Found ${customersToInsert.length} unique customers`);
  
  const customerMap = new Map<string, string>(); // phone -> id
  let insertedCount = 0;
  
  for (const customer of customersToInsert) {
    const { data, error } = await supabase.rpc('import_customer', {
      p_full_name: customer.full_name,
      p_phone: customer.phone,
      p_address: customer.address || null,
      p_created_at: customer.created_at,
    });
    
    if (error) {
      console.error(`   ⚠️  Error importing customer ${customer.full_name}:`, error.message);
    } else if (data) {
      customerMap.set(customer.phone, data as string);
      insertedCount++;
    }
  }
  
  console.log(`   ✅ Imported ${insertedCount} customers`);
  
  // Step 3: Import plots (dedupe by estate_code + plot_number)
  console.log('\n🏘️  Importing plots...');
  const uniquePlots = new Map<string, any>();
  
  for (const rec of allRecords) {
    if (!rec.plot_no) continue;
    const key = `${rec.estate_code}:${rec.plot_no}`;
    if (!uniquePlots.has(key)) {
      uniquePlots.set(key, {
        plot_number: rec.plot_no,
        estate_name: rec.estate_name,
        estate_code: rec.estate_code,
        size_sqm: parsePlotSize(rec.plot_size_raw),
        price: rec.payment_amount,
        status: 'allocated',
      });
    }
  }
  
  const plotsToInsert = Array.from(uniquePlots.values());
  console.log(`   Found ${plotsToInsert.length} unique plots`);
  
  const plotMap = new Map<string, string>(); // estate_code:plot_number -> id
  let plotInsertedCount = 0;
  
  for (const plot of plotsToInsert) {
    const { data, error } = await supabase.rpc('import_plot', {
      p_plot_number: plot.plot_number,
      p_estate_name: plot.estate_name,
      p_estate_code: plot.estate_code,
      p_size_sqm: plot.size_sqm || null,
      p_price: plot.price || null,
      p_status: plot.status || 'allocated',
    });
    
    if (error) {
      console.error(`   ⚠️  Error importing plot ${plot.estate_code}-${plot.plot_number}:`, error.message);
    } else if (data) {
      plotMap.set(`${plot.estate_code}:${plot.plot_number}`, data as string);
      plotInsertedCount++;
    }
  }
  
  console.log(`   ✅ Imported ${plotInsertedCount} plots`);
  
  // Step 4: Import allocations
  console.log('\n📋 Importing allocations...');
  
  // Use the maps we built during customer and plot import
  const allocationsToInsert: any[] = [];
  
  for (const rec of allRecords) {
    if (!rec.phone || !rec.plot_no) continue;
    
    const customerId = customerMap.get(rec.phone);
    const plotId = plotMap.get(`${rec.estate_code}:${rec.plot_no}`);
    
    if (!customerId || !plotId) continue;
    
    const totalAmount = (rec.payment_amount || 0) + (rec.balance_amount || 0);
    
    allocationsToInsert.push({
      customer_id: customerId,
      plot_id: plotId,
      allocation_date: rec.allocation_date || new Date().toISOString().split('T')[0],
      total_amount: totalAmount > 0 ? totalAmount : rec.payment_amount || 0,
      amount_paid: rec.payment_amount || 0,
      payment_plan: rec.balance_amount > 0 ? 'installment' : 'outright',
      status: rec.balance_amount > 0 ? 'active' : 'completed',
    });
  }
  
  console.log(`   Found ${allocationsToInsert.length} allocations to insert`);
  
  let allocationInsertedCount = 0;
  for (const allocation of allocationsToInsert) {
    const { error } = await supabase.rpc('import_allocation', {
      p_customer_id: allocation.customer_id,
      p_plot_id: allocation.plot_id,
      p_allocation_date: allocation.allocation_date || new Date().toISOString().split('T')[0],
      p_total_amount: allocation.total_amount || 0,
      p_amount_paid: allocation.amount_paid || 0,
      p_payment_plan: allocation.payment_plan || 'installment',
      p_status: allocation.status || 'active',
    });
    
    if (error) {
      console.error(`   ⚠️  Error importing allocation:`, error.message);
    } else {
      allocationInsertedCount++;
    }
  }
  
  console.log(`   ✅ Imported ${allocationInsertedCount} allocations`);
  
  console.log('\n✅ Import complete!\n');
  
  // Summary
  const { count: customerCount } = await supabase.from('customers').select('*', { count: 'exact', head: true });
  const { count: plotCount } = await supabase.from('plots').select('*', { count: 'exact', head: true });
  const { count: allocationCount } = await supabase.from('allocations').select('*', { count: 'exact', head: true });
  
  console.log('📊 Database Summary:');
  console.log(`   Customers: ${customerCount}`);
  console.log(`   Plots: ${plotCount}`);
  console.log(`   Allocations: ${allocationCount}`);
}

main().catch(console.error);
