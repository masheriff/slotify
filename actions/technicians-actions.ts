// actions/technician-actions.ts - Phase 2 Professional Technician Actions
"use server";

import { requireSuperAdmin, getServerSession } from "@/lib/auth-server";
import { db } from "@/db";
import { technicians, users, organizations } from "@/db/schema";
import { eq, and, ilike, or, sql, gte, desc, asc } from "drizzle-orm";
import { generateId } from "better-auth";
import { revalidatePath } from "next/cache";
import { ServerActionResponse } from "@/types/server-actions.types";
import { ListDataResult } from "@/types/list-page.types";

// Import enum validation at the top
import { 
  validateTechnicianEnums, 
  isValidFacilitySpecialty, 
  isValidCertificationLevel, 
  isValidEmploymentStatus,
  type FacilitySpecialty,
  type CertificationLevel,
  type EmploymentStatus
} from "@/lib/utils/enum-validation";

// Update the technician profile data interface
export interface TechnicianProfileData {
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
  licenseNumber?: string;
  specialty: FacilitySpecialty; // Now properly typed
  certificationLevel: CertificationLevel;
  employmentStatus: EmploymentStatus;
  isActive?: boolean;
}

export interface TechnicianListItem {
  id: string;
  organizationId: string;
  userId: string | null;
  firstName: string;
  middleName: string | null;
  lastName: string;
  phone: string | null;
  email: string | null;
  specialty: string;
  certificationLevel: string;
  employmentStatus: string;
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

export interface GetTechniciansListParams {
  organizationId?: string;
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  specialty?: string;
  certificationLevel?: string;
  employmentStatus?: string;
  isActive?: boolean;
}

/**
 * ✅ LIST: Get technicians by organization
 */
export async function getTechniciansByOrganization(
  organizationId: string
): Promise<ServerActionResponse> {
  try {
    console.log("🔍 Getting technicians by organization:", organizationId);

    await requireSuperAdmin();

    const techniciansList = await db
      .select({
        id: technicians.id,
        organizationId: technicians.organizationId,
        userId: technicians.userId,
        firstName: technicians.firstName,
        middleName: technicians.middleName,
        lastName: technicians.lastName,
        phone: technicians.phone,
        email: technicians.email,
        specialty: technicians.specialty,
        certificationLevel: technicians.certificationLevel,
        employmentStatus: technicians.employmentStatus,
        isActive: technicians.isActive,
        createdAt: technicians.createdAt,
        updatedAt: technicians.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          emailVerified: users.emailVerified,
        },
      })
      .from(technicians)
      .leftJoin(users, eq(technicians.userId, users.id))
      .where(eq(technicians.organizationId, organizationId))
      .orderBy(desc(technicians.createdAt));

    console.log(`✅ Found ${techniciansList.length} technicians for organization`);

    return {
      success: true,
      data: techniciansList,
    };
    
  } catch (error) {
    console.error("❌ Error getting technicians by organization:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get organization technicians",
    };
  }
}

/**
 * ✅ LIST: Get technicians list with filtering and pagination
 */
