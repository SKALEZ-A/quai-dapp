const { PrismaClient } = require('@prisma/client');

async function fixUserProfiles() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Fixing User Profile Data...\n');
    
    // Find the user with posts but no profile data
    const userWithPosts = await prisma.profile.findFirst({
      where: {
        AND: [
          { displayName: null },
          { qnsName: null }
        ]
      },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    });
    
    if (userWithPosts && userWithPosts._count.posts > 0) {
      console.log(`Found user with posts but no profile data: ${userWithPosts.address}`);
      console.log(`Posts: ${userWithPosts._count.posts}`);
      
      // Check if this matches one of your known users
      const knownUsers = [
        { address: '0x003dac94805c77d7fd485cd415f8078414d171e4', name: 'Baddest Dev', qns: 'skalezDgreat' },
        { address: '0x0002567655a581a53ADf543E25dD384097EA196c', name: 'AURACLE', qns: 'auracle.defi' }
      ];
      
      const matchingUser = knownUsers.find(u => 
        u.address.toLowerCase() === userWithPosts.address.toLowerCase()
      );
      
      if (matchingUser) {
        console.log(`\n🎯 This matches ${matchingUser.name}! Updating profile...`);
        
        await prisma.profile.update({
          where: { id: userWithPosts.id },
          data: {
            displayName: matchingUser.name,
            qnsName: matchingUser.qns,
            bio: `Welcome to ${matchingUser.name}'s profile!`
          }
        });
        
        console.log(`✅ Updated profile for ${matchingUser.name}`);
      } else {
        console.log(`\n❓ Unknown user with posts. Address: ${userWithPosts.address}`);
        console.log('This might be a different user or a test account.');
      }
    }
    
    // Check if there are duplicate profiles for the same address
    console.log('\n🔍 Checking for duplicate profiles...');
    
    const allProfiles = await prisma.profile.findMany({
      select: { id: true, address: true, displayName: true, qnsName: true }
    });
    
    const addressGroups = {};
    allProfiles.forEach(profile => {
      const addr = profile.address.toLowerCase();
      if (!addressGroups[addr]) {
        addressGroups[addr] = [];
      }
      addressGroups[addr].push(profile);
    });
    
    const duplicates = Object.entries(addressGroups).filter(([addr, profiles]) => profiles.length > 1);
    
    if (duplicates.length > 0) {
      console.log('Found duplicate profiles:');
      duplicates.forEach(([addr, profiles]) => {
        console.log(`\nAddress: ${addr}`);
        profiles.forEach((profile, index) => {
          console.log(`  ${index + 1}. ID: ${profile.id}, Name: ${profile.displayName || 'Unnamed'}, QNS: ${profile.qnsName || 'None'}`);
        });
      });
    } else {
      console.log('No duplicate profiles found.');
    }
    
    // Final state check
    console.log('\n📊 Final Database State:');
    
    const finalProfiles = await prisma.profile.findMany({
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
    
    console.log(`\nTotal Profiles: ${finalProfiles.length}`);
    
    finalProfiles.forEach((profile, index) => {
      console.log(`\n${index + 1}. ${profile.displayName || profile.qnsName || 'Unnamed'}`);
      console.log(`   Address: ${profile.address}`);
      console.log(`   Display Name: ${profile.displayName || 'Not set'}`);
      console.log(`   QNS Name: ${profile.qnsName || 'Not set'}`);
      console.log(`   Avatar URL: ${profile.avatarUrl || 'Not set'}`);
      console.log(`   Posts: ${profile._count.posts}`);
      console.log(`   Likes: ${profile._count.likes}`);
      console.log(`   Comments: ${profile._count.comments}`);
    });
    
    console.log('\n✅ Profile fixing completed!');
    
  } catch (error) {
    console.error('❌ Profile Fixing Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserProfiles();
