const { PrismaClient } = require('@prisma/client');

async function checkDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking Database State...\n');
    
    // Check all profiles
    console.log('📋 PROFILES:');
    const profiles = await prisma.profile.findMany({
      include: {
        _count: {
          select: {
            posts: true,
            likes: true,
            comments: true
          }
        }
      }
    });
    
    profiles.forEach((profile, index) => {
      console.log(`\n${index + 1}. Profile ID: ${profile.id}`);
      console.log(`   Address: ${profile.address}`);
      console.log(`   Display Name: ${profile.displayName || 'Not set'}`);
      console.log(`   QNS Name: ${profile.qnsName || 'Not set'}`);
      console.log(`   Avatar URL: ${profile.avatarUrl || 'Not set'}`);
      console.log(`   Bio: ${profile.bio || 'Not set'}`);
      console.log(`   Posts: ${profile._count.posts}`);
      console.log(`   Likes: ${profile._count.likes}`);
      console.log(`   Comments: ${profile._count.comments}`);
    });
    
    // Check all posts
    console.log('\n\n📝 POSTS:');
    const posts = await prisma.post.findMany({
      include: {
        author: true,
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    });
    
    posts.forEach((post, index) => {
      console.log(`\n${index + 1}. Post ID: ${post.id}`);
      console.log(`   Author: ${post.author.displayName || post.author.qnsName || post.author.address}`);
      console.log(`   Text Preview: ${post.textPreview || 'No preview'}`);
      console.log(`   Image CIDs: ${post.imageCids.length} images`);
      console.log(`   Created: ${post.createdAt}`);
      console.log(`   Likes: ${post._count.likes}`);
      console.log(`   Comments: ${post._count.comments}`);
    });
    
    console.log(`\n\n📊 SUMMARY:`);
    console.log(`Total Profiles: ${profiles.length}`);
    console.log(`Total Posts: ${posts.length}`);
    
    // Check for test data
    const testProfiles = profiles.filter(p => 
      p.displayName === 'Alice Chen' || 
      p.qnsName === 'alice.quai'
    );
    
    if (testProfiles.length > 0) {
      console.log(`\n🧪 TEST DATA FOUND:`);
      testProfiles.forEach(profile => {
        console.log(`   - ${profile.displayName} (${profile.qnsName}) - ID: ${profile.id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
