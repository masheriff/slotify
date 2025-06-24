// components/admin/organization/organizations-list-content.tsx - CORRECTED
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ListPageHeader } from "@/components/common/list-page-header";
import { OrganizationFiltersForm } from "@/components/admin/forms/organization-filters-form";
import { DataTable } from "@/components/common/data-table";
import { organizationColumns } from "@/lib/table-configs/organization-columns";
import { toast } from "sonner";
import { useLoadingControl } from "@/lib/with-loading";
import { listOrganizations, OrganizationResponse, PaginationParams } from "@/actions/organization-actions";
import { useListState } from "@/stores/list-state-store";
import { FilterConfig } from "@/types";

// Organization filter configuration
const organizationFilters: FilterConfig[] = [
  {
    label: "Organization Type",
    key: "type",
    type: "select",
    options: [
      { value: "admin", label: "Admin Organization" },
      { value: "client", label: "Client Organization" },
    ],
  },
  {
    label: "Status",
    key: "status",
    type: "select",
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "suspended", label: "Suspended" },
    ],
  },
  {
    label: "Created After",
    key: "createdAfter",
    type: "date",
  },
  {
    label: "Contact Email",
    key: "contactEmail",
    type: "text",
  },
];

interface OrganizationsListContentProps {
  initialData: OrganizationResponse;
}

export function OrganizationsListContent({ 
  initialData
}: OrganizationsListContentProps) {
  const router = useRouter();
  const { withLoadingState } = useLoadingControl();
  
  // FIXED: Single source of truth - only use URL state management
  const listState = useListState({
    defaultPageSize: 10,
    defaultSort: { column: "name", direction: "asc" },
    filterConfig: organizationFilters,
  });

  // FIXED: Use server-side data as initial state, client refetches on filter changes
  const [data, setData] = useState<OrganizationResponse>(initialData);

  // FIXED: Only fetch when filters/search/pagination changes (not on initial load)
  const fetchData = useCallback(async (params: PaginationParams) => {
    try {
      await withLoadingState(
        'organizations-fetch',
        async () => {
          const result = await listOrganizations(params);
          setData(result);
        },
        'Loading organizations...'
      );
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
      toast.error('Failed to load organizations. Please try again.');
    } 
  }, [withLoadingState]);

  // Event handlers
  const handleCreateOrganization = () => {
    router.push('/admin/organizations/create');
  };

  const handleRefresh = () => {
    const params: PaginationParams = {
      page: listState.currentPage,
      pageSize: listState.pageSize,
      searchQuery: listState.searchQuery,
      sortBy: listState.sortBy,
      sortDirection: listState.sortDirection,
      filters: listState.filters,
    };
    fetchData(params);
    toast.success('Organizations refreshed');
  };

  // FIXED: Trigger fetch only when user actively changes filters/search
  const handleFilterChange = useCallback((key: string, value: string) => {
    listState.setFilter(key, value);
    
    // Fetch with new filters
    const params: PaginationParams = {
      page: 1, // Reset to page 1 when filtering
      pageSize: listState.pageSize,
      searchQuery: listState.searchQuery,
      sortBy: listState.sortBy,
      sortDirection: listState.sortDirection,
      filters: { ...listState.filters, [key]: value },
    };
    fetchData(params);
  }, [listState, fetchData]);

  const handleClearAllFilters = useCallback(() => {
    listState.resetFilters();
    
    // Fetch with cleared filters
    const params: PaginationParams = {
      page: 1,
      pageSize: listState.pageSize,
      searchQuery: listState.searchQuery,
      sortBy: listState.sortBy,
      sortDirection: listState.sortDirection,
      filters: {},
    };
    fetchData(params);
  }, [listState, fetchData]);

  const handleSearchChange = useCallback((search: string) => {
    listState.setSearchQuery(search);
    
    // Fetch with new search
    const params: PaginationParams = {
      page: 1, // Reset to page 1 when searching
      pageSize: listState.pageSize,
      searchQuery: search,
      sortBy: listState.sortBy,
      sortDirection: listState.sortDirection,
      filters: listState.filters,
    };
    fetchData(params);
  }, [listState, fetchData]);

  const handlePageChange = useCallback((page: number) => {
    listState.setCurrentPage(page);
    
    const params: PaginationParams = {
      page,
      pageSize: listState.pageSize,
      searchQuery: listState.searchQuery,
      sortBy: listState.sortBy,
      sortDirection: listState.sortDirection,
      filters: listState.filters,
    };
    fetchData(params);
  }, [listState, fetchData]);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    listState.setPageSize(pageSize);
    
    const params: PaginationParams = {
      page: 1, // Reset to page 1 when changing page size
      pageSize,
      searchQuery: listState.searchQuery,
      sortBy: listState.sortBy,
      sortDirection: listState.sortDirection,
      filters: listState.filters,
    };
    fetchData(params);
  }, [listState, fetchData]);

  const handleSortingChange = useCallback((sortBy: string, sortDirection: 'asc' | 'desc') => {
    listState.setSorting(sortBy, sortDirection);
    
    const params: PaginationParams = {
      page: listState.currentPage,
      pageSize: listState.pageSize,
      searchQuery: listState.searchQuery,
      sortBy,
      sortDirection,
      filters: listState.filters,
    };
    fetchData(params);
  }, [listState, fetchData]);

  const activeFiltersCount = Object.values(listState.filters).filter(Boolean).length;

  console.log('Rendering OrganizationsListContent with data:', data);

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Organizations"
        searchPlaceholder="Search organizations by name or slug"
        searchQuery={listState.searchQuery}
        onSearchChange={handleSearchChange}
        onCreateClick={handleCreateOrganization}
        createButtonText="Create Organization"
        activeFiltersCount={activeFiltersCount}
        filterComponent={
          <OrganizationFiltersForm
            currentFilters={listState.filters}
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
        data={data.data}
        currentPage={data.page}
        pageSize={data.pageSize}
        totalPages={data.totalPages}
        hasNextPage={data.hasNextPage}
        hasPreviousPage={data.hasPreviousPage}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        sortBy={listState.sortBy}
        sortDirection={listState.sortDirection}
        onSortingChange={handleSortingChange}
        loadingKey="organizations-fetch"
        emptyMessage="No organizations found. Create your first organization to get started."
      />
    </div>
  );
}