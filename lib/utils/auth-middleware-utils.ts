import { db } from "@/db";
import { members, organizations, users } from "@/db/schema";
import { OrganizationMetadata } from "@/types";
import { eq } from "drizzle-orm";
import { HEALTHCARE_ROLES } from "../permissions/healthcare-permissions-constants";

/**
 * Helper function to check if user has any active organization
 */
export async function checkUserHasActiveOrganization(email: string): Promise<boolean> {
  try {
    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      // If user doesn't exist, let the auth flow handle it (signup disabled anyway)
      return true;
    }

    // Get user's organization memberships
    const userMemberships = await db
      .select({
        organizationId: members.organizationId,
        role: members.role,
        organization: organizations,
      })
      .from(members)
      .leftJoin(organizations, eq(members.organizationId, organizations.id))
      .where(eq(members.userId, user.id));

    if (userMemberships.length === 0) {
      // User has no organization memberships
      return false;
    }

    // Check if user has at least one active organization
    const hasActiveOrganization = userMemberships.some((membership) => {
      if (!membership.organization) return false;
      
      const metadata = membership.organization.metadata as OrganizationMetadata;
      
      // System admins can access even if their organization is inactive
      // (in case they need to reactivate organizations)
      if (membership.role === HEALTHCARE_ROLES.SYSTEM_ADMIN) {
        return true;
      }
      
      return metadata?.isActive === true;
    });

    return hasActiveOrganization;
  } catch (error) {
    console.error("Error checking user organization status:", error);
    // On error, allow login to avoid blocking legitimate users
    return true;
  }
}

/**
 * Helper function to get user's organization info for logging
 */
export async function getUserOrganizationInfo(email: string): Promise<{
  userId: string | null;
  organizationNames: string[];
  activeOrganizations: number;
}> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return { userId: null, organizationNames: [], activeOrganizations: 0 };
    }

    const userMemberships = await db
      .select({
        organization: organizations,
      })
      .from(members)
      .leftJoin(organizations, eq(members.organizationId, organizations.id))
      .where(eq(members.userId, user.id));

    const organizationNames = userMemberships
      .map(m => m.organization?.name)
      .filter(Boolean) as string[];

    const activeOrganizations = userMemberships.filter(membership => {
      if (!membership.organization) return false;
      const metadata = membership.organization.metadata as OrganizationMetadata;
      return metadata?.isActive === true;
    }).length;

    return {
      userId: user.id,
      organizationNames,
      activeOrganizations,
    };
  } catch (error) {
    console.error("Error getting user organization info:", error);
    return { userId: null, organizationNames: [], activeOrganizations: 0 };
  }
}
