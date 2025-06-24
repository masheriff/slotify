// lib/jobs/audit-cleanup.ts
import cron from 'node-cron';
import { db } from '@/db';
import { sql } from 'drizzle-orm';
import { auditLogs, auditCleanupLogs, organizations } from '@/db/schema';
import { eq, lt, and } from 'drizzle-orm';

interface OrganizationWithMetadata {
  id: string;
  name: string;
  metadata: {
    type?: "admin" | "client";
    isActive?: boolean;
    dataRetentionYears?: string;
    [key: string]: any;
  };
}

/**
 * Audit Log Cleanup Job
 * Runs on the 1st day of every month at 2 AM UTC
 * Cleans audit logs based on each organization's retention policy
 */
export function startAuditCleanupJob() {
  // Schedule: "0 2 1 * *" = minute:0 hour:2 day:1 month:* dayOfWeek:*
  // Runs on 1st day of every month at 2:00 AM UTC
  cron.schedule('0 2 1 * *', async () => {
    console.log('🧹 Starting audit log cleanup job...');
    
    const jobStartTime = new Date();
    let totalDeleted = 0;
    let successfulOrgs = 0;
    let failedOrgs = 0;
    
    try {
      // Get all organizations and filter active ones with metadata
      const allOrgs = await db
        .select({
          id: organizations.id,
          name: organizations.name,
          metadata: organizations.metadata,
        })
        .from(organizations);

      // Filter active organizations based on metadata.isActive
      const activeOrgs = allOrgs.filter((org) => {
        const metadata = org.metadata as OrganizationWithMetadata['metadata'];
        return metadata?.isActive === true;
      });

      console.log(`📋 Found ${activeOrgs.length} active organizations to process (${allOrgs.length} total)`);

      for (const org of activeOrgs) {
        const orgJobStart = new Date();
        let deletedCount = 0;
        let status = 'success';
        let errorMessage = null;

        try {
          const metadata = org.metadata as OrganizationWithMetadata['metadata'];
          const retentionYears = parseInt(metadata?.dataRetentionYears || '7');
          
          console.log(`🏥 Processing ${org.name} (retention: ${retentionYears} years)`);

          // Calculate cutoff date
          const cutoffDate = new Date();
          cutoffDate.setFullYear(cutoffDate.getFullYear() - retentionYears);

          // Delete old audit logs for this organization
          const deleteResult = await db
            .delete(auditLogs)
            .where(
              and(
                eq(auditLogs.organizationId, org.id),
                lt(auditLogs.createdAt, cutoffDate)
              )
            );

          deletedCount = deleteResult.rowCount || 0;
          totalDeleted += deletedCount;
          successfulOrgs++;

          console.log(`✅ ${org.name}: Deleted ${deletedCount} audit logs older than ${cutoffDate.toISOString()}`);

        } catch (orgError) {
          console.error(`❌ Error processing ${org.name}:`, orgError);
          status = 'failed';
          errorMessage = orgError instanceof Error ? orgError.message : 'Unknown error';
          failedOrgs++;
        }

        // Log cleanup activity for this organization
        try {
          await db.insert(auditCleanupLogs).values({
            id: `cleanup_${org.id}_${Date.now()}`,
            organizationId: org.id,
            deletedRecords: deletedCount,
            retentionYears: parseInt((org.metadata as any)?.dataRetentionYears || '7'),
            cleanupDate: new Date(),
            jobStartTime: orgJobStart,
            jobEndTime: new Date(),
            status,
            errorMessage,
          });
        } catch (logError) {
          console.error(`⚠️ Failed to log cleanup for ${org.name}:`, logError);
        }
      }

      const jobEndTime = new Date();
      const duration = jobEndTime.getTime() - jobStartTime.getTime();

      console.log(`🎉 Audit cleanup completed successfully!`);
      console.log(`📊 Summary:`);
      console.log(`   • Total audit logs deleted: ${totalDeleted}`);
      console.log(`   • Organizations processed: ${activeOrgs.length}`);
      console.log(`   • Successful: ${successfulOrgs}`);
      console.log(`   • Failed: ${failedOrgs}`);
      console.log(`   • Duration: ${Math.round(duration / 1000)}s`);

      // Optional: Send notification email to admins for large deletions
      if (totalDeleted > 10000) {
        console.log(`⚠️ Large cleanup detected (${totalDeleted} records). Consider sending admin notification.`);
        // TODO: Implement admin notification email
        // await sendCleanupNotificationEmail({ totalDeleted, successfulOrgs, failedOrgs, duration });
      }

    } catch (error) {
      console.error('💥 Audit cleanup job failed:', error);
      
      // Log overall job failure
      try {
        await db.insert(auditCleanupLogs).values({
          id: `cleanup_job_failure_${Date.now()}`,
          organizationId: null, // System-level failure
          deletedRecords: totalDeleted,
          retentionYears: 0,
          cleanupDate: new Date(),
          jobStartTime,
          jobEndTime: new Date(),
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown job failure',
        });
      } catch (logError) {
        console.error('Failed to log job failure:', logError);
      }
    }
  }, {
    timezone: "UTC"
  });

  console.log('⏰ Audit cleanup job scheduled: 1st day of every month at 2:00 AM UTC');
}

/**
 * Manual cleanup function for testing or one-off runs
 * Can be called from admin interface or CLI
 */
