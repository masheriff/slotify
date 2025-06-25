// lib/types/list-page.types.ts - Updated version without export functionality
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

// Component prop interfaces - UPDATED to remove export functionality
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

// Organization List Item interface
export interface OrganizationListItem extends BaseListItem {
  name: string;
  slug?: string;
  logo?: string;
  description?: string;
  type: 'admin' | 'client';
  memberCount?: number;
  status: 'active' | 'inactive' | 'suspended';
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  metadata?: {
    isActive?: boolean;
    settings?: Record<string, any>;
  };
}

// User List Item interface
export interface UserListItem extends BaseListItem {
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'banned';
  emailVerified: boolean;
  lastLogin?: Date | string;
  organizationId?: string;
  organizationName?: string;
}

// Patient List Item interface
export interface PatientListItem extends BaseListItem {
  firstName: string;
  lastName: string;
  dateOfBirth: Date | string;
  gender: 'male' | 'female' | 'other';
  email?: string;
  phone?: string;
  mrn: string; // Medical Record Number
  status: 'active' | 'inactive';
  lastVisit?: Date | string;
  organizationId: string;
}

// Appointment List Item interface
export interface AppointmentListItem extends BaseListItem {
  patientId: string;
  patientName: string;
  patientMrn: string;
  procedureType: string;
  scheduledDate: Date | string;
  scheduledTime: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  referringDoctor?: string;
  location?: string;
  notes?: string;
  organizationId: string;
}

// Booking List Item interface
export interface BookingListItem extends BaseListItem {
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientMrn: string;
  procedureType: string;
  scheduledDate: Date | string;
  status: 'scheduled' | 'checked_in' | 'in_progress' | 'completed' | 'cancelled';
  technicianId?: string;
  technicianName?: string;
  deviceAssigned?: boolean;
  interpretationAssigned?: boolean;
  organizationId: string;
}

// Device List Item interface
export interface HolterDeviceListItem extends BaseListItem {
  serialNumber: string;
  model: string;
  manufacturer: string;
  status: 'available' | 'assigned' | 'in_use' | 'maintenance' | 'retired';
  lastMaintenance?: Date | string;
  nextMaintenance?: Date | string;
  currentPatientId?: string;
  currentPatientName?: string;
  organizationId: string;
}

// Doctor List Item interface
export interface DoctorListItem extends BaseListItem {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialization: string;
  licenseNumber: string;
  status: 'active' | 'inactive';
  type: 'interpreting' | 'referring';
  organizationId?: string;
}

// Technician List Item interface
export interface TechnicianListItem extends BaseListItem {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  certifications: string[];
  status: 'active' | 'inactive';
  currentAssignments: number;
  organizationId: string;
}