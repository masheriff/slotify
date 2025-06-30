// actions/member-actions.ts
"use server";

import { requireSuperAdmin } from "@/lib/auth-server";
import { db } from "@/db";
import { members, users, organizations, invitations } from "@/db/schema";
import { eq, and, ilike, or, sql, gte, desc, asc } from "drizzle-orm";
import { ListDataResult } from "@/types/list-page.types"; // ✅ Use updated import
import { MemberListItem } from "@/types/member.types";
import { ServerActionResponse } from "@/types/server-actions.types";

/**
 * List members for a specific organization
 * ✅ UPDATED: Returns clean ListDataResult structure
 */
export async function getMembersList(params: {
  organizationId: string;
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  role?: string;
  status?: string;
  joinedAfter?: string;
}): Promise<ListDataResult<MemberListItem>> {
  try {
    console.log("📋 Starting getMembersList with params:", params);

    // Only super admins can list members
    await requireSuperAdmin();

    // Build query conditions - Create fresh conditions array each time
    const buildConditions = () => {
      const conditions = [];
      
      // Always filter by organization
      conditions.push(eq(members.organizationId, params.organizationId));
      
      if (params.search) {
        conditions.push(
          or(
            ilike(users.name, `%${params.search}%`),
            ilike(users.email, `%${params.search}%`)
          )
        );
      }

      if (params.role) {
        conditions.push(eq(members.role, params.role));
      }

      if (params.status === 'active') {
        // Active means user is not banned
        conditions.push(sql`(${users.banned} IS NULL OR ${users.banned} = false)`);
      } else if (params.status === 'inactive') {
        // Inactive means user is banned
        conditions.push(sql`${users.banned} = true`);
      }

      if (params.joinedAfter) {
        conditions.push(gte(members.createdAt, new Date(params.joinedAfter)));
      }

      return conditions.length > 0 ? and(...conditions) : undefined;
    };

    // Get total count with fresh query conditions
    const countWhereClause = buildConditions();
    const totalCountQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(members)
      .leftJoin(users, eq(members.userId, users.id));

    const [{ count: totalCount }] = countWhereClause
      ? await totalCountQuery.where(countWhereClause)
      : await totalCountQuery;

    // Get paginated results with fresh query conditions
    const dataWhereClause = buildConditions();
    const offset = (params.page - 1) * params.pageSize;
    
    const sortBy = params.sortBy || 'createdAt';
    const sortDirection = params.sortDirection || 'desc';
    
    let orderClause;
    if (sortBy === 'user.name') {
      orderClause = sortDirection === 'asc' ? asc(users.name) : desc(users.name);
    } else if (sortBy === 'user.email') {
      orderClause = sortDirection === 'asc' ? asc(users.email) : desc(users.email);
    } else if (sortBy === 'role') {
      orderClause = sortDirection === 'asc' ? asc(members.role) : desc(members.role);
    } else {
      orderClause = sortDirection === 'asc' ? asc(members.createdAt) : desc(members.createdAt);
    }

    // Build main query
    const mainQuery = db
      .select({
        id: members.id,
        userId: members.userId,
        organizationId: members.organizationId,
        role: members.role,
        createdAt: members.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
          emailVerified: users.emailVerified,
          createdAt: users.createdAt,
        },
      })
      .from(members)
      .leftJoin(users, eq(members.userId, users.id))
      .limit(params.pageSize)
      .offset(offset)
      .orderBy(orderClause);

    // Execute query with or without where clause
    const data = dataWhereClause
      ? await mainQuery.where(dataWhereClause)
      : await mainQuery;

    const totalPages = Math.ceil(totalCount / params.pageSize);

    console.log(`✅ Listed ${data.length} members for organization ${params.organizationId}`);

    // Ensure user is not null for MemberListItem[]
    const filteredData = data.filter(item => item.user !== null) as MemberListItem[];

    // ✅ UPDATED: Return clean flat structure
    return {
      success: true,
      data: filteredData,  // ✅ Direct array, no nesting
      pagination: {
        page: params.page,
        pageSize: params.pageSize,
        totalCount,
        totalPages,
        hasNextPage: params.page < totalPages,
        hasPreviousPage: params.page > 1,
      },
    };
    
  } catch (error) {
    console.error("❌ Error listing organization members:", error);
    return {
      success: false,
      data: [],  // ✅ Always return array
      pagination: {
        page: params.page,
        pageSize: params.pageSize,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      error: error instanceof Error ? error.message : "Failed to list organization members",
    };
  }
}

/**
 * Remove member from organization
 */
export async function removeMemberFromOrganization(
  memberId: string
): Promise<ServerActionResponse> {
  try {
    console.log("🗑️ Removing member from organization:", memberId);

    // Only super admins can remove members
    await requireSuperAdmin();

    const [deletedMember] = await db
      .delete(members)
      .where(eq(members.id, memberId))
      .returning({ id: members.id, userId: members.userId, organizationId: members.organizationId });

    if (!deletedMember) {
      return {
        success: false,
        error: "Member not found or already removed",
      };
    }

    console.log("✅ Member removed successfully:", deletedMember);
    
    return {
      success: true,
      data: deletedMember,
      message: "Member removed successfully",
    };
    
  } catch (error) {
    console.error("❌ Error removing member:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove member",
    };
  }
}

