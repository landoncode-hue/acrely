#!/usr/bin/env node
/**
 * Environment Configuration Verification Script
 * Validates that all required environment variables are properly configured
 * 
 * Usage: 
 * pnpm run verify:env
 * or
 * node scripts/verify-env.js
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = path.join(__dirname, '../.env.local');
dotenv.config({ path: envPath });

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Required environment variables grouped by category
const requiredEnvVars = {
  'Supabase Configuration': [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_ANON_KEY',
    'SUPABASE_PROJECT_REF',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ],
  'Termii SMS Configuration': [
    'TERMII_API_KEY',
    'TERMII_SENDER_ID',
    'TERMII_API_URL',
  ],
  'Application Configuration': [
    'SITE_URL',
    'ENVIRONMENT',
    'APP_NAME',
  ],
  'Company Information': [
    'COMPANY_NAME',
    'COMPANY_EMAIL',
    'COMPANY_PHONE',
    'COMPANY_ADDRESS',
  ],
  'Security': [
    'JWT_SECRET',
    'SESSION_TIMEOUT_HOURS',
  ],
  'Storage Configuration': [
    'RECEIPT_BUCKET',
    'DOCUMENTS_BUCKET',
  ],
};

// Optional environment variables
const optionalEnvVars = {
  'Deployment Configuration': [
    'FTP_SERVER',
    'FTP_USERNAME',
    'FTP_PASSWORD',
    'FTP_PATH',
  ],
  'Email Configuration': [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASSWORD',
    'FROM_EMAIL',
  ],
  'Monitoring': [
    'SENTRY_DSN',
  ],
};

// Validation functions
const validations = {
  SUPABASE_URL: (value: string) => {
    if (!value.startsWith('https://')) {
      return 'Must start with https://';
    }
    if (!value.includes('supabase.co')) {
      return 'Must be a valid Supabase URL';
    }
    return true;
  },
  
  SUPABASE_SERVICE_ROLE_KEY: (value: string) => {
    if (!value.startsWith('eyJ')) {
      return 'Invalid JWT token format';
    }
    if (value.length < 100) {
      return 'Service role key appears too short';
    }
    return true;
  },
  
  SUPABASE_ANON_KEY: (value: string) => {
    if (!value.startsWith('eyJ')) {
      return 'Invalid JWT token format';
    }
    if (value.length < 100) {
      return 'Anon key appears too short';
    }
    return true;
  },
  
  TERMII_API_KEY: (value: string) => {
    if (value.length < 20) {
      return 'Termii API key appears too short';
    }
    return true;
  },
  
  TERMII_API_URL: (value: string) => {
    if (!value.startsWith('https://')) {
      return 'Must start with https://';
    }
    return true;
  },
  
  SITE_URL: (value: string) => {
    if (!value.startsWith('http://') && !value.startsWith('https://')) {
      return 'Must start with http:// or https://';
    }
    return true;
  },
  
  COMPANY_EMAIL: (value: string) => {
    if (!value.includes('@')) {
      return 'Must be a valid email address';
    }
    return true;
  },
  
  JWT_SECRET: (value: string) => {
    if (value.length < 32) {
      return 'JWT secret should be at least 32 characters for security';
    }
    return true;
  },
};

interface ValidationResult {
  category: string;
  variable: string;
  status: 'pass' | 'fail' | 'warning' | 'optional';
  value?: string;
  message?: string;
}

const results: ValidationResult[] = [];

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvVar(category: string, varName: string, required: boolean): ValidationResult {
  const value = process.env[varName];
  
  if (!value || value === '' || value.startsWith('your-')) {
    return {
      category,
      variable: varName,
      status: required ? 'fail' : 'optional',
      message: required ? 'Not configured' : 'Optional - not configured',
    };
  }
  
  // Run specific validation if exists
  const validator = validations[varName as keyof typeof validations];
  if (validator) {
    const validationResult = validator(value);
    if (validationResult !== true) {
      return {
        category,
        variable: varName,
        status: 'warning',
        value: value.substring(0, 20) + '...',
        message: validationResult,
      };
    }
  }
  
  return {
    category,
    variable: varName,
    status: 'pass',
    value: value.substring(0, 20) + '...',
  };
}

function verifyEnvironment() {
  log('\n╔════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║   Acrely Environment Configuration Verification                ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════════╝\n', 'cyan');
  
  // Check if .env.local exists
  if (!fs.existsSync(envPath)) {
    log('❌ .env.local file not found!', 'red');
    log(`Expected location: ${envPath}`, 'yellow');
    log('Please copy .env.example to .env.local and configure it.\n', 'yellow');
    process.exit(1);
  }
  
  log(`✅ Found .env.local at: ${envPath}\n`, 'green');
  
  // Check required variables
  log('🔍 Checking Required Environment Variables:\n', 'blue');
  
  for (const [category, vars] of Object.entries(requiredEnvVars)) {
    log(`  ${category}:`, 'cyan');
    for (const varName of vars) {
      const result = checkEnvVar(category, varName, true);
      results.push(result);
      
      switch (result.status) {
        case 'pass':
          log(`    ✅ ${varName}: ${result.value}`, 'green');
          break;
        case 'fail':
          log(`    ❌ ${varName}: ${result.message}`, 'red');
          break;
        case 'warning':
          log(`    ⚠️  ${varName}: ${result.message}`, 'yellow');
          break;
      }
    }
    log('');
  }
  
  // Check optional variables
  log('🔍 Checking Optional Environment Variables:\n', 'blue');
  
  for (const [category, vars] of Object.entries(optionalEnvVars)) {
    log(`  ${category}:`, 'cyan');
    for (const varName of vars) {
      const result = checkEnvVar(category, varName, false);
      results.push(result);
      
      switch (result.status) {
        case 'pass':
          log(`    ✅ ${varName}: ${result.value}`, 'green');
          break;
        case 'optional':
          log(`    ➖ ${varName}: ${result.message}`, 'yellow');
          break;
        case 'warning':
          log(`    ⚠️  ${varName}: ${result.message}`, 'yellow');
          break;
      }
    }
    log('');
  }
  
  // Summary
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  const optional = results.filter(r => r.status === 'optional').length;
  
  log('═══════════════════════════════════════════════════════════════', 'cyan');
  log('Summary:', 'cyan');
  log(`  ✅ Passed: ${passed}`, 'green');
  log(`  ❌ Failed: ${failed}`, 'red');
  log(`  ⚠️  Warnings: ${warnings}`, 'yellow');
  log(`  ➖ Optional (not configured): ${optional}`, 'yellow');
  log('═══════════════════════════════════════════════════════════════\n', 'cyan');
  
  if (failed > 0) {
    log('❌ Environment configuration is incomplete!', 'red');
    log('Please configure the missing required variables in .env.local\n', 'red');
    process.exit(1);
  }
  
  if (warnings > 0) {
    log('⚠️  Environment configuration has warnings!', 'yellow');
    log('Please review the warnings above and fix if necessary.\n', 'yellow');
  }
  
  if (failed === 0 && warnings === 0) {
    log('✅ Environment configuration is valid!', 'green');
    log('You can now run the application with: pnpm dev\n', 'green');
  }
  
  return failed === 0;
}

// Additional checks
function performAdvancedChecks() {
  log('🔍 Performing Advanced Checks:\n', 'blue');
  
  // Check if NEXT_PUBLIC vars match their non-public counterparts
  const publicUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const privateUrl = process.env.SUPABASE_URL;
  
  if (publicUrl !== privateUrl) {
    log('  ⚠️  NEXT_PUBLIC_SUPABASE_URL does not match SUPABASE_URL', 'yellow');
  } else {
    log('  ✅ Supabase URLs are consistent', 'green');
  }
  
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const privateKey = process.env.SUPABASE_ANON_KEY;
  
  if (publicKey !== privateKey) {
    log('  ⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY does not match SUPABASE_ANON_KEY', 'yellow');
  } else {
    log('  ✅ Supabase anon keys are consistent', 'green');
  }
  
  // Check environment mode
  const env = process.env.ENVIRONMENT;
  if (env === 'development') {
    log('  ℹ️  Running in development mode', 'cyan');
    
    const siteUrl = process.env.SITE_URL;
    if (siteUrl && !siteUrl.includes('localhost')) {
      log('  ⚠️  SITE_URL should be localhost for development', 'yellow');
    }
  } else if (env === 'production') {
    log('  ℹ️  Running in production mode', 'cyan');
    
    const siteUrl = process.env.SITE_URL;
    if (siteUrl && siteUrl.includes('localhost')) {
      log('  ⚠️  SITE_URL should not be localhost in production', 'yellow');
    }
  }
  
  log('');
}

// Run verification
try {
  const isValid = verifyEnvironment();
  performAdvancedChecks();
  
  process.exit(isValid ? 0 : 1);
} catch (error) {
  log(`\n❌ Error during verification: ${error}`, 'red');
  process.exit(1);
}
