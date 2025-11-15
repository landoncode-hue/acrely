#!/usr/bin/env ts-node
/**
 * Excel-to-SQL Data Importer for Acrely v2
 * Imports legacy estate data from Excel/CSV files with normalization
 * 
 * Usage:
 *   pnpm tsx scripts/import-excel-data.ts --file estates.csv --estate CODE
 *   pnpm tsx scripts/import-excel-data.ts --directory ./data/estates --dry-run
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';

// ============================================================================
// Configuration
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not set');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ============================================================================
// Estate Code Mapping
// ============================================================================

const ESTATE_NAMES: Record<string, string> = {
  CODE: 'City of David Estate',
  EGPE: 'Ehi Green Park Estate',
  NEWE: 'New Era of Wealth Estate',
  OHE: 'Oduwa Housing Estate',
  OPGE: 'Ose Perfection Garden Estate',
  SHE: 'Soar High Estate',
  SUPE: 'Success Palace Estate',
};

// ============================================================================
// Normalization Functions (matching SQL functions)
// ============================================================================

/**
 * Normalize Nigerian phone number to E.164 format
 */
function normalizePhone(raw: string | null): string | null {
  if (!raw || raw.trim() === '') return null;
  
  // Keep only first segment before slash/comma
  let t = raw.split('/')[0].split(',')[0].trim();
  
  // Remove all non-numeric characters
  const digits = t.replace(/\D/g, '');
  
  if (!digits) return null;
  
  // Convert to +234 format
  if (digits.startsWith('0') && digits.length === 11) {
    return '+234' + digits.substring(1);
  } else if (digits.startsWith('234') && digits.length === 13) {
    return '+' + digits;
  } else if (digits.length === 10) {
    return '+234' + digits;
  } else if (digits.length >= 10) {
    return '+234' + digits.slice(-10);
  } else {
    return '+234' + digits;
  }
}

/**
 * Parse date from multiple formats to YYYY-MM-DD
 */
function parseDate(raw: string | null): string | null {
  if (!raw || raw.trim() === '') return null;
  
  const t = raw.trim();
  
  // Try different date formats
  const formats = [
    /^(\d{4})-(\d{2})-(\d{2})$/, // YYYY-MM-DD
    /^(\d{2})\/(\d{2})\/(\d{4})$/, // MM/DD/YYYY or DD/MM/YYYY
    /^(\d{2})-(\d{2})-(\d{4})$/, // DD-MM-YYYY
    /^(\d{2})-([A-Za-z]{3})-(\d{2})$/, // DD-Mon-YY
    /^(\d{2})-([A-Za-z]{3})-(\d{4})$/, // DD-Mon-YYYY
  ];
  
  for (const format of formats) {
    const match = t.match(format);
    if (match) {
      try {
        const date = new Date(t);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      } catch (e) {
        continue;
      }
    }
  }
  
  return null;
}

/**
 * Parse amount with commas, K suffix, plus signs
 */
function parseAmount(raw: string | null): number | null {
  if (!raw || raw.trim() === '') return null;
  
  const t = raw.trim();
  
  // If contains %, return null (percentage without base)
  if (t.includes('%')) return null;
  
  // Split by '+' and sum parts
  const parts = t.split('+');
  let total = 0;
  
  for (const part of parts) {
    const cleaned = part.trim();
    
    // Handle K suffix (thousands)
    if (cleaned.toUpperCase().endsWith('K')) {
      const num = parseFloat(cleaned.slice(0, -1).replace(/[^0-9.-]/g, ''));
      if (!isNaN(num)) {
        total += num * 1000;
      }
    }
    // Handle M suffix (millions)
    else if (cleaned.toUpperCase().endsWith('M')) {
      const num = parseFloat(cleaned.slice(0, -1).replace(/[^0-9.-]/g, ''));
      if (!isNaN(num)) {
        total += num * 1000000;
      }
    }
    // Regular number
    else {
      const num = parseFloat(cleaned.replace(/[^0-9.-]/g, ''));
      if (!isNaN(num)) {
        total += num;
      }
    }
  }
  
  return total > 0 ? total : null;
}

