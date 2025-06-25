// lib/types/list-page.ts - Updated version without function props
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

// Component prop interfaces - UPDATED to remove function props
export interface FilterablePageHeaderProps {
  title: string;
  description?: string;
  createButtonText?: string;
  createHref?: string;
  onCreateNew?: () => void; // This is OK since it's handled by the client component itself
  filterConfig: FilterConfig[];
  error?: string;
  showExport?: boolean;
  // REMOVED: onExport?: () => void; - This was causing the Server/Client component issue
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
  logo?: string | null;
  type: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  city: string;
  state: string;
  zipCode?: string;
  isActive: boolean;
}

// User List Item interface
export interface UserListItem extends BaseListItem {
  name: string;
  email: string;
  role: string;
  organizationId?: string;
  organizationName?: string;
  isActive: boolean;
  lastLogin?: Date | string;
  emailVerified?: boolean;
}

// Patient List Item interface  
export interface PatientListItem extends BaseListItem {
  firstName: string;
  lastName: string;
  dateOfBirth: Date | string;
  gender: string;
  email?: string;
  phone: string;
  organizationId: string;
  organizationName?: string;
  isActive: boolean;
  lastVisit?: Date | string;
}

// Appointment List Item interface
export interface AppointmentListItem extends BaseListItem {
  patientId: string;
  patientName: string;
  appointmentDate: Date | string;
  appointmentTime: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  procedureType: string;
  organizationId: string;
  organizationName?: string;
  locationId?: string;
  locationName?: string;
  technicianId?: string;
  technicianName?: string;
}

// Booking List Item interface
export interface BookingListItem extends BaseListItem {
  patientId: string;
  patientName: string;
  appointmentId?: string;
  bookingDate: Date | string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  procedureType: string;
  organizationId: string;
  organizationName?: string;
  locationId?: string;
  locationName?: string;
  technicianId?: string;
  technicianName?: string;
  interpretingDoctorId?: string;
  interpretingDoctorName?: string;
  holterDeviceId?: string;
  notes?: string;
}

// Holter Assignment List Item interface
export interface HolterAssignmentListItem extends BaseListItem {
  bookingId: string;
  patientName: string;
  holterDeviceId: string;
  deviceSerialNumber: string;
  assignedDate: Date | string;
  expectedReturnDate?: Date | string;
  actualReturnDate?: Date | string;
  status: 'assigned' | 'active' | 'returned' | 'lost' | 'damaged';
  organizationId: string;
  organizationName?: string;
  technicianId?: string;
  technicianName?: string;
  notes?: string;
}

// Holter Device List Item interface
export interface HolterDeviceListItem extends BaseListItem {
  serialNumber: string;
  model: string;
  manufacturer: string;
  status: 'available' | 'assigned' | 'maintenance' | 'retired';
  organizationId: string;
  organizationName?: string;
  lastCalibrationDate?: Date | string;
  nextCalibrationDate?: Date | string;
  currentAssignmentId?: string;
  currentPatientName?: string;
  notes?: string;
}

// Interpreting Doctor List Item interface
export interface InterpretingDoctorListItem extends BaseListItem {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  licenseNumber: string;
  specialization: string;
  organizationId: string;
  organizationName?: string;
  isActive: boolean;
  totalInterpretations?: number;
  avgTurnaroundTime?: number; // in hours
}

// Referring Doctor List Item interface  
export interface ReferringDoctorListItem extends BaseListItem {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  npi?: string;
  organizationId: string;
  organizationName?: string;
  entityLocationId?: string;
  entityLocationName?: string;
  isActive: boolean;
  totalReferrals?: number;
}

// Referring Entity Location List Item interface
export interface ReferringEntityLocationListItem extends BaseListItem {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email?: string;
  organizationId: string;
  organizationName?: string;
  isActive: boolean;
  totalReferringDoctors?: number;
}

// Technician List Item interface
export interface TechnicianListItem extends BaseListItem {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  employeeId?: string;
  organizationId: string;
  organizationName?: string;
  locationId?: string;
  locationName?: string;
  isActive: boolean;
  totalBookings?: number;
  certifications?: string[];
}

// Procedure Test Location List Item interface
export interface ProcedureTestLocationListItem extends BaseListItem {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email?: string;
  organizationId: string;
  organizationName?: string;
  isActive: boolean;
  totalBookings?: number;
  availableEquipment?: string[];
  operatingHours?: string;
}

// Interpretation List Item interface
export interface InterpretationListItem extends BaseListItem {
  bookingId: string;
  patientName: string;
  interpretingDoctorId: string;
  interpretingDoctorName: string;
  status: 'pending' | 'in_progress' | 'completed' | 'reviewed';
  assignedDate: Date | string;
  completedDate?: Date | string;
  findings?: string;
  recommendations?: string;
  organizationId: string;
  organizationName?: string;
  priority: 'routine' | 'urgent' | 'stat';
  turnaroundTime?: number; // in hours
}