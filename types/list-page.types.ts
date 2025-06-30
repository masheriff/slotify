// types/list-page.types.ts - CLEANED UP VERSION (Remove moved interfaces)

import { ReactNode } from 'react';

// List parameters for server actions
export interface ListParams {
  page: number;
  pageSize: number;
  searchQuery: string;
  sortBy: string;
  sortDirection: "asc" | "desc";
  filters: Record<string, string>;
}

// List page configuration
export interface ListPageConfig {
  defaultPageSize?: number;
  defaultSort?: string;
  defaultSortDirection?: "asc" | "desc";
  maxPageSize?: number;
  allowedSortColumns?: string[];
  requiredFilters?: string[];
  searchable?: boolean;
  exportable?: boolean;
}

// Server action response for list data
export interface ListDataResult<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    totalCount: number;
  };
  error?: string;
}