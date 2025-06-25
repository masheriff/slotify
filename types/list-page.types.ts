// lib/types/list-page.ts - ADD ONLY OrganizationListItem to existing file
import { ColumnDef } from "@tanstack/react-table";

// ... (keep all existing interfaces)

// Base interfaces
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

export interface ListParams {
  page: number;
  pageSize: number;
  searchQuery: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  filters: Record<string, string>;
}

export interface PaginationData {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount?: number;
}

export interface SortingData {
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface ListPageConfig {
  defaultPageSize?: number;
  defaultSort?: string;
  defaultSortDirection?: 'asc' | 'desc';
  maxPageSize?: number;
  allowedSortColumns?: string[];
  requiredFilters?: string[];
  searchable?: boolean;
  exportable?: boolean;
}

export interface ListDataResult<T> {
  success: boolean;
  data?: {
    data: T[];
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    totalCount?: number;
  };
  error?: string;
  metadata?: {
    fetchTime?: number;
    cacheHit?: boolean;
    source?: string;
  };
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
  showExport?: boolean;
  onExport?: () => void;
  customActions?: React.ReactNode;
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
  bulkActions?: React.ReactNode;
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

// ADD ONLY THIS - The missing OrganizationListItem interface
// This matches your page.tsx mapping logic exactly
export interface OrganizationListItem extends BaseListItem {
  name: string;
  slug?: string;
  logo?: string;
  type: "admin" | "client";
  contactEmail: string;
  contactPhone: string;
  city: string;
  state: string;
  isActive: boolean;
}

// Healthcare module types (keep existing)
export interface PatientListItem extends BaseListItem {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date | string;
  gender: 'male' | 'female' | 'other';
  organizationId: string;
  organizationName: string;
  isActive: boolean;
}

export interface AppointmentListItem extends BaseListItem {
  patientId: string;
  patientName: string;
  procedureType: string;
  scheduledAt: Date | string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  organizationId: string;
  organizationName: string;
  technicianId?: string;
  technicianName?: string;
}

export interface BookingListItem extends BaseListItem {
  appointmentId: string;
  patientName: string;
  procedureType: string;
  scheduledAt: Date | string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  organizationId: string;
  locationId: string;
  locationName: string;
  technicianId?: string;
  interpretingDoctorId?: string;
}

export interface UserListItem extends BaseListItem {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  organizationId: string;
  organizationName: string;
  isActive: boolean;
  lastLoginAt?: Date | string;
}

// Data fetcher function type
export type ListDataFetcher<T> = (params: ListParams) => Promise<{
  data: T[];
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount?: number;
}>;

// URL management types
export interface URLUpdateOptions {
  resetPage?: boolean;
  preserveParams?: string[];
  replace?: boolean;
}

export interface URLHelpers {
  updateURL: (params: Record<string, string | number | undefined>, options?: URLUpdateOptions) => void;
  getParam: (key: string, defaultValue?: string) => string;
  getParams: (keys: string[]) => Record<string, string>;
  hasActiveParams: (keys: string[]) => boolean;
  clearParams: (keys: string[]) => void;
  isPending: boolean;
}

// Permission types for Better Auth integration
export interface ListPagePermissions {
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canExport: boolean;
  canManageUsers?: boolean;
}