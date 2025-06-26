// Updated organization-actions.ts - Direct Database Approach using existing types

"use server";

import { z } from "zod";
import { generateId } from "better-auth";
import { requireSuperAdmin, getServerSession } from "@/lib/auth-server";
import { isSuperAdmin } from "@/lib/permissions/healthcare-access-control";
import { db } from "@/db";
import { organizations, members } from "@/db/schema";
import { eq, and, like, or, desc, asc, count, sql, gte } from "drizzle-orm";
import { ServerActionResponse } from "@/types/server-actions.types";
import { OrganizationMetadata } from "@/types/organization.types";

// Organization data validation schema using existing types
const organizationDataSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  slug: z.string().min(1, "Organization slug is required"),
  logo: z.string().optional().refine((val) => {
    if (!val || val.trim() === '') return true;
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
    settings: z.object({
      features: z.object({
        multiTenant: z.boolean().optional(),
        advancedReporting: z.boolean().optional(),
        apiAccess: z.boolean().optional(),
        customBranding: z.boolean().optional(),
      }).optional(),
      billing: z.object({
        plan: z.string().optional(),
        status: z.string().optional(),
      }).optional(),
      notifications: z.object({
        email: z.boolean().optional(),
        sms: z.boolean().optional(),
      }).optional(),
    }).default({}),
    hipaaOfficer: z.string().optional(),
    businessAssociateAgreement: z.boolean().optional(),
    dataRetentionYears: z.string().optional(),
  }),
});

// Input type for organization data
export interface OrganizationInput {
  name: string;
  slug: string;
  logo?: string;
  createdAt: Date | string;
  metadata: OrganizationMetadata;
}

export async function createOrganization(data: OrganizationInput): Promise<ServerActionResponse> {
  try {
    console.log("🏢 Creating organization:", data.name);

    await requireSuperAdmin();

    // Validate the data
    const validatedData = organizationDataSchema.parse(data);
    console.log("✅ Validation passed, creating organization:", validatedData);

    // Check if slug already exists
    const existingOrg = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, validatedData.slug))
      .limit(1);

    if (existingOrg.length > 0) {
      console.log("❌ Slug already exists:", validatedData.slug);
      return {
        success: false,
        error: `Organization with slug "${validatedData.slug}" already exists`,
      };
    }

    // Generate organization ID
    const organizationId = generateId();

    // Create organization directly in database
    const [createdOrg] = await db
      .insert(organizations)
      .values({
        id: organizationId,
        name: validatedData.name,
        slug: validatedData.slug,
        logo: validatedData.logo,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: validatedData.metadata,
      })
      .returning();

    console.log("✅ Organization created successfully:", createdOrg);
    
    return {
      success: true,
      data: { 
        id: createdOrg.id,
        organization: createdOrg
      },
      message: "Organization created successfully",
    };
    
  } catch (error) {
    console.error("❌ Error creating organization:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      console.error("❌ Validation error:", error.errors);
      return {
        success: false,
        error: error.errors[0].message,
        validationErrors: error.errors.map(err => ({
          message: err.message,
          path: err.path,
          code: err.code
        })),
      };
    }

    // Handle database constraint errors (like duplicate slug)
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === '23505') { // PostgreSQL unique constraint violation
        return {
          success: false,
          error: "An organization with this slug already exists",
        };
      }
    }

    // Handle other errors
    const errorMessage = error instanceof Error ? error.message : "Failed to create organization";
    console.error("❌ Unknown error:", errorMessage);
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function updateOrganization(
  organizationId: string,
  data: OrganizationInput
): Promise<ServerActionResponse> {
  try {
    console.log("✏️ Updating organization:", organizationId);

    // Check authentication first
    const session = await getServerSession();
    if (!session?.user) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const user = session.user;

    // Only super admins can update organizations
    if (!isSuperAdmin(user.role ?? "")) {
      return {
        success: false,
        error: "Insufficient permissions to update organization",
      };
    }

    // Validate the data
    const validatedData = organizationDataSchema.parse(data);
    console.log("✅ Validation passed, updating organization:", validatedData);

    // Check if slug already exists for other organizations
    const existingOrg = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(and(
        eq(organizations.slug, validatedData.slug),
        eq(organizations.id, organizationId)
      ))
      .limit(1);

    if (existingOrg.length === 0) {
      // Check if another org has this slug
      const duplicateOrg = await db
        .select({ id: organizations.id })
        .from(organizations)
        .where(eq(organizations.slug, validatedData.slug))
        .limit(1);

      if (duplicateOrg.length > 0) {
        return {
          success: false,
          error: `Organization with slug "${validatedData.slug}" already exists`,
        };
      }
    }

    // Update organization in database
    const [updatedOrg] = await db
      .update(organizations)
      .set({
        name: validatedData.name,
        slug: validatedData.slug,
        logo: validatedData.logo,
        metadata: validatedData.metadata,
        updatedAt: new Date(),
      })
      .where(eq(organizations.id, organizationId))
      .returning();

    if (!updatedOrg) {
      return {
        success: false,
        error: "Organization not found or update failed",
      };
    }

    console.log("✅ Organization updated successfully:", updatedOrg);
    return {
      success: true,
      data: { 
        id: updatedOrg.id,
        organization: updatedOrg
      },
      message: "Organization updated successfully",
    };
    
  } catch (error) {
    console.error("❌ Error updating organization:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      console.error("❌ Validation error:", error.errors);
      return {
        success: false,
        error: error.errors[0].message,
        validationErrors: error.errors.map(err => ({
          message: err.message,
          path: err.path,
          code: err.code
        })),
      };
    }

    // Handle database constraint errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === '23505') {
        return {
          success: false,
          error: "An organization with this slug already exists",
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update organization",
    };
  }
}

