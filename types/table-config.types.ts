// types/table-config.types.ts - FIXED VERSION (no duplicate exports)
export interface OrganizationColumns {
  id: string
  name: string
  logo?: string
  createdAt: string
  slug?: string
  metadata?: Record<string, any>
}