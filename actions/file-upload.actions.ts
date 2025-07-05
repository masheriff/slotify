// actions/file-upload.actions.ts - ADD PROFILE UPLOAD FUNCTION

import { writeFile, unlink, mkdir } from "fs/promises"
import { join } from "path"
import { generateId } from "better-auth"
import { DeleteResult, UploadResult } from "@/types/action.types"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_PROFILE_SIZE = 500 * 1024 // 500KB for profile pictures
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]

// Map MIME types to extensions
const MIME_TO_EXTENSION = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg"
}

// Validate file type and size
function validateFile(
  file: File, 
  allowedTypes: string[] = ALLOWED_IMAGE_TYPES,
  maxSize: number = MAX_FILE_SIZE
): { valid: boolean; error?: string } {
  if (!file) {
    return {
      valid: false,
      error: "No file provided"
    }
  }
  
  console.log(`Validating file: ${file.name}, type: ${file.type}, size: ${file.size}`)
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`
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
function generateFilePath(uploadType: "organizations" | "general" | "profile", file: File, userId?: string): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const time = now.getTime()
  
  // Use reliable method to get extension from MIME type
  let extension = MIME_TO_EXTENSION[file.type as keyof typeof MIME_TO_EXTENSION] || file.name.split('.').pop() || 'bin'
  const fileId = generateId()
  
  if (uploadType === "organizations") {
    return join("uploads", "organizations", `${fileId}.${extension}`)
  } else if (uploadType === "profile" && userId) {
    // For profile pictures: uploads/profile/user-{userId}_{timestamp}.png
    return join("uploads", "profile", `user-${userId}_${time}.png`)
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
    console.log("Directory creation result:", error)
  }
}

// NEW: Upload profile picture function
export async function uploadProfilePicture(formData: FormData, userId: string): Promise<UploadResult> {
  try {
    const file = formData.get("file") as File
    
    if (!file) {
      return { success: false, error: "No file provided" }
    }

    console.log(`Processing profile picture upload: ${file.name}, type: ${file.type}, size: ${file.size}`)

    // Validate file with profile-specific limits
    const validation = validateFile(file, ALLOWED_IMAGE_TYPES, MAX_PROFILE_SIZE)
    if (!validation.valid) {
      console.log("Validation failed:", validation.error)
      return { success: false, error: validation.error }
    }

    // Generate file path for profile picture
    const filePath = generateFilePath("profile", file, userId)
    const fullPath = join(process.cwd(), "public", filePath)

    console.log(`Saving profile picture to: ${fullPath}`)

    // Ensure directory exists
    await ensureDirectoryExists(filePath)

    // Convert file to buffer and save
    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(fullPath, buffer)
      console.log("Profile picture saved successfully")
    } catch (writeError) {
      console.error("Error writing profile picture:", writeError)
      return {
        success: false,
        error: writeError instanceof Error ? writeError.message : "Failed to save profile picture"
      }
    }

    // Return public URL
    const publicUrl = `/${filePath.replace(/\\/g, '/')}`
    console.log("Profile picture upload successful, URL:", publicUrl)
    
    return {
      success: true,
      url: publicUrl
    }

  } catch (error) {
    console.error("Profile picture upload error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Profile picture upload failed"
    }
  }
}

// NEW: Delete old profile picture
export async function deleteProfilePicture(imageUrl: string): Promise<DeleteResult> {
  try {
    if (!imageUrl || imageUrl === '') {
      return { success: true } // Nothing to delete
    }

    // Extract file path from URL
    const filePath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl
    const fullPath = join(process.cwd(), "public", filePath)

    console.log(`Deleting old profile picture: ${fullPath}`)

    // Delete file
    await unlink(fullPath)
    console.log("Old profile picture deleted successfully")

    return { success: true }

  } catch (error) {
    // Don't fail the entire operation if old image deletion fails
    console.warn("Warning: Could not delete old profile picture:", error)
    return { success: true } // Return success anyway
  }
}

// Existing functions remain unchanged...
export async function uploadOrganizationLogo(formData: FormData): Promise<UploadResult> {
  try {
    const file = formData.get("file") as File
    
    if (!file) {
      return { success: false, error: "No file provided" }
    }

    console.log(`Processing upload: ${file.name}, type: ${file.type}, size: ${file.size}`)

    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      console.log("Validation failed:", validation.error)
      return { success: false, error: validation.error }
    }

    // Generate file path
    const filePath = generateFilePath("organizations", file)
    const fullPath = join(process.cwd(), "public", filePath)

    console.log(`Saving to path: ${fullPath}`)

    // Ensure directory exists
    await ensureDirectoryExists(filePath)

    // Convert file to buffer and save with explicit error handling
    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(fullPath, buffer)
      console.log("File written successfully")
    } catch (writeError) {
      console.error("Error writing file:", writeError)
      return {
        success: false,
        error: writeError instanceof Error ? writeError.message : "Failed to save file"
      }
    }

    // Return public URL
    const publicUrl = `/${filePath.replace(/\\/g, '/')}`
    console.log("Upload successful, URL:", publicUrl)
    
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
    const filePath = generateFilePath("general", file)
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