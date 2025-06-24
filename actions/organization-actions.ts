// actions/organization-actions.ts - Fixed with proper Drizzle patterns and Zod validation
"use server"

import { requireSuperAdmin } from "@/lib/auth-server"
import { db } from "@/db"
import { organizations, members } from "@/db/schema"
import { eq, count, like, ilike, or, gte, sql, and } from "drizzle-orm"
import { generateId } from "better-auth"
import { auth } from "@/lib/auth"
import { APIError } from "better-auth/api"
import { headers } from "next/headers"
import { HEALTHCARE_RESOURCES, HEALTHCARE_ROLES } from "@/lib/permissions/healthcare-permissions-constants"
import { z } from "zod"

export type PaginationParams = {
  page: number
  pageSize: number
  searchQuery?: string
  sortBy?: string | null
  sortDirection?: "asc" | "desc"
  filters?: Record<string, string>
}

export type OrganizationResponse = {
  data: any[]
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// Server-side Zod validation schema
const organizationDataSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
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
  })
})

// Organization data interface for create/update
export interface OrganizationData {
  name: string
  slug: string
  logo?: string
  metadata: {
    type: "admin" | "client"
    contactEmail: string
    contactPhone: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    postalCode: string
    country: string
    timezone: string
    isActive: boolean
    settings: Record<string, any>
    hipaaOfficer?: string
    businessAssociateAgreement?: boolean
    dataRetentionYears?: string
  }
}

