const { PrismaClient } = require('@prisma/client');

async function checkAllPosts() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking All Posts and Authors...\n');
    
    // Check all posts with their authors
    const allPosts = await prisma.post.findMany({
      include: {
        author: true,
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Found ${allPosts.length} total posts:`);
    
    allPosts.forEach((post, index) => {
      console.log(`\n${index + 1}. Post ID: ${post.id}`);
      console.log(`   Author ID: ${post.authorId}`);
      console.log(`   Author Address: ${post.author.address}`);
      console.log(`   Author Display Name: ${post.author.displayName || 'Not set'}`);
      console.log(`   Author QNS Name: ${post.author.qnsName || 'Not set'}`);
      console.log(`   Author Avatar: ${post.author.avatarUrl || 'Not set'}`);
      console.log(`   Text Preview: ${post.textPreview || 'No preview'}`);
      console.log(`   Created: ${post.createdAt}`);
      console.log(`   Likes: ${post._count.likes}`);
      console.log(`   Comments: ${post._count.comments}`);
    });
    
    // Check for any profiles with similar addresses
    console.log('\n\n🔍 Checking for similar addresses...');
    const allProfiles = await prisma.profile.findMany({
      select: {
        id: true,
        address: true,
        displayName: true,
        qnsName: true,
        avatarUrl: true
      }
    });
    
    allProfiles.forEach((profile, index) => {
      console.log(`\n${index + 1}. Profile ID: ${profile.id}`);
      console.log(`   Address: ${profile.address}`);
      console.log(`   Display Name: ${profile.displayName || 'Not set'}`);
      console.log(`   QNS Name: ${profile.qnsName || 'Not set'}`);
      console.log(`   Avatar: ${profile.avatarUrl || 'Not set'}`);
    });
    
    console.log('\n✅ All posts check completed!');
    
  } catch (error) {
    console.error('❌ Posts Check Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllPosts();
