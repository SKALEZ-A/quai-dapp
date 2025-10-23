/**
 * Comprehensive Diagnostic Runner
 * Runs all diagnostic scripts and generates a complete report
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 QNS Comprehensive Diagnostics\n');
console.log('This will run all diagnostic scripts and generate a complete report.\n');

const results = {
  timestamp: new Date().toISOString(),
  scripts: {},
  overallStatus: 'unknown',
  criticalIssues: [],
  warnings: [],
  recommendations: []
};

// Script configurations
const scripts = [
  {
    name: 'Contract Validation',
    script: 'validate-deployment.js',
    description: 'Validates contract deployments and accessibility',
    resultFile: 'validation-results.json'
  },
  {
    name: 'Permission Check',
    script: 'check-and-fix-permissions.js',
    description: 'Checks contract permissions and roles',
    resultFile: 'permission-check-results.json',
    interactive: true
  },
  {
    name: 'Frontend Config Verification',
    script: 'verify-frontend-config.js',
    description: 'Verifies frontend configuration matches deployment',
    resultFile: 'frontend-config-verification.json'
  }
];

async function runScript(scriptConfig) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Running: ${scriptConfig.name}`);
  console.log(`Description: ${scriptConfig.description}`);
  console.log('='.repeat(60));
  
  const scriptResult = {
    name: scriptConfig.name,
    script: scriptConfig.script,
    success: false,
    output: '',
    error: null
  };

  try {
    if (scriptConfig.interactive) {
      console.log('\n⚠️  This script is interactive. Skipping auto-run.');
      console.log(`   Run manually: node scripts/${scriptConfig.script}`);
      scriptResult.skipped = true;
      scriptResult.reason = 'Interactive script - requires manual execution';
    } else {
      const output = execSync(`node scripts/${scriptConfig.script}`, {
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8',
        stdio: 'pipe'
      });
      
      scriptResult.success = true;
      scriptResult.output = output;
      console.log(output);
    }

    // Try to load result file
    if (scriptConfig.resultFile) {
      const resultPath = path.join(__dirname, '..', scriptConfig.resultFile);
      if (fs.existsSync(resultPath)) {
        scriptResult.data = JSON.parse(fs.readFileSync(resultPath, 'utf8'));
      }
    }

  } catch (error) {
    scriptResult.success = false;
    scriptResult.error = error.message;
    scriptResult.output = error.stdout || error.stderr || error.message;
    console.error(`\n❌ Error running ${scriptConfig.name}:`, error.message);
  }

  results.scripts[scriptConfig.name] = scriptResult;
  return scriptResult;
}

async function main() {
  // Run all scripts
  for (const scriptConfig of scripts) {
    await runScript(scriptConfig);
  }

  // Analyze results
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 COMPREHENSIVE ANALYSIS');
  console.log('='.repeat(60));

  // Check validation results
  const validationScript = results.scripts['Contract Validation'];
  if (validationScript.data) {
    const validation = validationScript.data;
    
    if (validation.overallStatus === 'failed') {
      results.criticalIssues.push('Contract deployment validation failed');
    }
    
    if (validation.issues) {
      validation.issues.forEach(issue => {
        if (issue.severity === 'error') {
          results.criticalIssues.push(`${issue.contract}: ${issue.issue}`);
        }
      });
    }
    
    if (validation.warnings) {
      validation.warnings.forEach(warning => {
        results.warnings.push(`${warning.contract}: ${warning.message}`);
      });
    }
  }

  // Check permission results
  const permissionScript = results.scripts['Permission Check'];
  if (permissionScript.data) {
    const permissions = permissionScript.data;
    
    if (permissions.issues) {
      permissions.issues.forEach(issue => {
        if (issue.severity === 'error') {
          results.criticalIssues.push(`${issue.contract}: ${issue.issue}`);
          if (issue.fix) {
            results.recommendations.push(`Fix ${issue.contract}: ${issue.fix}`);
          }
        }
      });
    }
  }

  // Check frontend config results
  const frontendScript = results.scripts['Frontend Config Verification'];
  if (frontendScript.data) {
    const frontend = frontendScript.data;
    
    if (frontend.mismatches && frontend.mismatches.length > 0) {
      results.warnings.push(`Frontend configuration has ${frontend.mismatches.length} address mismatches`);
      
      if (frontend.recommendations) {
        results.recommendations.push(...frontend.recommendations);
      }
    }
  }

  // Determine overall status
  if (results.criticalIssues.length > 0) {
    results.overallStatus = 'critical';
  } else if (results.warnings.length > 0) {
    results.overallStatus = 'warning';
  } else {
    results.overallStatus = 'healthy';
  }

  // Display summary
  console.log('\n📋 Summary:\n');
  
  console.log(`Overall Status: ${getStatusEmoji(results.overallStatus)} ${results.overallStatus.toUpperCase()}\n`);
  
  if (results.criticalIssues.length > 0) {
    console.log('🚨 Critical Issues:');
    results.criticalIssues.forEach((issue, idx) => {
      console.log(`  ${idx + 1}. ${issue}`);
    });
    console.log('');
  }
  
  if (results.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    results.warnings.forEach((warning, idx) => {
      console.log(`  ${idx + 1}. ${warning}`);
    });
    console.log('');
  }
  
  if (results.recommendations.length > 0) {
    console.log('💡 Recommendations:');
    results.recommendations.forEach((rec, idx) => {
      console.log(`  ${idx + 1}. ${rec}`);
    });
    console.log('');
  }

  if (results.overallStatus === 'healthy') {
    console.log('✅ All systems operational!\n');
  } else if (results.overallStatus === 'warning') {
    console.log('⚠️  System is functional but has warnings that should be addressed.\n');
  } else {
    console.log('🚨 Critical issues detected. Please address them before proceeding.\n');
  }

  // Save comprehensive report
  const reportPath = path.join(__dirname, '../diagnostic-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📄 Comprehensive report saved to: ${reportPath}\n`);

  // Generate action plan
  if (results.criticalIssues.length > 0 || results.warnings.length > 0) {
    generateActionPlan(results);
  }
}

function getStatusEmoji(status) {
  switch (status) {
    case 'healthy': return '✅';
    case 'warning': return '⚠️';
    case 'critical': return '🚨';
    default: return '❓';
  }
}

function generateActionPlan(results) {
  console.log('📝 Action Plan:\n');
  
  let step = 1;
  
  if (results.criticalIssues.some(i => i.includes('permission') || i.includes('ROLE'))) {
    console.log(`${step}. Fix Contract Permissions:`);
    console.log('   Run: cd packages/contracts && node scripts/check-and-fix-permissions.js');
    console.log('   Follow the prompts to grant missing roles\n');
    step++;
  }
  
  if (results.warnings.some(w => w.includes('configuration') || w.includes('mismatch'))) {
    console.log(`${step}. Update Frontend Configuration:`);
    console.log('   Run: cd packages/contracts && node scripts/verify-frontend-config.js');
    console.log('   Then: ./update-env-addresses.sh (if generated)\n');
    step++;
  }
  
  console.log(`${step}. Restart Development Server:`);
  console.log('   Stop current server (Ctrl+C)');
  console.log('   Run: pnpm dev\n');
  step++;
  
  console.log(`${step}. Re-run Diagnostics:`);
  console.log('   Run: node scripts/run-all-diagnostics.js');
  console.log('   Verify all issues are resolved\n');
}

// Run main function
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
