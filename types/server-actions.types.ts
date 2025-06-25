// types/server-actions.types.ts
// Create this file to define consistent server action response types

export type ServerActionError = 
  | string 
  | { general: string }
  | { [key: string]: string[] }
  | Array<{ message: string; path: string[] }>
  | Array<string>

export interface ServerActionResponse<T = any> {
  success: boolean
  error?: ServerActionError
  data?: T
  message?: string
  warning?: string
  validationErrors?: Array<{ message: string; path: string[] }>
}

// Helper function to extract error message from ServerActionError
export function getErrorMessage(error: ServerActionError): string {
  if (typeof error === 'string') {
    return error
  }
  
  if (Array.isArray(error)) {
    return error.map(err => 
      typeof err === 'string' ? err : err.message || 'Validation error'
    ).join(', ')
  }
  
  if (typeof error === 'object' && error !== null) {
    // Check for general error field
    if ('general' in error && typeof error.general === 'string') {
      return error.general
    }
    
    // Handle Zod-style errors (field validation errors)  
    const entries = Object.entries(error)
    if (entries.length > 0) {
      const [fieldName, fieldErrors] = entries[0]
      if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
        return `${fieldName}: ${fieldErrors[0]}`
      }
      if (typeof fieldErrors === 'string') {
        return `${fieldName}: ${fieldErrors}`
      }
    }
  }
  
  return 'An error occurred'
}

// Organization-specific types
export interface OrganizationActionData {
  id?: string
  organization?: any
}

export type OrganizationActionResponse = ServerActionResponse<OrganizationActionData>