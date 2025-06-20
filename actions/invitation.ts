"use server";
import { auth } from "@/lib/auth";
import { requireOrgAdmin } from "@/lib/auth-server";

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
    await requireOrgAdmin(organizationId);
    
    // Use Better Auth's organization API to list invitations
    const invitations = await auth.api.listInvitations({
      query: {
        organizationId,
      }
    });

    return {
      data: invitations,
      totalCount: invitations.length,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(invitations.length / params.pageSize)
    };
  } catch (error) {
    throw new Error("Failed to fetch invitations");
  }
}

export async function cancelInvitation(invitationId: string) {
  try {
    // Better Auth handles invitation cancellation
    await auth.api.cancelInvitation({
      body: { invitationId }
    });
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to cancel invitation" 
    };
  }
}
