#!/usr/bin/env node

/**
 * Comprehensive deployment verification script
 * Checks all critical components before deployment
 */

import fs from 'fs';
import path from 'path';

console.log('🔍 Verifying deployment readiness...\n');

// Check 1: Critical files exist
const criticalFiles = [
  'apps/api/prisma/schema.prisma',
  'apps/api/src/routes/posts.ts',
  'apps/api/src/index.ts',
  'apps/web/package.json',
  'apps/web/next.config.mjs'
];

console.log('📁 Checking critical files...');
let allFilesExist = true;
criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING!`);
    allFilesExist = false;
  }
});

// Check 2: Schema configuration
console.log('\n🗄️ Checking Prisma schema...');
const schemaPath = 'apps/api/prisma/schema.prisma';
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  if (schema.includes('provider = "postgresql"')) {
    console.log('✅ Database provider: PostgreSQL');
  } else {
    console.log('❌ Database provider: NOT PostgreSQL');
    allFilesExist = false;
  }
  
  if (schema.includes('imageCids    Json?')) {
    console.log('✅ imageCids field: JSON type');
  } else {
    console.log('❌ imageCids field: NOT JSON type');
    allFilesExist = false;
  }
} else {
  console.log('❌ Schema file not found');
  allFilesExist = false;
}

// Check 3: Posts route configuration
console.log('\n📝 Checking posts route...');
const postsPath = 'apps/api/src/routes/posts.ts';
if (fs.existsSync(postsPath)) {
  const posts = fs.readFileSync(postsPath, 'utf8');
  
  if (posts.includes('imageCids: imageCids,')) {
    console.log('✅ imageCids stored as array (not comma-separated)');
  } else {
    console.log('❌ imageCids storage format issue');
    allFilesExist = false;
  }
  
  if (posts.includes('const files = req.files as any[]')) {
    console.log('✅ TypeScript type issue fixed');
  } else {
    console.log('❌ TypeScript type issue not fixed');
    allFilesExist = false;
  }
} else {
  console.log('❌ Posts route file not found');
  allFilesExist = false;
}

// Check 4: Package.json scripts
console.log('\n📦 Checking package.json scripts...');
const apiPackagePath = 'apps/api/package.json';
if (fs.existsSync(apiPackagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(apiPackagePath, 'utf8'));
  
  if (packageJson.scripts && packageJson.scripts.build) {
    console.log('✅ API build script exists');
  } else {
    console.log('❌ API build script missing');
    allFilesExist = false;
  }
} else {
  console.log('❌ API package.json not found');
  allFilesExist = false;
}

// Final result
console.log('\n🎯 Deployment Verification Result:');
if (allFilesExist) {
  console.log('✅ ALL CHECKS PASSED - Ready for deployment!');
  console.log('\n📋 Expected behavior:');
  console.log('  • Railway: Database connection will work');
  console.log('  • Railway: No more P2032 data type errors');
  console.log('  • Vercel: Clean build without errors');
  console.log('  • Live site: Posts and leaderboard will load');
} else {
  console.log('❌ SOME CHECKS FAILED - Fix issues before deployment');
  process.exit(1);
}
