#!/usr/bin/env node

/**
 * Test database connection script
 * Run this to verify your database connection is working
 */

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const profileCount = await prisma.profile.count();
    console.log(`📊 Found ${profileCount} profiles in database`);
    
    const postCount = await prisma.post.count();
    console.log(`📝 Found ${postCount} posts in database`);
    
    // Test creating a test profile (will be cleaned up)
    const testProfile = await prisma.profile.create({
      data: {
        address: '0x' + Math.random().toString(16).substr(2, 40),
        displayName: 'Test User',
        bio: 'This is a test profile'
      }
    });
    console.log('✅ Test profile created successfully');
    
    // Clean up test profile
    await prisma.profile.delete({
      where: { id: testProfile.id }
    });
    console.log('🧹 Test profile cleaned up');
    
    console.log('🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error.message);
    
    if (error.message.includes('the URL must start with the protocol')) {
      console.log('\n💡 Solution: Set DATABASE_URL environment variable in Railway');
      console.log('   For SQLite: DATABASE_URL=file:./prisma/prod.db');
      console.log('   For PostgreSQL: DATABASE_URL=[your-postgres-url]');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
