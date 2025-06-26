// actions/organization-actions.ts - Simple fix using existing requireSuperAdmin
'use server';
import { db } from "@/db";
import { organizations, members } from "@/db/schema";
import { eq, sql, and, desc, asc } from "drizzle-orm";
import { generateId } from "better-auth";
import { z } from "zod";
import { requireSuperAdmin } from "@/lib/auth-server";
import { ServerActionResponse } from "@/types/server-actions.types";

// Organization validation schema
const organizationDataSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  slug: z.string().min(1, "Organization slug is required"),
  logo: z.string().optional(),
  metadata: z.object({
    type: z.enum(["admin", "client"]),
    contactEmail: z.string().email("Valid email is required"),
    contactPhone: z.string().min(1, "Contact phone is required"),
    addressLine1: z.string().min(1, "Address is required"),
    addressLine2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
    timezone: z.string().min(1, "Timezone is required"),
    hipaaOfficer: z.string().optional(),
    businessAssociateAgreement: z.boolean().optional(),
    dataRetentionYears: z.string().optional(),
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
    }).optional(),
  }),
  createdAt: z.string().optional(),
});

export type OrganizationInput = z.infer<typeof organizationDataSchema>;

export async function createOrganization(data: OrganizationInput): Promise<ServerActionResponse> {
  try {
    console.log("🏢 Creating organization:", data.name);

    // Only super admins can create organizations
    await requireSuperAdmin();

    // Validate the data
    const validatedData = organizationDataSchema.parse(data);
    console.log("✅ Validation passed, creating organization");

    // Check if slug already exists
    const existingOrg = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.slug, validatedData.slug))
      .limit(1);

    if (existingOrg.length > 0) {
      return {
        success: false,
        error: `Organization with slug "${validatedData.slug}" already exists`,
      };
    }

    // Generate organization ID
    const organizationId = generateId();

    // Create organization
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

    console.log("✅ Organization created successfully:", createdOrg.id);
    
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

    // Handle validation errors
    if (error instanceof z.ZodError) {
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
      error: error instanceof Error ? error.message : "Failed to create organization",
    };
  }
}

