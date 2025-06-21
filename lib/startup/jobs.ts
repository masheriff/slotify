// lib/startup/jobs.ts
import { startAuditCleanupJob } from '@/lib/jobs/audit-cleanup';

// Global flag to prevent multiple job instances
declare global {
  var cronJobsStarted: boolean | undefined;
}

/**
 * Initialize all background jobs
 * Only runs once per application instance
 */
export function initializeJobs() {
  // Prevent multiple job instances
  if (global.cronJobsStarted) {
    console.log('⏭️ Jobs already initialized, skipping...');
    return;
  }

  // Only run jobs in production environment
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔧 Development mode: Skipping background jobs');
    return;
  }

  console.log('🚀 Initializing background jobs...');
  
  try {
    // Start audit cleanup job
    startAuditCleanupJob();
    
    // Mark jobs as started
    global.cronJobsStarted = true;
    
    console.log('✅ Background jobs initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize background jobs:', error);
  }
}