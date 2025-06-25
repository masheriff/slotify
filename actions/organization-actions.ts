// actions/organization-actions.ts - FIXED logo validation
"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";
import { generateId } from "better-auth";
import { APIError } from "better-auth/api";
import { requireSuperAdmin, getServerSession } from "@/lib/auth-server";
import { isSuperAdmin } from "@/lib/permissions/healthcare-access-control";
import { db } from "@/db";
import { organizations, members } from "@/db/schema";
import { eq } from "drizzle-orm";

// Organization data validation schema with FIXED logo validation
const organizationDataSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  slug: z.string().min(1, "Organization slug is required"),
  // FIXED: Proper handling of empty/undefined logo values
  logo: z.string().optional().refine((val) => {
    // Allow undefined, null, or empty string (no logo)
    if (!val || val.trim() === '') return true;
    // Allow relative paths starting with / or absolute URLs
    return val.startsWith('/') || val.startsWith('http');
  }, "Logo must be a valid URL or path"),
  metadata: z.object({
    type: z.enum(["admin", "client"]),
    contactEmail: z.string().email("Valid email is required"),
    contactPhone: z.string().min(1, "Phone number is required"),
    addressLine1: z.string().min(1, "Address is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
    timezone: z.string().min(1, "Timezone is required"),
    isActive: z.boolean().default(true),
    status: z.enum(["active", "inactive", "suspended"]).optional(),
    settings: z.record(z.any()).default({}),
    hipaaOfficer: z.string().optional(),
    businessAssociateAgreement: z.boolean().optional(),
    dataRetentionYears: z.string().optional(),
  }),
});

export type OrganizationData = {
  id?: string;
  name: string;
  slug: string;
  logo?: string;
  createdAt: Date | string;
  metadata: {
    type: "admin" | "client";
    contactEmail: string;
    contactPhone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    timezone: string;
    isActive: boolean;
    status?: "active" | "inactive" | "suspended";
    settings: Record<string, any>;
    hipaaOfficer?: string;
    businessAssociateAgreement?: boolean;
    dataRetentionYears?: string;
  };
}

export async function createOrganization(data: OrganizationData) {
  try {
    console.log("🏢 Creating organization:", data.name);

    await requireSuperAdmin();

    // Validate the data
    const validatedData = organizationDataSchema.parse(data);

    console.log("✅ Validation passed, creating organization:", validatedData);

    // Generate organization ID
    const organizationId = generateId();

    // Create organization using Better Auth
    await auth.api.createOrganization({
      body: {
        name: validatedData.name,
        slug: validatedData.slug,
        logo: validatedData.logo,
        metadata: validatedData.metadata,
      },
    });

    console.log("✅ Organization created successfully");
    return {
      success: true,
      data: { id: organizationId },
      message: "Organization created successfully",
    };
  } catch (error) {
    console.error("❌ Error creating organization:", error);

    if (error instanceof z.ZodError) {
      console.error("❌ Validation error:", error.errors);
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    if (error instanceof APIError) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create organization",
    };
  }
}

export async function getOrganizationById(organizationId: string) {
  try {
    console.log("🔍 Getting organization by ID:", organizationId);

    // Check authentication first
    const session = await getServerSession();
    if (!session?.user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const user = session.user;
    console.log("🔍 User role:", user.role);

    // FIXED: For system admins, query database directly to bypass Better Auth's membership checks
    if (isSuperAdmin(user.role ?? "")) {
      console.log("✅ System admin detected - querying database directly");
      
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

      // Also get member count for the organization
      const memberCount = await db
        .select()
        .from(members)
        .where(eq(members.organizationId, organizationId));

      console.log("✅ Organization retrieved successfully via direct database access");
      return {
        success: true,
        data: {
          ...organization,
          memberCount: memberCount.length,
        },
      };
    }

    // For non-system admins, use Better Auth API (which will check membership)
    console.log("🔍 Non-system admin - using Better Auth API");
    const organization = await auth.api.getFullOrganization({
      query: { organizationId },
      headers: await headers(),
    });

    console.log("✅ Organization retrieved successfully via Better Auth API");
    return {
      success: true,
      data: organization,
    };
  } catch (error) {
    console.error("❌ Error getting organization:", error);

    if (error instanceof APIError) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get organization",
    };
  }
}