export async function getOrganizationById(organizationId: string): Promise<ServerActionResponse> {
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

    // For system admins, query database directly
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
      const [memberCountResult] = await db
        .select({ count: count() })
        .from(members)
        .where(eq(members.organizationId, organizationId));

      console.log("✅ Organization retrieved successfully");
      return {
        success: true,
        data: {
          ...organization,
          memberCount: memberCountResult?.count || 0,
        },
      };
    }

    // For non-system admins, check if they have access to this organization
    const [userMembership] = await db
      .select()
      .from(members)
      .where(and(
        eq(members.userId, user.id),
        eq(members.organizationId, organizationId)
      ))
      .limit(1);

    if (!userMembership) {
      return {
        success: false,
        error: "Access denied - you don't have access to this organization",
      };
    }

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

    console.log("✅ Organization retrieved successfully");
    return {
      success: true,
      data: organization,
    };
  } catch (error) {
    console.error("❌ Error getting organization:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get organization",
    };
  }
}

export async function deleteOrganization(organizationId: string): Promise<ServerActionResponse> {
  try {
    console.log("🗑️ Attempting to delete organization:", organizationId);

    // Check authentication and permissions
    await requireSuperAdmin();

    // Validate organization exists
    const existingOrg = await db
      .select({ 
        id: organizations.id, 
        name: organizations.name 
      })
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (existingOrg.length === 0) {
      return {
        success: false,
        error: "Organization not found",
      };
    }

    // Check if organization has members
    const [memberCount] = await db
      .select({ count: count() })
      .from(members)
      .where(eq(members.organizationId, organizationId));

    if (memberCount.count > 0) {
      return {
        success: false,
        error: `Cannot delete organization "${existingOrg[0].name}" because it has ${memberCount.count} member(s). Please remove all members before deleting the organization.`,
      };
    }

    // Delete the organization
    const [deletedOrg] = await db
      .delete(organizations)
      .where(eq(organizations.id, organizationId))
      .returning({ id: organizations.id, name: organizations.name });

    if (!deletedOrg) {
      return {
        success: false,
        error: "Failed to delete organization",
      };
    }

    console.log("✅ Organization deleted successfully:", deletedOrg);
    
    return {
      success: true,
      data: { 
        id: deletedOrg.id,
        organization: deletedOrg
      },
      message: `Organization "${deletedOrg.name}" deleted successfully`,
    };
    
  } catch (error) {
    console.error("❌ Error deleting organization:", error);

    // Handle database constraint errors
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === '23503') { // Foreign key constraint violation
        return {
          success: false,
          error: "Cannot delete organization because it has associated data. Please remove all associated records first.",
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete organization",
    };
  }
}

