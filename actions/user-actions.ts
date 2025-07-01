// actions/user-actions.ts
"use server";

import { requireSuperAdmin } from "@/lib/auth-server";
import { db } from "@/db";
import { users, members, organizations } from "@/db/schema";
import { eq, and, ilike, or, sql, gte, lte, desc, asc } from "drizzle-orm";
import { ListDataResult } from "@/types/list-page.types";
import { UserListItem, GetUsersListParams } from "@/types/user.types";
import { ServerActionResponse } from "@/types/server-actions.types";
import { generateId } from "better-auth";

/**
 * Get users list with filtering, sorting, and pagination
 * ✅ UPDATED: Returns clean ListDataResult structure following organizations pattern
 */
export async function getUsersList(params: GetUsersListParams): Promise<ListDataResult<UserListItem>> {
  try {
    console.log("📋 Starting getUsersList with params:", params);

    // Only super admins can list all users
    await requireSuperAdmin();

    // Build query conditions - Create fresh conditions array each time
    const buildConditions = () => {
      const conditions = [];
      
      if (params.search) {
        conditions.push(
          or(
            ilike(users.name, `%${params.search}%`),
            ilike(users.email, `%${params.search}%`)
          )
        );
      }

      if (params.role) {
        // Search by member role
        conditions.push(eq(members.role, params.role));
      }

      if (params.status === 'active') {
        // Active means user is not banned
        conditions.push(sql`(${users.banned} IS NULL OR ${users.banned} = false)`);
      } else if (params.status === 'banned') {
        // Banned means user is banned
        conditions.push(sql`${users.banned} = true`);
      }

      if (params.organization) {
        conditions.push(ilike(organizations.name, `%${params.organization}%`));
      }

      if (params.organizationType) {
        conditions.push(sql`(${organizations.metadata} ->> 'type') = ${params.organizationType}`);
      }

      if (params.createdAfter) {
        conditions.push(gte(users.createdAt, new Date(params.createdAfter)));
      }

      if (params.createdBefore) {
        conditions.push(lte(users.createdAt, new Date(params.createdBefore)));
      }

      if (params.lastLoginAfter) {
        conditions.push(gte(users.updatedAt, new Date(params.lastLoginAfter)));
      }

      if (params.lastLoginBefore) {
        conditions.push(lte(users.updatedAt, new Date(params.lastLoginBefore)));
      }

      return conditions.length > 0 ? and(...conditions) : undefined;
    };

    // Get total count with fresh query conditions
    const countWhereClause = buildConditions();
    const totalCountQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .leftJoin(members, eq(users.id, members.userId))
      .leftJoin(organizations, eq(members.organizationId, organizations.id));

    const [{ count: totalCount }] = countWhereClause
      ? await totalCountQuery.where(countWhereClause)
      : await totalCountQuery;

    // Get paginated results with fresh query conditions
    const dataWhereClause = buildConditions();
    const offset = (params.page - 1) * params.pageSize;
    
    const sortBy = params.sortBy || 'name';
    const sortDirection = params.sortDirection || 'asc';
    
    let orderClause;
    if (sortBy === 'name') {
      orderClause = sortDirection === 'asc' ? asc(users.name) : desc(users.name);
    } else if (sortBy === 'email') {
      orderClause = sortDirection === 'asc' ? asc(users.email) : desc(users.email);
    } else if (sortBy === 'role') {
      orderClause = sortDirection === 'asc' ? asc(members.role) : desc(members.role);
    } else if (sortBy === 'createdAt') {
      orderClause = sortDirection === 'asc' ? asc(users.createdAt) : desc(users.createdAt);
    } else {
      orderClause = asc(users.name); // Default fallback
    }

    const dataQuery = db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        role: members.role,
        organization: organizations.name,
        organizationType: sql<string>`(${organizations.metadata} ->> 'type')`,
        status: sql<string>`CASE WHEN ${users.banned} = true THEN 'banned' ELSE 'active' END`,
        lastLoginAt: users.updatedAt, // Using updatedAt as proxy for last login
        createdAt: users.createdAt,
        emailVerified: users.emailVerified,
      })
      .from(users)
      .leftJoin(members, eq(users.id, members.userId))
      .leftJoin(organizations, eq(members.organizationId, organizations.id))
      .orderBy(orderClause)
      .limit(params.pageSize)
      .offset(offset);

    const userData = dataWhereClause
      ? await dataQuery.where(dataWhereClause)
      : await dataQuery;

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / params.pageSize);

    const paginationData = {
      page: params.page,
      pageSize: params.pageSize,
      totalCount,
      totalPages,
      hasNextPage: params.page < totalPages,
      hasPreviousPage: params.page > 1,
    };

    console.log("✅ getUsersList completed:", {
      totalCount,
      pageSize: params.pageSize,
      currentPage: params.page,
      totalPages,
      dataLength: userData.length,
    });

    return {
      success: true,
      data: userData as UserListItem[],
      pagination: paginationData,
    };
  } catch (error) {
    console.error("❌ getUsersList error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch users",
      data: [],
      pagination: {
        page: params.page,
        pageSize: params.pageSize,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }
}

/**
 * Create a new user
 */
export async function createUser(userData: {
  name: string;
  email: string;
  role: string;
  organizationId?: string;
}): Promise<ServerActionResponse> {
  try {
    await requireSuperAdmin();

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, userData.email))
      .limit(1);

    if (existingUser.length > 0) {
      return {
        success: false,
        error: "User with this email already exists",
      };
    }

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        id: generateId(),
        name: userData.name,
        email: userData.email,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Create member record if organization provided
    if (userData.organizationId) {
      await db.insert(members).values({
        id: generateId(),
        userId: newUser.id,
        organizationId: userData.organizationId,
        role: userData.role,
        createdAt: new Date(),
      });
    }

    return {
      success: true,
      message: "User created successfully",
    };
  } catch (error) {
    console.error("❌ createUser error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create user",
    };
  }
}

