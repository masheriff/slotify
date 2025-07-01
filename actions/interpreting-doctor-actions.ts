// actions/interpreting-doctor-actions.ts - Phase 2 Professional Interpreting Doctor Actions
"use server";

import { requireSuperAdmin, getServerSession } from "@/lib/auth-server";
import { db } from "@/db";
import { interpretingDoctors, users, organizations } from "@/db/schema";
import { eq, and, ilike, or, sql, gte, desc, asc } from "drizzle-orm";
import { generateId } from "better-auth";
import { revalidatePath } from "next/cache";
import { ServerActionResponse } from "@/types/server-actions.types";
import { ListDataResult } from "@/types/list-page.types";

// Interpreting Doctor interfaces
export interface InterpretingDoctorProfileData {
  firstName: string;
  middleName?: string;
  lastName: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  code?: string;
  licenseNumber: string; // Required for doctors
  primarySpecialty: string; // Required
  secondarySpecialty?: string;
  readingStatus?: string;
  emergencyReads?: boolean;
  weekendReads?: boolean;
  nightReads?: boolean;
  isActive?: boolean;
}

export interface InterpretingDoctorListItem {
  id: string;
  organizationId: string;
  userId: string | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  phone: string | null;
  email: string | null;
  licenseNumber: string;
  primarySpecialty: string;
  secondarySpecialty: string | null;
  readingStatus: string;
  emergencyReads: boolean;
  weekendReads: boolean;
  nightReads: boolean;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  organization?: {
    id: string;
    name: string;
    slug: string | null;
  };
  user?: {
    id: string;
    name: string | null;
    email: string;
    emailVerified: boolean;
  };
}

export interface GetInterpretingDoctorsListParams {
  organizationId?: string;
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  primarySpecialty?: string;
  readingStatus?: string;
  emergencyReads?: boolean;
  weekendReads?: boolean;
  nightReads?: boolean;
  isActive?: boolean;
}

/**
 * ✅ CREATE: Create interpreting doctor profile
 */
export async function createInterpretingDoctor(
  profileData: InterpretingDoctorProfileData,
  userId: string,
  organizationId: string
): Promise<ServerActionResponse> {
  try {
    console.log("👨‍⚕️ Creating interpreting doctor profile:", { profileData, userId, organizationId });

    // Get current user for audit trail
    const session = await getServerSession();
    if (!session?.user) {
      throw new Error("Authentication required");
    }

    await requireSuperAdmin();

    // Validate required fields
    if (!profileData.firstName || !profileData.lastName || !profileData.licenseNumber || !profileData.primarySpecialty) {
      return {
        success: false,
        error: "First name, last name, license number, and primary specialty are required",
      };
    }

    // Check if interpreting doctor already exists for this user/organization
    const existingDoctor = await db
      .select()
      .from(interpretingDoctors)
      .where(
        and(
          eq(interpretingDoctors.userId, userId),
          eq(interpretingDoctors.organizationId, organizationId)
        )
      )
      .limit(1);

    if (existingDoctor.length > 0) {
      return {
        success: false,
        error: "Interpreting doctor profile already exists for this user in this organization",
      };
    }

    // Create interpreting doctor profile
    const doctorId = generateId();
    const [newDoctor] = await db
      .insert(interpretingDoctors)
      .values({
        id: doctorId,
        organizationId,
        userId,
        firstName: profileData.firstName,
        middleName: profileData.middleName || null,
        lastName: profileData.lastName,
        phone: profileData.phone || null,
        email: profileData.email || null,
        addressLine1: profileData.addressLine1 || null,
        addressLine2: profileData.addressLine2 || null,
        city: profileData.city || null,
        state: profileData.state || null,
        code: profileData.code || null,
        licenseNumber: profileData.licenseNumber,
        primarySpecialty: profileData.primarySpecialty as any, // Cast to enum
        secondarySpecialty: profileData.secondarySpecialty as any || null,
        readingStatus: (profileData.readingStatus || "active") as any,
        emergencyReads: profileData.emergencyReads ?? false,
        weekendReads: profileData.weekendReads ?? false,
        nightReads: profileData.nightReads ?? false,
        isActive: profileData.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: session.user.id,
        updatedBy: session.user.id,
      })
      .returning();

    console.log("✅ Interpreting doctor profile created successfully:", newDoctor);

    revalidatePath("/5am-corp/admin/interpreting-doctors");
    revalidatePath(`/[orgSlug]/staff/interpreting-doctors`, 'page');

    return {
      success: true,
      data: newDoctor,
      message: "Interpreting doctor profile created successfully",
    };
    
      } catch (error) {
    console.error("❌ Error getting interpreting doctors list:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to list interpreting doctors",
    };
  }
}

/**
 * ✅ DELETE: Soft delete interpreting doctor (set deletedAt)
 */
