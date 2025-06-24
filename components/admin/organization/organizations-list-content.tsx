// components/admin/organization/organizations-list-content.tsx - Updated for server-side implementation
"use client";

import { useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ListPageHeader } from "@/components/common/list-page-header";
import { OrganizationFiltersForm } from "@/components/admin/forms/organization-filters-form";
import { DataTable } from "@/components/common/data-table";
import { organizationColumns } from "@/components/table-configs/organization-columns";
import { toast } from "sonner";
import { useLoadingControl } from "@/lib/with-loading";
import { OrganizationResponse } from "@/actions/organization-actions";

// Simplified filter configuration - only type and createdAfter
const organizationFilters = [
  {
    label: "Organization Type",
    key: "type",
    type: "select" as const,
    options: [
      { value: "admin", label: "Admin Organization" },
      { value: "client", label: "Client Organization" },
    ],
  },
  {
    label: "Created After",
    key: "createdAfter",
    type: "date" as const,
  },
];

interface OrganizationsListContentProps {
  initialData: OrganizationResponse;
}

export function OrganizationsListContent({ 
  initialData
}: OrganizationsListContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { withLoadingState } = useLoadingControl();

  // Get current URL parameters
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const currentPageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const currentSearch = searchParams.get('search') || '';
  const currentSortBy = searchParams.get('sortBy') || 'name';
  const currentSortDirection = (searchParams.get('sortDirection') || 'asc') as 'asc' | 'desc';
  
  // Get current filters
  const currentFilters = {
    type: searchParams.get('type') || '',
    createdAfter: searchParams.get('createdAfter') || '',
  };

  // Update URL parameters and trigger server-side refetch
  const updateUrl = useCallback((params: Record<string, string | number | undefined>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    
    // Update or remove parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        newSearchParams.set(key, String(value));
      } else {
        newSearchParams.delete(key);
      }
    });

    // Always reset to page 1 when filtering/searching
    if ('search' in params || Object.keys(params).some(key => key.startsWith('filter') || key in currentFilters)) {
      newSearchParams.set('page', '1');
    }

    router.push(`/admin/organizations?${newSearchParams.toString()}`, { scroll: false });
  }, [router, searchParams, currentFilters]);

  // Handle search changes
  const handleSearchChange = useCallback((query: string) => {
    updateUrl({ search: query });
  }, [updateUrl]);

  // Handle filter changes
  const handleFilterChange = useCallback((key: string, value: string) => {
    updateUrl({ [key]: value });
  }, [updateUrl]);

  // Handle clear all filters
  const handleClearAllFilters = useCallback(() => {
    updateUrl({ 
      type: '',
      createdAfter: '',
    });
  }, [updateUrl]);

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    updateUrl({ page });
  }, [updateUrl]);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    updateUrl({ pageSize, page: 1 });
  }, [updateUrl]);

  // Handle sorting
  const handleSortingChange = useCallback((sortBy: string, sortDirection: 'asc' | 'desc') => {
    updateUrl({ sortBy, sortDirection });
  }, [updateUrl]);

  // Handle create organization
  const handleCreateOrganization = useCallback(() => {
    router.push('/admin/organizations/create');
  }, [router]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  // Count active filters
  const activeFiltersCount = Object.values(currentFilters).filter(value => value.trim()).length;

  console.log('Rendering OrganizationsListContent with server-side data:', initialData);

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Organizations"
        searchPlaceholder="Search organizations by name or slug"
        searchQuery={currentSearch}
        onSearchChange={handleSearchChange}
        onCreateClick={handleCreateOrganization}
        createButtonText="Create Organization"
        activeFiltersCount={activeFiltersCount}
        filterComponent={
          <OrganizationFiltersForm
            currentFilters={currentFilters}
            onFilterChange={handleFilterChange}
            onClearAllFilters={handleClearAllFilters}
          />
        }
        breadcrumbItems={[
          { title: 'Organizations' }
        ]}
        onRefresh={handleRefresh}
      />

      <DataTable
        columns={organizationColumns}
        data={initialData.data}
        currentPage={initialData.page}
        pageSize={initialData.pageSize}
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
  );
}