/**
 * Parse plot size to square meters
 */
function parsePlotSize(raw: string | null): number | null {
  if (!raw || raw.trim() === '') return null;
  
  const t = raw.trim().toUpperCase();
  
  // If already in SQM format
  if (t.includes('SQM')) {
    const num = parseFloat(t.replace(/[^0-9.]/g, ''));
    return !isNaN(num) ? num : null;
  }
  
  // If fraction format (e.g., "50/100")
  if (t.includes('/')) {
    const parts = t.split('/');
    const numerator = parseFloat(parts[0]);
    const denominator = parseFloat(parts[1]);
    
    if (!isNaN(numerator) && !isNaN(denominator) && denominator > 0) {
      // Assume 100/100 = 930 sqm standard plot
      return (numerator / denominator) * 930;
    }
  }
  
  // Fallback: try to parse as number
  const num = parseFloat(t.replace(/[^0-9.]/g, ''));
  return !isNaN(num) ? num : null;
}

/**
 * Title case for names
 */
function titleCase(raw: string | null): string | null {
  if (!raw || raw.trim() === '') return null;
  
  return raw
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ============================================================================
// CSV Parsing
// ============================================================================

interface RawRow {
  [key: string]: string;
}

interface NormalizedRow {
  estate_code: string;
  allocation_date: string | null;
  customer_name: string | null;
  plot_size: string | null;
  size_sqm: number | null;
  plot_no: string | null;
  payment_amount: number | null;
  balance_amount: number | null;
  phone: string | null;
  referred_by: string | null;
  address: string | null;
}

/**
 * Parse CSV file and normalize data
 */
function parseCSV(filePath: string, estateCode: string): NormalizedRow[] {
  console.log(`📄 Reading file: ${filePath}`);
  
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as RawRow[];
  
  console.log(`✓ Found ${records.length} rows`);
  
  // Normalize each row
  const normalized: NormalizedRow[] = [];
  
  for (const row of records) {
    const customerName = titleCase(row.customer_name || row.Customer || row.Name);
    const plotNo = (row.plot_no || row.plot_number || row.Plot)?.trim().toUpperCase();
    
    // Skip rows without customer or plot
    if (!customerName || !plotNo) continue;
    
    normalized.push({
      estate_code: estateCode,
      allocation_date: parseDate(row.date || row.Date || row.allocation_date),
      customer_name: customerName,
      plot_size: row.plot_size || row.size || row.Size,
      size_sqm: parsePlotSize(row.plot_size || row.size || row.Size),
      plot_no: plotNo,
      payment_amount: parseAmount(row.payment || row.Payment || row.amount_paid),
      balance_amount: parseAmount(row.balance || row.Balance),
      phone: normalizePhone(row.phone_no || row.phone || row.Phone || row.phone_number),
      referred_by: (row.referred_by || row.referral || row.Referral)?.trim() || null,
      address: (row.location || row.address || row.Address)?.trim() || null,
    });
  }
  
  console.log(`✓ Normalized ${normalized.length} valid rows`);
  return normalized;
}

// ============================================================================
// Database Import
// ============================================================================

interface ImportStats {
  customers_created: number;
  customers_skipped: number;
  plots_created: number;
  plots_skipped: number;
  allocations_created: number;
  allocations_skipped: number;
  errors: string[];
}

/**
 * Import normalized data into database
 */
async function importData(rows: NormalizedRow[], dryRun: boolean = false): Promise<ImportStats> {
  const stats: ImportStats = {
    customers_created: 0,
    customers_skipped: 0,
    plots_created: 0,
    plots_skipped: 0,
    allocations_created: 0,
    allocations_skipped: 0,
    errors: [],
  };
  
  console.log(`\n📊 ${dryRun ? 'DRY RUN: ' : ''}Importing ${rows.length} records...`);
  
  // Import customers (deduplicate by phone)
  const uniquePhones = new Set<string>();
  const customerMap = new Map<string, string>(); // phone -> customer_id
  
  for (const row of rows) {
    if (!row.phone) continue;
    if (uniquePhones.has(row.phone)) continue;
    
    uniquePhones.add(row.phone);
    
    if (!dryRun) {
      // Check if customer exists
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', row.phone)
        .single();
      
      if (existing) {
        customerMap.set(row.phone, existing.id);
        stats.customers_skipped++;
        continue;
      }
      
      // Insert customer
      const { data, error } = await supabase
        .from('customers')
        .insert({
          full_name: row.customer_name,
          phone: row.phone,
          address: row.address,
          created_at: row.allocation_date || new Date().toISOString(),
        })
        .select('id')
        .single();
      
      if (error) {
        stats.errors.push(`Customer insert error: ${error.message}`);
        continue;
      }
      
      if (data) {
        customerMap.set(row.phone, data.id);
        stats.customers_created++;
      }
    } else {
      stats.customers_created++;
    }
  }
  
  // Import plots (deduplicate by estate_code + plot_number)
  const uniquePlots = new Set<string>();
  const plotMap = new Map<string, string>(); // estate_code:plot_no -> plot_id
  
  for (const row of rows) {
    if (!row.plot_no) continue;
    
    const plotKey = `${row.estate_code}:${row.plot_no}`;
    if (uniquePlots.has(plotKey)) continue;
    
    uniquePlots.add(plotKey);
    
    if (!dryRun) {
      // Check if plot exists
      const { data: existing } = await supabase
        .from('plots')
        .select('id')
        .eq('estate_code', row.estate_code)
        .eq('plot_number', row.plot_no)
        .single();
      
      if (existing) {
        plotMap.set(plotKey, existing.id);
        stats.plots_skipped++;
        continue;
      }
      
      // Insert plot
      const { data, error } = await supabase
        .from('plots')
        .insert({
          plot_number: row.plot_no,
          estate_name: ESTATE_NAMES[row.estate_code] || 'Unknown Estate',
          estate_code: row.estate_code,
          size_sqm: row.size_sqm || 465, // Default to half plot
          price: (row.payment_amount || 0) + (row.balance_amount || 0),
          status: 'allocated',
        })
        .select('id')
        .single();
      
      if (error) {
        stats.errors.push(`Plot insert error: ${error.message}`);
        continue;
      }
      
      if (data) {
        plotMap.set(plotKey, data.id);
        stats.plots_created++;
      }
    } else {
      stats.plots_created++;
    }
  }
  
  // Import allocations
  for (const row of rows) {
    if (!row.phone || !row.plot_no) continue;
    
    const plotKey = `${row.estate_code}:${row.plot_no}`;
    
    if (!dryRun) {
      const customerId = customerMap.get(row.phone);
      const plotId = plotMap.get(plotKey);
      
      if (!customerId || !plotId) {
        stats.errors.push(`Missing customer or plot for ${row.customer_name} - ${row.plot_no}`);
        continue;
      }
      
      // Check if allocation exists
      const { data: existing } = await supabase
        .from('allocations')
        .select('id')
        .eq('customer_id', customerId)
        .eq('plot_id', plotId)
        .single();
      
      if (existing) {
        stats.allocations_skipped++;
        continue;
      }
      
      const totalAmount = (row.payment_amount || 0) + (row.balance_amount || 0);
      
      // Insert allocation
      const { error } = await supabase
        .from('allocations')
        .insert({
          customer_id: customerId,
          plot_id: plotId,
          allocation_date: row.allocation_date || new Date().toISOString().split('T')[0],
          total_amount: totalAmount,
          amount_paid: row.payment_amount || 0,
          payment_plan: (row.balance_amount || 0) > 0 ? 'installment' : 'outright',
          status: (row.balance_amount || 0) > 0 ? 'active' : 'completed',
        });
      
      if (error) {
        stats.errors.push(`Allocation insert error: ${error.message}`);
        continue;
      }
      
      stats.allocations_created++;
    } else {
      stats.allocations_created++;
    }
  }
  
  return stats;
}

// ============================================================================
// Main Function
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  
  let file: string | null = null;
  let directory: string | null = null;
  let estateCode: string | null = null;
  let dryRun = false;
  
  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--file' && i + 1 < args.length) {
      file = args[++i];
    } else if (args[i] === '--directory' && i + 1 < args.length) {
      directory = args[++i];
    } else if (args[i] === '--estate' && i + 1 < args.length) {
      estateCode = args[++i];
    } else if (args[i] === '--dry-run') {
      dryRun = true;
    }
  }
  
  console.log('🏗️  Acrely Excel-to-SQL Data Importer');
  console.log('=====================================\n');
  
  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No data will be written\n');
  }
  
  // Process single file
  if (file && estateCode) {
    if (!fs.existsSync(file)) {
      console.error(`❌ File not found: ${file}`);
      process.exit(1);
    }
    
    if (!ESTATE_NAMES[estateCode]) {
      console.error(`❌ Invalid estate code: ${estateCode}`);
      console.error(`Valid codes: ${Object.keys(ESTATE_NAMES).join(', ')}`);
      process.exit(1);
    }
    
    const rows = parseCSV(file, estateCode);
    const stats = await importData(rows, dryRun);
    
    console.log('\n✅ Import Complete!');
    console.log('==================');
    console.log(`Customers created: ${stats.customers_created}`);
    console.log(`Customers skipped: ${stats.customers_skipped}`);
    console.log(`Plots created: ${stats.plots_created}`);
    console.log(`Plots skipped: ${stats.plots_skipped}`);
    console.log(`Allocations created: ${stats.allocations_created}`);
    console.log(`Allocations skipped: ${stats.allocations_skipped}`);
    
    if (stats.errors.length > 0) {
      console.log(`\n⚠️  Errors: ${stats.errors.length}`);
      stats.errors.forEach(err => console.log(`   - ${err}`));
    }
  }
  // Process directory
  else if (directory) {
    if (!fs.existsSync(directory)) {
      console.error(`❌ Directory not found: ${directory}`);
      process.exit(1);
    }
    
    const files = fs.readdirSync(directory).filter(f => f.endsWith('.csv'));
    console.log(`📁 Found ${files.length} CSV files\n`);
    
    for (const fileName of files) {
      // Try to detect estate code from filename
      let detectedCode: string | null = null;
      for (const code of Object.keys(ESTATE_NAMES)) {
        if (fileName.toUpperCase().includes(code)) {
          detectedCode = code;
          break;
        }
      }
      
      if (!detectedCode) {
        console.log(`⏩ Skipping ${fileName} (could not detect estate code)`);
        continue;
      }
      
      console.log(`\n📂 Processing ${fileName} (${detectedCode})...`);
      const filePath = path.join(directory, fileName);
      const rows = parseCSV(filePath, detectedCode);
      const stats = await importData(rows, dryRun);
      
      console.log(`   Customers: +${stats.customers_created}`);
      console.log(`   Plots: +${stats.plots_created}`);
      console.log(`   Allocations: +${stats.allocations_created}`);
    }
    
    console.log('\n✅ All files processed!');
  }
  else {
    console.log('Usage:');
    console.log('  Single file: pnpm tsx scripts/import-excel-data.ts --file estates.csv --estate CODE');
    console.log('  Directory:   pnpm tsx scripts/import-excel-data.ts --directory ./data/estates');
    console.log('  Dry run:     Add --dry-run to preview without writing');
    console.log('');
    console.log('Valid estate codes:');
    Object.entries(ESTATE_NAMES).forEach(([code, name]) => {
      console.log(`  ${code.padEnd(4)} - ${name}`);
    });
    process.exit(1);
  }
}

main().catch(console.error);