export async function deleteInterpretingDoctor(
  doctorId: string
): Promise<ServerActionResponse> {
  try {
    console.log("🗑️ Soft deleting interpreting doctor:", doctorId);

    const session = await getServerSession();
    if (!session?.user) {
      throw new Error("Authentication required");
    }

    await requireSuperAdmin();

    // Check if doctor exists
    const [existingDoctor] = await db
      .select()
      .from(interpretingDoctors)
      .where(eq(interpretingDoctors.id, doctorId))
      .limit(1);

    if (!existingDoctor) {
      return {
        success: false,
        error: "Interpreting doctor not found",
      };
    }

    // Soft delete by setting deletedAt
    const [deletedDoctor] = await db
      .update(interpretingDoctors)
      .set({
        deletedAt: new Date(),
        deletedBy: session.user.id,
        isActive: false,
        updatedAt: new Date(),
        updatedBy: session.user.id,
      })
      .where(eq(interpretingDoctors.id, doctorId))
      .returning({ 
        id: interpretingDoctors.id, 
        organizationId: interpretingDoctors.organizationId,
        firstName: interpretingDoctors.firstName,
        lastName: interpretingDoctors.lastName,
        licenseNumber: interpretingDoctors.licenseNumber,
      });

    if (!deletedDoctor) {
      return {
        success: false,
        error: "Failed to delete interpreting doctor",
      };
    }

    console.log("✅ Interpreting doctor soft deleted successfully:", deletedDoctor);

    revalidatePath("/5am-corp/admin/interpreting-doctors");
    revalidatePath(`/[orgSlug]/staff/interpreting-doctors`, 'page');
    
    return {
      success: true,
      data: deletedDoctor,
      message: "Interpreting doctor deleted successfully",
    };
    
  } catch (error) {
    console.error("❌ Error deleting interpreting doctor:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete interpreting doctor",
    };
  }
}error) {
    console.error("❌ Error creating interpreting doctor:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create interpreting doctor profile",
    };
  }
}

/**
 * ✅ UPDATE: Update interpreting doctor profile
 */
export async function updateInterpretingDoctor(
  doctorId: string,
  profileData: Partial<InterpretingDoctorProfileData>
): Promise<ServerActionResponse> {
  try {
    console.log("✏️ Updating interpreting doctor:", { doctorId, profileData });

    const session = await getServerSession();
    if (!session?.user) {
      throw new Error("Authentication required");
    }

    await requireSuperAdmin();

    // Check if doctor exists
    const [existingDoctor] = await db
      .select()
      .from(interpretingDoctors)
      .where(eq(interpretingDoctors.id, doctorId))
      .limit(1);

    if (!existingDoctor) {
      return {
        success: false,
        error: "Interpreting doctor not found",
      };
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
      updatedBy: session.user.id,
    };

    // Only update provided fields
    if (profileData.firstName !== undefined) updateData.firstName = profileData.firstName;
    if (profileData.middleName !== undefined) updateData.middleName = profileData.middleName;
    if (profileData.lastName !== undefined) updateData.lastName = profileData.lastName;
    if (profileData.phone !== undefined) updateData.phone = profileData.phone;
    if (profileData.email !== undefined) updateData.email = profileData.email;
    if (profileData.addressLine1 !== undefined) updateData.addressLine1 = profileData.addressLine1;
    if (profileData.addressLine2 !== undefined) updateData.addressLine2 = profileData.addressLine2;
    if (profileData.city !== undefined) updateData.city = profileData.city;
    if (profileData.state !== undefined) updateData.state = profileData.state;
    if (profileData.code !== undefined) updateData.code = profileData.code;
    if (profileData.licenseNumber !== undefined) updateData.licenseNumber = profileData.licenseNumber;
    if (profileData.primarySpecialty !== undefined) updateData.primarySpecialty = profileData.primarySpecialty;
    if (profileData.secondarySpecialty !== undefined) updateData.secondarySpecialty = profileData.secondarySpecialty;
    if (profileData.readingStatus !== undefined) updateData.readingStatus = profileData.readingStatus;
    if (profileData.emergencyReads !== undefined) updateData.emergencyReads = profileData.emergencyReads;
    if (profileData.weekendReads !== undefined) updateData.weekendReads = profileData.weekendReads;
    if (profileData.nightReads !== undefined) updateData.nightReads = profileData.nightReads;
    if (profileData.isActive !== undefined) updateData.isActive = profileData.isActive;

    // Update interpreting doctor
    const [updatedDoctor] = await db
      .update(interpretingDoctors)
      .set(updateData)
      .where(eq(interpretingDoctors.id, doctorId))
      .returning();

    if (!updatedDoctor) {
      return {
        success: false,
        error: "Failed to update interpreting doctor",
      };
    }

    console.log("✅ Interpreting doctor updated successfully:", updatedDoctor);

    revalidatePath("/5am-corp/admin/interpreting-doctors");
    revalidatePath(`/[orgSlug]/staff/interpreting-doctors`, 'page');

    return {
      success: true,
      data: updatedDoctor,
      message: "Interpreting doctor updated successfully",
    };
    
  } catch (error) {
    console.error("❌ Error updating interpreting doctor:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update interpreting doctor",
    };
  }
}

