// app/admin/organizations/page.tsx
"use client"

import { Suspense } from "react"
import { useRouter } from "next/navigation"
import { ListPageHeader } from "@/components/common/list-page-header"
import { OrganizationFiltersForm } from "@/components/admin/forms/organization-filters-form"
import { DataTable } from "@/components/common/data-table"
import { useListState } from "@/stores/list-state-store"
import { organizationColumns, Organization } from "@/lib/table-configs/organization-columns"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { FilterConfig } from "@/stores/list-state-store"

// Organization filter configuration
const organizationFilters: FilterConfig[] = [
  {
    key: 'type',
    type: 'select',
    options: [
      { value: 'admin', label: 'Admin Organization' },
      { value: 'client', label: 'Client Organization' },
    ]
  },
  {
    key: 'status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'suspended', label: 'Suspended' },
    ]
  },
  {
    key: 'createdAfter',
    type: 'date',
  },
  {
    key: 'contactEmail',
    type: 'text',
  }
]

// Mock data hook - replace with real data fetching
function useOrganizations() {
  const listState = useListState({
    defaultPageSize: 10,
    defaultSort: { column: 'name', direction: 'asc' },
    filterConfig: organizationFilters
  })

  // Mock loading state
  const loading = false

  // Mock data - replace with actual API call
  const organizations: Organization[] = [
    {
      id: '1',
      name: '5 AM Corporation',
      type: 'admin',
      status: 'active',
      memberCount: 15,
      createdAt: '2024-01-15',
      contactEmail: 'contact@5amcorp.com'
    },
    {
      id: '2', 
      name: 'Hart Medical Centre',
      type: 'client',
      status: 'active',
      memberCount: 48,
      createdAt: '2024-02-20',
      contactEmail: 'admin@hartmedical.com'
    },
    {
      id: '3',
      name: 'City General Hospital',
      type: 'client', 
      status: 'active',
      memberCount: 125,
      createdAt: '2024-03-10',
      contactEmail: 'it@citygeneral.org'
    }
  ]

  const totalCount = 3

  return {
    organizations,
    totalCount,
    loading,
    listState
  }
}

function OrganizationsContent() {
  const router = useRouter()
  const { organizations, totalCount, loading, listState } = useOrganizations()

  const handleCreateOrganization = () => {
    router.push('/admin/organizations/create')
  }

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Organizations"
        searchPlaceholder="Search organizations..."
        searchQuery={listState.searchQuery}
        onSearchChange={listState.setSearchQuery}
        onCreateClick={handleCreateOrganization}
        createButtonText="Create Organization"
        activeFiltersCount={Object.keys(listState.filters).length}
        filterComponent={
          <OrganizationFiltersForm
            currentFilters={listState.filters}
            onFilterChange={listState.setFilter}
            onClearAllFilters={listState.resetFilters}
          />
        }
        totalCount={totalCount}
        breadcrumbItems={[]}
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <DataTable
          columns={organizationColumns}
          data={organizations}
          totalCount={totalCount}
          currentPage={listState.currentPage}
          pageSize={listState.pageSize}
          onPageChange={listState.setCurrentPage}
          onPageSizeChange={listState.setPageSize}
          sortBy={listState.sortBy}
          sortDirection={listState.sortDirection}
          onSortingChange={listState.setSorting}
        />
      )}
    </div>
  )
}

export default function OrganizationsPage() {
  return (
    <div className="flex-1 space-y-4 p-4">
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }>
        <OrganizationsContent />
      </Suspense>
    </div>
  )
}