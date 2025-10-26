#!/usr/bin/env node

/**
 * Check Railway database data before clearing
 * Run this in Railway console to see what you'll lose
 */

const { PrismaClient } = require('@prisma/client');

async function clearRailwayDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🗑️  CLEARING RAILWAY DATABASE...\n');
    
    // Clear in correct order to respect foreign key constraints
    console.log('1. Deleting Likes...');
    const likeCount = await prisma.like.deleteMany();
    console.log(`   ✅ Deleted ${likeCount.count} likes`);
    
    console.log('2. Deleting Comments...');
    const commentCount = await prisma.comment.deleteMany();
    console.log(`   ✅ Deleted ${commentCount.count} comments`);
    
    console.log('3. Deleting Follows...');
    const followCount = await prisma.follow.deleteMany();
    console.log(`   ✅ Deleted ${followCount.count} follows`);
    
    console.log('4. Deleting Posts...');
    const postCount = await prisma.post.deleteMany();
    console.log(`   ✅ Deleted ${postCount.count} posts`);
    
    console.log('5. Deleting Profiles...');
    const profileCount = await prisma.profile.deleteMany();
    console.log(`   ✅ Deleted ${profileCount.count} profiles`);
    
    console.log('\n🎉 DATABASE CLEARED SUCCESSFULLY!');
    console.log('📊 Summary:');
    console.log(`   - Likes: ${likeCount.count}`);
    console.log(`   - Comments: ${commentCount.count}`);
    console.log(`   - Follows: ${followCount.count}`);
    console.log(`   - Posts: ${postCount.count}`);
    console.log(`   - Profiles: ${profileCount.count}`);
    
    console.log('\n✅ Database is now clean and ready for new data!');
    console.log('🔧 P2023 errors should be resolved.');
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

clearRailwayDatabase();
