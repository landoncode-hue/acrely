#!/usr/bin/env node
/**
 * Runtime Environment Verification Script
 * Verifies all required dependencies for Acrely are installed
 * 
 * Usage: pnpm tsx scripts/verify-runtime.ts
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface RuntimeCheck {
  name: string;
  command: string;
  required: string;
  optional?: boolean;
}

const checks: RuntimeCheck[] = [
  { name: 'Node.js', command: 'node -v', required: 'v20.x or v24.x' },
  { name: 'npm', command: 'npm -v', required: '>=10.0.0' },
  { name: 'pnpm', command: 'pnpm -v', required: '>=9.0.0' },
  { name: 'TypeScript', command: 'tsc --version', required: '>=5.0.0' },
  { name: 'ESLint', command: 'eslint --version', required: '>=8.0.0' },
  { name: 'Prettier', command: 'prettier --version', required: '>=3.0.0' },
  { name: 'Git', command: 'git --version', required: 'any' },
  { name: 'GitHub CLI', command: 'gh --version', required: 'any', optional: true },
  { name: 'Supabase CLI', command: 'supabase --version', required: '>=2.50.0' },
  { name: 'Expo CLI', command: 'expo --version', required: 'any', optional: true },
  { name: 'Docker', command: 'docker --version', required: 'any', optional: true },
];

const envFiles = ['.env.local', '.env.production', '.env.example'];

function execCommand(command: string): string {
  try {
    return execSync(command, { encoding: 'utf-8', stdio: 'pipe' }).trim();
  } catch (error) {
    return '';
  }
}

function checkRuntime(): void {
  console.log('\n🚀 Acrely Runtime Environment Verification\n');
  console.log('='.repeat(60));

  let allPassed = true;
  let warnings = 0;

  // Check runtime dependencies
  console.log('\n📦 Checking Runtime Dependencies:\n');
  
  for (const check of checks) {
    const result = execCommand(check.command);
    const status = result ? '✅' : (check.optional ? '⚠️ ' : '❌');
    
    if (!result && !check.optional) {
      allPassed = false;
    } else if (!result && check.optional) {
      warnings++;
    }

    console.log(`${status} ${check.name.padEnd(20)} ${result || 'Not installed'}`);
    if (result && check.required !== 'any') {
      console.log(`   Required: ${check.required}`);
    }
  }

  // Check environment files
  console.log('\n📝 Checking Environment Files:\n');
  
  for (const envFile of envFiles) {
    const filePath = path.join(process.cwd(), envFile);
    const exists = fs.existsSync(filePath);
    const status = exists ? '✅' : (envFile === '.env.example' ? '✅' : '⚠️ ');
    
    if (!exists && envFile !== '.env.example') {
      warnings++;
    }

    console.log(`${status} ${envFile.padEnd(20)} ${exists ? 'Found' : 'Missing'}`);
  }

  // Check project dependencies
  console.log('\n📚 Checking Project Dependencies:\n');
  
  const nodeModulesExists = fs.existsSync(path.join(process.cwd(), 'node_modules'));
  console.log(`${nodeModulesExists ? '✅' : '❌'} node_modules ${nodeModulesExists ? 'Installed' : 'Missing - run pnpm install'}`);
  
  if (!nodeModulesExists) {
    allPassed = false;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  
  if (allPassed && warnings === 0) {
    console.log('\n✨ All checks passed! Environment is ready for development.\n');
  } else if (allPassed && warnings > 0) {
    console.log(`\n⚠️  Environment ready with ${warnings} optional warning(s).\n`);
  } else {
    console.log('\n❌ Some required dependencies are missing. Please install them.\n');
    process.exit(1);
  }

  // Next steps
  console.log('📋 Next Steps:');
  console.log('   1. Update .env.local with your Supabase credentials');
  console.log('   2. Update .env.local with your Termii API key');
  console.log('   3. Run: pnpm tsx scripts/test-termii.ts');
  console.log('   4. Run: pnpm dev (to start development server)');
  console.log('');
}

checkRuntime();
