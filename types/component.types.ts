// types/component.types.ts - Component prop interfaces

import { ReactNode } from 'react';
import { ColumnDef } from "@tanstack/react-table";

// Form component base props
export interface BaseFormProps {
  mode: 'create' | 'edit';
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Member form props
export interface MemberFormProps extends BaseFormProps {
  organizationId: string;
  memberId?: string;
}

// Organization form props  
export interface OrganizationFormProps extends BaseFormProps {
  organizationId?: string;
}

// Filterable page header props
export interface FilterablePageHeaderProps {
  title: string;
  description?: string;
  createButtonText?: string;
  createHref?: string;
  onCreateNew?: () => void;
  filterConfig: FilterConfig[];
  error?: string;
  customActions?: ReactNode;
}

// Filter configuration
export interface FilterOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FilterConfig {
  label: string;
  key: string;
  type: 'text' | 'select' | 'date' | 'number' | 'boolean';
  options?: FilterOption[];
  placeholder?: string;
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: RegExp;
  };
}

// Data table props (updated from list-page.types.ts)
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
  bulkActions?: ReactNode;
}

// List page wrapper props
export interface ListPageWrapperProps {
  children?: ReactNode;
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

// Generic list item interface
export interface BaseListItem {
  id: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}