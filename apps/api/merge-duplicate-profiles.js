const { PrismaClient } = require('@prisma/client');

async function mergeDuplicateProfiles() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Merging Duplicate Profiles...\n');
    
    // Find all profiles with the same address
    const allProfiles = await prisma.profile.findMany({
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
      
      for (const [addr, profiles] of duplicates) {
        console.log(`\nAddress: ${addr}`);
        profiles.forEach((profile, index) => {
          console.log(`  ${index + 1}. ID: ${profile.id}`);
          console.log(`     Name: ${profile.displayName || 'Unnamed'}`);
          console.log(`     QNS: ${profile.qnsName || 'None'}`);
          console.log(`     Posts: ${profile._count.posts}`);
          console.log(`     Likes: ${profile._count.likes}`);
          console.log(`     Comments: ${profile._count.comments}`);
        });
        
        // Find the profile with the most activity (posts, likes, comments)
        const mostActiveProfile = profiles.reduce((best, current) => {
          const bestScore = best._count.posts + best._count.likes + best._count.comments;
          const currentScore = current._count.posts + current._count.likes + current._count.comments;
          return currentScore > bestScore ? current : best;
        });
        
        console.log(`\n🎯 Most active profile: ${mostActiveProfile.id} (${mostActiveProfile.displayName || 'Unnamed'})`);
        
        // Find the profile with the best profile data (displayName, qnsName, avatarUrl)
        const bestProfileData = profiles.reduce((best, current) => {
          const bestScore = (best.displayName ? 1 : 0) + (best.qnsName ? 1 : 0) + (best.avatarUrl ? 1 : 0);
          const currentScore = (current.displayName ? 1 : 0) + (current.qnsName ? 1 : 0) + (current.avatarUrl ? 1 : 0);
          return currentScore > bestScore ? current : best;
        });
        
        console.log(`🎯 Best profile data: ${bestProfileData.id} (${bestProfileData.displayName || 'Unnamed'})`);
        
        // Merge profiles: use the most active profile as base, but update with best profile data
        const profilesToDelete = profiles.filter(p => p.id !== mostActiveProfile.id);
        
        console.log(`\n🔄 Merging profiles...`);
        
        // Update the most active profile with the best profile data
        await prisma.profile.update({
          where: { id: mostActiveProfile.id },
          data: {
            displayName: bestProfileData.displayName || mostActiveProfile.displayName,
            qnsName: bestProfileData.qnsName || mostActiveProfile.qnsName,
            avatarUrl: bestProfileData.avatarUrl || mostActiveProfile.avatarUrl,
            bio: bestProfileData.bio || mostActiveProfile.bio
          }
        });
        
        console.log(`✅ Updated profile ${mostActiveProfile.id} with best data`);
        
        // Delete the other profiles
        for (const profileToDelete of profilesToDelete) {
          console.log(`🗑️ Deleting duplicate profile: ${profileToDelete.id}`);
          
          // Delete follow relationships first
          await prisma.follow.deleteMany({
            where: {
              OR: [
                { followerId: profileToDelete.id },
                { followingId: profileToDelete.id }
              ]
            }
          });
          
          await prisma.profile.delete({
            where: { id: profileToDelete.id }
          });
        }
      }
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
    
    console.log('\n✅ Profile merging completed!');
    
  } catch (error) {
    console.error('❌ Profile Merging Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

mergeDuplicateProfiles();