/**
 * Update user information
 */
export async function updateUser(
  userId: string,
  userData: {
    name?: string;
    email?: string;
    role?: string;
  }
): Promise<ServerActionResponse> {
  try {
    await requireSuperAdmin();

    // Update user basic info
    if (userData.name || userData.email) {
      await db
        .update(users)
        .set({
          ...(userData.name && { name: userData.name }),
          ...(userData.email && { email: userData.email }),
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }

    // Update member role if provided
    if (userData.role) {
      await db
        .update(members)
        .set({
          role: userData.role,
        })
        .where(eq(members.userId, userId));
    }

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    console.error("❌ updateUser error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user",
    };
  }
}

/**
 * Ban a user
 */
export async function banUser(
  userId: string,
  reason?: string
): Promise<ServerActionResponse> {
  try {
    await requireSuperAdmin();

    await db
      .update(users)
      .set({
        banned: true,
        banReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return {
      success: true,
      message: "User banned successfully",
    };
  } catch (error) {
    console.error("❌ banUser error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to ban user",
    };
  }
}

/**
 * Unban a user
 */
export async function unbanUser(userId: string): Promise<ServerActionResponse> {
  try {
    await requireSuperAdmin();

    await db
      .update(users)
      .set({
        banned: false,
        banReason: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return {
      success: true,
      message: "User unbanned successfully",
    };
  } catch (error) {
    console.error("❌ unbanUser error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to unban user",
    };
  }
}

/**
 * Impersonate a user (Super admin only)
 */
export async function impersonateUser(userId: string): Promise<ServerActionResponse> {
  try {
    await requireSuperAdmin();

    // This would integrate with your auth system's impersonation functionality
    // The actual implementation would depend on your auth setup
    
    console.log(`Impersonating user ${userId}`);
    
    return {
      success: true,
      message: "User impersonation started",
    };
  } catch (error) {
    console.error("❌ impersonateUser error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to impersonate user",
    };
  }
}