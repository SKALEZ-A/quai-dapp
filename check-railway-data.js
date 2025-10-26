#!/usr/bin/env node

/**
 * Check Railway database data before clearing
 * Run this in Railway console to see what you'll lose
 */

const { PrismaClient } = require('@prisma/client');

async function checkRailwayData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('📊 CHECKING YOUR RAILWAY DATA...\n');
    
    // Count all records
    const profileCount = await prisma.profile.count();
    const postCount = await prisma.post.count();
    const commentCount = await prisma.comment.count();
    const likeCount = await prisma.like.count();
    const followCount = await prisma.follow.count();
    
    console.log('📈 DATA SUMMARY:');
    console.log(`👥 Profiles: ${profileCount}`);
    console.log(`📝 Posts: ${postCount}`);
    console.log(`💬 Comments: ${commentCount}`);
    console.log(`❤️  Likes: ${likeCount}`);
    console.log(`👥 Follows: ${followCount}`);
    
    const total = profileCount + postCount + commentCount + likeCount + followCount;
    console.log(`\n🎯 TOTAL RECORDS: ${total}`);
    
    if (total === 0) {
      console.log('✅ Database is empty - safe to clear!');
    } else {
      console.log('⚠️  You have data that will be lost!');
      
      // Try to show some sample data
      if (profileCount > 0) {
        console.log('\n👥 SAMPLE PROFILES:');
        const profiles = await prisma.profile.findMany({ take: 3 });
        profiles.forEach((profile, i) => {
          console.log(`  ${i + 1}. ${profile.displayName || 'No name'} (${profile.address})`);
          console.log(`     QNS: ${profile.qnsName || 'None'}`);
          console.log(`     Created: ${profile.createdAt.toISOString()}`);
        });
      }
      
      if (postCount > 0) {
        console.log('\n📝 SAMPLE POSTS:');
        const posts = await prisma.post.findMany({ take: 3 });
        posts.forEach((post, i) => {
          console.log(`  ${i + 1}. ${post.textPreview || 'No preview'}`);
          console.log(`     Author: ${post.authorId}`);
          console.log(`     Created: ${post.createdAt.toISOString()}`);
        });
      }
    }
    
    console.log('\n💡 DECISION:');
    if (total === 0) {
      console.log('✅ Clear the database - it\'s empty anyway');
    } else if (total < 5) {
      console.log('⚠️  Small amount of data - consider if worth saving');
    } else {
      console.log('🚨 Significant data - make sure you want to lose this!');
    }
    
  } catch (error) {
    console.log('❌ Error checking data:', error.message);
    
    if (error.message.includes('P2023') || error.message.includes('converting field')) {
      console.log('\n🔍 This is the data format error we need to fix!');
      console.log('The data exists but has incompatible format.');
      console.log('This confirms we need to clear the database.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkRailwayData();