/**
 * Get member details with user information
 */
export async function getMemberById(memberId: string): Promise<ServerActionResponse> {
  try {
    console.log("🔍 Getting member by ID:", memberId);

    // Only super admins can get member details
    await requireSuperAdmin();

    const result = await db
      .select({
        id: members.id,
        userId: members.userId,
        organizationId: members.organizationId,
        role: members.role,
        createdAt: members.createdAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          image: users.image,
          emailVerified: users.emailVerified,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          banned: users.banned,
          banReason: users.banReason,
          banExpires: users.banExpires,
        },
        organization: {
          id: organizations.id,
          name: organizations.name,
          slug: organizations.slug,
        },
      })
      .from(members)
      .leftJoin(users, eq(members.userId, users.id))
      .leftJoin(organizations, eq(members.organizationId, organizations.id))
      .where(eq(members.id, memberId))
      .limit(1);

    if (!result[0]) {
      return {
        success: false,
        error: "Member not found",
      };
    }

    console.log("✅ Member found:", result[0]);

    return {
      success: true,
      data: result[0],
    };
    
  } catch (error) {
    console.error("❌ Error getting member by ID:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get member details",
    };
  }
}

/**
 * Update member role in organization
 */
export async function updateMemberRole(
  memberId: string,
  newRole: string
): Promise<ServerActionResponse> {
  try {
    console.log("✏️ Updating member role:", { memberId, newRole });

    // Only super admins can update member roles
    await requireSuperAdmin();

    // Validate the role
    const validRoles = [
      "system_admin",
      "five_am_admin", 
      "five_am_agent",
      "client_admin",
      "front_desk",
      "technician",
      "interpreting_doctor",
    ];

    if (!validRoles.includes(newRole)) {
      return {
        success: false,
        error: "Invalid role specified",
      };
    }

    // Get the current member to verify it exists
    const [currentMember] = await db
      .select()
      .from(members)
      .where(eq(members.id, memberId))
      .limit(1);

    if (!currentMember) {
      return {
        success: false,
        error: "Member not found",
      };
    }

    // Update the member role (no updatedAt in your schema)
    const [updatedMember] = await db
      .update(members)
      .set({ 
        role: newRole
      })
      .where(eq(members.id, memberId))
      .returning();

    if (!updatedMember) {
      return {
        success: false,
        error: "Failed to update member role",
      };
    }

    console.log("✅ Member role updated successfully:", updatedMember);

    return {
      success: true,
      data: updatedMember,
      message: "Member role updated successfully",
    };
    
  } catch (error) {
    console.error("❌ Error updating member role:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update member role",
    };
  }
}

/**
 * Invite user to organization (using Better Auth)
 */
export async function inviteUserToOrganization(
  organizationId: string,
  email: string,
  role: string,
  name?: string
): Promise<ServerActionResponse> {
  try {
    console.log("📧 Inviting user to organization:", { organizationId, email, role });

    // Only super admins can invite users
    await requireSuperAdmin();

    // Validate the role
    const validRoles = [
      "system_admin",
      "five_am_admin", 
      "five_am_agent",
      "client_admin",
      "front_desk",
      "technician",
      "interpreting_doctor",
    ];

    if (!validRoles.includes(role)) {
      return {
        success: false,
        error: "Invalid role specified",
      };
    }

    // Check if organization exists
    const [organization] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (!organization) {
      return {
        success: false,
        error: "Organization not found",
      };
    }

    // Check if user is already a member
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      const existingMember = await db
        .select()
        .from(members)
        .where(
          and(
            eq(members.userId, existingUser[0].id),
            eq(members.organizationId, organizationId)
          )
        )
        .limit(1);

      if (existingMember.length > 0) {
        return {
          success: false,
          error: "User is already a member of this organization",
        };
      }
    }

    // Create invitation using Better Auth patterns
    // For now, we'll use direct database insertion
    // In a real implementation, you'd use Better Auth's invitation system
    
    const invitationId = crypto.randomUUID();
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const [invitation] = await db
      .insert(invitations)
      .values({
        id: invitationId,
        organizationId,
        email,
        role,
        expiresAt,
        inviterId: "system", // You might want to get this from the current user
        status: "pending",
      })
      .returning();

    console.log("✅ Invitation created:", invitation);

    // TODO: Send invitation email using your email service
    // await sendInvitationEmail(email, organization.name, token);

    return {
      success: true,
      data: invitation,
      message: "Invitation sent successfully",
    };
    
  } catch (error) {
    console.error("❌ Error inviting user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send invitation",
    };
  }
}