export async function createOrganization(data: OrganizationData) {
  try {
    console.log('🏢 Creating organization:', data.name)
    
    await requireSuperAdmin()

    // Server-side validation with Zod
    const validationResult = organizationDataSchema.safeParse(data)
    if (!validationResult.success) {
      console.error('❌ Validation failed:', validationResult.error.flatten())
      return {
        success: false,
        error: "Validation failed: " + validationResult.error.issues.map(issue => issue.message).join(", ")
      }
    }

    const validatedData = validationResult.data

    // Use Better Auth to create organization
    await auth.api.createOrganization({
      body: {
        name: validatedData.name,
        slug: validatedData.slug,
        logo: validatedData.logo,
        metadata: validatedData.metadata
      }
    })

    console.log('✅ Organization created successfully')
    return {
      success: true,
      message: "Organization created successfully"
    }

  } catch (error) {
    console.error('❌ Error creating organization:', error)
    
    if (error instanceof APIError) {
      return {
        success: false,
        error: error.message
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create organization"
    }
  }
}

export async function updateOrganization(organizationId: string, data: OrganizationData) {
  try {
    console.log('🔄 Updating organization:', organizationId)
    
    await requireSuperAdmin()

    // Server-side validation with Zod
    const validationResult = organizationDataSchema.safeParse(data)
    if (!validationResult.success) {
      console.error('❌ Validation failed:', validationResult.error.flatten())
      return {
        success: false,
        error: "Validation failed: " + validationResult.error.issues.map(issue => issue.message).join(", ")
      }
    }

    const validatedData = validationResult.data

    // Use Better Auth to update organization
    await auth.api.updateOrganization({
      body: {
        data: {
          name: validatedData.name,
          slug: validatedData.slug,
          logo: validatedData.logo,
          metadata: validatedData.metadata
        },
        organizationId,
      },
      headers: await headers()
    })

    console.log('✅ Organization updated successfully')
    return {
      success: true,
      message: "Organization updated successfully"
    }

  } catch (error) {
    console.error('❌ Error updating organization:', error)
    
    if (error instanceof APIError) {
      return {
        success: false,
        error: error.message
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update organization"
    }
  }
}

export async function getOrganizationById(organizationId: string) {
  try {
    console.log('📖 Getting organization by ID:', organizationId)
    
    await requireSuperAdmin()

    // Use direct database query since auth.api only returns user's orgs
    const query = eq(organizations.id, organizationId)
    const result = await db.select().from(organizations).where(query).limit(1)

    if (result.length === 0) {
      console.error('❌ Organization not found:', organizationId)
      return {
        success: false,
        error: "Organization not found"
      }
    }

    console.log('✅ Organization retrieved successfully')
    return {
      success: true,
      data: result[0]
    }

  } catch (error) {
    console.error('❌ Error getting organization:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get organization"
    }
  }
}

export async function deleteOrganization(organizationId: string) {
  try {
    console.log('🗑️ Deleting organization:', organizationId)
    
    await requireSuperAdmin()

    // Use Better Auth to delete organization
    await auth.api.deleteOrganization({
      body: { organizationId },
      headers: await headers()
    })

    console.log('✅ Organization deleted successfully')
    return {
      success: true,
      message: "Organization deleted successfully"
    }

  } catch (error) {
    console.error('❌ Error deleting organization:', error)
    
    if (error instanceof APIError) {
      return {
        success: false,
        error: error.message
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete organization"
    }
  }
}

export async function listOrganizations(params: PaginationParams): Promise<OrganizationResponse> {
  try {
    console.log('📋 Listing organizations with params:', params)
    
    await requireSuperAdmin()

    const { page, pageSize, searchQuery, sortBy, sortDirection, filters } = params
    const offset = (page - 1) * pageSize

    // Build where conditions (following your checkSlugAvailability pattern)
    const conditions = []
    
    if (searchQuery) {
      conditions.push(
        or(
          ilike(organizations.name, `%${searchQuery}%`),
          ilike(organizations.slug, `%${searchQuery}%`)
        )
      )
    }

    if (filters?.type) {
      conditions.push(sql`${organizations.metadata}->>'type' = ${filters.type}`)
    }

    if (filters?.status) {
      conditions.push(sql`${organizations.metadata}->>'isActive' = ${filters.status === 'active'}`)
    }

    // Build final where condition exactly like your checkSlugAvailability
    let whereCondition
    if (conditions.length > 0) {
      if (conditions.length === 1) {
        whereCondition = conditions[0]
      } else {
        const andCondition = and(...conditions)
        if (!andCondition) {
          throw new Error("Failed to build where condition")
        }
        whereCondition = andCondition
      }
    }

    // Get total count - execute directly like your pattern
    const totalCount = whereCondition
      ? (await db.select({ count: count() }).from(organizations).where(whereCondition))[0]?.count || 0
      : (await db.select({ count: count() }).from(organizations))[0]?.count || 0

    // Determine sort order
    let orderByClause
    if (sortBy === 'name') {
      orderByClause = sortDirection === 'desc' ? sql`${organizations.name} DESC` : organizations.name
    } else if (sortBy === 'createdAt') {
      orderByClause = sortDirection === 'desc' ? sql`${organizations.createdAt} DESC` : organizations.createdAt
    } else {
      orderByClause = sql`${organizations.createdAt} DESC`
    }

    // Execute query directly in one chain - NO REASSIGNMENT
    const data = whereCondition
      ? await db.select().from(organizations).where(whereCondition).orderBy(orderByClause).limit(pageSize).offset(offset)
      : await db.select().from(organizations).orderBy(orderByClause).limit(pageSize).offset(offset)

    const totalPages = Math.ceil(totalCount / pageSize)
    
    console.log('✅ Organizations retrieved successfully')
    return {
      data,
      page,
      pageSize,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }

  } catch (error) {
    console.error('❌ Error listing organizations:', error)
    return {
      data: [],
      page: params.page,
      pageSize: params.pageSize,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false
    }
  }
}

export async function sendOrganizationInvitation(organizationId: string, email: string, role: typeof HEALTHCARE_ROLES[keyof typeof HEALTHCARE_ROLES]) {
  try {
    console.log('📧 Sending invitation to:', email, 'for organization:', organizationId)
    
    await requireSuperAdmin()

    // Use Better Auth to create invitation
    await auth.api.createInvitation({
      body: {
        organizationId,
        email,
        role,
      }
    })

    console.log('✅ Invitation sent successfully')
    return {
      success: true,
      message: "Invitation sent successfully"
    }

  } catch (error) {
    console.error('❌ Error sending invitation:', error)
    
    if (error instanceof APIError) {
      return {
        success: false,
        error: error.message
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send invitation"
    }
  }
}

export async function addMemberToOrganization(organizationId: string, userId: string, role: typeof HEALTHCARE_ROLES[keyof typeof HEALTHCARE_ROLES]) {
  try {
    console.log('👥 Adding member to organization:', { organizationId, userId, role })
    
    await requireSuperAdmin()

    // Use Better Auth to add member
    await auth.api.addMember({
      body: {
        organizationId,
        userId,
        role
      }
    })

    console.log('✅ Member added successfully')
    return {
      success: true,
      message: "Member added successfully"
    }

  } catch (error) {
    console.error('❌ Error adding member:', error)
    
    if (error instanceof APIError) {
      return {
        success: false,
        error: error.message
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add member"
    }
  }
}

export async function removeMemberFromOrganization(organizationId: string, memberIdOrEmail: string) {
  try {
    console.log('➖ Removing member from organization:', { organizationId, memberIdOrEmail })
    
    await requireSuperAdmin()

    // Use Better Auth to remove member
    await auth.api.removeMember({
      body: {
        organizationId,
        memberIdOrEmail
      }
    })

    console.log('✅ Member removed successfully')
    return {
      success: true,
      message: "Member removed successfully"
    }

  } catch (error) {
    console.error('❌ Error removing member:', error)
    
    if (error instanceof APIError) {
      return {
        success: false,
        error: error.message
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove member"
    }
  }
}

export async function updateMemberRole(organizationId: string, memberId: string, role: typeof HEALTHCARE_ROLES[keyof typeof HEALTHCARE_ROLES]) {
  try {
    console.log('🔄 Updating member role:', { organizationId, memberId, role })
    
    await requireSuperAdmin()

    // Use Better Auth to update member role
    await auth.api.updateMemberRole({
      body: {
        organizationId,
        memberId,
        role
      }
    })

    console.log('✅ Member role updated successfully')
    return {
      success: true,
      message: "Member role updated successfully"
    }

  } catch (error) {
    console.error('❌ Error updating member role:', error)
    
    if (error instanceof APIError) {
      return {
        success: false,
        error: error.message
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update member role"
    }
  }
}