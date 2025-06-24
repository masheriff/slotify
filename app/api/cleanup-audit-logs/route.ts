// app/api/admin/cleanup-audit-logs/route.ts
import { requireSuperAdmin } from '@/lib/auth-server';
import { 
  runAuditCleanupNow, 
  getCleanupStats, 
  getOrganizationCleanupHistory,
  estimateCleanupForOrganization 
} from '@/lib/jobs/audit-cleanup';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin();
    
    const body = await request.json().catch(() => ({}));
    const { organizationId, preview = false } = body;
    
    // If preview mode, return estimation without deleting
    if (preview && organizationId) {
      try {
        const estimation = await estimateCleanupForOrganization(organizationId);
        return NextResponse.json({
          success: true,
          preview: true,
          data: estimation,
        });
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: error instanceof Error ? error.message : 'Failed to estimate cleanup',
        }, { status: 500 });
      }
    }
    
    console.log('🔧 Manual audit cleanup triggered by admin');
    
    const result = await runAuditCleanupNow(organizationId);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully deleted ${result.deletedCount} audit log entries`,
        deletedCount: result.deletedCount,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Manual cleanup API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Unauthorized or server error',
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin();
    
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const action = searchParams.get('action');
    
    // Get organization-specific cleanup history
    if (action === 'history' && organizationId) {
      const limit = parseInt(searchParams.get('limit') || '10');
      const history = await getOrganizationCleanupHistory(organizationId, limit);
      
      return NextResponse.json({
        success: true,
        data: history,
      });
    }
    
    // Get overall cleanup statistics
    const stats = await getCleanupStats();
    
    return NextResponse.json({
      success: true,
      data: stats,
    });
    
  } catch (error) {
    console.error('Cleanup stats API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Unauthorized or server error',
    }, { status: 500 });
  }
}