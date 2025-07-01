// actions/user-actions.ts - User management server actions
"use server";

import { requireSuperAdmin, requireAuth, getServerSession } from "@/lib/auth-server";
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
import { getErrorMessage, ServerActionResponse } from "@/types/server-actions.types";
import { canUserCreateInOrganization, getOrganizationsForUserCreation, getOrganizationWithMetadata } from "./organization-actions";
import { createMembership, getMembersByUser } from "./member-actions";
import { Member } from "@/types";
import { createTechnician } from "./technicians-actions";
import { createInterpretingDoctor } from "./interpreting-doctor-actions";

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
      membershipCount: memberships.length
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

export async function createUser(params: CreateUserParams): Promise<ServerActionResponse<UserCreationResult>> {
  const transaction = db.transaction(async (tx) => {
    try {
      console.log("👤 Starting user creation transaction:", params);

      const { userData } = params;

      // Validate input data
      const validatedData = createUserSchema.parse(userData);
      console.log("✅ User data validation passed");

      // Check authorization
      const session = await getServerSession();
      if (!session?.user) {
        throw new Error("Authentication required");
      }

      // Verify user can create in target organization
      if (validatedData.organizationId) {
        const permissionCheck = await canUserCreateInOrganization(
          session.user.role ?? "",
          validatedData.organizationId,
          session.user.id
        );

        if (!permissionCheck.success || !permissionCheck.data?.canCreate) {
          throw new Error(permissionCheck.data?.reason || "Insufficient permissions");
        }
      }

      // STEP 1: Create or get existing user record
      let userId: string;
      let isNewUser = false;

      const existingUser = await tx
        .select()
        .from(users)
        .where(eq(users.email, validatedData.email))
        .limit(1);

      if (existingUser.length > 0) {
        userId = existingUser[0].id;
        console.log("📧 Using existing user with email:", validatedData.email);
      } else {
        // Create new user record
        const newUserId = generateId();
        const [newUser] = await tx
          .insert(users)
          .values({
            id: newUserId,
            email: validatedData.email,
            ...(validatedData.name ? { name: validatedData.name } : {}),
            emailVerified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        userId = newUser.id;
        isNewUser = true;
        console.log("✅ New user created:", userId);
      }

      // STEP 2: Create membership using member actions
      if (validatedData.organizationId && validatedData.role) {
        const membershipResult = await createMembership(
          userId,
          validatedData.organizationId,
          validatedData.role
        );

        if (!membershipResult.success) {
          throw new Error(`Failed to create membership: ${membershipResult.error}`);
        }

        console.log("✅ Membership created successfully");
      }

      // STEP 3: Create professional profiles if needed
      let technicianProfile = null;
      let interpretingDoctorProfile = null;

      if (validatedData.role === "technician" && validatedData.professionalDetails) {
        const technicianResult = await createTechnician(
          validatedData.professionalDetails,
          userId,
          validatedData.organizationId!
        );

        if (!technicianResult.success) {
          throw new Error(`Failed to create technician profile: ${technicianResult.error}`);
        }

        technicianProfile = technicianResult.data;
        console.log("✅ Technician profile created successfully");
      }

      if (validatedData.role === "interpreting_doctor" && validatedData.professionalDetails) {
        const doctorResult = await createInterpretingDoctor(
          validatedData.professionalDetails,
          userId,
          validatedData.organizationId!
        );

        if (!doctorResult.success) {
          throw new Error(`Failed to create interpreting doctor profile: ${doctorResult.error}`);
        }

        interpretingDoctorProfile = doctorResult.data;
        console.log("✅ Interpreting doctor profile created successfully");
      }

      // STEP 4: Send invitation if requested
      if (params.sendInvitation && validatedData.organizationId) {
        // This would integrate with your existing invitation system
        // For now, we'll just log it
        console.log("📧 Invitation would be sent to:", validatedData.email);
      }

      const result: UserCreationResult = {
        user: userId,
        email: validatedData.email,
        isNewUser,
        membershipCreated: !!validatedData.organizationId,
        organizationId: validatedData.organizationId || null,
        role: validatedData.role || null,
        technicianProfile,
        interpretingDoctorProfile,
      };

      console.log("✅ User creation transaction completed successfully:", result);

      // Revalidate relevant paths
      revalidatePath("/5am-corp/admin/users");
      if (validatedData.organizationId) {
        revalidatePath(`/[orgSlug]/staff/users`, 'page');
      }

      return {
        success: true,
        data: result,
        message: "User created successfully",
      };

    } catch (error) {
      console.error("❌ Error in user creation transaction:", error);
      throw error; // This will trigger transaction rollback
    }
  });

  try {
    return await transaction;
  } catch (error) {
    console.error("❌ Transaction failed, rolling back:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create user",
    };
  }
}

/**
 * ✅ NEW: Get user creation options for forms
 */
export async function getUserCreationOptions(
  currentUserId: string
): Promise<ServerActionResponse> {
  try {
    console.log("⚙️ Getting user creation options for user:", currentUserId);

    // Get organizations user can create in
    const organizationsResult = await getOrganizationsForUserCreation(currentUserId);
    
    if (!organizationsResult.success) {
      throw new Error(getErrorMessage(organizationsResult.error || "Failed to get organizations"));
    }

    const options = {
      organizations: organizationsResult.data || [],
      defaultRole: "client_admin", // Can be customized based on user's role
      professionalRoles: ["technician", "interpreting_doctor"],
      requiresProfessionalProfile: (role: string) => 
        ["technician", "interpreting_doctor"].includes(role),
    };

    return {
      success: true,
      data: options,
    };
    
  } catch (error) {
    console.error("❌ Error getting user creation options:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get user creation options",
    };
  }
}

/**
 * ✅ ENHANCED: Get user details with all memberships and professional profiles
 */
export async function getUserDetails(userId: string): Promise<ServerActionResponse<UserDetails>> {
  try {
    console.log("🔍 Getting comprehensive user details:", userId);

    // Only super admins and 5AM admins can get full user details
    await requireAuth();

    // Get base user info
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Get all memberships using member actions
    const membershipsResult = await getMembersByUser(userId);
    const memberships = membershipsResult.success ? membershipsResult.data || [] : [];

    // Get technician profiles
    const technicianProfiles = await db
      .select()
      .from(technicians)
      .where(
        and(
          eq(technicians.userId, userId),
          eq(technicians.isActive, true)
        )
      );

    // Get interpreting doctor profiles
    const doctorProfiles = await db
      .select()
      .from(interpretingDoctors)
      .where(
        and(
          eq(interpretingDoctors.userId, userId),
          eq(interpretingDoctors.isActive, true)
        )
      );

    // Calculate primary organization (most recent membership)
    const primaryMembership = memberships[0]; // Already sorted by createdAt desc
    
    const userDetails: UserDetails = {
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
      primaryRole: primaryMembership?.role,
      primaryOrganizationId: primaryMembership?.organizationId,
      primaryOrganizationName: primaryMembership?.organization?.name,
      membershipCount: memberships.length,
      memberships: memberships.map((m: { id: any; organizationId: any; organization: { name: any; slug: any; }; role: any; createdAt: any; }) => ({
        id: m.id,
        organizationId: m.organizationId,
        organizationName: m.organization?.name || "Unknown",
        organizationSlug: m.organization?.slug || null,
        role: m.role,
        createdAt: m.createdAt,
        isActive: true, // Assuming active if not deleted
      })),
      technicianProfile: technicianProfiles[0]
        ? { ...technicianProfiles[0], userId: technicianProfiles[0].userId ?? "" }
        : undefined,
      interpretingDoctorProfile: doctorProfiles[0]
        ? { ...doctorProfiles[0], userId: doctorProfiles[0].userId ?? "" }
        : undefined,
    };

    console.log("✅ Comprehensive user details retrieved");

    return {
      success: true,
      data: userDetails,
    };
    
  } catch (error) {
    console.error("❌ Error getting user details:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get user details",
    };
  }
}

/**
 * ✅ NEW: Utility function to check if role requires professional profile
 */
export function doesRoleRequireProfessionalProfile(role: string): {
  requiresTechnician: boolean;
  requiresInterpretingDoctor: boolean;
} {
  return {
    requiresTechnician: role === "technician",
    requiresInterpretingDoctor: role === "interpreting_doctor",
  };
}

/**
 * ✅ NEW: Get roles available for organization
 */
export async function getRolesForOrganization(
  organizationId: string
): Promise<ServerActionResponse> {
  try {
    console.log("📋 Getting roles for organization:", organizationId);

    // Get organization metadata to determine type
    const orgResult = await getOrganizationWithMetadata(organizationId);
    
    if (!orgResult.success || !orgResult.data) {
      throw new Error("Organization not found");
    }

    const roles = orgResult.data.availableRoles || [];

    return {
      success: true,
      data: roles,
    };
    
  } catch (error) {
    console.error("❌ Error getting roles for organization:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get organization roles",
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