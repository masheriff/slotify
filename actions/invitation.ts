// actions/invitation.ts - FIXED with system admin bypass
"use server";
import { auth } from "@/lib/auth";
import { requireOrgAdmin, getServerSession } from "@/lib/auth-server";
import { isSuperAdmin } from "@/lib/permissions/healthcare-access-control";
import { db } from "@/db";
import { invitations } from "@/db/schema";
import { eq } from "drizzle-orm";

// Define PaginationParams type if not imported from elsewhere
type PaginationParams = {
  page: number;
  pageSize: number;
};

export async function getOrganizationInvitations(
  organizationId: string, 
  params: PaginationParams
) {
  try {
    // Check authentication first
    const session = await getServerSession();
    if (!session?.user) {
      throw new Error("Authentication required");
    }

    const user = session.user;

    // FIXED: For system admins, query database directly to bypass Better Auth's membership checks
    if (isSuperAdmin(user.role ?? "")) {
      console.log("✅ System admin detected - querying invitations directly");
      
      const orgInvitations = await db
        .select()
        .from(invitations)
        .where(eq(invitations.organizationId, organizationId));

      return {
        data: orgInvitations,
        totalCount: orgInvitations.length,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.ceil(orgInvitations.length / params.pageSize)
      };
    }

    // For non-system admins, use the requireOrgAdmin check (which now properly handles system admins)
    await requireOrgAdmin(organizationId);
    
    // Use Better Auth's organization API to list invitations
    const invitationsList = await auth.api.listInvitations({
      query: {
        organizationId,
      }
    });

    return {
      data: invitationsList,
      totalCount: invitationsList.length,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(invitationsList.length / params.pageSize)
    };
  } catch (error) {
    console.error("❌ Error fetching invitations:", error);
    throw new Error("Failed to fetch invitations");
  }
}

export async function cancelInvitation(invitationId: string) {
  try {
    // Check authentication first
    const session = await getServerSession();
    if (!session?.user) {
      return {
        success: false,
        error: "Authentication required"
      };
    }

    const user = session.user;

    // FIXED: For system admins, delete from database directly to bypass Better Auth's membership checks
    if (isSuperAdmin(user.role ?? "")) {
      console.log("✅ System admin detected - canceling invitation directly");
      
      await db
        .delete(invitations)
        .where(eq(invitations.id, invitationId));

      return { success: true };
    }

    // For non-system admins, use Better Auth API
    await auth.api.cancelInvitation({
      body: { invitationId }
    });
    
    return { success: true };
  } catch (error) {
    console.error("❌ Error canceling invitation:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to cancel invitation" 
    };
  }
}