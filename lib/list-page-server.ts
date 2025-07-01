// lib/list-page-server.ts - CLEANED UP VERSION
import { User } from "@/types";
import { redirect } from "next/navigation";
import { ListDataResult, ListParams, ListPageConfig } from "@/types/list-page.types";

/**
 * Parse and validate search parameters for list pages
 */
export async function parseListParams(
  searchParams: Promise<Record<string, string | undefined>> | Record<string, string | undefined>,
  config: ListPageConfig = {}
): Promise<ListParams> {
  const {
    defaultPageSize = 10,
    defaultSort = 'createdAt',
    defaultSortDirection = 'desc',
    maxPageSize = 100,
    allowedSortColumns = [],
    requiredFilters = []
  } = config;

  // Handle both Promise and direct object
  const params = await Promise.resolve(searchParams);
  
  // Parse page with bounds checking
  const page = Math.max(1, parseInt(params.page || '1', 10));
  
  // Parse page size with bounds checking
  const pageSize = Math.min(
    maxPageSize,
    Math.max(1, parseInt(params.pageSize || defaultPageSize.toString(), 10))
  );
  
  // Parse search query
  const searchQuery = (params.search || '').trim();
  
  // Parse and validate sort parameters
  let sortBy = params.sortBy || defaultSort;
  let sortDirection = (params.sortDirection || defaultSortDirection) as 'asc' | 'desc';
  
  // Validate sort column if allowedSortColumns is specified
  if (allowedSortColumns.length > 0 && !allowedSortColumns.includes(sortBy)) {
    console.warn(`Invalid sort column: ${sortBy}, falling back to default: ${defaultSort}`);
    sortBy = defaultSort;
  }
  
  // Validate sort direction
  if (!['asc', 'desc'].includes(sortDirection)) {
    sortDirection = defaultSortDirection;
  }
  
  // Parse filters - only include non-empty values
  const filters: Record<string, string> = {};
  Object.entries(params).forEach(([key, value]) => {
    // Skip standard pagination/search/sort params
    if (['page', 'pageSize', 'search', 'sortBy', 'sortDirection'].includes(key)) {
      return;
    }
    
    if (value && value.trim()) {
      filters[key] = value.trim();
    }
  });
  
  // Validate required filters
  const missingFilters = requiredFilters.filter(filter => !filters[filter]);
  if (missingFilters.length > 0) {
    console.warn(`Missing required filters: ${missingFilters.join(', ')}`);
  }
  
  return {
    page,
    pageSize,
    searchQuery,
    sortBy,
    sortDirection,
    filters,
  };
}

/**
 * Handle list page redirects for invalid states
 */
export function handleListPageRedirect(
  pathname: string,
  params: ListParams,
  totalPages: number
): never | void {
  // Redirect if page is beyond total pages
  if (totalPages > 0 && params.page > totalPages) {
    console.log(`🔄 [${pathname}] Page ${params.page} exceeds total pages ${totalPages}, redirecting to page ${totalPages}`);
    redirect(`${pathname}?page=${totalPages}${params.pageSize !== 10 ? `&pageSize=${params.pageSize}` : ''}`);
  }
  
  // Redirect if page size is invalid
  if (params.pageSize < 1 || params.pageSize > 100) {
    console.log(`🔄 [${pathname}] Invalid page size ${params.pageSize}, redirecting to default`);
    redirect(`${pathname}?page=1&pageSize=10`);
  }
}

/**
 * Build canonical URL for list page (for SEO and caching)
 */
export function buildCanonicalListURL(
  basePath: string,
  params: ListParams,
  config: ListPageConfig = {}
): string {
  const { defaultPageSize = 10, defaultSort = 'createdAt', defaultSortDirection = 'desc' } = config;
  
  const searchParams = new URLSearchParams();
  
  // Only add non-default parameters to keep URLs clean
  if (params.page > 1) {
    searchParams.set('page', params.page.toString());
  }
  
  if (params.pageSize !== defaultPageSize) {
    searchParams.set('pageSize', params.pageSize.toString());
  }
  
  if (params.searchQuery) {
    searchParams.set('search', params.searchQuery);
  }
  
  if (params.sortBy !== defaultSort) {
    searchParams.set('sortBy', params.sortBy);
  }
  
  if (params.sortDirection !== defaultSortDirection) {
    searchParams.set('sortDirection', params.sortDirection);
  }
  
  // Add filters
  Object.entries(params.filters).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

/**
 * Create empty list result for error states
 */
export function createEmptyListResult<T>(params: ListParams): ListDataResult<T> {
  return {
    success: true,
    data: [],
    pagination: {
      page: params.page,
      pageSize: params.pageSize,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      totalCount: 0
    },
  };
}

/**
 * Validate list page permissions (to be used with Better Auth)
 */
export async function validateListPageAccess(
  user?: User
): Promise<{ success: boolean; error?: string }> {
  if (!user) {
    return {
      success: false,
      error: "Authentication required",
    };
  }

  // Add your role-based access logic here
  // For now, allowing all authenticated users
  return {
    success: true,
  };
}

/**
 * Log list page metrics for monitoring and debugging
 */
export function logListPageMetrics<T>(
  module: string,
  params: ListParams,
  result: ListDataResult<T>,
  renderTime?: number
): void {
  console.log(`📊 [${module}] List page metrics:`, {
    page: params.page,
    pageSize: params.pageSize,
    searchQuery: params.searchQuery,
    sortBy: params.sortBy,
    sortDirection: params.sortDirection,
    filters: params.filters,
    success: result.success,
    dataCount: result.data?.length || 0,
    totalCount: result.pagination?.totalCount || 0,
    totalPages: result.pagination?.totalPages || 0,
    renderTime: renderTime ? `${renderTime}ms` : undefined,
    timestamp: new Date().toISOString(),
  });
}