export async function updateOrganization(
  organizationId: string,
  data: OrganizationInput
): Promise<ServerActionResponse> {
  try {
    console.log("✏️ Updating organization:", organizationId);

    // Only super admins can update organizations
    await requireSuperAdmin();

    // Validate the data
    const validatedData = organizationDataSchema.parse(data);
    console.log("✅ Validation passed, updating organization");

    // Check if slug already exists for other organizations
    if (data.slug) {
      const duplicateOrg = await db
        .select({ id: organizations.id })
        .from(organizations)
        .where(and(
          eq(organizations.slug, data.slug),
          sql`${organizations.id} != ${organizationId}`
        ))
        .limit(1);

      if (duplicateOrg.length > 0) {
        return {
          success: false,
          error: `Organization with slug "${data.slug}" already exists`,
        };
      }
    }

    // Get current organization
    const [existingOrg] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (!existingOrg) {
      return {
        success: false,
        error: "Organization not found",
      };
    }

    // Merge existing metadata with updates
    const updatedMetadata = {
      ...(existingOrg.metadata ?? {}),
      ...data.metadata,
    };

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.name) updateData.name = data.name;
    if (data.slug) updateData.slug = data.slug;
    if (data.logo !== undefined) updateData.logo = data.logo;
    updateData.metadata = updatedMetadata;

    console.log("📝 Updating organization in database");

    // Update organization
    const [updatedOrg] = await db
      .update(organizations)
      .set(updateData)
      .where(eq(organizations.id, organizationId))
      .returning();

    if (!updatedOrg) {
      return {
        success: false,
        error: "Update failed - no rows affected",
      };
    }

    console.log("✅ Organization updated successfully:", updatedOrg.id);
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

    // Handle validation errors
    if (error instanceof z.ZodError) {
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

    // Only super admins can view organizations
    await requireSuperAdmin();

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

    console.log("✅ Organization found:", organization.name);
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
    console.log("🗑️ Deleting organization:", organizationId);

    // Only super admins can delete organizations
    await requireSuperAdmin();

    // Check if organization exists
    const [existingOrg] = await db
      .select({ id: organizations.id, name: organizations.name })
      .from(organizations)
      .where(eq(organizations.id, organizationId))
      .limit(1);

    if (!existingOrg) {
      return {
        success: false,
        error: "Organization not found",
      };
    }

    // Check if organization has members
    const memberCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(members)
      .where(eq(members.organizationId, organizationId));

    if (memberCount[0]?.count > 0) {
      return {
        success: false,
        error: `Cannot delete organization because it has ${memberCount[0].count} member(s). Please remove all members first.`,
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
    console.log("📋 Listing organizations");

    // Only super admins can list organizations
    await requireSuperAdmin();

    // Build query conditions
    const conditions = [];
    
    if (params.search) {
      conditions.push(
        sql`(${organizations.name} ILIKE ${`%${params.search}%`} OR 
            ${organizations.slug} ILIKE ${`%${params.search}%`} OR
            ${organizations.metadata}->>'contactEmail' ILIKE ${`%${params.search}%`})`
      );
    }

    if (params.type) {
      conditions.push(sql`${organizations.metadata}->>'type' = ${params.type}`);
    }

    if (params.status === 'active') {
      conditions.push(sql`(${organizations.metadata}->>'isActive')::boolean = true`);
    } else if (params.status === 'inactive') {
      conditions.push(sql`(${organizations.metadata}->>'isActive')::boolean = false`);
    }

    if (params.contactEmail) {
      conditions.push(sql`${organizations.metadata}->>'contactEmail' ILIKE ${`%${params.contactEmail}%`}`);
    }

    if (params.createdAfter) {
      conditions.push(sql`${organizations.createdAt} >= ${new Date(params.createdAfter)}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalCountQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(organizations);
    
    if (whereClause) {
      totalCountQuery.where(whereClause);
    }

    const [{ count: totalCount }] = await totalCountQuery;

    // Get paginated results
    const offset = (params.page - 1) * params.pageSize;
    
    const sortBy = params.sortBy || 'createdAt';
    const sortDirection = params.sortDirection || 'desc';
    
    let orderClause;
    if (sortBy === 'name') {
      orderClause = sortDirection === 'asc' ? asc(organizations.name) : desc(organizations.name);
    } else if (sortBy === 'type') {
      orderClause = sortDirection === 'asc' 
        ? sql`${organizations.metadata}->>'type' ASC`
        : sql`${organizations.metadata}->>'type' DESC`;
    } else {
      orderClause = sortDirection === 'asc' ? asc(organizations.createdAt) : desc(organizations.createdAt);
    }

    const dataQuery = db
      .select()
      .from(organizations)
      .limit(params.pageSize)
      .offset(offset)
      .orderBy(orderClause);

    if (whereClause) {
      dataQuery.where(whereClause);
    }

    const data = await dataQuery;

    const totalPages = Math.ceil(totalCount / params.pageSize);

    console.log(`✅ Listed ${data.length} organizations`);

    return {
      success: true,
      data: {
        data,
        pagination: {
          page: params.page,
          pageSize: params.pageSize,
          totalCount,
          totalPages,
          hasNextPage: params.page < totalPages,
          hasPreviousPage: params.page > 1,
        },
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
export async function checkSlugAvailability(slug: string, excludeOrgId?: string): Promise<{ available: boolean; suggestedSlug?: string }> {
  try {
    const { db } = await import("@/db")
    const { organizations } = await import("@/db/schema")
    const { eq, and, ne, SQL } = await import("drizzle-orm")

    // Build query with proper typing
    let query
    if (excludeOrgId) {
      const condition = and(eq(organizations.slug, slug), ne(organizations.id, excludeOrgId))
      if (!condition) {
        throw new Error("Failed to build query condition")
      }
      query = condition
    } else {
      query = eq(organizations.slug, slug)
    }

    const existing = await db.select().from(organizations).where(query).limit(1)

    if (existing.length === 0) {
      return { available: true }
    }

    // Generate suggested slug
    let counter = 1
    let suggestedSlug = `${slug}-${counter}`
    
    while (true) {
      let suggestedQuery
      if (excludeOrgId) {
        const condition = and(eq(organizations.slug, suggestedSlug), ne(organizations.id, excludeOrgId))
        if (!condition) {
          throw new Error("Failed to build suggested query condition")
        }
        suggestedQuery = condition
      } else {
        suggestedQuery = eq(organizations.slug, suggestedSlug)
      }

      const suggestedExists = await db.select().from(organizations).where(suggestedQuery).limit(1)
      
      if (suggestedExists.length === 0) {
        break
      }
      
      counter++
      suggestedSlug = `${slug}-${counter}`
    }

    return { 
      available: false, 
      suggestedSlug 
    }

  } catch (error) {
    console.error("Slug check error:", error)
    return { available: false }
  }
}