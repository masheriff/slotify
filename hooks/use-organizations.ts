// hooks/use-organizations.ts - Optimized version
import { getOrganizations, OrganizationResponse, PaginationParams } from "@/actions/organization-actions"
import { useLoadingControl } from "@/lib/with-loading"
import { FilterConfig, useListState } from "@/stores/list-state-store"
import { useCallback, useEffect, useState, useRef } from "react"
import { toast } from "sonner"

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

// Custom hook for organization data fetching with Better Auth
export function useOrganizations() {
  const listState = useListState({
    defaultPageSize: 10,
    defaultSort: { column: 'name', direction: 'asc' },
    filterConfig: organizationFilters
  })

  const { withLoadingState } = useLoadingControl()
  const [organizationData, setOrganizationData] = useState<OrganizationResponse>({
    data: [],
    page: 1,
    pageSize: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  })

  // Track if we've made an initial load to prevent duplicate calls
  const hasInitialLoad = useRef(false)
  const lastParamsRef = useRef<string>('')

  // Fetch organizations function - OPTIMIZED WITH DEDUPLICATION
  const fetchOrganizations = useCallback(async () => {
    const params: PaginationParams = {
      page: listState.currentPage,
      pageSize: listState.pageSize,
      searchQuery: listState.searchQuery,
      sortBy: listState.sortBy,
      sortDirection: listState.sortDirection,
      filters: listState.filters
    }

    // Create a key to track parameter changes
    const paramsKey = JSON.stringify(params)
    
    // Prevent duplicate calls with same parameters
    if (paramsKey === lastParamsRef.current) {
      console.log('🚫 Skipping duplicate fetch with same parameters')
      return
    }
    
    lastParamsRef.current = paramsKey
    console.log('📡 Fetching organizations with params:', params)

    try {
      const result = await withLoadingState(
        'organizations-fetch',
        () => getOrganizations(params),
        'Loading organizations...'
      )
      
      console.log('✅ Organizations fetched successfully:', {
        count: result.data.length,
        page: result.page,
        totalPages: result.totalPages
      })
      
      setOrganizationData(result)
      hasInitialLoad.current = true
    } catch (error) {
      console.error('❌ Failed to fetch organizations:', error)
      toast.error('Failed to load organizations. Please try again.')
      
      // Set empty state on error
      setOrganizationData({
        data: [],
        page: listState.currentPage,
        pageSize: listState.pageSize,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false
      })
    }
  }, [
    listState.currentPage,
    listState.pageSize,
    listState.searchQuery,
    listState.sortBy,
    listState.sortDirection,
    listState.filters,
    withLoadingState
  ])

  // Fetch data when dependencies change - DEBOUNCED
  useEffect(() => {
    // Debounce the fetch to prevent rapid-fire calls
    const timeoutId = setTimeout(() => {
      fetchOrganizations()
    }, 200) // 200ms debounce

    return () => clearTimeout(timeoutId)
  }, [fetchOrganizations])

  // Manual refresh function
  const refreshOrganizations = useCallback(() => {
    console.log('🔄 Manual refresh triggered')
    lastParamsRef.current = '' // Reset to force fetch
    fetchOrganizations()
  }, [fetchOrganizations])

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
    isLoading: hasInitialLoad.current === false
  }
}