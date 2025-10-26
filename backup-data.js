#!/usr/bin/env node

/**
 * Backup and display all existing data before clearing
 * This shows you exactly what you'll lose
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';

async function backupData() {
  const prisma = new PrismaClient();
  
  try {
    console.log('📊 FETCHING ALL YOUR DATA...\n');
    
    // Fetch all data
    const profiles = await prisma.profile.findMany();
    const posts = await prisma.post.findMany();
    const comments = await prisma.comment.findMany();
    const likes = await prisma.like.findMany();
    const follows = await prisma.follow.findMany();
    
    console.log('📈 DATA SUMMARY:');
    console.log(`👥 Profiles: ${profiles.length}`);
    console.log(`📝 Posts: ${posts.length}`);
    console.log(`💬 Comments: ${comments.length}`);
    console.log(`❤️  Likes: ${likes.length}`);
    console.log(`👥 Follows: ${follows.length}`);
    console.log('');
    
    // Show detailed data
    if (profiles.length > 0) {
      console.log('👥 PROFILES:');
      profiles.forEach((profile, i) => {
        console.log(`  ${i + 1}. ${profile.displayName || 'No name'} (${profile.address})`);
        console.log(`     QNS: ${profile.qnsName || 'None'}`);
        console.log(`     Bio: ${profile.bio || 'No bio'}`);
        console.log(`     Created: ${profile.createdAt.toISOString()}`);
        console.log('');
      });
    }
    
    if (posts.length > 0) {
      console.log('📝 POSTS:');
      posts.forEach((post, i) => {
        console.log(`  ${i + 1}. ${post.textPreview || 'No preview'}`);
        console.log(`     Author: ${post.authorId}`);
        console.log(`     Images: ${post.imageCids || 'None'}`);
        console.log(`     Created: ${post.createdAt.toISOString()}`);
        console.log('');
      });
    }
    
    if (comments.length > 0) {
      console.log('💬 COMMENTS:');
      comments.forEach((comment, i) => {
        console.log(`  ${i + 1}. ${comment.textPreview || 'No preview'}`);
        console.log(`     Author: ${comment.authorId}`);
        console.log(`     Post: ${comment.postId}`);
        console.log(`     Created: ${comment.createdAt.toISOString()}`);
        console.log('');
      });
    }
    
    if (likes.length > 0) {
      console.log('❤️  LIKES:');
      likes.forEach((like, i) => {
        console.log(`  ${i + 1}. Profile ${like.profileId} liked Post ${like.postId}`);
        console.log(`     Created: ${like.createdAt.toISOString()}`);
        console.log('');
      });
    }
    
    if (follows.length > 0) {
      console.log('👥 FOLLOWS:');
      follows.forEach((follow, i) => {
        console.log(`  ${i + 1}. Profile ${follow.followerId} follows ${follow.followingId}`);
        console.log(`     Created: ${follow.createdAt.toISOString()}`);
        console.log('');
      });
    }
    
    // Create backup file
    const backup = {
      profiles,
      posts,
      comments,
      likes,
      follows,
      exportedAt: new Date().toISOString()
    };
    
    fs.writeFileSync('data-backup.json', JSON.stringify(backup, null, 2));
    console.log('💾 BACKUP SAVED: data-backup.json');
    console.log('📁 You can restore this data later if needed');
    
    // Show total impact
    const totalRecords = profiles.length + posts.length + comments.length + likes.length + follows.length;
    console.log(`\n🎯 TOTAL RECORDS TO LOSE: ${totalRecords}`);
    
    if (totalRecords === 0) {
      console.log('✅ GOOD NEWS: Your database is empty! Safe to clear.');
    } else if (totalRecords < 10) {
      console.log('⚠️  You have a small amount of data. Consider if it\'s worth saving.');
    } else {
      console.log('🚨 You have significant data. Make sure you want to lose this!');
    }
    
  } catch (error) {
    console.error('❌ Error fetching data:', error.message);
    
    if (error.message.includes('Could not convert value')) {
      console.log('\n🔍 This is the P2023 error we need to fix!');
      console.log('The data exists but has format issues.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

backupData();
