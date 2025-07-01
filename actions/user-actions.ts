// actions/user-actions.ts - User management server actions
"use server";

import { requireSuperAdmin, requireAuth } from "@/lib/auth-server";
import { db } from "@/db";
import { users, members, organizations, technicians, interpretingDoctors } from "@/db/schema";
import { eq, and, ilike, or, sql, gte, lte, desc, asc, inArray } from "drizzle-orm";
import { generateId } from "better-auth";
import { revalidatePath } from "next/cache";

import { 
  createUserSchema, 
  updateUserSchema, 
  userSecurityUpdateSchema 
} from "@/schemas/user.schemas";
import { 
  UserDetails, 
  UserListItem, 
  GetUsersListParams, 
  CreateUserParams, 
  UpdateUserParams,
  BanUserParams,
  UnbanUserParams,
  GetUserByIdParams,
  UserCreationResult 
} from "@/types/user.types";
import { ListDataResult } from "@/types/list-page.types";
import { ServerActionResponse } from "@/types/server-actions.types";

/**
 * Get users list with filtering, sorting, and pagination
 * ✅ UPDATED: Returns clean ListDataResult structure following organizations pattern
 */
export async function getUsersList(params: GetUsersListParams): Promise<ListDataResult<UserListItem>> {
  try {
    console.log("📋 Starting getUsersList with params:", params);

    // Only super admins and 5AM admins can list all users
    const { user: currentUser } = await requireAuth();
    if (
      !(
        typeof currentUser.role === "string" &&
        ["system_admin", "five_am_admin"].includes(currentUser.role)
      )
    ) {
      return {
        success: false,
        error: "Insufficient permissions to view users",
        data: [],
        pagination: {
          page: 1,
          pageSize: 10,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          totalCount: 0,
        },
      };
    }

    // Build query conditions
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
        conditions.push(eq(members.role, params.role));
      }

      if (params.status === 'active') {
        conditions.push(sql`(${users.banned} IS NULL OR ${users.banned} = false)`);
      } else if (params.status === 'banned') {
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
      .select({ count: sql<number>`count(distinct ${users.id})` })
      .from(users)
      .leftJoin(members, eq(users.id, members.userId))
      .leftJoin(organizations, eq(members.organizationId, organizations.id));

    const [{ count: totalCount }] = countWhereClause
      ? await totalCountQuery.where(countWhereClause)
      : await totalCountQuery;

    // Calculate pagination
    const page = params.page || 1;
    const pageSize = Math.min(params.pageSize || 10, 100);
    const totalPages = Math.ceil(totalCount / pageSize);
    const offset = (page - 1) * pageSize;

    // Build sort order
    let orderBy;
    const sortBy = params.sortBy || "createdAt";
    const sortDirection = params.sortDirection || "desc";
    
    switch (sortBy) {
      case "name":
        orderBy = sortDirection === "asc" ? asc(users.name) : desc(users.name);
        break;
      case "email":
        orderBy = sortDirection === "asc" ? asc(users.email) : desc(users.email);
        break;
      case "role":
        orderBy = sortDirection === "asc" ? asc(members.role) : desc(members.role);
        break;
      case "updatedAt":
        orderBy = sortDirection === "asc" ? asc(users.updatedAt) : desc(users.updatedAt);
        break;
      default:
        orderBy = sortDirection === "asc" ? asc(users.createdAt) : desc(users.createdAt);
    }

    // Main query with pagination
    const dataWhereClause = buildConditions();
    
    // Query to get users with their primary membership info
    const usersWithMemberships = await db
      .select({
        // User fields
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        emailVerified: users.emailVerified,
        banned: users.banned,
        banReason: users.banReason,
        banExpires: users.banExpires,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        // Primary membership info
        primaryRole: members.role,
        primaryOrganizationId: members.organizationId,
        primaryOrganizationName: organizations.name,
      })
      .from(users)
      .leftJoin(members, eq(users.id, members.userId))
      .leftJoin(organizations, eq(members.organizationId, organizations.id))
      .where(dataWhereClause)
      .groupBy(users.id, members.role, members.organizationId, organizations.name)
      .orderBy(orderBy)
      .limit(pageSize)
      .offset(offset);

    // Get membership counts for each user
    const userIds = usersWithMemberships.map(u => u.id);
    const membershipCounts = userIds.length > 0 ? await db
      .select({
        userId: members.userId,
        count: sql<number>`count(*)`,
      })
      .from(members)
      .where(inArray(members.userId, userIds))
      .groupBy(members.userId) : [];

    const membershipCountMap = membershipCounts.reduce((acc, mc) => {
      acc[mc.userId] = mc.count;
      return acc;
    }, {} as Record<string, number>);

    // Transform to UserListItem format
    const data: UserListItem[] = usersWithMemberships.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      emailVerified: user.emailVerified,
      banned: user.banned,
      banReason: user.banReason,
      banExpires: user.banExpires,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      primaryRole: user.primaryRole || undefined,
      primaryOrganizationId: user.primaryOrganizationId || undefined,
      primaryOrganizationName: user.primaryOrganizationName || undefined,
      membershipCount: membershipCountMap[user.id] || 0,
    }));

    console.log(`✅ Found ${data.length} users (${totalCount} total)`);

    return {
      success: true,
      data,
      pagination: {
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        totalCount,
      },
    };
  } catch (error) {
    console.error("❌ [getUsersList] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch users",
      data: [],
      pagination: {
        page: 1,
        pageSize: 10,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
        totalCount: 0,
      },
    };
  }
}

