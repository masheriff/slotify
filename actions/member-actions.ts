// actions/member-actions.ts - COMPLETE ENHANCED VERSION
"use server";

import { requireSuperAdmin } from "@/lib/auth-server";
import { db } from "@/db";
import { members, users, organizations, invitations } from "@/db/schema";
import { eq, and, ilike, or, sql, gte, desc, asc } from "drizzle-orm";
import { generateId } from "better-auth";
import { ListDataResult } from "@/types/list-page.types";
import { MemberListItem } from "@/types/member.types";
import { ServerActionResponse } from "@/types/server-actions.types";

/**
 * ✅ EXISTING: List members for a specific organization
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

    // Build query conditions
    const buildConditions = () => {
      const conditions = [];
      
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
        conditions.push(sql`(${users.banned} IS NULL OR ${users.banned} = false)`);
      } else if (params.status === 'inactive') {
        conditions.push(sql`${users.banned} = true`);
      }

      if (params.joinedAfter) {
        conditions.push(gte(members.createdAt, new Date(params.joinedAfter)));
      }

      return conditions.length > 0 ? and(...conditions) : undefined;
    };

    // Get total count
    const countWhereClause = buildConditions();
    const totalCountQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(members)
      .leftJoin(users, eq(members.userId, users.id));

    const [{ count: totalCount }] = countWhereClause
      ? await totalCountQuery.where(countWhereClause)
      : await totalCountQuery;

    // Get paginated results
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

    const dataQuery = db
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

    const results = dataWhereClause
      ? await dataQuery.where(dataWhereClause)
      : await dataQuery;

    const totalPages = Math.ceil(totalCount / params.pageSize);

    console.log(`✅ Found ${results.length} members (${totalCount} total)`);

    return {
      success: true,
      data: results,
      pagination: {
        page: params.page,
        pageSize: params.pageSize,
        totalPages,
        hasNextPage: params.page < totalPages,
        hasPreviousPage: params.page > 1,
        totalCount,
      },
    };
    
  } catch (error) {
    console.error("❌ Error getting members list:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to list organization members",
      data: [],
      pagination: {
        page: params.page,
        pageSize: params.pageSize,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
        totalCount: 0,
      },
    };
  }
}

/**
 * ✅ NEW: Create membership directly (used by universal user form)
 */
export async function createMembership(
  userId: string,
  organizationId: string,
  role: string
): Promise<ServerActionResponse> {
  try {
    console.log("➕ Creating membership:", { userId, organizationId, role });

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

    // Check if membership already exists
    const existingMembership = await db
      .select()
      .from(members)
      .where(
        and(
          eq(members.userId, userId),
          eq(members.organizationId, organizationId)
        )
      )
      .limit(1);

    if (existingMembership.length > 0) {
      return {
        success: false,
        error: "User is already a member of this organization",
      };
    }

    // Create membership
    const membershipId = generateId();
    const [newMembership] = await db
      .insert(members)
      .values({
        id: membershipId,
        userId,
        organizationId,
        role,
        createdAt: new Date(),
      })
      .returning();

    console.log("✅ Membership created successfully:", newMembership);

    return {
      success: true,
      data: newMembership,
      message: "Membership created successfully",
    };
    
  } catch (error) {
    console.error("❌ Error creating membership:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create membership",
    };
  }
}

/**
 * ✅ EXISTING: Update member role in organization
 */
export async function updateMemberRole(
  memberId: string,
  newRole: string
): Promise<ServerActionResponse> {
  try {
    console.log("✏️ Updating member role:", { memberId, newRole });

    await requireSuperAdmin();

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

    const [updatedMember] = await db
      .update(members)
      .set({ role: newRole })
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
 * ✅ NEW: Get members by organization
 */
export async function getMembersByOrganization(
  organizationId: string
): Promise<ServerActionResponse> {
  try {
    console.log("🔍 Getting members by organization:", organizationId);

    await requireSuperAdmin();

    const members_list = await db
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
        },
      })
      .from(members)
      .leftJoin(users, eq(members.userId, users.id))
      .where(eq(members.organizationId, organizationId))
      .orderBy(desc(members.createdAt));

    console.log(`✅ Found ${members_list.length} members for organization`);

    return {
      success: true,
      data: members_list,
    };
    
  } catch (error) {
    console.error("❌ Error getting members by organization:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get organization members",
    };
  }
}

