// scripts/run-seed.ts
import { seedOrganizations, cleanupSeedData } from './seed-organizations';

/**
 * Command line runner for seeding operations
 * 
 * Usage:
 * npm run seed              # Run seeding
 * npm run seed:clean        # Clean up seed data
 * npm run seed:reset        # Clean and re-seed
 */

const command = process.argv[2];

async function main() {
  switch (command) {
    case 'clean':
      console.log('🧹 Running cleanup...');
      await cleanupSeedData();
      break;
      
    case 'reset':
      console.log('🔄 Running reset (clean + seed)...');
      await cleanupSeedData();
      await seedOrganizations();
      break;
      
    default:
      console.log('🌱 Running seed...');
      await seedOrganizations();
      break;
  }
}

main()
  .then(() => {
    console.log('✅ Operation completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Operation failed:', error);
    process.exit(1);
  });