/**
 * Get user by ID with all details including memberships and professional profiles
 */
export async function getUserById(params: GetUserByIdParams): Promise<ServerActionResponse<UserDetails>> {
  try {
    console.log("🔍 Getting user by ID:", params.userId);

    const { user: currentUser } = await requireAuth();
    
    // Get user basic info
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, params.userId));

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Get all memberships
    const memberships = await db
      .select({
        id: members.id,
        organizationId: members.organizationId,
        organizationName: organizations.name,
        organizationSlug: organizations.slug,
        role: members.role,
        createdAt: members.createdAt,
        isActive: sql<boolean>`true`, // Add logic for inactive memberships if needed
      })
      .from(members)
      .innerJoin(organizations, eq(members.organizationId, organizations.id))
      .where(eq(members.userId, params.userId));

    // Get technician profile if exists
    const [technicianProfile] = await db
      .select()
      .from(technicians)
      .where(eq(technicians.userId, params.userId));

    // Get interpreting doctor profile if exists
    const [interpretingDoctorProfile] = await db
      .select()
      .from(interpretingDoctors)
      .where(eq(interpretingDoctors.userId, params.userId));

    const userDetails: UserDetails = {
      ...user,
      memberships,
      technicianProfile: technicianProfile && technicianProfile.userId ? { ...technicianProfile, userId: technicianProfile.userId as string } : undefined,
      interpretingDoctorProfile: interpretingDoctorProfile && interpretingDoctorProfile.userId
        ? { ...interpretingDoctorProfile, userId: interpretingDoctorProfile.userId as string }
        : undefined,
    };

    console.log(`✅ Found user with ${memberships.length} memberships`);

    return {
      success: true,
      data: userDetails,
    };
  } catch (error) {
    console.error("❌ [getUserById] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch user",
    };
  }
}

/**
 * Create new user with optional professional profile
 */
