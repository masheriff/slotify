/// actions/organization-actions.ts - COMPLETE FIX
"use server";
import { db } from "@/db";
import { organizations, members } from "@/db/schema";
import { eq, sql, and, desc, asc } from "drizzle-orm";
import { generateId } from "better-auth";
import { z } from "zod";
import { requireSuperAdmin, getServerSession } from "@/lib/auth-server";
import { ServerActionResponse } from "@/types/server-actions.types";
import { isSuperAdmin } from "@/lib/permissions/healthcare-access-control";
import { ListDataResult, Organization } from "@/types";
import { organizationDataSchema, OrganizationInput } from "@/schemas";
import { ExistingMetadata } from "@/types/action.types";

// FIXED: Server schema matches form schema exactly



export async function updateOrganization(
  organizationId: string,
  data: OrganizationInput
): Promise<ServerActionResponse> {
  try {
    console.log("✏️ Updating organization:", organizationId);

    // Use direct role check for system admin
    const session = await getServerSession();
    if (!session?.user) {
      throw new Error("Authentication required");
    }

    // Direct system admin check instead of membership-based check
    if (!isSuperAdmin(session.user.role ?? "")) {
      throw new Error("System admin access required");
    }

    // Validate the data
    const validatedData = organizationDataSchema.parse(data);
    console.log("✅ Validation passed, updating organization");

    // Check if slug already exists for other organizations
    if (data.slug) {
      const duplicateOrg = await db
        .select({ id: organizations.id })
        .from(organizations)
        .where(
          and(
            eq(organizations.slug, data.slug),
            sql`${organizations.id} != ${organizationId}`
          )
        )
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
 

    const existingMetadata: ExistingMetadata =
      (existingOrg.metadata as ExistingMetadata) || {};
    
    // Prevent deactivating admin organizations
    if (existingMetadata.type === "admin" && validatedData.metadata.isActive === false) {
      return {
        success: false,
        error: "Admin organizations cannot be deactivated. Admin organizations must remain active to ensure system functionality.",
      };
    }

    // FIXED: Properly merge metadata while preserving existing settings
    const updatedMetadata = {
      ...existingMetadata,
      ...validatedData.metadata,
      // Ensure the isActive value from the form is properly set
      isActive: validatedData.metadata.isActive,
    };

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.slug) updateData.slug = validatedData.slug;
    if (validatedData.logo !== undefined) updateData.logo = validatedData.logo;
    updateData.metadata = updatedMetadata;

    console.log(
      "📝 Database update data:",
      JSON.stringify(updateData, null, 2)
    );

    // Update organization directly in database (bypassing Better Auth organization middleware)
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
        organization: updatedOrg,
      },
      message: "Organization updated successfully",
    };
  } catch (error) {
    console.error("❌ Error updating organization:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.errors);
      return {
        success: false,
        error: error.errors[0].message,
        validationErrors: error.errors.map((err) => ({
          message: err.message,
          path: err.path,
          code: err.code,
        })),
      };
    }

    // Handle database constraint errors
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "23505") {
        return {
          success: false,
          error: "An organization with this slug already exists",
        };
      }
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

// Rest of the organization actions remain the same...
export async function createOrganization(
  data: OrganizationInput
): Promise<ServerActionResponse> {
  try {
    console.log("🔧 Creating organization");

    const session = await getServerSession();
    if (!session?.user) {
      throw new Error("Authentication required");
    }

    if (!isSuperAdmin(session.user.role ?? "")) {
      throw new Error("System admin access required");
    }

    const validatedData = organizationDataSchema.parse(data);
    console.log("✅ Validation passed, creating organization");

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

    const organizationId = generateId();

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
        organization: createdOrg,
      },
      message: "Organization created successfully",
    };
  } catch (error) {
    console.error("❌ Error creating organization:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
        validationErrors: error.errors.map((err) => ({
          message: err.message,
          path: err.path,
          code: err.code,
        })),
      };
    }

    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "23505") {
        return {
          success: false,
          error: "An organization with this slug already exists",
        };
      }
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

export async function getOrganizationById(
  organizationId: string
): Promise<ServerActionResponse<Organization>> {
  try {
    console.log("🔍 Getting organization by ID:", organizationId);

    // FIXED: Use direct role check for system admin
    const session = await getServerSession();
    if (!session?.user) {
      throw new Error("Authentication required");
    }

    // FIXED: Direct system admin check instead of membership-based check
    if (!isSuperAdmin(session.user.role ?? "")) {
      throw new Error("System admin access required");
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

    console.log("✅ Organization found:", organization.name);
    return {
      success: true,
      data: {
        ...organization,
        slug: organization.slug ?? "",
        logo: organization.logo ?? undefined,
        metadata: organization.metadata as import("@/types").Organization["metadata"],
      },
    };
  } catch (error) {
    console.error("❌ Error getting organization:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get organization",
    };
  }
}

// ... rest of your existing functions remain unchanged

// ... rest of your existing functions remain unchanged

export async function deleteOrganization(
  organizationId: string
): Promise<ServerActionResponse> {
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
        organization: deletedOrg,
      },
      message: `Organization "${deletedOrg.name}" deleted successfully`,
    };
  } catch (error) {
    console.error("❌ Error deleting organization:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete organization",
    };
  }
}

