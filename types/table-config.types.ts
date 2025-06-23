export interface OrganizationColumns {
  id: string
  name: string
  type: 'admin' | 'client'
  status: 'active' | 'inactive' | 'suspended'
  memberCount: number
  createdAt: string
  contactEmail: string
}