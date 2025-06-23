import { ColumnDef } from "@tanstack/react-table"

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  currentPage: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  sortBy?: string | null
  sortDirection?: 'asc' | 'desc'
  onSortingChange?: (column: string, direction: 'asc' | 'desc') => void
  loadingKey?: string // Key to track loading state
  emptyMessage?: string
}

export interface ListPageHeaderProps {
  title: string;
  searchPlaceholder?: string;
  onCreateClick?: () => void;
  createButtonText?: string;
  filterComponent?: React.ReactNode;
  breadcrumbItems?: Array<{
    title: string;
    href?: string;
  }>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFiltersCount?: number;
  onRefresh?: () => void;
}


