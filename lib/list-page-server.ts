// lib/list-page-server.ts - FIXED: Remove double wrapping
import { User } from "@/types";
import { redirect } from "next/navigation";

export interface ListParams {
  page: number;
  pageSize: number;
  searchQuery: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  filters: Record<string, string>;
}

export interface ListDataResult<T> {
  success: boolean;
  data?: {
    totalCount: number | undefined;
    data: T[];
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  error?: string;
}

export interface ListPageConfig {
  defaultPageSize?: number;
  defaultSort?: string;
  defaultSortDirection?: 'asc' | 'desc';
  maxPageSize?: number;
  allowedSortColumns?: string[];
  requiredFilters?: string[];
}

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
 * Fetch list data with error handling and logging
 * FIXED: Don't double-wrap the data - return the action result directly
 */
export async function fetchListData<T>(
  dataFetcher: (params: ListParams) => Promise<unknown>,
  params: ListParams,
  context: { module: string; user?: User } = { module: 'unknown' }
): Promise<ListDataResult<T>> {
  const startTime = Date.now();
  
  console.log(`🚀 [${context.module}] Server fetching data with params:`, {
    page: params.page,
    pageSize: params.pageSize,
    searchQuery: params.searchQuery,
    sortBy: params.sortBy,
    sortDirection: params.sortDirection,
    filters: params.filters,
    timestamp: new Date().toISOString(),
  });

  try {
    const result = await dataFetcher(params) as ListDataResult<T>;
    
    const duration = Date.now() - startTime;
    console.log(`✅ [${context.module}] Server fetch successful:`, {
      count: result.data?.data?.length || 0,
      page: result.data?.page,
      totalPages: result.data?.totalPages,
      duration: `${duration}ms`,
    });

    // FIXED: Return the action result directly without wrapping
    // The action already returns { success: boolean, data?: {...}, error?: string }
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ [${context.module}] Server fetch failed:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: `${duration}ms`,
      params,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch data',
    };
  }
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
    data: {
      data: [],
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
  // This would integrate with your Better Auth permission system
  try {
    // Example: Check if user has permission to access this module
    // const hasPermission = await auth.api.hasPermission({
    //   body: { resource: module, action },
    //   headers: await headers()
    // });
    
    // Placeholder implementation
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }
    
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Permission check failed' 
    };
  }
}

/**
 * Log list page performance metrics
 */
export function logListPageMetrics(
  module: string,
  params: ListParams,
  result: ListDataResult<unknown>,
  renderTime: number
) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 [${module}] Page Metrics:`, {
      module,
      params: {
        page: params.page,
        pageSize: params.pageSize,
        hasSearch: !!params.searchQuery,
        hasFilters: Object.keys(params.filters).length > 0,
      },
      result: {
        success: result.success,
        dataCount: result.data?.data?.length || 0,
        totalPages: result.data?.totalPages || 0,
      },
      performance: {
        renderTime: `${renderTime}ms`,
        timestamp: new Date().toISOString(),
      },
    });
  }
}