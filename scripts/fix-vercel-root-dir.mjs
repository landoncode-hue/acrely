#!/usr/bin/env node

/**
 * Script to fix Vercel Root Directory setting via API
 * This updates the project to deploy from repository root
 */

import { execSync } from 'child_process';
import https from 'https';

const PROJECT_ID = 'prj_XLWZyyXR0qPwK6l8VP4B86ETaVhu';
const TEAM_ID = 'team_rCC4DeP3VKAU2jXtNx24WvsV';

// Get Vercel token from CLI config
function getVercelToken() {
  try {
    // Try to get token from vercel whoami
    const result = execSync('vercel whoami -t 2>&1', { encoding: 'utf-8' });
    
    // Parse token from output or config
    const tokenMatch = result.match(/[a-zA-Z0-9_-]{24,}/);
    if (tokenMatch) {
      return tokenMatch[0];
    }
  } catch (error) {
    console.error('Could not retrieve Vercel token automatically');
  }
  
  return null;
}

// Update project settings via Vercel API
async function updateProjectSettings(token) {
  const projectSettings = {
    rootDirectory: null, // Set to null to deploy from root
    framework: null,
    buildCommand: 'pnpm --filter=@acrely/web run build',
    installCommand: 'pnpm install --frozen-lockfile',
    outputDirectory: 'apps/web/.next',
    devCommand: 'pnpm --filter=@acrely/web run dev'
  };

  return new Promise((resolve, reject) => {
    const data = JSON.stringify(projectSettings);
    
    const options = {
      hostname: 'api.vercel.com',
      port: 443,
      path: `/v9/projects/${PROJECT_ID}?teamId=${TEAM_ID}`,
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Successfully updated Vercel project settings!');
          console.log('\nNew settings:');
          console.log('  - Root Directory: . (repository root)');
          console.log('  - Build Command:', projectSettings.buildCommand);
          console.log('  - Install Command:', projectSettings.installCommand);
          console.log('  - Output Directory:', projectSettings.outputDirectory);
          resolve(JSON.parse(responseData));
        } else {
          console.error('❌ Failed to update project settings');
          console.error('Status:', res.statusCode);
          console.error('Response:', responseData);
          reject(new Error(`API returned ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request failed:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Main execution
console.log('🔧 Fixing Vercel Root Directory configuration...\n');

const token = getVercelToken();

if (!token) {
  console.error('❌ Could not retrieve Vercel authentication token');
  console.error('\nManual fix required:');
  console.error('1. Go to: https://vercel.com/landon-digitals-projects/acrely-web/settings');
  console.error('2. Under "Root Directory", clear the field or set to "."');
  console.error('3. Update Build Command to: cd apps/web && pnpm run build');
  console.error('4. Save and redeploy\n');
  process.exit(1);
}

try {
  await updateProjectSettings(token);
  console.log('\n✅ Configuration updated! You can now deploy with:');
  console.log('   vercel --prod --yes\n');
} catch (error) {
  console.error('\n❌ Update failed:', error.message);
  console.error('\nFallback: Update settings manually at:');
  console.error('https://vercel.com/landon-digitals-projects/acrely-web/settings\n');
  process.exit(1);
}