/**
 * ✅ READ: Get interpreting doctor by ID
 */
export async function getInterpretingDoctorById(
  doctorId: string
): Promise<ServerActionResponse> {
  try {
    console.log("🔍 Getting interpreting doctor by ID:", doctorId);

    await requireSuperAdmin();

    const result = await db
      .select({
        id: interpretingDoctors.id,
        organizationId: interpretingDoctors.organizationId,
        userId: interpretingDoctors.userId,
        firstName: interpretingDoctors.firstName,
        middleName: interpretingDoctors.middleName,
        lastName: interpretingDoctors.lastName,
        phone: interpretingDoctors.phone,
        email: interpretingDoctors.email,
        addressLine1: interpretingDoctors.addressLine1,
        addressLine2: interpretingDoctors.addressLine2,
        city: interpretingDoctors.city,
        state: interpretingDoctors.state,
        code: interpretingDoctors.code,
        licenseNumber: interpretingDoctors.licenseNumber,
        primarySpecialty: interpretingDoctors.primarySpecialty,
        secondarySpecialty: interpretingDoctors.secondarySpecialty,
        readingStatus: interpretingDoctors.readingStatus,
        emergencyReads: interpretingDoctors.emergencyReads,
        weekendReads: interpretingDoctors.weekendReads,
        nightReads: interpretingDoctors.nightReads,
        isActive: interpretingDoctors.isActive,
        createdAt: interpretingDoctors.createdAt,
        updatedAt: interpretingDoctors.updatedAt,
        organization: {
          id: organizations.id,
          name: organizations.name,
          slug: organizations.slug,
        },
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          emailVerified: users.emailVerified,
        },
      })
      .from(interpretingDoctors)
      .leftJoin(organizations, eq(interpretingDoctors.organizationId, organizations.id))
      .leftJoin(users, eq(interpretingDoctors.userId, users.id))
      .where(eq(interpretingDoctors.id, doctorId))
      .limit(1);

    if (!result[0]) {
      return {
        success: false,
        error: "Interpreting doctor not found",
      };
    }

    console.log("✅ Interpreting doctor found:", result[0]);

    return {
      success: true,
      data: result[0],
    };
    
  } catch (error) {
    console.error("❌ Error getting interpreting doctor by ID:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get interpreting doctor details",
    };
  }
}

/**
 * ✅ LIST: Get interpreting doctors by organization
 */
export async function getInterpretingDoctorsByOrganization(
  organizationId: string
): Promise<ServerActionResponse> {
  try {
    console.log("🔍 Getting interpreting doctors by organization:", organizationId);

    await requireSuperAdmin();

    const doctorsList = await db
      .select({
        id: interpretingDoctors.id,
        organizationId: interpretingDoctors.organizationId,
        userId: interpretingDoctors.userId,
        firstName: interpretingDoctors.firstName,
        middleName: interpretingDoctors.middleName,
        lastName: interpretingDoctors.lastName,
        phone: interpretingDoctors.phone,
        email: interpretingDoctors.email,
        licenseNumber: interpretingDoctors.licenseNumber,
        primarySpecialty: interpretingDoctors.primarySpecialty,
        secondarySpecialty: interpretingDoctors.secondarySpecialty,
        readingStatus: interpretingDoctors.readingStatus,
        emergencyReads: interpretingDoctors.emergencyReads,
        weekendReads: interpretingDoctors.weekendReads,
        nightReads: interpretingDoctors.nightReads,
        isActive: interpretingDoctors.isActive,
        createdAt: interpretingDoctors.createdAt,
        updatedAt: interpretingDoctors.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          emailVerified: users.emailVerified,
        },
      })
      .from(interpretingDoctors)
      .leftJoin(users, eq(interpretingDoctors.userId, users.id))
      .where(eq(interpretingDoctors.organizationId, organizationId))
      .orderBy(desc(interpretingDoctors.createdAt));

    console.log(`✅ Found ${doctorsList.length} interpreting doctors for organization`);

    return {
      success: true,
      data: doctorsList,
    };
    
  } catch (error) {
    console.error("❌ Error getting interpreting doctors by organization:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get organization interpreting doctors",
    };
  }
}

/**
 * ✅ LIST: Get interpreting doctors list with filtering and pagination
 */
