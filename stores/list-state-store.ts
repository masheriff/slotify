// stores/list-state-store.ts
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useEffect, useCallback } from 'react'

export interface FilterConfig {
  key: string
  type: 'select' | 'text' | 'date'
  options?: Array<{
    value: string
    label: string
  }>
}

interface ListState {
  searchQuery: string
  currentPage: number
  pageSize: number
  sortBy: string | null
  sortDirection: 'asc' | 'desc'
  filters: Record<string, string>
}

interface ListStateStore extends ListState {
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

// Create the store
const useListStateStore = create<ListStateStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    searchQuery: '',
    currentPage: 1,
    pageSize: 10,
    sortBy: null,
    sortDirection: 'asc',
    filters: {},

    // Actions
    setSearchQuery: (query: string) => 
      set({ searchQuery: query, currentPage: 1 }),

    setCurrentPage: (page: number) => 
      set({ currentPage: page }),

    setPageSize: (size: number) => 
      set({ pageSize: size, currentPage: 1 }),

    setSorting: (column: string, direction: 'asc' | 'desc') => {
      if (column) {
        set({ sortBy: column, sortDirection: direction })
      } else {
        set({ sortBy: null, sortDirection: 'asc' })
      }
    },

    setFilters: (filters: Record<string, string>) => 
      set({ filters, currentPage: 1 }),

    setFilter: (key: string, value: string) => {
      const currentFilters = get().filters
      const newFilters = { ...currentFilters }
      
      if (value.trim()) {
        newFilters[key] = value.trim()
      } else {
        delete newFilters[key]
      }
      
      set({ filters: newFilters, currentPage: 1 })
    },

    resetFilters: (filterKeys: string[]) => {
      const currentFilters = get().filters
      const newFilters = { ...currentFilters }
      
      filterKeys.forEach(key => {
        delete newFilters[key]
      })
      
      set({ filters: newFilters, currentPage: 1 })
    },

    resetToDefaults: (defaults: Partial<ListState>) => 
      set({ 
        searchQuery: '',
        currentPage: 1,
        pageSize: 10,
        sortBy: null,
        sortDirection: 'asc',
        filters: {},
        ...defaults 
      }),

    // Computed
    hasActiveFilters: (filterKeys: string[]) => {
      const filters = get().filters
      return filterKeys.some(key => filters[key]?.trim())
    },

    getUrlParams: () => {
      const state = get()
      const params = new URLSearchParams()
      
      if (state.searchQuery.trim()) {
        params.set('search', state.searchQuery.trim())
      }
      
      if (state.currentPage > 1) {
        params.set('page', state.currentPage.toString())
      }
      
      if (state.pageSize !== 10) {
        params.set('pageSize', state.pageSize.toString())
      }
      
      if (state.sortBy) {
        params.set('sortBy', state.sortBy)
      }
      
      if (state.sortDirection !== 'asc') {
        params.set('sortDirection', state.sortDirection)
      }
      
      Object.entries(state.filters).forEach(([key, value]) => {
        if (value.trim()) {
          params.set(key, value.trim())
        }
      })
      
      return params
    }
  }))
)

// Hook for list state management with URL sync
interface UseListStateProps {
  defaultPageSize?: number
  defaultSort?: { column: string; direction: 'asc' | 'desc' }
  filterConfig?: FilterConfig[]
  stateKey?: string // Optional key for multiple list states on same page
}

export function useListState({
  defaultPageSize = 10,
  defaultSort,
  filterConfig = [],
  stateKey = 'default'
}: UseListStateProps = {}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  const store = useListStateStore()
  
  // Initialize state from URL on mount
  useEffect(() => {
    const urlSearchQuery = searchParams.get('search') || ''
    const urlCurrentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const urlPageSize = parseInt(searchParams.get('pageSize') || defaultPageSize.toString(), 10)
    const urlSortBy = searchParams.get('sortBy') || defaultSort?.column || null
    const urlSortDirection = (searchParams.get('sortDirection') as 'asc' | 'desc') || defaultSort?.direction || 'asc'
    
    // Extract filters from URL
    const urlFilters: Record<string, string> = {}
    filterConfig.forEach(filter => {
      const value = searchParams.get(filter.key)
      if (value) {
        urlFilters[filter.key] = value
      }
    })
    
    // Set initial state from URL
    store.resetToDefaults({
      searchQuery: urlSearchQuery,
      currentPage: urlCurrentPage,
      pageSize: urlPageSize,
      sortBy: urlSortBy,
      sortDirection: urlSortDirection,
      filters: urlFilters
    })
  }, []) // Only run on mount
  
  // Sync URL when store state changes
  useEffect(() => {
    const params = store.getUrlParams()
    const newUrl = `${pathname}?${params.toString()}`
    
    // Only update URL if it's different
    if (newUrl !== `${pathname}?${searchParams.toString()}`) {
      router.push(newUrl)
    }
  }, [
    store.searchQuery,
    store.currentPage,
    store.pageSize,
    store.sortBy,
    store.sortDirection,
    store.filters,
    router,
    pathname
  ])
  
  // Enhanced setters that respect filter config
  const setFilter = useCallback((key: string, value: string) => {
    store.setFilter(key, value)
  }, [store])
  
  const resetFilters = useCallback(() => {
    const filterKeys = filterConfig.map(f => f.key)
    store.resetFilters(filterKeys)
  }, [store, filterConfig])
  
  const hasActiveFilters = useCallback(() => {
    const filterKeys = filterConfig.map(f => f.key)
    return store.hasActiveFilters(filterKeys)
  }, [store, filterConfig])
  
  return {
    // Current state
    searchQuery: store.searchQuery,
    currentPage: store.currentPage,
    pageSize: store.pageSize,
    sortBy: store.sortBy,
    sortDirection: store.sortDirection,
    filters: store.filters,
    
    // State setters
    setSearchQuery: store.setSearchQuery,
    setCurrentPage: store.setCurrentPage,
    setPageSize: store.setPageSize,
    setSorting: store.setSorting,
    setFilters: store.setFilters,
    setFilter,
    resetFilters,
    
    // Computed
    hasActiveFilters: hasActiveFilters(),
    urlSearchParams: store.getUrlParams()
  }
}

export default useListStateStore