export async function createUser(params: CreateUserParams): Promise<ServerActionResponse<UserCreationResult>> {
  try {
    console.log("🆕 Creating user:", params.userData);

    const { user: currentUser } = await requireAuth();
    
    // Validate input
    const validatedData = createUserSchema.parse(params.userData);

    // Check permissions based on current user role
    if (currentUser.role === "client_admin") {
      // Fetch current user's primary membership to get their organizationId
      const [currentMembership] = await db
        .select()
        .from(members)
        .where(eq(members.userId, currentUser.id));

      if (!currentMembership || validatedData.organizationId !== currentMembership.organizationId) {
        return {
          success: false,
          error: "Cannot create users in other organizations",
        };
      }
      
      // Client admins cannot create 5AM roles
      if (["system_admin", "five_am_admin", "five_am_agent"].includes(validatedData.role)) {
        return {
          success: false,
          error: "Cannot create 5AM Corp roles",
        };
      }
    }

    // Check if user with email already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email));

    let user;
    let isNewUser = false;

    if (existingUser) {
      user = existingUser;
      console.log("📧 User with email already exists, linking to organization");
    } else {
      // Create new user
      const userId = generateId();
      [user] = await db
        .insert(users)
        .values({
          id: userId,
          name: validatedData.name,
          email: validatedData.email,
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
      isNewUser = true;
      console.log("👤 Created new user");
    }

    // Create member record
    const memberId = generateId();
    const [member] = await db
      .insert(members)
      .values({
        id: memberId,
        userId: user.id,
        organizationId: validatedData.organizationId,
        role: validatedData.role,
        createdAt: new Date(),
      })
      .returning();

    console.log("🏢 Created member record");

    let professionalProfile;

    // Create professional profile if needed
    if (validatedData.role === "technician" && "professionalDetails" in validatedData) {
      const technicianId = generateId();
      [professionalProfile] = await db
        .insert(technicians)
        .values({
          id: technicianId,
          organizationId: validatedData.organizationId,
          userId: user.id,
          ...validatedData.professionalDetails,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: currentUser.id,
          updatedBy: currentUser.id,
        })
        .returning();
      console.log("🔧 Created technician profile");
    }

    if (validatedData.role === "interpreting_doctor" && "professionalDetails" in validatedData) {
      const doctorId = generateId();
      [professionalProfile] = await db
        .insert(interpretingDoctors)
        .values({
          id: doctorId,
          organizationId: validatedData.organizationId,
          userId: user.id,
          ...validatedData.professionalDetails,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          createdBy: currentUser.id,
          updatedBy: currentUser.id,
        })
        .returning();
      console.log("👨‍⚕️ Created interpreting doctor profile");
    }

    // TODO: Send invitation email if requested
    const invitationSent = false; // Implement invitation logic

    // Revalidate relevant paths
    revalidatePath("/5am-corp/admin/users");
    revalidatePath(`/5am-corp/admin/organizations/${validatedData.organizationId}/members`);

    return {
      success: true,
      data: {
        user,
        member: {
          id: member.id,
          organizationId: member.organizationId,
          organizationName: "", // Would need to fetch from organization
          organizationSlug: "",
          role: member.role,
          createdAt: member.createdAt,
          isActive: true,
        },
        professionalProfile: professionalProfile && professionalProfile.userId
          ? { ...professionalProfile, userId: professionalProfile.userId as string }
          : undefined,
        invitationSent,
      },
    };
  } catch (error) {
    console.error("❌ [createUser] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create user",
    };
  }
}

/**
 * Update user information
 */
export async function updateUser(params: UpdateUserParams): Promise<ServerActionResponse<UserDetails>> {
  try {
    console.log("✏️ Updating user:", params.userId);

    const { user: currentUser } = await requireAuth();

    // Get current user to check permissions
    const getUserResult = await getUserById({ userId: params.userId });
    if (!getUserResult.success || !getUserResult.data) {
      return {
        success: false,
        error: "User not found",
      };
    }

    const targetUser = getUserResult.data;

    // Check permissions
    // TODO: Implement proper permission checking based on current user role

    // Validate input
    const validatedData = updateUserSchema.parse({ id: params.userId, ...params.userData });

    // Update user record
    if (validatedData.name || validatedData.email) {
      await db
        .update(users)
        .set({
          name: validatedData.name,
          email: validatedData.email,
          updatedAt: new Date(),
        })
        .where(eq(users.id, params.userId));
      console.log("👤 Updated user basic info");
    }

    // Update professional profile if provided
    if ("professionalDetails" in validatedData && validatedData.professionalDetails) {
      if (validatedData.role === "technician") {
        await db
          .update(technicians)
          .set({
            ...validatedData.professionalDetails,
            updatedAt: new Date(),
            updatedBy: currentUser.id,
          })
          .where(eq(technicians.userId, params.userId));
        console.log("🔧 Updated technician profile");
      }

      if (validatedData.role === "interpreting_doctor") {
        await db
          .update(interpretingDoctors)
          .set({
            ...validatedData.professionalDetails,
            updatedAt: new Date(),
            updatedBy: currentUser.id,
          })
          .where(eq(interpretingDoctors.userId, params.userId));
        console.log("👨‍⚕️ Updated interpreting doctor profile");
      }
    }

    // Get updated user data
    const updatedUserResult = await getUserById({ userId: params.userId });
    if (!updatedUserResult.success) {
      return updatedUserResult;
    }

    // Revalidate relevant paths
    revalidatePath("/5am-corp/admin/users");
    revalidatePath(`/5am-corp/admin/users/${params.userId}`);

    return {
      success: true,
      data: updatedUserResult.data!,
    };
  } catch (error) {
    console.error("❌ [updateUser] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user",
    };
  }
}

/**
 * Ban user
 */
export async function banUser(params: BanUserParams): Promise<ServerActionResponse<void>> {
  try {
    console.log("🚫 Banning user:", params.userId);

    // Only super admins can ban users
    await requireSuperAdmin();

    await db
      .update(users)
      .set({
        banned: true,
        banReason: params.banReason,
        banExpires: params.banExpires,
        updatedAt: new Date(),
      })
      .where(eq(users.id, params.userId));

    // Revalidate relevant paths
    revalidatePath("/5am-corp/admin/users");
    revalidatePath(`/5am-corp/admin/users/${params.userId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ [banUser] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to ban user",
    };
  }
}

/**
 * Unban user
 */
export async function unbanUser(params: UnbanUserParams): Promise<ServerActionResponse<void>> {
  try {
    console.log("✅ Unbanning user:", params.userId);

    // Only super admins can unban users
    await requireSuperAdmin();

    await db
      .update(users)
      .set({
        banned: false,
        banReason: null,
        banExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, params.userId));

    // Revalidate relevant paths
    revalidatePath("/5am-corp/admin/users");
    revalidatePath(`/5am-corp/admin/users/${params.userId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ [unbanUser] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to unban user",
    };
  }
}

/**
 * Update user security settings
 */
export async function updateUserSecurity(formData: FormData): Promise<ServerActionResponse<void>> {
  try {
    console.log("🔒 Updating user security settings");

    // Only super admins can update security settings
    await requireSuperAdmin();

    const validatedData = userSecurityUpdateSchema.parse({
      id: formData.get("id"),
      banned: formData.get("banned") === "true",
      banReason: formData.get("banReason") || undefined,
      banExpires: formData.get("banExpires") ? new Date(formData.get("banExpires") as string) : undefined,
      emailVerified: formData.get("emailVerified") === "true",
    });

    await db
      .update(users)
      .set({
        banned: validatedData.banned,
        banReason: validatedData.banReason,
        banExpires: validatedData.banExpires,
        emailVerified: validatedData.emailVerified,
        updatedAt: new Date(),
      })
      .where(eq(users.id, validatedData.id));

    // Revalidate relevant paths
    revalidatePath("/5am-corp/admin/users");
    revalidatePath(`/5am-corp/admin/users/${validatedData.id}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error("❌ [updateUserSecurity] Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user security",
    };
  }
}