export async function listOrganizations(params: {
 page: number;
 pageSize: number;
 search?: string;
 sortBy?: string;
 sortDirection?: "asc" | "desc";
 type?: string;
 status?: string;
 contactEmail?: string;
 createdAfter?: string;
}): Promise<ListDataResult<Organization>> {
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

   if (params.status === "active") {
     conditions.push(
       sql`(${organizations.metadata}->>'isActive')::boolean = true`
     );
   } else if (params.status === "inactive") {
     conditions.push(
       sql`(${organizations.metadata}->>'isActive')::boolean = false`
     );
   }

   if (params.contactEmail) {
     conditions.push(
       sql`${organizations.metadata}->>'contactEmail' ILIKE ${`%${params.contactEmail}%`}`
     );
   }

   if (params.createdAfter) {
     conditions.push(
       sql`${organizations.createdAt} >= ${new Date(params.createdAfter)}`
     );
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

   const sortBy = params.sortBy || "createdAt";
   const sortDirection = params.sortDirection || "desc";

   let orderClause;
   if (sortBy === "name") {
     orderClause =
       sortDirection === "asc"
         ? asc(organizations.name)
         : desc(organizations.name);
   } else if (sortBy === "type") {
     orderClause =
       sortDirection === "asc"
         ? sql`${organizations.metadata}->>'type' ASC`
         : sql`${organizations.metadata}->>'type' DESC`;
   } else {
     orderClause =
       sortDirection === "asc"
         ? asc(organizations.createdAt)
         : desc(organizations.createdAt);
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
     data: data.map(org => ({
       ...org,
       slug: org.slug ?? "",
       logo: org.logo ?? undefined,
       metadata: org.metadata as import("@/types").OrganizationMetadata,
     })),
     pagination: {
       page: params.page,
       pageSize: params.pageSize,
       totalCount,
       totalPages,
       hasNextPage: params.page < totalPages,
       hasPreviousPage: params.page > 1,
     },
   };
 } catch (error) {
   console.error("❌ Error listing organizations:", error);
   return {
     success: false,
     data: [],
     pagination: {
       page: params.page,
       pageSize: params.pageSize,
       totalCount: 0,
       totalPages: 0,
       hasNextPage: false,
       hasPreviousPage: false,
     },
     error:
       error instanceof Error ? error.message : "Failed to list organizations",
   };
 }
}
export async function checkSlugAvailability(
  slug: string,
  excludeOrgId?: string
): Promise<{ available: boolean; suggestedSlug?: string }> {
  try {
    const { db } = await import("@/db");
    const { organizations } = await import("@/db/schema");
    const { eq, and, ne, SQL } = await import("drizzle-orm");

    // Build query with proper typing
    let query;
    if (excludeOrgId) {
      const condition = and(
        eq(organizations.slug, slug),
        ne(organizations.id, excludeOrgId)
      );
      if (!condition) {
        throw new Error("Failed to build query condition");
      }
      query = condition;
    } else {
      query = eq(organizations.slug, slug);
    }

    const existing = await db
      .select()
      .from(organizations)
      .where(query)
      .limit(1);

    if (existing.length === 0) {
      return { available: true };
    }

    // Generate suggested slug
    let counter = 1;
    let suggestedSlug = `${slug}-${counter}`;

    while (true) {
      let suggestedQuery;
      if (excludeOrgId) {
        const condition = and(
          eq(organizations.slug, suggestedSlug),
          ne(organizations.id, excludeOrgId)
        );
        if (!condition) {
          throw new Error("Failed to build suggested query condition");
        }
        suggestedQuery = condition;
      } else {
        suggestedQuery = eq(organizations.slug, suggestedSlug);
      }

      const suggestedExists = await db
        .select()
        .from(organizations)
        .where(suggestedQuery)
        .limit(1);

      if (suggestedExists.length === 0) {
        break;
      }

      counter++;
      suggestedSlug = `${slug}-${counter}`;
    }

    return {
      available: false,
      suggestedSlug,
    };
  } catch (error) {
    console.error("Slug check error:", error);
    return { available: false };
  }
}
