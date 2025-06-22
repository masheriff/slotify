// scripts/run-enhanced-seed.ts
import { seedOrganizations, cleanupSeedData, resetSeedData } from './seed-organizations';
import { checkDatabaseConnection } from '@/db';

/**
 * Enhanced seed runner with better error handling and database checks
 */

async function main() {
  const command = process.argv[2] || 'seed';
  
  console.log(`🚀 Running enhanced seed script with command: ${command}`);
  
  try {
    // Check database connection first
    console.log('🔍 Checking database connection...');
    const isConnected = await checkDatabaseConnection();
    
    if (!isConnected) {
      throw new Error('Cannot connect to database. Please check your database configuration.');
    }
    
    console.log('✅ Database connection successful');
    
    // Execute based on command
    switch (command.toLowerCase()) {
      case 'clean':
      case 'cleanup':
        console.log('🧹 Starting cleanup operation...');
        await cleanupSeedData();
        console.log('✅ Cleanup operation completed');
        break;
        
      case 'reset':
        console.log('🔄 Starting reset operation...');
        await resetSeedData();
        console.log('✅ Reset operation completed');
        break;
        
      case 'seed':
      default:
        console.log('🌱 Starting seed operation...');
        await seedOrganizations();
        console.log('✅ Seed operation completed');
        break;
    }
    
  } catch (error) {
    console.error('💥 Operation failed:', error);
    
    // More detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      if (error.stack) {
        console.error('Stack trace:', error.stack);
      }
    }
    
    process.exit(1);
  }
}

// Run the script
main();