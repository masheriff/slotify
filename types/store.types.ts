export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface LoadingStore {
  loadingStates: Record<string, LoadingState>;
  setLoading: (key: string, loading: boolean, message?: string) => void;
  clearLoading: (key: string) => void;
  isLoading: (key: string) => boolean;
  getMessage: (key: string) => string | undefined;
  clearAllLoading: () => void;
}

export interface FilterConfig {
  label: string;
  key: string
  type: 'select' | 'text' | 'date'
  options?: Array<{
    value: string
    label: string
  }>
  placeholder?: string
}

export interface FiltersSheetProps {
  filters: FilterConfig[]
  triggerClassName?: string
  currentFilters: Record<string, string>
  onFilterChange: (key: string, value: string) => void
  onClearAllFilters: () => void
}

export interface ListState {
  searchQuery: string
  currentPage: number
  pageSize: number
  sortBy: string | null
  sortDirection: 'asc' | 'desc'
  filters: Record<string, string>
}

export interface ListStateStore extends ListState {
  // Actions
  setSearchQuery: (query: string) => void
  setCurrentPage: (page: number) => void
  setPageSize: (size: number) => void
  setSorting: (column: string, direction: 'asc' | 'desc') => void
  setFilters: (filters: Record<string, string>) => void
  setFilter: (key: string, value: string) => void
  resetFilters: (filterKeys: string[]) => void
  resetToDefaults: (defaults: Partial<ListState>) => void
  
  // Computed
  hasActiveFilters: (filterKeys: string[]) => boolean
  getUrlParams: () => URLSearchParams
}

export interface UseListStateProps {
  defaultPageSize?: number
  defaultSort?: { column: string; direction: 'asc' | 'desc' }
  filterConfig?: FilterConfig[]
  stateKey?: string // Optional key for multiple list states on same page
}