export async function runAuditCleanupNow(organizationId?: string): Promise<{
  success: boolean;
  deletedCount: number;
  error?: string;
}> {
  console.log('🧹 Running manual audit cleanup...');
  
  try {
    let totalDeleted = 0;

    if (organizationId) {
      // Clean specific organization
      const [org] = await db
        .select({
          id: organizations.id,
          name: organizations.name,
          metadata: organizations.metadata,
        })
        .from(organizations)
        .where(eq(organizations.id, organizationId))
        .limit(1);

      if (!org) {
        throw new Error(`Organization ${organizationId} not found`);
      }

      const metadata = org.metadata as OrganizationWithMetadata['metadata'];
      const retentionYears = parseInt(metadata?.dataRetentionYears || '7');
      const cutoffDate = new Date();
      cutoffDate.setFullYear(cutoffDate.getFullYear() - retentionYears);

      const deleteResult = await db
        .delete(auditLogs)
        .where(
          and(
            eq(auditLogs.organizationId, organizationId),
            lt(auditLogs.createdAt, cutoffDate)
          )
        );

      totalDeleted = deleteResult.rowCount || 0;
      console.log(`✅ Manual cleanup: Deleted ${totalDeleted} audit logs for ${org.name}`);

    } else {
      // Clean all organizations (same logic as cron job but synchronous)
      const allOrgs = await db
        .select({
          id: organizations.id,
          name: organizations.name,
          metadata: organizations.metadata,
        })
        .from(organizations);

      // Filter active organizations based on metadata.isActive
      const activeOrgs = allOrgs.filter((org) => {
        const metadata = org.metadata as OrganizationWithMetadata['metadata'];
        return metadata?.isActive === true;
      });

      for (const org of activeOrgs) {
        const metadata = org.metadata as OrganizationWithMetadata['metadata'];
        const retentionYears = parseInt(metadata?.dataRetentionYears || '7');
        const cutoffDate = new Date();
        cutoffDate.setFullYear(cutoffDate.getFullYear() - retentionYears);

        const deleteResult = await db
          .delete(auditLogs)
          .where(
            and(
              eq(auditLogs.organizationId, org.id),
              lt(auditLogs.createdAt, cutoffDate)
            )
          );

        const deletedCount = deleteResult.rowCount || 0;
        totalDeleted += deletedCount;
        console.log(`✅ ${org.name}: Deleted ${deletedCount} audit logs`);
      }
    }

    return {
      success: true,
      deletedCount: totalDeleted,
    };

  } catch (error) {
    console.error('❌ Manual cleanup failed:', error);
    return {
      success: false,
      deletedCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get cleanup statistics for admin dashboard
 */
export async function getCleanupStats() {
  try {
    const stats = await db
      .select({
        totalCleanups: sql<number>`count(*)`,
        totalDeletedRecords: sql<number>`sum(deleted_records)`,
        lastCleanupDate: sql<Date>`max(cleanup_date)`,
        successfulJobs: sql<number>`count(*) filter (where status = 'success')`,
        failedJobs: sql<number>`count(*) filter (where status = 'failed')`,
      })
      .from(auditCleanupLogs);

    return stats[0] || {
      totalCleanups: 0,
      totalDeletedRecords: 0,
      lastCleanupDate: null,
      successfulJobs: 0,
      failedJobs: 0,
    };
  } catch (error) {
    console.error('Failed to get cleanup stats:', error);
    return null;
  }
}

/**
 * Get organization-specific cleanup history
 * Useful for admin dashboard to show per-organization cleanup activities
 */
export async function getOrganizationCleanupHistory(organizationId: string, limit = 10) {
  try {
    const history = await db
      .select({
        id: auditCleanupLogs.id,
        deletedRecords: auditCleanupLogs.deletedRecords,
        retentionYears: auditCleanupLogs.retentionYears,
        cleanupDate: auditCleanupLogs.cleanupDate,
        status: auditCleanupLogs.status,
        errorMessage: auditCleanupLogs.errorMessage,
        duration: sql<number>`extract(epoch from (job_end_time - job_start_time))`,
      })
      .from(auditCleanupLogs)
      .where(eq(auditCleanupLogs.organizationId, organizationId))
      .orderBy(sql`cleanup_date DESC`)
      .limit(limit);

    return history;
  } catch (error) {
    console.error('Failed to get organization cleanup history:', error);
    return [];
  }
}

/**
 * Check how many audit logs would be deleted for an organization without actually deleting
 * Useful for preview/estimation before running cleanup
 */
export async function estimateCleanupForOrganization(organizationId: string): Promise<{
  organizationName: string;
  retentionYears: number;
  cutoffDate: Date;
  estimatedDeletions: number;
  totalAuditLogs: number;
}> {
  try {
    // Get organization details
    const [org] = await db
      .select({
        name: organizations.name,
        metadata: organizations.metadata,
      })
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (!org) {
      throw new Error(`Organization ${organizationId} not found`);
    }

    const metadata = org.metadata as OrganizationWithMetadata['metadata'];
    const retentionYears = parseInt(metadata?.dataRetentionYears || '7');
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - retentionYears);

    // Count total audit logs for this organization
    const [totalCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs)
      .where(eq(auditLogs.organizationId, organizationId));

    // Count audit logs that would be deleted
    const [deletionCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.organizationId, organizationId),
          lt(auditLogs.createdAt, cutoffDate)
        )
      );

    return {
      organizationName: org.name,
      retentionYears,
      cutoffDate,
      estimatedDeletions: deletionCount?.count || 0,
      totalAuditLogs: totalCount?.count || 0,
    };

  } catch (error) {
    console.error('Failed to estimate cleanup:', error);
    throw error;
  }
}