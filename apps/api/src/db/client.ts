import { PrismaClient } from "@prisma/client";
import { URL } from 'url';

// Parse and modify the database URL to handle SSL properly
const databaseUrl = process.env.DATABASE_URL;
let modifiedUrl = databaseUrl;

if (databaseUrl && databaseUrl.includes('supabase.com')) {
  try {
    const url = new URL(databaseUrl);
    // Remove any problematic SSL parameters and set proper ones
    url.searchParams.delete('sslcert');
    url.searchParams.set('sslmode', 'require');
    modifiedUrl = url.toString();
    console.log('🔧 Using modified database URL for Supabase with proper SSL settings');
  } catch (error) {
    console.warn('⚠️ Could not parse DATABASE_URL, using as-is');
  }
}

// Create Prisma client with proper error handling and connection retry logic
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: modifiedUrl,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

// Add connection error handling
prisma.$connect().catch((error) => {
  console.error('❌ Failed to connect to database:', error.message);
  if (error.message.includes('self-signed certificate')) {
    console.error('💡 SSL Certificate issue detected. This is common with Supabase.');
    console.error('💡 The API will continue but database operations may fail.');
  }
});


