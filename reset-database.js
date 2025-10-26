#!/usr/bin/env node

/**
 * Reset database script for Railway PostgreSQL
 * This clears existing data with incompatible formats and lets the new schema work
 */

const { PrismaClient } = require('@prisma/client');

async function resetDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔄 Resetting database to fix data type issues...');
    
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
    
    console.log('🎉 Database reset complete! New data will use the correct JSON format.');
    
  } catch (error) {
    console.error('❌ Database reset failed:');
    console.error(error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetDatabase();
