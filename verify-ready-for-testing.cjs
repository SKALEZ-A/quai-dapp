#!/usr/bin/env node
// Quick verification script to check if app is ready for testing

const fs = require('fs');

console.log('🔍 Verifying QNS App Readiness\n');

// Expected addresses from deployment
const EXPECTED = {
  QNS_REGISTRY: '0x0047904d94645A46BA56Cf7E8c064cB823746cFf',
  QNS_NFT: '0x005382DebE72ee74d5D6E5a2D97Dc7bA2C16be12',
  QNS_REGISTRAR: '0x00204d553264Bdb39f4A6C6c1325d9B4553E427b',
  QNS_RESERVED_NAMES: '0x0023272C07514D2D236f6c6895507DFd26442471'
};

let allGood = true;

// Check 1: Deployment file exists
console.log('✓ Check 1: Deployment file');
const deploymentPath = 'packages/contracts/deployed-addresses-simple.json';
if (!fs.existsSync(deploymentPath)) {
  console.log('  ❌ Deployment file not found');
  allGood = false;
} else {
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  console.log('  ✅ Found deployment from', deployment.timestamp);
}

// Check 2: Frontend contracts.ts has correct addresses
console.log('\n✓ Check 2: Frontend contracts.ts');
const contractsPath = 'apps/web/src/lib/contracts.ts';
const contractsContent = fs.readFileSync(contractsPath, 'utf8');
let contractsOk = true;
for (const [key, addr] of Object.entries(EXPECTED)) {
  if (!contractsContent.includes(addr)) {
    console.log(`  ❌ ${key} address not found in contracts.ts`);
    contractsOk = false;
    allGood = false;
  }
}
if (contractsOk) {
  console.log('  ✅ All addresses present in contracts.ts');
}

// Check 3: Frontend .env has correct addresses
console.log('\n✓ Check 3: Frontend .env');
const frontendEnvPath = 'apps/web/.env';
const frontendEnv = fs.readFileSync(frontendEnvPath, 'utf8');
let envOk = true;
for (const [key, addr] of Object.entries(EXPECTED)) {
  const envKey = `NEXT_PUBLIC_${key}`;
  if (!frontendEnv.includes(addr)) {
    console.log(`  ❌ ${envKey} not set correctly`);
    envOk = false;
    allGood = false;
  }
}
if (envOk) {
  console.log('  ✅ All addresses set in .env');
}

// Check 4: Required files exist
console.log('\n✓ Check 4: Required implementation files');
const requiredFiles = [
  'apps/web/src/lib/errorHandler.ts',
  'apps/web/src/lib/transactionManager.ts',
  'apps/web/src/lib/qns.ts',
  'apps/web/app/qns/profile/page.tsx'
];
let filesOk = true;
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.log(`  ❌ Missing: ${file}`);
    filesOk = false;
    allGood = false;
  }
}
if (filesOk) {
  console.log('  ✅ All required files present');
}

// Check 5: ABIs exist
console.log('\n✓ Check 5: Contract ABIs');
const abiChecks = [
  { name: 'QNS_REGISTRAR_ABI', file: contractsPath },
  { name: 'QNS_NFT_ABI', file: contractsPath },
  { name: 'QNS_REGISTRY_ABI', file: contractsPath }
];
let abiOk = true;
for (const check of abiChecks) {
  const content = fs.readFileSync(check.file, 'utf8');
  if (!content.includes(check.name)) {
    console.log(`  ❌ ${check.name} not found`);
    abiOk = false;
    allGood = false;
  }
}
if (abiOk) {
  console.log('  ✅ All ABIs defined');
}

// Final verdict
console.log('\n' + '='.repeat(60));
if (allGood) {
  console.log('✅ ALL CHECKS PASSED - READY FOR TESTING!\n');
  console.log('Next steps:');
  console.log('  1. Start dev server: pnpm dev');
  console.log('  2. Open: http://localhost:3000/qns/profile');
  console.log('  3. Connect Pelagus wallet (Quai Orchard Testnet - Cyprus-1)');
  console.log('  4. Get testnet QI: https://faucet.quai.network/');
  console.log('  5. Try registering a domain\n');
  process.exit(0);
} else {
  console.log('❌ SOME CHECKS FAILED - NOT READY YET\n');
  console.log('Please fix the issues above before testing.');
  process.exit(1);
}