export async function getTechniciansList(
  params: GetTechniciansListParams
): Promise<ListDataResult<TechnicianListItem>> {
  try {
    console.log("📋 Starting getTechniciansList with params:", params);

    await requireSuperAdmin();

    // Build query conditions
    const buildConditions = () => {
      const conditions = [];
      
      // Filter by organization if provided
      if (params.organizationId) {
        conditions.push(eq(technicians.organizationId, params.organizationId));
      }
      
      if (params.search) {
        conditions.push(
          or(
            ilike(technicians.firstName, `%${params.search}%`),
            ilike(technicians.lastName, `%${params.search}%`),
            ilike(technicians.email, `%${params.search}%`),
            ilike(technicians.phone, `%${params.search}%`)
          )
        );
      }

      // Validate enum filters with proper type safety
      if (params.specialty && isValidFacilitySpecialty(params.specialty)) {
        conditions.push(eq(technicians.specialty, params.specialty));
      }

      if (params.certificationLevel && isValidCertificationLevel(params.certificationLevel)) {
        conditions.push(eq(technicians.certificationLevel, params.certificationLevel));
      }

      if (params.employmentStatus && isValidEmploymentStatus(params.employmentStatus)) {
        conditions.push(eq(technicians.employmentStatus, params.employmentStatus));
      }

      if (params.isActive !== undefined) {
        conditions.push(eq(technicians.isActive, params.isActive));
      }

      return conditions.length > 0 ? and(...conditions) : undefined;
    };

    // Get total count
    const countWhereClause = buildConditions();
    const totalCountQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(technicians);

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
      orderClause = sortDirection === 'asc' ? asc(technicians.firstName) : desc(technicians.firstName);
    } else if (sortBy === 'lastName') {
      orderClause = sortDirection === 'asc' ? asc(technicians.lastName) : desc(technicians.lastName);
    } else if (sortBy === 'specialty') {
      orderClause = sortDirection === 'asc' ? asc(technicians.specialty) : desc(technicians.specialty);
    } else if (sortBy === 'certificationLevel') {
      orderClause = sortDirection === 'asc' ? asc(technicians.certificationLevel) : desc(technicians.certificationLevel);
    } else {
      orderClause = sortDirection === 'asc' ? asc(technicians.createdAt) : desc(technicians.createdAt);
    }

    const dataQuery = db
      .select({
        id: technicians.id,
        organizationId: technicians.organizationId,
        userId: technicians.userId,
        firstName: technicians.firstName,
        middleName: technicians.middleName,
        lastName: technicians.lastName,
        phone: technicians.phone,
        email: technicians.email,
        specialty: technicians.specialty,
        certificationLevel: technicians.certificationLevel,
        employmentStatus: technicians.employmentStatus,
        isActive: technicians.isActive,
        createdAt: technicians.createdAt,
        updatedAt: technicians.updatedAt,
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
      .from(technicians)
      .leftJoin(organizations, eq(technicians.organizationId, organizations.id))
      .leftJoin(users, eq(technicians.userId, users.id))
      .limit(params.pageSize)
      .offset(offset)
      .orderBy(orderClause);

    const results = dataWhereClause
      ? await dataQuery.where(dataWhereClause)
      : await dataQuery;

    const totalPages = Math.ceil(totalCount / params.pageSize);

    console.log(`✅ Found ${results.length} technicians (${totalCount} total)`);

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
    console.error("❌ Error getting technicians list:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to list technicians",
    };
  }
}

/**
 * ✅ DELETE: Soft delete technician (set deletedAt)
 */
export async function deleteTechnician(
  technicianId: string
): Promise<ServerActionResponse> {
  try {
    console.log("🗑️ Soft deleting technician:", technicianId);

    const session = await getServerSession();
    if (!session?.user) {
      throw new Error("Authentication required");
    }

    await requireSuperAdmin();

    // Check if technician exists
    const [existingTechnician] = await db
      .select()
      .from(technicians)
      .where(eq(technicians.id, technicianId))
      .limit(1);

    if (!existingTechnician) {
      return {
        success: false,
        error: "Technician not found",
      };
    }

    // Soft delete by setting deletedAt
    const [deletedTechnician] = await db
      .update(technicians)
      .set({
        deletedAt: new Date(),
        deletedBy: session.user.id,
        isActive: false,
        updatedAt: new Date(),
        updatedBy: session.user.id,
      })
      .where(eq(technicians.id, technicianId))
      .returning({ 
        id: technicians.id, 
        organizationId: technicians.organizationId,
        firstName: technicians.firstName,
        lastName: technicians.lastName,
      });

    if (!deletedTechnician) {
      return {
        success: false,
        error: "Failed to delete technician",
      };
    }

    console.log("✅ Technician soft deleted successfully:", deletedTechnician);

    revalidatePath("/5am-corp/admin/technicians");
    revalidatePath(`/[orgSlug]/staff/technicians`, 'page');
    
    return {
      success: true,
      data: deletedTechnician,
      message: "Technician deleted successfully",
    };
    
  } catch (error) {
    console.error("❌ Error deleting technician:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete technician",
    };
  }
}

/**
 * ✅ CREATE: Create technician profile
 */
export async function createTechnician(
  profileData: TechnicianProfileData,
  userId: string,
  organizationId: string
): Promise<ServerActionResponse> {
  try {
    console.log("👨‍⚕️ Creating technician profile:", { profileData, userId, organizationId });

    // Get current user for audit trail
    const session = await getServerSession();
    if (!session?.user) {
      throw new Error("Authentication required");
    }

    await requireSuperAdmin();

    // Validate required fields and enums
    if (!profileData.firstName || !profileData.lastName || !profileData.specialty) {
      return {
        success: false,
        error: "First name, last name, and specialty are required",
      };
    }

    // Validate enum values
    const enumValidation = validateTechnicianEnums({
      specialty: profileData.specialty,
      certificationLevel: profileData.certificationLevel,
      employmentStatus: profileData.employmentStatus,
    });

    if (!enumValidation.isValid) {
      return {
        success: false,
        error: `Invalid enum values: ${enumValidation.errors.join(", ")}`,
      };
    }

    // Check if technician already exists for this user/organization
    const existingTechnician = await db
      .select()
      .from(technicians)
      .where(
        and(
          eq(technicians.userId, userId),
          eq(technicians.organizationId, organizationId)
        )
      )
      .limit(1);

    if (existingTechnician.length > 0) {
      return {
        success: false,
        error: "Technician profile already exists for this user in this organization",
      };
    }

    // Create technician profile
    const technicianId = generateId();
    const [newTechnician] = await db
      .insert(technicians)
      .values({
        id: technicianId,
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
        licenseNumber: profileData.licenseNumber || null,
        specialty: profileData.specialty, // Now properly typed
        certificationLevel: profileData.certificationLevel || "entry_level",
        employmentStatus: profileData.employmentStatus || "full_time",
        isActive: profileData.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: session.user.id,
        updatedBy: session.user.id,
      })
      .returning();

    console.log("✅ Technician profile created successfully:", newTechnician);

    revalidatePath("/5am-corp/admin/technicians");
    revalidatePath(`/[orgSlug]/staff/technicians`, 'page');

    return {
      success: true,
      data: newTechnician,
      message: "Technician profile created successfully",
    };
    
  } catch (error) {
    console.error("❌ Error creating technician:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create technician profile",
    };
  }
}

/**
 * ✅ UPDATE: Update technician profile
 */
export async function updateTechnician(
  technicianId: string,
  profileData: Partial<TechnicianProfileData>
): Promise<ServerActionResponse> {
  try {
    console.log("✏️ Updating technician:", { technicianId, profileData });

    const session = await getServerSession();
    if (!session?.user) {
      throw new Error("Authentication required");
    }

    await requireSuperAdmin();

    // Check if technician exists
    const [existingTechnician] = await db
      .select()
      .from(technicians)
      .where(eq(technicians.id, technicianId))
      .limit(1);

    if (!existingTechnician) {
      return {
        success: false,
        error: "Technician not found",
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
    if (profileData.specialty !== undefined) updateData.specialty = profileData.specialty;
    if (profileData.certificationLevel !== undefined) updateData.certificationLevel = profileData.certificationLevel;
    if (profileData.employmentStatus !== undefined) updateData.employmentStatus = profileData.employmentStatus;
    if (profileData.isActive !== undefined) updateData.isActive = profileData.isActive;

    // Update technician
    const [updatedTechnician] = await db
      .update(technicians)
      .set(updateData)
      .where(eq(technicians.id, technicianId))
      .returning();

    if (!updatedTechnician) {
      return {
        success: false,
        error: "Failed to update technician",
      };
    }

    console.log("✅ Technician updated successfully:", updatedTechnician);

    revalidatePath("/5am-corp/admin/technicians");
    revalidatePath(`/[orgSlug]/staff/technicians`, 'page');

    return {
      success: true,
      data: updatedTechnician,
      message: "Technician updated successfully",
    };
    
  } catch (error) {
    console.error("❌ Error updating technician:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update technician",
    };
  }
}

/**
 * ✅ READ: Get technician by ID
 */
export async function getTechnicianById(
  technicianId: string
): Promise<ServerActionResponse> {
  try {
    console.log("🔍 Getting technician by ID:", technicianId);

    await requireSuperAdmin();

    const result = await db
      .select({
        id: technicians.id,
        organizationId: technicians.organizationId,
        userId: technicians.userId,
        firstName: technicians.firstName,
        middleName: technicians.middleName,
        lastName: technicians.lastName,
        phone: technicians.phone,
        email: technicians.email,
        addressLine1: technicians.addressLine1,
        addressLine2: technicians.addressLine2,
        city: technicians.city,
        state: technicians.state,
        code: technicians.code,
        licenseNumber: technicians.licenseNumber,
        specialty: technicians.specialty,
        certificationLevel: technicians.certificationLevel,
        employmentStatus: technicians.employmentStatus,
        isActive: technicians.isActive,
        createdAt: technicians.createdAt,
        updatedAt: technicians.updatedAt,
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
      .from(technicians)
      .leftJoin(organizations, eq(technicians.organizationId, organizations.id))
      .leftJoin(users, eq(technicians.userId, users.id))
      .where(eq(technicians.id, technicianId))
      .limit(1);

    if (!result[0]) {
      return {
        success: false,
        error: "Technician not found",
      };
    }

    console.log("✅ Technician found:", result[0]);

    return {
      success: true,
      data: result[0],
    };
    
  } catch (error) {
    console.error("❌ Error getting technician by ID:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get technician details",
    };
  }
}

/**