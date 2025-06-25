// components/admin/organization/organizations-list-content.tsx - FIXED VERSION
"use client"

import { useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ListPageHeader } from "@/components/common/list-page-header"
import { OrganizationFiltersForm } from "@/components/admin/forms/organization-filters-form"
import { DataTable } from "@/components/common/data-table"
import { organizationColumns } from "@/components/table-configs/organization-columns"
import { OrganizationResponse } from "@/actions/organization-actions"
import { OrganizationTableRow } from "@/types/organization.types"

interface OrganizationsListContentProps {
  initialData: OrganizationResponse
}

export function OrganizationsListContent({ 
  initialData
}: OrganizationsListContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get current URL parameters
  const currentPage = parseInt(searchParams.get('page') || '1', 10)
  const currentPageSize = parseInt(searchParams.get('pageSize') || '10', 10)
  const currentSearch = searchParams.get('search') || ''
  const currentSortBy = searchParams.get('sortBy') || 'name'
  const currentSortDirection = (searchParams.get('sortDirection') || 'asc') as 'asc' | 'desc'
  
  // Get current filters
  const currentFilters = {
    type: searchParams.get('type') || '',
    createdAfter: searchParams.get('createdAfter') || '',
  }

  // FIXED: Update URL parameters without causing infinite loops
  const updateURL = useCallback((params: Record<string, string | number>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString())
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value.toString())
      } else {
        newSearchParams.delete(key)
      }
    })

    // Reset page to 1 when filters change
    if ('search' in params || 'type' in params || 'createdAfter' in params) {
      newSearchParams.set('page', '1')
    }

    router.push(`/admin/organizations?${newSearchParams.toString()}`, { scroll: false })
  }, [router, searchParams])

  // Handle search
  const handleSearch = useCallback((query: string) => {
    updateURL({ search: query })
  }, [updateURL])

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    updateURL({ page })
  }, [updateURL])

  const handlePageSizeChange = useCallback((pageSize: number) => {
    updateURL({ pageSize, page: 1 })
  }, [updateURL])

  // Handle sorting - fixed to match DataTable prop name
  const handleSortingChange = useCallback((sortBy: string, sortDirection: 'asc' | 'desc') => {
    updateURL({ sortBy, sortDirection })
  }, [updateURL])

  // Handle filter updates
  const handleFilterUpdate = useCallback((key: string, value: string) => {
    updateURL({ [key]: value })
  }, [updateURL])

  // Handle create organization
  const handleCreateOrganization = useCallback(() => {
    router.push('/admin/organizations/create')
  }, [router])

  // Handle refresh
  const handleRefresh = useCallback(() => {
    router.refresh()
  }, [router])

  // Count active filters
  const activeFiltersCount = Object.values(currentFilters).filter(value => value.trim()).length

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Organizations"
        searchPlaceholder="Search organizations by name or slug"
        searchQuery={currentSearch}
        onSearchChange={handleSearch}
        onCreateClick={handleCreateOrganization}
        createButtonText="Create Organization"
        activeFiltersCount={activeFiltersCount}
        filterComponent={
          <OrganizationFiltersForm
            currentFilters={currentFilters}
            onFilterUpdate={handleFilterUpdate}
          />
        }
        breadcrumbItems={[
          { title: 'Organizations' }
        ]}
        onRefresh={handleRefresh}
      />
      
      <DataTable<OrganizationTableRow, any>
        columns={organizationColumns}
        data={initialData.data}
        currentPage={currentPage}
        pageSize={currentPageSize}
        totalPages={initialData.totalPages}
        hasNextPage={initialData.hasNextPage}
        hasPreviousPage={initialData.hasPreviousPage}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        sortBy={currentSortBy}
        sortDirection={currentSortDirection}
        onSortingChange={handleSortingChange}
        loadingKey="organizations-fetch"
        emptyMessage="No organizations found. Create your first organization to get started."
      />
    </div>
  )
}