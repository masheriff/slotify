// actions/organization-actions.ts - Simple DB-only approach
"use server";

import { requireSuperAdmin } from "@/lib/auth-server";
import { db } from "@/db";
import { organizations, members } from "@/db/schema";
import { eq, count, like, ilike, or, gte, sql } from "drizzle-orm";

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
          acc ? sql`${acc} AND ${condition}` : condition, 
          null as any
        )
      : undefined;

    // Get total count for pagination
    const [{ count: totalCount }] = await db
      .select({ count: count() })
      .from(organizations)
      .where(whereClause);

    // Build order by clause
    let orderByClause;
    if (params.sortBy) {
      switch (params.sortBy) {
        case "name":
          orderByClause = params.sortDirection === "asc" 
            ? organizations.name 
            : sql`${organizations.name} DESC`;
          break;
        case "createdAt":
          orderByClause = params.sortDirection === "asc" 
            ? organizations.createdAt 
            : sql`${organizations.createdAt} DESC`;
          break;
        case "type":
          orderByClause = params.sortDirection === "asc" 
            ? sql`${organizations.metadata}->>'type'`
            : sql`${organizations.metadata}->>'type' DESC`;
          break;
        default:
          orderByClause = organizations.name;
      }
    } else {
      orderByClause = organizations.name; // Default sort
    }

    // Build and execute main query
    const offset = (params.page - 1) * params.pageSize;
    
    let mainQuery = db
      .select({
        id: organizations.id,
        name: organizations.name,
        slug: organizations.slug,
        createdAt: organizations.createdAt,
        updatedAt: organizations.updatedAt,
        metadata: organizations.metadata,
        logo: organizations.logo,
      })
      .from(organizations)
      .orderBy(orderByClause)
      .limit(params.pageSize)
      .offset(offset);

    // Apply where clause if exists
    const orgs = whereClause 
      ? await mainQuery.where(whereClause)
      : await mainQuery;

    console.log('📋 DB organizations loaded:', {
      count: orgs.length,
      totalCount,
      page: params.page,
      pageSize: params.pageSize
    });

    // Enrich with member counts
    const enrichedOrgs = await Promise.all(
      orgs.map(async (org) => {
        try {
          // Get member count
          const [memberCountResult] = await db
            .select({ count: count() })
            .from(members)
            .where(eq(members.organizationId, org.id));

          const memberCount = memberCountResult?.count || 0;

          return {
            id: org.id,
            name: org.name,
            slug: org.slug,
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

// Keep other functions that might still need Better Auth
export async function getOrganizationById(organizationId: string) {
  try {
    await requireSuperAdmin();

    // For individual organization, you can still use Better Auth or DB
    // Using DB for consistency:
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