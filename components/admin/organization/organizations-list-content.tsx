// components/admin/organization/organizations-list-content.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ListPageHeader } from "@/components/common/list-page-header";
import { OrganizationFiltersForm } from "@/components/admin/forms/organization-filters-form";
import { DataTable } from "@/components/common/data-table";
import { organizationColumns } from "@/lib/table-configs/organization-columns";
import { toast } from "sonner";
import { useLoadingControl } from "@/lib/with-loading";
import { listOrganizations, OrganizationResponse, PaginationParams } from "@/actions/organization-actions";

// Organization filter configuration
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
    label: "Status",
    key: "status",
    type: "select" as const,
    options: [
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
      { value: "suspended", label: "Suspended" },
    ],
  },
  {
    label: "Created After",
    key: "createdAfter",
    type: "date" as const,
  },
  {
    label: "Contact Email",
    key: "contactEmail",
    type: "text" as const,
  },
];

interface OrganizationsListContentProps {
  initialData: OrganizationResponse;
  initialParams: {
    page: number;
    pageSize: number;
    searchQuery: string;
    sortBy: string;
    sortDirection: 'asc' | 'desc';
    filters: Record<string, string>;
  };
}

export function OrganizationsListContent({ 
  initialData, 
  initialParams 
}: OrganizationsListContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { withLoadingState } = useLoadingControl();
  
  // State management
  const [data, setData] = useState(initialData);
  const [currentParams, setCurrentParams] = useState(initialParams);
  
  // Update URL search parameters
  const updateURL = useCallback((newParams: Partial<typeof currentParams>) => {
    const params = new URLSearchParams(searchParams);
    
    // Update parameters
    Object.entries(newParams).forEach(([key, value]) => {
      if (key === 'filters' && typeof value === 'object') {
        // Handle filters specially
        Object.entries(value as Record<string, string>).forEach(([filterKey, filterValue]) => {
          if (filterValue) {
            params.set(filterKey, filterValue);
          } else {
            params.delete(filterKey);
          }
        });
      } else if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });
    
    // Reset page to 1 when changing filters/search/sort
    if ('searchQuery' in newParams || 'filters' in newParams || 'sortBy' in newParams || 'sortDirection' in newParams) {
      params.set('page', '1');
    }
    
    router.push(`/admin/organizations?${params.toString()}`);
  }, [router, searchParams]);

  // Fetch data function
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

  // Update data when URL changes
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const searchQuery = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortDirection = (searchParams.get('sortDirection') || 'asc') as 'asc' | 'desc';
    
    // Build filters from URL
    const filters: Record<string, string> = {};
    organizationFilters.forEach(filter => {
      const value = searchParams.get(filter.key);
      if (value) filters[filter.key] = value;
    });

    const newParams = {
      page,
      pageSize,
      searchQuery,
      sortBy,
      sortDirection,
      filters,
    };

    // Only fetch if parameters actually changed
    const paramsChanged = JSON.stringify(newParams) !== JSON.stringify(currentParams);
    if (paramsChanged) {
      setCurrentParams(newParams);
      fetchData(newParams);
    }
  }, [searchParams, fetchData, currentParams]);

  // Event handlers
  const handleCreateOrganization = () => {
    router.push('/admin/organizations/create');
  };

  const handleRefresh = () => {
    fetchData(currentParams);
    toast.success('Organizations refreshed');
  };

  const handleSearchChange = (search: string) => {
    updateURL({ searchQuery: search });
  };

  const handlePageChange = (page: number) => {
    updateURL({ page });
  };

  const handlePageSizeChange = (pageSize: number) => {
    updateURL({ pageSize });
  };

  const handleSortingChange = (sortBy: string, sortDirection: 'asc' | 'desc') => {
    updateURL({ sortBy, sortDirection });
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...currentParams.filters };
    if (value) {
      newFilters[key] = value;
    } else {
      delete newFilters[key];
    }
    updateURL({ filters: newFilters });
  };

  const handleClearAllFilters = () => {
    updateURL({ filters: {} });
  };

  const activeFiltersCount = Object.values(currentParams.filters).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <ListPageHeader
        title="Organizations"
        searchPlaceholder="Search organizations by name, email, or slug..."
        searchQuery={currentParams.searchQuery}
        onSearchChange={handleSearchChange}
        onCreateClick={handleCreateOrganization}
        createButtonText="Create Organization"
        activeFiltersCount={activeFiltersCount}
        filterComponent={
          <OrganizationFiltersForm
            currentFilters={currentParams.filters}
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
        sortBy={currentParams.sortBy}
        sortDirection={currentParams.sortDirection}
        onSortingChange={handleSortingChange}
        loadingKey="organizations-fetch"
        emptyMessage="No organizations found. Create your first organization to get started."
      />
    </div>
  );
}