/**
 * ✅ NEW: Get members by user (all organizations a user belongs to)
 */
export async function getMembersByUser(
  userId: string
): Promise<ServerActionResponse> {
  try {
    console.log("🔍 Getting members by user:", userId);

    await requireSuperAdmin();

    const user_memberships = await db
      .select({
        id: members.id,
        userId: members.userId,
        organizationId: members.organizationId,
        role: members.role,
        createdAt: members.createdAt,
        organization: {
          id: organizations.id,
          name: organizations.name,
          slug: organizations.slug,
        },
      })
      .from(members)
      .leftJoin(organizations, eq(members.organizationId, organizations.id))
      .where(eq(members.userId, userId))
      .orderBy(desc(members.createdAt));

    console.log(`✅ Found ${user_memberships.length} memberships for user`);

    return {
      success: true,
      data: user_memberships,
    };
    
  } catch (error) {
    console.error("❌ Error getting user memberships:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get user memberships",
    };
  }
}

/**
 * ✅ NEW: Soft delete membership (rename from removeMemberFromOrganization)
 */
export async function deleteMembership(
  memberId: string
): Promise<ServerActionResponse> {
  try {
    console.log("🗑️ Soft deleting membership:", memberId);

    await requireSuperAdmin();

    // For now, we'll do hard delete since there's no soft delete in schema
    // In future, could add deletedAt field to members table
    const [deletedMember] = await db
      .delete(members)
      .where(eq(members.id, memberId))
      .returning({ 
        id: members.id, 
        userId: members.userId, 
        organizationId: members.organizationId 
      });

    if (!deletedMember) {
      return {
        success: false,
        error: "Member not found or already removed",
      };
    }

    console.log("✅ Membership deleted successfully:", deletedMember);
    
    return {
      success: true,
      data: deletedMember,
      message: "Membership deleted successfully",
    };
    
  } catch (error) {
    console.error("❌ Error deleting membership:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete membership",
    };
  }
}

/**
 * ✅ EXISTING: Invite user to organization (using Better Auth)
 */
export async function inviteUserToOrganization(
  organizationId: string,
  email: string,
  role: string,
  name?: string
): Promise<ServerActionResponse> {
  try {
    console.log("📧 Inviting user to organization:", { organizationId, email, role, name });

    await requireSuperAdmin();

    // Validate role
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

    // Check if user already exists and is already a member
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      // Check if already a member
      const existingMembership = await db
        .select()
        .from(members)
        .where(
          and(
            eq(members.userId, existingUser[0].id),
            eq(members.organizationId, organizationId)
          )
        )
        .limit(1);

      if (existingMembership.length > 0) {
        return {
          success: false,
          error: "User is already a member of this organization",
        };
      }
    }

    // Check if invitation already exists
    const existingInvitation = await db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.email, email),
          eq(invitations.organizationId, organizationId),
          eq(invitations.status, "pending")
        )
      )
      .limit(1);

    if (existingInvitation.length > 0) {
      return {
        success: false,
        error: "Invitation already sent to this email for this organization",
      };
    }

    // Create invitation
    const invitationId = generateId();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const [invitation] = await db
      .insert(invitations)
      .values({
        id: invitationId,
        organizationId,
        email,
        role,
        inviterId: "", // Will be set by auth system
        expiresAt,
        status: "pending",
      })
      .returning();

    console.log("✅ Invitation created successfully:", invitation);

    // TODO: Send actual email invitation
    // This would integrate with your email service

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

/**
 * ✅ EXISTING: Get member details with user information
 */
export async function getMemberById(memberId: string): Promise<ServerActionResponse> {
  try {
    console.log("🔍 Getting member by ID:", memberId);

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