export async function updateOrganization(
  organizationId: string,
  data: OrganizationData
) {
  try {
    console.log("✏️ Updating organization:", organizationId);
    console.log("✏️ Update data:", data);

    // Check authentication first
    const session = await getServerSession();
    if (!session?.user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const user = session.user;

    // Validate the data
    const validatedData = organizationDataSchema.parse(data);
    console.log("✅ Validation passed, updating organization:", validatedData);

    // FIXED: For system admins, update database directly to bypass Better Auth's membership checks
    if (isSuperAdmin(user.role ?? "")) {
      console.log("✅ System admin detected - updating database directly");
      
      await db
        .update(organizations)
        .set({
          name: validatedData.name,
          slug: validatedData.slug,
          logo: validatedData.logo,
          metadata: validatedData.metadata,
          updatedAt: new Date(),
        })
        .where(eq(organizations.id, organizationId));

      console.log("✅ Organization updated successfully via direct database access");
      return {
        success: true,
        message: "Organization updated successfully",
      };
    }

    // For non-system admins, use Better Auth API (which will check membership)
    await auth.api.updateOrganization({
      body: {
        data: {
          name: validatedData.name,
          slug: validatedData.slug,
          logo: validatedData.logo,
          metadata: validatedData.metadata,
        },
        organizationId,
      },
      headers: await headers(),
    });

    console.log("✅ Organization updated successfully via Better Auth API");
    return {
      success: true,
      message: "Organization updated successfully",
    };
  } catch (error) {
    console.error("❌ Error updating organization:", error);

    if (error instanceof z.ZodError) {
      console.error("❌ Validation error:", error.errors);
      return {
        success: false,
        error: error.errors[0].message,
      };
    }

    if (error instanceof APIError) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update organization",
    };
  }
}

export async function deleteOrganization(organizationId: string) {
  try {
    console.log("🗑️ Deleting organization:", organizationId);

    // Check authentication first
    const session = await getServerSession();
    if (!session?.user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const user = session.user;

    // FIXED: For system admins, delete from database directly to bypass Better Auth's membership checks
    if (isSuperAdmin(user.role ?? "")) {
      console.log("✅ System admin detected - deleting from database directly");
      
      // Note: You might want to soft delete instead of hard delete
      await db
        .delete(organizations)
        .where(eq(organizations.id, organizationId));

      console.log("✅ Organization deleted successfully via direct database access");
      return {
        success: true,
        message: "Organization deleted successfully",
      };
    }

    // For non-system admins, use Better Auth API (which will check membership)
    await auth.api.deleteOrganization({
      body: { organizationId },
      headers: await headers(),
    });

    console.log("✅ Organization deleted successfully via Better Auth API");
    return {
      success: true,
      message: "Organization deleted successfully",
    };
  } catch (error) {
    console.error("❌ Error deleting organization:", error);

    if (error instanceof APIError) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete organization",
    };
  }
}

// List organizations action (you might need this too)
export async function listOrganizations(params: {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  type?: string;
  status?: string;
}) {
  try {
    console.log("📋 Listing organizations with params:", params);

    // Check authentication first
    const session = await getServerSession();
    if (!session?.user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const user = session.user;

    // FIXED: For system admins, query database directly to get all organizations
    if (isSuperAdmin(user.role ?? "")) {
      console.log("✅ System admin detected - querying all organizations directly");
      
      let query = db.select().from(organizations);
      
      // Apply filters if provided
      // ... add filtering logic here ...
      
      const allOrgs = await query;
      
      // Apply pagination
      const startIndex = (params.page - 1) * params.pageSize;
      const endIndex = startIndex + params.pageSize;
      const paginatedOrgs = allOrgs.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: {
          data: paginatedOrgs,
          totalCount: allOrgs.length,
          page: params.page,
          pageSize: params.pageSize,
          totalPages: Math.ceil(allOrgs.length / params.pageSize),
          hasNextPage: endIndex < allOrgs.length,
          hasPreviousPage: params.page > 1,
        },
      };
    }

    // For non-system admins, use Better Auth API (which will filter based on membership)
    // ... implement non-admin logic here ...
    
    return {
      success: false,
      error: "Not implemented for non-admin users",
    };
  } catch (error) {
    console.error("❌ Error listing organizations:", error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to list organizations",
    };
  }
}

export type OrganizationResponse = Awaited<ReturnType<typeof getOrganizationById>>;