export async function getInterpretingDoctorsList(
  params: GetInterpretingDoctorsListParams
): Promise<ListDataResult<InterpretingDoctorListItem>> {
  try {
    console.log("📋 Starting getInterpretingDoctorsList with params:", params);

    await requireSuperAdmin();

    // Build query conditions
    const buildConditions = () => {
      const conditions = [];
      
      // Filter by organization if provided
      if (params.organizationId) {
        conditions.push(eq(interpretingDoctors.organizationId, params.organizationId));
      }
      
      if (params.search) {
        conditions.push(
          or(
            ilike(interpretingDoctors.firstName, `%${params.search}%`),
            ilike(interpretingDoctors.lastName, `%${params.search}%`),
            ilike(interpretingDoctors.email, `%${params.search}%`),
            ilike(interpretingDoctors.licenseNumber, `%${params.search}%`)
          )
        );
      }

      if (params.primarySpecialty) {
        conditions.push(eq(interpretingDoctors.primarySpecialty, params.primarySpecialty));
      }

      if (params.readingStatus) {
        conditions.push(eq(interpretingDoctors.readingStatus, params.readingStatus));
      }

      if (params.emergencyReads !== undefined) {
        conditions.push(eq(interpretingDoctors.emergencyReads, params.emergencyReads));
      }

      if (params.weekendReads !== undefined) {
        conditions.push(eq(interpretingDoctors.weekendReads, params.weekendReads));
      }

      if (params.nightReads !== undefined) {
        conditions.push(eq(interpretingDoctors.nightReads, params.nightReads));
      }

      if (params.isActive !== undefined) {
        conditions.push(eq(interpretingDoctors.isActive, params.isActive));
      }

      return conditions.length > 0 ? and(...conditions) : undefined;
    };

    // Get total count
    const countWhereClause = buildConditions();
    const totalCountQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(interpretingDoctors);

    const [{ count: totalCount }] = countWhereClause
      ? await totalCountQuery.where(countWhereClause)
      : await totalCountQuery;

    // Get paginated results
    const dataWhereClause = buildConditions();
    const offset = (params.page - 1) * params.pageSize;
    
    const sortBy = params.sortBy || 'createdAt';
    const sortDirection = params.sortDirection || 'desc';
    
    let orderClause;
    if (sortBy === 'firstName') {
      orderClause = sortDirection === 'asc' ? asc(interpretingDoctors.firstName) : desc(interpretingDoctors.firstName);
    } else if (sortBy === 'lastName') {
      orderClause = sortDirection === 'asc' ? asc(interpretingDoctors.lastName) : desc(interpretingDoctors.lastName);
    } else if (sortBy === 'primarySpecialty') {
      orderClause = sortDirection === 'asc' ? asc(interpretingDoctors.primarySpecialty) : desc(interpretingDoctors.primarySpecialty);
    } else if (sortBy === 'readingStatus') {
      orderClause = sortDirection === 'asc' ? asc(interpretingDoctors.readingStatus) : desc(interpretingDoctors.readingStatus);
    } else {
      orderClause = sortDirection === 'asc' ? asc(interpretingDoctors.createdAt) : desc(interpretingDoctors.createdAt);
    }

    const dataQuery = db
      .select({
        id: interpretingDoctors.id,
        organizationId: interpretingDoctors.organizationId,
        userId: interpretingDoctors.userId,
        firstName: interpretingDoctors.firstName,
        middleName: interpretingDoctors.middleName,
        lastName: interpretingDoctors.lastName,
        phone: interpretingDoctors.phone,
        email: interpretingDoctors.email,
        licenseNumber: interpretingDoctors.licenseNumber,
        primarySpecialty: interpretingDoctors.primarySpecialty,
        secondarySpecialty: interpretingDoctors.secondarySpecialty,
        readingStatus: interpretingDoctors.readingStatus,
        emergencyReads: interpretingDoctors.emergencyReads,
        weekendReads: interpretingDoctors.weekendReads,
        nightReads: interpretingDoctors.nightReads,
        isActive: interpretingDoctors.isActive,
        createdAt: interpretingDoctors.createdAt,
        updatedAt: interpretingDoctors.updatedAt,
        organization: {
          id: organizations.id,
          name: organizations.name,
          slug: organizations.slug,
        },
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          emailVerified: users.emailVerified,
        },
      })
      .from(interpretingDoctors)
      .leftJoin(organizations, eq(interpretingDoctors.organizationId, organizations.id))
      .leftJoin(users, eq(interpretingDoctors.userId, users.id))
      .limit(params.pageSize)
      .offset(offset)
      .orderBy(orderClause);

    const results = dataWhereClause
      ? await dataQuery.where(dataWhereClause)
      : await dataQuery;

    const totalPages = Math.ceil(totalCount / params.pageSize);

    console.log(`✅ Found ${results.length} interpreting doctors (${totalCount} total)`);

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
    
  } catch (