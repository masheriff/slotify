// actions/file-upload-actions.ts
"use server"

import { writeFile, unlink, mkdir } from "fs/promises"
import { join } from "path"
import { generateId } from "better-auth"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
// Added webp to allowed types
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]

interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

interface DeleteResult {
  success: boolean
  error?: string
}

// Validate file type and size
function validateFile(file: File, allowedTypes: string[] = ALLOWED_IMAGE_TYPES): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`
    }
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
    }
  }

  return { valid: true }
}

// Generate file path based on upload type
function generateFilePath(uploadType: "organizations" | "general", filename: string): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const time = now.getTime()
  
  const extension = filename.split('.').pop()
  const fileId = generateId()
  
  if (uploadType === "organizations") {
    return join("uploads", "organizations", `${fileId}.${extension}`)
  } else {
    return join("uploads", year.toString(), month, day, `${time}_${fileId}.${extension}`)
  }
}

// Ensure directory exists
async function ensureDirectoryExists(filePath: string): Promise<void> {
  const dir = join(process.cwd(), "public", filePath.split('/').slice(0, -1).join('/'))
  try {
    await mkdir(dir, { recursive: true })
  } catch (error) {
    // Directory might already exist, which is fine
  }
}

export async function uploadOrganizationLogo(formData: FormData): Promise<UploadResult> {
  try {
    const file = formData.get("file") as File
    
    if (!file) {
      return { success: false, error: "No file provided" }
    }

    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Generate file path
    const filePath = generateFilePath("organizations", file.name)
    const fullPath = join(process.cwd(), "public", filePath)

    // Ensure directory exists
    await ensureDirectoryExists(filePath)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(fullPath, buffer)

    // Return public URL
    const publicUrl = `/${filePath.replace(/\\/g, '/')}`
    
    return {
      success: true,
      url: publicUrl
    }

  } catch (error) {
    console.error("Upload error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed"
    }
  }
}

export async function uploadGeneralFile(formData: FormData): Promise<UploadResult> {
  try {
    const file = formData.get("file") as File
    const allowedTypesParam = formData.get("allowedTypes") as string
    
    if (!file) {
      return { success: false, error: "No file provided" }
    }

    // Parse allowed types or use default
    const allowedTypes = allowedTypesParam 
      ? allowedTypesParam.split(',')
      : ALLOWED_IMAGE_TYPES

    // Validate file
    const validation = validateFile(file, allowedTypes)
    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    // Generate file path
    const filePath = generateFilePath("general", file.name)
    const fullPath = join(process.cwd(), "public", filePath)

    // Ensure directory exists
    await ensureDirectoryExists(filePath)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(fullPath, buffer)

    // Return public URL
    const publicUrl = `/${filePath.replace(/\\/g, '/')}`
    
    return {
      success: true,
      url: publicUrl
    }

  } catch (error) {
    console.error("Upload error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed"
    }
  }
}

export async function deleteFile(fileUrl: string): Promise<DeleteResult> {
  try {
    // Extract file path from URL
    const filePath = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl
    const fullPath = join(process.cwd(), "public", filePath)

    // Delete file
    await unlink(fullPath)

    return { success: true }

  } catch (error) {
    console.error("Delete error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed"
    }
  }
}

// Helper function to validate organization slug uniqueness
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