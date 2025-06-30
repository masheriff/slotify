// types/list-page.types.ts - CLEANED UP VERSION
import { ColumnDef } from "@tanstack/react-table";

// Base interfaces
export interface FilterOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FilterConfig {
  label: string;
  key: string;
  type: "text" | "select" | "date" | "number" | "boolean";
  options?: FilterOption[];
  placeholder?: string;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
  };
}

export interface ListParams {
  page: number;
  pageSize: number;
  searchQuery: string;
  sortBy: string;
  sortDirection: "asc" | "desc";
  filters: Record<string, string>;
}

// ✅ UNIFIED PAGINATION INTERFACE
export interface PaginationData {
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount: number;
}

export interface SortingData {
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export interface ListPageConfig {
  defaultPageSize?: number;
  defaultSort?: string;
  defaultSortDirection?: "asc" | "desc";
  maxPageSize?: number;
  allowedSortColumns?: string[];
  requiredFilters?: string[];
  searchable?: boolean;
}

// ✅ UPDATED LIST DATA RESULT WITH CONSISTENT PAGINATION
export interface ListDataResult<T> {
  success: boolean;
  data: T[];
  pagination: PaginationData;
  error?: string;
}

// ✅ UPDATED DATA TABLE PROPS WITH CONSISTENT PAGINATION
export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pagination: PaginationData;
  sorting?: SortingData;
  error?: string;
  emptyMessage?: string;
  className?: string;
  loading?: boolean;
  selectable?: boolean;
  onSelectionChange?: (selectedRows: TData[]) => void;
  bulkActions?: React.ReactNode;
}

// Component prop interfaces
export interface FilterablePageHeaderProps {
  title: string;
  description?: string;
  createButtonText?: string;
  createHref?: string;
  onCreateNew?: () => void;
  filterConfig: FilterConfig[];
  error?: string;
  customActions?: React.ReactNode;
}

export interface ListPageWrapperProps {
  children?: React.ReactNode;
  error?: string;
  loading?: boolean;
  className?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

// Base interface for all list items
export interface BaseListItem {
  id: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

// ✅ REMOVED OrganizationListItem - Use Organization directly from domain types