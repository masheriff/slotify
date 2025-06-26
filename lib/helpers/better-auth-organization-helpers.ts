// lib/helpers/better-auth-organization-helpers.ts
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { organizations, members } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { HEALTHCARE_ROLES } from '@/lib/permissions/healthcare-permissions-constants';
import { headers } from 'next/headers';
import { OrganizationMetadata } from '@/types';

/**
 * Get organization with typed metadata
 */
export async function getOrganizationWithMetadata(organizationId: string) {
  try {
    const [organization] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (!organization) {
      return null;
    }

    return {
      ...organization,
      metadata: organization.metadata as OrganizationMetadata,
    };
  } catch (error) {
    console.error('Failed to get organization:', error);
    return null;
  }
}

/**
 * Check if organization is active
 */
export async function isOrganizationActive(organizationId: string): Promise<boolean> {
  try {
    const org = await getOrganizationWithMetadata(organizationId);
    return org?.metadata?.isActive === true;
  } catch (error) {
    console.error('Failed to check organization status:', error);
    return false;
  }
}

/**
 * Get organization's data retention policy
 */
export async function getOrganizationRetentionYears(organizationId: string): Promise<number> {
  try {
    const org = await getOrganizationWithMetadata(organizationId);
    return parseInt(org?.metadata?.dataRetentionYears || '7');
  } catch (error) {
    console.error('Failed to get retention policy:', error);
    return 7; // Default fallback
  }
}

/**
 * Get all active organizations with their metadata
 */
export async function getActiveOrganizations() {
  try {
    const allOrgs = await db.select().from(organizations);
    
    return allOrgs.filter(org => {
      const metadata = org.metadata as OrganizationMetadata;
      return metadata?.isActive === true;
    }).map(org => ({
      ...org,
      metadata: org.metadata as OrganizationMetadata,
    }));
  } catch (error) {
    console.error('Failed to get active organizations:', error);
    return [];
  }
}

/**
 * Check user's role in organization using Better Auth
 */
export async function getUserRoleInOrganization(userId: string, organizationId: string): Promise<string | null> {
  try {
    // Use Better Auth to check membership
    const hasPermission = await auth.api.hasPermission({
      body: {
        permission: { organization: ['update'] }, // Basic permission check
        organizationId,
      },
      headers: await headers(), // You may need to pass proper headers with user session
    });

    if (!hasPermission) {
      return null;
    }

    // Get the actual role from members table
    const [member] = await db
      .select()
      .from(members)
      .where(
        and(
          eq(members.userId, userId),
          eq(members.organizationId, organizationId)
        )
      )
      .limit(1);

    return member?.role || null;
  } catch (error) {
    console.error('Failed to get user role:', error);
    return null;
  }
}

/**
 * Check if user is admin in any organization
 */
export async function isUserAdminAnywhere(userId: string): Promise<boolean> {
  try {
    const userMemberships = await db
      .select()
      .from(members)
      .where(eq(members.userId, userId));

    return userMemberships.some(membership => 
      [
        HEALTHCARE_ROLES.SYSTEM_ADMIN,
        HEALTHCARE_ROLES.FIVE_AM_ADMIN,
        HEALTHCARE_ROLES.CLIENT_ADMIN
      ].includes(membership.role as typeof HEALTHCARE_ROLES.SYSTEM_ADMIN | typeof HEALTHCARE_ROLES.FIVE_AM_ADMIN | typeof HEALTHCARE_ROLES.CLIENT_ADMIN)
    );
  } catch (error) {
    console.error('Failed to check admin status:', error);
    return false;
  }
}

/**
 * Get organizations user can access based on role
 */
export async function getUserAccessibleOrganizations(userId: string) {
  try {
    const userMemberships = await db
      .select({
        organizationId: members.organizationId,
        role: members.role,
        organization: organizations,
      })
      .from(members)
      .leftJoin(organizations, eq(members.organizationId, organizations.id))
      .where(eq(members.userId, userId));

    const accessibleOrgs = [];

    for (const membership of userMemberships) {
      if (!membership.organization) continue;

      const metadata = membership.organization.metadata as OrganizationMetadata;
      
      // Skip inactive organizations
      if (metadata?.isActive !== true) continue;

      const orgWithTypedMetadata = {
        ...membership.organization,
        metadata,
        userRole: membership.role,
      };

      // System admins and 5AM admins can access all organizations
      if (
        [HEALTHCARE_ROLES.SYSTEM_ADMIN, HEALTHCARE_ROLES.FIVE_AM_ADMIN].includes(
          membership.role as typeof HEALTHCARE_ROLES.SYSTEM_ADMIN | typeof HEALTHCARE_ROLES.FIVE_AM_ADMIN
        )
      ) {
        // Get all active organizations for these roles
        const allActiveOrgs = await getActiveOrganizations();
        return allActiveOrgs.map(org => ({
          ...org,
          userRole: membership.role,
        }));
      }

      // Agents can access organizations they're assigned to
      if (membership.role === HEALTHCARE_ROLES.FIVE_AM_AGENT) {
        // TODO: Check agent organization assignments table if you have one
        // For now, include the organization they're a member of
        accessibleOrgs.push(orgWithTypedMetadata);
      }

      // Other roles can access their own organization
      accessibleOrgs.push(orgWithTypedMetadata);
    }

    return accessibleOrgs;
  } catch (error) {
    console.error('Failed to get accessible organizations:', error);
    return [];
  }
}

/**
 * Update organization metadata
 */
export async function updateOrganizationMetadata(
  organizationId: string, 
  updates: Partial<OrganizationMetadata>
) {
  try {
    // Get current organization
    const org = await getOrganizationWithMetadata(organizationId);
    if (!org) {
      throw new Error('Organization not found');
    }

    // Merge updates with existing metadata
    const updatedMetadata = {
      ...org.metadata,
      ...updates,
    };

    // Update in database
    await db
      .update(organizations)
      .set({
        metadata: updatedMetadata,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, organizationId));

    return true;
  } catch (error) {
    console.error('Failed to update organization metadata:', error);
    return false;
  }
}

/**
 * Set organization active/inactive status
 */
export async function setOrganizationStatus(organizationId: string, isActive: boolean) {
  return updateOrganizationMetadata(organizationId, { isActive });
}

/**
 * Update organization data retention policy
 */
export async function updateDataRetentionPolicy(organizationId: string, retentionYears: string) {
  return updateOrganizationMetadata(organizationId, { dataRetentionYears: retentionYears });
}