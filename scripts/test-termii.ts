#!/usr/bin/env node
/**
 * Termii API Test Script
 * Tests connectivity to Termii SMS API
 * 
 * Usage: 
 * 1. Set TERMII_API_KEY in .env.local
 * 2. Run: pnpm tsx scripts/test-termii.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const TERMII_API_KEY = process.env.TERMII_API_KEY || '';
const TERMII_BASE_URL = process.env.TERMII_BASE_URL || 'https://v3.api.termii.com';

interface TermiiSMSPayload {
  api_key: string;
  to: string;
  from: string;
  sms: string;
  type: string;
  channel: string;
}

async function testTermiiConnection(): Promise<void> {
  console.log('\n🔍 Testing Termii API Connection...\n');

  if (!TERMII_API_KEY || TERMII_API_KEY === 'your-termii-api-key') {
    console.error('❌ Error: TERMII_API_KEY not set in .env.local');
    console.log('Please update .env.local with your actual Termii API key');
    process.exit(1);
  }

  try {
    // Test balance check first
    console.log('📊 Checking account balance...');
    const balanceResponse = await fetch(
      `${TERMII_BASE_URL}/api/get-balance?api_key=${TERMII_API_KEY}`
    );

    if (!balanceResponse.ok) {
      throw new Error(`Balance check failed: ${balanceResponse.status} ${balanceResponse.statusText}`);
    }

    const balanceData = await balanceResponse.json();
    console.log('✅ Balance Check Success:', balanceData);

    console.log('\n✨ Termii API is configured correctly!');
    console.log('📱 Ready to send SMS messages');
    
  } catch (error) {
    console.error('❌ Termii API Test Failed:', error);
    process.exit(1);
  }
}

// Run the test
testTermiiConnection();
