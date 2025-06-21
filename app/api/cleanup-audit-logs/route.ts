// app/api/admin/cleanup-audit-logs/route.ts
import { requireSuperAdmin } from '@/lib/auth-server';
import { runAuditCleanupNow, getCleanupStats } from '@/lib/jobs/audit-cleanup';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    await requireSuperAdmin();
    
    const body = await request.json().catch(() => ({}));
    const { organizationId } = body;
    
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

export async function GET() {
  try {
    await requireSuperAdmin();
    
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