export async function listOrganizations(params: {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  type?: string;
  status?: string;
  contactEmail?: string;
  createdAfter?: string;
}): Promise<ServerActionResponse> {
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

    // For system admins, query database directly to get all organizations
    if (isSuperAdmin(user.role ?? "")) {
      console.log("✅ System admin detected - querying all organizations directly");
      
      // Build where conditions
      const whereConditions = [];
      
      // Search condition
      if (params.search) {
        whereConditions.push(
          or(
            like(organizations.name, `%${params.search}%`),
            like(organizations.slug, `%${params.search}%`)
          )
        );
      }

      // FIXED: Add type filter
      if (params.type && params.type.trim()) {
        console.log("🎯 Applying type filter:", params.type);
        whereConditions.push(
          sql`${organizations.metadata}->>'type' = ${params.type.trim()}`
        );
      }

      // FIXED: Add status filter (based on isActive)
      if (params.status && params.status.trim()) {
        console.log("🎯 Applying status filter:", params.status);
        const isActive = params.status.trim() === 'active';
        whereConditions.push(
          sql`(${organizations.metadata}->>'isActive')::boolean = ${isActive}`
        );
      }

      // FIXED: Add contact email filter
      if (params.contactEmail && params.contactEmail.trim()) {
        console.log("🎯 Applying contact email filter:", params.contactEmail);
        whereConditions.push(
          sql`${organizations.metadata}->>'contactEmail' ILIKE ${'%' + params.contactEmail.trim() + '%'}`
        );
      }

      // FIXED: Add created after filter
      if (params.createdAfter && params.createdAfter.trim()) {
        console.log("🎯 Applying created after filter:", params.createdAfter);
        try {
          const filterDate = new Date(params.createdAfter.trim());
          if (!isNaN(filterDate.getTime())) {
            whereConditions.push(
              gte(organizations.createdAt, filterDate)
            );
          }
        } catch (error) {
          console.warn("Invalid createdAfter filter:", params.createdAfter);
        }
      }
      
      // Build the main query
      const baseQuery = db.select().from(organizations);
      const finalQuery = whereConditions.length > 0 
        ? baseQuery.where(and(...whereConditions))
        : baseQuery;
      
      // Apply sorting
      let sortedQuery;
      const sortDirection = params.sortDirection === 'desc' ? desc : asc;
      
      if (params.sortBy === 'name') {
        sortedQuery = finalQuery.orderBy(sortDirection(organizations.name));
      } else if (params.sortBy === 'createdAt') {
        sortedQuery = finalQuery.orderBy(sortDirection(organizations.createdAt));
      } else if (params.sortBy === 'type') {
        sortedQuery = finalQuery.orderBy(
          sortDirection(sql`${organizations.metadata}->>'type'`)
        );
      } else {
        sortedQuery = finalQuery.orderBy(desc(organizations.createdAt));
      }
      
      // Apply pagination
      const offset = (params.page - 1) * params.pageSize;
      const paginatedQuery = sortedQuery.limit(params.pageSize).offset(offset);
      
      // Build count query
      const baseCountQuery = db.select({ count: count() }).from(organizations);
      const countQuery = whereConditions.length > 0
        ? baseCountQuery.where(and(...whereConditions))
        : baseCountQuery;
      
      // Execute queries
      const [allOrgs, totalCountResult] = await Promise.all([
        paginatedQuery,
        countQuery
      ]);
      
      const totalCount = totalCountResult[0]?.count || 0;
      const totalPages = Math.ceil(totalCount / params.pageSize);

      console.log("📊 Query results:", {
        totalCount,
        totalPages,
        currentPage: params.page,
        returnedOrgs: allOrgs.length
      });
      
      return {
        success: true,
        data: {
          data: allOrgs,
          totalCount,
          page: params.page,
          pageSize: params.pageSize,
          totalPages,
          hasNextPage: params.page < totalPages,
          hasPreviousPage: params.page > 1,
        },
      };
    }

    // For non-system admins, get organizations they're members of
    const userOrganizations = await db
      .select({
        organization: organizations,
      })
      .from(members)
      .innerJoin(organizations, eq(members.organizationId, organizations.id))
      .where(eq(members.userId, user.id));
    
    return {
      success: true,
      data: {
        data: userOrganizations.map(item => item.organization),
        totalCount: userOrganizations.length,
        page: 1,
        pageSize: userOrganizations.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
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