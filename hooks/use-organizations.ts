// hooks/use-organizations.ts - FIXED VERSION
import {
  listOrganizations,
  OrganizationResponse,
  PaginationParams,
} from "@/actions/organization-actions";
import { useLoadingControl } from "@/lib/with-loading";
import { useListState } from "@/stores/list-state-store";
import { FilterConfig } from "@/types";
import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { toast } from "sonner";

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

// Custom hook for organization data fetching with Better Auth
export function useOrganizations() {
  const listState = useListState({
    defaultPageSize: 10,
    defaultSort: { column: "name", direction: "asc" },
    filterConfig: organizationFilters,
  });

  const { withLoadingState } = useLoadingControl();
  const [organizationData, setOrganizationData] =
    useState<OrganizationResponse>({
      data: [],
      page: 1,
      pageSize: 10,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });

  // Track if we've made an initial load to prevent duplicate calls
  const hasInitialLoad = useRef(false);
  const lastParamsRef = useRef<string>("");

  // FIXED: Use useMemo to create stable params object
  const params = useMemo<PaginationParams>(() => ({
    page: listState.currentPage,
    pageSize: listState.pageSize,
    searchQuery: listState.searchQuery,
    sortBy: listState.sortBy,
    sortDirection: listState.sortDirection,
    filters: listState.filters,
  }), [
    listState.currentPage,
    listState.pageSize,
    listState.searchQuery,
    listState.sortBy,
    listState.sortDirection,
    listState.filters,
  ]);

  // FIXED: Stable fetchOrganizations function that depends on stable params
  const fetchOrganizations = useCallback(async () => {
    // Create a key to track parameter changes
    const paramsKey = JSON.stringify(params);

    // Prevent duplicate calls with same parameters
    if (paramsKey === lastParamsRef.current) {
      console.log("🚫 Skipping duplicate fetch with same parameters");
      return;
    }

    lastParamsRef.current = paramsKey;
    console.log("📡 Fetching organizations with params:", params);

    try {
      const result = await withLoadingState(
        "organizations-fetch",
        () => listOrganizations(params),
        "Loading organizations..."
      );

      console.log("✅ Organizations fetched successfully:", {
        count: result.data.length,
        page: result.page,
        totalPages: result.totalPages,
      });

      setOrganizationData(result);
      hasInitialLoad.current = true;
    } catch (error) {
      console.error("❌ Failed to fetch organizations:", error);
      toast.error("Failed to load organizations. Please try again.");

      // Set empty state on error
      setOrganizationData({
        data: [],
        page: params.page,
        pageSize: params.pageSize,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    }
  }, [params, withLoadingState]); // FIXED: Only depend on stable params

  // FIXED: Use params directly instead of individual listState properties
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchOrganizations();
    }, 200); // 200ms debounce

    return () => clearTimeout(timeoutId);
  }, [fetchOrganizations]); // This is now stable

  // Manual refresh function
  const refreshOrganizations = useCallback(() => {
    console.log("🔄 Manual refresh triggered");
    lastParamsRef.current = ""; // Reset to force fetch
    fetchOrganizations();
  }, [fetchOrganizations]);

  return {
    organizations: organizationData.data,
    currentPage: organizationData.page,
    pageSize: organizationData.pageSize,
    totalPages: organizationData.totalPages,
    hasNextPage: organizationData.hasNextPage,
    hasPreviousPage: organizationData.hasPreviousPage,
    listState,
    refreshOrganizations,
    // Add loading state for better UX
    isLoading: hasInitialLoad.current === false,
  };
}