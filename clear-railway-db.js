#!/usr/bin/env node

/**
 * Clear Railway database script
 * Run this in Railway console to fix P2023 errors
 */

const { PrismaClient } = require('@prisma/client');

async function clearDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🗑️ Clearing Railway database to fix P2023 errors...');
    
    // Clear all data in the correct order (respecting foreign key constraints)
    await prisma.like.deleteMany();
    console.log('✅ Cleared likes');
    
    await prisma.comment.deleteMany();
    console.log('✅ Cleared comments');
    
    await prisma.follow.deleteMany();
    console.log('✅ Cleared follows');
    
    await prisma.post.deleteMany();
    console.log('✅ Cleared posts');
    
    await prisma.profile.deleteMany();
    console.log('✅ Cleared profiles');
    
    console.log('🎉 Database cleared! P2023 errors should be resolved.');
    console.log('📝 Your live site should now load data properly.');
    
  } catch (error) {
    console.error('❌ Error clearing database:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();
