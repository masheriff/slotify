// actions/organization-actions.ts
"use server";

import { auth } from "@/lib/auth";
import { requireSuperAdmin, requireOrgAdmin } from "@/lib/auth-server";
import { HEALTHCARE_ROLES } from "@/lib/permissions/healthcare-permissions-constants";
import { headers } from "next/headers";
import { z } from "zod";

// Define pagination and filtering types
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

// Organization management actions for Super Admins and Admins
export async function getOrganizations(
  params: PaginationParams
): Promise<OrganizationResponse> {
  try {
    await requireSuperAdmin();

    // Use Better Auth's organization API to list organizations
    const organizations = await auth.api.listOrganizations({
      headers: await headers(),
    });

    // Apply client-side filtering and pagination since Better Auth doesn't support server-side filtering yet
    let filteredOrgs = organizations;

    // Apply search filter
    if (params.searchQuery?.trim()) {
      const searchTerm = params.searchQuery.toLowerCase();
      filteredOrgs = filteredOrgs.filter(
        (org) =>
          org.name.toLowerCase().includes(searchTerm) ||
          org.slug?.toLowerCase().includes(searchTerm) ||
          (org.metadata as any)?.contactEmail
            ?.toLowerCase()
            .includes(searchTerm)
      );
    }

    // Apply additional filters
    if (params.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value?.trim()) {
          switch (key) {
            case "type":
              filteredOrgs = filteredOrgs.filter(
                (org) => (org.metadata as any)?.type === value
              );
              break;
            case "status":
              filteredOrgs = filteredOrgs.filter(
                (org) =>
                  (org.metadata as any)?.isActive === (value === "active")
              );
              break;
            case "contactEmail":
              filteredOrgs = filteredOrgs.filter((org) =>
                (org.metadata as any)?.contactEmail
                  ?.toLowerCase()
                  .includes(value.toLowerCase())
              );
              break;
            case "createdAfter":
              const filterDate = new Date(value);
              filteredOrgs = filteredOrgs.filter(
                (org) => new Date(org.createdAt) >= filterDate
              );
              break;
          }
        }
      });
    }

    // Apply sorting
    if (params.sortBy) {
      filteredOrgs.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (params.sortBy) {
          case "name":
            aValue = a.name;
            bValue = b.name;
            break;
          case "createdAt":
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
          case "type":
            aValue = (a.metadata as any)?.type || "";
            bValue = (b.metadata as any)?.type || "";
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return params.sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return params.sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    // Apply pagination
    const startIndex = (params.page - 1) * params.pageSize;
    const endIndex = startIndex + params.pageSize;
    const paginatedOrgs = filteredOrgs.slice(startIndex, endIndex);

    // Transform to include member count
    const enrichedOrgs = await Promise.all(
      paginatedOrgs.map(async (org) => {
        try {
          // Get organization members count
          const fullOrg = await auth.api.getFullOrganization({
            query: { organizationId: org.id },
            headers: await headers(),
          });

          return {
            id: org.id,
            name: org.name,
            slug: org.slug,
            type: (org.metadata as any)?.type || "client",
            status: (org.metadata as any)?.isActive ? "active" : "inactive",
            memberCount: fullOrg?.members?.length || 0,
            createdAt: org.createdAt,
            contactEmail: (org.metadata as any)?.contactEmail || "",
            metadata: org.metadata,
          };
        } catch (error) {
          // Fallback if can't get full org data
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

    const totalPages = Math.ceil(filteredOrgs.length / params.pageSize);

    return {
      data: enrichedOrgs,
      page: params.page,
      pageSize: params.pageSize,
      totalPages,
      hasNextPage: params.page < totalPages,
      hasPreviousPage: params.page > 1,
    };
  } catch (error) {
    console.error("Failed to fetch organizations:", error);
    throw new Error("Failed to fetch organizations");
  }
}

export async function getOrganizationById(organizationId: string) {
  try {
    await requireSuperAdmin();

    const organization = await auth.api.getFullOrganization({
      query: { organizationId },
      headers: await headers(),
    });

    return {
      success: true,
      data: organization,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch organization",
    };
  }
}

// Organization creation schema
const CreateOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  slug: z.string().min(1, "Organization slug is required"),
  type: z.enum(["admin", "client"]),
  contactEmail: z.string().email("Valid email is required"),
  contactPhone: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  hipaaOfficer: z.string().optional(),
});

export type CreateOrganizationInput = z.infer<typeof CreateOrganizationSchema>;

export async function createOrganization(input: CreateOrganizationInput) {
  try {
    await requireSuperAdmin();

    const validatedInput = CreateOrganizationSchema.parse(input);

    // Check if slug is unique
    try {
      await auth.api.checkOrganizationSlug({
        body: { slug: validatedInput.slug },
      });
    } catch (error) {
      return {
        success: false,
        error: "Organization slug already exists",
      };
    }

    // Create organization with metadata
    const result = await auth.api.createOrganization({
      body: {
        name: validatedInput.name,
        slug: validatedInput.slug,
        metadata: {
          type: validatedInput.type,
          contactEmail: validatedInput.contactEmail,
          contactPhone: validatedInput.contactPhone,
          addressLine1: validatedInput.addressLine1,
          addressLine2: validatedInput.addressLine2,
          city: validatedInput.city,
          state: validatedInput.state,
          postalCode: validatedInput.postalCode,
          country: validatedInput.country,
          timezone: validatedInput.timezone,
          isActive: true,
          settings: {},
          hipaaOfficer: validatedInput.hipaaOfficer,
        },
      },
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Failed to create organization:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create organization",
    };
  }
}

export async function updateOrganization(
  organizationId: string,
  input: Partial<CreateOrganizationInput>
) {
  try {
    await requireOrgAdmin(organizationId);

    // Get current organization
    const currentOrg = await auth.api.getFullOrganization({
      query: { organizationId },
      headers: await headers(),
    });

    if (!currentOrg) {
      return {
        success: false,
        error: "Organization not found",
      };
    }

    // Update organization
    const result = await auth.api.updateOrganization({
        body: {
            organizationId,
            data: {
                name: input.name || currentOrg.name,
                slug: input.slug || currentOrg.slug,
                metadata: {
                    ...(currentOrg.metadata as any),
                    ...(input.type && { type: input.type }),
                    ...(input.contactEmail && { contactEmail: input.contactEmail }),
                    ...(input.contactPhone && { contactPhone: input.contactPhone }),
                    ...(input.addressLine1 && { addressLine1: input.addressLine1 }),
                    ...(input.addressLine2 && { addressLine2: input.addressLine2 }),
                    ...(input.city && { city: input.city }),
                    ...(input.state && { state: input.state }),
                    ...(input.postalCode && { postalCode: input.postalCode }),
                    ...(input.country && { country: input.country }),
                    ...(input.timezone && { timezone: input.timezone }),
                    ...(input.hipaaOfficer && { hipaaOfficer: input.hipaaOfficer }),
                },
            },
        },
        headers: await headers()
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Failed to update organization:", error);
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
    await requireSuperAdmin();

    await auth.api.deleteOrganization({
        body: { organizationId },
        headers: await headers()
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to delete organization:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete organization",
    };
  }
}

// Organization member management
export async function getOrganizationMembers(
  organizationId: string,
  params: PaginationParams
) {
  try {
    await requireOrgAdmin(organizationId);

    const fullOrg = await auth.api.getFullOrganization({
      query: { organizationId },
      headers: await headers(),
    });

    if (!fullOrg?.members) {
      return {
        data: [],
        page: params.page,
        pageSize: params.pageSize,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    }

    let filteredMembers = fullOrg.members;

    // Apply search filter
    if (params.searchQuery?.trim()) {
      const searchTerm = params.searchQuery.toLowerCase();
      filteredMembers = filteredMembers.filter(
        (member) =>
          member.user.name?.toLowerCase().includes(searchTerm) ||
          member.user.email.toLowerCase().includes(searchTerm) ||
          member.role.toLowerCase().includes(searchTerm)
      );
    }

    // Apply filters
    if (params.filters?.role) {
      filteredMembers = filteredMembers.filter(
        (member) => member.role === params.filters!.role
      );
    }

    // Apply sorting
    if (params.sortBy) {
      filteredMembers.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (params.sortBy) {
          case "name":
            aValue = a.user.name || "";
            bValue = b.user.name || "";
            break;
          case "email":
            aValue = a.user.email;
            bValue = b.user.email;
            break;
          case "role":
            aValue = a.role;
            bValue = b.role;
            break;
          case "createdAt":
            aValue = new Date(a.createdAt);
            bValue = new Date(b.createdAt);
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return params.sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return params.sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    // Apply pagination
    const startIndex = (params.page - 1) * params.pageSize;
    const endIndex = startIndex + params.pageSize;
    const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

    const totalPages = Math.ceil(filteredMembers.length / params.pageSize);

    return {
      data: paginatedMembers,
      page: params.page,
      pageSize: params.pageSize,
      totalPages,
      hasNextPage: params.page < totalPages,
      hasPreviousPage: params.page > 1,
    };
  } catch (error) {
    console.error("Failed to fetch organization members:", error);
    throw new Error("Failed to fetch organization members");
  }
}

export async function inviteUserToOrganization(
  organizationId: string,
  email: string,
  role: (typeof HEALTHCARE_ROLES)[keyof typeof HEALTHCARE_ROLES]
) {
  try {
    await requireOrgAdmin(organizationId);

    const result = await auth.api.createInvitation({
      body: {
        organizationId,
        email,
        role,
      },
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Failed to invite user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to invite user",
    };
  }
}

export async function updateMemberRole(
  organizationId: string,
  memberId: string,
  role: (typeof HEALTHCARE_ROLES)[keyof typeof HEALTHCARE_ROLES]
) {
  try {
    await requireOrgAdmin(organizationId);

    await auth.api.updateMemberRole({
      body: {
        organizationId,
        memberId,
        role,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to update member role:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update member role",
    };
  }
}

export async function removeMemberFromOrganization(
  organizationId: string,
  memberIdOrEmail: string
) {
  try {
    await requireOrgAdmin(organizationId);

    await auth.api.removeMember({
      body: {
        organizationId,
        memberIdOrEmail,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Failed to remove member:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove member",
    };
  }
}
