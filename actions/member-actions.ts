// actions/member-actions.ts
"use server";

import { requireSuperAdmin } from "@/lib/auth-server";
import { db } from "@/db";
import { members, users, organizations } from "@/db/schema";
import { eq, and, ilike, or, sql, gte, desc, asc } from "drizzle-orm";
import { ListDataResult } from "@/lib/list-page-server";
import { MemberListItem } from "@/types/member.types";
import { ServerActionResponse } from "@/types/server-actions.types";

/**
 * List members for a specific organization
 * Returns ListDataResult structure to match logListPageMetrics expected format
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

    // Build whereClause properly for Drizzle
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ count: totalCount }] = whereClause
      ? await db
          .select({ count: sql<number>`count(*)` })
          .from(members)
          .leftJoin(users, eq(members.userId, users.id))
          .where(whereClause)
      : await db
          .select({ count: sql<number>`count(*)` })
          .from(members)
          .leftJoin(users, eq(members.userId, users.id));

    // Get paginated results
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

    const data = whereClause
      ? await db
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
          .where(whereClause)
          .limit(params.pageSize)
          .offset(offset)
          .orderBy(orderClause)
      : await db
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

    const totalPages = Math.ceil(totalCount / params.pageSize);

    console.log(`✅ Listed ${data.length} members for organization ${params.organizationId}`);

    // Ensure user is not null for MemberListItem[]
    const filteredData = data.filter(item => item.user !== null) as MemberListItem[];

    return {
      success: true,
      data: {
        data: filteredData,
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
      error: error instanceof Error ? error.message : "Failed to list organization members",
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
      error: error instanceof Error ? error.message : "Failed to get member",
    };
  }
}

/**
 * Update member role
 */
export async function updateMemberRole(
  memberId: string,
  role: string
): Promise<ServerActionResponse> {
  try {
    console.log("🔄 Updating member role:", { memberId, role });

    // Only super admins can update member roles
    await requireSuperAdmin();

    const [updatedMember] = await db
      .update(members)
      .set({ role })
      .where(eq(members.id, memberId))
      .returning({ id: members.id, role: members.role });

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