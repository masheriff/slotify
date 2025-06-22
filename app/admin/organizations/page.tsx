// app/admin/organizations/page.tsx
"use client"

import { Suspense } from "react"
import { useRouter } from "next/navigation"
import { ListPageHeader } from "@/components/common/list-page-header"
import { OrganizationFiltersForm } from "@/components/admin/forms/organization-filters-form"
import { DataTable } from "@/components/common/data-table"
import { organizationColumns } from "@/lib/table-configs/organization-columns"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useOrganizations } from "@/hooks/use-organizations"



function OrganizationsContent() {
  const router = useRouter()
  const {
    organizations,
    currentPage,
    pageSize,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    listState,
    refreshOrganizations
  } = useOrganizations()

  const handleCreateOrganization = () => {
    router.push('/admin/organizations/create')
  }

  const handleRefresh = () => {
    refreshOrganizations()
    toast.success('Organizations refreshed')
  }

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Organizations"
        searchPlaceholder="Search organizations by name, email, or slug..."
        searchQuery={listState.searchQuery}
        onSearchChange={listState.setSearchQuery}
        onCreateClick={handleCreateOrganization}
        createButtonText="Create Organization"
        activeFiltersCount={Object.values(listState.filters).filter(Boolean).length}
        filterComponent={
          <OrganizationFiltersForm
            currentFilters={listState.filters}
            onFilterChange={listState.setFilter}
            onClearAllFilters={listState.resetFilters}
          />
        }
        breadcrumbItems={[
          { title: 'Organizations' }
        ]}
        onRefresh={handleRefresh}
      />

      <DataTable
        columns={organizationColumns}
        data={organizations}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        onPageChange={listState.setCurrentPage}
        onPageSizeChange={listState.setPageSize}
        sortBy={listState.sortBy}
        sortDirection={listState.sortDirection}
        onSortingChange={listState.setSorting}
        loadingKey="organizations-fetch"
        emptyMessage="No organizations found. Create your first organization to get started."
      />
    </div>
  )
}

export default function OrganizationsPage() {
  return (
    <div className="flex-1 space-y-4 p-4">
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm text-muted-foreground">Loading organizations...</p>
          </div>
        </div>
      }>
        <OrganizationsContent />
      </Suspense>
    </div>
  )
}