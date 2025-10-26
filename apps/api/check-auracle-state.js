const { PrismaClient } = require('@prisma/client');

async function checkAuracleState() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking AURACLE Database State...\n');
    
    // Check all profiles for AURACLE's address
    const auracleProfiles = await prisma.profile.findMany({
      where: {
        address: '0x0002567655a581a53ADf543E25dD384097EA196c'
      },
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
    
    console.log(`Found ${auracleProfiles.length} profiles for AURACLE's address`);
    
    auracleProfiles.forEach((profile, index) => {
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
    
    // Check all posts by AURACLE's address
    const auraclePosts = await prisma.post.findMany({
      where: {
        author: {
          address: '0x0002567655a581a53ADf543E25dD384097EA196c'
        }
      },
      include: {
        author: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`\n\nFound ${auraclePosts.length} posts by AURACLE's address:`);
    auraclePosts.forEach((post, index) => {
      console.log(`\n${index + 1}. Post ID: ${post.id}`);
      console.log(`   Author ID: ${post.authorId}`);
      console.log(`   Author Address: ${post.author.address}`);
      console.log(`   Author Display Name: ${post.author.displayName || 'Not set'}`);
      console.log(`   Author QNS Name: ${post.author.qnsName || 'Not set'}`);
      console.log(`   Author Avatar: ${post.author.avatarUrl || 'Not set'}`);
      console.log(`   Text Preview: ${post.textPreview || 'No preview'}`);
      console.log(`   Created: ${post.createdAt}`);
    });
    
    console.log('\n✅ AURACLE state check completed!');
    
  } catch (error) {
    console.error('❌ AURACLE Check Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAuracleState();
