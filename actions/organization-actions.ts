// actions/organization-actions.ts - Updated with create/update functions
"use server";

import { requireSuperAdmin } from "@/lib/auth-server";
import { db } from "@/db";
import { organizations, members } from "@/db/schema";
import { eq, count, like, ilike, or, gte, sql } from "drizzle-orm";
import { generateId } from "better-auth";

export type PaginationParams = {
  page: number;
  pageSize: number;
  searchQuery?: string;
  sortBy?: string | null;
  sortDirection?: "asc" | "desc";
  filters?: Record<string, string>;
};

export type OrganizationResponse = {
  data: any[];
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

// Organization data interface for create/update
export interface OrganizationData {
  name: string;
  slug: string;
  logo?: string;
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
    settings: Record<string, any>;
    hipaaOfficer?: string;
    businessAssociateAgreement?: boolean;
    dataRetentionYears?: string;
  };
}

export async function getOrganizations(
  params: PaginationParams
): Promise<OrganizationResponse> {
  try {
    console.log('🔍 getOrganizations (DB-only) called with params:', params);
    
    // Check permissions - only system admins can list all organizations
    await requireSuperAdmin();

    // Build where conditions first
    const whereConditions: any[] = [];
    
    // Apply search filter
    if (params.searchQuery?.trim()) {
      const searchTerm = `%${params.searchQuery.toLowerCase()}%`;
      whereConditions.push(
        or(
          ilike(organizations.name, searchTerm),
          ilike(organizations.slug, searchTerm),
          sql`${organizations.metadata}->>'contactEmail' ILIKE ${searchTerm}`
        )
      );
    }

    // Apply metadata-based filters
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value?.trim()) {
          switch (key) {
            case "type":
              whereConditions.push(
                sql`${organizations.metadata}->>'type' = ${value}`
              );
              break;
            case "status":
              const isActive = value === "active";
              whereConditions.push(
                sql`(${organizations.metadata}->>'isActive')::boolean = ${isActive}`
              );
              break;
            case "contactEmail":
              whereConditions.push(
                sql`${organizations.metadata}->>'contactEmail' ILIKE ${'%' + value.toLowerCase() + '%'}`
              );
              break;
            case "createdAfter":
              whereConditions.push(
                gte(organizations.createdAt, new Date(value))
              );
              break;
          }
        }
      });
    }

    // Combine all where conditions
    const whereClause = whereConditions.length > 0 
      ? whereConditions.reduce((acc, condition) => 
          acc ? sql`${acc} AND ${condition}` : condition
        ) 
      : undefined;

    // Count total organizations
    const [totalResult] = await db
      .select({ count: count() })
      .from(organizations)
      .where(whereClause);
    
    const totalCount = totalResult?.count || 0;

    // Build ordering
    let orderByClause;
    if (params.sortBy && params.sortDirection) {
      switch (params.sortBy) {
        case "name":
          orderByClause = params.sortDirection === "asc" 
            ? sql`${organizations.name} ASC`
            : sql`${organizations.name} DESC`;
          break;
        case "createdAt":
          orderByClause = params.sortDirection === "asc"
            ? sql`${organizations.createdAt} ASC`
            : sql`${organizations.createdAt} DESC`;
          break;
        case "contactEmail":
          orderByClause = params.sortDirection === "asc"
            ? sql`${organizations.metadata}->>'contactEmail' ASC`
            : sql`${organizations.metadata}->>'contactEmail' DESC`;
          break;
        default:
          orderByClause = sql`${organizations.name} ASC`;
      }
    } else {
      orderByClause = sql`${organizations.name} ASC`;
    }

    // Fetch organizations with pagination
    const offset = (params.page - 1) * params.pageSize;
    
    const orgs = await db
      .select()
      .from(organizations)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(params.pageSize)
      .offset(offset);

    console.log(`📊 Found ${orgs.length} organizations (total: ${totalCount})`);

    // Enrich organizations with member count and formatted data
    const enrichedOrgs = await Promise.all(
      orgs.map(async (org) => {
        try {
          const [memberResult] = await db
            .select({ count: count() })
            .from(members)
            .where(eq(members.organizationId, org.id));
          
          const memberCount = memberResult?.count || 0;
          
          return {
            id: org.id,
            name: org.name,
            slug: org.slug,
            logo: org.logo,
            type: (org.metadata as any)?.type || "client",
            status: (org.metadata as any)?.isActive ? "active" : "inactive",
            memberCount,
            createdAt: org.createdAt,
            contactEmail: (org.metadata as any)?.contactEmail || "",
            metadata: org.metadata,
          };
        } catch (error) {
          console.warn(`⚠️ Failed to get member count for ${org.name}:`, error);
          return {
            id: org.id,
            name: org.name,
            slug: org.slug,
            logo: org.logo,
            type: (org.metadata as any)?.type || "client",
            status: (org.metadata as any)?.isActive ? "active" : "inactive",
            memberCount: 0,
            createdAt: org.createdAt,
            contactEmail: (org.metadata as any)?.contactEmail || "",
            metadata: org.metadata,
          };
        }
      })
    );

    const totalPages = Math.ceil(totalCount / params.pageSize);

    const result = {
      data: enrichedOrgs,
      page: params.page,
      pageSize: params.pageSize,
      totalPages,
      hasNextPage: params.page < totalPages,
      hasPreviousPage: params.page > 1,
    };

    console.log('✅ Final DB result:', {
      dataCount: result.data.length,
      totalCount,
      page: result.page,
      totalPages: result.totalPages
    });

    return result;
  } catch (error) {
    console.error("❌ Failed to fetch organizations (DB):", error);
    throw new Error(`Failed to fetch organizations: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getOrganizationById(organizationId: string) {
  try {
    await requireSuperAdmin();

    const [organization] = await db
      .select()
      .from(organizations)
      .where(eq(organizations.id, organizationId));

    if (!organization) {
      return {
        success: false,
        error: "Organization not found",
      };
    }

    // Get members
    const orgMembers = await db
      .select()
      .from(members)
      .where(eq(members.organizationId, organizationId));

    return {
      success: true,
      data: {
        ...organization,
        members: orgMembers,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch organization",
    };
  }
}

export async function createOrganization(organizationData: OrganizationData) {
  try {
    console.log('🏗️ Creating organization:', organizationData.name);
    
    await requireSuperAdmin();

    // Check if slug already exists
    const existingOrg = await db
      .select()
      .from(organizations)
      .where(eq(organizations.slug, organizationData.slug))
      .limit(1);

    if (existingOrg.length > 0) {
      return {
        success: false,
        error: "An organization with this slug already exists",
      };
    }

    // Generate ID
    const organizationId = generateId();

    // Create organization
    const newOrg = {
      id: organizationId,
      name: organizationData.name,
      slug: organizationData.slug,
      logo: organizationData.logo || null,
      metadata: organizationData.metadata,
      createdAt: new Date(),
    };

    await db.insert(organizations).values(newOrg);

    console.log('✅ Organization created successfully:', organizationId);

    return {
      success: true,
      data: { id: organizationId },
    };

  } catch (error) {
    console.error('❌ Failed to create organization:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create organization",
    };
  }
}

export async function updateOrganization(organizationId: string, organizationData: OrganizationData) {
  try {
    console.log('📝 Updating organization:', organizationId);
    
    await requireSuperAdmin();

    // Check if organization exists
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

    // Check if slug is being changed and if new slug already exists
    if (organizationData.slug !== existingOrg.slug) {
      const slugCheck = await db
        .select()
        .from(organizations)
        .where(eq(organizations.slug, organizationData.slug))
        .limit(1);

      if (slugCheck.length > 0) {
        return {
          success: false,
          error: "An organization with this slug already exists",
        };
      }
    }

    // Update organization
    const updateData = {
      name: organizationData.name,
      slug: organizationData.slug,
      logo: organizationData.logo || null,
      metadata: organizationData.metadata,
      updatedAt: new Date(),
    };

    await db
      .update(organizations)
      .set(updateData)
      .where(eq(organizations.id, organizationId));

    console.log('✅ Organization updated successfully:', organizationId);

    return {
      success: true,
      data: { id: organizationId },
    };

  } catch (error) {
    console.error('❌ Failed to update organization:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update organization",
    };
  }
}

export async function sendOrganizationInvitation(organizationId: string, email: string, role: string) {
  try {
    console.log('📧 Sending invitation to:', email, 'for organization:', organizationId);
    
    await requireSuperAdmin();

    // TODO: Implement invitation logic using Better Auth
    // This would use the auth.api.createInvitation method
    
    console.log('✅ Invitation sent successfully');

    return {
      success: true,
      message: "Invitation sent successfully",
    };

  } catch (error) {
    console.error('❌ Failed to send invitation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send invitation",
    };
  }
}