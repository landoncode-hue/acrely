#!/usr/bin/env tsx

/**
 * Master E2E Test Orchestrator
 * Runs all E2E tests in sequence and generates comprehensive report
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface TestResult {
  quest: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  duration: number;
  errors: string[];
  passed: number;
  failed: number;
  total: number;
}

interface QuestDefinition {
  id: string;
  name: string;
  testFile: string;
  required: boolean;
}

const QUESTS: QuestDefinition[] = [
  {
    id: 'auth',
    name: 'Authentication Flow',
    testFile: 'auth.spec.ts',
    required: true
  },
  {
    id: 'dashboard',
    name: 'Dashboard & Navigation',
    testFile: 'critical-path.spec.ts',
    required: true
  },
  {
    id: 'customers',
    name: 'Customer Management',
    testFile: 'customers.spec.ts',
    required: true
  },
  {
    id: 'billing',
    name: 'Billing System',
    testFile: 'billing-dashboard.spec.ts',
    required: true
  },
  {
    id: 'payments',
    name: 'Payment Processing',
    testFile: 'payments.spec.ts',
    required: true
  },
  {
    id: 'receipts',
    name: 'Receipt System',
    testFile: 'receipts.spec.ts',
    required: true
  },
  {
    id: 'audit_system',
    name: 'Audit Logging',
    testFile: 'audit-dashboard.spec.ts',
    required: true
  },
  {
    id: 'field_reports',
    name: 'Field Reports',
    testFile: 'field-reports.spec.ts',
    required: true
  },
  {
    id: 'reports',
    name: 'Reports & Analytics',
    testFile: 'reports.spec.ts',
    required: true
  },
  {
    id: 'roles',
    name: 'Role-Based Access Control',
    testFile: 'role-access-control.spec.ts',
    required: true
  },
  {
    id: 'api_validation',
    name: 'API Endpoint Validation',
    testFile: 'api-validation.spec.ts',
    required: true
  },
  {
    id: 'supabase_connectivity',
    name: 'Supabase Connectivity & Data Integrity',
    testFile: 'supabase-connectivity.spec.ts',
    required: true
  },
  {
    id: 'mobile_sync',
    name: 'Mobile-Web Synchronization',
    testFile: 'mobile-web-sync.spec.ts',
    required: false
  },
  {
    id: 'regression_suite',
    name: 'Regression Testing',
    testFile: 'regression-suite.spec.ts',
    required: true
  },
  {
    id: 'production_readiness',
    name: 'Production Readiness',
    testFile: 'production-readiness.spec.ts',
    required: true
  }
];

class E2EMasterOrchestrator {
  private results: TestResult[] = [];
  private startTime: number = 0;
  private totalDuration: number = 0;

  async runQuest(quest: QuestDefinition): Promise<TestResult> {
    console.log(`\n🎯 Running Quest: ${quest.name}`);
    console.log(`📄 Test File: ${quest.testFile}`);
    
    const questStart = Date.now();
    
    try {
      const testPath = join('tests', 'e2e', quest.testFile);
      
      // Check if test file exists
      if (!existsSync(testPath)) {
        console.log(`⏭️  SKIP: Test file not found`);
        return {
          quest: quest.name,
          status: 'SKIP',
          duration: 0,
          errors: ['Test file not found'],
          passed: 0,
          failed: 0,
          total: 0
        };
      }

      // Run the test
      const output = execSync(`pnpm test:e2e ${testPath} --reporter=json`, {
        encoding: 'utf-8',
        stdio: 'pipe'
      });

      const duration = Date.now() - questStart;
      
      // Parse results
      let passed = 0;
      let failed = 0;
      let total = 0;

      // Try to extract test counts from output
      const passedMatch = output.match(/(\d+) passed/);
      const failedMatch = output.match(/(\d+) failed/);
      
      if (passedMatch) passed = parseInt(passedMatch[1]);
      if (failedMatch) failed = parseInt(failedMatch[1]);
      total = passed + failed;

      console.log(`✅ PASS: ${passed}/${total} tests passed (${(duration/1000).toFixed(2)}s)`);

      return {
        quest: quest.name,
        status: 'PASS',
        duration,
        errors: [],
        passed,
        failed,
        total
      };

    } catch (error: any) {
      const duration = Date.now() - questStart;
      const errorMessage = error.message || 'Unknown error';
      
      console.log(`❌ FAIL: Quest failed (${(duration/1000).toFixed(2)}s)`);
      console.log(`   Error: ${errorMessage.split('\n')[0]}`);

      // Try to extract test counts even from failed runs
      let passed = 0;
      let failed = 0;
      let total = 0;

      const output = error.stdout || error.stderr || '';
      const passedMatch = output.match(/(\d+) passed/);
      const failedMatch = output.match(/(\d+) failed/);
      
      if (passedMatch) passed = parseInt(passedMatch[1]);
      if (failedMatch) failed = parseInt(failedMatch[1]);
      total = passed + failed;

      return {
        quest: quest.name,
        status: 'FAIL',
        duration,
        errors: [errorMessage.split('\n')[0]],
        passed,
        failed,
        total
      };
    }
  }

  async runAllQuests(): Promise<void> {
    console.log('🚀 ACRELY V2 - E2E MASTER VALIDATION SYSTEM');
    console.log('=' .repeat(60));
    
    this.startTime = Date.now();

    for (const quest of QUESTS) {
      const result = await this.runQuest(quest);
      this.results.push(result);

      // Stop if required quest fails
      if (quest.required && result.status === 'FAIL') {
        console.log(`\n⚠️  Required quest failed. Stopping validation.`);
        break;
      }
    }

    this.totalDuration = Date.now() - this.startTime;
    this.generateReport();
  }

  generateReport(): void {
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 E2E VALIDATION REPORT');
    console.log('='.repeat(60));

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    const total = this.results.length;

    console.log(`\n📈 SUMMARY:`);
    console.log(`   Total Quests: ${total}`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ⏱️  Total Duration: ${(this.totalDuration/1000).toFixed(2)}s`);

    console.log(`\n📋 QUEST RESULTS:`);
    this.results.forEach((result, index) => {
      const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⏭️';
      const duration = (result.duration / 1000).toFixed(2);
      const testInfo = result.total > 0 ? ` (${result.passed}/${result.total} tests)` : '';
      
      console.log(`   ${index + 1}. ${icon} ${result.quest}${testInfo} - ${duration}s`);
      
      if (result.errors.length > 0) {
        result.errors.forEach(error => {
          console.log(`      ⚠️  ${error}`);
        });
      }
    });

    // Success criteria check
    const allRequiredPassed = QUESTS
      .filter(q => q.required)
      .every(q => {
        const result = this.results.find(r => r.quest === q.name);
        return result?.status === 'PASS';
      });

    console.log(`\n🎯 SUCCESS CRITERIA:`);
    console.log(`   All Required Quests Pass: ${allRequiredPassed ? '✅ YES' : '❌ NO'}`);
    console.log(`   No Critical Errors: ${failed === 0 ? '✅ YES' : '❌ NO'}`);

    const overallStatus = allRequiredPassed && failed === 0 ? 'PASS' : 'FAIL';
    
    console.log(`\n🏆 OVERALL STATUS: ${overallStatus === 'PASS' ? '✅ PASS' : '❌ FAIL'}`);
    console.log('='.repeat(60));

    // Save JSON report
    this.saveJSONReport(overallStatus);

    // Exit with appropriate code
    process.exit(overallStatus === 'PASS' ? 0 : 1);
  }

  saveJSONReport(overallStatus: string): void {
    const report = {
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      duration: this.totalDuration,
      overallStatus,
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.status === 'PASS').length,
        failed: this.results.filter(r => r.status === 'FAIL').length,
        skipped: this.results.filter(r => r.status === 'SKIP').length
      },
      results: this.results,
      environment: {
        node: process.version,
        platform: process.platform,
        cwd: process.cwd()
      }
    };

    const reportPath = 'test-results/e2e-master-report.json';
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Report saved to: ${reportPath}`);
  }
}

// Run the orchestrator
const orchestrator = new E2EMasterOrchestrator();
orchestrator.runAllQuests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
