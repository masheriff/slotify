// actions/organization-actions.ts - FIXED VERSION - No infinite loops
"use server";

import { requireSuperAdmin } from "@/lib/auth-server";
import { db } from "@/db";
import { organizations, members } from "@/db/schema";
import { eq, count, ilike, or, gte, sql, and } from "drizzle-orm";
import { generateId } from "better-auth";
import { auth } from "@/lib/auth";
import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import {
  HEALTHCARE_RESOURCES,
  HEALTHCARE_ROLES,
} from "@/lib/permissions/healthcare-permissions-constants";
import { z } from "zod";

export type PaginationParams = {
  page: number;
  pageSize: number;
  searchQuery?: string;
  sortBy?: string | null;
  sortDirection?: "asc" | "desc";
  filters?: Record<string, string>;
};

export type OrganizationResponse = {
  data: OrganizationData[];
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount: number; // Make this required
};

export async function listOrganizations(
  params: PaginationParams
): Promise<OrganizationResponse> {
  try {
    console.log("📋 Listing organizations with params:", params);

    await requireSuperAdmin();

    const { page, pageSize, searchQuery, sortBy, sortDirection, filters } = params;
    const offset = (page - 1) * pageSize;

    // Build where conditions
    const conditions = [];

    if (searchQuery && searchQuery.trim()) {
      conditions.push(
        or(
          ilike(organizations.name, `%${searchQuery.trim()}%`),
          ilike(organizations.slug, `%${searchQuery.trim()}%`)
        )
      );
    }

    // Type filter - check metadata correctly
    if (filters?.type && (filters.type === "admin" || filters.type === "client")) {
      conditions.push(
        sql`${organizations.metadata}->>'type' = ${filters.type}`
      );
    }

    // Date filter - handle createdAfter properly
    if (filters?.createdAfter && filters.createdAfter.trim()) {
      try {
        const filterDate = new Date(filters.createdAfter.trim());
        if (!isNaN(filterDate.getTime())) {
          conditions.push(gte(organizations.createdAt, filterDate));
        }
      } catch (error) {
        console.warn("Invalid date filter:", filters.createdAfter);
      }
    }

    // Build final where condition
    let whereCondition;
    if (conditions.length > 0) {
      whereCondition = conditions.length === 1 ? conditions[0] : and(...conditions);
    }

    // Get total count
    const totalCountResult = whereCondition
      ? await db
          .select({ count: count() })
          .from(organizations)
          .where(whereCondition)
      : await db.select({ count: count() }).from(organizations);

    const totalCount = totalCountResult[0]?.count || 0;

    // Determine sort order
    let orderByClause;
    if (sortBy === "name") {
      orderByClause = sortDirection === "desc" 
        ? sql`${organizations.name} DESC` 
        : organizations.name;
    } else if (sortBy === "createdAt") {
      orderByClause = sortDirection === "desc"
        ? sql`${organizations.createdAt} DESC`
        : organizations.createdAt;
    } else {
      // Default sort by createdAt DESC
      orderByClause = sql`${organizations.createdAt} DESC`;
    }

    // Execute main query
    const rawData = whereCondition
      ? await db
          .select()
          .from(organizations)
          .where(whereCondition)
          .orderBy(orderByClause)
          .limit(pageSize)
          .offset(offset)
      : await db
          .select()
          .from(organizations)
          .orderBy(orderByClause)
          .limit(pageSize)
          .offset(offset);

    // Map database results to OrganizationData[]
    const data: OrganizationData[] = rawData.map((org) => ({
      id: org.id,
      name: org.name,
      slug: org.slug ?? "", // fallback to empty string if null
      logo: org.logo ?? undefined,
      createdAt: org.createdAt,
      metadata: org.metadata as OrganizationData["metadata"],
    }));

    const totalPages = Math.ceil(totalCount / pageSize);

    console.log("✅ Organizations retrieved successfully, count:", data.length);

    return {
      data,
      page,
      pageSize,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      totalCount, // FIXED: Include totalCount for proper pagination display
    };
  } catch (error) {
    console.error("❌ Error listing organizations:", error);
    return {
      data: [],
      page: params.page,
      pageSize: params.pageSize,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      totalCount: 0, // Include in error case too
    };
  }
}

// Server-side Zod validation schema
const organizationDataSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  logo: z.string().optional(),
  metadata: z.object({
    type: z.enum(["admin", "client"]),
    contactEmail: z.string().email("Please enter a valid email address"),
    contactPhone: z.string().min(10, "Please enter a valid phone number"),
    addressLine1: z.string().min(5, "Please enter a valid address"),
    addressLine2: z.string().optional(),
    city: z.string().min(2, "Please enter a valid city"),
    state: z.string().min(2, "Please enter a valid state"),
    postalCode: z.string().min(5, "Please enter a valid postal code"),
    country: z.string().min(2, "Please enter a valid country"),
    timezone: z.string().min(1, "Please select a timezone"),
    isActive: z.boolean(),
    settings: z.record(z.any()),
    hipaaOfficer: z.string().optional(),
    businessAssociateAgreement: z.boolean().optional(),
    dataRetentionYears: z.string().optional(),
  }),
});

// Organization data interface for create/update
export interface OrganizationData {
  id: string;
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

    await requireSuperAdmin();

    // Use Better Auth to get organization
    const organization = await auth.api.getFullOrganization({
      query: { organizationId },
      headers: await headers(),
    });

    console.log("✅ Organization retrieved successfully");
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
        error instanceof Error ? error.message : "Failed to get organization",
    };
  }
}

export async function updateOrganization(
  organizationId: string,
  data: OrganizationData
) {
  try {
    console.log("✏️ Updating organization:", organizationId);

    await requireSuperAdmin();

    // Validate the data
    const validatedData = organizationDataSchema.parse(data);

    // Use Better Auth to update organization
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

    console.log("✅ Organization updated successfully");
    return {
      success: true,
      message: "Organization updated successfully",
    };
  } catch (error) {
    console.error("❌ Error updating organization:", error);

    if (error instanceof z.ZodError) {
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

    await requireSuperAdmin();

    // Use Better Auth to delete organization
    await auth.api.deleteOrganization({
      body: { organizationId },
      headers: await headers(),
    });

    console.log("✅ Organization deleted successfully");
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
